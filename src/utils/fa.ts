export const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export const fmtPrice = (n: number) => toFa(n.toLocaleString("en-US"));

export function faRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "همین حالا";
  if (m < 60) return `${toFa(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${toFa(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  return `${toFa(d)} روز پیش`;
}
