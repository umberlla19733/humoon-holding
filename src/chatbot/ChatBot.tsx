import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Hexagon } from "lucide-react";
import { botReply, BotAnswer } from "./brain";
import { Product, getDivision } from "../db/store";
import { toFa, fmtPrice } from "../utils/fa";

interface Msg {
  id: number;
  role: "user" | "bot";
  text: string;
  products?: Product[];
}

let mid = 0;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: mid++,
      role: "bot",
      text: "سلام! من «راهنمای هامون» هستم و به دیتابیس زنده‌ی انبار وصلم. هر سؤالی درباره‌ی محصولات دارید بپرسید.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sug, setSug] = useState<string[]>(["موجودی انبار", "پکینگ ۸۰", "کاسه نمد", "ساعت کاری"]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { id: mid++, role: "user", text }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const ans: BotAnswer = botReply(text);
      setMsgs((m) => [...m, { id: mid++, role: "bot", text: ans.text, products: ans.products }]);
      if (ans.suggestions) setSug(ans.suggestions);
      setTyping(false);
    }, 750 + Math.random() * 650);
  };

  const goProduct = () => {
    setOpen(false);
    document.querySelector("#stores")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 16 }}
        onClick={() => setOpen(!open)}
        aria-label="ربات راهنمای هامون"
        className="fixed bottom-6 left-6 z-[80] grid h-14 w-14 place-items-center rounded-full border border-ember/50 bg-ink-2 text-ember shadow-[0_10px_36px_rgba(249,115,22,0.25)] backdrop-blur-md transition-all hover:bg-ember hover:text-ink"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-ink bg-emerald-400" />
      </motion.button>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="fixed bottom-24 left-4 z-[85] flex h-[540px] max-h-[72vh] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-2xl shadow-black/70 md:left-6"
          >
            {/* header */}
            <div className="flex items-center gap-3 border-b border-line bg-ink px-4 py-3">
              <span className="relative grid h-10 w-10 place-items-center">
                <Hexagon className="absolute inset-0 h-10 w-10 text-ember" strokeWidth={1.4} />
                <Bot className="relative h-5 w-5 text-ember" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-black text-steel">راهنمای هوشمند هامون</span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  متصل به دیتابیس انبار — پاسخ فوری
                </span>
              </div>
              <Sparkles className="mr-auto h-4 w-4 text-faint" />
            </div>

            {/* messages */}
            <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col gap-2 ${m.role === "user" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[86%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[12.5px] leading-6 ${
                      m.role === "user"
                        ? "rounded-tl-sm bg-ember text-ink font-bold"
                        : "rounded-tr-sm border border-line bg-ink text-steel"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* product cards */}
                  {m.products?.map((p) => (
                    <button
                      key={p.id}
                      onClick={goProduct}
                      className="flex w-[86%] items-center gap-3 rounded-xl border border-line bg-ink px-3 py-2 text-right transition-all hover:border-ember/50"
                    >
                      {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded-lg border border-line object-cover" />}
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[11px] font-bold text-steel">{p.name}</span>
                        <span className="text-[9.5px] text-faint">
                          {getDivision(p.division).short} · {toFa(p.stock)} {p.unit}
                          {p.price > 0 ? ` · ${fmtPrice(p.price)} ت` : " · استعلامی"}
                        </span>
                      </span>
                      <span className={`mr-auto rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        p.stock > 20 ? "bg-emerald-500/15 text-emerald-400" : p.stock > 0 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"
                      }`}>
                        {p.stock > 0 ? "موجود" : "ناموجود"}
                      </span>
                    </button>
                  ))}
                </motion.div>
              ))}

              {typing && (
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tr-sm border border-line bg-ink px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        className="h-1.5 w-1.5 rounded-full bg-ember"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* suggestions */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {sug.map((s) => (
                <button key={s} onClick={() => ask(s)}
                  className="shrink-0 rounded-full border border-line bg-ink px-3 py-1.5 text-[10px] font-bold text-mist transition-colors hover:border-ember/50 hover:text-ember">
                  {s}
                </button>
              ))}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => { e.preventDefault(); ask(input); }}
              className="flex items-center gap-2 border-t border-line bg-ink p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="مثلاً: کاسه نمد ۵۰ موجوده؟"
                className="flex-1 rounded-full border border-line bg-ink-2 px-4 py-2.5 text-xs text-steel outline-none placeholder:text-faint focus:border-ember"
              />
              <button type="submit" aria-label="ارسال"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember text-ink transition-all hover:bg-ember-2">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
