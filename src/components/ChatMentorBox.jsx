import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';

const PROXY_URL =
  import.meta.env.VITE_FINANCE_CHAT_PROXY_URL ||
  import.meta.env.VITE_MENTOR_PROXY_URL ||
  'http://localhost:8787/api/finance-chat';

/**
 * Build a concise finance snapshot string that the backend injects as
 * system-level context so the model stays grounded in real numbers.
 */
function buildFinanceSnapshot(metrics, monthlyBudget, transactions, goals) {
  const lines = [
    `Monthly budget: Rs ${monthlyBudget.toLocaleString()}`,
    `Total spent this month: Rs ${metrics.expenses.toLocaleString()}`,
    `Budget remaining: Rs ${metrics.remaining.toLocaleString()}`,
    `Spent %: ${metrics.spentPercent}%`,
    `Predicted month-end position: Rs ${metrics.predictedMonthEnd.toLocaleString()}`,
  ];

  const cats = Object.entries(metrics.categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (cats.length > 0) {
    lines.push(
      `Top categories: ${cats.map(([n, v]) => `${n} Rs ${v.toLocaleString()}`).join(', ')}`,
    );
  }

  if (goals.length > 0) {
    lines.push(
      `Active goals: ${goals.map((g) => `"${g.title}" ${Math.round((g.saved / g.target) * 100)}% done`).join(', ')}`,
    );
  }

  lines.push(`Recent transactions (last 5): ${
    transactions
      .slice(0, 5)
      .map((t) => `${t.title} Rs ${t.amount}`)
      .join('; ') || 'none'
  }`);

  return lines.join('\n');
}

export default function ChatMentorBox() {
  const { metrics, transactions, goals, monthlyBudget } = useFinance();
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${(user?.name || 'there').split(' ')[0]}! I'm your WalletNest AI Mentor. Ask me anything about your spending, budgets, or savings goals — I have full context on your finances.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (userText) => {
      if (!userText.trim() || loading) return;

      const userMsg = { role: 'user', content: userText.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput('');
      setLoading(true);
      setError(null);

      try {
        const financeContext = buildFinanceSnapshot(
          metrics,
          monthlyBudget,
          transactions,
          goals,
        );

        const res = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            financeContext,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || `Server error (${res.status})`);
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.text },
        ]);
      } catch (err) {
        console.error('ChatMentorBox fetch error:', err);
        setError(err.message || 'Failed to reach the AI Mentor. Is the backend running?');
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, messages, metrics, monthlyBudget, transactions, goals],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleRetry = () => {
    setError(null);
    // Retry the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove the last user message so sendMessage re-adds it
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="card-premium flex flex-col h-full overflow-hidden border border-[var(--border-color)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center space-x-3 bg-gradient-to-r from-blue-50/50 to-emerald-50/50 dark:from-blue-900/20 dark:to-emerald-900/20 shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Bot size={20} strokeWidth={2.5} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-color)] tracking-tight text-sm">Nest AI Mentor</h3>
          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            {loading ? 'Thinking…' : 'Online'}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) =>
          msg.role === 'assistant' ? (
            <div key={idx} className="flex items-start space-x-3 max-w-[88%] animation-fade-in">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <Bot size={14} strokeWidth={2.5} />
              </div>
              <div className="bg-[var(--chat-assistant-bg)] p-3.5 rounded-2xl rounded-tl-sm text-sm text-[var(--text-color)] shadow-sm border border-[var(--border-color)] leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={idx} className="flex items-start space-x-3 max-w-[88%] ml-auto justify-end animation-fade-in">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-3.5 rounded-2xl rounded-tr-sm text-sm shadow-md shadow-emerald-500/15 leading-relaxed">
                {msg.content}
              </div>
            </div>
          ),
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start space-x-3 max-w-[88%] animation-fade-in">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Bot size={14} strokeWidth={2.5} />
            </div>
            <div className="bg-[var(--chat-assistant-bg)] px-5 py-3.5 rounded-2xl rounded-tl-sm border border-[var(--border-color)] shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--muted-text)]">Generating response</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start space-x-3 max-w-[88%] animation-fade-in">
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
              <AlertCircle size={14} strokeWidth={2.5} />
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 p-3.5 rounded-2xl rounded-tl-sm text-sm border border-red-200 dark:border-red-900/50 shadow-sm">
              <p className="text-red-700 dark:text-red-300 font-medium mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="text-xs font-bold tracking-widest uppercase text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} strokeWidth={3} /> Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md shrink-0"
      >
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances…"
            disabled={loading}
            className="w-full bg-[var(--input-bg)] border-2 border-[var(--border-color)] focus:border-blue-500 rounded-2xl py-3 pl-4 pr-14 outline-none text-sm font-medium text-[var(--text-color)] transition-all focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none active:scale-95"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
