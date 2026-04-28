import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  Loader2,
  Zap,
  ChevronRight,
  Shield,
  PiggyBank,
  LineChart,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFinance } from '../hooks/useFinance';
import { buildFinanceMentorContext, sendMentorMessage } from '../services/geminiMentorService';

const SUGGESTED_PROMPTS = [
  { label: 'Survive the rest of the month', text: 'My budget is tight. What should I do for the next two weeks?', icon: Shield },
  { label: 'Cut spending without misery', text: 'How can I reduce spending without feeling deprived?', icon: LineChart },
  { label: 'Reach my savings goal faster', text: 'What is the fastest realistic way to hit my savings goals?', icon: PiggyBank },
  { label: 'One habit that moves the needle', text: 'What single money habit would help me the most right now?', icon: Zap },
];

function formatLine(line, isUserBubble) {
  const parts = line.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, j) => {
    const m = part.match(/^\*\*(.+)\*\*$/);
    if (m) {
      return (
        <strong
          key={j}
          className={`font-semibold ${isUserBubble ? 'text-white' : 'text-[var(--text-color)]'}`}
        >
          {m[1]}
        </strong>
      );
    }
    return <span key={j}>{part}</span>;
  });
}

function formatMessageBody(text, isUserBubble) {
  return text.split('\n').map((line, i) => (
    <div key={i} className="min-h-[1.15em] mb-0.5 last:mb-0">
      {line ? formatLine(line, isUserBubble) : '\u00a0'}
    </div>
  ));
}

export default function MentorChat() {
  const { user } = useAuth();
  const { monthlyBudget, metrics, goals, transactions } = useFinance();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef([]);
  const msgSeqRef = useRef(0);

  const financeBlock = useMemo(
    () =>
      buildFinanceMentorContext({
        monthlyBudget,
        metrics,
        goals,
        transactions,
      }),
    [monthlyBudget, metrics, goals, transactions],
  );

  const welcomeText = useMemo(() => {
    const name = (user?.name || 'there').split(' ')[0];
    return `Hi ${name}, I'm your WalletNest mentor. I've loaded your latest snapshot (budget, spend, goals). Ask me anything—or tap a suggested prompt below.`;
  }, [user?.name]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, welcomeText, scrollToBottom]);

  const runSend = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const prev = messagesRef.current;
      msgSeqRef.current += 1;
      const userMsg = { id: `u-${msgSeqRef.current}`, role: 'user', content: trimmed };
      const historyForApi = [
        { role: 'assistant', content: welcomeText },
        ...prev.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: trimmed },
      ];

      setMessages([...prev, userMsg]);
      setInput('');
      setSending(true);

      try {
        const reply = await sendMentorMessage({
          messages: historyForApi,
          financeContext: financeBlock,
        });
        msgSeqRef.current += 1;
        const assistantMsg = { id: `a-${msgSeqRef.current}`, role: 'assistant', content: reply };
        setMessages((current) => [...current, assistantMsg]);
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [sending, welcomeText, financeBlock],
  );

  const onSubmit = (e) => {
    e.preventDefault();
    void runSend(input);
  };

  const userAvatar = user?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=WalletNest&backgroundColor=10b981';
  const mentorProxyUrl = Boolean(
    (import.meta.env.VITE_FINANCE_CHAT_PROXY_URL || import.meta.env.VITE_MENTOR_PROXY_URL || '').trim(),
  );
  const geminiBrowserKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  const aiLive = mentorProxyUrl || geminiBrowserKey;

  return (
    <div className="max-w-4xl mx-auto animation-fade-in pb-8 min-h-[calc(100dvh-8rem)] flex flex-col">
      {/* Premium header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-[0_20px_50px_-20px_rgba(16,185,129,0.25)] dark:shadow-[0_24px_60px_-24px_rgba(16,185,129,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link
              to="/insights"
              className="mt-1 p-2 rounded-xl border border-[var(--border-color)] bg-white/60 dark:bg-slate-900/60 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              aria-label="Back to AI Insights"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/35 ring-4 ring-white/30 dark:ring-white/10">
                <Sparkles size={26} strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[var(--card-bg)] shadow-sm" title="Ready" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                AI Finance Mentor
              </p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-color)]">
                Nest Mentor
              </h1>
              <p className="text-sm text-[var(--muted-text)] mt-1 max-w-md leading-relaxed">
                Personalized guidance from your spending patterns
                {aiLive
                  ? mentorProxyUrl
                    ? ' — answers via your backend mentor proxy + Gemini.'
                    : ' — Gemini from the browser (dev only; use a proxy in production).'
                  : ' — set VITE_FINANCE_CHAT_PROXY_URL or see .env.example.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {mentorProxyUrl ? 'Proxy + Gemini' : geminiBrowserKey ? 'Gemini (browser)' : 'Local mentor'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-1.5 text-[11px] font-bold text-[var(--muted-text)] uppercase tracking-wider">
              Rs {metrics.expenses.toLocaleString()} spent
            </span>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="mb-4">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-2 px-1">Suggested prompts</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={sending}
              onClick={() => void runSend(p.text)}
              className="snap-start shrink-0 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-emerald-500/40 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 transition-all text-left group disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 text-emerald-600 dark:text-emerald-400 group-hover:from-emerald-500/20 group-hover:to-teal-500/10">
                <p.icon size={18} strokeWidth={2.2} />
              </span>
              <span className="flex flex-col min-w-[10rem] max-w-[14rem]">
                <span className="text-xs font-bold text-[var(--text-color)] leading-tight">{p.label}</span>
                <span className="text-[10px] text-[var(--muted-text)] line-clamp-2 mt-0.5">{p.text}</span>
              </span>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat surface */}
      <div className="flex-1 flex flex-col min-h-[420px] rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gradient-to-b from-gray-50/80 to-transparent dark:from-slate-900/40 dark:to-transparent min-h-[280px] max-h-[min(56vh,520px)]"
        >
          <div className="flex gap-3 max-w-[92%]">
            <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-500/30 bg-indigo-100 dark:bg-indigo-950/50">
              <Bot className="text-indigo-600 dark:text-indigo-300" size={20} />
            </div>
            <div className="rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed shadow-sm bg-[var(--chat-assistant-bg)] text-[var(--text-color)] border border-[var(--border-color)]">
              <div className="whitespace-pre-wrap break-words">{formatMessageBody(welcomeText, false)}</div>
            </div>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[92%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center overflow-hidden border-2 ${
                  m.role === 'user'
                    ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-indigo-500/30 bg-indigo-100 dark:bg-indigo-950/50'
                }`}
              >
                {m.role === 'user' ? (
                  <img src={userAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Bot className="text-indigo-600 dark:text-indigo-300" size={20} />
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-md shadow-emerald-500/25'
                    : 'bg-[var(--chat-assistant-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-tl-md'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {formatMessageBody(m.content, m.role === 'user')}
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3 max-w-[92%]">
              <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center border-2 border-indigo-500/30 bg-indigo-100 dark:bg-indigo-950/50">
                <Bot className="text-indigo-600 dark:text-indigo-300" size={20} />
              </div>
              <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-[var(--chat-assistant-bg)] border border-[var(--border-color)] flex items-center gap-2">
                <Loader2 className="animate-spin text-emerald-500" size={18} />
                <span className="text-sm text-[var(--muted-text)]">Mentor is thinking…</span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="p-4 md:p-5 border-t border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md"
        >
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void runSend(input);
                  }
                }}
                placeholder="Ask about budgeting, goals, habits, or this month's spend…"
                disabled={sending}
                className="w-full resize-none min-h-[48px] max-h-32 rounded-2xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] py-3.5 pl-4 pr-4 text-sm text-[var(--text-color)] placeholder:text-[var(--muted-text)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-60"
              />
              <p className="text-[10px] text-[var(--muted-text)] mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
            </div>
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="shrink-0 h-12 w-12 md:h-[52px] md:w-[52px] rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
            </button>
          </div>
        </form>
      </div>

      <p className="text-center text-[11px] text-[var(--muted-text)] mt-4 px-4 leading-relaxed">
        AI can be wrong. Use this as guidance, not financial advice.
      </p>
    </div>
  );
}
