interface LogoProps {
  size?: number;
  withWord?: boolean;
  dim?: boolean;
}

/** نشان خلاقانهٔ هامون — حرف «هـ» در قلب یک انجیرگیری مهره (دو فک نیمه باز، شاید در آینده قفل شود) */
export default function Logo({ size = 44, withWord = true, dim = false }: LogoProps) {
  const dotX = 15.4, dotY = 17.0;
  return (
    <span className="group relative inline-flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" className="shrink-0" aria-label="لوگوی هامون">
        <defs>
          <linearGradient id="lgEm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* نیم فک چپ مهره (صف سوخته، دنده‌دار) */}
        <g className="origin-[24px_24px] transition-transform duration-700 group-hover:-rotate-6">
          <path
            d="M24 8.5 C17.1 6.2 9.8 10.4 7.5 17.7 C5.2 25 8.6 33.2 15.4 36.9 L18.6 31.3 C13.2 28.9 10.8 22.8 13.2 17.4 C15.6 12 21.7 9.6 27.1 12 L24 8.5 Z"
            fill="none"
            stroke="url(#lgEm)"
            strokeWidth={4.6}
            strokeLinecap="round"
          />
          {/* دنده‌های فک چپ (پترن رزوه) */}
          {Array.from({ length: 5 }, (_, i) => {
            const a = (196 + i * 22) * (Math.PI / 180);
            const r1 = 17.6, r2 = 13.2;
            return (
              <line
                key={i}
                x1={24 + r1 * Math.cos(a)} y1={24 + r1 * Math.sin(a)}
                x2={24 + r2 * Math.cos(a)} y2={24 + r2 * Math.sin(a)}
                stroke="#8b95a5" strokeWidth={2.2} strokeLinecap="round" opacity={0.9}
              />
            );
          })}
        </g>

        {/* حرف «هـ» — بخیه گیجکه برند */}
        <path
          d="M31 14.5 C36.5 14.5 38.6 20.2 36 24.2 C34 28.4 27 28.4 24 24.2 C21 20 28 20 31.8 24.2 C36.5 28.4 26.5 37 18.4 34.2"
          fill="none"
          stroke="#e7edf4"
          strokeWidth={3.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={dotX} cy={dotY} r={2.1} fill="#f97316" />
        <circle cx={dotX} cy={dotY} r={4.6} fill="none" stroke="#f97316" strokeWidth={1} opacity={0.45} />

        {/* جرقه‌ها */}
        <line x1={39.6} y1={6.4} x2={42.6} y2={3.4} stroke="#fef3c7" strokeWidth={1.8} strokeLinecap="round" />
        <line x1={42.2} y1={11.8} x2={44.8} y2={11} stroke="#fb923c" strokeWidth={1.8} strokeLinecap="round" />
        <line x1={44.4} y1={17.4} x2={46.8} y2={18.4} stroke="#f97316" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
      </svg>

      {withWord && (
        <span className="flex flex-col leading-tight">
          <span className={`text-lg font-black ${dim ? "text-mist" : "text-steel"}`}>هامون</span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-3 bg-ember/80" />
            <span className="text-[9px] font-bold text-ember-2">تراشکاری صداقت</span>
          </span>
        </span>
      )}
    </span>
  );
}
