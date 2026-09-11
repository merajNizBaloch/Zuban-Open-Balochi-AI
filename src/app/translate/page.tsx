import { TranslationWorkbench } from "@/components/translation-workbench";

export default function TranslatePage() {
  return (
    <section className="section translate-page">
      <div className="shell">
        <h1 className="page-title">Translate Balochi.</h1>
        <p className="lead">Translate between Balochi, English, Urdu and Persian.</p>
        <TranslationWorkbench />
      </div>
    </section>
  );
}
