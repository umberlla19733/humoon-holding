import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ChevronDown, MapPin, ArrowLeft } from "lucide-react";

const H_VH = 300;

const FACTS = [
  { n: "۰۱", title: "صادقانه پیروزی می‌شود", text: "حماسه‌ی صداقت، از یک دستگاه تراش در زرین‌شهر آغاز شد — ۱۳۶۷" },
  { n: "۰۲", title: "جک، قطعه، فروشگاه", text: "تولید و تعمیر جک هیدرولیک + فروشگاه هامون: بلبرینگ، کاسه نمد، پکینگ" },
  { n: "۰۳", title: "از صداقت تا هامون", text: "امروز: ۴ بازوی صنعتی — تراش، کاسه نمد، پکینگ و هیدرولیک" },
];

export default function HeroCinematic() {
  const [fact, setFact] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const fn = () => setIsDesktop(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 150, damping: 30, mass: 0.22 });

  /* پیچ فقط می‌چرخه — سنگین‌ترین مورد همین است */
  const boltRot = useTransform(sp, [0, 1], [0, 220]);
  const boltScale = useTransform(sp, [0, 0.5, 1], [1, 1.04, 1.1]);
  const introOp = useTransform(sp, [0, 0.05], [1, 0]);
  const introY = useTransform(sp, [0, 0.05], [0, -14]);
  const cueOp = useTransform(sp, [0, 0.04], [1, 0]);

  useMotionValueEvent(sp, "change", (v) => {
    const f = v < 0.4 ? 0 : v < 0.72 ? 1 : 2;
    setFact((p) => (p === f ? p : f));
  });

  /* اندازهٔ واکنش‌گرا بدون شکستن انیمیشن */
  const boltWidth = isDesktop ? "min(72vw, 780px)" : "min(92vw, 420px)";

  return (
    <section id="hero" ref={sectionRef} className="relative" style={{ height: `${H_VH}vh` }}>
      <div className="noise sticky top-0 flex h-screen flex-col overflow-hidden bg-ink">
        {/* بلوپرینت خیلی خفیف */}
        <div className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(125,165,220,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(125,165,220,0.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* === عنوان درشت هامون === */}
        <motion.div
          style={{ opacity: introOp, y: introY }}
          className="pointer-events-none relative z-30 mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-4 pt-24 text-center"
        >
          <span className="tech-font flex items-center gap-3 text-[10px] tracking-[0.4em] text-ember">
            <span className="h-px w-10 bg-ember/80" />
            HAMUN INDUSTRIAL HOLDING
            <span className="h-px w-10 bg-ember/80" />
          </span>
          <h1 className="text-[12vw] font-black leading-[1.02] tracking-tight text-steel md:text-[8.5vw]">
            هلدینگ هامون
          </h1>
          <p className="max-w-xl text-xs leading-6 text-mist md:text-sm">
            میراث تراشکاری صداقت — تراش، کاسه نمد، پکینگ و هیدرولیک
          </p>
          <motion.div style={{ opacity: cueOp }} className="mt-1 flex flex-col items-center gap-1 text-faint">
            <span className="tech-font text-[9px] tracking-[0.35em]">SCROLL ×2</span>
            <ChevronDown className="h-4 w-4 animate-bounce text-ember" />
          </motion.div>
        </motion.div>

        {/* === پیچ شناور بزرگ (فقط با اسکرول می‌چرخه) === */}
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-3">
          <motion.div
            style={{ rotate: boltRot, scale: boltScale, width: boltWidth }}
            className="relative"
          >
            <svg viewBox="0 0 900 380" className="w-full" role="img" aria-label="پیچ شناور بلوپرینتی">
              <defs>
                <linearGradient id="bolLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#9be9ff" />
                  <stop offset="100%" stopColor="#5e7fe0" />
                </linearGradient>
              </defs>

              {/* خط مرکز */}
              <line x1="30" y1="190" x2="870" y2="190" stroke="rgba(103,232,249,0.25)" strokeWidth="1" strokeDasharray="12 8" />

              {/* سر پیچ (سه‌بعدی، اسکلتی) */}
              <path d="M90 76 L218 76 L250 110 L250 270 L218 304 L90 304 L58 270 L58 110 Z"
                fill="none" stroke="url(#bolLine)" strokeWidth={4} />
              <path d="M90 76 L218 76 M90 304 L218 304" stroke="#7fdcff" strokeWidth={1.6} strokeDasharray="5 7" />
              <circle cx={154} cy={190} r={52} fill="none" stroke="#7fdcff" strokeWidth={2} strokeDasharray="4 6" />
              <circle cx={154} cy={190} r={64} fill="none" stroke="#5e7fe0" strokeWidth={1} strokeDasharray="2 5" />

              {/* واشر */}
              <rect x={250} y="94" width={32} height="192" fill="none" stroke="#8fd4ff" strokeWidth={3} />
              {/* ساقه */}
              <motion.path d="M282 126 L778 126 M282 254 L778 254"
                stroke="url(#bolLine)" strokeWidth={4} fill="none"
                style={{ pathLength: useTransform(sp, [0.06, 0.2], [0, 1]) }}
              />
              {/* رزوه‌ها */}
              {Array.from({ length: 8 }, (_, i) => 460 + i * 48).map((x) => (
                <motion.line key={x} x1={x} y1={134} x2={x - 26} y2={246}
                  stroke="#a9e0ff" strokeWidth={2.6}
                  style={{ pathLength: useTransform(sp, [0.1, 0.28], [0, 1]) }}
                />
              ))}
              {/* پخی نوک */}
              <motion.path d="M778 126 L816 178 L816 202 L778 254 Z"
                fill="none" stroke="url(#bolLine)" strokeWidth={3.4}
                style={{ pathLength: useTransform(sp, [0.16, 0.26], [0, 1]) }}
              />
              {/* اینسرت راهنما */}
              <line x1="60" y1="76" x2="60" y2="304" stroke="rgba(249,115,22,0.3)" strokeWidth={1} strokeDasharray="3 8" />
              <line x1="840" y1="76" x2="840" y2="304" stroke="rgba(249,115,22,0.3)" strokeWidth={1} strokeDasharray="3 8" />
            </svg>
          </motion.div>
        </div>

        {/* === فکت‌ها پایین === */}
        <div className="pointer-events-none relative z-30 mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 pb-12 text-center">
          <div className="relative flex min-h-24 w-full flex-col items-center">
            {FACTS.map((f, i) => (
              <motion.div
                key={f.n}
                initial={false}
                animate={{ opacity: fact === i ? 1 : 0, y: fact === i ? 0 : fact > i ? -10 : 10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-0 flex flex-col items-center gap-1"
              >
                <span className="tech-font text-[10px] tracking-[0.3em] text-ember">SEDAGHAT → HAMUN · {f.n}</span>
                <h2 className="text-2xl font-black leading-snug text-steel md:text-4xl">{f.title}</h2>
                <p className="max-w-lg text-[11px] leading-6 text-mist md:text-sm">{f.text}</p>
                {i === 2 && (
                  <span className="pointer-events-auto mt-1 flex gap-2">
                    <a href="#companies" className="flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 text-[11px] font-black text-ink transition-all hover:bg-ember-2">
                      شروع داستان <ArrowLeft className="h-3 w-3" />
                    </a>
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* پیل پیشرفت */}
          <div className="flex items-center gap-2">
            {FACTS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === fact ? "w-9 bg-ember" : i < fact ? "w-3.5 bg-ember/50" : "w-3.5 bg-line"}`} />
            ))}
          </div>
        </div>

        {/* کارت برند پس از دو اسکرول */}
        <motion.div
          style={{
            opacity: useTransform(sp, [0.78, 0.9], [0, 1]),
            y: useTransform(sp, [0.78, 0.9], [18, 0]),
          }}
          className="pointer-events-none absolute bottom-32 left-4 z-30 md:left-8"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-ember/40 bg-ink/85 px-4 py-3 backdrop-blur-md">
            <svg width={42} height={42} viewBox="0 0 48 48" aria-label="لوگوی هامون">
              <defs>
                <linearGradient id="lE" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <polygon points="24,5 40,14.7 40,33.3 24,43 8,33.3 8,14.7" fill="rgba(249,115,22,0.12)" stroke="url(#lE)" strokeWidth={3.6} strokeLinejoin="round" />
              <circle cx={24} cy={24} r={11} fill="none" stroke="#f97316" strokeWidth={3.4} strokeDasharray="3 4" />
              <path d="M31 14.5 C36.5 14.5 38.6 20.2 36 24.2 C34 28.4 27 28.4 24 24.2 C21 20 28 20 31.8 24.2 C36.5 28.4 26.5 37 18.4 34.2"
                fill="none" stroke="#e7edf4" strokeWidth={3.2} strokeLinecap="round" />
              <circle cx={15.4} cy={17} r={2} fill="#f97316" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black text-steel">هامون</span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-ember-2">
                <MapPin className="h-3 w-3" />
                صداقت · ۱۳۶۷ · زرین‌شهر
              </span>
            </div>
          </div>
        </motion.div>

        {/* پیل اسکرول کناری */}
        <div className="absolute left-1/2 top-1/2 z-30 hidden -translate-y-1/2 md:left-6 md:block">
          <div className="relative h-32 w-1 overflow-hidden rounded-full bg-line">
            <motion.div style={{ scaleY: sp }} className="absolute inset-0 origin-top rounded-full bg-ember" />
          </div>
        </div>
      </div>
    </section>
  );
}
