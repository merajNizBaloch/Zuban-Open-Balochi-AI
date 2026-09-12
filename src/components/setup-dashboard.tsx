"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/components/experience-provider";

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
  const { language, t } = useExperience();
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
          title: t("status.chat", "Chat + Translate"),
          state: status.text || status.dictionaryFallback ? "ready" : "limited",
          detail:
            status.text || status.dictionaryFallback
              ? "Ready to use."
              : "Basic language help is available, but some replies may be limited.",
        },
        {
          title: t("status.stt", "Speech to text"),
          state: status.speechToText ? "ready" : "limited",
          detail: status.speechToText
            ? "Ready to turn Balochi speech into text."
            : "Not available yet.",
        },
        {
          title: t("status.tts", "Text to speech"),
          state: status.textToSpeech ? "ready" : "limited",
          detail: status.textToSpeech
            ? "Ready to read Balochi text aloud."
            : "Not available yet.",
        },
        {
          title: t("status.ocr", "Read text from images"),
          state: status.ocr ? "ready" : "limited",
          detail: status.ocr
            ? "Ready to read printed text from clear images."
            : "Not available yet.",
        },
      ]
    : [
        {
          title: language === "bal" ? "سروس" : "Services",
          state: "checking",
          detail: language === "bal" ? "بررسی بوتگ…" : "Checking what is available…",
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
                  ? t("setup.ready", "Ready")
                  : item.state === "limited"
                    ? t("setup.fallback", "Fallback")
                    : item.state === "missing"
                      ? t("setup.needs", "Needs setup")
                      : t("setup.checking", "Checking")}
              </span>
            </div>
            <p>{item.detail}</p>

          </article>
        ))}
      </div>

      <div className="setup-code">
        <div>
          <h2>{t("setup.recommended", "What this means")}</h2>
          <p>
            {language === "bal"
              ? "تیار نشان بدنت کہ فیچر کار کنت. اگر محدود بیت، زُبان هنوز بنیادی کار کنگ بہ کنت."
              : "Ready means the feature works now. Limited means it can still help, but some requests may not work yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
