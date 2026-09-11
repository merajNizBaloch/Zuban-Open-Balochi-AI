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
        <h1 className="page-title">Technology.</h1>
        <p className="lead wide">
          Zubán keeps the product separate from the underlying models. A better open model can replace an older one without rebuilding the interface.
        </p>

        <div className="technology-status">
          <div className="section-heading">
            <div><h2>Service status.</h2></div>
            <p>This reflects whether each model adapter is configured on the current deployment.</p>
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
              Chat and Translate use an OpenAI-compatible chat-completions endpoint. This can point to an open/self-hosted model rather than a single vendor.
            </p>
          </article>
          <article className="info-card">
            <h3>Media models</h3>
            <p>
              Speech, voice and OCR use separate adapters, so each can be hosted or improved independently.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
