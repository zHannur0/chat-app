export interface BotReplyOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateBotReply(
  prompt: string,
  opts: BotReplyOptions = {},
  retryCount = 0
): Promise<string> {
  const apiKey = process.env.OPENAI_API;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const payload = {
    model: opts.model || process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant in a messaging app. Keep responses concise and friendly.",
      },
      { role: "user", content: prompt },
    ],
    max_output_tokens: opts.maxTokens || 150,
    temperature: opts.temperature ?? 0.7,
  };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Retry/backoff на 429 или 5xx
  if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
    if (retryCount < 3) {
      const delay = 1000 * (retryCount + 1); // экспоненциальная задержка
      console.warn(`Retrying after ${delay}ms (status ${res.status})`);
      await sleep(delay);
      return generateBotReply(prompt, opts, retryCount + 1);
    }
  }

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  const text = data.output?.[0]?.content?.[0]?.text;
  if (!text) throw new Error("OpenAI response empty");

  return text.trim();
}
