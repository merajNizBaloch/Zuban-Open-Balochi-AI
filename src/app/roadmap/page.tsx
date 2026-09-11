import { UiText } from "@/components/ui-text";

const groups = [
  {
    labelId: "roadmap.live",
    label: "Live",
    items: [
      ["roadmap.dictionary", "Dictionary", "roadmap.dictionary.desc", "Searchable Wiktionary-derived Baluchi lexicon with source attribution."],
      ["roadmap.language", "Language Lab", "roadmap.language.desc", "Unicode normalization and dictionary-first Arabic ↔ Latin conversion."],
      ["roadmap.community", "Community", "roadmap.community.desc", "Public GitHub-backed contribution and review queue."],
      ["roadmap.browserocr", "Browser OCR", "roadmap.browserocr.desc", "Urdu/Persian/Arabic-script fallback when no OCR server is connected."],
      ["roadmap.api", "Developer APIs", "roadmap.api.desc", "Dictionary, language, health, status and model-adapter endpoints."],
    ],
  },
  {
    labelId: "roadmap.building",
    label: "Building",
    items: [
      ["roadmap.hostedchat", "Hosted Chat", "roadmap.hostedchat.desc", "Streaming multilingual assistant with Balochi dictionary grounding, dialect and script preferences."],
      ["roadmap.stt", "Balochi STT", "roadmap.stt.desc", "Deploy the open Whisper-small Balochi model behind the shared model server."],
      ["roadmap.tts", "Balochi TTS", "roadmap.tts.desc", "Deploy the three-speaker SpeechT5 Balochi model."],
      ["roadmap.parallel", "Parallel data", "roadmap.parallel.desc", "Audit and clean reusable English ↔ Balochi sentence pairs."],
      ["roadmap.portal", "Contribution data portal", "roadmap.portal.desc", "Move high-volume structured contributions from GitHub issues into a dedicated review database when needed."],
    ],
  },
  {
    labelId: "roadmap.research",
    label: "Research",
    items: [
      ["roadmap.bench", "Zubán Bench", "roadmap.bench.desc", "Human-reviewed evaluation sets for translation, speech, OCR and NLP."],
      ["roadmap.ocr", "Balochi OCR", "roadmap.ocr.desc", "Dedicated printed Balochi image/text pairs and a purpose-trained model."],
      ["roadmap.translit", "Transliteration benchmark", "roadmap.translit.desc", "Evaluate dictionary-backed, rule-based and future learned script conversion."],
      ["roadmap.dialect", "Dialect-aware models", "roadmap.dialect.desc", "Add dialect controls only where training/evaluation evidence supports them."],
      ["roadmap.corpus", "Corpus Explorer", "roadmap.corpus.desc", "Search and download licensed Balochi corpus subsets with provenance metadata."],
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
          <p className="lead wide"><UiText id="roadmap.lead" fallback="Production tools, deployment work and research stay separate so experimental work is never presented as finished language technology." /></p>
        </div>

        <div className="roadmap-groups">
          {groups.map((group) => (
            <section className="roadmap-group" key={group.labelId}>
              <div className="roadmap-group-title">
                <span className={"roadmap-dot " + group.label.toLocaleLowerCase()} />
                <h2><UiText id={group.labelId} fallback={group.label} /></h2>
              </div>
              <div className="roadmap-items">
                {group.items.map(([titleId, title, descriptionId, description]) => (
                  <article key={titleId}>
                    <h3><UiText id={titleId} fallback={title} /></h3>
                    <p><UiText id={descriptionId} fallback={description} /></p>
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
