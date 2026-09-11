const TRANSFORMERS_CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";
const MODEL_ID = "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA";

let transformersPromise = null;
let generatorPromise = null;
let backend = "cpu";

async function getTransformers() {
  if (!transformersPromise) {
    transformersPromise = import(TRANSFORMERS_CDN);
  }
  return transformersPromise;
}

function postProgress(id, progress, text, activeBackend = backend) {
  self.postMessage({
    type: "progress",
    id,
    progress: typeof progress === "number" ? Math.max(0, Math.min(1, progress)) : 0,
    text,
    backend: activeBackend,
  });
}

async function createGenerator(id) {
  const transformers = await getTransformers();

  const load = async (device) => {
    const activeBackend = device === "webgpu" ? "webgpu" : "cpu";
    const dtype = device === "webgpu" ? "q4f16" : "q8";

    postProgress(
      id,
      0,
      activeBackend === "webgpu"
        ? "Loading compact accelerated local AI…"
        : "Loading compact CPU local AI…",
      activeBackend,
    );

    return transformers.pipeline("text-generation", MODEL_ID, {
      ...(device === "webgpu" ? { device: "webgpu" } : {}),
      dtype,
      progress_callback: (report) => {
        const progress =
          typeof report.progress === "number" ? report.progress : 0;
        const label =
          progress >= 1 && report.file
            ? "Download complete · starting model…"
            : report.status === "progress" && report.file
              ? "Downloading " + report.file
              : report.status === "ready"
                ? "Finalizing local model…"
                : report.status || "Preparing local model…";

        postProgress(id, progress, label, activeBackend);
      },
    });
  };

  if ("gpu" in navigator) {
    try {
      const generator = await load("webgpu");
      backend = "webgpu";
      return generator;
    } catch {
      self.postMessage({
        type: "backend-fallback",
        id,
        text: "GPU acceleration is unavailable. Switching to compact CPU mode…",
      });
    }
  }

  const generator = await load("cpu");
  backend = "cpu";
  return generator;
}

async function getGenerator(id) {
  if (!generatorPromise) {
    generatorPromise = createGenerator(id).catch((error) => {
      generatorPromise = null;
      throw error;
    });
  }
  return generatorPromise;
}

function finalTextFromResult(result) {
  const generated = result?.[0]?.generated_text;

  if (Array.isArray(generated)) {
    const last = generated[generated.length - 1];
    if (last && typeof last.content === "string") return last.content.trim();
  }

  if (typeof generated === "string") return generated.trim();
  return "";
}

self.onmessage = async (event) => {
  const data = event.data || {};
  if (data.type !== "generate") return;

  const id = data.id;

  try {
    const transformers = await getTransformers();
    const generator = await getGenerator(id);

    let streamed = "";
    const streamer = new transformers.TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      callback_function: (text) => {
        if (!text) return;
        streamed += text;
        self.postMessage({
          type: "chunk",
          id,
          text: streamed,
          backend,
        });
      },
    });

    self.postMessage({
      type: "ready",
      id,
      backend,
      model: MODEL_ID,
    });

    const result = await generator(data.messages, {
      max_new_tokens: Math.min(Number(data.maxTokens) || 256, 384),
      do_sample: Number(data.temperature) > 0,
      temperature: Number(data.temperature) || 0.2,
      repetition_penalty: 1.08,
      streamer,
    });

    const finalText = streamed.trim() || finalTextFromResult(result);

    if (!finalText) {
      throw new Error("Local model returned no text.");
    }

    self.postMessage({
      type: "done",
      id,
      text: finalText,
      backend,
      model: MODEL_ID,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      id,
      message:
        error instanceof Error
          ? error.message
          : "The local AI engine could not start.",
    });
  }
};
