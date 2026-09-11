import { ScriptLab } from "@/components/script-lab";

export default function LanguagePage() {
  return (
    <section className="section language-page">
      <div className="shell">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow">LANGUAGE LAB</p>
          <h1 className="page-title">Write Balochi across scripts.</h1>
          <p className="lead wide">
            Normalize Balochi text and convert between Arabic and Latin writing using sourced dictionary spellings first and transparent fallback rules second.
          </p>
        </div>

        <ScriptLab />
      </div>
    </section>
  );
}
