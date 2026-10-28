import {a as interop} from './rolldown-runtime-BWaJ3C7D.js';
import {l as reactModule,c as jsxModule} from './fa-Ckt9yYap.js';
import {assistantReply,calculatePercent,normalizeAssistantText} from './accounting-assistant-core.js';
const React=interop(reactModule(),1), J=jsxModule();
const field='w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm text-steel outline-none focus:border-ember';
const button='rounded-xl border border-ember/40 bg-ember/10 px-3 py-2 text-xs font-bold text-ember hover:bg-ember/20';
const intro='سلام! من راهنمای حسابداری هامون هستم. پاسخ‌ها قاعده‌محور و فقط در همین مرورگر هستند.';
export default function AccountingAssistant({invoices,scopeDivision,draft,onTab,onFillDraft}) {
  const [open,setOpen]=React.useState(false),[query,setQuery]=React.useState(''),[messages,setMessages]=React.useState([{role:'assistant',text:intro}]);
  const [amount,setAmount]=React.useState(''),[rate,setRate]=React.useState(''),[calc,setCalc]=React.useState('');
  const [name,setName]=React.useState(''),[phone,setPhone]=React.useState(''),[fillStatus,setFillStatus]=React.useState('');
  const end=React.useRef(null);
  React.useEffect(()=>{if(open) end.current?.scrollIntoView({block:'nearest'});},[messages,open]);
  const ask = text => {
    const value=text.trim(); if(!value) return;
    const reply=assistantReply(value,{invoices,scopeDivision,draft});
    setMessages(old=>[...old,{role:'user',text:value},{role:'assistant',...reply}].slice(-30));setQuery('');
  };
  const fill=()=>{
    const n=name.trim(), p=normalizeAssistantText(phone).replace(/[\s()-]/g,'');
    if(!n || (p && !/^\+?[0-9]{8,15}$/.test(p))) {setFillStatus('نام را وارد کنید؛ شماره تماس اختیاری است، اما در صورت ورود باید معتبر باشد.');return;}
    if(onFillDraft({name:n,phone:p})) {setFillStatus('اطلاعات در فرم فاکتور قرار گرفت؛ پیش از صدور بررسی کنید.');setName('');setPhone('');} else setFillStatus('تغییری در فرم انجام نشد.');
  };
  return J.jsxs('section',{className:'print:hidden rounded-2xl border border-emerald-500/30 bg-ink-2 p-4',dir:'rtl',children:[
    J.jsxs('button',{type:'button',onClick:()=>setOpen(!open),className:'flex w-full items-center justify-between gap-3 text-right', 'aria-expanded':open,children:[J.jsxs('span',{className:'flex flex-col gap-1',children:[J.jsx('strong',{className:'text-sm font-black text-steel',children:'دستیار حسابداری هامون'}),J.jsx('span',{className:'text-xs text-mist',children:'راهنمای محلی، بررسی پیش‌نویس و محاسبه کمکی'})]}),J.jsx('span',{className:'text-xs font-bold text-emerald-400',children:open?'بستن':'باز کردن دستیار'})]}),
    open&&J.jsxs('div',{className:'mt-4 flex flex-col gap-3 border-t border-line pt-4',children:[
      J.jsx('p',{className:'text-xs leading-6 text-amber-300',children:'بدون ارسال اطلاعات به سرویس هوش مصنوعی. پاسخ‌ها محدودند و جایگزین کنترل حسابدار یا مشاوره مالیاتی نیستند؛ هیچ سندی خودکار ثبت یا صادر نمی‌شود.'}),
      J.jsx('div',{className:'flex flex-wrap gap-2',children:['چطور فاکتور صادر کنم؟','بررسی پیش‌نویس','ثبت هزینه','چک و خزانه','دفتر کل','انبار','پشتیبان'].map(t=>J.jsx('button',{type:'button',className:button,onClick:()=>ask(t),children:t},t))}),
      J.jsxs('div',{className:'max-h-72 overflow-y-auto rounded-xl border border-line bg-ink p-3',role:'log','aria-live':'polite',children:[...messages.map((m,i)=>J.jsxs('div',{className:`mb-3 rounded-xl p-3 text-xs leading-6 ${m.role==='user'?'bg-ember/10 text-ember-2':'bg-ink-2 text-steel'}`,children:[J.jsx('strong',{children:m.role==='user'?'شما':'دستیار'}),J.jsx('p',{className:'whitespace-pre-wrap',children:m.text}),m.target&&!m.admin&&J.jsx('button',{type:'button',className:'mt-2 text-xs font-bold text-emerald-400 underline',onClick:()=>onTab(m.target),children:'رفتن به بخش مربوط'})]},i)),J.jsx('div',{ref:end})]}),
      J.jsx('button',{type:'button',className:'self-start text-xs text-mist underline',onClick:()=>{setMessages([{role:'assistant',text:intro}]);setQuery('')},children:'پاک کردن گفتگو'}),
      J.jsxs('form',{className:'flex gap-2',onSubmit:e=>{e.preventDefault();ask(query)},children:[J.jsx('input',{className:field,value:query,onChange:e=>setQuery(e.target.value),maxLength:500,placeholder:'مثلاً وضعیت فاکتور HM-1402-001', 'aria-label':'سؤال از دستیار حسابداری'}),J.jsx('button',{type:'submit',className:button,children:'پرسیدن'})]}),
      J.jsx('p',{className:'text-[11px] leading-5 text-mist',children:'اطلاعات فاکتور از داده‌های بارگذاری‌شده پنل در این دستگاه است و ممکن است کامل یا به‌روز نباشد. گفت‌وگو فقط تا خروج از بخش حسابداری در حافظه مرورگر باقی می‌ماند.'}),
      J.jsxs('details',{className:'rounded-xl border border-line p-3',children:[J.jsx('summary',{className:'cursor-pointer text-xs font-bold text-steel',children:'ماشین‌حساب درصد'}),J.jsxs('div',{className:'mt-3 grid gap-2 sm:grid-cols-2',children:[J.jsxs('label',{className:'text-xs text-mist',children:['مبلغ مبنا (تومان)',J.jsx('input',{className:field,value:amount,onChange:e=>setAmount(e.target.value),inputMode:'numeric'})]}),J.jsxs('label',{className:'text-xs text-mist',children:['درصد مورد تأیید شما',J.jsx('input',{className:field,value:rate,onChange:e=>setRate(e.target.value),inputMode:'decimal'})]})]}),J.jsx('button',{type:'button',className:button,onClick:()=>{let r=calculatePercent(amount,rate);setCalc(r?`${r.rate.toLocaleString('fa-IR')}٪ از ${r.amount.toLocaleString('fa-IR')} تومان، با گرد کردن: ${r.value.toLocaleString('fa-IR')} تومان.`:'مبلغ صحیح غیرمنفی و درصد بین ۰ تا ۱۰۰ وارد کنید.')},children:'محاسبه'}),calc&&J.jsx('p',{className:'mt-2 text-xs text-steel',role:'status',children:calc}),J.jsx('p',{className:'mt-2 text-[11px] text-mist',children:'این محاسبه نرخ قانونی یا مبنای مالیات را تعیین نمی‌کند و مقداری در فاکتور ثبت نمی‌کند.'})]}),
      J.jsxs('details',{className:'rounded-xl border border-line p-3',children:[J.jsx('summary',{className:'cursor-pointer text-xs font-bold text-steel',children:'کمک به تکمیل طرف حساب فاکتور'}),J.jsx('p',{className:'mt-2 text-[11px] leading-5 text-mist',children:'اطلاعات را خودتان بررسی و وارد کنید؛ با دکمه زیر فقط فرم قابل ویرایش پر می‌شود و هیچ فاکتوری صادر نمی‌شود.'}),J.jsxs('div',{className:'mt-2 grid gap-2 sm:grid-cols-2',children:[J.jsxs('label',{className:'text-xs text-mist',children:['نام طرف حساب',J.jsx('input',{className:field,value:name,onChange:e=>setName(e.target.value),maxLength:150})]}),J.jsxs('label',{className:'text-xs text-mist',children:['شماره تماس (اختیاری)',J.jsx('input',{className:field,value:phone,onChange:e=>setPhone(e.target.value),type:'tel',dir:'ltr'})]})]}),J.jsx('button',{type:'button',className:button,onClick:fill,children:'قرار دادن در فرم فاکتور'}),fillStatus&&J.jsx('p',{className:'mt-2 text-xs text-steel',role:'status',children:fillStatus})]})]})]});
}
