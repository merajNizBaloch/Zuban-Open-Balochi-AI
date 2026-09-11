"use client";

import { useEffect, useState } from "react";

type Status = {
  text: boolean;
  speechToText: boolean;
  textToSpeech: boolean;
  ocr: boolean;
};

const labels: Array<[keyof Status, string, string]> = [
  ["text", "Chat + Translate", "Text model"],
  ["speechToText", "Speech to text", "STT"],
  ["textToSpeech", "Text to speech", "TTS"],
  ["ocr", "OCR", "Vision"],
];

export function ModelStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setStatus(data as Status))
      .catch(() => setStatus({ text: false, speechToText: false, textToSpeech: false, ocr: false }));
  }, []);

  return (
    <div className="model-status-grid">
      {labels.map(([key, label, type]) => {
        const online = Boolean(status?.[key]);
        return (
          <div className="model-status-item" key={key}>
            <div>
              <span>{type}</span>
              <strong>{label}</strong>
            </div>
            <span className={online ? "service-dot online" : "service-dot"} />
            <small>{status === null ? "Checking" : online ? "Connected" : "Needs model"}</small>
          </div>
        );
      })}
    </div>
  );
}
