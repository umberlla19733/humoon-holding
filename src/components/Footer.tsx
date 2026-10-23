import { ArrowUp, MapPin, Phone, Mail } from "lucide-react";
import Logo from "./Logo";

const QUICK = [
  { href: "#hero", label: "خانه" },
  { href: "#companies", label: "واحدهای هامون" },
  { href: "#stores", label: "سه فروشگاه" },
  { href: "#about", label: "درباره هامون" },
  { href: "#/admin", label: "پنل مدیریت انبار" },
];

const COMPANIES = [
  "تراشکاری و ماشینکاری CNC",
  "تولید کاسه نمد",
  "پکینگ و آب‌بندی هیدرولیک",
  "جک و سیلندر هیدرولیک",
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        {/* brand */}
        <div className="flex flex-col gap-5">
          <a href="#hero" className="flex items-center gap-3">
            <Logo size={44} withWord={false} />
            <span className="flex flex-col leading-tight">
              <span className="text-base font-extrabold text-steel">هلدینگ صنعتی هامون</span>
              <span className="tech-font text-[9px] tracking-[0.28em] text-faint" dir="ltr">
                HAMUN INDUSTRIAL
              </span>
            </span>
          </a>
          <p className="max-w-xs text-[13px] leading-7 text-mist">
            از تراشکاری صداقت (۱۳۶۷، زرین‌شهر) تا هلدینگ صنعتی هامون؛ قطعات دقیق،
            سیل‌ها و جک‌های هیدرولیکی که صنعت به آن‌ها اعتماد دارد.
          </p>
        </div>

        {/* quick links */}
        <div className="flex flex-col gap-4">
          <h4 className="tech-font text-xs font-bold tracking-[0.25em] text-faint">دسترسی سریع</h4>
          <ul className="flex flex-col gap-2.5">
            {QUICK.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group flex w-fit items-center gap-2 text-sm text-mist transition-colors hover:text-ember"
                >
                  <span className="h-px w-3 bg-faint transition-all group-hover:w-5 group-hover:bg-ember" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* companies */}
        <div className="flex flex-col gap-4">
          <h4 className="tech-font text-xs font-bold tracking-[0.25em] text-faint">زیرمجموعه‌ها</h4>
          <ul className="flex flex-col gap-2.5">
            {COMPANIES.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm text-mist">
                <span className="h-1.5 w-1.5 rounded-full bg-ember/60" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div className="flex flex-col gap-4">
          <h4 className="tech-font text-xs font-bold tracking-[0.25em] text-faint">اطلاعات تماس</h4>
          <ul className="flex flex-col gap-3 text-sm text-mist">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              اصفهان، زرین‌شهر، میدان امام حسین، بلوار بسیج — جنب تراشکاری صداقت
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-ember" />
              <a href="tel:03342220257" className="transition-colors hover:text-steel">
                ۰۳۳-۴۲۲۲ ۰۲۵۷ · ۰۹۱۳۱۳۴۱۲۳۸
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-ember" />
              <a href="mailto:info@hamun.co" className="tech-font transition-colors hover:text-steel">
                info@hamun.co
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <p className="text-[11px] text-faint">
            © ۱۴۰۳ هلدینگ صنعتی هامون — تمامی حقوق محفوظ است.
          </p>
          <a
            href="#hero"
            aria-label="بازگشت به بالا"
            className="group grid h-10 w-10 place-items-center rounded-full border border-line text-mist transition-all hover:border-ember hover:text-ember"
          >
            <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1" />
          </a>
        </div>
      </div>
    </footer>
  );
}
