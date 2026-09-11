const tracks = [
  ["Corpus", "Dialect- and script-aware text collection with provenance."],
  ["Translate", "Parallel corpora, baselines and human evaluation."],
  ["Speech", "ASR/TTS datasets, model cards and error analysis."],
  ["Vision", "Printed Balochi OCR datasets and reproducible benchmarks."],
  ["NLP", "Tokenization, embeddings, POS, NER and classification."],
  ["Bench", "One comparable benchmark suite for Balochi language technology."],
];

export default function ResearchPage() {
  return <section className="section"><div className="shell">
    <p className="eyebrow">ZUBÁN / RESEARCH</p>
    <h1 className="page-title">Open research for a low-resource language.</h1>
    <p className="lead wide">Zubán Research will publish methods, limitations, dataset provenance and reproducible evaluations—not only polished demos.</p>
    <div className="research-grid">
      {tracks.map(([title, text], index) => <article className="research-card" key={title}><span>R/{String(index + 1).padStart(2, "0")}</span><h2>Zubán {title}</h2><p>{text}</p></article>)}
    </div>
    <div className="benchmark-strip">
      <div><p className="eyebrow">ZUBÁN BENCH</p><h2>Metrics before marketing.</h2></div>
      <div className="metric-list"><span>Translation · BLEU / COMET + human review</span><span>Speech · WER</span><span>OCR · CER / WER</span><span>NER / POS · F1</span><span>Retrieval · task-specific evaluation</span></div>
    </div>
  </div></section>;
}
