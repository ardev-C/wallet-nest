/**
 * Express Gemini finance chat proxy.
 *
 * Uses a server-side Gemini API key from `.env` and exposes:
 *   POST /api/finance-chat
 *
 * Example request body:
 *   {
 *     "messages": [{ "role": "user", "content": "How can I save more?" }],
 *     "financeContext": "Monthly budget: Rs 8000"
 *   }
 */

import fs from 'node:fs';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Load env from root `.env` (recommended), with a fallback to `server/.env`.
if (fs.existsSync('.env')) dotenv.config({ path: '.env' });
if (!process.env.GEMINI_API_KEY && fs.existsSync('server/.env')) dotenv.config({ path: 'server/.env' });

const PORT = Number(process.env.PORT || process.env.MENTOR_PROXY_PORT || 8787);
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

function buildCorsOptions() {
  const raw = String(CORS_ORIGIN || '').trim();
  if (!raw || raw === '*') return { origin: true };
  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.length <= 1) return { origin: allowed[0] };
  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  };
}

const MENTOR_SYSTEM = `You are WalletNest's AI Finance Mentor: concise, encouraging, and practical.
You speak in short paragraphs. Use Indian Rupees (Rs) when mentioning money.
Never invent specific transaction line items; you may reference aggregates the user provides.
If spending looks high vs budget, give one clear next step. No medical or legal advice.`;

async function geminiGenerate({ messages, financeContext }) {
  const contents = (messages || [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `${MENTOR_SYSTEM}\n\nUser finance snapshot:\n${financeContext || ''}` }],
      },
      contents,
      generationConfig: { temperature: 0.65, maxOutputTokens: 1024 },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || 'Gemini error';
    throw new Error(msg);
  }
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') || '';
  if (!text.trim()) throw new Error('Empty model response');
  return text.trim();
}

const app = express();

app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: '500kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'finance-chat-proxy', hasGeminiKey: Boolean(GEMINI_KEY) });
});

app.post('/api/finance-chat', async (req, res) => {
  if (!GEMINI_KEY) {
    res.status(503).json({ error: 'GEMINI_API_KEY is not set in .env' });
    return;
  }

  try {
    const text = await geminiGenerate(req.body ?? {});
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found. Use POST /api/finance-chat' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WalletNest finance chat proxy -> http://0.0.0.0:${PORT}/api/finance-chat`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});

// Keep process alive reliably in all environments.
setInterval(() => {}, 60_000);
