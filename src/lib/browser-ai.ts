"use client";

type PuterModel = {
  id?: string;
  name?: string;
  provider?: string;
  cost?: {
    input?: number;
    output?: number;
  };
};

type PuterChunk = {
  type?: string;
  text?: string;
  message?: string;
};

type PuterResponse = {
  message?: {
    content?: string | Array<{ type?: string; text?: string }>;
  };
};

type PuterApi = {
  ai: {
    chat: (
      messages: Array<{ role: string; content: string }>,
      options?: {
        model?: string;
        stream?: boolean;
        temperature?: number;
        max_tokens?: number;
      },
    ) => Promise<PuterResponse | AsyncIterable<PuterChunk>>;
    listModels: () => Promise<PuterModel[]>;
  };
};

declare global {
  interface Window {
    puter?: PuterApi;
  }
}

let scriptPromise: Promise<PuterApi> | null = null;
let preferredModelPromise: Promise<string | undefined> | null = null;

function loadPuter() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser AI is only available in the browser."));
  }

  if (window.puter) return Promise.resolve(window.puter);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<PuterApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-zuban-puter="true"]',
    );

    const ready = () => {
      if (window.puter) resolve(window.puter);
      else reject(new Error("Browser AI loaded without an API object."));
    };

    if (existing) {
      existing.addEventListener("load", ready, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Browser AI could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.dataset.zubanPuter = "true";
    script.addEventListener("load", ready, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Browser AI could not be loaded.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function modelScore(model: PuterModel) {
  const value = ((model.id ?? "") + " " + (model.name ?? "")).toLocaleLowerCase();

  let family = 100;
  if (value.includes("qwen")) family = 0;
  else if (value.includes("gemma")) family = 10;
  else if (value.includes("llama")) family = 20;
  else if (value.includes("mistral")) family = 30;
  else if (value.includes("deepseek")) family = 40;

  const input = model.cost?.input ?? 0;
  const output = model.cost?.output ?? 0;
  return family * 1_000_000 + input + output;
}

async function preferredOpenModel(puter: PuterApi) {
  if (!preferredModelPromise) {
    preferredModelPromise = (async () => {
      try {
        const models = await puter.ai.listModels();
        const openFamilies = models
          .filter((model) => {
            const value =
              ((model.id ?? "") + " " + (model.name ?? "")).toLocaleLowerCase();
            return /qwen|gemma|llama|mistral|deepseek/.test(value);
          })
          .sort((a, b) => modelScore(a) - modelScore(b));

        return openFamilies[0]?.id;
      } catch {
        return undefined;
      }
    })();
  }

  return preferredModelPromise;
}

function contentFromResponse(response: PuterResponse) {
  const content = response.message?.content;
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .filter((item) => item.type === "text" || typeof item.text === "string")
      .map((item) => item.text ?? "")
      .join("")
      .trim();
  }

  return "";
}

export async function browserAiComplete(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: { temperature?: number; maxTokens?: number },
) {
  const puter = await loadPuter();
  const model = await preferredOpenModel(puter);

  const response = (await puter.ai.chat(messages, {
    ...(model ? { model } : {}),
    temperature: options?.temperature ?? 0.25,
    max_tokens: options?.maxTokens ?? 1200,
  })) as PuterResponse;

  const text = contentFromResponse(response);
  if (!text) throw new Error("Browser AI returned no text.");

  return { text, model: model ?? "automatic" };
}

export async function browserAiStream(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  onChunk: (text: string) => void,
  options?: { temperature?: number; maxTokens?: number },
) {
  const puter = await loadPuter();
  const model = await preferredOpenModel(puter);

  const response = (await puter.ai.chat(messages, {
    ...(model ? { model } : {}),
    stream: true,
    temperature: options?.temperature ?? 0.25,
    max_tokens: options?.maxTokens ?? 1200,
  })) as AsyncIterable<PuterChunk>;

  let text = "";

  for await (const part of response) {
    if (part.type === "error") {
      throw new Error(part.message || "Browser AI request failed.");
    }

    if (part.type === "text" && part.text) {
      text += part.text;
      onChunk(text);
    } else if (part.text) {
      text += part.text;
      onChunk(text);
    }
  }

  if (!text.trim()) throw new Error("Browser AI returned no text.");
  return { text: text.trim(), model: model ?? "automatic" };
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
