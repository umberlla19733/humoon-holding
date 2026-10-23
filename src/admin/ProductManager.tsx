import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Pencil, Trash2, Plus, Minus, Boxes, Camera, Wand2, Save, X,
  Sparkles, ScanSearch, ImagePlus, CheckCircle2,
} from "lucide-react";
import {
  DivisionId, getDivision, useDivisionDB, addProduct, updateProduct,
  removeProduct, adjustStock, genCode,
} from "../db/store";
import { processProductPhoto } from "./smartPhoto";
import { toFa, fmtPrice } from "../utils/fa";

const CHECKER = "repeating-conic-gradient(#1a222f 0% 25%, #10161f 0% 50%) 0 0 / 18px 18px";

/* ==================== TABLE ==================== */
export function ProductTable({
  division, onEdit, toast,
}: {
  division: DivisionId;
  onEdit: (id: string) => void;
  toast: (m: string) => void;
}) {
  const db = useDivisionDB(division);
  const d = getDivision(division);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const items = db.products.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    if (!q.trim()) return true;
    const s = q.trim();
    return p.name.includes(s) || p.code.toLowerCase().includes(s.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <span className={`text-[10px] font-bold ${d.accent}`}>{d.short}</span>
        <h1 className="text-2xl font-black">اجناس انبار</h1>
        <p className="mt-1 text-xs text-mist">{toFa(db.products.length)} قلم در دیتابیس این واحد</p>
      </header>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجو: نام یا کد..."
            className="w-full rounded-xl border border-line bg-ink-2 py-3 pl-4 pr-11 text-sm outline-none placeholder:text-faint focus:border-ember" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-xs font-bold text-mist outline-none focus:border-ember">
          <option value="all">همه دسته‌ها</option>
          {d.categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[720px] text-right">
          <thead>
            <tr className="border-b border-line bg-ink-2 text-[10px] text-faint">
              <th className="px-4 py-3 font-bold">کالا</th>
              <th className="px-4 py-3 font-bold">دسته</th>
              <th className="px-4 py-3 font-bold">قیمت</th>
              <th className="px-4 py-3 font-bold">موجودی</th>
              <th className="px-4 py-3 font-bold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className={`border-b border-line/60 hover:bg-white/[0.03] ${p.stock <= 5 ? "bg-amber-500/[0.04]" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt="" loading="lazy" className="h-11 w-11 rounded-lg border border-line object-cover" />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-ink-2"><Boxes className="h-4 w-4 text-faint" /></span>
                    )}
                    <span className="flex flex-col">
                      <span className="max-w-[220px] truncate text-xs font-bold">{p.name}</span>
                      <span className="tech-font text-[9px] text-faint" dir="ltr">{p.code}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-line bg-ink px-2.5 py-1 text-[10px] font-bold text-mist">
                    {d.categories.find((c) => c.id === p.category)?.short ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-black text-ember">{p.price ? fmtPrice(p.price) : "استعلامی"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => adjustStock(division, p.id, 1)} className="grid h-7 w-7 place-items-center rounded-md border border-line text-mist hover:border-emerald-400 hover:text-emerald-400" aria-label="+">
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className={`min-w-[44px] text-center text-xs font-black ${p.stock === 0 ? "text-red-400" : p.stock <= 5 ? "text-amber-400" : "text-steel"}`}>
                      {toFa(p.stock)}
                    </span>
                    <button onClick={() => adjustStock(division, p.id, -1)} className="grid h-7 w-7 place-items-center rounded-md border border-line text-mist hover:border-red-400 hover:text-red-400" aria-label="-">
                      <Minus className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onEdit(p.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-mist hover:border-ember hover:text-ember" aria-label="ویرایش">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {confirmId === p.id ? (
                      <button onClick={() => { removeProduct(division, p.id); setConfirmId(null); toast(`«${p.name}» حذف شد`); }}
                        className="rounded-lg bg-red-500 px-2.5 py-1.5 text-[10px] font-black text-ink">تأیید</button>
                    ) : (
                      <button onClick={() => { setConfirmId(p.id); window.setTimeout(() => setConfirmId(null), 2500); }}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-mist hover:border-red-400 hover:text-red-400" aria-label="حذف">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Boxes className="h-8 w-8 text-faint" />
            <p className="text-xs text-mist">موردی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== FORM ==================== */
const STAGES = [
  { Icon: Camera, label: "دریافت تصویر" },
  { Icon: ScanSearch, label: "حذف هوشمند پس‌زمینه" },
  { Icon: Wand2, label: "برش و بهبود کیفیت" },
  { Icon: Sparkles, label: "پیشنهاد دسته‌بندی" },
];

interface FormState {
  name: string; code: string; category: string; image: string;
  stock: string; unit: string; price: string;
  dimIn: string; dimOut: string; thickness: string; pressure: string;
  material: string; shelf: string; desc: string;
}

export function ProductForm({
  division, editingId, onDone,
}: {
  division: DivisionId;
  editingId: string | null;
  onDone: (name: string) => void;
}) {
  const db = useDivisionDB(division);
  const d = getDivision(division);
  const editing = editingId ? db.products.find((p) => p.id === editingId) : null;

  const [f, setF] = useState<FormState>(() =>
    editing
      ? {
          name: editing.name, code: editing.code, category: editing.category,
          image: editing.image ?? "", stock: String(editing.stock), unit: editing.unit,
          price: String(editing.price), dimIn: editing.dimIn ?? "", dimOut: editing.dimOut ?? "",
          thickness: editing.thickness ?? "", pressure: editing.pressure ?? "",
          material: editing.material ?? "", shelf: editing.shelf ?? "", desc: editing.desc ?? "",
        }
      : {
          name: "", code: genCode(division), category: d.categories[0].id, image: "",
          stock: "0", unit: "عدد", price: "", dimIn: "", dimOut: "", thickness: "",
          pressure: "", material: "", shelf: "", desc: "",
        }
  );

  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [stage, setStage] = useState(-1);
  const [removedRatio, setRemovedRatio] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const pickFile = (file: File | null) => {
    if (!file) return;
    setRawFile(file);
    setStage(-1);
    setRawPreview(URL.createObjectURL(file));
    set("image", "");
  };

  const runPipeline = async () => {
    if (!rawFile) return;
    setStage(0);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await wait(420); setStage(1);
    const result = await processProductPhoto(rawFile);
    await wait(520); setStage(2);
    await wait(460); setStage(3);
    set("image", result.dataUrl);
    setRemovedRatio(result.removedRatio);
    await wait(420);
    setStage(4);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: f.name.trim(), code: f.code.trim() || genCode(division),
      category: f.category, image: f.image || undefined,
      stock: Math.max(0, parseInt(f.stock) || 0),
      unit: f.unit, price: parseInt(f.price.replace(/[^\d]/g, "")) || 0,
      dimIn: f.dimIn || undefined, dimOut: f.dimOut || undefined,
      thickness: f.thickness || undefined, pressure: f.pressure || undefined,
      material: f.material || undefined, shelf: f.shelf || undefined, desc: f.desc || undefined,
    };
    if (!payload.name) return;
    if (editing) updateProduct(division, editing.id, payload);
    else addProduct(division, payload);
    onDone(payload.name);
  };

  const inp = "w-full rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm outline-none placeholder:text-faint focus:border-ember";
  const lbl = "text-[11px] font-bold text-mist";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className={`text-[10px] font-bold ${d.accent}`}>{d.short}</span>
          <h1 className="text-2xl font-black">{editing ? "ویرایش جنس" : "ثبت جنس جدید"}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-mist">
            <Sparkles className="h-3.5 w-3.5 text-ember" />
            عکس بگیرید — پس‌زمینه حذف، برش و کیفیت بهینه می‌شود
          </p>
        </div>
      </header>

      <form onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* photo */}
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-ink-2 p-5 xl:col-span-2">
          <span className={lbl}>تصویر محصول</span>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />

          {f.image ? (
            <div className="flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/30" style={{ background: CHECKER }}>
                <img src={f.image} alt="محصول" className="mx-auto max-h-64 object-contain" />
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[9px] font-black text-ink">
                  <CheckCircle2 className="h-3 w-3" /> جداسازی شد
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="rounded-lg border border-line bg-ink py-2">
                  <span className="block text-faint">پس‌زمینه حذف‌شده</span>
                  <span className="font-black text-emerald-400">{toFa(Math.round(removedRatio * 100))}٪</span>
                </div>
                <div className="rounded-lg border border-line bg-ink py-2">
                  <span className="block text-faint">خروجی</span>
                  <span className="font-black text-ember">WebP شفاف</span>
                </div>
              </div>
              <button type="button" onClick={() => { set("image", ""); setRawPreview(null); setStage(-1); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-xs font-bold text-mist hover:border-ember hover:text-ember">
                <X className="h-3.5 w-3.5" /> حذف تصویر
              </button>
            </div>
          ) : rawPreview ? (
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl border border-amber-500/30">
                <img src={rawPreview} alt="خام" className="mx-auto max-h-64 object-contain" />
              </div>
              {stage >= 0 && stage < 4 && (
                <div className="flex flex-col gap-2 rounded-xl border border-line bg-ink p-4">
                  {STAGES.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2.5 text-[11px] ${stage < i ? "opacity-35" : ""}`}>
                      {stage === i ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="grid h-6 w-6 place-items-center rounded-full border border-ember/50 bg-ember/10">
                          <s.Icon className="h-3 w-3 text-ember" />
                        </motion.span>
                      ) : (
                        <span className={`grid h-6 w-6 place-items-center rounded-full border ${stage > i ? "border-emerald-500/40 bg-emerald-500/10" : "border-line"}`}>
                          {stage > i ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <s.Icon className="h-3 w-3 text-faint" />}
                        </span>
                      )}
                      <span className={stage === i ? "font-bold text-steel" : "text-mist"}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {stage < 0 && (
                <button type="button" onClick={runPipeline}
                  className="flex items-center justify-center gap-2 rounded-xl bg-ember py-3 text-sm font-black text-ink hover:bg-ember-2">
                  <Wand2 className="h-4 w-4" /> پردازش هوشمند تصویر
                </button>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="group flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line bg-ink hover:border-ember/60">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-ember/30 bg-ember/10 text-ember transition-transform group-hover:scale-110">
                <ImagePlus className="h-6 w-6" />
              </span>
              <span className="text-xs font-bold text-mist">عکس بگیرید یا انتخاب کنید</span>
            </button>
          )}

          <AnimatePresence>
            {stage === 4 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-[11px] font-bold text-ember-2">
                <Sparkles className="h-4 w-4 shrink-0 text-ember" />
                تصویر آمادهٔ ثبت در دیتابیس {d.short} است
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* fields */}
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-ink-2 p-5 xl:col-span-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className={lbl}>نام کالا <b className="text-red-400">*</b></span>
              <input required value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="مثلاً: پیچ شش‌گوش M24×200" className={inp} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>کد (خودکار)</span>
              <input value={f.code} onChange={(e) => set("code", e.target.value)} className={`${inp} tech-font`} dir="ltr" />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>دسته‌بندی</span>
              <select value={f.category} onChange={(e) => set("category", e.target.value)} className={inp}>
                {d.categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>موجودی</span>
              <input value={f.stock} onChange={(e) => set("stock", e.target.value)} type="number" min={0} className={inp} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>واحد</span>
              <select value={f.unit} onChange={(e) => set("unit", e.target.value)} className={inp}>
                {["عدد", "ست", "شاخه", "متر", "کیلوگرم", "جعبه", "سرویس", "سفارش"].map((u) => <option key={u}>{u}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>قطر داخلی</span>
              <input value={f.dimIn} onChange={(e) => set("dimIn", e.target.value)} placeholder="۵۰" className={inp} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>قطر خارجی</span>
              <input value={f.dimOut} onChange={(e) => set("dimOut", e.target.value)} placeholder="۷۰" className={inp} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>ضخامت / طول</span>
              <input value={f.thickness} onChange={(e) => set("thickness", e.target.value)} placeholder="۱۰" className={inp} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>فشار (bar)</span>
              <input value={f.pressure} onChange={(e) => set("pressure", e.target.value)} placeholder="۲۵۰" className={inp} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>متریال</span>
              <input value={f.material} onChange={(e) => set("material", e.target.value)} placeholder="فولاد 8.8" className={inp} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>قیمت (تومان)</span>
              <input value={f.price} onChange={(e) => set("price", e.target.value)} inputMode="numeric" placeholder="۸۵۰۰۰" className={inp} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={lbl}>قفسه</span>
              <input value={f.shelf} onChange={(e) => set("shelf", e.target.value)} placeholder="B-04" className={inp} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={lbl}>توضیحات فنی</span>
            <textarea value={f.desc} onChange={(e) => set("desc", e.target.value)} rows={3}
              placeholder="استاندارد، شرایط کاری، نکات تکمیلی..." className={`${inp} resize-none leading-7`} />
          </label>

          <button type="submit" className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-ember py-3.5 text-sm font-black text-ink hover:bg-ember-2">
            <Save className="h-4 w-4" />
            {editing ? "ذخیره تغییرات" : `ثبت در دیتابیس ${d.short}`}
          </button>
        </div>
      </form>
    </div>
  );
}
