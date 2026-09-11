import Link from "next/link";
import { ModelStatus } from "@/components/model-status";
import { UiText } from "@/components/ui-text";

const layers = [
  ["technology.layer.interface", "Interface", "technology.layer.interface.desc", "Chat · Translate · Dictionary · Speech · OCR"],
  ["technology.layer.adapters", "Model adapters", "technology.layer.adapters.desc", "Text · speech-to-text · text-to-speech · OCR"],
  ["technology.layer.language", "Language", "technology.layer.language.desc", "Normalization · tokenization · dialect and script metadata"],
  ["technology.layer.knowledge", "Knowledge", "technology.layer.knowledge.desc", "Dictionary · corpora · verified language resources"],
  ["technology.layer.research", "Research", "technology.layer.research.desc", "Model cards · evaluations · Zubán Bench"],
];

export default function TechnologyPage() {
  return (
    <section className="section technology-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.technology.eyebrow" fallback="TECHNOLOGY" /></p>
          <h1 className="page-title"><UiText id="page.technology.title" fallback="Modular by design." /></h1>
          <p className="lead wide"><UiText id="technology.lead" fallback="Zubán keeps the product separate from the underlying models so better open models can replace older ones without rebuilding the interface." /></p>
          <Link className="button secondary" href="/setup"><UiText id="technology.setup" fallback="Check deployment setup →" /></Link>
        </div>

        <div className="technology-status">
          <div className="section-heading centered-section-heading">
            <div><h2><UiText id="technology.status" fallback="Service status." /></h2></div>
            <p><UiText id="technology.status.desc" fallback="Live status for the model adapters configured on this deployment." /></p>
          </div>
          <ModelStatus />
        </div>

        <div className="stack-map">
          {layers.map(([labelId, label, textId, text], index) => (
            <div className="stack-layer" key={labelId}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong><UiText id={labelId} fallback={label} /></strong>
              <p><UiText id={textId} fallback={text} /></p>
            </div>
          ))}
        </div>

        <div className="two-col">
          <article className="info-card">
            <h3><UiText id="technology.text" fallback="Text model" /></h3>
            <p>
              <UiText id="technology.text.desc" fallback="Chat and Translate prefer Hugging Face, a custom OpenAI-compatible endpoint, or local Ollama when configured. Without one, the product can run a small model locally through WebGPU with no user login, while exact dictionary lookup remains available." />
            </p>
          </article>
          <article className="info-card">
            <h3><UiText id="technology.media" fallback="Media models" /></h3>
            <p>
              <UiText id="technology.media.desc" fallback="Speech and voice use the shared Balochi model server. OCR can use that server or fall back to browser OCR." />
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
