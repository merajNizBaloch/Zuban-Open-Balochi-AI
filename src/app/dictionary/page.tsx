import { DictionaryBrowser } from "@/components/dictionary-browser";
import { UiText } from "@/components/ui-text";

export default function DictionaryPage() {
  return (
    <section className="section dictionary-page">
      <div className="shell narrow">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.dictionary.eyebrow" fallback="DICTIONARY" /></p>
          <h1 className="page-title"><UiText id="page.dictionary.title" fallback="Balochi dictionary." /></h1>
          <p className="lead">
            <UiText id="page.dictionary.lead" fallback="Search by Balochi script, Latin transcription or English meaning." />
          </p>
        </div>
        <DictionaryBrowser />
      </div>
    </section>
  );
}
