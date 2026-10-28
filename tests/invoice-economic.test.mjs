import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {DEFAULT_ECONOMIC_NUMBER,normalizeEconomicNumber,defaultEconomicNumber,invoiceEconomicNumber,readEconomicDefault,saveEconomicDefault} from '../assets/invoice-economic.js';

test('economic identifiers preserve digits, zeroes, and validate safely',()=>{
 assert.equal(DEFAULT_ECONOMIC_NUMBER,'36705261100001');
 assert.equal(normalizeEconomicNumber(' ۰۰۱۲۳۴۵۶۷۸۹ '),'00123456789');
 assert.equal(normalizeEconomicNumber('٣٦٧٠٥٢٦١١٠٠٠٠١'),'36705261100001');
 assert.equal(normalizeEconomicNumber('12<script>'),null);
 assert.equal(normalizeEconomicNumber('1'.repeat(21)),null);
 assert.equal(normalizeEconomicNumber(''), '');
 assert.equal(defaultEconomicNumber(undefined),DEFAULT_ECONOMIC_NUMBER);
 assert.equal(defaultEconomicNumber('۰۰۱۲'),'0012');
 assert.equal(defaultEconomicNumber(''),'');
 assert.equal(invoiceEconomicNumber({}),'');
 assert.equal(invoiceEconomicNumber({sellerEconomicNumber:'<img onerror=x>'}),'');
});

test('invoice creation and editing preserve the invoice identifier independently',async()=>{
 const src=await readFile(new URL('../assets/store-9cctwGcq.js',import.meta.url),'utf8');
 const code=src.slice(src.indexOf('function Pd(e)'),src.indexOf('function Id(e)',src.indexOf('function Pd(e)')));
 const ctx=vm.createContext({
  Y:{invoices:[],kardex:[],treasury:[],lastPrices:{},nextInvoiceSeq:1},J:{},
  Nd:()=>({ok:true}),yd:e=>({id:'customer',name:e.name,phone:e.phone}),K:()=>'invoice',
  Q:e=>{ctx.Y=e},Z:()=>{},Date,Math,Number,String,
 });
 vm.runInContext(code,ctx);
 const input={type:'proforma',items:[{isCustom:true,qty:1,unitPrice:10}],customerName:'مشتری',customerPhone:'-',paidAmount:0,operator:'حسابدار',sellerEconomicNumber:'001234'};
 const created=ctx.Pd(input);assert.equal(created.invoice.sellerEconomicNumber,'001234');
 const edited=ctx.Fd('invoice',{...input,sellerEconomicNumber:'987654'});assert.equal(edited.invoice.sellerEconomicNumber,'987654');
 const preserved=ctx.Fd('invoice',{...input,sellerEconomicNumber:undefined});assert.equal(preserved.invoice.sellerEconomicNumber,'987654');
});

test('default setting is local and reports write failures without touching accounting data',()=>{
 const saved={};const storage={getItem:k=>saved[k]??null,setItem:(k,v)=>{saved[k]=v}};
 assert.equal(readEconomicDefault(storage),DEFAULT_ECONOMIC_NUMBER);
 assert.equal(saveEconomicDefault('۰۰۱۲',storage),true);
 assert.equal(readEconomicDefault(storage),'0012');
 assert.equal(saveEconomicDefault('<html>',storage),false);
 assert.deepEqual(Object.keys(saved),['hamun.invoice.seller-economic.v1']);
 assert.equal(saveEconomicDefault('23',{setItem:()=>{throw Error('quota')}}),false);
});

test('form, draft, preview and downloaded HTML refer to per-invoice value',async()=>{
 const src=await readFile(new URL('../assets/AccountingPanel-CQf-TkFh.js',import.meta.url),'utf8');
 assert.match(src,/sellerEconomicNumber:normalizeEconomicNumber\(hamunSellerEconomic\)/);
 assert.match(src,/sellerEconomicNumber:hamunSellerEconomic,custAddress/);
 assert.match(src,/hamunSetSellerEconomic\(e\.sellerEconomicNumber\?\?``\)/);
 assert.match(src,/\$\{invoiceEconomicNumber\(e\)\|\|`—`\}/);
 assert.match(src,/children:invoiceEconomicNumber\(e\)\|\|`—`/);
 assert.match(src,/saveEconomicDefault\(e\)/);
});

test('downloaded invoice includes the saved value and does not invent it for old invoices',async()=>{
 const src=await readFile(new URL('../assets/AccountingPanel-CQf-TkFh.js',import.meta.url),'utf8');
 const start=src.indexOf('function mt(e)'),end=src.indexOf('function ht(',start);
 let blob;
 const ctx=vm.createContext({invoiceEconomicNumber,Blob,
  URL:{createObjectURL:b=>{blob=b;return 'blob:test'},revokeObjectURL:()=>{}},
  document:{createElement:()=>({click:()=>{},remove:()=>{}}),body:{appendChild:()=>{},removeChild:()=>{}}},
  O:{sale:'فروش'},k:{cash:'نقدی'},p:()=>({short:'test'}),i:String,a:String,s:String,n:String,Math});
 vm.runInContext(src.slice(start,end),ctx);
 const invoice={type:'sale',number:'F-1',createdAt:1,customerName:'طرف حساب',customerPhone:'-',items:[],paidAmount:0,grandTotal:0,discountTotal:0,taxPercent:0,taxAmount:0,subtotal:0,paymentMethod:'cash',sellerEconomicNumber:'۰۰۱۲۳'};
 ctx.mt(invoice);let text=await blob.text();assert.match(text,/شماره اقتصادی مجموعه:<\/strong> <span dir="ltr">00123<\/span>/);
 delete invoice.sellerEconomicNumber;ctx.mt(invoice);text=await blob.text();assert.match(text,/شماره اقتصادی مجموعه:<\/strong> <span dir="ltr">—<\/span>/);
 invoice.sellerEconomicNumber='<script>alert(1)</script>';ctx.mt(invoice);text=await blob.text();assert.doesNotMatch(text,/<script>alert\(1\)<\/script>/);
});
