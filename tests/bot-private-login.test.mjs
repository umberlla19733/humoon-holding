import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeBotIdentity,prepareBotPrivateLogin} from '../assets/bot-private-login.js';
test('identity accepts exactly 10 digits in Persian, Arabic, or ASCII',()=>{
 assert.equal(normalizeBotIdentity(' ۰۱۲۳۴۵۶۷۸۹ '),'0123456789');
 assert.equal(normalizeBotIdentity('٠١٢٣٤٥٦٧٨٩'),'0123456789');
 assert.equal(normalizeBotIdentity('0123456789'),'0123456789');
 assert.equal(normalizeBotIdentity('کد 0123456789'),null);
 assert.equal(normalizeBotIdentity('012345678'),null);
 assert.equal(normalizeBotIdentity(null),null);
});
test('identity is not placed in URL and is posted only after same-origin CSRF token',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({csrf:'csrf-value'})};};
 assert.equal(await prepareBotPrivateLogin('۰۱۲۳۴۵۶۷۸۹',{fetcher}),true);
 assert.equal(calls.length,2);
 assert.ok(calls.every(c=>!c.url.includes('0123456789')));
 assert.equal(calls[1].options.method,'POST');
 assert.equal(calls[1].options.headers['X-CSRF-Token'],'csrf-value');
 assert.deepEqual(JSON.parse(calls[1].options.body),{nationalId:'0123456789'});
 assert.ok(calls.every(c=>c.options.credentials==='same-origin'));
});
test('invalid or failed requests never become a successful login',async()=>{
 let calls=0;
 await assert.rejects(()=>prepareBotPrivateLogin('not-valid',{fetcher:async()=>{calls++}}));
 assert.equal(calls,0);
 await assert.rejects(()=>prepareBotPrivateLogin('0123456789',{fetcher:async()=>({ok:false})}));
});
test('bot identity is not printed or saved as chat text and server gate remains required',async()=>{
 const main=await readFile(new URL('../assets/index-D7AjnQ7W.js',import.meta.url),'utf8');
 const admin=await readFile(new URL('../assets/AdminApp--kXxpmTx.js',import.meta.url),'utf8');
 const gate=await readFile(new URL('../admin-security.php',import.meta.url),'utf8');
 assert.match(main,/personalId:hamunId/);
 assert.match(main,/role:`user`,text:`درخواست شماره ده‌رقمی`/);
 assert.match(main,/hamunPrepareBotPrivateLogin\(e\.personalId\)/);
 assert.match(main,/__hamunServerDeveloper=e\.authenticated===true&&e\.role===`admin`&&e\.developerAccess===true/);
 assert.match(admin,/window\.__hamunServerDeveloper===true\?`master`/);
 assert.match(gate,/hamun_find_bot_developer\(\$users,\$loginDigest\)/);
 assert.match(gate,/password_verify/);
 assert.match(gate,/HTTP_X_CSRF_TOKEN/);
 assert.match(gate,/\$isAdmin && !empty\(\$currentUser\['developer_access'\]\)/);
 assert.match(gate,/\$_SESSION\['bot_identity_digest'\]=\$digest/);
 assert.match(gate,/!empty\(\$account\['enabled'\]\)/);
 const accounts=await readFile(new URL('../accounts.php',import.meta.url),'utf8');
 assert.match(accounts,/\$developerAccess && \$role!=='admin'/);
 assert.match(accounts,/name="developer_access"/);
 assert.match(accounts,/\$u\['version'\] = \(int\)\$u\['version'\] \+ 1/);
});
