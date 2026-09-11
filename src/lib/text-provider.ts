import { dictionaryEntries } from "@/lib/dictionary";

type TextMode = "chat" | "translate";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type TextRequest = {
  mode: TextMode;
  input: string;
  source?: string;
  target?: string;
  messages?: ConversationMessage[];
};

type CompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>;
};

type ProviderConfig = {
  endpoint: string;
  model: string;
  apiKey?: string;
  provider: "custom" | "huggingface" | "ollama";
};

function resolveProvider(): ProviderConfig | null {
  if (process.env.ZUBAN_TEXT_API_URL && process.env.ZUBAN_TEXT_MODEL) {
    return {
      endpoint: process.env.ZUBAN_TEXT_API_URL,
      model: process.env.ZUBAN_TEXT_MODEL,
      apiKey: process.env.ZUBAN_TEXT_API_KEY,
      provider: "custom",
    };
  }

  if (process.env.HF_TOKEN) {
    return {
      endpoint: "https://router.huggingface.co/v1/chat/completions",
      model: process.env.ZUBAN_HF_TEXT_MODEL || "Qwen/Qwen3-8B:cheapest",
      apiKey: process.env.HF_TOKEN,
      provider: "huggingface",
    };
  }

  if (process.env.OLLAMA_BASE_URL) {
    return {
      endpoint: process.env.OLLAMA_BASE_URL.replace(/\/$/, "") + "/v1/chat/completions",
      model: process.env.OLLAMA_MODEL || "qwen3:8b",
      provider: "ollama",
    };
  }

  return null;
}

function glossaryContext(input: string) {
  const normalized = input.toLocaleLowerCase();
  const matches = dictionaryEntries
    .filter((entry) => {
      if (normalized.includes(entry.word.toLocaleLowerCase())) return true;
      if (entry.latin?.some((item) => normalized.includes(item.toLocaleLowerCase()))) return true;
      return false;
    })
    .slice(0, 12);

  if (!matches.length) return "";

  return [
    "",
    "Verified lexical hints from Zubán's sourced dictionary. Use these as evidence, not as a complete grammar:",
    ...matches.map((entry) => {
      const latin = entry.latin?.length ? " (" + entry.latin.join(", ") + ")" : "";
      return "- " + entry.word + latin + ": " + entry.meanings.join("; ");
    }),
  ].join("\n");
}

export function textProviderStatus() {
  const provider = resolveProvider();
  return {
    configured: Boolean(provider),
    provider: provider?.provider ?? null,
    model: provider?.model ?? null,
  };
}

export async function runTextModel(request: TextRequest) {
  const provider = resolveProvider();

  if (!provider) {
    return {
      configured: false,
      output: "",
      message:
        "Chat and translation need one model connection. Add HF_TOKEN for Hugging Face, configure ZUBAN_TEXT_API_URL/ZUBAN_TEXT_MODEL, or set OLLAMA_BASE_URL for local Ollama.",
    };
  }

  const lexicalContext = glossaryContext(request.input);

  const system =
    request.mode === "translate"
      ? [
          "You are Zubán Translate, a Balochi language translation assistant.",
          `Translate from ${request.source ?? "auto"} to ${request.target ?? "Balochi"}.`,
          "Return only the translation unless a short dialect note is genuinely necessary.",
          "Preserve names, numbers and meaning. Do not invent Balochi forms when uncertain.",
          "Balochi has dialect and orthographic variation; prefer natural wording and be explicit only when ambiguity matters.",
          lexicalContext,
        ].join("\n")
      : [
          "You are Zubán, an open Balochi language assistant.",
          "Help with Balochi language, writing, translation, culture-neutral everyday questions and language learning.",
          "Be concise by default. Respect dialect and script differences and do not present one regional form as universally correct.",
          "When you are unsure about a Balochi word or grammar point, say so rather than inventing it.",
          "Use Arabic-script Balochi when the user writes in Arabic script and Latin Balochi when they use Latin, unless they ask for another script.",
          lexicalContext,
        ].join("\n");

  const conversation =
    request.mode === "chat" && request.messages?.length
      ? request.messages.slice(-20)
      : [{ role: "user" as const, content: request.input }];

  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: "system", content: system }, ...conversation],
      temperature: request.mode === "translate" ? 0.1 : 0.25,
      max_tokens: 1200,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Text model returned ${response.status}${detail ? ": " + detail.slice(0, 180) : ""}`,
    );
  }

  const data = (await response.json()) as CompletionPayload;
  const output = data.choices?.[0]?.message?.content?.trim();

  if (!output) throw new Error("Text model returned no text.");

  return {
    configured: true,
    output,
    message: "",
    provider: provider.provider,
    model: provider.model,
  };
}
