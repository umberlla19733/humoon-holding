import { getAllDB, allProducts, DIVISIONS, DivisionId, Product, getDivision } from "../db/store";
import { toFa } from "../utils/fa";

export interface BotAnswer {
  text: string;
  products?: Product[];
  suggestions?: string[];
}

const DIV_KEYS: [string[], DivisionId][] = [
  [["پکینگ", "اورینگ", "کاسه", "نمد", "آب‌بند", "آببند", "سیل", "گردگیر", "واشر لاستیک"], "packing"],
  [["جک", "سیلندر", "هیدرولیک", "پمپ", "تراش", "cnc", "ماشینکاری", "میله", "کروم", "تعمیر"], "machining"],
  [["پیچ", "مهره", "بولت", "رول‌بولت", "رولبولت", "آلن", "واشر فنری", "فستنر"], "fasteners"],
];

const norm = (s: string) => s.replace(/ي/g, "ی").replace(/ك/g, "ک").trim();

function detectDivs(text: string): DivisionId[] {
  return DIV_KEYS.filter(([keys]) => keys.some((k) => text.includes(k))).map(([, d]) => d);
}

function search(text: string): Product[] {
  const divs = detectDivs(text);
  const nums = text.match(/\d+/g) ?? [];
  const faNums = nums.map((n) => toFa(n));

  const scored = allProducts().map((p) => {
    let score = 0;
    if (divs.includes(p.division)) score += 3;
    const hay = `${p.name} ${p.code} ${p.material ?? ""} ${p.desc ?? ""}`;
    text.split(/\s+/).forEach((w) => {
      if (w.length > 2 && hay.includes(w)) score += 2;
    });
    [...nums, ...faNums].forEach((n) => {
      if ((p.dimIn ?? "").includes(n) || (p.dimOut ?? "").includes(n) ||
          (p.thickness ?? "").includes(n) || (p.pressure ?? "").includes(n)) score += 3;
    });
    return { p, score };
  });

  return scored
    .filter((s) => s.score > (divs.length ? 2 : 1))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.p);
}

const stockLine = (p: Product) =>
  `${p.stock > 20 ? "موجود" : p.stock > 0 ? "موجودی محدود" : "ناموجود"} (${toFa(p.stock)} ${p.unit}) — ${getDivision(p.division).short}`;

export function botReply(raw: string): BotAnswer {
  const text = norm(raw);
  const db = getAllDB();

  if (/^(سلام|درود|هی|hi|hello|سلم)/i.test(text)) {
    return {
      text: "سلام! من راهنمای هوشمند هامون هستم و به هر سه فروشگاه (پکینگ، تراشکاری و جک، پیچ و مهره) وصلم. چه کالایی می‌خواهید؟",
      suggestions: ["فروشگاه پکینگ", "جک هیدرولیک", "پیچ M24", "ساعت کاری"],
    };
  }

  if (text.includes("ساعت") || text.includes("کجا") || text.includes("آدرس") || text.includes("تلفن") || text.includes("تماس")) {
    return {
      text: "ساعت کاری: شنبه تا پنجشنبه ۷ صبح تا ۵ عصر\nتلفن: ۰۳۳-۴۲۲۲۰۲۵۷ · همراه ۰۹۱۳۱۳۴۱۲۳۸\nآدرس: زرین‌شهر، میدان امام حسین، بلوار بسیج — جنب تراشکاری صداقت",
      suggestions: ["موجودی فروشگاه‌ها", "سفارش از راه دور"],
    };
  }

  if (text.includes("سفارش") || text.includes("خرید") || text.includes("استعلام") || text.includes("راه دور") || text.includes("حضوری")) {
    return {
      text: "کارگاه هامون هم حضوری و هم از راه دور سفارش می‌پذیرد: کافی است نقشه یا عکس نمونه‌ی قطعه را بفرستید. از بخش فروشگاه‌ها هم می‌توانید روی هر کالا دکمهٔ استعلام را بزنید تا مستقیم برای مدیر همان واحد ثبت شود.",
      suggestions: ["سفارش ساخت کارگاه", "فروشگاه پیچ و مهره"],
    };
  }

  if (text.includes("فروشگاه") || text.includes("بخش") || text.includes("واحد") || text.includes("لیست") || text.includes("چی دارید")) {
    const lines = DIVISIONS.map(
      (d) => `• ${d.short}: ${toFa(db[d.id].products.length)} قلم`
    ).join("\n");
    return {
      text: `هامون سه فروشگاه مستقل دارد:\n${lines}\nنام فروشگاه یا قطعه را بگویید تا دقیق راهنمایی کنم.`,
      products: DIVISIONS.map((d) => db[d.id].products[0]).filter(Boolean),
      suggestions: ["پکینگ ۸۰", "جک ۶۳", "پیچ M24"],
    };
  }

  if (text.includes("ارزان")) {
    const cheap = allProducts().filter((p) => p.price > 0).sort((a, b) => a.price - b.price).slice(0, 3);
    return { text: "اقتصادی‌ترین اقلام موجود:", products: cheap, suggestions: ["فروشگاه‌ها"] };
  }

  const found = search(text);
  if (found.length) {
    return {
      text: `این موارد را پیدا کردم:\n${found.map((p) => `• ${p.name} — ${stockLine(p)}`).join("\n")}`,
      products: found,
      suggestions: ["ثبت استعلام", "فروشگاه‌ها"],
    };
  }

  const divs = detectDivs(text);
  if (divs.length) {
    const d = getDivision(divs[0]);
    const items = db[divs[0]].products;
    return {
      text: `در ${d.short} در حال حاضر ${toFa(items.length)} قلم فعال داریم:`,
      products: items.slice(0, 3),
      suggestions: ["ثبت استعلام", "ساعت کاری"],
    };
  }

  return {
    text: "دقیق متوجه نشدم؛ می‌توانم دربارهٔ موجودی سه فروشگاه (پکینگ، تراشکاری و جک، پیچ و مهره)، قیمت‌ها و سفارش کارگاه کمکتان کنم. نام قطعه یا سایزش را بنویسید.",
    suggestions: ["فروشگاه‌ها", "پکینگ ۸۰", "پیچ M24", "ساعت کاری"],
  };
}
