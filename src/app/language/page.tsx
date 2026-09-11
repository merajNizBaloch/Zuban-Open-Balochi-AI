import { ScriptLab } from "@/components/script-lab";
import { UiText } from "@/components/ui-text";

export default function LanguagePage() {
  return (
    <section className="section language-page">
      <div className="shell">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow"><UiText id="page.language.eyebrow" fallback="LANGUAGE LAB" /></p>
          <h1 className="page-title"><UiText id="page.language.title" fallback="Write Balochi across scripts." /></h1>
          <p className="lead wide">
            <UiText id="page.language.lead" fallback="Normalize Balochi text and convert between Arabic and Latin writing using sourced dictionary spellings first and transparent fallback rules second." />
          </p>
        </div>

        <ScriptLab />
      </div>
    </section>
  );
}
