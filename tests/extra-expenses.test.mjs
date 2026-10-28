import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const src = await readFile(new URL('../assets/extra-expense-utils.js', import.meta.url), 'utf8');
const {parseExpenseAmount, extraExpenseRecords} = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
assert.equal(parseExpenseAmount('۱٬۲۳۴٬۵۶۷'),1234567);
assert.equal(parseExpenseAmount('١٢٣'),123);
assert.equal(parseExpenseAmount('0'),null);
assert.equal(parseExpenseAmount('-20'),null);
assert.equal(parseExpenseAmount('1.5'),null);
assert.equal(parseExpenseAmount('9007199254740992'),null);
assert.equal(extraExpenseRecords([{type:'outflow',category:'extra_expense'}, {type:'inflow',category:'extra_expense'},{type:'outflow',category:'other'}]).length,1);
const store = await readFile(new URL('../assets/store-9cctwGcq.js',import.meta.url),'utf8');
const qu = store.slice(store.indexOf('function Qu(){'),store.indexOf('async function $u(){'));
const td = store.slice(store.indexOf('function td(){'),store.indexOf('function nd(){'));
assert.ok(qu.startsWith('function Qu()') && td.startsWith('function td()'));
const make = (local) => {
 const ctx = vm.createContext({window:{}, Pu:false,Iu:false,Y:{},Bu:{},Lu:null,treasuryCalls:0,coreCalls:0,
   yu:()=>local, hamunLocalAccounting:()=>local.exists ?? ((local.invoices?.length||0)>0 || (local.treasury?.length||0)>0), Zu:()=>{ctx.coreCalls++}, ed:()=>{ctx.treasuryCalls++}});
 vm.runInContext(qu+td,ctx); return ctx;
};
const saved=make({invoices:[],treasury:[{id:'local'}]}); saved.td();
assert.equal(saved.Y.treasury[0].id,'local'); assert.equal(saved.treasuryCalls,0);
const fresh=make({invoices:[],treasury:[]}); fresh.td(); fresh.td();
assert.equal(fresh.treasuryCalls,1);
const emptySaved=make({exists:true,invoices:[],treasury:[]}); emptySaved.td();
assert.equal(emptySaved.treasuryCalls,0); assert.equal(emptySaved.coreCalls,0);
console.log('extra expense tests passed');
