"use client";

import { FormEvent, useEffect, useState } from "react";

const speakers = [
  { value: "ayn_kader", label: "Ayn Káder" },
  { value: "doda", label: "Dódá" },
  { value: "doden", label: "Dódén" },
];

export function VoiceWorkbench() {
  const [text, setText] = useState("");
  const [speaker, setSpeaker] = useState("ayn_kader");
  const [audioUrl, setAudioUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() || loading) return;

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speaker }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (response.ok && contentType.startsWith("audio/")) {
        setAudioUrl(URL.createObjectURL(await response.blob()));
      } else {
        const data = (await response.json()) as { message?: string; error?: string };
        setMessage(data.message ?? data.error ?? "Voice generation failed.");
      }
    } catch {
      setMessage("The voice service could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="voice-workbench" onSubmit={submit}>
      <div className="voice-options">
        <label>
          <span>Voice</span>
          <select value={speaker} onChange={(event) => setSpeaker(event.target.value)}>
            {speakers.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
        </label>
        <p>The current open Balochi TTS model works best with Latin-script Balochi and short paragraphs.</p>
      </div>

      <label className="voice-editor">
        <span className="pane-label">BALOCHI TEXT</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Enter Latin-script Balochi text for speech synthesis…"
          maxLength={600}
        />
        <span className="voice-count">{text.length} / 600</span>
      </label>

      <div className="workbench-actions">
        <span>SpeechT5 · three open Balochi speaker voices</span>
        <button className="button primary" disabled={!text.trim() || loading} type="submit">
          {loading ? "Generating…" : "Generate voice"}
        </button>
      </div>

      {audioUrl && (
        <div className="audio-result">
          <audio controls src={audioUrl}>Your browser does not support audio playback.</audio>
          <a className="audio-download" href={audioUrl} download="zuban-voice.wav">Download audio</a>
        </div>
      )}

      {message && <div className="system-note">{message}</div>}
    </form>
  );
}
