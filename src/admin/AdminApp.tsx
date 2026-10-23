import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Boxes, PackagePlus, Mail, Globe, LogOut, Lock,
  CheckCircle2, Sparkles, Layers, Cog, Bolt, ShieldCheck, ArrowRight,
} from "lucide-react";
import { DIVISIONS, DivisionId, getDivision, useAllDB } from "../db/store";
import { toFa } from "../utils/fa";
import Logo from "../components/Logo";
import Dashboard from "./Dashboard";
import { ProductTable, ProductForm } from "./ProductManager";
import Inbox from "./Inbox";

type Tab = "dash" | "products" | "add" | "inbox";
type Role = DivisionId | "master";

const ICONS: Record<DivisionId, typeof Layers> = { packing: Layers, machining: Cog, fasteners: Bolt };
const MASTER_PASS = "1403";
const SKEY = "hamun.admin.role";

export default function AdminApp() {
  const all = useAllDB();
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem(SKEY) as Role) || null);
  const [picking, setPicking] = useState<Role | null>(null);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  const [division, setDivision] = useState<DivisionId>("packing");
  const [tab, setTab] = useState<Tab>("dash");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = "پنل مدیریت هامون";
    return () => { document.title = "هلدینگ صنعتی هامون | تراشکاری، کاسه نمد و پکینگ"; };
  }, []);

  useEffect(() => {
    if (role && role !== "master") setDivision(role);
  }, [role]);

  const say = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2500);
  };

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picking) return;
    const expect = picking === "master" ? MASTER_PASS : getDivision(picking).pass;
    if (pass.trim() === expect) {
      localStorage.setItem(SKEY, picking);
      setRole(picking);
      setPass("");
      setPicking(null);
    } else {
      setErr(true);
      window.setTimeout(() => setErr(false), 1500);
    }
  };

  /* ================= LOGIN GATE ================= */
  if (!role) {
    return (
      <div className="noise relative flex min-h-screen items-center justify-center bg-ink px-4 py-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,165,220,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(125,165,220,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}>
        <div className="w-full max-w-3xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <Logo size={56} withWord={false} />
            <h1 className="text-xl font-black text-steel">درگاه مدیریت هلدینگ هامون</h1>
            <p className="text-xs text-mist">هر واحد با نقش و دیتابیس مستقل خود وارد می‌شود</p>
          </div>

          <AnimatePresence mode="wait">
            {!picking ? (
              <motion.div key="pick" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {DIVISIONS.map((d) => {
                  const Icon = ICONS[d.id];
                  return (
                    <button key={d.id} onClick={() => setPicking(d.id)}
                      className={`group flex flex-col items-start gap-3 rounded-2xl border bg-ink-2 p-5 text-right transition-all hover:-translate-y-1 ${d.ring} hover:bg-ink-3`}>
                      <span className={`grid h-12 w-12 place-items-center rounded-xl ${d.chip} ${d.accent}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-black text-steel">{d.short}</span>
                      <span className="tech-font text-[8px] tracking-[0.25em] text-faint" dir="ltr">{d.tagline}</span>
                      <span className="text-[10px] text-mist">{toFa(all[d.id].products.length)} کالا · {toFa(all[d.id].messages.filter((m) => !m.read).length)} پیام نو</span>
                      <span className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${d.accent}`}>
                        ورود <ArrowRight className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                      </span>
                    </button>
                  );
                })}
                <button onClick={() => setPicking("master")}
                  className="group col-span-full flex items-center justify-center gap-2 rounded-2xl border border-line bg-ink-2 p-4 text-xs font-bold text-mist transition-all hover:border-ember/50 hover:text-ember">
                  <ShieldCheck className="h-4 w-4" />
                  ورود مدیر کل هلدینگ (دسترسی به هر سه واحد)
                </button>
              </motion.div>
            ) : (
              <motion.form key="pass" onSubmit={tryLogin} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mx-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-line bg-ink-2 p-7">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-ember/10 text-ember">
                  <Lock className="h-5 w-5" />
                </span>
                <h2 className="text-center text-sm font-black text-steel">
                  {picking === "master" ? "مدیر کل هلدینگ" : getDivision(picking).manager}
                </h2>
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus
                  placeholder="رمز عبور"
                  className={`rounded-xl border bg-ink px-4 py-3 text-center text-sm tracking-[0.4em] outline-none ${
                    err ? "border-red-500 text-red-400" : "border-line text-steel focus:border-ember"
                  }`} />
                <button type="submit" className="rounded-xl bg-ember py-3 text-sm font-black text-ink hover:bg-ember-2">
                  ورود به پنل
                </button>
                <p className="text-center text-[10px] text-faint">
                  رمز دمو: {picking === "master" ? "۱۴۰۳" : toFa(getDivision(picking).pass)}
                </p>
                <button type="button" onClick={() => { setPicking(null); setPass(""); }}
                  className="text-center text-[10px] text-mist hover:text-ember">بازگشت به انتخاب واحد</button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <button onClick={() => (window.location.hash = "")} className="text-[11px] text-faint hover:text-ember">
              ← بازگشت به سایت
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= PANEL ================= */
  const d = getDivision(division);
  const unread = all[division].messages.filter((m) => !m.read).length;
  const DIcon = ICONS[division];

  const NAV: { id: Tab; label: string; Icon: typeof Boxes; badge?: React.ReactNode }[] = [
    { id: "dash", label: "داشبورد", Icon: LayoutDashboard },
    { id: "products", label: "اجناس", Icon: Boxes, badge: <span className="rounded-full bg-white/5 px-1.5 text-[9px]">{toFa(all[division].products.length)}</span> },
    { id: "add", label: "ثبت جنس", Icon: PackagePlus, badge: <span className="flex items-center gap-0.5 rounded-full border border-ember/40 bg-ember/10 px-1.5 text-[8px] text-ember"><Sparkles className="h-2.5 w-2.5" />AI</span> },
    { id: "inbox", label: "مکاتبات", Icon: Mail, badge: unread ? <span className="rounded-full bg-ember px-1.5 text-[9px] font-black text-ink">{toFa(unread)}</span> : undefined },
  ];

  return (
    <div className="flex min-h-screen bg-ink text-steel">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-l border-line bg-ink-2 md:w-60">
        <button onClick={() => (window.location.hash = "")} className="flex items-center gap-3 border-b border-line px-4 py-4">
          <Logo size={38} withWord={false} />
          <span className="hidden flex-col leading-tight text-right md:flex">
            <span className="text-sm font-extrabold">پنل هامون</span>
            <span className={`text-[9px] font-bold ${d.accent}`}>{d.short}</span>
          </span>
        </button>

        {/* division switch for master */}
        {role === "master" && (
          <div className="hidden flex-col gap-1 border-b border-line p-3 md:flex">
            <span className="mb-1 text-[9px] font-bold text-faint">واحد فعال</span>
            {DIVISIONS.map((x) => (
              <button key={x.id} onClick={() => { setDivision(x.id); setTab("dash"); }}
                className={`rounded-lg px-3 py-2 text-right text-[11px] font-bold transition-colors ${
                  division === x.id ? `${x.chip} ${x.accent}` : "text-mist hover:bg-white/5"
                }`}>
                {x.short}
              </button>
            ))}
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 p-2 md:p-3">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => { setTab(n.id); if (n.id === "add") setEditingId(null); }}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                tab === n.id ? "bg-ember text-ink" : "text-mist hover:bg-white/5 hover:text-steel"
              }`}>
              <n.Icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:block">{n.label}</span>
              {n.badge && <span className="mr-auto hidden md:block">{n.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-line p-2 md:p-3">
          <span className="hidden items-center gap-2 px-3 py-1 text-[9px] text-faint md:flex">
            <DIcon className="h-3 w-3" />
            {role === "master" ? "مدیر کل" : d.manager}
          </span>
          <button onClick={() => (window.location.hash = "")}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-mist hover:bg-white/5">
            <Globe className="h-4 w-4 shrink-0" /><span className="hidden md:block">مشاهده سایت</span>
          </button>
          <button onClick={() => { localStorage.removeItem(SKEY); setRole(null); }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10">
            <LogOut className="h-4 w-4 shrink-0" /><span className="hidden md:block">خروج</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab + division + (editingId ?? "")} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {tab === "dash" && <Dashboard division={division} go={setTab} />}
            {tab === "products" && <ProductTable division={division} onEdit={(id) => { setEditingId(id); setTab("add"); }} toast={say} />}
            {tab === "add" && <ProductForm division={division} editingId={editingId} onDone={(n) => { say(`«${n}» ثبت شد`); setTab("products"); }} />}
            {tab === "inbox" && <Inbox division={division} toast={say} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-[99] flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-500/40 bg-ink-2 px-5 py-3 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
