import { reusableResources } from "@/lib/resources";
import { UiText } from "@/components/ui-text";

const zubanDatasets = [
  ["Zubán Corpus", "Text", "Collecting", "Dialect/script-labelled text with source and license provenance."],
  ["Zubán Lexicon", "Dictionary", "Started", "Searchable lexical data with meanings, transcriptions and source attribution."],
  ["Zubán Speech", "Audio", "Planned", "Consented speech with transcript and dialect metadata."],
  ["Zubán Parallel", "Translation", "Planned", "Balochi parallel data for English, Urdu and Persian."],
  ["Zubán OCR", "Vision", "Planned", "Printed page images paired with verified text."],
  ["Zubán Bench", "Evaluation", "Planned", "Versioned evaluation sets kept separate from training data."],
];

export default function DatasetsPage() {
  return (
    <section className="section datasets-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.datasets.eyebrow" fallback="DATASETS" /></p>
          <h1 className="page-title"><UiText id="page.datasets.title" fallback="Open data with a memory." /></h1>
          <p className="lead wide">
            Every useful record should retain its script, dialect, source, license and verification state.
          </p>
        </div>

        <div className="section-heading centered-section-heading datasets-heading">
          <div><h2>Available resources.</h2></div>
          <p>External work that can be inspected, tested or considered for reuse.</p>
        </div>

        <div className="dataset-resource-grid">
          {reusableResources.map((resource) => (
            <a href={resource.url} target="_blank" rel="noreferrer" className="dataset-resource-card" key={resource.name}>
              <span>{resource.type}</span>
              <h3>{resource.name}</h3>
              <p>{resource.note}</p>
              <div><small>{resource.owner}</small><small>{resource.license}</small></div>
              <strong>Open resource ↗</strong>
            </a>
          ))}
        </div>

        <div className="section-heading centered-section-heading datasets-heading">
          <div><h2>Zubán datasets.</h2></div>
          <p>Datasets and benchmarks being assembled under the Zubán project itself.</p>
        </div>

        <div className="dataset-table" role="table" aria-label="Zubán datasets">
          <div className="dataset-row dataset-head" role="row">
            <span>Name</span><span>Type</span><span>Status</span><span>Purpose</span>
          </div>
          {zubanDatasets.map(([name, type, status, purpose]) => (
            <div className="dataset-row" role="row" key={name}>
              <strong>{name}</strong>
              <span>{type}</span>
              <span className="status-chip">{status}</span>
              <p>{purpose}</p>
            </div>
          ))}
        </div>

        <div className="schema-box schema-box-centered">
          <p className="eyebrow">MINIMUM RECORD METADATA</p>
          <code>{"{ text, script, dialect, source, license, verification }"}</code>
        </div>
      </div>
    </section>
  );
}
