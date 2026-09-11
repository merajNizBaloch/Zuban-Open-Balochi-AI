"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience-provider";

type Mode = "stt" | "ocr";

const publicModelServer = process.env.NEXT_PUBLIC_ZUBAN_MODEL_SERVER_URL?.replace(/\/$/, "");

export function MediaWorkbench({ mode }: { mode: Mode }) {
  const { t } = useExperience();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!recording) return;

    const timer = window.setInterval(() => {
      setRecordingSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [recording]);

  async function browserOcr(image: File) {
    setProgress("Loading OCR language data…");

    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker(["urd", "fas", "ara"], 1, {
      logger: (event) => {
        if (event.status === "recognizing text" && typeof event.progress === "number") {
          setProgress("Reading text… " + Math.round(event.progress * 100) + "%");
        } else if (event.status) {
          setProgress(event.status.replace(/^./, (letter) => letter.toUpperCase()) + "…");
        }
      },
    });

    try {
      const recognition = await worker.recognize(image);
      const text = recognition.data.text.trim();

      if (!text) {
        setMessage(
          "No text was detected. Try a sharper image with higher contrast. Browser OCR uses Urdu, Persian and Arabic script models as a Balochi fallback.",
        );
        return;
      }

      setResult(text);
      setMessage(
        "Browser OCR fallback was used. Balochi has characters and spelling patterns that Urdu/Persian/Arabic OCR may misread, so verify the result.",
      );
    } finally {
      await worker.terminate();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || loading) return;

    if (file.size > 15 * 1024 * 1024) {
      setMessage("This file is larger than the 15 MB limit.");
      return;
    }

    const form = new FormData();
    form.set("mode", mode);
    form.set("file", file);

    setLoading(true);
    setResult("");
    setMessage("");
    setProgress(mode === "ocr" ? "Checking OCR service…" : "Uploading audio…");

    try {
      const directEndpoint = publicModelServer
        ? publicModelServer + (mode === "stt" ? "/stt" : "/ocr")
        : "";

      const response = await fetch(directEndpoint || "/api/media", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as { text?: string; message?: string; error?: string };

      if (response.ok && data.text) {
        setResult(data.text);
        setMessage("");
        return;
      }

      if (mode === "ocr" && response.status === 503) {
        await browserOcr(file);
        return;
      }

      setMessage(data.message ?? data.error ?? "The media service could not process this file.");
    } catch {
      if (mode === "ocr") {
        try {
          await browserOcr(file);
        } catch {
          setMessage("OCR could not start in this browser. Please try another browser or configure the OCR model endpoint.");
        }
      } else {
        setMessage("The speech service could not be reached.");
      }
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  async function startRecording() {
    if (mode !== "stt" || recording) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("Microphone recording is not supported in this browser. You can still upload an audio file.");
      return;
    }

    try {
      setMessage("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        const extension = mime.includes("ogg") ? "ogg" : mime.includes("mp4") ? "m4a" : "webm";
        setFile(new File([blob], "zuban-recording." + extension, { type: mime }));
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setRecording(false);
      };

      recorder.start();
      setRecordingSeconds(0);
      setRecording(true);
    } catch {
      setMessage("Microphone permission was not granted.");
      setRecording(false);
    }
  }

  function stopRecording() {
    if (!recording) return;
    mediaRecorderRef.current?.stop();
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setMessage("Copy is not available in this browser.");
    }
  }

  function reset() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    setRecording(false);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setFile(null);
    setResult("");
    setMessage("");
    setProgress("");
  }

  const accepts = mode === "stt" ? "audio/*" : "image/*";

  return (
    <form className="media-workbench" onSubmit={submit}>
      <div className="media-input-area">
        {previewUrl ? (
          <div className="ocr-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Selected Balochi document" />
          </div>
        ) : null}

        <label className="file-drop">
          <span className="lab-icon">{mode === "stt" ? "WAV" : "OCR"}</span>
          <strong>
            {file
              ? file.name
              : mode === "stt"
                ? t("media.choose.audio", "Choose Balochi audio")
                : t("media.choose.image", "Choose a printed Balochi image")}
          </strong>
          <span>
            {mode === "stt"
              ? t("media.audio.desc", "Upload an audio file or record directly from your microphone.")
              : t("media.image.desc", "Use a clear, well-lit image with readable printed text. OCR can run directly in your browser.")}
          </span>
          <input
            accept={accepts}
            type="file"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setFile(nextFile);
              setPreviewUrl(mode === "ocr" && nextFile ? URL.createObjectURL(nextFile) : "");
              setResult("");
              setMessage("");
              setProgress("");
            }}
          />
        </label>

        {mode === "stt" && (
          <div className="record-controls">
            {!recording ? (
              <button className="record-button" type="button" onClick={() => void startRecording()}>
                <span className="record-dot" />
                {t("media.record", "Record microphone")}
              </button>
            ) : (
              <button className="record-button recording" type="button" onClick={stopRecording}>
                <span className="record-pulse" aria-hidden="true"><i /><i /><i /></span>
                <span className="record-stop" />
                Stop · {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="workbench-actions">
        <span>
          {progress ||
            (file
              ? Math.max(1, Math.round(file.size / 1024)).toLocaleString() + " KB selected"
              : mode === "stt"
                ? "Audio up to 15 MB"
                : "Runs locally in the browser when no OCR server is configured")}
        </span>
        <div className="media-actions">
          {(file || result) && <button className="quiet-button" type="button" onClick={reset}>{t("media.reset", "Reset")}</button>}
          <button className="button primary" disabled={!file || loading || recording} type="submit">
            {loading
              ? (mode === "ocr" ? t("media.reading", "Reading…") : t("media.processing", "Processing…"))
              : mode === "stt"
                ? t("media.transcribe", "Transcribe")
                : t("media.extract", "Extract text")}
          </button>
        </div>
      </div>

      {(result || message) && (
        <div className="media-result">
          <div className="result-toolbar">
            <span>{result ? t("media.result", "Result") : t("media.status", "Status")}</span>
            {result && <button type="button" onClick={() => void copyResult()}>{t("media.copy", "Copy")}</button>}
          </div>
          {result && <p className="model-output" dir="auto" lang="bal">{result}</p>}
          {result && (
            <a
              className="media-correction-link"
              href={
                "/community?type=" +
                encodeURIComponent(mode === "ocr" ? "OCR correction" : "Pronunciation / voice") +
                "&title=" +
                encodeURIComponent(mode === "ocr" ? "OCR text correction" : "Speech transcription correction") +
                "&details=" +
                encodeURIComponent(
                  (mode === "ocr" ? "OCR result:\n" : "Speech transcription:\n") +
                  result +
                  "\n\nCorrected text / notes:\n",
                )
              }
            >
              {mode === "ocr"
                ? t("media.ocr.correct", "Suggest OCR correction →")
                : t("media.stt.correct", "Correct transcription →")}
            </a>
          )}
          {message && <div className="system-note">{message}</div>}
        </div>
      )}
    </form>
  );
}
