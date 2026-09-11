import Link from "next/link";
import { ModelStatus } from "@/components/model-status";

const layers = [
  ["Interface", "Chat · Translate · Dictionary · Speech · OCR"],
  ["Model adapters", "Text · speech-to-text · text-to-speech · OCR"],
  ["Language", "Normalization · tokenization · dialect and script metadata"],
  ["Knowledge", "Dictionary · corpora · verified language resources"],
  ["Research", "Model cards · evaluations · Zubán Bench"],
];

export default function TechnologyPage() {
  return (
    <section className="section technology-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow">TECHNOLOGY</p>
          <h1 className="page-title">Modular by design.</h1>
          <p className="lead wide">
            Zubán keeps the product separate from the underlying models so better open models can replace older ones without rebuilding the interface.
          </p>
          <Link className="button secondary" href="/setup">Check deployment setup →</Link>
        </div>

        <div className="technology-status">
          <div className="section-heading centered-section-heading">
            <div><h2>Service status.</h2></div>
            <p>Live status for the model adapters configured on this deployment.</p>
          </div>
          <ModelStatus />
        </div>

        <div className="stack-map">
          {layers.map(([label, text], index) => (
            <div className="stack-layer" key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <div className="two-col">
          <article className="info-card">
            <h3>Text model</h3>
            <p>
              Chat and Translate support Hugging Face Inference Providers, a custom OpenAI-compatible endpoint, or local Ollama. Exact dictionary lookup still works without one.
            </p>
          </article>
          <article className="info-card">
            <h3>Media models</h3>
            <p>
              Speech and voice use the shared Balochi model server. OCR can use that server or fall back to browser OCR.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
