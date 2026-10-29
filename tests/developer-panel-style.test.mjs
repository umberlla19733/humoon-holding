import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root));

test('developer panel uses locally packaged site fonts and their licenses', async () => {
  const page = (await read('admin-center.php')).toString();
  const main = await read('assets/fonts/Vazirmatn-Variable.woff2');
  const tech = await read('assets/fonts/SpaceGrotesk-Variable.ttf');
  assert.equal(main.subarray(0, 4).toString('ascii'), 'wOF2');
  assert.equal(tech.subarray(0, 4).toString('hex'), '00010000');
  assert.match(page, /font:15px\/1\.9 Vazirmatn,Tahoma,sans-serif/);
  assert.match(page, /font-family:'Space Grotesk',Vazirmatn,Tahoma,sans-serif/);
  assert.match(page, /\/assets\/fonts\/Vazirmatn-Variable\.woff2/);
  assert.match(page, /\/assets\/fonts\/SpaceGrotesk-Variable\.ttf/);
  for (const file of ['OFL-Vazirmatn.txt', 'OFL-SpaceGrotesk.txt']) {
    assert.match((await read(`assets/fonts/${file}`)).toString(), /SIL OPEN FONT LICENSE/);
  }
  const htaccess = (await read('.htaccess')).toString();
  assert.match(htaccess, /AddType font\/woff2 \.woff2/);
  assert.match(htaccess, /AddType font\/ttf \.ttf/);
});

test('responsive developer panel keeps usable mobile controls and authorization', async () => {
  const page = (await read('admin-center.php')).toString();
  assert.match(page, /name="viewport" content="width=device-width,initial-scale=1"/);
  assert.match(page, /@media\(max-width:760px\)/);
  assert.match(page, /@media\(max-width:360px\)/);
  assert.match(page, /\.actions\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(page, /\.card,\.card\.wide\{grid-column:1\/-1/);
  assert.match(page, /\.action button\{width:100%\}/);
  assert.match(page, /button\{min-height:44px/);
  assert.match(page, /if \(!\$developer\) \{http_response_code\(403\)/);
  assert.match(page, /hash_equals\(\$_SESSION\['csrf'\]/);
});
