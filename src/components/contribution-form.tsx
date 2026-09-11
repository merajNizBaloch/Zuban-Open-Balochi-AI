"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { githubUrl } from "@/lib/site";
import { useExperience } from "@/components/experience-provider";

const types = [
  "Community sentence",
  "Dictionary word",
  "Translation correction",
  "Pronunciation / voice",
  "OCR correction",
  "Data source",
  "Research",
  "Code / product idea",
];

export function ContributionForm() {
  const { t } = useExperience();
  const [type, setType] = useState(types[0]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dialect, setDialect] = useState("");
  const [script, setScript] = useState("Arabic");
  const [source, setSource] = useState("");
  const [license, setLicense] = useState("");

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const params = new URLSearchParams(window.location.search);
      const requestedType = params.get("type");
      const requestedScript = params.get("script");

      if (requestedType && types.includes(requestedType)) setType(requestedType);
      if (params.get("title")) setTitle(params.get("title")!.slice(0, 180));
      if (params.get("details")) setDetails(params.get("details")!.slice(0, 12000));
      if (params.get("dialect")) setDialect(params.get("dialect")!.slice(0, 180));
      if (params.get("source")) setSource(params.get("source")!.slice(0, 1200));
      if (requestedScript && ["Arabic", "Latin", "Both", "Not applicable"].includes(requestedScript)) {
        setScript(requestedScript);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const issueUrl = useMemo(() => {
    const body = [
      "## Contribution type",
      type,
      "",
      "## Details",
      details || "_Add details here_",
      "",
      "## Dialect / region",
      dialect || "Not specified",
      "",
      "## Script",
      script,
      "",
      "## Source",
      source || "Not specified",
      "",
      "## License / permission",
      license || "Not specified",
      "",
      "---",
      "Submitted from the Zubán contribution form.",
    ].join("\n");

    const params = new URLSearchParams({
      title: title.trim() ? "[" + type + "] " + title.trim() : "[" + type + "] Contribution",
      body,
    });

    return githubUrl + "/issues/new?" + params.toString();
  }, [type, title, details, dialect, script, source, license]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(issueUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="contribution-form" onSubmit={submit}>
      <div className="contribution-form-grid">
        <label>
          <span>{t("form.contribution", "Contribution")}</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {types.map((item) => {
              const labels: Record<string, string> = {
                "Community sentence": t("form.type.community", "Community sentence"),
                "Dictionary word": t("form.type.dictionary", "Dictionary word"),
                "Translation correction": t("form.type.translation", "Translation correction"),
                "Pronunciation / voice": t("form.type.voice", "Pronunciation / voice"),
                "OCR correction": t("form.type.ocr", "OCR correction"),
                "Data source": t("form.type.data", "Data source"),
                "Research": t("form.type.research", "Research"),
                "Code / product idea": t("form.type.code", "Code / product idea"),
              };
              return <option key={item} value={item}>{labels[item] ?? item}</option>;
            })}
          </select>
        </label>

        <label>
          <span>{t("form.title", "Short title")}</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("form.title.placeholder", "What are you contributing?")} />
        </label>

        <label className="full">
          <span>{t("form.details", "Details")}</span>
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder={t("form.details.placeholder", "Add the word, correction, translation, research idea, dataset information, or other useful context.")} required />
        </label>

        <label>
          <span>{t("form.dialect", "Dialect / region")}</span>
          <input value={dialect} onChange={(event) => setDialect(event.target.value)} placeholder={t("form.optional", "Optional")} />
        </label>

        <label>
          <span>{t("form.script", "Script")}</span>
          <select value={script} onChange={(event) => setScript(event.target.value)}>
            <option value="Arabic">{t("form.script.arabic", "Arabic")}</option>
            <option value="Latin">{t("form.script.latin", "Latin")}</option>
            <option value="Both">{t("form.script.both", "Both")}</option>
            <option value="Not applicable">{t("form.script.na", "Not applicable")}</option>
          </select>
        </label>

        <label>
          <span>{t("form.source", "Source")}</span>
          <input value={source} onChange={(event) => setSource(event.target.value)} placeholder={t("form.source.placeholder", "Book, URL, speaker, dataset…")} />
        </label>

        <label>
          <span>{t("form.license", "License / permission")}</span>
          <input value={license} onChange={(event) => setLicense(event.target.value)} placeholder={t("form.license.placeholder", "If this is external material")} />
        </label>
      </div>

      <div className="contribution-form-actions">
        <p>
          {t("form.note", "This opens a pre-filled GitHub issue. You can review it and attach files before submitting. Do not upload private recordings or copyrighted material without permission.")}
        </p>
        <button className="button primary" type="submit" disabled={!details.trim()}>
          {t("form.continue", "Continue on GitHub ↗")}
        </button>
      </div>
    </form>
  );
}
