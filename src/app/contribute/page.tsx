import { ContributionForm } from "@/components/contribution-form";
import { githubUrl } from "@/lib/site";

const paths = [
  ["Language", "Correct a translation, add a word, or document a regional form."],
  ["Voice", "Contribute speech sources, recordings with permission, or pronunciation guidance."],
  ["Data", "Point Zubán to reusable corpora, dictionaries, archives, or datasets."],
  ["Research", "Reproduce a result, propose a benchmark, or contribute methodology."],
  ["Code", "Improve the product, adapters, accessibility, documentation, or evaluation tools."],
];

export default function ContributePage() {
  return (
    <section className="section contribute-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow">CONTRIBUTE</p>
          <h1 className="page-title">Help build Zubán.</h1>
          <p className="lead wide">
            Speakers, writers, researchers and developers can all improve the project. Clear context and reliable sources matter more than volume.
          </p>
        </div>

        <div className="contribute-paths contribute-paths-clean">
          {paths.map(([title, text]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className="contribute-form-section">
          <div className="section-heading centered-section-heading">
            <div><h2>Send a contribution.</h2></div>
            <p>Fill this out here, then review the generated GitHub issue before submitting it.</p>
          </div>
          <ContributionForm />
        </div>

        <div className="contribute-code-call">
          <div>
            <h2>Contributing code?</h2>
            <p>Fork the repository, make a focused change, and open a pull request.</p>
          </div>
          <a className="button secondary" href={githubUrl} target="_blank" rel="noreferrer">
            View repository ↗
          </a>
        </div>
      </div>
    </section>
  );
}
