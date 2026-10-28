// Keep identifiers as strings: leading zeroes and all digits must survive formatting.
export const DEFAULT_ECONOMIC_NUMBER = '36705261100001';
export function normalizeEconomicNumber(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
  return /^\d{0,20}$/.test(normalized) ? normalized : null;
}
export function defaultEconomicNumber(value) {
  return value === undefined || value === null ? DEFAULT_ECONOMIC_NUMBER : (normalizeEconomicNumber(value) ?? DEFAULT_ECONOMIC_NUMBER);
}
// Do not add an unverified identifier retroactively to older issued documents.
export function invoiceEconomicNumber(invoice) {
  return normalizeEconomicNumber(invoice?.sellerEconomicNumber) || '';
}

// This optional preference is browser-local; it does not alter accounting data.
export function readEconomicDefault(storage) {
  try { return defaultEconomicNumber((storage ?? globalThis.localStorage)?.getItem('hamun.invoice.seller-economic.v1')); }
  catch { return DEFAULT_ECONOMIC_NUMBER; }
}
export function saveEconomicDefault(value, storage) {
  const normalized = normalizeEconomicNumber(value);
  if (normalized === null) return false;
  try { const target = storage ?? globalThis.localStorage; if (!target) return false; target.setItem('hamun.invoice.seller-economic.v1', normalized); return true; }
  catch { return false; }
}
