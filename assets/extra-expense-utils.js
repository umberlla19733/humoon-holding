export function parseExpenseAmount(value) {
  const normalized = String(value).replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[\s,٬]/g, '');
  if (!/^\d+$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
export function extraExpenseRecords(records) {
  return (Array.isArray(records) ? records : []).filter(item => item && item.type === 'outflow' && item.category === 'extra_expense');
}
