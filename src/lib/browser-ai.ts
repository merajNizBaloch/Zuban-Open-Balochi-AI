"use client";

type BrowserMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type BrowserAiOptions = {
  temperature?: number;
  maxTokens?: number;
  onProgress?: (progress: {
    progress: number;
    text: string;
    backend?: "webgpu" | "cpu";
  }) => void;
};

type WorkerMessage =
  | {
      type: "progress";
      id: string;
      progress: number;
      text: string;
      backend?: "webgpu" | "cpu";
    }
  | {
      type: "backend-fallback";
      id: string;
      text: string;
    }
  | {
      type: "ready";
      id: string;
      backend: "webgpu" | "cpu";
      model: string;
    }
  | {
      type: "chunk";
      id: string;
      text: string;
      backend: "webgpu" | "cpu";
    }
  | {
      type: "done";
      id: string;
      text: string;
      backend: "webgpu" | "cpu";
      model: string;
    }
  | {
      type: "error";
      id: string;
      message: string;
    };

type PendingJob = {
  resolve: (value: { text: string; model: string; backend: "webgpu" | "cpu" }) => void;
  reject: (reason?: unknown) => void;
  onChunk?: (text: string) => void;
  onProgress?: BrowserAiOptions["onProgress"];
};

let worker: Worker | null = null;
const jobs = new Map<string, PendingJob>();

function jobId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function destroyWorker(reason?: string) {
  worker?.terminate();
  worker = null;

  if (jobs.size) {
    const error = new DOMException(reason || "Local AI generation stopped.", "AbortError");
    for (const job of jobs.values()) job.reject(error);
    jobs.clear();
  }
}

function getWorker() {
  if (typeof window === "undefined") {
    throw new Error("Local AI is only available in the browser.");
  }

  if (worker) return worker;

  worker = new Worker("/local-ai-worker.js");

  worker.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    const job = jobs.get(message.id);
    if (!job) return;

    if (message.type === "progress") {
      job.onProgress?.({
        progress: message.progress,
        text: message.text,
        backend: message.backend,
      });
      return;
    }

    if (message.type === "backend-fallback") {
      job.onProgress?.({
        progress: 0,
        text: message.text,
        backend: "cpu",
      });
      return;
    }

    if (message.type === "chunk") {
      job.onChunk?.(message.text);
      return;
    }

    if (message.type === "error") {
      jobs.delete(message.id);
      job.reject(new Error(message.message));
      return;
    }

    if (message.type === "done") {
      jobs.delete(message.id);
      job.resolve({
        text: message.text,
        model: message.model,
        backend: message.backend,
      });
    }
  });

  worker.addEventListener("error", (event) => {
    const detail = event.message || "The local AI worker crashed.";
    destroyWorker(detail);
  });

  return worker;
}

async function runLocalAi(
  messages: BrowserMessage[],
  options?: BrowserAiOptions,
  onChunk?: (text: string) => void,
) {
  const localWorker = getWorker();
  const id = jobId();

  const result = new Promise<{
    text: string;
    model: string;
    backend: "webgpu" | "cpu";
  }>((resolve, reject) => {
    jobs.set(id, {
      resolve,
      reject,
      onChunk,
      onProgress: options?.onProgress,
    });
  });

  localWorker.postMessage({
    type: "generate",
    id,
    messages,
    temperature: options?.temperature ?? 0.2,
    maxTokens: options?.maxTokens ?? 600,
  });

  return result;
}

export async function browserAiComplete(
  messages: BrowserMessage[],
  options?: BrowserAiOptions,
) {
  return runLocalAi(messages, options);
}

export async function browserAiStream(
  messages: BrowserMessage[],
  onChunk: (text: string) => void,
  options?: BrowserAiOptions,
) {
  return runLocalAi(messages, options, onChunk);
}

export function stopBrowserAiGeneration() {
  destroyWorker("Local AI generation stopped.");
}

export function browserAiModelName() {
  return "onnx-community/Qwen2.5-0.5B-Instruct";
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
