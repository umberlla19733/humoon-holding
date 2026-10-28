// A ten-digit input is a navigation hint only. It is never a credential.
export function normalizeBotIdentity(value) {
  if (typeof value !== 'string') return null;
  const digits=value.trim().replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
  return /^\d{10}$/.test(digits) ? digits : null;
}
export async function prepareBotPrivateLogin(identity,{fetcher=fetch,signal}={}) {
  const id=normalizeBotIdentity(identity);
  if (!id) throw new Error('شناسه معتبر نیست.');
  const tokenResponse=await fetcher('/admin-security.php?action=bot-token',{credentials:'same-origin',cache:'no-store',signal});
  if (!tokenResponse.ok) throw new Error('ورود امن در دسترس نیست.');
  const token=await tokenResponse.json();
  if (typeof token.csrf!=='string' || !token.csrf) throw new Error('دریافت مجوز ورود ناموفق بود.');
  const response=await fetcher('/admin-security.php?action=bot-identify',{method:'POST',credentials:'same-origin',cache:'no-store',signal,headers:{'Content-Type':'application/json','X-CSRF-Token':token.csrf},body:JSON.stringify({nationalId:id})});
  if (!response.ok) throw new Error('ورود امن آماده نشد؛ تنظیمات سرور و HTTPS را بررسی کنید.');
  return true;
}
