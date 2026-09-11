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

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”"'.,!?;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function exactBalochiEntry(value: string) {
  const q = normalize(value);

  return dictionaryEntries.find((entry) => {
    if (normalize(entry.word) === q) return true;
    if (entry.aliases?.some((item) => normalize(item) === q)) return true;
    return entry.latin?.some((item) => normalize(item) === q) ?? false;
  });
}

function englishEntries(value: string) {
  const q = normalize(value);

  return dictionaryEntries.filter((entry) =>
    entry.meanings.some((meaning) => normalize(meaning) === q),
  );
}

function formatEntry(entry: (typeof dictionaryEntries)[number]) {
  const latin = entry.latin?.length ? " (" + entry.latin.join(", ") + ")" : "";
  return [
    entry.word + latin,
    "Meaning: " + entry.meanings.join(", "),
    "Part of speech: " + entry.part,
    "",
    "Source: Zubán dictionary · Wiktionary-derived entry.",
  ].join("\n");
}

function extractLookupCandidate(input: string) {
  const trimmed = input.trim();
  const patterns = [
    /(?:what does|what is the meaning of|meaning of|define|explain)\s+["“”']?(.+?)["“”']?\s*(?:mean)?[?.!]*$/i,
    /(?:translate)\s+["“”']?(.+?)["“”']?\s+(?:into|to)\s+(?:english|balochi)[?.!]*$/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return trimmed;
}

function localDictionaryChat(input: string) {
  const candidate = extractLookupCandidate(input);

  const balochi = exactBalochiEntry(candidate);
  if (balochi) {
    return formatEntry(balochi);
  }

  const english = englishEntries(candidate);
  if (english.length) {
    return [
      candidate + " → " +
        english
          .slice(0, 6)
          .map((entry) => {
            const latin = entry.latin?.[0] ? " (" + entry.latin[0] + ")" : "";
            return entry.word + latin;
          })
          .join(" / "),
      "",
      "Source: Zubán dictionary · exact English meaning match.",
    ].join("\n");
  }

  return "";
}

function localDictionaryTranslation(
  input: string,
  source?: string,
  target?: string,
) {
  const from = source?.toLocaleLowerCase();
  const to = target?.toLocaleLowerCase();

  if (from === "balochi" && to === "english") {
    const entry = exactBalochiEntry(input);
    return entry ? entry.meanings.join(", ") : "";
  }

  if (from === "english" && to === "balochi") {
    const matches = englishEntries(input);
    if (!matches.length) return "";

    return matches
      .slice(0, 8)
      .map((entry) => {
        const latin = entry.latin?.[0] ? " (" + entry.latin[0] + ")" : "";
        return entry.word + latin;
      })
      .join(" / ");
  }

  return "";
}

function glossaryContext(input: string) {
  const normalized = input.toLocaleLowerCase();
  const matches = dictionaryEntries
    .filter((entry) => {
      if (normalized.includes(entry.word.toLocaleLowerCase())) return true;
      if (entry.aliases?.some((item) => normalized.includes(item.toLocaleLowerCase()))) return true;
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
    dictionaryFallback: true,
  };
}

export async function runTextModel(request: TextRequest) {
  const provider = resolveProvider();

  if (!provider) {
    const localOutput =
      request.mode === "translate"
        ? localDictionaryTranslation(request.input, request.source, request.target)
        : localDictionaryChat(request.input);

    if (localOutput) {
      return {
        configured: true,
        output: localOutput,
        message: "",
        provider: "dictionary",
        model: "Zubán Lexicon",
      };
    }

    return {
      configured: false,
      output: "",
      message:
        request.mode === "translate"
          ? "No AI model is connected. Exact English ↔ Balochi dictionary words work offline, but sentence translation needs HF_TOKEN, a custom endpoint, or Ollama."
          : "No AI model is connected. You can still ask for meanings of words in the Zubán dictionary, for example “What does آپ mean?”. Full chat needs HF_TOKEN, a custom endpoint, or Ollama.",
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
