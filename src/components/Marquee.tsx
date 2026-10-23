import { Cog, CircleDot, Layers, Cylinder, Disc3, Wrench, Gauge, Boxes } from "lucide-react";

const ITEMS = [
  { Icon: Cog, label: "تراشکاری و ماشینکاری CNC" },
  { Icon: CircleDot, label: "تولید کاسه نمد" },
  { Icon: Layers, label: "پکینگ و آب‌بندی هیدرولیک" },
  { Icon: Cylinder, label: "ساخت جک و سیلندر هیدرولیک" },
  { Icon: Disc3, label: "اورینگ و سییت صنعتی" },
  { Icon: Wrench, label: "تعمیر و بازسازی جک" },
  { Icon: Gauge, label: "تست فشار و کنترل کیفیت" },
  { Icon: Boxes, label: "قطعات صنعتی سفارشی" },
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-paused relative overflow-hidden border-y border-line bg-ink-2/80 py-5">
      <div className="animate-marquee flex w-max items-center">
        {row.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-8">
            <item.Icon className="h-5 w-5 text-ember" strokeWidth={1.6} />
            <span className="whitespace-nowrap text-sm font-bold text-mist">{item.label}</span>
            <span className="mr-6 h-1.5 w-1.5 rounded-full bg-ember/40" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
