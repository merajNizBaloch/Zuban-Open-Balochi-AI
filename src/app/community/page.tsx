import { CommunityQueue } from "@/components/community-queue";
import { ContributionForm } from "@/components/contribution-form";
import { UiText } from "@/components/ui-text";

const principles = [
  ["community.context", "Context", "community.context.desc", "Say which dialect, region or source the contribution belongs to when you know it."],
  ["community.permission", "Permission", "community.permission.desc", "Only contribute text, audio or images that can be legally shared and reused."],
  ["community.review", "Review", "community.review.desc", "Corrections stay public so speakers and researchers can discuss them before adoption."],
];

export default function CommunityPage() {
  return (
    <section className="section community-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.community.eyebrow" fallback="COMMUNITY" /></p>
          <h1 className="page-title"><UiText id="page.community.title" fallback="Build the language layer together." /></h1>
          <p className="lead wide"><UiText id="community.lead" fallback="Contribute words, sentences, corrections, pronunciation guidance, datasets and research. Every submission stays connected to its source and public review history." /></p>
        </div>

        <div className="community-principles">
          {principles.map(([titleId, title, textId, text]) => (
            <article key={titleId}>
              <h2><UiText id={titleId} fallback={title} /></h2>
              <p><UiText id={textId} fallback={text} /></p>
            </article>
          ))}
        </div>

        <div className="section-heading centered-section-heading community-section-heading">
          <div>
            <p className="eyebrow"><UiText id="community.queue.eyebrow" fallback="REVIEW QUEUE" /></p>
            <h2><UiText id="community.queue.title" fallback="See what the community is checking." /></h2>
          </div>
          <p>
            <UiText id="community.queue.desc" fallback="Contributions are GitHub issues so evidence, discussion and review decisions remain public." />
          </p>
        </div>

        <CommunityQueue />

        <div className="section-heading centered-section-heading community-section-heading">
          <div>
            <p className="eyebrow"><UiText id="community.contribute.eyebrow" fallback="CONTRIBUTE" /></p>
            <h2><UiText id="community.contribute.title" fallback="Add something useful." /></h2>
          </div>
          <p>
            <UiText id="community.contribute.desc" fallback="Zubán opens a structured GitHub issue that you can review and attach files to before submitting." />
          </p>
        </div>

        <ContributionForm />
      </div>
    </section>
  );
}
