import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source = await readFile(new URL('../assets/contact-client.js', import.meta.url), 'utf8');
const {submitContact,trackContact} = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let captured;
globalThis.fetch = async (url, options) => {
  captured = {url, ...options, body: JSON.parse(options.body)};
  return {ok:true, headers:{get:()=> 'application/json'}, json:async()=>({inquiry:{trackingCode:'HM-'+'A'.repeat(32)}})};
};
const message = await submitContact('packing',{name:'test',phone:'09123456789',subject:'part',body:'test'});
assert.equal(message.trackingCode,'HM-'+'A'.repeat(32));
assert.equal(captured.url,'/contact.php'); assert.equal(captured.body.division,'packing'); assert.equal(captured.body.action,'submit');
await trackContact(message.trackingCode); assert.equal(captured.body.action,'track'); assert.equal(captured.body.code,message.trackingCode);
globalThis.fetch = async()=>({ok:false,headers:{get:()=> 'application/json'}});
await assert.rejects(()=>submitContact('packing',{}));
console.log('contact client tests passed');
