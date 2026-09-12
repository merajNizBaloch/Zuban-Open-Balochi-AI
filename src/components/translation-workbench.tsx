"use client";

import { FormEvent, useState } from "react";
import { browserAiComplete, stopBrowserAiGeneration } from "@/lib/browser-ai";
import { useExperience } from "@/components/experience-provider";

type ApiResult = {
  configured?: boolean;
  output?: string;
  message?: string;
  error?: string;
};

const languages = [
  ["Balochi", "translate.lang.balochi"],
  ["English", "translate.lang.english"],
  ["Urdu", "translate.lang.urdu"],
  ["Persian", "translate.lang.persian"],
] as const;

export function TranslationWorkbench() {
  const { t } = useExperience();
  const [source, setSource] = useState<string>("English");
  const [target, setTarget] = useState<string>("Balochi");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function runFreeLocalTranslation(reason?: string) {
    if (reason) {
      setNotice(
        t("translate.preparing", "Server AI unavailable · using free on-device translation…"),
      );
    }

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
      {
        temperature: 0.1,
        maxTokens: 260,
        onProgress: ({ progress, text }) => {
          const percent = Math.round(progress * 100);
          setNotice(
            t("translate.preparing", "Preparing free on-device AI…") + " " +
              (percent > 0 ? percent + "% · " : "") +
              text,
          );
        },
      },
    );

    setOutput(result.text);
    setNotice("");
  }

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
        return;
      }

      const serverMessage =
        data.message ?? data.error ?? "Server translation is unavailable.";

      try {
        await runFreeLocalTranslation(serverMessage);
      } catch (browserError) {
        if (browserError instanceof DOMException && browserError.name === "AbortError") {
          setNotice(t("translate.cancelled", "Translation stopped."));
          return;
        }

        const detail =
          browserError instanceof Error
            ? browserError.message
            : "On-device AI is unavailable.";
        setNotice(
          t(
            "translate.localError",
            "Free on-device translation could not start on this browser.",
          ) + (detail ? " " + detail : ""),
        );
      }
    } catch {
      try {
        await runFreeLocalTranslation("The server translation service could not be reached.");
      } catch (browserError) {
        const detail =
          browserError instanceof Error
            ? browserError.message
            : "On-device AI is unavailable.";
        setNotice(
          t(
            "translate.localError",
            "Free on-device translation could not start on this browser.",
          ) + (detail ? " " + detail : ""),
        );
      }
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

  function cancelTranslation() {
    stopBrowserAiGeneration();
    setLoading(false);
    setNotice(t("translate.cancelled", "Translation stopped."));
  }

  return (
    <form className="translate-workspace" onSubmit={translate}>
      <div className="translate-language-bar">
        <label>
          <span>{t("translate.from", "From")}</span>
          <select value={source} onChange={(event) => setSource(event.target.value)}>
            {languages.map(([value, labelId]) => <option key={value} value={value}>{t(labelId, value)}</option>)}
          </select>
        </label>

        <button className="translate-swap" type="button" onClick={swapLanguages} aria-label="Swap languages">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
          </svg>
        </button>

        <label>
          <span>{t("translate.to", "To")}</span>
          <select value={target} onChange={(event) => setTarget(event.target.value)}>
            {languages.map(([value, labelId]) => <option key={value} value={value}>{t(labelId, value)}</option>)}
          </select>
        </label>
      </div>

      <div className="translate-panels">
        <div className="translate-panel source">
          <div className="translate-panel-toolbar">
            <span>{t("translate.lang." + source.toLowerCase(), source)}</span>
            {input && <button type="button" onClick={clear}>{t("translate.clear", "Clear")}</button>}
          </div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("translate.type", "Type text…")}
            maxLength={12000}
            dir="auto"
          />
          <span className="translate-count">{input.length.toLocaleString()} / 12,000</span>
        </div>

        <div className="translate-panel result" aria-live="polite">
          <div className="translate-panel-toolbar">
            <span>{t("translate.lang." + target.toLowerCase(), target)}</span>
            {output && <button type="button" onClick={() => void copyOutput()}>{t("translate.copy", "Copy")}</button>}
          </div>

          {loading ? (
            <div className="translate-loading">
              <span /><span /><span />
              {notice && <small>{notice}</small>}
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
                {t("translate.review", "Suggest a better translation →")}
              </a>
            </>
          ) : notice ? (
            <div className="translate-notice">{notice}</div>
          ) : (
            <p className="translate-placeholder">{t("translate.placeholder", "Translation will appear here.")}</p>
          )}
        </div>
      </div>

      <div className="translate-actions">
        <p>{t("translate.note", "Dialect-sensitive output may vary. Verify important translations with a fluent speaker.")}</p>
        {loading ? (
          <button className="button secondary" type="button" onClick={cancelTranslation}>
            {t("translate.cancel", "Stop")}
          </button>
        ) : (
          <button className="button primary" type="submit" disabled={!input.trim() || source === target}>
            {t("translate.action", "Translate")}
          </button>
        )}
      </div>
    </form>
  );
}
