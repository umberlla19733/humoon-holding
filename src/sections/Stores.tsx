import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Warehouse, X, Send, CheckCircle2, Boxes, Layers, Cog, Bolt, Store,
} from "lucide-react";
import SectionHead from "../components/SectionHead";
import {
  DIVISIONS, DivisionId, Product, getDivision, useAllDB, addMessage,
} from "../db/store";
import { toFa, fmtPrice } from "../utils/fa";

const ICONS: Record<DivisionId, typeof Layers> = {
  packing: Layers,
  machining: Cog,
  fasteners: Bolt,
};

function stockState(stock: number) {
  if (stock > 20) return { label: "موجود", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (stock > 0) return { label: "محدود", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  return { label: "ناموجود", cls: "bg-red-500/15 text-red-400 border-red-500/30" };
}

function Chip({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <span className="rounded-md border border-line bg-ink-2 px-2 py-1 text-[10px] text-mist">
      <span className="text-faint">{k}: </span>
      <span className="font-bold text-steel">{v}</span>
    </span>
  );
}

/* ---------------- modal ---------------- */
function ProductModal({ p, onClose }: { p: Product; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const div = getDivision(p.division);
  const ss = stockState(p.stock);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage(p.division, {
      name: name || "مشتری سایت",
      phone: phone || "-",
      subject: `استعلام: ${p.name}`,
      body: `درخواست استعلام برای کالای ${p.code} (${p.name}) از ${div.short}.`,
      productId: p.id,
    });
    setSent(true);
    window.setTimeout(() => { setSent(false); onClose(); }, 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 210, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-line bg-ink-2 shadow-2xl shadow-black/60"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold ${div.accent}`}>{div.short}</span>
            <h3 className="text-lg font-black text-steel">{p.name}</h3>
            <span className="tech-font text-[10px] tracking-[0.2em] text-faint" dir="ltr">{p.code}</span>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-line text-mist hover:border-ember hover:text-ember" aria-label="بستن">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            {p.image ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <img src={p.image} alt={p.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-line">
                <Boxes className="h-10 w-10 text-faint" />
              </div>
            )}
            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${ss.cls}`}>
              <span className="text-xs font-bold">وضعیت موجودی</span>
              <span className="text-sm font-black">{ss.label} · {toFa(p.stock)} {p.unit}</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["دسته", div.categories.find((c) => c.id === p.category)?.short],
                ["قطر داخلی", p.dimIn ? `${p.dimIn} mm` : undefined],
                ["قطر خارجی", p.dimOut ? `${p.dimOut} mm` : undefined],
                ["ضخامت / طول", p.thickness],
                ["فشار کاری", p.pressure ? `${p.pressure} bar` : undefined],
                ["متریال", p.material],
                ["قفسه", p.shelf],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-ink px-3 py-2.5">
                  <span className="block text-[9px] text-faint">{k}</span>
                  <span className="block pt-0.5 text-xs font-bold text-steel">{v ?? "—"}</span>
                </div>
              ))}
            </div>
            {p.desc && <p className="text-xs leading-6 text-mist">{p.desc}</p>}
            <div className="flex items-baseline gap-2">
              {p.price > 0 ? (
                <>
                  <span className="text-2xl font-black text-ember">{fmtPrice(p.price)}</span>
                  <span className="text-xs text-mist">تومان / {p.unit}</span>
                </>
              ) : (
                <span className="text-lg font-black text-ember">استعلامی / بر اساس نقشه</span>
              )}
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-ember/30 bg-ember/5 p-4">
              <span className="text-xs font-black text-ember-2">ارسال استعلام به {div.short}</span>
              <div className="grid grid-cols-2 gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام شما"
                  className="rounded-lg border border-line bg-ink px-3 py-2 text-xs text-steel outline-none placeholder:text-faint focus:border-ember" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره تماس"
                  className="rounded-lg border border-line bg-ink px-3 py-2 text-xs text-steel outline-none placeholder:text-faint focus:border-ember" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-ember px-5 py-2.5 text-xs font-black text-ink hover:bg-ember-2">
                <Send className="h-3.5 w-3.5" /> ثبت استعلام
              </button>
              <AnimatePresence>
                {sent && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> برای مدیر {div.short} ارسال شد
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- main ---------------- */
export default function Stores() {
  const all = useAllDB();
  const [tab, setTab] = useState<DivisionId>("packing");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Product | null>(null);

  const div = getDivision(tab);
  const list = all[tab].products;

  const items = useMemo(() => {
    let r = list.slice().sort((a, b) => b.createdAt - a.createdAt);
    if (cat !== "all") r = r.filter((p) => p.category === cat);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((p) =>
        p.name.includes(q.trim()) ||
        p.code.toLowerCase().includes(s) ||
        (p.material ?? "").includes(q.trim()) ||
        (p.dimIn ?? "").includes(q.trim()) ||
        (p.dimOut ?? "").includes(q.trim())
      );
    }
    return r;
  }, [list, cat, q]);

  const switchTab = (id: DivisionId) => {
    setTab(id);
    setCat("all");
    setQ("");
  };

  return (
    <section id="stores" className="relative bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 md:mb-12">
          <SectionHead
            index="۰۲"
            kicker="THREE STORES"
            title="سه فروشگاه مستقل، یک هلدینگ"
            sub="هر واحد هامون انبار و مدیریت جداگانه‌ی خود را دارد — فروشگاه موردنظر را انتخاب کنید."
          />
        </div>

        {/* ===== store tabs ===== */}
        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
          {DIVISIONS.map((d) => {
            const Icon = ICONS[d.id];
            const on = tab === d.id;
            const count = all[d.id].products.length;
            return (
              <button
                key={d.id}
                onClick={() => switchTab(d.id)}
                className={`group relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-5 text-right transition-all duration-300 ${
                  on ? `${d.ring} bg-ink-3` : "border-line bg-ink-2 hover:border-mist/30"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${d.chip} ${d.accent}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${on ? `${d.ring} ${d.accent}` : "border-line text-faint"}`}>
                    {toFa(count)} کالا
                  </span>
                </span>
                <span className="text-base font-black text-steel">{d.short}</span>
                <span className="tech-font text-[9px] tracking-[0.25em] text-faint" dir="ltr">{d.tagline}</span>
                <span className="line-clamp-2 text-[11px] leading-5 text-mist">{d.desc}</span>
                {on && <span className="absolute bottom-0 right-0 h-[3px] w-full bg-ember" />}
              </button>
            );
          })}
        </div>

        {/* ===== filters ===== */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={`جست‌وجو در ${div.short}: نام، کد، سایز...`}
              className="w-full rounded-full border border-line bg-ink-2 py-3 pl-4 pr-11 text-sm text-steel outline-none placeholder:text-faint focus:border-ember"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", short: "همه" }, ...div.categories].map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  cat === c.id ? "border-ember bg-ember text-ink" : "border-line bg-ink-2 text-mist hover:text-steel"
                }`}>
                {c.short}
              </button>
            ))}
          </div>
        </div>

        {/* ===== grid ===== */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-center">
            <Boxes className="h-9 w-9 text-faint" />
            <p className="text-sm font-bold text-mist">موردی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => {
              const ss = stockState(p.stock);
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
                  onClick={() => setActive(p)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 text-right transition-all duration-300 hover:-translate-y-1 hover:border-ember/40"
                >
                  <div className="relative h-40 overflow-hidden bg-ink-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center"><Boxes className="h-9 w-9 text-faint" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-2 to-transparent" />
                    <span className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black ${ss.cls}`}>{ss.label}</span>
                    <span className="tech-font absolute left-3 top-3 rounded-md bg-ink/70 px-2 py-1 text-[9px] text-mist" dir="ltr">{p.code}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="text-base font-extrabold leading-6 text-steel">{p.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip k="⌀د" v={p.dimIn} />
                      <Chip k="⌀خ" v={p.dimOut} />
                      <Chip k="فشار" v={p.pressure} />
                      <Chip k="جنس" v={p.material} />
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                      <span className="flex items-baseline gap-1">
                        {p.price > 0 ? (
                          <>
                            <span className="text-lg font-black text-ember">{fmtPrice(p.price)}</span>
                            <span className="text-[10px] text-mist">ت/{p.unit}</span>
                          </>
                        ) : (
                          <span className="text-sm font-black text-ember">استعلامی</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-mist">
                        <Warehouse className="h-3.5 w-3.5" />
                        {toFa(p.stock)}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* admin hint */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-ink-2/60 px-5 py-4">
          <p className="flex items-center gap-2 text-xs text-mist">
            <Store className="h-4 w-4 text-ember" />
            هر فروشگاه دیتابیس و پنل مدیریت مستقل دارد — مدیران از یک درگاه با نقش خود وارد می‌شوند.
          </p>
          <a href="#/admin" className="rounded-full border border-ember/40 bg-ember/10 px-4 py-2 text-xs font-bold text-ember-2 transition-all hover:bg-ember hover:text-ink">
            ورود مدیران
          </a>
        </div>
      </div>

      <AnimatePresence>
        {active && <ProductModal p={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}
