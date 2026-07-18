// eval/lib/gemini.mjs
// Minimal Gemini REST client (uses global fetch, Node 18+). No SDK dependency.
//
//   GEMINI_API_KEY  (required)
//   GEMINI_MODEL    (optional, default 'gemini-2.5-flash')

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export function assertApiKey() {
  if (!API_KEY) {
    console.error('\n✗ GEMINI_API_KEY is not set.');
    console.error('  PowerShell:  $env:GEMINI_API_KEY = "your-key"');
    console.error('  bash:        export GEMINI_API_KEY="your-key"\n');
    process.exit(1);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Send one prompt, return the model's plain text.
 * Retries transient errors (429/5xx) with exponential backoff.
 */
export async function generate(prompt, { temperature = 0.2, maxRetries = 4 } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: 4096 },
  };

  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 429 || res.status >= 500) {
        const body = await res.text();
        // A spending-cap / billing / quota-exhausted 429 will NOT recover on retry — fail fast.
        if (/spending cap|billing|quota/i.test(body)) {
          throw new Error(`HTTP ${res.status} (not retryable): ${body.slice(0, 200)}`);
        }
        lastErr = new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
      if (!text) {
        const reason = json?.candidates?.[0]?.finishReason || json?.promptFeedback?.blockReason || 'empty';
        throw new Error(`No text returned (finishReason: ${reason})`);
      }
      return text;
    } catch (e) {
      lastErr = e;
      if (attempt < maxRetries) await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastErr;
}

export const modelName = MODEL;
