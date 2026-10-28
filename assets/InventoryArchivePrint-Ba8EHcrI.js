import{a as e}from"./rolldown-runtime-BWaJ3C7D.js";import{c as t,l as n,o as r,r as i,s as a,t as o}from"./fa-Ckt9yYap.js";import{T as s,bt as c,dt as l,t as u}from"./store-9cctwGcq.js";import{t as d}from"./tag-CG2VtE5Y.js";import{$ as ee,B as te,N as f,Q as p,g as m,u as ne,v as re,w as h}from"./index-D7AjnQ7W.js";import{d as ie,o as ae,s as g}from"./AdminApp--kXxpmTx.js";var _=a(`clipboard-check`,[[`rect`,{width:`8`,height:`4`,x:`8`,y:`2`,rx:`1`,ry:`1`,key:`tgr4d6`}],[`path`,{d:`M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2`,key:`116196`}],[`path`,{d:`m9 14 2 2 4-4`,key:`df797q`}]]),v=a(`file-down`,[[`path`,{d:`M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z`,key:`1rqfz7`}],[`path`,{d:`M14 2v4a2 2 0 0 0 2 2h4`,key:`tnqrlb`}],[`path`,{d:`M12 18v-6`,key:`17g6i2`}],[`path`,{d:`m9 15 3 3 3-3`,key:`1npd3o`}]]),y=a(`square-check-big`,[[`path`,{d:`M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344`,key:`2acyp4`}],[`path`,{d:`m9 11 3 3L22 4`,key:`1pflzl`}]]),b=a(`square`,[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}]]),x=e(n(),1),S=t();function C({division:e,onSelectDivision:t,toast:n}){let a=l(),C=s(e),w=a[e].products,[T,E]=(0,x.useState)(()=>C.categories.map(e=>e.id)),[D,O]=(0,x.useState)(e);D!==e&&(O(e),E(C.categories.map(e=>e.id)));let[k,oe]=(0,x.useState)(`all`),[A,se]=(0,x.useState)(!0),[j,ce]=(0,x.useState)(!0),[M,le]=(0,x.useState)(!0),[N,P]=(0,x.useState)(!0),[F,I]=(0,x.useState)(()=>`HMN-ARC-${e.toUpperCase().slice(0,2)}-1404${String(new Date().getMonth()+1).padStart(2,`0`)}`),[L,R]=(0,x.useState)(`گزارش رسمی موجودی کالاها و برگ شمارش بایگانی انبار`),[z,B]=(0,x.useState)(`مسئول انبار ${C.short}`),[V,H]=(0,x.useState)(C.manager),[U,ue]=(0,x.useState)(`این سند جهت بایگانی دوره‌ای موجودی انبار، تطبیق کاردکس فیزیکی و ارائه به واحد حسابداری و مدیریت کل هلدینگ صنعتی هامون صادر گردیده است.`),de=e=>{E(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])},fe=()=>{E(C.categories.map(e=>e.id))},W=()=>{E([])},G=(0,x.useMemo)(()=>w.filter(e=>!(!T.includes(e.category)||k===`in_stock`&&e.stock<=0||k===`low_stock`&&e.stock>=10||k===`out_of_stock`&&e.stock>0)),[w,T,k]),K=(0,x.useMemo)(()=>C.categories.filter(e=>T.includes(e.id)).map(e=>{let t=G.filter(t=>t.category===e.id);return{category:e,items:t,totalStock:t.reduce((e,t)=>e+(Number(t.stock)||0),0),lowCount:t.filter(e=>e.stock<10).length,totalValueToman:t.reduce((e,t)=>e+(t.price>0?t.price*Math.max(0,t.stock):0),0)}}).filter(e=>e.items.length>0),[C.categories,T,G]),q=G.length,J=G.reduce((e,t)=>e+(Number(t.stock)||0),0),Y=G.filter(e=>e.stock>0&&e.stock<10).length,X=G.filter(e=>e.stock<=0).length,Z=Math.max(1,...K.map(e=>e.totalStock)),Q=k===`in_stock`?`فقط کالاهای موجود در انبار (موجودی بالای صفر)`:k===`low_stock`?`فقط کالاهای کم‌تعداد و بحرانی (زیر ۱۰ عدد)`:k===`out_of_stock`?`فقط کالاهای ناموجود (موجودی صفر)`:`تمامی کالاهای دسته‌بندی‌های انتخابی`,$=e=>{let t=e=>String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),n=o(Date.now()),a=N?`<div class="chart-box">
          <div class="chart-title">نمودار گرافیکی توزیع موجودی به تفکیک دسته‌بندی‌های انتخابی</div>
          <div class="chart-rows">
            ${K.map(e=>{let n=Math.max(6,Math.round(e.totalStock/Z*100));return`<div class="chart-row">
                  <div class="chart-label">${t(e.category.label)} <span class="chart-sub">(${r(e.items.length)} قلم)</span></div>
                  <div class="chart-track">
                    <div class="chart-fill" style="width:${n}%;"></div>
                  </div>
                  <div class="chart-val">${r(e.totalStock)} واحد</div>
                </div>`}).join(``)}
          </div>
        </div>`:``,s=K.map((e,n)=>{let a=e.items.map((e,n)=>{let a=e.priceRial??(e.price>0?e.price*10:0),o=e.stock<=0,s=e.stock>0&&e.stock<10,c=o?`ناموجود (۰)`:s?`کم‌تعداد (<۱۰)`:`موجود عادی`,l=o?`st-out`:s?`st-low`:`st-ok`,u=[e.dimIn?`داخلی: ${e.dimIn}`:``,e.dimOut?`خارجی: ${e.dimOut}`:``,e.thickness?`ضخامت/طول: ${e.thickness}`:``,e.material?`متریال: ${e.material}`:``].filter(Boolean).join(` | `),d=A?ie(g(e,`compact`),40):``;return`<tr class="${o?`row-out`:s?`row-low`:``}">
              <td class="td-center">${r(n+1)}</td>
              <td class="td-code" dir="ltr">${t(e.code)}</td>
              <td>
                <div class="prod-name">${t(e.name)}</div>
                ${u?`<div class="prod-spec">${t(u)}</div>`:``}
              </td>
              <td class="td-center">${t(e.shelf||`—`)}</td>
              <td class="td-center td-stock ${l}">${r(e.stock)}</td>
              <td class="td-center">${t(e.unit)}</td>
              <td class="td-center"><span class="badge ${l}">${c}</span></td>
              ${j?`<td class="td-center">${e.price>0?`<div class="price-main">${i(e.price)} ت</div><div class="price-sub">${i(a)} ریال</div>`:`<span class="price-ask">استعلامی</span>`}</td>`:``}
              ${A?`<td class="td-center"><div class="qr-cell">${d}</div></td>`:``}
              ${M?`<td class="td-center"><div class="audit-box"></div></td>`:``}
            </tr>`}).join(``);return`<div class="cat-section">
          <div class="cat-header">
            <div class="cat-title">
              <span class="cat-index">${r(n+1)}</span>
              <span>دسته‌بندی: ${t(e.category.label)}</span>
              <span class="cat-short">(${t(e.category.short)})</span>
            </div>
            <div class="cat-meta">
              <span>تعداد اقلام: <b>${r(e.items.length)} قلم</b></span>
              <span>|</span>
              <span>مجموع موجودی فعلی دسته: <b>${r(e.totalStock)} واحد</b></span>
              ${e.lowCount>0?`<span>|</span><span class="low-tag">کم‌تعداد: ${r(e.lowCount)} قلم</span>`:``}
            </div>
          </div>
          <table class="inv-table">
            <thead>
              <tr>
                <th style="width:38px;">ردیف</th>
                <th style="width:96px;">کد فنی (SKU)</th>
                <th>نام کالا و مشخصات فنی</th>
                <th style="width:64px;">قفسه</th>
                <th style="width:74px;">مقدار فعلی</th>
                <th style="width:58px;">واحد</th>
                <th style="width:86px;">وضعیت</th>
                ${j?`<th style="width:105px;">قیمت واحد</th>`:``}
                ${A?`<th style="width:52px;">بارکد ۲D</th>`:``}
                ${M?`<th style="width:78px;">شمارش فیزیکی</th>`:``}
              </tr>
            </thead>
            <tbody>
              ${a}
            </tbody>
          </table>
        </div>`}).join(``);return`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${t(L)} - ${t(C.short)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 16px;
      font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      direction: rtl;
      font-size: 11px;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
    .page-sheet {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 12px;
      padding: 16px 18px;
    }
    .top-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .brand-col h1 {
      margin: 0;
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
    }
    .brand-col h2 {
      margin: 3px 0 0;
      font-size: 12.5px;
      font-weight: 800;
      color: #b45309;
    }
    .brand-col p {
      margin: 3px 0 0;
      font-size: 10px;
      color: #475569;
    }
    .meta-box {
      border: 1.5px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 10px;
      line-height: 1.7;
      min-width: 210px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .kpi-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      background: #f8fafc;
      text-align: center;
    }
    .kpi-card .k-label {
      font-size: 9.5px;
      color: #475569;
      font-weight: 700;
    }
    .kpi-card .k-val {
      font-size: 15px;
      font-weight: 900;
      margin-top: 2px;
      color: #0f172a;
    }
    .chart-box {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 14px;
      background: #ffffff;
      page-break-inside: avoid;
    }
    .chart-title {
      font-size: 10.5px;
      font-weight: 900;
      margin-bottom: 8px;
      color: #0f172a;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 4px;
    }
    .chart-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      font-size: 10px;
    }
    .chart-label {
      width: 165px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chart-sub {
      color: #64748b;
      font-weight: 400;
    }
    .chart-track {
      flex: 1;
      height: 10px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
    }
    .chart-fill {
      height: 100%;
      background: linear-gradient(90deg, #f59e0b, #ea580c);
      border-radius: 99px;
    }
    .chart-val {
      width: 72px;
      text-align: left;
      font-weight: 900;
      color: #0f172a;
    }
    .cat-section {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .cat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #ffffff;
      padding: 7px 12px;
      border-radius: 8px 8px 0 0;
      font-size: 11px;
    }
    .cat-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 900;
    }
    .cat-index {
      background: #f59e0b;
      color: #0f172a;
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 900;
    }
    .cat-short {
      font-size: 9.5px;
      color: #cbd5e1;
      font-weight: 500;
    }
    .cat-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: #e2e8f0;
    }
    .low-tag {
      background: #fef3c7;
      color: #92400e;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 800;
    }
    .inv-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #0f172a;
    }
    .inv-table th {
      background: #e2e8f0;
      color: #0f172a;
      border: 1px solid #94a3b8;
      padding: 6px 5px;
      font-size: 9.5px;
      font-weight: 900;
      text-align: center;
    }
    .inv-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
      vertical-align: middle;
      font-size: 10px;
    }
    .inv-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .inv-table tr.row-low {
      background: #fffbeb;
    }
    .inv-table tr.row-out {
      background: #fef2f2;
    }
    .td-center {
      text-align: center;
    }
    .td-code {
      text-align: center;
      font-family: monospace;
      font-weight: 800;
      font-size: 9.5px;
      color: #0f172a;
    }
    .prod-name {
      font-weight: 800;
      color: #0f172a;
    }
    .prod-spec {
      font-size: 8.5px;
      color: #475569;
      margin-top: 2px;
    }
    .td-stock {
      font-size: 12px;
      font-weight: 900;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 800;
    }
    .st-ok {
      color: #047857;
    }
    .badge.st-ok {
      background: #d1fae5;
      color: #065f46;
    }
    .st-low {
      color: #b45309;
    }
    .badge.st-low {
      background: #fef3c7;
      color: #92400e;
    }
    .st-out {
      color: #b91c1c;
    }
    .badge.st-out {
      background: #fee2e2;
      color: #991b1b;
    }
    .price-main {
      font-weight: 800;
      color: #0f172a;
      font-size: 9.5px;
    }
    .price-sub {
      font-size: 8px;
      color: #64748b;
    }
    .price-ask {
      font-size: 9px;
      font-weight: 700;
      color: #b45309;
    }
    .qr-cell {
      display: inline-flex;
      padding: 2px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
    }
    .audit-box {
      width: 52px;
      height: 22px;
      border: 1.5px dashed #64748b;
      border-radius: 4px;
      margin: 0 auto;
      background: #ffffff;
    }
    .note-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 9.5px;
      color: #334155;
      margin-top: 10px;
      line-height: 1.6;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 14px;
      page-break-inside: avoid;
    }
    .sign-card {
      border: 1.5px solid #94a3b8;
      border-radius: 8px;
      padding: 10px;
      min-height: 85px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      font-size: 9.5px;
    }
    .sign-title {
      font-weight: 900;
      color: #0f172a;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 4px;
    }
    .sign-sub {
      color: #64748b;
      font-size: 8.5px;
    }
    .toolbar-no-print {
      max-width: 210mm;
      margin: 0 auto 12px;
      background: #0f172a;
      color: #fff;
      padding: 10px 16px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .toolbar-no-print button {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-family: inherit;
      font-weight: 900;
      font-size: 12px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="toolbar-no-print no-print">
    <div><b>پیش‌نمایش رسمی چاپ و ذخیره PDF گرافیکی انبار — ${t(C.short)}</b></div>
    <button onclick="window.print()">چاپ / ذخیره به صورت فایل PDF (A4)</button>
  </div>
  <div class="page-sheet">
    <div class="top-banner">
      <div class="brand-col">
        <h1>هلدینگ صنعتی هامون — ${t(C.name)}</h1>
        <h2>${t(L)}</h2>
        <p>محدوده گزارش: ${t(Q)} | مدیریت واحد: ${t(C.manager)} | تلفن: ${t(C.phoneFa)}</p>
      </div>
      <div class="meta-box">
        <div><b>شماره سند بایگانی:</b> <span dir="ltr">${t(F)}</span></div>
        <div><b>تاریخ و زمان صدور:</b> ${t(n)}</div>
        <div><b>تعداد دسته‌های انتخابی:</b> ${r(K.length)} دسته‌بندی</div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="k-label">تعداد کل اقلام لیست</div>
        <div class="k-val">${r(q)} قلم</div>
      </div>
      <div class="kpi-card">
        <div class="k-label">مجموع مقادیر فعلی انبار</div>
        <div class="k-val">${r(J)} واحد</div>
      </div>
      <div class="kpi-card">
        <div class="k-label">اقلام کم‌تعداد (زیر ۱۰)</div>
        <div class="k-val" style="color:#b45309;">${r(Y)} قلم</div>
      </div>
      <div class="kpi-card">
        <div class="k-label">اقلام ناموجود (صفر)</div>
        <div class="k-val" style="color:#b91c1c;">${r(X)} قلم</div>
      </div>
    </div>

    ${a}
    ${s}

    ${U?`<div class="note-box"><b>توضیحات بایگانی انبار:</b> ${t(U)}</div>`:``}

    <div class="sign-grid">
      <div class="sign-card">
        <div class="sign-title">تنظیم‌کننده و انباردار واحد</div>
        <div><b>${t(z)}</b></div>
        <div class="sign-sub">امضا و اثر انگشت / تاریخ</div>
      </div>
      <div class="sign-card">
        <div class="sign-title">سرپرست واحد / ممیز انبارگردانی</div>
        <div><b>${t(V)}</b></div>
        <div class="sign-sub">تأیید شمارش فیزیکی و امضا</div>
      </div>
      <div class="sign-card">
        <div class="sign-title">تأیید حسابداری و بایگانی کل هلدینگ</div>
        <div><b>واحد مالی و حسابداری هامون</b></div>
        <div class="sign-sub">مهر رسمی و ثبت در زونکن بایگانی</div>
      </div>
    </div>
  </div>
  ${e?`<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };<\/script>`:``}
</body>
</html>`};return(0,S.jsxs)(`div`,{className:`flex flex-col gap-6`,children:[(0,S.jsxs)(`header`,{className:`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ember/30 bg-ink-2 p-5 shadow-xl print:hidden`,children:[(0,S.jsxs)(`div`,{className:`flex items-start gap-3.5`,children:[(0,S.jsx)(`div`,{className:`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ember/15 text-ember`,children:(0,S.jsx)(h,{className:`h-6 w-6`})}),(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,S.jsx)(`span`,{className:`text-[10.5px] font-black ${C.accent}`,children:C.short}),(0,S.jsx)(`span`,{className:`rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-300`,children:`قالب رسمی A4 گرافیکی و قابل بایگانی`})]}),(0,S.jsx)(`h1`,{className:`mt-1 text-xl font-black text-steel sm:text-2xl`,children:`مرکز صدور PDF گرافیکی و برگه بایگانی موجودی انبار`}),(0,S.jsx)(`p`,{className:`mt-1 text-xs text-mist`,children:`انتخاب دسته‌بندی‌های مشخص انبار، مشاهده مقادیر فعلی، نمودار گرافیکی موجودی و چاپ مستقیم یا ذخیره PDF جهت زونکن بایگانی انبار`})]})]}),(0,S.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2.5`,children:[(0,S.jsxs)(`button`,{type:`button`,onClick:()=>{if(K.length===0){n(`لطفاً حداقل یک دسته‌بندی دارای کالا را برای تولید PDF انتخاب کنید`);return}let e=$(!1),t=document.createElement(`iframe`);t.style.position=`fixed`,t.style.right=`0`,t.style.bottom=`0`,t.style.width=`0`,t.style.height=`0`,t.style.border=`0`,document.body.appendChild(t);let r=t.contentWindow?.document;r&&(r.open(),r.write(e),r.close(),setTimeout(()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(t)},2500)},350)),n(`پنجره چاپ و ذخیره PDF گرافیکی بایگانی «${C.short}» آماده شد`)},disabled:K.length===0,className:`flex items-center gap-2 rounded-xl bg-ember px-4 py-3 text-xs font-black text-ink shadow-lg shadow-ember/20 transition-all hover:bg-ember-2 disabled:opacity-40`,children:[(0,S.jsx)(h,{className:`h-4 w-4`}),(0,S.jsx)(`span`,{children:`چاپ مستقیم / ذخیره PDF گرافیکی (A4)`})]}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>{if(K.length===0){n(`لطفاً حداقل یک دسته‌بندی دارای کالا را انتخاب کنید`);return}let t=$(!1),r=new Blob([t],{type:`text/html;charset=utf-8;`}),i=URL.createObjectURL(r),a=document.createElement(`a`),o=new Date().toISOString().slice(0,10);a.href=i,a.download=`Hamun-Warehouse-PDF-Archive-${e}-${o}.html`,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),4e3),n(`برگه گرافیکی قابل چاپ بایگانی انبار «${C.short}» دانلود شد`)},disabled:K.length===0,className:`flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-300 transition-all hover:bg-emerald-400 hover:text-ink disabled:opacity-40`,children:[(0,S.jsx)(v,{className:`h-4 w-4`}),(0,S.jsx)(`span`,{children:`دانلود فایل آرشیو گرافیکی`})]})]})]}),(0,S.jsxs)(`div`,{className:`grid grid-cols-1 gap-4 lg:grid-cols-12 print:hidden`,children:[(0,S.jsxs)(`div`,{className:`flex flex-col gap-4 rounded-2xl border border-line bg-ink-2 p-4 lg:col-span-7`,children:[t&&(0,S.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3`,children:[(0,S.jsxs)(`span`,{className:`flex items-center gap-1.5 text-xs font-black text-steel`,children:[(0,S.jsx)(p,{className:`h-4 w-4 text-ember`}),`انتخاب انبار واحد تولیدی/بازرگانی:`]}),(0,S.jsx)(`div`,{className:`flex flex-wrap items-center gap-1.5`,children:u.map(n=>(0,S.jsxs)(`button`,{type:`button`,onClick:()=>t(n.id),className:`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${e===n.id?`${n.chip} ${n.accent} border-current font-black`:`border-line bg-ink text-mist hover:text-steel`}`,children:[n.short,` (`,r(a[n.id].products.length),`)`]},n.id))})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`mb-2.5 flex flex-wrap items-center justify-between gap-2`,children:[(0,S.jsxs)(`span`,{className:`flex items-center gap-1.5 text-xs font-black text-steel`,children:[(0,S.jsx)(d,{className:`h-4 w-4 text-ember`}),`۱. انتخاب دسته‌بندی‌های مشخص جهت درج در PDF بایگانی (`,r(T.length),` از `,r(C.categories.length),` دسته):`]}),(0,S.jsxs)(`div`,{className:`flex items-center gap-1.5 text-[11px]`,children:[(0,S.jsx)(`button`,{type:`button`,onClick:fe,className:`rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-300 hover:bg-emerald-500/20`,children:`انتخاب همه دسته‌ها`}),(0,S.jsx)(`button`,{type:`button`,onClick:W,className:`rounded-lg border border-line bg-ink px-2.5 py-1 font-bold text-mist hover:text-red-300`,children:`لغو انتخاب همه`})]})]}),(0,S.jsx)(`div`,{className:`grid grid-cols-1 gap-2 sm:grid-cols-2`,children:C.categories.map(e=>{let t=T.includes(e.id),n=w.filter(t=>t.category===e.id),i=n.reduce((e,t)=>e+(Number(t.stock)||0),0);return(0,S.jsxs)(`button`,{type:`button`,onClick:()=>de(e.id),className:`flex items-center justify-between rounded-xl border p-3 text-right transition-all ${t?`border-ember/50 bg-ember/10 text-steel shadow-sm`:`border-line bg-ink text-mist opacity-70 hover:opacity-100`}`,children:[(0,S.jsxs)(`div`,{className:`flex items-center gap-2.5`,children:[t?(0,S.jsx)(y,{className:`h-4 w-4 shrink-0 text-ember`}):(0,S.jsx)(b,{className:`h-4 w-4 shrink-0 text-faint`}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`text-xs font-black`,children:e.label}),(0,S.jsxs)(`div`,{className:`text-[10px] text-mist`,children:[r(n.length),` قلم کالا · مجموع موجودی: `,r(i),` واحد`]})]})]}),(0,S.jsx)(`span`,{className:`rounded-lg border border-line bg-ink-2 px-2 py-0.5 text-[10px] font-bold text-mist`,children:e.short})]},e.id)})})]}),(0,S.jsxs)(`div`,{className:`border-t border-line pt-3`,children:[(0,S.jsx)(`span`,{className:`mb-2 block text-xs font-black text-steel`,children:`۲. فیلتر وضعیت مقادیر موجودی در گزارش بایگانی:`}),(0,S.jsx)(`div`,{className:`grid grid-cols-2 gap-2 sm:grid-cols-4`,children:[{id:`all`,label:`همه کالاها`,sub:`${r(w.length)} قلم`},{id:`in_stock`,label:`فقط موجود (>۰)`,sub:`${r(w.filter(e=>e.stock>0).length)} قلم`},{id:`low_stock`,label:`کم‌تعداد (<۱۰)`,sub:`${r(w.filter(e=>e.stock<10).length)} قلم`},{id:`out_of_stock`,label:`ناموجود (۰)`,sub:`${r(w.filter(e=>e.stock<=0).length)} قلم`}].map(e=>(0,S.jsxs)(`button`,{type:`button`,onClick:()=>oe(e.id),className:`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${k===e.id?`border-cyan-400 bg-cyan-500/15 text-cyan-300 font-black`:`border-line bg-ink text-mist hover:text-steel`}`,children:[(0,S.jsx)(`span`,{className:`text-xs font-bold`,children:e.label}),(0,S.jsx)(`span`,{className:`mt-0.5 text-[10px] opacity-80`,children:e.sub})]},e.id))})]})]}),(0,S.jsxs)(`div`,{className:`flex flex-col justify-between gap-4 rounded-2xl border border-line bg-ink-2 p-4 lg:col-span-5`,children:[(0,S.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,S.jsxs)(`span`,{className:`flex items-center gap-1.5 text-xs font-black text-steel`,children:[(0,S.jsx)(te,{className:`h-4 w-4 text-ember`}),`۳. مشخصات سربرگ و تنظیمات گرافیکی برگه PDF بایگانی:`]}),(0,S.jsxs)(`div`,{className:`grid grid-cols-1 gap-2.5 sm:grid-cols-2`,children:[(0,S.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,S.jsx)(`label`,{className:`text-[10.5px] font-bold text-mist`,children:`شماره سند بایگانی:`}),(0,S.jsx)(`input`,{value:F,onChange:e=>I(e.target.value),dir:`ltr`,className:`rounded-xl border border-line bg-ink px-3 py-2 text-xs font-bold text-steel outline-none focus:border-ember`})]}),(0,S.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,S.jsx)(`label`,{className:`text-[10.5px] font-bold text-mist`,children:`عنوان گزارش بایگانی:`}),(0,S.jsx)(`input`,{value:L,onChange:e=>R(e.target.value),className:`rounded-xl border border-line bg-ink px-3 py-2 text-xs font-bold text-steel outline-none focus:border-ember`})]}),(0,S.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,S.jsx)(`label`,{className:`text-[10.5px] font-bold text-mist`,children:`نام انباردار تنظیم‌کننده:`}),(0,S.jsx)(`input`,{value:z,onChange:e=>B(e.target.value),className:`rounded-xl border border-line bg-ink px-3 py-2 text-xs font-bold text-steel outline-none focus:border-ember`})]}),(0,S.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,S.jsx)(`label`,{className:`text-[10.5px] font-bold text-mist`,children:`نام سرپرست / ممیز انبار:`}),(0,S.jsx)(`input`,{value:V,onChange:e=>H(e.target.value),className:`rounded-xl border border-line bg-ink px-3 py-2 text-xs font-bold text-steel outline-none focus:border-ember`})]})]}),(0,S.jsxs)(`div`,{className:`grid grid-cols-2 gap-2 pt-1 text-[11px]`,children:[(0,S.jsxs)(`button`,{type:`button`,onClick:()=>P(e=>!e),className:`flex items-center gap-2 rounded-xl border px-3 py-2 font-bold transition-all ${N?`border-emerald-500/40 bg-emerald-500/10 text-emerald-300`:`border-line bg-ink text-mist`}`,children:[N?(0,S.jsx)(y,{className:`h-3.5 w-3.5`}):(0,S.jsx)(b,{className:`h-3.5 w-3.5`}),(0,S.jsx)(`span`,{children:`نمودار گرافیکی دسته‌ها`})]}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>se(e=>!e),className:`flex items-center gap-2 rounded-xl border px-3 py-2 font-bold transition-all ${A?`border-emerald-500/40 bg-emerald-500/10 text-emerald-300`:`border-line bg-ink text-mist`}`,children:[A?(0,S.jsx)(y,{className:`h-3.5 w-3.5`}):(0,S.jsx)(b,{className:`h-3.5 w-3.5`}),(0,S.jsx)(`span`,{children:`ستون بارکد ۲ بعدی`})]}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>ce(e=>!e),className:`flex items-center gap-2 rounded-xl border px-3 py-2 font-bold transition-all ${j?`border-emerald-500/40 bg-emerald-500/10 text-emerald-300`:`border-line bg-ink text-mist`}`,children:[j?(0,S.jsx)(y,{className:`h-3.5 w-3.5`}):(0,S.jsx)(b,{className:`h-3.5 w-3.5`}),(0,S.jsx)(`span`,{children:`ستون قیمت (تومان/ریال)`})]}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>le(e=>!e),className:`flex items-center gap-2 rounded-xl border px-3 py-2 font-bold transition-all ${M?`border-emerald-500/40 bg-emerald-500/10 text-emerald-300`:`border-line bg-ink text-mist`}`,children:[M?(0,S.jsx)(y,{className:`h-3.5 w-3.5`}):(0,S.jsx)(b,{className:`h-3.5 w-3.5`}),(0,S.jsx)(`span`,{children:`ستون تیک شمارش فیزیکی`})]})]})]}),(0,S.jsx)(`div`,{className:`rounded-xl border border-ember/30 bg-ember/[0.06] p-3 text-[11px] text-mist`,children:(0,S.jsxs)(`div`,{className:`flex items-center justify-between font-black text-steel`,children:[(0,S.jsx)(`span`,{children:`خلاصه سند آماده چاپ:`}),(0,S.jsxs)(`span`,{className:`text-ember`,children:[r(K.length),` دسته · `,r(q),` قلم کالا · `,r(J),` واحد موجودی`]})]})})]})]}),(0,S.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,S.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2 px-1 print:hidden`,children:[(0,S.jsxs)(`span`,{className:`flex items-center gap-2 text-xs font-black text-steel`,children:[(0,S.jsx)(re,{className:`h-4 w-4 text-ember`}),`پیش‌نمایش زنده برگه گرافیکی PDF بایگانی انبار (مقیاس استاندارد A4 قابل پرینت)`]}),(0,S.jsxs)(`span`,{className:`text-[11px] text-mist`,children:[`در پنجره چاپ مرورگر گزینه `,(0,S.jsx)(`b`,{children:`Save as PDF`}),` را برای ذخیره فایل PDF گرافیکی انتخاب کنید`]})]}),K.length===0?(0,S.jsxs)(`div`,{className:`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-ink-2 py-16 text-center`,children:[(0,S.jsx)(ee,{className:`h-10 w-10 text-faint`}),(0,S.jsx)(`p`,{className:`text-sm font-bold text-steel`,children:`هیچ کالایی در دسته‌بندی‌ها یا فیلتر انتخابی یافت نشد`}),(0,S.jsx)(`p`,{className:`text-xs text-mist`,children:`لطفاً از بخش بالا حداقل یک دسته‌بندی دارای محصول را فعال کنید.`})]}):(0,S.jsxs)(`div`,{className:`mx-auto w-full max-w-[920px] rounded-2xl border-2 border-slate-300 bg-white p-5 text-slate-900 shadow-2xl sm:p-8`,children:[(0,S.jsxs)(`div`,{className:`flex flex-col justify-between gap-4 border-b-4 border-slate-900 pb-4 sm:flex-row sm:items-center`,children:[(0,S.jsxs)(`div`,{className:`flex items-center gap-3.5`,children:[(0,S.jsx)(`div`,{className:`rounded-xl bg-slate-900 p-2.5 text-white`,children:(0,S.jsx)(ne,{size:40,withWord:!1})}),(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`h2`,{className:`text-base font-black text-slate-900 sm:text-lg`,children:[`هلدینگ صنعتی هامون — `,C.name]}),(0,S.jsx)(`p`,{className:`mt-0.5 text-xs font-extrabold text-amber-700`,children:L}),(0,S.jsxs)(`p`,{className:`mt-1 text-[11px] text-slate-600`,children:[`محدوده گزارش: `,Q,` | مدیریت واحد: `,C.manager,` | تلفن: `,C.phoneFa]})]})]}),(0,S.jsxs)(`div`,{className:`rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-[11px] leading-6 text-slate-800`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`b`,{children:`شماره سند بایگانی:`}),` `,(0,S.jsx)(`span`,{className:`font-mono font-bold`,dir:`ltr`,children:F})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`b`,{children:`تاریخ صدور:`}),` `,o(Date.now())]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`b`,{children:`دسته‌های انتخاب‌شده:`}),` `,r(K.length),` دسته‌بندی`]})]})]}),(0,S.jsxs)(`div`,{className:`mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4`,children:[(0,S.jsxs)(`div`,{className:`rounded-xl border border-slate-300 bg-slate-50 p-3 text-center`,children:[(0,S.jsx)(`span`,{className:`text-[10.5px] font-bold text-slate-600`,children:`تعداد کل اقلام لیست`}),(0,S.jsxs)(`div`,{className:`mt-1 text-base font-black text-slate-900`,children:[r(q),` قلم`]})]}),(0,S.jsxs)(`div`,{className:`rounded-xl border border-slate-300 bg-slate-50 p-3 text-center`,children:[(0,S.jsx)(`span`,{className:`text-[10.5px] font-bold text-slate-600`,children:`مجموع مقادیر فعلی انبار`}),(0,S.jsxs)(`div`,{className:`mt-1 text-base font-black text-emerald-700`,children:[r(J),` واحد`]})]}),(0,S.jsxs)(`div`,{className:`rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-center`,children:[(0,S.jsx)(`span`,{className:`text-[10.5px] font-bold text-amber-800`,children:`اقلام کم‌تعداد (زیر ۱۰)`}),(0,S.jsxs)(`div`,{className:`mt-1 text-base font-black text-amber-700`,children:[r(Y),` قلم`]})]}),(0,S.jsxs)(`div`,{className:`rounded-xl border border-rose-300 bg-rose-50/70 p-3 text-center`,children:[(0,S.jsx)(`span`,{className:`text-[10.5px] font-bold text-rose-800`,children:`اقلام ناموجود (صفر)`}),(0,S.jsxs)(`div`,{className:`mt-1 text-base font-black text-rose-700`,children:[r(X),` قلم`]})]})]}),N&&(0,S.jsxs)(`div`,{className:`mt-4 rounded-xl border border-slate-300 bg-slate-50/60 p-3.5`,children:[(0,S.jsxs)(`div`,{className:`mb-2.5 flex items-center justify-between border-b border-dashed border-slate-300 pb-1.5 text-xs font-black text-slate-800`,children:[(0,S.jsxs)(`span`,{className:`flex items-center gap-1.5`,children:[(0,S.jsx)(f,{className:`h-4 w-4 text-amber-600`}),`نمودار گرافیکی مقادیر موجودی به تفکیک دسته‌بندی‌های انبار`]}),(0,S.jsxs)(`span`,{className:`text-[10.5px] font-bold text-slate-500`,children:[`مجموع: `,r(J),` واحد در `,r(K.length),` دسته`]})]}),(0,S.jsx)(`div`,{className:`flex flex-col gap-2`,children:K.map(e=>{let t=Math.max(6,Math.round(e.totalStock/Z*100));return(0,S.jsxs)(`div`,{className:`flex items-center gap-3 text-xs`,children:[(0,S.jsxs)(`div`,{className:`w-40 shrink-0 truncate font-bold text-slate-800 sm:w-48`,children:[e.category.label,` `,(0,S.jsxs)(`span`,{className:`text-[10px] font-normal text-slate-500`,children:[`(`,r(e.items.length),` قلم)`]})]}),(0,S.jsx)(`div`,{className:`h-3 flex-1 overflow-hidden rounded-full bg-slate-200`,children:(0,S.jsx)(`div`,{className:`h-full rounded-full bg-gradient-to-l from-amber-500 to-orange-600`,style:{width:`${t}%`}})}),(0,S.jsxs)(`div`,{className:`w-20 shrink-0 text-left font-black text-slate-900`,children:[r(e.totalStock),` واحد`]})]},e.category.id)})})]}),(0,S.jsx)(`div`,{className:`mt-5 flex flex-col gap-5`,children:K.map((e,t)=>(0,S.jsxs)(`div`,{className:`overflow-hidden rounded-xl border border-slate-900`,children:[(0,S.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-3.5 py-2.5 text-white`,children:[(0,S.jsxs)(`div`,{className:`flex items-center gap-2 text-xs font-black`,children:[(0,S.jsx)(`span`,{className:`grid h-5 w-5 place-items-center rounded bg-amber-500 text-[11px] font-black text-slate-950`,children:r(t+1)}),(0,S.jsxs)(`span`,{children:[`دسته‌بندی: `,e.category.label]}),(0,S.jsxs)(`span`,{className:`text-[10.5px] font-normal text-slate-300`,children:[`(`,e.category.short,`)`]})]}),(0,S.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2.5 text-[11px] text-slate-200`,children:[(0,S.jsxs)(`span`,{children:[`تعداد اقلام: `,(0,S.jsxs)(`b`,{children:[r(e.items.length),` قلم`]})]}),(0,S.jsx)(`span`,{children:`|`}),(0,S.jsxs)(`span`,{children:[`مجموع موجودی فعلی: `,(0,S.jsxs)(`b`,{children:[r(e.totalStock),` واحد`]})]}),e.lowCount>0&&(0,S.jsxs)(`span`,{className:`rounded bg-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-950`,children:[`کم‌تعداد: `,r(e.lowCount),` قلم`]})]})]}),(0,S.jsx)(`div`,{className:`overflow-x-auto`,children:(0,S.jsxs)(`table`,{className:`w-full min-w-[640px] border-collapse text-right text-xs`,children:[(0,S.jsx)(`thead`,{children:(0,S.jsxs)(`tr`,{className:`border-b border-slate-400 bg-slate-200 text-[10.5px] font-black text-slate-900`,children:[(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2 py-2 text-center`,children:`ردیف`}),(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2.5 py-2 text-center`,children:`کد فنی (SKU)`}),(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-3 py-2`,children:`نام کالا و مشخصات فنی`}),(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2 py-2 text-center`,children:`قفسه`}),(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2.5 py-2 text-center`,children:`مقدار فعلی`}),(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2 py-2 text-center`,children:`واحد`}),(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2.5 py-2 text-center`,children:`وضعیت موجودی`}),j&&(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2.5 py-2 text-center`,children:`قیمت واحد`}),A&&(0,S.jsx)(`th`,{className:`border-l border-slate-300 px-2 py-2 text-center`,children:`بارکد ۲D`}),M&&(0,S.jsx)(`th`,{className:`px-2 py-2 text-center`,children:`شمارش فیزیکی`})]})}),(0,S.jsx)(`tbody`,{children:e.items.map((e,t)=>{let n=e.priceRial??(e.price>0?e.price*10:0),a=e.stock<=0,o=e.stock>0&&e.stock<10,s=[e.dimIn?`داخلی: ${e.dimIn}`:``,e.dimOut?`خارجی: ${e.dimOut}`:``,e.thickness?`ضخامت: ${e.thickness}`:``,e.material?`متریال: ${e.material}`:``].filter(Boolean).join(` | `);return(0,S.jsxs)(`tr`,{className:`border-b border-slate-300 ${a?`bg-rose-50/70`:o?`bg-amber-50/70`:t%2==1?`bg-slate-50`:`bg-white`}`,children:[(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2 py-2 text-center font-bold text-slate-700`,children:r(t+1)}),(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2.5 py-2 text-center font-mono text-[10.5px] font-black text-slate-900`,dir:`ltr`,children:e.code}),(0,S.jsxs)(`td`,{className:`border-l border-slate-300 px-3 py-2`,children:[(0,S.jsx)(`div`,{className:`font-black text-slate-900`,children:e.name}),s&&(0,S.jsx)(`div`,{className:`mt-0.5 text-[10px] text-slate-600`,children:s})]}),(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2 py-2 text-center font-bold text-slate-700`,children:e.shelf||`—`}),(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2.5 py-2 text-center text-sm font-black ${a?`text-rose-700`:o?`text-amber-700`:`text-emerald-700`}`,children:r(e.stock)}),(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2 py-2 text-center text-[11px] text-slate-700`,children:e.unit}),(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2 py-2 text-center`,children:a?(0,S.jsxs)(`span`,{className:`inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800`,children:[(0,S.jsx)(m,{className:`h-3 w-3`}),`ناموجود (۰)`]}):o?(0,S.jsxs)(`span`,{className:`inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800`,children:[(0,S.jsx)(m,{className:`h-3 w-3`}),`کم‌تعداد (<۱۰)`]}):(0,S.jsxs)(`span`,{className:`inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800`,children:[(0,S.jsx)(c,{className:`h-3 w-3`}),`موجود عادی`]})}),j&&(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2 py-2 text-center`,children:e.price>0?(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`text-[11px] font-black text-slate-900`,children:[i(e.price),` ت`]}),(0,S.jsxs)(`div`,{className:`text-[9.5px] text-slate-500`,children:[i(n),` ریال`]})]}):(0,S.jsx)(`span`,{className:`text-[10.5px] font-bold text-amber-700`,children:`استعلامی`})}),A&&(0,S.jsx)(`td`,{className:`border-l border-slate-300 px-2 py-1.5 text-center`,children:(0,S.jsx)(`div`,{className:`inline-flex rounded border border-slate-300 bg-white p-0.5`,children:(0,S.jsx)(ae,{value:g(e,`compact`),size:36})})}),M&&(0,S.jsx)(`td`,{className:`px-2 py-2 text-center`,children:(0,S.jsx)(`div`,{className:`mx-auto flex h-6 w-14 items-center justify-center rounded border border-dashed border-slate-400 bg-white text-[9.5px] text-slate-400`,children:(0,S.jsx)(_,{className:`h-3 w-3`})})})]},e.id)})})]})})]},e.category.id))}),U&&(0,S.jsxs)(`div`,{className:`mt-4 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-[11px] text-slate-700`,children:[(0,S.jsx)(`b`,{children:`توضیحات بایگانی انبار:`}),` `,U]}),(0,S.jsxs)(`div`,{className:`mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3`,children:[(0,S.jsxs)(`div`,{className:`flex min-h-[86px] flex-col justify-between rounded-xl border border-slate-400 bg-slate-50/50 p-3 text-center text-xs`,children:[(0,S.jsx)(`span`,{className:`border-b border-dashed border-slate-300 pb-1 font-black text-slate-900`,children:`تنظیم‌کننده و انباردار واحد`}),(0,S.jsx)(`span`,{className:`font-bold text-slate-800`,children:z}),(0,S.jsx)(`span`,{className:`text-[10px] text-slate-500`,children:`امضا و تاریخ تحویل به بایگانی`})]}),(0,S.jsxs)(`div`,{className:`flex min-h-[86px] flex-col justify-between rounded-xl border border-slate-400 bg-slate-50/50 p-3 text-center text-xs`,children:[(0,S.jsx)(`span`,{className:`border-b border-dashed border-slate-300 pb-1 font-black text-slate-900`,children:`سرپرست واحد / ممیز انبارگردانی`}),(0,S.jsx)(`span`,{className:`font-bold text-slate-800`,children:V}),(0,S.jsx)(`span`,{className:`text-[10px] text-slate-500`,children:`تأیید شمارش فیزیکی و امضا`})]}),(0,S.jsxs)(`div`,{className:`flex min-h-[86px] flex-col justify-between rounded-xl border border-slate-400 bg-slate-50/50 p-3 text-center text-xs`,children:[(0,S.jsx)(`span`,{className:`border-b border-dashed border-slate-300 pb-1 font-black text-slate-900`,children:`تأیید حسابداری و بایگانی کل هلدینگ`}),(0,S.jsx)(`span`,{className:`font-bold text-slate-800`,children:`واحد مالی و حسابداری هامون`}),(0,S.jsx)(`span`,{className:`text-[10px] text-slate-500`,children:`مهر رسمی و ثبت در زونکن بایگانی`})]})]})]})]})]})}export{C as default};