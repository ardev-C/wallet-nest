/**
 * AI Finance Mentor — Gemini via optional backend proxy (recommended) or browser key (dev only).
 *
 * Production: set `VITE_FINANCE_CHAT_PROXY_URL` to your server route
 * (e.g. `http://localhost:8787/api/finance-chat`).
 * The server holds `GEMINI_API_KEY` — see `server/finance-chat-proxy.mjs`.
 *
 * Dev-only: `VITE_GEMINI_API_KEY` calls Google directly from the browser (key exposed; avoid in production).
 *
 * @see https://ai.google.dev/gemini-api/docs
 */

const DEFAULT_MODEL = 'gemini-2.0-flash';

const MENTOR_SYSTEM = `You are WalletNest's AI Finance Mentor: concise, encouraging, and practical.
You speak in short paragraphs. Use Indian Rupees (Rs) when mentioning money.
Never invent specific transaction line items; you may reference aggregates the user provides.
If spending looks high vs budget, give one clear next step. No medical or legal advice.`;

/**
 * @param {{ monthlyBudget: number, metrics: object, goals: object[], transactions: object[] }} snapshot
 */
export function buildFinanceMentorContext(snapshot) {
  const { monthlyBudget, metrics, goals, transactions } = snapshot;
  const topCats = Object.entries(metrics.categoryTotals || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amt]) => `${name}: Rs ${amt.toLocaleString()}`)
    .join('; ');
  const goalLines = (goals || [])
    .slice(0, 5)
    .map((g) => `${g.title}: Rs ${g.saved?.toLocaleString?.() ?? 0} / Rs ${g.target?.toLocaleString?.() ?? 0}`)
    .join('; ');
  return [
    `Monthly budget: Rs ${Number(monthlyBudget).toLocaleString()}`,
    `Expenses (period): Rs ${metrics.expenses?.toLocaleString?.() ?? 0}`,
    `Income logged: Rs ${metrics.income?.toLocaleString?.() ?? 0}`,
    `Remaining vs budget: Rs ${metrics.remaining?.toLocaleString?.() ?? 0}`,
    `Budget used: ~${metrics.spentPercent ?? 0}%`,
    `Predicted month-end cushion vs budget line: Rs ${metrics.predictedMonthEnd?.toLocaleString?.() ?? 0}`,
    topCats ? `Top categories: ${topCats}` : 'No category spend yet.',
    goalLines ? `Goals: ${goalLines}` : 'No savings goals yet.',
    `Transaction count: ${transactions?.length ?? 0}`,
  ].join('\n');
}

function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return '';
}

function fallbackReply(userText, contextBlock) {
  const t = (userText || '').toLowerCase();
  let body =
    "Here's a steady approach: pick **one** category to cap this week, log every purchase there, and review totals on Sunday.";

  if (/budget|overspend|over spend|broke|money tight/i.test(t)) {
    body =
      'Tight budget weeks work best with a **hard daily number** (budget ÷ days left). Spend only from cash/debit for discretionary so the limit is physical, not mental.';
  } else if (/save|saving|goal|invest/i.test(t)) {
    body =
      'Automate a **small** fixed transfer on payday—even Rs 500–2000—before discretionary spending. Raising the amount later is easier than starting big.';
  } else if (/food|eat|grocery|canteen|coffee/i.test(t)) {
    body =
      'Food is often the stealth category: try **2–3 cooked batches** per week, one “social meal” budget, and keep snacks off impulse checkout.';
  } else if (/subscription|netflix|app/i.test(t)) {
    body =
      'Run a **subscription audit**: list recurring charges, cancel duplicates, and annualize anything you keep (sometimes yearly is cheaper).';
  } else if (/debt|loan|credit|emi/i.test(t)) {
    body =
      'If you have high-interest debt, prioritize **minimums everywhere** then avalanche the highest APR. Avoid new BNPL while you stabilize.';
  }

  return `${body}\n\n---\n**Your snapshot (for context)**\n${contextBlock}`;
}

/**
 * @param {{ messages: { role: 'user'|'assistant'; content: string }[]; financeContext: string }} params
 * @returns {Promise<string>}
 */
export async function sendMentorMessage({ messages, financeContext }) {
  const defaultDevProxyUrl = import.meta.env.DEV ? 'http://localhost:8787/api/finance-chat' : '';
  const proxyUrl = (
    import.meta.env.VITE_FINANCE_CHAT_PROXY_URL ||
    import.meta.env.VITE_MENTOR_PROXY_URL ||
    defaultDevProxyUrl ||
    ''
  ).trim().replace(/\/+$/, '');

  if (proxyUrl) {
    try {
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, financeContext }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return fallbackReply(lastUserText(messages), financeContext);
      }
      if (typeof data?.text === 'string' && data.text.trim()) {
        return data.text.trim();
      }
      return fallbackReply(lastUserText(messages), financeContext);
    } catch {
      return fallbackReply(lastUserText(messages), financeContext);
    }
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return fallbackReply(lastUserText(messages), financeContext);
  }

  const contents = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${MENTOR_SYSTEM}\n\nUser finance snapshot:\n${financeContext}` }] },
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return fallbackReply(lastUserText(messages), financeContext);
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') || '';
    if (!text.trim()) {
      return fallbackReply(lastUserText(messages), financeContext);
    }
    return text.trim();
  } catch {
    return fallbackReply(lastUserText(messages), financeContext);
  }
}
