import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  MessagesSquare,
  DraftingCompass,
  Factory,
  ShieldCheck,
  Truck,
} from "lucide-react";
import SectionHead from "./SectionHead";
import { toFa, pad2 } from "../utils/fa";

const STEPS = [
  {
    Icon: MessagesSquare,
    title: "مشاوره و استعلام",
    desc: "بررسی نقشه یا نمونه‌ی قطعه و ارائه‌ی پیش‌فاکتور شفاف در کمتر از ۲۴ ساعت",
  },
  {
    Icon: DraftingCompass,
    title: "طراحی و مهندسی",
    desc: "مدل‌سازی سه‌بعدی، تحلیل تنش و انتخاب متریال بهینه برای شرایط کاری شما",
  },
  {
    Icon: Factory,
    title: "تولید و ماشینکاری",
    desc: "تراشکاری CNC، ساخت سیل‌ها و مونتاژ نهایی در کارخانه‌های زیرمجموعه",
  },
  {
    Icon: ShieldCheck,
    title: "کنترل کیفیت",
    desc: "ابعادی با CMM، تست نشتی و فشار مطابق استانداردهای بین‌المللی",
  },
  {
    Icon: Truck,
    title: "تحویل و پشتیبانی",
    desc: "بسته‌بندی صنعتی، ارسال به سراسر کشور و گارانتی عملکرد واقعی",
  },
];

export default function Process() {
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.85", "end 0.5"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  return (
    <section id="process" className="relative bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 md:mb-20">
          <SectionHead
            index="۰۳"
            kicker="WORKFLOW"
            title="از استعلام تا تحویل، در پنج گام"
            sub="فرآیندی شفاف و قابل رهگیری؛ در هر مرحله دقیقاً می‌دانید سفارش شما کجاست."
          />
        </div>

        <div ref={lineRef} className="relative">
          {/* connecting line — desktop */}
          <div className="absolute right-0 left-0 top-[86px] hidden h-px bg-line lg:block">
            <motion.div
              style={{ scaleX, transformOrigin: "right" }}
              className="h-full w-full bg-ember shadow-[0_0_12px_rgba(249,115,22,0.6)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col gap-4 rounded-2xl border border-line bg-ink-2/60 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-ember/40 hover:bg-ink-3"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-ember/30 bg-ember/10 text-ember transition-all duration-500 group-hover:bg-ember group-hover:text-ink group-hover:shadow-[0_0_24px_rgba(249,115,22,0.45)]">
                    <s.Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className="tech-font text-sm font-bold text-faint transition-colors group-hover:text-ember">
                    {pad2(i + 1)}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-steel">{s.title}</h3>
                <p className="text-[13px] leading-6 text-mist">{s.desc}</p>
                <span className="tech-font absolute -top-3 right-6 rounded-full border border-line bg-ink px-2 py-0.5 text-[9px] tracking-widest text-faint">
                  {toFa(`مرحله ${i + 1}`)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
