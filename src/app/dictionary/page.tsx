import { DictionaryBrowser } from "@/components/dictionary-browser";

export default function DictionaryPage() {
  return (
    <section className="section dictionary-page">
      <div className="shell narrow">
        <h1 className="page-title">Balochi dictionary.</h1>
        <p className="lead">
          Search Balochi words by script, Latin transcription, or English meaning.
        </p>
        <DictionaryBrowser />
      </div>
    </section>
  );
}
