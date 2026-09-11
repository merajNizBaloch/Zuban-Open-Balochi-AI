"use client";

type BrowserMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type BrowserAiOptions = {
  temperature?: number;
  maxTokens?: number;
  onProgress?: (progress: { progress: number; text: string }) => void;
};

type CompletionChunk = {
  choices?: Array<{
    delta?: { content?: string | null };
  }>;
};

type CompletionResponse = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
};

type WebLlmModule = {
  CreateMLCEngine: (
    model: string,
    options: {
      initProgressCallback?: (report: {
        progress?: number;
        text?: string;
      }) => void;
    },
  ) => Promise<LocalEngine>;
};

type LocalEngine = {
  chat: {
    completions: {
      create: (request: {
        messages: BrowserMessage[];
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
        stream_options?: { include_usage?: boolean };
      }) => Promise<CompletionResponse | AsyncIterable<CompletionChunk>>;
    };
  };
  interruptGenerate: () => void;
};

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const WEBLLM_CDN = "https://esm.run/@mlc-ai/web-llm@0.2.85";

let enginePromise: Promise<LocalEngine> | null = null;
let engineInstance: LocalEngine | null = null;

function requireWebGpu() {
  if (typeof window === "undefined") {
    throw new Error("Local AI is only available in the browser.");
  }

  if (!("gpu" in navigator)) {
    throw new Error(
      "This browser does not support WebGPU. Use a recent Chrome, Edge, or Safari browser, or connect a server-side model.",
    );
  }
}

async function loadWebLlmModule() {
  const importByUrl = new Function(
    "url",
    "return import(url)",
  ) as (url: string) => Promise<WebLlmModule>;

  try {
    return await importByUrl(WEBLLM_CDN);
  } catch (error) {
    throw new Error(
      "The on-device AI engine could not be downloaded. Check your internet connection, content blocker, or network policy and try again. " +
        (error instanceof Error ? error.message : ""),
    );
  }
}

async function getEngine(onProgress?: BrowserAiOptions["onProgress"]) {
  requireWebGpu();

  if (engineInstance) return engineInstance;
  if (enginePromise) return enginePromise;

  enginePromise = (async () => {
    try {
      onProgress?.({
        progress: 0,
        text: "Loading the on-device AI engine…",
      });

      const webllm = await loadWebLlmModule();

      const engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
          onProgress?.({
            progress:
              typeof report.progress === "number"
                ? Math.max(0, Math.min(1, report.progress))
                : 0,
            text: report.text || "Preparing local AI…",
          });
        },
      });

      engineInstance = engine;
      return engine;
    } catch (error) {
      enginePromise = null;
      throw error;
    }
  })();

  return enginePromise;
}

export async function browserAiComplete(
  messages: BrowserMessage[],
  options?: BrowserAiOptions,
) {
  const engine = await getEngine(options?.onProgress);

  const response = (await engine.chat.completions.create({
    messages,
    temperature: options?.temperature ?? 0.25,
    max_tokens: options?.maxTokens ?? 900,
    stream: false,
  })) as CompletionResponse;

  const text = response.choices?.[0]?.message?.content?.trim() ?? "";

  if (!text) throw new Error("Local AI returned no text.");

  return { text, model: MODEL_ID };
}

export async function browserAiStream(
  messages: BrowserMessage[],
  onChunk: (text: string) => void,
  options?: BrowserAiOptions,
) {
  const engine = await getEngine(options?.onProgress);

  const response = await engine.chat.completions.create({
    messages,
    temperature: options?.temperature ?? 0.25,
    max_tokens: options?.maxTokens ?? 1200,
    stream: true,
    stream_options: { include_usage: true },
  });

  let text = "";

  if (
    response &&
    typeof response === "object" &&
    Symbol.asyncIterator in response
  ) {
    for await (const chunk of response as AsyncIterable<CompletionChunk>) {
      const delta = chunk.choices?.[0]?.delta?.content ?? "";
      if (!delta) continue;

      text += delta;
      onChunk(text);
    }
  } else {
    const complete = response as CompletionResponse;
    text = complete.choices?.[0]?.message?.content?.trim() ?? "";
    if (text) onChunk(text);
  }

  if (!text.trim()) throw new Error("Local AI returned no text.");

  return { text: text.trim(), model: MODEL_ID };
}

export function stopBrowserAiGeneration() {
  engineInstance?.interruptGenerate();
}

export function browserAiModelName() {
  return MODEL_ID;
}

export function isMissingServerModelMessage(value: string) {
  const text = value.toLocaleLowerCase();

  return (
    text.includes("no ai model is connected") ||
    text.includes("no text model is connected") ||
    text.includes("text model returned 401") ||
    text.includes("text model returned 403")
  );
}
