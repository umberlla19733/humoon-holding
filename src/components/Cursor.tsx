import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-none-fine");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHot(!!t?.closest("a, button, [data-hover]"));
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.classList.remove("cursor-none-fine");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* crosshair reticle */}
      <motion.div
        style={{ x: rx, y: ry }}
        className="pointer-events-none fixed left-0 top-0 z-[100]"
      >
        <motion.div
          animate={{
            scale: hot ? 1.9 : 1,
            rotate: hot ? 45 : 0,
            borderColor: hot ? "rgba(251,146,60,0.9)" : "rgba(249,115,22,0.5)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative -ml-4 -mt-4 h-8 w-8 rounded-full border"
          style={{ boxShadow: "0 0 18px rgba(249,115,22,0.15)" }}
        >
          <span className="absolute left-1/2 top-[-4px] h-[5px] w-px -translate-x-1/2 bg-orange-500/60" />
          <span className="absolute left-1/2 bottom-[-4px] h-[5px] w-px -translate-x-1/2 bg-orange-500/60" />
          <span className="absolute top-1/2 left-[-4px] w-[5px] h-px -translate-y-1/2 bg-orange-500/60" />
          <span className="absolute top-1/2 right-[-4px] w-[5px] h-px -translate-y-1/2 bg-orange-500/60" />
        </motion.div>
      </motion.div>
      {/* core dot */}
      <motion.div
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[100]"
      >
        <div className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-ember" />
      </motion.div>
    </>
  );
}
