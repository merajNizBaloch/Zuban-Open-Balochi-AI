"use client";

import { useMemo, useState } from "react";
import { dictionaryEntries, dictionarySource } from "@/lib/dictionary";

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function DictionaryBrowser() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(18);

  const results = useMemo(() => {
    const q = normalize(query);
    const ranked = dictionaryEntries
      .map((entry) => {
        if (!q) return { entry, score: 10 };

        const word = normalize(entry.word);
        const aliases = normalize((entry.aliases ?? []).join(" "));
        const latin = normalize((entry.latin ?? []).join(" "));
        const meanings = normalize(entry.meanings.join(" "));

        let score = 99;
        if (word === q || aliases === q || latin === q) score = 0;
        else if (word.startsWith(q) || aliases.startsWith(q) || latin.startsWith(q)) score = 1;
        else if (word.includes(q) || aliases.includes(q) || latin.includes(q)) score = 2;
        else if (meanings.split(/[,\s]+/).includes(q)) score = 3;
        else if (meanings.includes(q)) score = 4;

        return { entry, score };
      })
      .filter((item) => item.score < 99)
      .sort((a, b) => a.score - b.score || a.entry.word.localeCompare(b.entry.word));

    return ranked.map((item) => item.entry);
  }, [query]);

  const visible = results.slice(0, limit);

  return (
    <div className="dictionary-browser">
      <div className="dictionary-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(18);
          }}
          placeholder="Search Balochi, Latin spelling, or English meaning"
          aria-label="Search dictionary"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="dictionary-meta">
        <span>{results.length} {results.length === 1 ? "entry" : "entries"}</span>
        <span>Arabic script · Latin transcription · English meanings</span>
      </div>

      {visible.length > 0 ? (
        <div className="dictionary-results">
          {visible.map((entry) => (
            <article className="dictionary-entry" key={entry.word + (entry.latin?.[0] ?? "")}>
              <div className="dictionary-word-line">
                <h2 lang="bal" dir="rtl">{entry.word}</h2>
                <span>{entry.part}</span>
              </div>
              {(entry.latin?.length || entry.aliases?.length) ? (
                <p className="dictionary-latin">
                  {[...(entry.aliases ?? []), ...(entry.latin ?? [])].join(" · ")}
                </p>
              ) : null}
              <ul>
                {entry.meanings.map((meaning) => <li key={meaning}>{meaning}</li>)}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <div className="dictionary-empty">
          <strong>No entry found.</strong>
          <p>Try another spelling or an English meaning. This dictionary is intentionally small while sources are being reviewed.</p>
        </div>
      )}

      {results.length > visible.length && (
        <button className="dictionary-more" type="button" onClick={() => setLimit((value) => value + 24)}>
          Show more
        </button>
      )}

      <div className="dictionary-source">
        <div>
          <strong>Source</strong>
          <p>
            This first searchable set is derived from the Baluchi-English Wiktionary dictionary.
            It may include regional, spelling, or transcription variants.
          </p>
        </div>
        <a href={dictionarySource.url} target="_blank" rel="noreferrer">
          View source ↗
        </a>
        <span>{dictionarySource.license}</span>
      </div>
    </div>
  );
}
