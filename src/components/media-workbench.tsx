"use client";

import { FormEvent, useState } from "react";

type Mode = "stt" | "ocr";

export function MediaWorkbench({ mode }: { mode: Mode }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || loading) return;

    const form = new FormData();
    form.set("mode", mode);
    form.set("file", file);

    setLoading(true);
    setResult("");
    setMessage("");

    try {
      const response = await fetch("/api/media", { method: "POST", body: form });
      const data = (await response.json()) as { text?: string; message?: string; error?: string };
      setResult(data.text ?? "");
      setMessage(data.message ?? data.error ?? "");
    } catch {
      setMessage("The media service could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  const accepts = mode === "stt" ? "audio/*" : "image/*";

  return (
    <form className="media-workbench" onSubmit={submit}>
      <label className="file-drop">
        <span className="lab-icon">{mode === "stt" ? "WAV" : "OCR"}</span>
        <strong>{file ? file.name : mode === "stt" ? "Choose a Balochi audio file" : "Choose a printed Balochi image"}</strong>
        <span>{mode === "stt" ? "Audio is forwarded only to the configured STT endpoint." : "Images are forwarded only to the configured OCR endpoint."}</span>
        <input accept={accepts} type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </label>

      <div className="workbench-actions">
        <span>{mode === "stt" ? "Speech → text" : "Image → text"} · experimental adapter</span>
        <button className="button primary" disabled={!file || loading} type="submit">
          {loading ? "Processing…" : mode === "stt" ? "Transcribe" : "Extract text"}
        </button>
      </div>

      {(result || message) && (
        <div className="media-result">
          <span className="pane-label">RESULT</span>
          {result && <p className="model-output">{result}</p>}
          {message && <div className="system-note">{message}</div>}
        </div>
      )}
    </form>
  );
}
