import { generateText } from "ai";
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
  provider: "custom" | "huggingface" | "ollama" | "vercel" | "gemini";
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

  if (process.env.GEMINI_API_KEY) {
    return {
      endpoint:
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        (process.env.ZUBAN_GEMINI_MODEL || "gemini-2.5-flash-lite") +
        ":generateContent?key=" +
        encodeURIComponent(process.env.GEMINI_API_KEY),
      model: process.env.ZUBAN_GEMINI_MODEL || "gemini-2.5-flash-lite",
      provider: "gemini",
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

  const gatewayToken =
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;

  // Do not auto-enable AI Gateway just because the app runs on Vercel.
  // Zubán must remain usable without billing/card setup. Gateway is used
  // only when an explicit credential is actually available.
  if (gatewayToken) {
    return {
      endpoint: "https://ai-gateway.vercel.sh/v1/chat/completions",
      model:
        process.env.ZUBAN_VERCEL_TEXT_MODEL ||
        "google/gemini-2.5-flash-lite",
      apiKey: gatewayToken,
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

function meaningForms(value: string) {
  const normalized = normalize(value);
  const forms = new Set<string>([normalized]);

  for (const part of normalized.split(/[,;/]/g)) {
    const clean = part
      .replace(/^to\s+/, "")
      .replace(/^(a|an|the)\s+/, "")
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (clean) forms.add(clean);
  }

  const withoutTo = normalized.replace(/^to\s+/, "").trim();
  if (withoutTo) forms.add(withoutTo);

  return forms;
}

function englishEntries(value: string) {
  const q = normalize(value);

  return dictionaryEntries.filter((entry) =>
    entry.meanings.some((meaning) => meaningForms(meaning).has(q)),
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
  if (english.length) {
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

  const normalizedInput = normalize(input);
  const lower = normalizedInput.toLocaleLowerCase();

  if (/^(hi|hello|hey|salam|assalam|السلام|سلام)\b/i.test(normalizedInput)) {
    if (/how are you|how r u|howre you/i.test(lower)) {
      return "سلامت باتے! I’m doing well. How can I help you today?";
    }

    return "سلامت باتے! How can I help you today?";
  }

  if (/\b(how are you|how r u|howre you)\b/i.test(lower)) {
    return "I’m doing well, thank you. How can I help you?";
  }

  if (/\b(thank you|thanks|thankyou|shukriya)\b/i.test(lower)) {
    return "You’re welcome. If you need anything else, just ask.";
  }

  if (/\b(bye|goodbye|see you|allah hafiz|khuda hafiz)\b/i.test(lower)) {
    return "Goodbye! خدا نگہدار.";
  }

  if (/\b(who are you|what are you|your name|what is your name)\b/i.test(lower)) {
    return [
      "I’m Zubán, an open Balochi language assistant by TechCraft.",
      "I can help with Balochi vocabulary, sourced word meanings, basic translation, script guidance, and everyday conversation.",
    ].join("\n");
  }

  if (/short greeting|greeting in balochi|balochi greeting/i.test(lower)) {
    return "سلامت باتے.";
  }

  if (/\b(what is balochi|tell me about balochi|balochi language)\b/i.test(lower)) {
    return [
      "Balochi is an Iranian language spoken mainly in Balochistan and neighboring regions of Pakistan, Iran, Afghanistan, and the Gulf.",
      "It has several regional varieties and is commonly written in Arabic-based and Latin scripts.",
      "Zubán treats dialect and spelling differences as valid variation rather than forcing a single form.",
    ].join("\n");
  }

  if (/\b(help|what can you do|capabilities)\b/i.test(lower)) {
    return [
      "I can help with:",
      "• Balochi word meanings from the sourced Zubán dictionary",
      "• English ↔ Balochi word and simple-phrase translation",
      "• Balochi script and spelling guidance",
      "• basic everyday conversation",
      "• Latin forms and parts of speech when available",
    ].join("\n");
  }

  if (/\b(good morning)\b/i.test(lower)) {
    return "Good morning! How can I help you today?";
  }

  if (/\b(good evening|good afternoon)\b/i.test(lower)) {
    return "Hello! How can I help you?";
  }

  return [
    "I can help with Balochi language questions and basic conversation.",
    "For example, ask me a word meaning, a simple translation, or a question about Balochi writing and script.",
  ].join("\n");
}

function englishTokenToBalochi(token: string) {
  const q = normalize(token);
  if (!q) return "";

  const exact = englishEntries(q);
  return exact[0]?.word ?? "";
}

function balochiTokenToEnglish(token: string) {
  return exactBalochiEntry(token)?.meanings[0] ?? "";
}

function translateTokens(
  input: string,
  translateToken: (token: string) => string,
) {
  let translated = 0;
  let total = 0;

  const output = input.replace(
    /[\p{L}\p{M}]+/gu,
    (token) => {
      total += 1;
      const replacement = translateToken(token);
      if (!replacement) return token;
      translated += 1;
      return replacement;
    },
  );

  return {
    output,
    translated,
    total,
    coverage: total ? translated / total : 0,
  };
}

type LocalTranslation = {
  output: string;
  coverage: number;
  partial: boolean;
};

const commonEnglishToBalochi: Record<string, string> = {
  "hello": "سلامت باتے",
  "hi": "سلامت باتے",
  "good morning": "سلامت باتے",
  "thank you": "منّت واراں",
  "thanks": "منّت واراں",
  "friend": "دوست",
  "water": "آپ",
  "fire": "آس",
};

function localDictionaryTranslation(
  input: string,
  source?: string,
  target?: string,
): LocalTranslation | null {
  const from = source?.toLocaleLowerCase();
  const to = target?.toLocaleLowerCase();
  const normalizedInput = normalize(input);

  if (from === to) {
    return { output: input, coverage: 1, partial: false };
  }

  if (from === "balochi" && to === "english") {
    const exact = exactBalochiEntry(input)?.meanings.join(", ");
    if (exact) {
      return { output: exact, coverage: 1, partial: false };
    }

    const draft = translateTokens(input, balochiTokenToEnglish);
    return {
      output: draft.output,
      coverage: draft.coverage,
      partial: draft.coverage < 1,
    };
  }

  if (from === "english" && to === "balochi") {
    const phrase = commonEnglishToBalochi[normalizedInput.toLocaleLowerCase()];
    if (phrase) {
      return { output: phrase, coverage: 1, partial: false };
    }

    const matches = englishEntries(input);
    if (matches.length) {
      return {
        output: matches
          .slice(0, 8)
          .map((entry) => {
            const latin = entry.latin?.[0] ? " (" + entry.latin[0] + ")" : "";
            return entry.word + latin;
          })
          .join(" / "),
        coverage: 1,
        partial: false,
      };
    }

    const draft = translateTokens(input, englishTokenToBalochi);
    return {
      output: draft.output,
      coverage: draft.coverage,
      partial: draft.coverage < 1,
    };
  }

  return null;
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
  const result = await runTextModel({ ...request, mode: "chat" });

  if (!result.configured || !result.output) return null;

  return new Response(result.output, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Zuban-Provider": result.provider ?? "unknown",
      "X-Zuban-Model": result.model ?? "unknown",
      "X-Zuban-Stream-Format": "plain",
    },
  });
}

export async function runTextModel(request: TextRequest) {
  const provider = resolveProvider();

  if (!provider) {
    if (request.mode === "translate") {
      const local = localDictionaryTranslation(
        request.input,
        request.source,
        request.target,
      );

      if (local) {
        return {
          configured: true,
          output: local.output,
          message: local.partial
            ? "Draft translation: words not yet covered by the sourced Zubán lexicon were preserved unchanged."
            : "",
          provider: "dictionary",
          model: "Zubán Lexicon",
          coverage: local.coverage,
          partial: local.partial,
        };
      }

      return {
        configured: true,
        output: request.input,
        message:
          "This language pair is not yet covered by Zubán’s sourced translator, so the original text was preserved.",
        provider: "dictionary",
        model: "Zubán Lexicon",
        coverage: 0,
        partial: true,
      };
    }

    const localOutput = localDictionaryChat(request.input);

    return {
      configured: true,
      output: localOutput,
      message: "",
      provider: "dictionary",
      model: "Zubán Lexicon",
    };
  }

  if (provider.provider === "gemini") {
    const prompt = [
      systemPrompt(request),
      "",
      ...conversationFor(request).map(
        (message) =>
          (message.role === "assistant" ? "Assistant: " : "User: ") +
          message.content,
      ),
    ].join("\n");

    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: request.mode === "translate" ? 0.1 : 0.25,
          maxOutputTokens: request.mode === "translate" ? 700 : 900,
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(35_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Gemini returned ${response.status}${detail ? ": " + detail.slice(0, 180) : ""}`,
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const output = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!output) throw new Error("Gemini returned no text.");

    return {
      configured: true,
      output,
      message: "",
      provider: "gemini",
      model: provider.model,
    };
  }

  if (provider.provider === "vercel") {
    const { text } = await generateText({
      model: provider.model,
      system: systemPrompt(request),
      messages: conversationFor(request),
      temperature: request.mode === "translate" ? 0.1 : 0.25,
      maxOutputTokens: request.mode === "translate" ? 700 : 900,
      maxRetries: 2,
      timeout: 30_000,
    });

    const output = text.trim();
    if (!output) throw new Error("AI Gateway returned no text.");

    return {
      configured: true,
      output,
      message: "",
      provider: "vercel",
      model: provider.model,
    };
  }

  const resolved = providerPayload(request);
  if (!resolved) throw new Error("Text provider is not configured.");

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
