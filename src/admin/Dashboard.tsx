import { motion } from "framer-motion";
import { Boxes, Warehouse, Banknote, MailWarning, TrendingUp, Sparkles, Mail, PackagePlus } from "lucide-react";
import { DivisionId, getDivision, useDivisionDB } from "../db/store";
import { toFa, fmtPrice, faRelative } from "../utils/fa";

export default function Dashboard({
  division, go,
}: {
  division: DivisionId;
  go: (t: "add" | "inbox" | "products") => void;
}) {
  const db = useDivisionDB(division);
  const d = getDivision(division);

  const totalStock = db.products.reduce((s, p) => s + p.stock, 0);
  const totalValue = db.products.reduce((s, p) => s + p.stock * p.price, 0);
  const unread = db.messages.filter((m) => !m.read).length;
  const lowStock = db.products.filter((p) => p.stock <= 5);

  const catCounts = d.categories.map((c) => ({
    ...c,
    n: db.products.filter((p) => p.category === c.id).length,
  }));
  const maxCat = Math.max(1, ...catCounts.map((c) => c.n));

  const valStr =
    totalValue >= 1e9 ? `${toFa((totalValue / 1e9).toFixed(1))} میلیارد` : `${toFa(Math.round(totalValue / 1e6))} میلیون`;

  const CARDS = [
    { Icon: Boxes, label: "اقلام این واحد", value: toFa(db.products.length), sub: `${toFa(d.categories.length)} دسته`, tone: "text-sky-300 bg-sky-400/10 border-sky-400/30" },
    { Icon: Warehouse, label: "مجموع موجودی", value: toFa(totalStock), sub: "واحد کالا", tone: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30" },
    { Icon: Banknote, label: "ارزش انبار", value: valStr, sub: "تومان", tone: "text-amber-300 bg-amber-400/10 border-amber-400/30" },
    { Icon: MailWarning, label: "پیام نو", value: toFa(unread), sub: "مکاتبات مشتریان", tone: "text-ember-2 bg-ember/10 border-ember/30" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className={`text-[10px] font-bold ${d.accent}`}>{d.tagline}</span>
          <h1 className="text-2xl font-black">داشبورد {d.short}</h1>
          <p className="mt-1 text-xs text-mist">دیتابیس مستقل این واحد — جدا از سایر فروشگاه‌ها</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => go("add")} className="flex items-center gap-2 rounded-full bg-ember px-4 py-2.5 text-xs font-black text-ink hover:bg-ember-2">
            <Sparkles className="h-4 w-4" /> ثبت سریع جنس
          </button>
          <button onClick={() => go("inbox")} className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-bold text-mist hover:border-ember hover:text-ember">
            <Mail className="h-4 w-4" /> مکاتبات
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {CARDS.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-line bg-ink-2 p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl border ${c.tone}`}>
              <c.Icon className="h-5 w-5" />
            </span>
            <div className="mt-4 text-2xl font-black">{c.value}</div>
            <div className="mt-1 text-xs font-bold text-steel/80">{c.label}</div>
            <div className="text-[10px] text-faint">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-ink-2 p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-black">
            <TrendingUp className="h-4 w-4 text-ember" /> توزیع دسته‌ها
          </h2>
          <div className="flex flex-col gap-4">
            {catCounts.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs font-bold text-mist">{c.short}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(c.n / maxCat) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.08 }}
                    className="h-full rounded-full bg-gradient-to-l from-ember to-ember-2" />
                </div>
                <span className="tech-font w-8 text-left text-xs font-black text-ember">{toFa(c.n)}</span>
              </div>
            ))}
          </div>

          {lowStock.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <span className="text-xs font-black text-amber-400">موجودی کم ({toFa(lowStock.length)} قلم)</span>
              <ul className="mt-2 flex flex-col gap-1">
                {lowStock.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-[11px] text-mist">
                    <span className="truncate">{p.name}</span>
                    <span className="font-black text-amber-400">{toFa(p.stock)} {p.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-ink-2 p-6">
            <h2 className="mb-4 flex items-center justify-between text-sm font-black">
              <span className="flex items-center gap-2"><PackagePlus className="h-4 w-4 text-ember" /> آخرین اقلام</span>
              <button onClick={() => go("products")} className="text-[10px] font-bold text-faint hover:text-ember">همه</button>
            </h2>
            <ul className="flex flex-col gap-2">
              {db.products.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-ink px-3 py-2">
                  {p.image && <img src={p.image} alt="" loading="lazy" className="h-9 w-9 rounded-lg border border-line object-cover" />}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-bold">{p.name}</span>
                    <span className="tech-font text-[9px] text-faint" dir="ltr">{p.code}</span>
                  </span>
                  <span className="mr-auto text-[10px] font-bold text-ember">{p.price ? `${fmtPrice(p.price)} ت` : "استعلامی"}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-ink-2 p-6">
            <h2 className="mb-4 flex items-center justify-between text-sm font-black">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-ember" /> آخرین مکاتبات</span>
              <button onClick={() => go("inbox")} className="text-[10px] font-bold text-faint hover:text-ember">صندوق</button>
            </h2>
            <ul className="flex flex-col gap-2">
              {db.messages.slice(0, 3).map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl border border-line bg-ink px-3 py-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-faint" : "bg-ember"}`} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-bold">{m.subject}</span>
                    <span className="truncate text-[10px] text-faint">{m.name}</span>
                  </span>
                  <span className="mr-auto shrink-0 text-[9px] text-faint">{faRelative(m.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
