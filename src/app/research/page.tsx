import Link from "next/link";
import { reusableResources } from "@/lib/resources";
import { UiText } from "@/components/ui-text";

const tracks = [
  ["research.track.corpus", "Corpus", "research.track.corpus.desc", "Dialect- and script-aware text collection with provenance."],
  ["research.track.translate", "Translate", "research.track.translate.desc", "Parallel corpora, baselines and human evaluation."],
  ["research.track.speech", "Speech", "research.track.speech.desc", "ASR/TTS datasets, model cards and error analysis."],
  ["research.track.vision", "Vision", "research.track.vision.desc", "Printed Balochi OCR datasets and reproducible benchmarks."],
  ["research.track.nlp", "NLP", "research.track.nlp.desc", "Tokenization, embeddings, POS, NER and classification."],
  ["research.track.bench", "Bench", "research.track.bench.desc", "One comparable benchmark suite for Balochi language technology."],
];

export default function ResearchPage() {
  return (
    <section className="section research-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.research.eyebrow" fallback="RESEARCH" /></p>
          <h1 className="page-title"><UiText id="page.research.title" fallback="Open research for Balochi." /></h1>
          <p className="lead wide"><UiText id="research.lead" fallback="Methods, datasets, limitations and reproducible evaluations for a low-resource language." /></p>
        </div>

        <div className="research-grid research-grid-clean">
          {tracks.map(([titleId, title, textId, text], index) => (
            <article className="research-card" key={titleId}>
              <span>R/{String(index + 1).padStart(2, "0")}</span>
              <h2><UiText id={titleId} fallback={title} /></h2>
              <p><UiText id={textId} fallback={text} /></p>
            </article>
          ))}
        </div>

        <div className="section-heading centered-section-heading registry-heading">
          <div>
            <p className="eyebrow"><UiText id="research.reuse" fallback="REUSE / AUDIT QUEUE" /></p>
            <h2><UiText id="research.reuse.title" fallback="Build on work that already exists." /></h2>
          </div>
          <p>
            <UiText id="research.reuse.desc" fallback="External resources are reviewed for licensing, provenance and reproducibility before Zubán imports or depends on them." />
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
            <h2><UiText id="research.metrics" fallback="Metrics before marketing." /></h2>
          </div>
          <div className="metric-list">
            <span>Translation · BLEU / COMET + human review</span>
            <span>Speech · WER</span>
            <span>OCR · CER / WER</span>
            <span>NER / POS · F1</span>
            <Link href="/bench"><UiText id="research.openbench" fallback="Open benchmark registry →" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
