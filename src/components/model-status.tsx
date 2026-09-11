"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/components/experience-provider";

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
  const { language, t } = useExperience();
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
      type: t("status.text", "Text model"),
      label: t("status.chat", "Chat + Translate"),
      online: Boolean(status?.text || status?.browserTextFallback),
      limited: !status?.text && Boolean(status?.browserTextFallback || status?.dictionaryFallback),
      detail: status?.text
        ? (status.textProvider === "huggingface" ? "Hugging Face · " : status.textProvider === "ollama" ? "Ollama · " : "") +
          (status.textModel ?? "configured model")
        : status?.browserTextFallback
          ? (language === "bal" ? "WebGPU ءَ مقامی AI · لاگن لازم نہ انت" : "On-device WebGPU AI · no login required")
          : status?.dictionaryFallback
            ? (language === "bal" ? "لبزنامگ موڈ · درست لبز درگیج / ترجمه" : "Dictionary mode · exact word lookup/translation")
            : (language === "bal" ? "متن AI دستیاب نہ انت" : "Text AI unavailable"),
    },
    {
      key: "stt",
      type: "STT",
      label: t("status.stt", "Speech to text"),
      online: Boolean(status?.speechToText),
      limited: false,
      detail: status?.speechToText
        ? (language === "bal" ? "بلوچی STT endpoint جڑ بوتگ" : "Balochi STT endpoint connected")
        : (language === "bal" ? "بلوچی Whisper سروس deploy کن" : "Deploy the Balochi Whisper service"),
    },
    {
      key: "tts",
      type: "TTS",
      label: t("status.tts", "Text to speech"),
      online: Boolean(status?.textToSpeech),
      limited: false,
      detail: status?.textToSpeech
        ? (language === "bal" ? "بلوچی TTS endpoint جڑ بوتگ" : "Balochi TTS endpoint connected")
        : (language === "bal" ? "بلوچی SpeechT5 سروس deploy کن" : "Deploy the Balochi SpeechT5 service"),
    },
    {
      key: "ocr",
      type: t("status.vision", "Vision"),
      label: t("status.ocr", "OCR"),
      online: Boolean(status?.ocr),
      limited: status?.ocrProvider !== "model endpoint",
      detail: status?.ocrProvider === "model endpoint"
        ? (language === "bal" ? "OCR ماڈل endpoint" : "OCR model endpoint")
        : (language === "bal" ? "براوزر اردو + فارسی + عربی OCR" : "Browser Urdu + Persian + Arabic OCR"),
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
          <small>{status === null ? t("status.checking", "Checking…") : service.detail}</small>
        </div>
      ))}
    </div>
  );
}
