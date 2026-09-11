"use client";

import { useEffect, useState } from "react";

type Status = {
  text: boolean;
  textProvider?: string | null;
  textModel?: string | null;
  dictionaryFallback?: boolean;
  browserTextFallback?: boolean;
  modelServerConfigured?: boolean;
  modelServerReachable?: boolean;
  modelServerDevice?: string | null;
  sttModelLoaded?: boolean;
  ttsModelLoaded?: boolean;
  speechToText: boolean;
  textToSpeech: boolean;
  ocr: boolean;
  ocrProvider?: string | null;
};

type SetupItem = {
  title: string;
  state: "ready" | "limited" | "missing" | "checking";
  detail: string;
  env?: string;
};

export function SetupDashboard() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setStatus(data as Status))
      .catch(() => setStatus(null));
  }, []);

  const items: SetupItem[] = status
    ? [
        {
          title: "Chat + Translate",
          state: status.text ? "ready" : status.browserTextFallback ? "limited" : status.dictionaryFallback ? "limited" : "missing",
          detail: status.text
            ? `Connected through ${status.textProvider ?? "custom provider"} · ${status.textModel ?? "configured model"}`
            : status.browserTextFallback
              ? "Chat and Translate can use browser AI fallback. A server-side provider is still recommended for predictable production behavior."
              : status.dictionaryFallback
                ? "Dictionary lookup and exact English ↔ Balochi words work without a model."
                : "No text provider is configured.",
          env: status.text ? undefined : "Optional: HF_TOKEN or ZUBAN_TEXT_API_URL or OLLAMA_BASE_URL",
        },
        {
          title: "Balochi model server",
          state: status.modelServerReachable
            ? "ready"
            : status.modelServerConfigured
              ? "limited"
              : "missing",
          detail: status.modelServerReachable
            ? "Server reachable" +
              (status.modelServerDevice ? " · " + status.modelServerDevice.toUpperCase() : "") +
              " · STT " + (status.sttModelLoaded ? "warm" : "cold") +
              " · TTS " + (status.ttsModelLoaded ? "warm" : "cold")
            : status.modelServerConfigured
              ? "A model-server URL is configured but /health is not reachable."
              : "No shared Balochi model server is configured.",
          env: status.modelServerReachable ? undefined : "ZUBAN_MODEL_SERVER_URL",
        },
        {
          title: "Speech to text",
          state: status.speechToText ? "ready" : "missing",
          detail: status.speechToText
            ? "Balochi Whisper transcription is connected" +
              (status.sttModelLoaded ? " and loaded." : ", but the first request may need to load the model.")
            : "The UI works, but Balochi Whisper needs the model server.",
          env: status.speechToText ? undefined : "ZUBAN_MODEL_SERVER_URL",
        },
        {
          title: "Text to speech",
          state: status.textToSpeech ? "ready" : "missing",
          detail: status.textToSpeech
            ? "Balochi SpeechT5 voice generation is connected" +
              (status.ttsModelLoaded ? " and loaded." : ", but the first request may need to load the model.")
            : "The three-voice UI is ready, but SpeechT5 needs the model server.",
          env: status.textToSpeech ? undefined : "ZUBAN_MODEL_SERVER_URL",
        },
        {
          title: "OCR",
          state: status.ocrProvider === "model endpoint" ? "ready" : "limited",
          detail: status.ocrProvider === "model endpoint"
            ? "Server OCR is connected."
            : "Browser OCR is available using Urdu + Persian + Arabic script models as a fallback.",
        },
      ]
    : [
        {
          title: "Services",
          state: "checking",
          detail: "Checking this deployment…",
        },
      ];

  return (
    <div className="setup-dashboard">
      <div className="setup-grid">
        {items.map((item) => (
          <article className="setup-item" key={item.title}>
            <div className="setup-item-head">
              <h2>{item.title}</h2>
              <span className={"setup-state " + item.state}>
                {item.state === "ready"
                  ? "Ready"
                  : item.state === "limited"
                    ? "Fallback"
                    : item.state === "missing"
                      ? "Needs setup"
                      : "Checking"}
              </span>
            </div>
            <p>{item.detail}</p>
            {item.env && (
              <div className="setup-env">
                <span>Environment</span>
                <code>{item.env}</code>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="setup-code">
        <div>
          <h2>Recommended production configuration</h2>
          <p>
            Chat and Translate can fall back to browser AI without a developer key. For a controlled production deployment, configure Hugging Face, a custom endpoint, or Ollama. One model-server URL enables Balochi STT and TTS.
          </p>
        </div>
        <pre>{`HF_TOKEN=hf_...
ZUBAN_HF_TEXT_MODEL=Qwen/Qwen3-8B:cheapest

ZUBAN_MODEL_SERVER_URL=https://your-zuban-model-server.hf.space`}</pre>
      </div>
    </div>
  );
}
