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
  resolve: (value: {
    text: string;
    model: string;
    backend: "webgpu" | "cpu";
  }) => void;
  reject: (reason?: unknown) => void;
  onChunk?: (text: string) => void;
  onProgress?: BrowserAiOptions["onProgress"];
  inactivityTimer?: ReturnType<typeof setTimeout>;
  absoluteTimer?: ReturnType<typeof setTimeout>;
  startedGenerating: boolean;
};

const WORKER_VERSION = "6";
const LOAD_INACTIVITY_MS = 35_000;
const GENERATION_INACTIVITY_MS = 25_000;
const ABSOLUTE_JOB_MS = 150_000;

let worker: Worker | null = null;
const jobs = new Map<string, PendingJob>();

function jobId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clearJobTimers(job: PendingJob) {
  if (job.inactivityTimer) clearTimeout(job.inactivityTimer);
  if (job.absoluteTimer) clearTimeout(job.absoluteTimer);
}

function rejectAndReset(message: string) {
  const error = new Error(message);

  for (const job of jobs.values()) {
    clearJobTimers(job);
    job.reject(error);
  }

  jobs.clear();
  worker?.terminate();
  worker = null;
}

function armInactivityTimer(id: string) {
  const job = jobs.get(id);
  if (!job) return;

  if (job.inactivityTimer) clearTimeout(job.inactivityTimer);

  const timeout = job.startedGenerating
    ? GENERATION_INACTIVITY_MS
    : LOAD_INACTIVITY_MS;

  job.inactivityTimer = setTimeout(() => {
    rejectAndReset(
      job.startedGenerating
        ? "Local AI stopped responding during generation. Please try again."
        : "Local AI model loading stalled. Please try again; the smaller model may continue from browser cache.",
    );
  }, timeout);
}

function destroyWorker(reason?: string) {
  worker?.terminate();
  worker = null;

  if (jobs.size) {
    const error = new DOMException(
      reason || "Local AI generation stopped.",
      "AbortError",
    );

    for (const job of jobs.values()) {
      clearJobTimers(job);
      job.reject(error);
    }

    jobs.clear();
  }
}

function getWorker() {
  if (typeof window === "undefined") {
    throw new Error("Local AI is only available in the browser.");
  }

  if (worker) return worker;

  worker = new Worker("/local-ai-worker.js?v=" + WORKER_VERSION);

  worker.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    const job = jobs.get(message.id);
    if (!job) return;

    armInactivityTimer(message.id);

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

    if (message.type === "ready") {
      job.startedGenerating = true;
      job.onProgress?.({
        progress: 1,
        text:
          message.backend === "webgpu"
            ? "Local AI ready · GPU"
            : "Local AI ready · CPU",
        backend: message.backend,
      });
      armInactivityTimer(message.id);
      return;
    }

    if (message.type === "chunk") {
      job.startedGenerating = true;
      job.onChunk?.(message.text);
      return;
    }

    if (message.type === "error") {
      clearJobTimers(job);
      jobs.delete(message.id);
      job.reject(new Error(message.message));
      return;
    }

    if (message.type === "done") {
      clearJobTimers(job);
      jobs.delete(message.id);
      job.resolve({
        text: message.text,
        model: message.model,
        backend: message.backend,
      });
    }
  });

  worker.addEventListener("error", (event) => {
    rejectAndReset(event.message || "The local AI worker crashed.");
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
    const job: PendingJob = {
      resolve,
      reject,
      onChunk,
      onProgress: options?.onProgress,
      startedGenerating: false,
    };

    job.absoluteTimer = setTimeout(() => {
      rejectAndReset(
        "Local AI took too long to start or answer. Please try again.",
      );
    }, ABSOLUTE_JOB_MS);

    jobs.set(id, job);
    armInactivityTimer(id);
  });

  localWorker.postMessage({
    type: "generate",
    id,
    messages,
    temperature: options?.temperature ?? 0.2,
    maxTokens: options?.maxTokens ?? 320,
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
  return "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA";
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
