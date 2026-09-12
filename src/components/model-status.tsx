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
      type: t("status.text", "Writing"),
      label: t("status.chat", "Chat + Translate"),
      online: Boolean(status?.text || status?.browserTextFallback || status?.dictionaryFallback),
      limited: !status?.text && Boolean(status?.browserTextFallback || status?.dictionaryFallback),
      detail:
        status?.text || status?.dictionaryFallback
          ? (language === "bal" ? "کار کنت" : "Ready to use")
          : (language === "bal" ? "هنوز محدود اِنت" : "Limited right now"),
    },
    {
      key: "stt",
      type: language === "bal" ? "گُشدار" : "Listening",
      label: t("status.stt", "Speech to text"),
      online: Boolean(status?.speechToText),
      limited: false,
      detail: status?.speechToText
        ? (language === "bal" ? "کار کنت" : "Ready to use")
        : (language === "bal" ? "هنوز دستیاب نہ انت" : "Not available yet"),
    },
    {
      key: "tts",
      type: language === "bal" ? "آواز" : "Speaking",
      label: t("status.tts", "Text to speech"),
      online: Boolean(status?.textToSpeech),
      limited: false,
      detail: status?.textToSpeech
        ? (language === "bal" ? "کار کنت" : "Ready to use")
        : (language === "bal" ? "هنوز دستیاب نہ انت" : "Not available yet"),
    },
    {
      key: "ocr",
      type: language === "bal" ? "عکس" : "Images",
      label: t("status.ocr", "Read text from images"),
      online: Boolean(status?.ocr),
      limited: false,
      detail: status?.ocr
        ? (language === "bal" ? "کار کنت" : "Ready to use")
        : (language === "bal" ? "هنوز دستیاب نہ انت" : "Not available yet"),
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
