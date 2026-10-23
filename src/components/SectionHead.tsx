import { motion } from "framer-motion";

interface Props {
  index: string;
  kicker: string;
  title: string;
  sub?: string;
}

export default function SectionHead({ index, kicker, title, sub }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <span className="tech-font text-xs font-semibold tracking-[0.25em] text-ember">
          {index}
        </span>
        <span className="h-px w-12 bg-ember/60" />
        <span className="tech-font text-[11px] tracking-[0.3em] text-faint">{kicker}</span>
      </div>
      <h2 className="max-w-2xl text-3xl font-black leading-snug text-steel md:text-5xl md:leading-[1.3]">
        {title}
      </h2>
      {sub && <p className="max-w-xl text-sm leading-7 text-mist md:text-base md:leading-8">{sub}</p>}
    </motion.div>
  );
}
