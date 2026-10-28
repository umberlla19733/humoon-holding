import {a as interop} from './rolldown-runtime-BWaJ3C7D.js';
import {l as reactModule, c as jsxModule} from './fa-Ckt9yYap.js';
import {parseExpenseAmount, extraExpenseRecords} from './extra-expense-utils.js';
import {hamunTreasuryReady} from './store-9cctwGcq.js';
const React = interop(reactModule(), 1), jsx = jsxModule();
const field = 'w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm text-steel outline-none focus:border-ember';
const btn = 'rounded-xl bg-ember px-4 py-2.5 text-xs font-black text-ink hover:bg-ember-2';
export default function ExtraExpenses({treasury, addExpense, deleteExpense, operator, toast}) {
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState('transfer');
  const [reference, setReference] = React.useState('');
  const [note, setNote] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [limit, setLimit] = React.useState(25);
  const [error, setError] = React.useState('');
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => { let active=true; hamunTreasuryReady().then(()=>{if(active)setReady(true)}).catch(()=>{if(active)setError('بارگذاری خزانه ناموفق بود؛ صفحه را تازه کنید.')}); return ()=>{active=false}; }, []);
  const rows = React.useMemo(() => extraExpenseRecords(treasury).slice().sort((a,b) => (b.at||0)-(a.at||0)), [treasury]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter(x => [x.partyName,x.reference,x.note].some(v => String(v||'').toLowerCase().includes(q))) : rows;
  }, [rows, query]);
  const total = rows.reduce((sum, row) => sum + (Number(row.amount)||0), 0);
  const submit = event => {
    event.preventDefault();
    if (!ready) return;
    const value = parseExpenseAmount(amount);
    if (!title.trim() || !value) { setError('عنوان و مبلغ معتبر به تومان را وارد کنید.'); return; }
    addExpense({type:'outflow', category:'extra_expense', amount:value, method, partyName:title.trim(), reference:reference.trim()||undefined, note:note.trim()||undefined, operator});
    setTitle(''); setAmount(''); setReference(''); setNote(''); setError('');
    toast('هزینه اضافه در خزانه ثبت شد.');
  };
  return jsx.jsxs('div',{className:'flex flex-col gap-4',children:[
    jsx.jsxs('div',{className:'rounded-2xl border border-line bg-ink-2 p-5',children:[
      jsx.jsx('h2',{className:'text-base font-black text-steel',children:'هزینه‌های اضافه'}),
      jsx.jsx('p',{className:'mt-2 text-xs leading-6 text-mist',children:'هزینه‌های متفرقه را اینجا ثبت کنید. هر مورد یک پرداخت خروجی در خزانه است و در جمع خروجی خزانه محاسبه می‌شود.'}),
      jsx.jsx('p',{className:'mt-1 text-xs leading-6 text-amber-300',children:'در نسخه فعلی اطلاعات حسابداری در مرورگر همین دستگاه ذخیره می‌شوند؛ برای جلوگیری از از دست رفتن اطلاعات پشتیبان تهیه کنید.'}),
      jsx.jsxs('p',{className:'mt-3 text-sm font-bold text-ember',children:['جمع هزینه‌های اضافه: ',total.toLocaleString('fa-IR'),' تومان · ',rows.length.toLocaleString('fa-IR'),' مورد']})]}),
    jsx.jsxs('form',{onSubmit:submit,className:'grid gap-3 rounded-2xl border border-line bg-ink-2 p-5 sm:grid-cols-2',children:[
      jsx.jsxs('label',{className:'text-xs font-bold text-mist',children:['عنوان هزینه *',jsx.jsx('input',{className:field,required:true,maxLength:150,value:title,onChange:e=>setTitle(e.target.value),placeholder:'مثلاً هزینه حمل اضافی'})]}),
      jsx.jsxs('label',{className:'text-xs font-bold text-mist',children:['مبلغ به تومان *',jsx.jsx('input',{className:field,required:true,inputMode:'numeric',value:amount,onChange:e=>setAmount(e.target.value),placeholder:'مثلاً ۱۵۰۰۰۰'})]}),
      jsx.jsxs('label',{className:'text-xs font-bold text-mist',children:['روش پرداخت',jsx.jsxs('select',{className:field,value:method,onChange:e=>setMethod(e.target.value),children:[jsx.jsx('option',{value:'transfer',children:'واریز بانکی'}),jsx.jsx('option',{value:'cash',children:'نقدی'}),jsx.jsx('option',{value:'pos',children:'کارتخوان'}),jsx.jsx('option',{value:'check',children:'چک'})]})]}),
      jsx.jsxs('label',{className:'text-xs font-bold text-mist',children:['شماره رسید یا مرجع (اختیاری)',jsx.jsx('input',{className:field,maxLength:120,value:reference,onChange:e=>setReference(e.target.value)})]}),
      jsx.jsxs('label',{className:'text-xs font-bold text-mist sm:col-span-2',children:['توضیحات (اختیاری)',jsx.jsx('textarea',{className:field,rows:2,maxLength:1000,value:note,onChange:e=>setNote(e.target.value)})]}),
      error&&jsx.jsx('p',{className:'text-xs text-red-400 sm:col-span-2',role:'alert',children:error}),
      jsx.jsx('div',{className:'sm:col-span-2',children:jsx.jsx('button',{className:btn,type:'submit',disabled:!ready,children:ready?'ثبت هزینه اضافه':'در حال بارگذاری خزانه...'})})]}),
    jsx.jsxs('div',{className:'rounded-2xl border border-line bg-ink-2 p-5',children:[
      jsx.jsx('h3',{className:'mb-3 text-sm font-black text-steel',children:'فهرست هزینه‌های اضافه'}),
      jsx.jsx('input',{className:field,value:query,onChange:e=>{setQuery(e.target.value);setLimit(25)},placeholder:'جستجو در عنوان، رسید یا توضیحات', 'aria-label':'جستجوی هزینه‌ها'}),
      filtered.length===0?jsx.jsx('p',{className:'py-5 text-xs text-mist',children:'موردی یافت نشد.'}):jsx.jsx('div',{className:'mt-3 flex flex-col gap-2',children:filtered.slice(0,limit).map(row=>jsx.jsxs('div',{className:'flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-ink p-3',children:[
        jsx.jsxs('div',{className:'flex flex-col gap-1 text-xs text-mist',children:[jsx.jsx('strong',{className:'text-steel',children:row.partyName}),jsx.jsxs('span',{children:[new Date(row.at).toLocaleString('fa-IR'),row.reference?' · رسید: '+row.reference:'']}),row.note&&jsx.jsx('span',{className:'whitespace-pre-wrap',children:row.note})]}),
        jsx.jsxs('div',{className:'flex items-center gap-3',children:[jsx.jsxs('span',{className:'text-xs font-bold text-red-400',children:[Number(row.amount).toLocaleString('fa-IR'),' تومان']}),jsx.jsx('button',{type:'button',className:'text-xs text-mist hover:text-red-400',onClick:()=>{if(window.confirm('این هزینه از خزانه حذف شود؟')) {deleteExpense(row.id);toast('هزینه از خزانه حذف شد.');}},children:'حذف'})]})]},row.id))}),
      filtered.length>limit&&jsx.jsx('button',{type:'button',className:'mt-3 text-xs text-ember',onClick:()=>setLimit(limit+25),children:'نمایش بیشتر'})]})]});
}
