import { UiText } from "@/components/ui-text";

const groups = [
  {
    label: "Live",
    items: [
      ["Dictionary", "Searchable Wiktionary-derived Baluchi lexicon with source attribution."],
      ["Language Lab", "Unicode normalization and dictionary-first Arabic ↔ Latin conversion."],
      ["Community", "Public GitHub-backed contribution and review queue."],
      ["Browser OCR", "Urdu/Persian/Arabic-script fallback when no OCR server is connected."],
      ["Developer APIs", "Dictionary, language, health, status and model-adapter endpoints."],
    ],
  },
  {
    label: "Building",
    items: [
      ["Hosted Chat", "Streaming multilingual assistant with Balochi dictionary grounding, dialect and script preferences."],
      ["Balochi STT", "Deploy the open Whisper-small Balochi model behind the shared model server."],
      ["Balochi TTS", "Deploy the three-speaker SpeechT5 Balochi model."],
      ["Parallel data", "Audit and clean reusable English ↔ Balochi sentence pairs."],
      ["Contribution data portal", "Move high-volume structured contributions from GitHub issues into a dedicated review database when needed."],
    ],
  },
  {
    label: "Research",
    items: [
      ["Zubán Bench", "Human-reviewed evaluation sets for translation, speech, OCR and NLP."],
      ["Balochi OCR", "Dedicated printed Balochi image/text pairs and a purpose-trained model."],
      ["Transliteration benchmark", "Evaluate dictionary-backed, rule-based and future learned script conversion."],
      ["Dialect-aware models", "Add dialect controls only where training/evaluation evidence supports them."],
      ["Corpus Explorer", "Search and download licensed Balochi corpus subsets with provenance metadata."],
    ],
  },
];

export default function RoadmapPage() {
  return (
    <section className="section roadmap-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.roadmap.eyebrow" fallback="ROADMAP" /></p>
          <h1 className="page-title"><UiText id="page.roadmap.title" fallback="What Zubán is building." /></h1>
          <p className="lead wide">
            Production tools, deployment work and research stay separate so experimental work is never presented as finished language technology.
          </p>
        </div>

        <div className="roadmap-groups">
          {groups.map((group) => (
            <section className="roadmap-group" key={group.label}>
              <div className="roadmap-group-title">
                <span className={"roadmap-dot " + group.label.toLocaleLowerCase()} />
                <h2>{group.label}</h2>
              </div>
              <div className="roadmap-items">
                {group.items.map(([title, description]) => (
                  <article key={title}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
