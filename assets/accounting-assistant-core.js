// Deterministic, local suggestions. Never authorize or post accounting transactions here.
export function normalizeAssistantText(value) {
  return String(value ?? '').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/٫/g,'.').replace(/[\u200b-\u200f\ufeff]/g,' ')
    .replace(/\s+/g,' ').trim().toLowerCase();
}
const sections = {
  issue: ['صدور فاکتور', 'از بخش «صدور و ذخیره فاکتور» نوع فاکتور، طرف حساب، اقلام و قیمت‌ها را وارد کنید. پیش‌نویس و جمع‌ها را بررسی کنید و فقط پس از تأیید ثبت کنید.'],
  invoices: ['آرشیو فاکتورها', 'در آرشیو می‌توانید فاکتور را جست‌وجو، بررسی یا برای ویرایش باز کنید. پیش از تغییر یا ابطال، شماره سند و اثر آن بر موجودی را کنترل کنید.'],
  treasury: ['خزانه و چک', 'در «خزانه‌داری، چک و سود و زیان» می‌توانید دریافت، پرداخت و چک را ثبت و گزارش کنید. ثبت یک تراکنش را با تسویه واقعی و تأیید بانک تطبیق دهید.'],
  extra_expenses: ['هزینه‌های اضافه', 'در «هزینه‌های اضافه» مبلغ، عنوان و روش پرداخت را وارد کنید. این مورد به‌عنوان خروجی خزانه ثبت می‌شود؛ آن را دوباره در خزانه ثبت نکنید.'],
  kardex: ['کاردکس و موجودی', 'برای بررسی گردش کالا و موجودی از «موجودی و کاردکس انبار» استفاده کنید. موجودی نمایش‌داده‌شده را با انبار واقعی تطبیق دهید.'],
  customers: ['مشتریان', 'از «مشتریان و معین» طرف حساب را پیدا کنید و مشخصات و فاکتورهای مربوط را بررسی کنید. مانده مشتری را با دفتر کل تطبیق دهید.'],
  exports: ['پشتیبان و خروجی', 'در «خروجی اکسل و پشتیبان» از اطلاعات خروجی بگیرید. فایل پشتیبان ممکن است اطلاعات محرمانه داشته باشد؛ در محل امن نگهداری کنید.'],
  zarinpal: ['درگاه پرداخت', 'تنظیمات پرداخت در «درگاه زرین‌پال» قرار دارد. فعال بودن واقعی درگاه و وضعیت تراکنش‌ها را در سامانه پرداخت بررسی کنید.'],
};
const adminSections = {
  ledger: ['دفتر کل', 'از دفتر کل می‌توانید اسناد، کدینگ، تراز آزمایشی و صورت‌های مالی را به تفکیک سال بررسی کنید.'],
  products: ['انبار', 'برای مشاهده یا مدیریت کالا به بخش انبار پنل بروید و تغییرات را پیش از ثبت کنترل کنید.'],
  inbox: ['پیام‌های قدیمی', 'بخش مکاتبات قدیمی و کارتابل پیام‌های سایت جدا هستند. برای پیام‌های جدید، کارتابل پیام‌های سایت را از بخش حساب و دسترسی‌ها باز کنید.'],
  dash: ['داشبورد', 'در داشبورد می‌توانید نمای کلی وضعیت مجموعه را بررسی کنید.'],
  archive: ['بایگانی انبار', 'برای مشاهده و چاپ فهرست انبار از بخش بایگانی انبار استفاده کنید.'],
};
const money = n => Number(n).toLocaleString('fa-IR');
function answer(text, target=null, admin=false) { return {text,target,admin}; }
function scopeInvoices(invoices, division) {
  return (Array.isArray(invoices)?invoices:[]).filter(inv=>division==='all' || inv.issuerDivision===division || (Array.isArray(inv.items) && inv.items.some(item=>item.division===division)));
}
export function assistantReply(question, context={}) {
  const q=normalizeAssistantText(question);
  if (!q) return answer('سؤال خود را بنویسید؛ مثلاً «چطور هزینه ثبت کنم؟» یا «وضعیت فاکتور HM-1402-001».');
  const code=q.match(/\bhm(?:-[a-z0-9]+)+\b/i)?.[0];
  if (code) {
    const results=scopeInvoices(context.invoices,context.scopeDivision||'all').filter(inv=>normalizeAssistantText(inv.number)===code);
    if (results.length!==1) return answer(results.length ? 'بیش از یک سند با این شماره در داده‌های بارگذاری‌شده وجود دارد؛ در آرشیو بررسی کنید.' : 'این شماره در داده‌های فعلی یافت نشد. ممکن است اطلاعات هنوز بارگذاری نشده باشند؛ آرشیو و شماره را بررسی کنید.', 'invoices');
    const inv=results[0], total=Number(inv.grandTotal), paid=Number(inv.paidAmount);
    if (!Number.isFinite(total)||!Number.isFinite(paid)) return answer('اطلاعات مبلغ این فاکتور کامل نیست؛ در آرشیو بررسی کنید.','invoices');
    return answer(`فاکتور ${inv.number}\nطرف حساب: ${inv.customerName||'نامشخص'}\nجمع ثبت‌شده: ${money(total)} تومان\nمبلغ پرداخت‌شده ثبت‌شده: ${money(paid)} تومان\nتفاوت جمع و پرداخت: ${money(total-paid)} تومان\nاین فقط بر اساس داده فعلی است؛ نوع سند، وضعیت و مانده حساب را در آرشیو و دفتر کل بررسی کنید.`, 'invoices');
  }
  if (/پیش[ -]*بررسی|بررسی پیش[ -]*نویس|کنترل فاکتور|بررسی فاکتور فعلی/.test(q)) {
    const d=context.draft||{}, rows=Array.isArray(d.items)?d.items:[], warnings=[];
    if (!String(d.customerName||'').trim()) warnings.push('نام طرف حساب وارد نشده است.');
    if (!rows.length) warnings.push('ردیفی در فاکتور وجود ندارد.');
    for (let i=0;i<rows.length;i++) {
      const row=rows[i], qty=Number(row.qty), price=Number(row.unitPrice);
      if (!String(row.name||'').trim() || row.qty === '' || row.qty == null || row.unitPrice === '' || row.unitPrice == null || !Number.isFinite(qty) || qty<=0 || !Number.isFinite(price) || price<0) warnings.push(`ردیف ${i+1}: نام، تعداد یا قیمت معتبر نیست.`);
      else if (price===0) warnings.push(`ردیف ${i+1}: قیمت صفر است؛ درستی آن را بررسی کنید.`);
    }
    const total=Number(d.grandTotal);
    const calculated=Number.isFinite(total)?`\nجمع نمایش‌داده‌شده فرم: ${money(total)} تومان.`:'';
    return answer((warnings.length?'موارد نیازمند بررسی:\n• '+warnings.join('\n• '):'در بررسی اولیه، خطای آشکاری پیدا نشد؛ همچنان مشخصات، قیمت، مالیات و پرداخت را با اسناد تطبیق دهید.')+calculated+'\nاین بررسی جایگزین کنترل حسابدار نیست و سندی صادر نمی‌کند.','issue');
  }
  if (/مانده|بدهی/.test(q) && /فاکتور/.test(q)) return answer('برای بررسی، شماره دقیق فاکتور را بنویسید؛ مثلاً «وضعیت فاکتور HM-1402-001». مانده مشتری ممکن است با تفاوت مبلغ این فاکتور متفاوت باشد.','invoices');
  if (/سود|زیان/.test(q)) return answer('خلاصه عملکرد در بخش خزانه نمایش داده می‌شود. این خلاصه لزوماً سود حسابداری یا مالیاتی قطعی نیست؛ برای گزارش رسمی اسناد و صورت‌های مالی را بررسی کنید.','treasury');
  if (/هزینه|مخارج|خرج/.test(q)) return answer(sections.extra_expenses[1], 'extra_expenses');
  if (/درگاه|زرین[ -]*پال/.test(q)) return answer(sections.zarinpal[1], 'zarinpal');
  if (/مالیات|ارزش افزوده/.test(q)) return answer('نرخ و مبنای مالیات را طبق مقررات و اسناد تأییدشده تعیین کنید. این دستیار نرخ قانونی را حدس نمی‌زند؛ در فرم فاکتور نرخ را بررسی و وارد کنید.','issue');
  if (/چک|چك|خزانه|دریافت|پرداخت|واریز/.test(q)) return answer(sections.treasury[1], 'treasury');
  if (/دفتر کل|تراز آزمایشی|صورت مالی|کدینگ|سند حسابداری/.test(q)) return answer(adminSections.ledger[1], 'ledger', true);
  if (/مشتری|طرف حساب|معین/.test(q)) return answer(sections.customers[1], 'customers');
  if (/کاردکس|گردش کالا/.test(q)) return answer(sections.kardex[1], 'kardex');
  if (/انبار|موجودی|کالا/.test(q)) return answer(adminSections.products[1], 'products', true);
  if (/پیام|استعلام|کارتابل/.test(q)) return answer(adminSections.inbox[1], 'inbox', true);
  if (/پشتیبان|بکاپ|اکسل|خروجی/.test(q)) return answer(sections.exports[1], 'exports');
  if (/آرشیو|بایگانی فاکتور|ویرایش فاکتور|ابطال فاکتور/.test(q)) return answer(sections.invoices[1], 'invoices');
  if (/فاکتور|پیش[ -]*فاکتور/.test(q)) return answer(sections.issue[1], 'issue');
  if (/داشبورد/.test(q)) return answer(adminSections.dash[1], 'dash', true);
  if (/سلام|درود/.test(q)) return answer('سلام! درباره ثبت فاکتور، هزینه، خزانه، چک، مشتری، انبار یا دفتر کل بپرسید. می‌توانید شماره دقیق یک فاکتور را هم برای بررسی وارد کنید.');
  return answer('من فعلاً راهنمای محلی و قاعده‌محور هستم و پاسخ این سؤال را با اطمینان ندارم. درباره فاکتور، هزینه، چک، خزانه، مشتری، انبار یا دفتر کل سؤال دقیق‌تری بپرسید.');
}
export function calculatePercent(amountInput, rateInput) {
  const a=normalizeAssistantText(amountInput).replace(/[\s,٬]/g,'');
  const r=normalizeAssistantText(rateInput).replace(/[\s,٬]/g,'');
  if (!/^\d+$/.test(a) || !/^\d+(?:\.\d{1,2})?$/.test(r)) return null;
  const amount=Number(a), rate=Number(r), result=amount*rate/100;
  if (!Number.isSafeInteger(amount) || amount<0 || rate<0 || rate>100 || !Number.isFinite(result) || result>Number.MAX_SAFE_INTEGER) return null;
  return {amount,rate,value:Math.round(result)};
}
