import { motion } from "framer-motion";
import { Layers, Cog, Bolt, ArrowUpLeft } from "lucide-react";
import SectionHead from "./SectionHead";
import { DIVISIONS, DivisionId, useAllDB } from "../db/store";
import { toFa } from "../utils/fa";

const ICONS: Record<DivisionId, typeof Layers> = { packing: Layers, machining: Cog, fasteners: Bolt };

const TAGS: Record<DivisionId, string[]> = {
  packing: ["پکینگ هیدرولیک", "کاسه نمد", "اورینگ", "گردگیر"],
  machining: ["جک هیدرولیک", "تراش CNC", "پمپ و شیر", "بازسازی"],
  fasteners: ["پیچ صنعتی", "مهره و واشر", "رول‌بولت", "سفارش کارگاه"],
};

export default function Divisions() {
  const all = useAllDB();

  return (
    <section id="companies" className="relative overflow-hidden bg-ink-2 py-24 md:py-32">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-12 md:mb-16">
          <SectionHead
            index="۰۱"
            kicker="THREE DIVISIONS"
            title="هامون در سه بازوی صنعتی"
            sub="هر واحد با تیم، انبار و مدیریت مستقل — اما زیر یک سقف و با یک استاندارد: صداقت."
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {DIVISIONS.map((d, i) => {
            const Icon = ICONS[d.id];
            return (
              <motion.a
                key={d.id}
                href="#stores"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-line bg-ink-3"
              >
                <div className="absolute inset-0">
                  <img src={d.cover} alt={d.short} loading="lazy"
                    className="h-full w-full object-cover opacity-40 transition-all duration-500 group-hover:scale-105 group-hover:opacity-55" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
                </div>

                <span className="text-stroke-ghost pointer-events-none absolute -top-3 left-4 select-none text-8xl font-black opacity-50">
                  {toFa(`0${i + 1}`)}
                </span>

                <div className="relative mt-auto flex flex-col gap-4 p-7">
                  <div className="mb-auto flex items-start justify-between">
                    <span className={`grid h-12 w-12 place-items-center rounded-xl border ${d.ring} ${d.chip} ${d.accent} backdrop-blur-sm`}>
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="grid h-10 w-10 translate-y-2 place-items-center rounded-full border border-line bg-ink/60 text-mist opacity-0 backdrop-blur-sm transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpLeft className="h-4 w-4" />
                    </span>
                  </div>

                  <span className={`tech-font text-[9px] tracking-[0.3em] ${d.accent}`} dir="ltr">{d.tagline}</span>
                  <h3 className="text-2xl font-black text-steel">{d.short}</h3>
                  <p className="text-sm leading-7 text-mist">{d.desc}</p>

                  <div className="flex flex-wrap gap-2">
                    {TAGS[d.id].map((t) => (
                      <span key={t} className="rounded-full border border-line bg-ink/60 px-3 py-1 text-[11px] text-mist backdrop-blur-sm">
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="mt-1 flex items-center gap-2 border-t border-line pt-3 text-[11px] font-bold text-steel">
                    <span className={d.accent}>{toFa(all[d.id].products.length)} کالا</span>
                    <span className="text-faint">در انبار این واحد</span>
                  </span>
                </div>

                <span className="absolute bottom-0 right-0 h-[3px] w-0 bg-ember transition-all duration-500 group-hover:w-full" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
