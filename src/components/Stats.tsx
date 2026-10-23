import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { Award, Users, Factory, BadgeCheck } from "lucide-react";
import { toFa } from "../utils/fa";

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, {
      duration: 2.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => c.stop();
  }, [inView, to]);

  return (
    <span ref={ref} dir="ltr" className="tabular-nums">
      {toFa(val)}
    </span>
  );
}

const STATS = [
  { Icon: Award, value: 27, suffix: "+", label: "سال تجربه صنعتی" },
  { Icon: Factory, value: 4, suffix: "", label: "شرکت و کارخانه تولیدی" },
  { Icon: Users, value: 140, suffix: "+", label: "کارشناس و تکنسین متخصص" },
  { Icon: BadgeCheck, value: 97, suffix: "٪", label: "رضایت مشتریان صنعتی" },
];

export default function Stats() {
  return (
    <section className="relative border-b border-line bg-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col items-center gap-3 border-line px-6 py-12 text-center md:py-16 [&:nth-child(odd)]:border-l lg:[&:not(:last-child)]:border-l"
          >
            <div className="grid h-12 w-12 place-items-center rounded-full border border-ember/30 bg-ember/10 text-ember transition-transform duration-500 group-hover:scale-110">
              <s.Icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <div className="flex items-baseline gap-1 text-4xl font-black text-steel md:text-5xl">
              <Counter to={s.value} />
              <span className="text-ember">{s.suffix}</span>
            </div>
            <span className="text-xs font-medium text-mist md:text-sm">{s.label}</span>
            <span className="absolute bottom-0 h-0.5 w-0 bg-ember transition-all duration-500 group-hover:w-full" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
