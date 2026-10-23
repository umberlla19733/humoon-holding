import { motion } from "framer-motion";
import { ArrowLeft, Ship, Plane, FileCheck, ShieldCheck } from "lucide-react";

const WORDS = ["پیچ و مهره", "کاسه نمد", "پکینگ", "جک هیدرولیک", "اورینگ", "بلبرینگ"];
const ROUTES = [
  { Icon: Ship, label: "دریا — بنادر جنوبی" },
  { Icon: Plane, label: "لبه — آرسوتنوی داخلی" },
  { Icon: FileCheck, label: "نهادات و پروفرم" },
  { Icon: ShieldCheck, label: "گارانتی اصالت کالا" },
];

export default function TradeHero() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-2 py-16 md:py-20">
      {/* خیلی سبک — فقط یک گرید خفیف */}
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,165,220,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(125,165,220,0.06) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* عنوان گرافیکی درشت */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <span className="tech-font flex items-center gap-3 text-[10px] tracking-[0.35em] text-ember">
            <span className="h-px w-14 bg-ember/70" />
            GLOBAL TRADE
            <span className="h-px w-14 bg-ember/70" />
          </span>

          <h2 className="text-[8vw] font-black leading-[1.05] tracking-tight text-steel sm:text-6xl md:text-[5.4vw] lg:text-[4.6vw]">
            واردکننده و
            <span className="relative mx-2 inline-block">
              <span className="text-ember-2">صادرکننده</span>
              <svg viewBox="0 0 200 10" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none">
                <path d="M4 7 C 60 -2, 140 -2, 196 6" fill="none" stroke="#f97316" strokeWidth={3} strokeLinecap="round" />
              </svg>
            </span>
            انواع قطعات صنعتی
          </h2>

          <p className="max-w-2xl text-sm leading-7 text-mist md:text-base">
            از کوچک‌ترین اورینگ تا بزرگ‌ترین سیلندر — شبکهٔ تامین بین‌المللی هامون، هر قطعه را
            با استاندارد صداقتِ صداقت، سریع و مطمئن می‌رساند.
          </p>

          {/* کلمات شناور قطعات (سبک) */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {WORDS.map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                className="rounded-full border border-line bg-ink px-4 py-2 text-xs font-bold text-mist transition-colors hover:border-ember/50 hover:text-ember"
              >
                {w}
              </motion.span>
            ))}
          </div>

          {/* خطوط خدمات (سبک) */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {ROUTES.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.5 }}
                className="flex items-center gap-2 rounded-xl border border-line bg-ink/60 px-4 py-3 text-right"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ember/10 text-ember">
                  <r.Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold text-steel md:text-xs">{r.label}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA سبک */}
          <motion.a
            href="#contact"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="group mt-4 inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-black text-ink transition-all hover:bg-ember-2 hover:shadow-[0_0_28px_rgba(249,115,22,0.35)]"
          >
            استعلام خرید یا فروش
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
