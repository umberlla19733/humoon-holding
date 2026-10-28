import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../assets/store-9cctwGcq.js',import.meta.url),'utf8');
const section=source.slice(source.indexOf('function hamunLocalDivision'),source.indexOf('function Yu('));
const make=(values)=>{
 const context=vm.createContext({localStorage:{getItem:k=>values[k]??null},gu:'acc',hu:{bearings:'bearing'}});
 vm.runInContext(section,context);return context;
};
assert.equal(make({}).hamunLocalAccounting(),false);
assert.equal(make({acc:'{'}).hamunLocalAccounting(),false);
assert.equal(make({acc:JSON.stringify({invoices:[],customers:[],kardex:[]})}).hamunLocalAccounting(),true);
assert.equal(make({bearing:JSON.stringify({products:[],messages:[]})}).hamunLocalDivision('bearings'),true);
assert.equal(make({bearing:JSON.stringify({products:[]})}).hamunLocalDivision('bearings'),false);
assert.match(source,/function Zu\(\)\{if\(hamunLocalAccounting\(\)\)return Promise\.resolve\(\)/);
assert.match(source,/function ed\(\)\{if\(hamunLocalAccounting\(\)\)return Promise\.resolve\(\)/);
assert.match(source,/function Ku\(e\)\{if\(window\.location\.hash\.startsWith\(`\#\/admin`\)&&hamunLocalDivision\(e\)\)return Promise\.resolve\(\)/);
console.log('central storage local preservation tests passed');
