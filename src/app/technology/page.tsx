import Link from "next/link";
import { ModelStatus } from "@/components/model-status";
import { UiText } from "@/components/ui-text";

const layers = [
  ["technology.layer.interface", "Use Zubán", "technology.layer.interface.desc", "Chat · Translate · Dictionary · Docs"],
  ["technology.layer.language", "Language help", "technology.layer.language.desc", "Meanings · spelling · Arabic and Latin writing"],
  ["technology.layer.knowledge", "Trusted sources", "technology.layer.knowledge.desc", "Dictionary entries and reviewed language examples"],
  ["technology.layer.research", "Keep improving", "technology.layer.research.desc", "Community corrections, testing and better language data"],
];

export default function TechnologyPage() {
  return (
    <section className="section technology-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.technology.eyebrow" fallback="HOW IT WORKS" /></p>
          <h1 className="page-title"><UiText id="page.technology.title" fallback="Simple on the outside." /></h1>
          <p className="lead wide"><UiText id="technology.lead" fallback="Zubán keeps the experience simple: ask a question, translate a sentence, look up a word or create a document." /></p>
          <Link className="button secondary" href="/setup"><UiText id="technology.setup" fallback="See what works right now →" /></Link>
        </div>

        <div className="technology-status">
          <div className="section-heading centered-section-heading">
            <div><h2><UiText id="technology.status" fallback="What works right now." /></h2></div>
            <p><UiText id="technology.status.desc" fallback="A simple view of the features that are ready to use." /></p>
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
            <h3><UiText id="technology.text" fallback="Chat and translation" /></h3>
            <p>
              <UiText id="technology.text.desc" fallback="Zubán uses its growing Balochi language collection to answer common questions and translate everyday English and Balochi." />
            </p>
          </article>
          <article className="info-card">
            <h3><UiText id="technology.media" fallback="Speech and images" /></h3>
            <p>
              <UiText id="technology.media.desc" fallback="Some features can listen to speech, read text aloud or pull writing from a clear image. These features are still growing." />
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
