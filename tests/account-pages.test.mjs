import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=async p=>(await readFile(new URL(p,root))).toString();
test('password visibility is reversible and does not submit or access network',async()=>{
 const input={type:'password',insertAdjacentElement(pos,button){assert.equal(pos,'afterend');this.button=button;}};
 const document={querySelectorAll(){return [input];},createElement(type){assert.equal(type,'button');return {setAttribute(k,v){this[k]=v},addEventListener(k,fn){assert.equal(k,'click');this.click=fn}};}};
 vm.runInNewContext(await read('assets/account-pages.js'),{document});
 assert.equal(input.button.type,'button');assert.equal(input.button['aria-pressed'],'false');
 input.button.click();assert.equal(input.type,'text');assert.equal(input.button['aria-pressed'],'true');
 input.button.click();assert.equal(input.type,'password');assert.equal(input.button['aria-pressed'],'false');
});
test('simple forms, optional SMS and owner marker are wired server-side',async()=>{
 for(const name of ['accounts.php','change-password.php','admin-security.php','owner-login.php','accountant-login.php','accountant-password.php','admin-setup.php']){
  const text=await read(name);assert.match(text,/account-pages\.css\?v=1/);assert.match(text,/account-pages\.js\?v=1/);
 }
 const account=await read('accounts.php');
 assert.match(account,/id="quick-create"/);assert.match(account,/name="repeat_password"/);
 assert.match(account,/تنظیمات پیامک \(اختیاری\)/);assert.match(account,/name="initial_password"/);
 assert.match(account,/\$smsConsent && \$smsPhone === ''/);assert.match(account,/if \(\$user\['role'\] !== 'admin'\)/);
 const owner=await read('owner-login.php');assert.match(owner,/'owner_id_login'=>true/);
 const password=await read('change-password.php');assert.match(password,/\$_SESSION\['owner_id_login'\]/);
 assert.match(password,/hamun_set_owner_session_password/);assert.match(password,/hamun_change_own_password/);
 assert.match(password,/hash_equals\(\$_SESSION\['csrf'\]/);
 const css=await read('assets/account-pages.css');assert.match(css,/Vazirmatn-Variable\.woff2/);assert.match(css,/@media\(max-width:600px\)/);
});
