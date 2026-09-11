import { generateText, streamText } from "ai";
import { dictionaryEntries } from "@/lib/dictionary";
import {
  detectBalochiScript,
  normalizeBalochi,
  normalizeForBalochiLookup,
} from "@/lib/balochi-language";

type TextMode = "chat" | "translate";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DialectPreference = "auto" | "western" | "southern" | "eastern";
export type ScriptPreference = "auto" | "arabic" | "latin";

export type TextRequest = {
  mode: TextMode;
  input: string;
  source?: string;
  target?: string;
  messages?: ConversationMessage[];
  dialect?: DialectPreference;
  scriptPreference?: ScriptPreference;
};

type CompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>;
};

type ProviderConfig = {
  endpoint: string;
  model: string;
  apiKey?: string;
  provider: "custom" | "huggingface" | "ollama" | "vercel";
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

  if (
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.VERCEL
  ) {
    return {
      endpoint: "",
      model: process.env.ZUBAN_VERCEL_TEXT_MODEL || "meta/llama-3.3-70b",
      provider: "vercel",
    };
  }

  return null;
}

function normalize(value: string) {
  return normalizeForBalochiLookup(value)
    .replace(/[“”"'.,!?؟،؛:;()[\]{}]/g, " ")
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

  if (balochi) return formatEntry(balochi);

  const english = englishEntries(candidate);
  if (!english.length) return "";

  return [
    candidate +
      " → " +
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

function localDictionaryTranslation(
  input: string,
  source?: string,
  target?: string,
) {
  const from = source?.toLocaleLowerCase();
  const to = target?.toLocaleLowerCase();

  if (from === "balochi" && to === "english") {
    return exactBalochiEntry(input)?.meanings.join(", ") ?? "";
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
  const normalized = normalizeBalochi(input).toLocaleLowerCase();

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

function systemPrompt(request: TextRequest) {
  const normalizedInput = normalizeBalochi(request.input);
  const detectedScript = detectBalochiScript(request.input);
  const lexicalContext = glossaryContext(normalizedInput);
  const dialect = request.dialect ?? "auto";
  const scriptPreference = request.scriptPreference ?? "auto";

  if (request.mode === "translate") {
    return [
      "You are Zubán Translate, a Balochi language translation assistant.",
      `Translate from ${request.source ?? "auto"} to ${request.target ?? "Balochi"}.`,
      "Return only the translation unless a short dialect note is genuinely necessary.",
      "Preserve names, numbers and meaning. Do not invent Balochi forms when uncertain.",
      "Balochi has dialect and orthographic variation; prefer natural wording and be explicit only when ambiguity matters.",
      "Detected input script: " + detectedScript + ".",
      lexicalContext,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "You are Zubán, an open Balochi language assistant.",
    "Help with Balochi language, writing, translation, culture-neutral everyday questions and language learning.",
    "Be concise by default. Respect dialect and script differences and do not present one regional form as universally correct.",
    "When you are unsure about a Balochi word or grammar point, say so rather than inventing it.",
    "Detected input script: " + detectedScript + ".",
    dialect === "auto"
      ? "Dialect preference: auto. Do not assume a dialect when the user's form is ambiguous."
      : "Dialect preference: " + dialect + ". Prefer that variety while acknowledging alternatives when relevant.",
    scriptPreference === "auto"
      ? "Script preference: auto. Follow the user's script when possible."
      : "Script preference: " + scriptPreference + ". Use that output script for Balochi unless the user explicitly asks otherwise.",
    lexicalContext,
  ]
    .filter(Boolean)
    .join("\n");
}

function conversationFor(request: TextRequest) {
  return request.mode === "chat" && request.messages?.length
    ? request.messages.slice(-20)
    : [{ role: "user" as const, content: request.input }];
}

function providerPayload(request: TextRequest, stream = false) {
  const provider = resolveProvider();
  if (!provider) return null;

  return {
    provider,
    body: {
      model: provider.model,
      messages: [
        { role: "system", content: systemPrompt(request) },
        ...conversationFor(request),
      ],
      temperature: request.mode === "translate" ? 0.1 : 0.25,
      max_tokens: 1200,
      ...(stream ? { stream: true } : {}),
    },
  };
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

export async function streamChatModel(request: TextRequest) {
  const resolved = providerPayload({ ...request, mode: "chat" }, true);
  if (!resolved) return null;

  if (resolved.provider.provider === "vercel") {
    const result = streamText({
      model: resolved.provider.model,
      instructions: systemPrompt({ ...request, mode: "chat" }),
      messages: conversationFor({ ...request, mode: "chat" }),
      temperature: 0.25,
      maxOutputTokens: 700,
    });

    const encoder = new TextEncoder();
    const iterator = result.textStream[Symbol.asyncIterator]();

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { value, done } = await iterator.next();
          if (done) {
            controller.close();
            return;
          }

          if (value) controller.enqueue(encoder.encode(value));
        } catch (error) {
          controller.error(error);
        }
      },
      async cancel() {
        if (iterator.return) await iterator.return();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Zuban-Stream-Format": "plain",
        "X-Zuban-Provider": "vercel-ai-gateway",
      },
    });
  }

  const response = await fetch(resolved.provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(resolved.provider.apiKey
        ? { Authorization: "Bearer " + resolved.provider.apiKey }
        : {}),
    },
    body: JSON.stringify(resolved.body),
    cache: "no-store",
    signal: AbortSignal.timeout(35_000),
  });

  return response;
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
          : "No AI model is connected. You can still ask for meanings of words in the Zubán dictionary. Full chat needs HF_TOKEN, a custom endpoint, or Ollama.",
    };
  }

  const resolved = providerPayload(request);
  if (!resolved) throw new Error("Text provider is not configured.");

  if (resolved.provider.provider === "vercel") {
    const result = await generateText({
      model: resolved.provider.model,
      instructions: systemPrompt(request),
      messages: conversationFor(request),
      temperature: request.mode === "translate" ? 0.1 : 0.25,
      maxOutputTokens: request.mode === "translate" ? 500 : 700,
    });

    const output = result.text.trim();
    if (!output) throw new Error("Text model returned no text.");

    return {
      configured: true,
      output,
      message: "",
      provider: resolved.provider.provider,
      model: resolved.provider.model,
    };
  }

  const response = await fetch(resolved.provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(resolved.provider.apiKey
        ? { Authorization: "Bearer " + resolved.provider.apiKey }
        : {}),
    },
    body: JSON.stringify(resolved.body),
    cache: "no-store",
    signal: AbortSignal.timeout(35_000),
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
    provider: resolved.provider.provider,
    model: resolved.provider.model,
  };
}
