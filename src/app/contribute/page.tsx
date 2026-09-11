import { githubUrl } from "@/lib/site";

const paths = [
  ["Translate", "Verify or correct a Balochi translation and label the variety when known."],
  ["Words", "Propose dictionary entries with meaning, example and a traceable source."],
  ["Voice", "Help us design consented, dialect-labelled speech collection."],
  ["Data", "Point us to reusable corpora, dictionaries, recordings or archives with licensing information."],
  ["Code", "Build model adapters, UI, evaluation tooling, accessibility and documentation."],
  ["Research", "Reproduce baselines, review methodology or propose a benchmark task."],
];

export default function ContributePage() {
  return <section className="section"><div className="shell">
    <p className="eyebrow">ZUBÁN / CONTRIBUTE</p><h1 className="page-title">Teach the system with us.</h1>
    <p className="lead wide">Zubán is designed so speakers and linguists can contribute as meaningfully as developers. Quality and provenance matter more than raw volume.</p>
    <div className="contribute-grid">{paths.map(([title, text], index) => <article className="contribute-card" key={title}><span>C/{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{text}</p></article>)}</div>
    <div className="contribution-call">
      <div><p className="eyebrow">CURRENT WORKFLOW</p><h2>Start through GitHub while the community data portal is built.</h2><p>Use the contribution issue templates for data sources and linguistic corrections, or open a pull request for code and research documentation.</p></div>
      <a className="button primary" href={githubUrl + "/issues/new/choose"} target="_blank" rel="noreferrer">Open contribution issue ↗</a>
    </div>
  </div></section>;
}
