import Link from "next/link";

export default function DictionaryPage() {
  return <section className="section tool-page"><div className="shell narrow">
    <p className="eyebrow">ZUBÁN / DICTIONARY</p><h1>A lexicon we can trace and review.</h1>
    <p className="lead">Zubán Dictionary will merge only reusable sources with clear licensing and community-reviewed entries. We are intentionally not filling the alpha with unverified scraped definitions.</p>
    <div className="search-shell"><span>⌕</span><input aria-label="Dictionary search" placeholder="Search the verified lexicon…" disabled /><span className="status-chip">Import pending</span></div>
    <div className="two-col">
      <article className="info-card"><p className="eyebrow">ENTRY SCHEMA</p><h3>More than word → meaning.</h3><p>Each entry can retain script, dialect, pronunciation, examples, source, license and review state.</p></article>
      <article className="info-card accent-card"><p className="eyebrow">HELP BUILD IT</p><h3>Know a reliable dictionary or word source?</h3><p>Submit the source and license first. We will audit it before importing entries.</p><Link href="/contribute">Contribute a source →</Link></article>
    </div>
  </div></section>;
}
