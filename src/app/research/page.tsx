import Link from "next/link";
import { reusableResources } from "@/lib/resources";

const tracks = [
  ["Corpus", "Dialect- and script-aware text collection with provenance."],
  ["Translate", "Parallel corpora, baselines and human evaluation."],
  ["Speech", "ASR/TTS datasets, model cards and error analysis."],
  ["Vision", "Printed Balochi OCR datasets and reproducible benchmarks."],
  ["NLP", "Tokenization, embeddings, POS, NER and classification."],
  ["Bench", "One comparable benchmark suite for Balochi language technology."],
];

export default function ResearchPage() {
  return (
    <section className="section research-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow">RESEARCH</p>
          <h1 className="page-title">Open research for Balochi.</h1>
          <p className="lead wide">
            Methods, datasets, limitations and reproducible evaluations for a low-resource language.
          </p>
        </div>

        <div className="research-grid research-grid-clean">
          {tracks.map(([title, text], index) => (
            <article className="research-card" key={title}>
              <span>R/{String(index + 1).padStart(2, "0")}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className="section-heading centered-section-heading registry-heading">
          <div>
            <p className="eyebrow">REUSE / AUDIT QUEUE</p>
            <h2>Build on work that already exists.</h2>
          </div>
          <p>
            External resources are reviewed for licensing, provenance and reproducibility before Zubán imports or depends on them.
          </p>
        </div>

        <div className="resource-list">
          {reusableResources.map((resource, index) => (
            <a className="resource-row" href={resource.url} target="_blank" rel="noreferrer" key={resource.name}>
              <span className="resource-index">{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{resource.name}</strong><small>{resource.owner}</small></div>
              <span>{resource.type}</span>
              <span>{resource.license}</span>
              <p>{resource.note}</p>
              <span className="resource-open">↗</span>
            </a>
          ))}
        </div>

        <div className="benchmark-strip benchmark-strip-centered">
          <div>
            <p className="eyebrow">ZUBÁN BENCH</p>
            <h2>Metrics before marketing.</h2>
          </div>
          <div className="metric-list">
            <span>Translation · BLEU / COMET + human review</span>
            <span>Speech · WER</span>
            <span>OCR · CER / WER</span>
            <span>NER / POS · F1</span>
            <Link href="/bench">Open benchmark registry →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
