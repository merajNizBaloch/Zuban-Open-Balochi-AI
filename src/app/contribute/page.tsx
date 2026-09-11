import { ContributionForm } from "@/components/contribution-form";
import { githubUrl } from "@/lib/site";
import { UiText } from "@/components/ui-text";

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
          <p className="eyebrow"><UiText id="contribute.eyebrow" fallback="CONTRIBUTE" /></p>
          <h1 className="page-title"><UiText id="contribute.title" fallback="Help build Zubán." /></h1>
          <p className="lead wide"><UiText id="contribute.lead" fallback="Speakers, writers, researchers and developers can all improve the project. Clear context and reliable sources matter more than volume." /></p>
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
            <div><h2><UiText id="contribute.send" fallback="Send a contribution." /></h2></div>
            <p><UiText id="contribute.send.desc" fallback="Fill this out here, then review the generated GitHub issue before submitting it." /></p>
          </div>
          <ContributionForm />
        </div>

        <div className="contribute-code-call">
          <div>
            <h2><UiText id="contribute.code" fallback="Contributing code?" /></h2>
            <p><UiText id="contribute.code.desc" fallback="Fork the repository, make a focused change, and open a pull request." /></p>
          </div>
          <a className="button secondary" href={githubUrl} target="_blank" rel="noreferrer">
            <UiText id="contribute.repo" fallback="View repository ↗" />
          </a>
        </div>
      </div>
    </section>
  );
}
