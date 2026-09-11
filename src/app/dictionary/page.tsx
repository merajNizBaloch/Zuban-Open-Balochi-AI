import { DictionaryBrowser } from "@/components/dictionary-browser";

export default function DictionaryPage() {
  return (
    <section className="section dictionary-page">
      <div className="shell narrow">
        <div className="page-intro-center">
          <p className="eyebrow">DICTIONARY</p>
          <h1 className="page-title">Balochi dictionary.</h1>
          <p className="lead">
            Search by Balochi script, Latin transcription or English meaning.
          </p>
        </div>
        <DictionaryBrowser />
      </div>
    </section>
  );
}
