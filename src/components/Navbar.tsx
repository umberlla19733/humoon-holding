import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PhoneCall } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { href: "#hero", label: "خانه" },
  { href: "#companies", label: "واحدها" },
  { href: "#stores", label: "فروشگاه‌ها" },
  { href: "#about", label: "درباره هامون" },
  { href: "#contact", label: "تماس" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1700px] items-center justify-between px-5 md:px-10">
        {/* logo */}
        <a href="#hero" className="flex items-center gap-3">
          <Logo size={46} withWord={false} />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-extrabold text-steel">هلدینگ صنعتی هامون</span>
            <span className="tech-font text-[9px] tracking-[0.28em] text-faint">
              HAMUN INDUSTRIAL HOLDING
            </span>
          </span>
        </a>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-mist transition-colors hover:bg-white/[0.05] hover:text-steel"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:02155667788"
            className="hidden items-center gap-2 rounded-full border border-ember/50 bg-ember/10 px-5 py-2.5 text-sm font-bold text-ember-2 transition-all hover:bg-ember hover:text-ink md:flex"
          >
            <PhoneCall className="h-4 w-4" />
            درخواست استعلام قیمت
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-steel lg:hidden"
            aria-label="منو"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden border-b border-line bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="rounded-lg px-4 py-3 text-sm font-bold text-mist transition-colors hover:bg-white/5 hover:text-ember-2"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
