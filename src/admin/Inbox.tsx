import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MailOpen, Mail, Send, Package, CornerDownLeft, Inbox as InboxIcon } from "lucide-react";
import { DivisionId, getDivision, Message, useDivisionDB, patchMessage, replyToMessage } from "../db/store";
import { faRelative } from "../utils/fa";

type Filter = "all" | "unread" | "starred";

export default function Inbox({ division, toast }: { division: DivisionId; toast: (m: string) => void }) {
  const db = useDivisionDB(division);
  const d = getDivision(division);
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const items = useMemo(() => {
    let list = db.messages.slice().sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "unread") list = list.filter((m) => !m.read);
    if (filter === "starred") list = list.filter((m) => m.starred);
    return list;
  }, [db.messages, filter]);

  const active = db.messages.find((m) => m.id === activeId) ?? null;
  const activeProduct = active?.productId ? db.products.find((p) => p.id === active.productId) : null;

  const openMsg = (m: Message) => {
    setActiveId(m.id);
    if (!m.read) patchMessage(division, m.id, { read: true });
  };

  const sendReply = () => {
    if (!active || !reply.trim()) return;
    replyToMessage(division, active.id, reply.trim());
    setReply("");
    toast("پاسخ ثبت شد");
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <span className={`text-[10px] font-bold ${d.accent}`}>{d.short}</span>
        <h1 className="text-2xl font-black">مکاتبات مشتریان</h1>
        <p className="mt-1 text-xs text-mist">استعلام‌های این فروشگاه — مستقل از سایر واحدها</p>
      </header>

      <div className="flex gap-2">
        {([["all", "همه"], ["unread", "خوانده‌نشده"], ["starred", "ستاره‌دار"]] as [Filter, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
              filter === v ? "border-ember bg-ember text-ink" : "border-line bg-ink-2 text-mist hover:text-steel"
            }`}>{l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-2 lg:col-span-2">
          {items.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16">
              <InboxIcon className="h-8 w-8 text-faint" />
              <p className="text-xs text-mist">پیامی نیست</p>
            </div>
          )}
          {items.map((m) => (
            <button key={m.id} onClick={() => openMsg(m)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-right transition-all ${
                activeId === m.id ? "border-ember/50 bg-ember/5" : "border-line bg-ink-2 hover:border-mist/40"
              }`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-faint/50" : "bg-ember"}`} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-xs ${m.read ? "font-medium text-mist" : "font-black text-steel"}`}>{m.subject}</span>
                  <span className="shrink-0 text-[9px] text-faint">{faRelative(m.createdAt)}</span>
                </span>
                <span className="truncate text-[10px] text-faint">{m.name} · {m.phone}</span>
                <span className="truncate text-[10px] text-mist">{m.body}</span>
              </span>
              {m.replies.length > 0 && (
                <span className="mt-1 shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[8px] font-bold text-emerald-400">پاسخ داده شد</span>
              )}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!active ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex h-full min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line">
                <MailOpen className="h-10 w-10 text-faint" />
                <p className="text-sm font-bold text-mist">یک پیام را انتخاب کنید</p>
              </motion.div>
            ) : (
              <motion.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-ink-2 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-black">{active.subject}</h2>
                    <p className="text-[11px] text-mist">{active.name} · <span className="tech-font" dir="ltr">{active.phone}</span> · {faRelative(active.createdAt)}</p>
                    {activeProduct && (
                      <span className="mt-1 flex w-fit items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-[10px] font-bold text-ember-2">
                        <Package className="h-3 w-3" /> {activeProduct.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => patchMessage(division, active.id, { starred: !active.starred })}
                      className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
                        active.starred ? "border-amber-400/50 bg-amber-400/10 text-amber-400" : "border-line text-mist hover:text-amber-400"
                      }`} aria-label="ستاره">
                      <Star className={`h-4 w-4 ${active.starred ? "fill-amber-400" : ""}`} />
                    </button>
                    <button onClick={() => patchMessage(division, active.id, { read: !active.read })}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mist hover:text-ember" aria-label="خوانده">
                      {active.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <p className="rounded-xl border border-line bg-ink p-4 text-[13px] leading-7 text-steel/90">{active.body}</p>

                {active.replies.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {active.replies.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                        <CornerDownLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-emerald-400">پاسخ مدیر · {faRelative(r.at)}</span>
                          <span className="text-xs leading-6 text-steel/90">{r.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-3 rounded-xl border border-line bg-ink p-4">
                  <span className="text-xs font-black text-steel">پاسخ به مشتری</span>
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3}
                    placeholder="متن پاسخ..."
                    className="resize-none rounded-lg border border-line bg-ink-2 px-4 py-3 text-sm leading-7 outline-none placeholder:text-faint focus:border-ember" />
                  <div className="flex items-center justify-between gap-3">
                    <a href={`sms:${active.phone}?body=${encodeURIComponent(reply || "با سلام، پیرو استعلام شما...")}`}
                      className="text-[10px] font-bold text-faint hover:text-ember">ارسال پیامک</a>
                    <button onClick={sendReply} disabled={!reply.trim()}
                      className="flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-xs font-black text-ink hover:bg-ember-2 disabled:opacity-40">
                      <Send className="h-3.5 w-3.5" /> ثبت پاسخ
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
