/**
 * Multi-provider LLM chain for hotel copy assist.
 * Follows docs/LLM_MODEL_SELECTION.md failover rules:
 * retry next model on 408/429/5xx/empty/network — never use deprecated Groq llama models.
 */

export type SuggestKind = "hotel_description" | "insights_copy";

export type LlmResult = {
  draft: string;
  provider: "groq" | "openai" | "openrouter" | "stub";
  model?: string;
  usedFallback?: boolean;
};

type ChatTarget = {
  provider: "groq" | "openai" | "openrouter";
  baseUrl: string;
  apiKey: string;
  model: string;
};

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

/** Non-deprecated Groq OpenAI-compatible models (fast → strong) */
const GROQ_MODELS = [
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-120b",
];

const OPENROUTER_MODELS = [
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-001",
];

const systemPrompt = (kind: SuggestKind) =>
  kind === "insights_copy"
    ? "You write short hotel-business insight blurbs (2–3 sentences) for an admin dashboard. No markdown."
    : "You polish hotel listing descriptions for a booking site. Keep 2–4 sentences, inviting, no markdown, GBP market tone.";

const userPrompt = (kind: SuggestKind, input: string) =>
  kind === "insights_copy"
    ? `Summarize insights from this context:\n${input}`
    : `Polish this hotel description:\n${input}`;

export const stubDraft = (kind: SuggestKind, input: string): string => {
  const cleaned = (input || "").trim() || "this property";
  if (kind === "insights_copy") {
    return (
      `Business snapshot: ${cleaned}. Bookings and revenue trends look healthy for a boutique portfolio. ` +
      `Focus on converting pending stays and highlighting top-rated destinations in the next campaign.`
    );
  }
  return (
    `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}. ` +
    `Guests enjoy refined rooms, thoughtful amenities, and a convenient location for leisure and business travel. ` +
    `Book your stay for warm hospitality and a memorable city escape.`
  );
};

const buildChain = (): ChatTarget[] => {
  const chain: ChatTarget[] = [];

  if (process.env.GROQ_API_KEY) {
    const override = process.env.GROQ_MODEL?.trim();
    const models = override ? [override] : GROQ_MODELS;
    for (const model of models) {
      chain.push({
        provider: "groq",
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
        model,
      });
    }
  }

  if (process.env.OPENAI_API_KEY) {
    chain.push({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
  }

  if (process.env.OPENROUTER_API_KEY) {
    const override = process.env.OPENROUTER_MODEL?.trim();
    const models = override ? [override] : OPENROUTER_MODELS;
    for (const model of models) {
      chain.push({
        provider: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        model,
      });
    }
  }

  return chain;
};

const callChat = async (
  target: ChatTarget,
  kind: SuggestKind,
  input: string
): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch(`${target.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${target.apiKey}`,
        "Content-Type": "application/json",
        ...(target.provider === "openrouter"
          ? {
              "HTTP-Referer":
                process.env.FRONTEND_URL || "http://localhost:5174",
              "X-Title": "Hotel Booking AI Assist",
            }
          : {}),
      },
      body: JSON.stringify({
        model: target.model,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt(kind) },
          { role: "user", content: userPrompt(kind, input) },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      const err = new Error(
        `${target.provider}/${target.model} HTTP ${res.status}: ${errText.slice(0, 160)}`
      ) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error(`${target.provider}/${target.model} empty response`);
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Try providers/models in order; on 429/5xx/timeout/empty jump to next immediately.
 * Final fallback is stub (never throws for missing keys when assist is enabled).
 */
export const generateDraft = async (
  kind: SuggestKind,
  input: string
): Promise<LlmResult> => {
  const chain = buildChain();
  let usedFallback = false;
  let attempt = 0;

  for (const target of chain) {
    attempt += 1;
    if (attempt > 1) usedFallback = true;
    try {
      const draft = await callChat(target, kind, input);
      return {
        draft,
        provider: target.provider,
        model: target.model,
        usedFallback,
      };
    } catch (e) {
      const status = (e as { status?: number }).status;
      const msg = e instanceof Error ? e.message : String(e);
      const retryable =
        status === undefined || RETRYABLE.has(status) || /abort|network|empty/i.test(msg);
      console.warn(`[llm] ${msg}${retryable ? " → next" : " → next"}`);
      // Always try next on any failure for free-tier resilience
      continue;
    }
  }

  return {
    draft: stubDraft(kind, input),
    provider: "stub",
    usedFallback: chain.length > 0,
  };
};
