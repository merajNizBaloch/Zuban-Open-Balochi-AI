"use client";

import { FormEvent, useState } from "react";

type Props = { mode: "chat" | "translate" };
type ApiResult = { configured?: boolean; output?: string; message?: string; error?: string };

export function ToolWorkbench({ mode }: Props) {
  const [input, setInput] = useState("");
  const [source, setSource] = useState("Auto detect");
  const [target, setTarget] = useState("Balochi");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input, source, target }),
      });
      setResult((await response.json()) as ApiResult);
    } catch {
      setResult({ error: "The text service could not be reached." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="workbench" onSubmit={submit}>
      {mode === "translate" && (
        <div className="language-row">
          <label><span>From</span><select value={source} onChange={(e) => setSource(e.target.value)}><option>Auto detect</option><option>Balochi</option><option>English</option><option>Urdu</option><option>Persian</option></select></label>
          <span className="language-arrow">→</span>
          <label><span>To</span><select value={target} onChange={(e) => setTarget(e.target.value)}><option>Balochi</option><option>English</option><option>Urdu</option><option>Persian</option></select></label>
        </div>
      )}
      <div className="workbench-grid">
        <label className="editor-pane">
          <span className="pane-label">{mode === "chat" ? "MESSAGE" : "SOURCE TEXT"}</span>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "chat" ? "Write in Balochi, English, Urdu or Persian…" : "Enter text to translate…"} />
          <span className="counter">{input.length} characters</span>
        </label>
        <div className="result-pane" aria-live="polite">
          <span className="pane-label">{mode === "chat" ? "ZUBÁN" : "TRANSLATION"}</span>
          {loading && <p className="muted">Running the configured open model…</p>}
          {!loading && !result && <p className="muted">Results appear here. The alpha does not fabricate an answer when no model endpoint is connected.</p>}
          {!loading && result?.output && <p className="model-output">{result.output}</p>}
          {!loading && result?.message && <div className="system-note">{result.message}</div>}
          {!loading && result?.error && <div className="system-note error">{result.error}</div>}
        </div>
      </div>
      <div className="workbench-actions">
        <span>Experimental · dialect-aware prompts · open-provider adapter</span>
        <button className="button primary" disabled={loading || !input.trim()} type="submit">{loading ? "Working…" : mode === "chat" ? "Send" : "Translate"}</button>
      </div>
    </form>
  );
}
