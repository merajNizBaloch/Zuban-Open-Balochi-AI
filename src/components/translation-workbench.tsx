"use client";

import { FormEvent, useState } from "react";
import { browserAiComplete, isMissingServerModelMessage } from "@/lib/browser-ai";

type ApiResult = {
  configured?: boolean;
  output?: string;
  message?: string;
  error?: string;
};

const languages = ["Balochi", "English", "Urdu", "Persian"] as const;

export function TranslationWorkbench() {
  const [source, setSource] = useState<string>("English");
  const [target, setTarget] = useState<string>("Balochi");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function translate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setOutput("");
    setNotice("");

    try {
      const response = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "translate",
          input: input.trim(),
          source,
          target,
        }),
      });

      const data = (await response.json()) as ApiResult;
      if (data.output) {
        setOutput(data.output);
      } else {
        const serverMessage =
          data.message ?? data.error ?? "Translation is unavailable.";

        if (isMissingServerModelMessage(serverMessage)) {
          try {
            const result = await browserAiComplete(
              [
                {
                  role: "system",
                  content: [
                    "You are Zubán Translate, a Balochi language translation assistant.",
                    "Translate from " + source + " to " + target + ".",
                    "Return only the translation unless a short dialect note is genuinely necessary.",
                    "Preserve names, numbers and meaning.",
                    "Balochi has dialect and orthographic variation. Do not invent forms when uncertain.",
                  ].join("\n"),
                },
                { role: "user", content: input.trim() },
              ],
              { temperature: 0.1, maxTokens: 900 },
            );

            setOutput(result.text);
            setNotice("");
          } catch (browserError) {
            const detail =
              browserError instanceof Error
                ? browserError.message
                : "Browser AI is unavailable.";
            setNotice(
              "Zubán could not start browser AI. " +
                detail +
                " If a sign-in or authorization window appears, allow it and try again.",
            );
          }
        } else {
          setNotice(serverMessage);
        }
      }
    } catch {
      setNotice("The translation service could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  function swapLanguages() {
    const oldSource = source;
    setSource(target);
    setTarget(oldSource);

    if (output) {
      const oldInput = input;
      setInput(output);
      setOutput(oldInput);
    }
  }

  function clear() {
    setInput("");
    setOutput("");
    setNotice("");
  }

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // Clipboard may be blocked in some browsers.
    }
  }

  return (
    <form className="translate-workspace" onSubmit={translate}>
      <div className="translate-language-bar">
        <label>
          <span>From</span>
          <select value={source} onChange={(event) => setSource(event.target.value)}>
            {languages.map((language) => <option key={language}>{language}</option>)}
          </select>
        </label>

        <button className="translate-swap" type="button" onClick={swapLanguages} aria-label="Swap languages">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
          </svg>
        </button>

        <label>
          <span>To</span>
          <select value={target} onChange={(event) => setTarget(event.target.value)}>
            {languages.map((language) => <option key={language}>{language}</option>)}
          </select>
        </label>
      </div>

      <div className="translate-panels">
        <div className="translate-panel source">
          <div className="translate-panel-toolbar">
            <span>{source}</span>
            {input && <button type="button" onClick={clear}>Clear</button>}
          </div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={"Type " + source + " text…"}
            maxLength={12000}
            dir="auto"
          />
          <span className="translate-count">{input.length.toLocaleString()} / 12,000</span>
        </div>

        <div className="translate-panel result" aria-live="polite">
          <div className="translate-panel-toolbar">
            <span>{target}</span>
            {output && <button type="button" onClick={() => void copyOutput()}>Copy</button>}
          </div>

          {loading ? (
            <div className="translate-loading">
              <span /><span /><span />
            </div>
          ) : output ? (
            <>
              <p className="translate-output" dir="auto" lang="bal">{output}</p>
              <a
                className="translate-correction-link"
                href={
                  "/community?type=Translation%20correction&title=" +
                  encodeURIComponent(source + " → " + target + " translation review") +
                  "&details=" +
                  encodeURIComponent(
                    "Source language: " +
                    source +
                    "\nTarget language: " +
                    target +
                    "\n\nSource text:\n" +
                    input +
                    "\n\nCurrent translation:\n" +
                    output +
                    "\n\nSuggested correction:\n",
                  )
                }
              >
                Suggest a better translation →
              </a>
            </>
          ) : notice ? (
            <div className="translate-notice">{notice}</div>
          ) : (
            <p className="translate-placeholder">Translation will appear here.</p>
          )}
        </div>
      </div>

      <div className="translate-actions">
        <p>Dialect-sensitive output may vary. Verify important translations with a fluent speaker.</p>
        <button className="button primary" type="submit" disabled={!input.trim() || loading || source === target}>
          {loading ? "Translating…" : "Translate"}
        </button>
      </div>
    </form>
  );
}
