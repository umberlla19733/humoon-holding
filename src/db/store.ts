import { useSyncExternalStore } from "react";

/* ================= Divisions ================= */
export type DivisionId = "packing" | "machining" | "fasteners";

export interface Category {
  id: string;
  label: string;
  short: string;
}

export interface Division {
  id: DivisionId;
  name: string;
  short: string;
  tagline: string;
  desc: string;
  accent: string;       // tailwind text color
  ring: string;         // border color
  chip: string;         // bg chip
  cover: string;
  pass: string;
  manager: string;
  categories: Category[];
  codePrefix: string;
}

export const DIVISIONS: Division[] = [
  {
    id: "packing",
    name: "فروشگاه پکینگ و آب‌بندی هامون",
    short: "پکینگ و آب‌بندی",
    tagline: "SEALING STORE",
    desc: "پکینگ هیدرولیک و پنوماتیک، کاسه نمد، اورینگ و واشرهای صنعتی — آب‌بندی مطمئن تا ۴۰۰ بار.",
    accent: "text-orange-400",
    ring: "border-orange-500/40",
    chip: "bg-orange-500/10",
    cover: "/images/div-packing.jpg",
    pass: "1111",
    manager: "مدیر واحد پکینگ",
    codePrefix: "PK",
    categories: [
      { id: "pk-hyd", label: "پکینگ هیدرولیک", short: "پکینگ هیدرولیک" },
      { id: "pk-felt", label: "کاسه نمد", short: "کاسه نمد" },
      { id: "pk-oring", label: "اورینگ و سییت", short: "اورینگ" },
      { id: "pk-gasket", label: "واشر و گردگیر", short: "واشر" },
    ],
  },
  {
    id: "machining",
    name: "فروشگاه تراشکاری و جک صنعتی هامون",
    short: "تراشکاری و جک",
    tagline: "MACHINING & HYDRAULICS",
    desc: "ساخت و تعمیر جک هیدرولیک، تراشکاری CNC قطعات صنعتی و کشاورزی، پمپ و شیرآلات هیدرولیک.",
    accent: "text-cyan-300",
    ring: "border-cyan-400/40",
    chip: "bg-cyan-400/10",
    cover: "/images/div-hydraulic.jpg",
    pass: "2222",
    manager: "مدیر واحد تراشکاری",
    codePrefix: "MC",
    categories: [
      { id: "mc-jack", label: "جک و سیلندر هیدرولیک", short: "جک هیدرولیک" },
      { id: "mc-cnc", label: "قطعات تراشکاری CNC", short: "قطعات CNC" },
      { id: "mc-pump", label: "پمپ و شیر هیدرولیک", short: "پمپ و شیر" },
      { id: "mc-repair", label: "تعمیر و بازسازی", short: "تعمیرات" },
    ],
  },
  {
    id: "fasteners",
    name: "فروشگاه پیچ و مهره و کارگاه هامون",
    short: "پیچ و مهره",
    tagline: "FASTENERS & WORKSHOP",
    desc: "انواع پیچ، مهره، واشر و رول‌بولت صنعتی — به‌همراه سفارش ساخت در کارگاه، حضوری و از راه دور.",
    accent: "text-amber-300",
    ring: "border-amber-400/40",
    chip: "bg-amber-400/10",
    cover: "/images/div-cnc.jpg",
    pass: "3333",
    manager: "مدیر واحد پیچ و مهره",
    codePrefix: "FS",
    categories: [
      { id: "fs-bolt", label: "پیچ صنعتی", short: "پیچ" },
      { id: "fs-nut", label: "مهره و واشر", short: "مهره" },
      { id: "fs-anchor", label: "رول‌بولت و خاص", short: "رول‌بولت" },
      { id: "fs-custom", label: "سفارش ساخت کارگاه", short: "سفارشی" },
    ],
  },
];

export const getDivision = (id: DivisionId) => DIVISIONS.find((d) => d.id === id)!;
export const catLabel = (div: DivisionId, cat: string) =>
  getDivision(div).categories.find((c) => c.id === cat)?.short ?? cat;

/* ================= Entities ================= */
export interface Product {
  id: string;
  division: DivisionId;
  name: string;
  code: string;
  category: string;
  image?: string;
  stock: number;
  unit: string;
  price: number;
  dimIn?: string;
  dimOut?: string;
  thickness?: string;
  pressure?: string;
  material?: string;
  shelf?: string;
  desc?: string;
  createdAt: number;
}

export interface Reply { text: string; at: number }

export interface Message {
  id: string;
  division: DivisionId;
  name: string;
  phone: string;
  subject: string;
  body: string;
  productId?: string;
  createdAt: number;
  read: boolean;
  starred: boolean;
  replies: Reply[];
}

export interface DivisionDB {
  products: Product[];
  messages: Message[];
}

type AllDB = Record<DivisionId, DivisionDB>;

/* ================= Seeds ================= */
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const day = 86400000;

const SEEDS: AllDB = {
  packing: {
    products: [
      { id: uid(), division: "packing", name: "ست پکینگ U-Cup پلی‌یورتان ۸۰", code: "HM-PK-1042", category: "pk-hyd", image: "/images/div-packing.jpg", stock: 96, unit: "ست", price: 420000, dimIn: "۶۳", dimOut: "۸۰", pressure: "۴۰۰", material: "TPU سختی ۹۳ Shore A", shelf: "C-21", desc: "۵ تکه، مناسب میله سیلندر، مقاوم در برابر سایش و روغن", createdAt: Date.now() - day },
      { id: uid(), division: "packing", name: "کاسه نمد سخت ۵۰×۷۰×۱۰", code: "HM-PK-2210", category: "pk-felt", image: "/images/div-felt.jpg", stock: 340, unit: "عدد", price: 85000, dimIn: "۵۰", dimOut: "۷۰", thickness: "۱۰", material: "نمد پشمی فشرده D0.45", shelf: "B-04", desc: "آب‌بندی محوری یاتاقان‌ها، برش دقیق", createdAt: Date.now() - day * 5 },
      { id: uid(), division: "packing", name: "اورینگ ویتون ۱۲۰×۳", code: "HM-PK-3317", category: "pk-oring", stock: 500, unit: "عدد", price: 35000, dimIn: "۱۲۰", thickness: "۳", pressure: "۲۱۰", material: "Viton FKM سبز", shelf: "C-08", desc: "مقاوم تا دمای ۲۴۰ درجه و مواد شیمیایی", createdAt: Date.now() - day * 3 },
      { id: uid(), division: "packing", name: "ست V-Packing پارچه‌ای ۱۰۰×۱۲۰", code: "HM-PK-4408", category: "pk-hyd", image: "/images/div-packing.jpg", stock: 40, unit: "ست", price: 780000, dimIn: "۱۰۰", dimOut: "۱۲۰", pressure: "۶۳۰", material: "نخ + NBR ضد سایش", shelf: "C-30", desc: "برای پرس‌های هیدرولیک سنگین، ۷ ردیفه", createdAt: Date.now() - day * 8 },
      { id: uid(), division: "packing", name: "گردگیر آکاردئونی ۶۳ میلی‌متر", code: "HM-PK-5501", category: "pk-gasket", stock: 70, unit: "عدد", price: 240000, dimIn: "۶۳", material: "پلی‌اورتان انعطاف‌پذیر", shelf: "D-12", desc: "محافظ میله در برابر گرد و غبار و ضربه", createdAt: Date.now() - day * 2 },
    ],
    messages: [
      { id: uid(), division: "packing", name: "شرکت بازرگانی رادمیل", phone: "02144332211", subject: "سفارش عمده کاسه نمد", body: "برای تولید سری ماهانه به ۲۰۰۰ عدد کاسه نمد سخت نیازمندیم. امکان قرارداد سالیانه هست؟", createdAt: Date.now() - day, read: false, starred: true, replies: [] },
      { id: uid(), division: "packing", name: "تعمیرگاه هیدرولیک آسیا", phone: "09351239876", subject: "موجودی پکینگ ۸۰", body: "پکینگ U-Cup سایز ۸۰ موجوده؟ فوری نیاز داریم.", createdAt: Date.now() - day * 2, read: true, starred: false, replies: [{ text: "درود، موجود است. فاکتور رسمی صادر شد.", at: Date.now() - day * 2 + 5400000 }] },
    ],
  },
  machining: {
    products: [
      { id: uid(), division: "machining", name: "سیلندر هیدرولیک دوکوشه ۶۳/۴۵", code: "HM-MC-1101", category: "mc-jack", image: "/images/div-hydraulic.jpg", stock: 12, unit: "عدد", price: 18500000, dimIn: "۶۳", dimOut: "۴۵", thickness: "۴۰۰", pressure: "۲۵۰", material: "ST52 + کروم سخت", shelf: "A-12", desc: "کورس ۴۰۰ میلی‌متر، پورت BSP، تست فشار ۳۷۵ بار", createdAt: Date.now() - day * 2 },
      { id: uid(), division: "machining", name: "جک هیدرولیک چنگ تراکتور ۱۰ تن", code: "HM-MC-2205", category: "mc-jack", image: "/images/div-hydraulic.jpg", stock: 6, unit: "عدد", price: 36500000, dimIn: "۸۰", dimOut: "۵۶", thickness: "۱۲۰۰", pressure: "۲۲۰", material: "لوله هونینگ H8", shelf: "D-01", desc: "مخصوص ماشین‌آلات کشاورزی و راه‌سازی، گارانتی ۱۸ ماهه", createdAt: Date.now() - day * 10 },
      { id: uid(), division: "machining", name: "پیستون تراش CNC آلومینیوم ۷۰۷۵", code: "HM-MC-3309", category: "mc-cnc", image: "/images/div-cnc.jpg", stock: 58, unit: "عدد", price: 1250000, dimIn: "۱۲", dimOut: "۶۰", material: "آلیاژ ۷۰۷۵ آنودایز", shelf: "A-03", desc: "تراش دقیق با تلرانس ±۰٫۰۱", createdAt: Date.now() - day * 7 },
      { id: uid(), division: "machining", name: "میله کروم سخت ۴۵ — شاخه ۳ متری", code: "HM-MC-4412", category: "mc-cnc", stock: 23, unit: "شاخه", price: 2900000, dimOut: "۴۵", material: "CK45 کروم ۹۰۰ HV", shelf: "A-08", desc: "آماده برش به سایز سفارشی", createdAt: Date.now() - day * 6 },
      { id: uid(), division: "machining", name: "پمپ دنده‌ای هیدرولیک ۲۰ سی‌سی", code: "HM-MC-5518", category: "mc-pump", stock: 9, unit: "عدد", price: 7400000, pressure: "۲۰۰", material: "بدنه آلومینیوم — شفت فولادی", shelf: "E-02", desc: "مناسب تراکتور و پرس‌های کوچک", createdAt: Date.now() - day * 4 },
      { id: uid(), division: "machining", name: "خدمات بازسازی جک هیدرولیک", code: "HM-MC-6600", category: "mc-repair", stock: 999, unit: "سرویس", price: 2500000, material: "تعویض کامل سیل‌ها + پولیش میله", shelf: "—", desc: "تست فشار و گارانتی ۶ ماهه پس از بازسازی", createdAt: Date.now() - day * 9 },
    ],
    messages: [
      { id: uid(), division: "machining", name: "مهندس کاظمی — فولاد البرز", phone: "09123334455", subject: "استعلام سیلندر ۶۳/۴۵", body: "به ۴ دستگاه سیلندر دوکوشه با کورس ۴۰۰ نیاز داریم. پیش‌فاکتور و زمان تحویل ارسال شود.", createdAt: Date.now() - 3600000 * 5, read: false, starred: true, replies: [] },
      { id: uid(), division: "machining", name: "کشاورزی برادران نوری", phone: "09131234567", subject: "تعمیر جک چنگ", body: "جک چنگ تراکتور روغن‌ریزی دارد، امکان بازسازی هست؟", createdAt: Date.now() - day * 3, read: false, starred: false, replies: [] },
    ],
  },
  fasteners: {
    products: [
      { id: uid(), division: "fasteners", name: "پیچ شش‌گوش M24×200 کلاس 8.8", code: "HM-FS-1001", category: "fs-bolt", image: "/images/div-cnc.jpg", stock: 480, unit: "عدد", price: 145000, dimOut: "۲۴", thickness: "۲۰۰", material: "فولاد 8.8 گالوانیزه", shelf: "F-01", desc: "استاندارد DIN 931 — رزوه متری", createdAt: Date.now() - day },
      { id: uid(), division: "fasteners", name: "مهره شش‌گوش M24 کلاس ۸", code: "HM-FS-2002", category: "fs-nut", stock: 1200, unit: "عدد", price: 38000, dimIn: "۲۴", material: "فولاد کلاس ۸", shelf: "F-04", desc: "DIN 934 — آبکاری زرد", createdAt: Date.now() - day * 2 },
      { id: uid(), division: "fasteners", name: "پیچ آلن استیل ۳۱۶ — M12×60", code: "HM-FS-3003", category: "fs-bolt", stock: 650, unit: "عدد", price: 62000, dimOut: "۱۲", thickness: "۶۰", material: "استنلس استیل A4-316", shelf: "F-09", desc: "ضد زنگ، مناسب محیط مرطوب و شیمیایی", createdAt: Date.now() - day * 4 },
      { id: uid(), division: "fasteners", name: "واشر فنری فولادی M16", code: "HM-FS-4004", category: "fs-nut", stock: 3000, unit: "عدد", price: 6500, dimIn: "۱۶", material: "فولاد فنری", shelf: "F-15", desc: "جلوگیری از شل شدن اتصال در ارتعاش", createdAt: Date.now() - day * 6 },
      { id: uid(), division: "fasteners", name: "رول‌بولت مکانیکی M16×150", code: "HM-FS-5005", category: "fs-anchor", stock: 240, unit: "عدد", price: 98000, dimOut: "۱۶", thickness: "۱۵۰", material: "فولاد گالوانیزه گرم", shelf: "G-02", desc: "مهاربندی سازه و ماشین‌آلات سنگین", createdAt: Date.now() - day * 3 },
      { id: uid(), division: "fasteners", name: "سفارش ساخت پیچ خاص (کارگاه)", code: "HM-FS-6006", category: "fs-custom", stock: 999, unit: "سفارش", price: 0, material: "طبق نقشه یا نمونه مشتری", shelf: "کارگاه", desc: "پذیرش حضوری و از راه دور — ارسال نقشه یا عکس نمونه کافی است", createdAt: Date.now() - day * 5 },
    ],
    messages: [
      { id: uid(), division: "fasteners", name: "پیمانکاری سازه گستر", phone: "09127778899", subject: "استعلام رول‌بولت M16", body: "به ۵۰۰ عدد رول‌بولت M16×150 برای پروژه نیاز داریم، قیمت عمده چقدر است؟", createdAt: Date.now() - 3600000 * 9, read: false, starred: false, replies: [] },
      { id: uid(), division: "fasteners", name: "آقای رحیمی", phone: "09139876543", subject: "ساخت پیچ خاص طبق نمونه", body: "یک پیچ قدیمی دارم که دیگر در بازار نیست، می‌توانید مشابهش را بتراشید؟ عکس دارم.", createdAt: Date.now() - day * 2, read: true, starred: true, replies: [] },
    ],
  },
};

/* ================= Three separate stores ================= */
const KEYS: Record<DivisionId, string> = {
  packing: "hamun.db.packing.v2",
  machining: "hamun.db.machining.v2",
  fasteners: "hamun.db.fasteners.v2",
};

function loadOne(id: DivisionId): DivisionDB {
  try {
    const raw = localStorage.getItem(KEYS[id]);
    if (raw) {
      const p = JSON.parse(raw) as DivisionDB;
      if (Array.isArray(p.products) && Array.isArray(p.messages)) return p;
    }
  } catch {
    /* ignore */
  }
  return SEEDS[id];
}

let dbs: AllDB = {
  packing: loadOne("packing"),
  machining: loadOne("machining"),
  fasteners: loadOne("fasteners"),
};

const listeners = new Set<() => void>();

function commit(id: DivisionId, next: DivisionDB) {
  dbs = { ...dbs, [id]: next };
  try {
    localStorage.setItem(KEYS[id], JSON.stringify(next));
  } catch {
    /* quota */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** کل سه دیتابیس */
export function useAllDB(): AllDB {
  return useSyncExternalStore(subscribe, () => dbs, () => dbs);
}

/** دیتابیس یک واحد */
export function useDivisionDB(id: DivisionId): DivisionDB {
  return useSyncExternalStore(subscribe, () => dbs[id], () => dbs[id]);
}

export const getAllDB = () => dbs;
export const allProducts = (): Product[] =>
  DIVISIONS.flatMap((d) => dbs[d.id].products);

/* ================= Mutations ================= */
export function genCode(div: DivisionId): string {
  const n = 1000 + Math.floor(Math.random() * 9000);
  return `HM-${getDivision(div).codePrefix}-${n}`;
}

export function addProduct(div: DivisionId, p: Omit<Product, "id" | "createdAt" | "division">) {
  const product: Product = { ...p, division: div, id: uid(), createdAt: Date.now() };
  commit(div, { ...dbs[div], products: [product, ...dbs[div].products] });
  return product;
}

export function updateProduct(div: DivisionId, id: string, patch: Partial<Product>) {
  commit(div, {
    ...dbs[div],
    products: dbs[div].products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export function removeProduct(div: DivisionId, id: string) {
  commit(div, { ...dbs[div], products: dbs[div].products.filter((p) => p.id !== id) });
}

export function adjustStock(div: DivisionId, id: string, delta: number) {
  commit(div, {
    ...dbs[div],
    products: dbs[div].products.map((p) =>
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    ),
  });
}

export function addMessage(
  div: DivisionId,
  m: Omit<Message, "id" | "createdAt" | "read" | "starred" | "replies" | "division">
) {
  const msg: Message = {
    ...m, division: div, id: uid(), createdAt: Date.now(),
    read: false, starred: false, replies: [],
  };
  commit(div, { ...dbs[div], messages: [msg, ...dbs[div].messages] });
  return msg;
}

export function patchMessage(div: DivisionId, id: string, patch: Partial<Message>) {
  commit(div, {
    ...dbs[div],
    messages: dbs[div].messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  });
}

export function replyToMessage(div: DivisionId, id: string, text: string) {
  commit(div, {
    ...dbs[div],
    messages: dbs[div].messages.map((m) =>
      m.id === id ? { ...m, read: true, replies: [...m.replies, { text, at: Date.now() }] } : m
    ),
  });
}
