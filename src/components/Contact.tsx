import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock4 } from "lucide-react";
import SectionHead from "./SectionHead";
import { addMessage, DivisionId } from "../db/store";

const INFO = [
  { Icon: Phone, title: "تماس مستقیم", value: "۰۳۳-۴۲۲۲ ۰۲۵۷", sub: "همراه: ۰۹۱۳۱۳۴۱۲۳۸", href: "tel:03342220257" },
  { Icon: Mail, title: "ایمیل", value: "info@hamun.co", sub: "پاسخگویی در کمتر از ۲۴ ساعت", href: "mailto:info@hamun.co" },
  { Icon: MapPin, title: "دفتر مرکزی", value: "زرین‌شهر، میدان امام حسین، بلوار بسیج", sub: "جنب تراشکاری صداقت — اصفهان", href: "#contact" },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("تراشکاری و ماشینکاری CNC");
  const [body, setBody] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const div: DivisionId =
      subject.includes("پکینگ") || subject.includes("نمد") || subject.includes("اورینگ")
        ? "packing"
        : subject.includes("پیچ") || subject.includes("مهره")
        ? "fasteners"
        : "machining";
    addMessage(div, {
      name: name.trim() || "مشتری سایت",
      phone: phone.trim() || "-",
      subject: `درخواست: ${subject}`,
      body: body.trim() || `مشتری در حوزه‌ی «${subject}» درخواست استعلام دارد.`,
    });
    setSent(true);
    setName(""); setPhone(""); setBody("");
    window.setTimeout(() => setSent(false), 4200);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-ink-2 py-24 md:py-36">
      <div className="blueprint-bg pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[420px] w-[620px] rounded-full bg-ember/[0.05] blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        {/* right: info */}
        <div className="flex flex-col gap-8">
          <SectionHead
            index="۰۴"
            kicker="GET IN TOUCH"
            title="پروژه‌ی صنعتی دارید؟ در کنار شما هستیم."
            sub="نقشه یا نمونه‌ی قطعه را ارسال کنید؛ کارشناسان هامون در سریع‌ترین زمان بهترین راه‌حل تولید را پیشنهاد می‌دهند."
          />

          <div className="flex flex-col gap-4">
            {INFO.map((c, i) => (
              <motion.a
                key={c.title}
                href={c.href}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center gap-4 rounded-xl border border-line bg-ink/70 p-5 backdrop-blur-sm transition-all hover:border-ember/40 hover:bg-ink-3"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-ember/30 bg-ember/10 text-ember transition-all group-hover:bg-ember group-hover:text-ink">
                  <c.Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span className="flex flex-col">
                  <span className="text-xs text-faint">{c.title}</span>
                  <span className="text-base font-extrabold text-steel">{c.value}</span>
                  <span className="text-[11px] text-mist">{c.sub}</span>
                </span>
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-ink/70 px-5 py-4 text-xs text-mist">
            <Clock4 className="h-4 w-4 text-ember" />
            ساعت کاری کارخانه‌ها: شنبه تا پنجشنبه، ۷ صبح تا ۵ عصر
          </div>
        </div>

        {/* left: form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col gap-5 rounded-2xl border border-line bg-ink/80 p-7 backdrop-blur-md md:p-9"
        >
          <span className="absolute -top-3 right-8 rounded-full border border-ember/40 bg-ink px-3 py-1 text-[11px] font-bold text-ember">
            فرم درخواست استعلام
          </span>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-mist">نام و نام خانوادگی</span>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: مهندس رضایی"
                className="rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm text-steel outline-none transition-colors placeholder:text-faint focus:border-ember"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-mist">شماره تماس</span>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۰۹۱۲ - - - - - - -"
                className="rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm text-steel outline-none transition-colors placeholder:text-faint focus:border-ember"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-mist">حوزه‌ی درخواست</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm text-steel outline-none transition-colors focus:border-ember"
            >
              <option>تراشکاری و ماشینکاری CNC</option>
              <option>کاسه نمد</option>
              <option>پکینگ و آب‌بندی</option>
              <option>جک و سیلندر هیدرولیک</option>
              <option>سایر خدمات</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-mist">توضیحات پروژه</span>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="ابعاد، متریال، تعداد و شرایط کاری قطعه را بنویسید..."
              className="resize-none rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm leading-7 text-steel outline-none transition-colors placeholder:text-faint focus:border-ember"
            />
          </label>

          <button
            type="submit"
            className="group relative mt-1 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-ember px-8 py-4 text-sm font-black text-ink transition-all hover:bg-ember-2 hover:shadow-[0_0_36px_rgba(249,115,22,0.4)]"
          >
            <Send className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-0.5" />
            ارسال درخواست استعلام
          </button>

          <AnimatePresence>
            {sent && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                درخواست شما ثبت شد؛ کارشناسان ما به‌زودی تماس می‌گیرند.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  );
}
