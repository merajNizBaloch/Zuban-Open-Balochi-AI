import { TranslationWorkbench } from "@/components/translation-workbench";

export default function TranslatePage() {
  return (
    <section className="section translate-page">
      <div className="shell">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow">TRANSLATE</p>
          <h1 className="page-title">Translate Balochi.</h1>
          <p className="lead">Balochi, English, Urdu and Persian in one workspace.</p>
        </div>
        <TranslationWorkbench />
      </div>
    </section>
  );
}
