import { motion } from "framer-motion";
import { CheckCircle2, Award, ArrowLeft } from "lucide-react";
import SectionHead from "./SectionHead";
import { toFa } from "../utils/fa";

const POINTS = [
  "تولید و تعمیر انواع جک‌های هیدرولیک (چنگ، تراکتور و...)",
  "فروشگاه هامون: بلبرینگ، کاسه نمد، اورینگ، پولی و زنجیر صنعتی",
  "تراش قطعات بر اساس مدل و طرح پیشنهادی مشتریان",
  "بیش از نیم‌قرن تجربه — از ۱۳۶۷ تا امروز",
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-ink py-24 md:py-36">
      <div
        aria-hidden
        className="text-stroke-ghost pointer-events-none absolute -left-10 top-10 select-none text-[16vw] font-black leading-none opacity-25"
      >
        {toFa(1367)}
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        {/* image side */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative overflow-hidden rounded-2xl border border-line">
            <img
              src="/images/factory.jpg"
              alt="سالن تولید هلدینگ هامون"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          </div>

          {/* floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="absolute -bottom-6 right-6 flex items-center gap-3 rounded-xl border border-line bg-ink-2/95 px-5 py-4 shadow-2xl shadow-black/50 backdrop-blur-md md:-left-8 md:right-auto"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ember/15 text-ember">
              <Award className="h-5 w-5" />
            </span>
            <span className="flex flex-col">
              <span className="tech-font text-xs font-bold tracking-wider text-steel" dir="ltr">
                ISO 9001 : 2015
              </span>
              <span className="text-[11px] text-mist">گواهینامه مدیریت کیفیت</span>
            </span>
          </motion.div>

          {/* corner ticks */}
          <span className="absolute -top-3 -right-3 h-8 w-8 border-r-2 border-t-2 border-ember/60" />
          <span className="absolute -bottom-3 -left-3 hidden h-8 w-8 border-b-2 border-l-2 border-ember/60 md:block" />
        </motion.div>

        {/* text side */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 flex flex-col gap-6 lg:order-2"
        >
          <SectionHead
            index="۰۲"
            kicker="ABOUT HAMUN"
            title="میراث صداقتِ «صداقت»، آینده‌ی هامون"
          />
          <p className="text-sm leading-8 text-mist md:text-base md:leading-9">
            قصه‌ی ما سال ۱۳۶۷ در زرین‌شهر اصفهان آغاز شد؛ تراشکاری و فرزکاری صداقت با
            مدیریت آقای مهرعلی پاسند — تراش قطعات صنعتی و کشاورزی، تولید و تعمیر
            جک‌های هیدرولیک و پمپ‌ها. در کنار کارگاه، فروشگاه هامون تأمین بلبرینگ،
            کاسه نمد، پکینگ و اورینگ را بر عهده گرفت. امروز هلدینگ صنعتی هامون با
            چهار بازوی تراشکاری، کاسه نمد، پکینگ و آب‌بندی و سیلندرهای هیدرولیک، همان
            صداقت نسلِ اول را در مقیاس صنعتی ادامه می‌دهد.
          </p>

          <ul className="flex flex-col gap-3">
            {POINTS.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 text-sm font-medium text-steel md:text-[15px]"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-ember" strokeWidth={1.8} />
                {p}
              </motion.li>
            ))}
          </ul>

          <a
            href="#companies"
            className="group mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-steel transition-all hover:border-ember hover:text-ember"
          >
            آشنایی با زیرمجموعه‌ها
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
