import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/FinancialLedgerPanel-DYq0Kv-Z.js', import.meta.url), 'utf8');
const start = source.indexOf('async function S(e)');
const end = source.indexOf('function T(e)', start);
assert.ok(start >= 0 && end > start, 'ledger loader exists');
let urls = [];
const context = vm.createContext({
  URLSearchParams,
  sessionStorage: { getItem: () => '1', setItem: () => {} },
  fetch: async url => {
    urls.push(url);
    await new Promise(resolve => setTimeout(resolve, 5));
    return { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ lines: [{row_id: 1}] }) };
  }
});
vm.runInContext('const x="/";' + source.slice(start, end), context);
const [first, second] = await Promise.all([
  context.w('journal?year=1404&sanad=23', 'data/ledger/journal-1404.json'),
  context.w('journal?year=1404&sanad=23', 'data/ledger/journal-1404.json')
]);
assert.equal(first.lines[0].row_id, 1);
assert.equal(second.lines[0].row_id, 1);
assert.deepEqual(urls, ['/admin-security.php?action=journal&year=1404&sanad=23']);
await context.w('journal?year=1404&sanad=24', 'data/ledger/journal-1404.json');
assert.match(urls[1], /sanad=24/);
console.log('ledger loading tests passed');
