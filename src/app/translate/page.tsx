import { TranslationWorkbench } from "@/components/translation-workbench";
import { UiText } from "@/components/ui-text";

export default function TranslatePage() {
  return (
    <section className="section translate-page">
      <div className="shell">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow"><UiText id="page.translate.eyebrow" fallback="TRANSLATE" /></p>
          <h1 className="page-title"><UiText id="page.translate.title" fallback="Translate Balochi." /></h1>
          <p className="lead"><UiText id="page.translate.lead" fallback="Balochi, English, Urdu and Persian in one workspace." /></p>
        </div>
        <TranslationWorkbench />
      </div>
    </section>
  );
}
