"use client";

import { FormEvent, useMemo, useState } from "react";
import { useExperience } from "@/components/experience-provider";

type Mode = "transliterate" | "normalize";
type Target = "latin" | "arabic";

type TransliterationResponse = {
  output?: string;
  sourceScript?: string;
  dictionaryMatches?: number;
  ruleBasedSegments?: number;
  warning?: string;
  error?: string;
};

export function ScriptLab() {
  const { t } = useExperience();
  const [mode, setMode] = useState<Mode>("transliterate");
  const [target, setTarget] = useState<Target>("latin");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [warning, setWarning] = useState("");
  const [meta, setMeta] = useState("");
  const [loading, setLoading] = useState(false);

  const sourceLabel = useMemo(() => {
    if (!input.trim()) return "Auto-detect";
    const arabic = (input.match(/[\u0600-\u06FF]/g) ?? []).length;
    const latin = (input.match(/[A-Za-zÀ-žĀ-ž]/g) ?? []).length;
    if (arabic && latin) return "Mixed script";
    if (arabic) return "Arabic script";
    if (latin) return "Latin script";
    return "Unknown";
  }, [input]);

  async function run(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setWarning("");
    setMeta("");

    try {
      const response = await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "normalize"
            ? { action: "normalize", input }
            : { action: "transliterate", input, target },
        ),
      });

      const data = (await response.json()) as TransliterationResponse & {
        changed?: boolean;
        script?: string;
      };

      if (!response.ok) {
        setOutput("");
        setWarning(data.error ?? "Language processing failed.");
        return;
      }

      setOutput(data.output ?? "");

      if (mode === "transliterate") {
        const exact = data.dictionaryMatches ?? 0;
        const rules = data.ruleBasedSegments ?? 0;
        setMeta(
          exact || rules
            ? exact + " dictionary match" + (exact === 1 ? "" : "es") +
              " · " + rules + " rule-based segment" + (rules === 1 ? "" : "s")
            : "No script conversion was needed.",
        );
        setWarning(data.warning ?? "");
      } else {
        setMeta(data.changed ? "Text was normalized." : "Text was already normalized.");
      }
    } catch {
      setOutput("");
      setWarning("The language service could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    setTarget((value) => (value === "latin" ? "arabic" : "latin"));
    if (output) {
      setInput(output);
      setOutput("");
      setWarning("");
      setMeta("");
    }
  }

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      setWarning("Copy is unavailable in this browser.");
    }
  }

  return (
    <div className="script-lab">
      <div className="script-lab-tabs" role="tablist" aria-label="Language tools">
        <button
          className={mode === "transliterate" ? "active" : ""}
          type="button"
          onClick={() => {
            setMode("transliterate");
            setOutput("");
            setWarning("");
            setMeta("");
          }}
        >
          {t("script.convert", "Script conversion")}
        </button>
        <button
          className={mode === "normalize" ? "active" : ""}
          type="button"
          onClick={() => {
            setMode("normalize");
            setOutput("");
            setWarning("");
            setMeta("");
          }}
        >
          {t("script.normalize", "Normalize text")}
        </button>
      </div>

      <form onSubmit={run}>
        {mode === "transliterate" && (
          <div className="script-direction-bar">
            <div>
              <span>{t("script.detected", "Detected")}</span>
              <strong>{sourceLabel}</strong>
            </div>

            <button type="button" className="script-swap" onClick={swap} aria-label="Swap target script">
              ⇄
            </button>

            <label>
              <span>{t("script.convertTo", "Convert to")}</span>
              <select value={target} onChange={(event) => setTarget(event.target.value as Target)}>
                <option value="latin">{t("script.latin", "Latin Balochi")}</option>
                <option value="arabic">{t("script.arabic", "Arabic-script Balochi")}</option>
              </select>
            </label>
          </div>
        )}

        <div className="script-lab-panels">
          <label className="script-panel">
            <div className="script-panel-head">
              <span>{t("script.input", "Input")}</span>
              {input && (
                <button type="button" onClick={() => {
                  setInput("");
                  setOutput("");
                  setWarning("");
                  setMeta("");
                }}>
                  {t("script.clear", "Clear")}
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={mode === "normalize"
                ? "Paste Balochi text to normalize Unicode, spacing and common Arabic/Persian character variants…"
                : "Type or paste Balochi in Arabic or Latin script…"}
              dir="auto"
              maxLength={12000}
            />
          </label>

          <div className="script-panel output">
            <div className="script-panel-head">
              <span>{mode === "normalize" ? "Normalized" : target === "latin" ? "Latin" : "Arabic script"}</span>
              {output && <button type="button" onClick={() => void copy()}>{t("script.copy", "Copy")}</button>}
            </div>

            {loading ? (
              <div className="script-processing">{t("script.processing", "Processing…")}</div>
            ) : output ? (
              <p dir="auto" lang="bal">{output}</p>
            ) : (
              <div className="script-placeholder">{t("script.result", "Result will appear here.")}</div>
            )}
          </div>
        </div>

        <div className="script-lab-footer">
          <div>
            {meta && <strong>{meta}</strong>}
            {warning && <p>{warning}</p>}
          </div>
          <button className="button primary" type="submit" disabled={!input.trim() || loading}>
            {loading ? t("script.working", "Working…") : mode === "normalize" ? t("script.normalizeAction", "Normalize") : t("script.convertAction", "Convert script")}
          </button>
        </div>
      </form>

      <div className="script-lab-note">
        <strong>Why conversion can be approximate</strong>
        <p>
          Balochi Arabic script is an abjad and does not always write short vowels.
          Zubán first uses sourced dictionary spellings, then falls back to character rules for unknown words.
        </p>
      </div>
    </div>
  );
}
