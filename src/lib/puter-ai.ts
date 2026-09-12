"use client";

type PuterRole = "system" | "user" | "assistant";

export type PuterMessage = {
  role: PuterRole;
  content: string;
};

type PuterChatResponse = {
  text?: string;
  message?: {
    content?:
      | string
      | Array<{
          type?: string;
          text?: string;
        }>;
  };
};

type PuterApi = {
  ai: {
    chat: (
      messages: PuterMessage[] | string,
      options?: {
        model?: string;
      },
    ) => Promise<PuterChatResponse | string>;
  };
};

declare global {
  interface Window {
    puter?: PuterApi;
  }
}

let loadPromise: Promise<PuterApi> | null = null;

function extractText(response: PuterChatResponse | string) {
  if (typeof response === "string") return response.trim();

  if (typeof response.text === "string" && response.text.trim()) {
    return response.text.trim();
  }

  const content = response.message?.content;

  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}

export function loadPuterAi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Free chat is only available in the browser."));
  }

  if (window.puter?.ai) return Promise.resolve(window.puter);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<PuterApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-zuban-puter="true"]',
    );

    const finish = () => {
      if (window.puter?.ai) {
        resolve(window.puter);
      } else {
        loadPromise = null;
        reject(new Error("Free conversational AI could not initialize."));
      }
    };

    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => {
          loadPromise = null;
          reject(new Error("Free conversational AI could not load."));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.dataset.zubanPuter = "true";
    script.addEventListener("load", finish, { once: true });
    script.addEventListener(
      "error",
      () => {
        loadPromise = null;
        reject(new Error("Free conversational AI could not load."));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function puterChat(
  messages: PuterMessage[],
  model = "gpt-5-nano",
) {
  const puter = await loadPuterAi();
  const response = await puter.ai.chat(messages, { model });
  const text = extractText(response);

  if (!text) {
    throw new Error("Free conversational AI returned an empty response.");
  }

  return text;
}
