"use client";

import { useEffect, useState } from "react";

type Status = {
  text: boolean;
  textProvider?: string | null;
  textModel?: string | null;
  speechToText: boolean;
  textToSpeech: boolean;
  ocr: boolean;
  ocrProvider?: string | null;
  dictionaryFallback?: boolean;
  browserTextFallback?: boolean;
};

export function ModelStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setStatus(data as Status))
      .catch(() =>
        setStatus({
          text: false,
          speechToText: false,
          textToSpeech: false,
          ocr: true,
          ocrProvider: "browser OCR",
        }),
      );
  }, []);

  const services = [
    {
      key: "text",
      type: "Text model",
      label: "Chat + Translate",
      online: Boolean(status?.text || status?.browserTextFallback),
      limited: !status?.text && Boolean(status?.browserTextFallback || status?.dictionaryFallback),
      detail: status?.text
        ? (status.textProvider === "huggingface" ? "Hugging Face · " : status.textProvider === "ollama" ? "Ollama · " : "") +
          (status.textModel ?? "configured model")
        : status?.browserTextFallback
          ? "Browser AI fallback · no developer key required"
          : status?.dictionaryFallback
            ? "Dictionary mode · exact word lookup/translation"
            : "Text AI unavailable",
    },
    {
      key: "stt",
      type: "STT",
      label: "Speech to text",
      online: Boolean(status?.speechToText),
      limited: false,
      detail: status?.speechToText ? "Balochi STT endpoint connected" : "Deploy the Balochi Whisper service",
    },
    {
      key: "tts",
      type: "TTS",
      label: "Text to speech",
      online: Boolean(status?.textToSpeech),
      limited: false,
      detail: status?.textToSpeech ? "Balochi TTS endpoint connected" : "Deploy the Balochi SpeechT5 service",
    },
    {
      key: "ocr",
      type: "Vision",
      label: "OCR",
      online: Boolean(status?.ocr),
      limited: status?.ocrProvider !== "model endpoint",
      detail: status?.ocrProvider === "model endpoint" ? "OCR model endpoint" : "Browser Urdu + Persian + Arabic OCR",
    },
  ];

  return (
    <div className="model-status-grid">
      {services.map((service) => (
        <div className="model-status-item" key={service.key}>
          <div>
            <span>{service.type}</span>
            <strong>{service.label}</strong>
          </div>
          <span className={service.online ? (service.limited ? "service-dot limited" : "service-dot online") : "service-dot"} />
          <small>{status === null ? "Checking…" : service.detail}</small>
        </div>
      ))}
    </div>
  );
}
