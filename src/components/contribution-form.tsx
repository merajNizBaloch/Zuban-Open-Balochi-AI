"use client";

import { FormEvent, useMemo, useState } from "react";
import { githubUrl } from "@/lib/site";

const types = [
  "Translation correction",
  "Dictionary word",
  "Data source",
  "Speech / voice",
  "Research",
  "Code / product idea",
];

export function ContributionForm() {
  const [type, setType] = useState(types[0]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dialect, setDialect] = useState("");
  const [script, setScript] = useState("Arabic");
  const [source, setSource] = useState("");
  const [license, setLicense] = useState("");

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
          <span>Contribution</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {types.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Short title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What are you contributing?" />
        </label>

        <label className="full">
          <span>Details</span>
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Add the word, correction, translation, research idea, dataset information, or other useful context." required />
        </label>

        <label>
          <span>Dialect / region</span>
          <input value={dialect} onChange={(event) => setDialect(event.target.value)} placeholder="Optional" />
        </label>

        <label>
          <span>Script</span>
          <select value={script} onChange={(event) => setScript(event.target.value)}>
            <option>Arabic</option>
            <option>Latin</option>
            <option>Both</option>
            <option>Not applicable</option>
          </select>
        </label>

        <label>
          <span>Source</span>
          <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="Book, URL, speaker, dataset…" />
        </label>

        <label>
          <span>License / permission</span>
          <input value={license} onChange={(event) => setLicense(event.target.value)} placeholder="If this is external material" />
        </label>
      </div>

      <div className="contribution-form-actions">
        <p>
          This opens a pre-filled GitHub issue. You can review it and attach files before submitting.
          Do not upload private recordings or copyrighted material without permission.
        </p>
        <button className="button primary" type="submit" disabled={!details.trim()}>
          Continue on GitHub ↗
        </button>
      </div>
    </form>
  );
}
