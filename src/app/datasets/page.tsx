import { reusableResources } from "@/lib/resources";
import { UiText } from "@/components/ui-text";

const zubanDatasets = [
  ["Zubán Corpus", "datasets.text", "Text", "datasets.collecting", "Collecting", "datasets.corpus.desc", "Dialect/script-labelled text with source and license provenance."],
  ["Zubán Lexicon", "datasets.dictionary", "Dictionary", "datasets.started", "Started", "datasets.lexicon.desc", "Searchable lexical data with meanings, transcriptions and source attribution."],
  ["Zubán Speech", "datasets.audio", "Audio", "datasets.planned", "Planned", "datasets.speech.desc", "Consented speech with transcript and dialect metadata."],
  ["Zubán Parallel", "datasets.translation", "Translation", "datasets.planned", "Planned", "datasets.parallel.desc", "Balochi parallel data for English, Urdu and Persian."],
  ["Zubán OCR", "datasets.vision", "Vision", "datasets.planned", "Planned", "datasets.ocr.desc", "Printed page images paired with verified text."],
  ["Zubán Bench", "datasets.evaluation", "Evaluation", "datasets.planned", "Planned", "datasets.bench.desc", "Versioned evaluation sets kept separate from training data."],
];

export default function DatasetsPage() {
  return (
    <section className="section datasets-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.datasets.eyebrow" fallback="DATASETS" /></p>
          <h1 className="page-title"><UiText id="page.datasets.title" fallback="Open data with a memory." /></h1>
          <p className="lead wide"><UiText id="datasets.lead" fallback="Every useful record should retain its script, dialect, source, license and verification state." /></p>
        </div>

        <div className="section-heading centered-section-heading datasets-heading">
          <div><h2><UiText id="datasets.available" fallback="Available resources." /></h2></div>
          <p><UiText id="datasets.available.desc" fallback="External work that can be inspected, tested or considered for reuse." /></p>
        </div>

        <div className="dataset-resource-grid">
          {reusableResources.map((resource) => (
            <a href={resource.url} target="_blank" rel="noreferrer" className="dataset-resource-card" key={resource.name}>
              <span>{resource.type}</span>
              <h3>{resource.name}</h3>
              <p>{resource.note}</p>
              <div><small>{resource.owner}</small><small>{resource.license}</small></div>
              <strong><UiText id="datasets.open" fallback="Open resource ↗" /></strong>
            </a>
          ))}
        </div>

        <div className="section-heading centered-section-heading datasets-heading">
          <div><h2><UiText id="datasets.own" fallback="Zubán datasets." /></h2></div>
          <p><UiText id="datasets.own.desc" fallback="Datasets and benchmarks being assembled under the Zubán project itself." /></p>
        </div>

        <div className="dataset-table" role="table" aria-label="Zubán datasets">
          <div className="dataset-row dataset-head" role="row">
            <span><UiText id="datasets.name" fallback="Name" /></span><span><UiText id="datasets.type" fallback="Type" /></span><span><UiText id="datasets.status" fallback="Status" /></span><span><UiText id="datasets.purpose" fallback="Purpose" /></span>
          </div>
          {zubanDatasets.map(([name, typeId, type, statusId, status, purposeId, purpose]) => (
            <div className="dataset-row" role="row" key={name}>
              <strong>{name}</strong>
              <span><UiText id={typeId} fallback={type} /></span>
              <span className="status-chip"><UiText id={statusId} fallback={status} /></span>
              <p><UiText id={purposeId} fallback={purpose} /></p>
            </div>
          ))}
        </div>

        <div className="schema-box schema-box-centered">
          <p className="eyebrow"><UiText id="datasets.meta" fallback="MINIMUM RECORD METADATA" /></p>
          <code>{"{ text, script, dialect, source, license, verification }"}</code>
        </div>
      </div>
    </section>
  );
}
