const datasets = [
  ["Zubán Corpus", "Text", "Planned", "Dialect/script-labelled text with source and license provenance."],
  ["Zubán Lexicon", "Dictionary", "Planned", "Reviewed entries with meanings, examples, dialect and sources."],
  ["Zubán Speech", "Audio", "Planned", "Consented speech with transcript and dialect metadata."],
  ["Zubán Parallel", "Translation", "Planned", "Balochi parallel data for English, Urdu and Persian."],
  ["Zubán OCR", "Vision", "Planned", "Printed page images paired with verified text."],
  ["Zubán Bench", "Evaluation", "Planned", "Versioned test sets kept separate from training data."],
];

export default function DatasetsPage() {
  return <section className="section"><div className="shell">
    <p className="eyebrow">ZUBÁN / DATASETS</p><h1 className="page-title">Open data with a memory.</h1>
    <p className="lead wide">A useful corpus is not just a folder of sentences. Zubán tracks where data came from, how it may be reused and who verified it.</p>
    <div className="dataset-table" role="table" aria-label="Zubán datasets">
      <div className="dataset-row dataset-head" role="row"><span>Name</span><span>Type</span><span>Status</span><span>Purpose</span></div>
      {datasets.map(([name, type, status, purpose]) => <div className="dataset-row" role="row" key={name}><strong>{name}</strong><span>{type}</span><span className="status-chip">{status}</span><p>{purpose}</p></div>)}
    </div>
    <div className="schema-box"><p className="eyebrow">MINIMUM RECORD METADATA</p><code>{"{ text, script, dialect, source, license, verification }"}</code></div>
  </div></section>;
}
