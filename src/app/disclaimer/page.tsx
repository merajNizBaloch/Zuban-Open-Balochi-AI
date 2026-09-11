import type { Metadata } from "next";
import Link from "next/link";
import { UiText } from "@/components/ui-text";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important information about the sources, limitations and ongoing development of Zubán's Balochi language technology.",
};

export default function DisclaimerPage() {
  return (
    <div className="disclaimer-page">
      <section className="section page-intro-center disclaimer-intro">
        <div className="shell narrow">
          <p className="eyebrow">
            <UiText id="disclaimer.page.eyebrow" fallback="DISCLAIMER" />
          </p>
          <h1 className="page-title">
            <UiText id="disclaimer.page.title" fallback="An open project for a developing digital language ecosystem." />
          </h1>
          <p className="lead wide">
            <UiText
              id="disclaimer.page.lead"
              fallback="Zubán is an open Balochi language technology project built from publicly available data, open resources, research and community contributions. It is a step toward stronger digital support for Balochi—not a claim that the language is fully represented online."
            />
          </p>
        </div>
      </section>

      <section className="section disclaimer-content">
        <div className="shell narrow">
          <article className="disclaimer-block">
            <span>01</span>
            <div>
              <h2><UiText id="disclaimer.page.sources.title" fallback="Built from available data" /></h2>
              <p>
                <UiText
                  id="disclaimer.page.sources.body"
                  fallback="Zubán uses and evaluates Balochi material that is available through public datasets, dictionaries, research projects, open-source models and other internet-accessible resources. The amount, quality, dialect coverage, script coverage and licensing clarity of this material can vary."
                />
              </p>
            </div>
          </article>

          <article className="disclaimer-block">
            <span>02</span>
            <div>
              <h2><UiText id="disclaimer.page.errors.title" fallback="Mistakes may occur" /></h2>
              <p>
                <UiText
                  id="disclaimer.page.errors.body"
                  fallback="Translations, dictionary entries, transliteration, chat responses, speech tools and OCR can contain mistakes, incomplete forms or region-specific wording. AI-generated answers can also be inaccurate. Important language information should be checked against fluent speakers and reliable sources."
                />
              </p>
            </div>
          </article>

          <article className="disclaimer-block">
            <span>03</span>
            <div>
              <h2><UiText id="disclaimer.page.digital.title" fallback="Balochi online resources are still growing" /></h2>
              <p>
                <UiText
                  id="disclaimer.page.digital.body"
                  fallback="Compared with high-resource languages, Balochi has far less structured digital data, fewer evaluated models and less standardized online tooling. Dialects and writing systems also vary. Zubán exists to help move this work forward while being transparent about those limitations."
                />
              </p>
            </div>
          </article>

          <article className="disclaimer-block">
            <span>04</span>
            <div>
              <h2><UiText id="disclaimer.page.improving.title" fallback="The project is continuously improving" /></h2>
              <p>
                <UiText
                  id="disclaimer.page.improving.body"
                  fallback="The team and open-source contributors review sources, correct mistakes, improve tools and add better data over time. Results may change as Zubán develops. Public corrections and reproducible research are part of the project by design."
                />
              </p>
            </div>
          </article>

          <article className="disclaimer-block">
            <span>05</span>
            <div>
              <h2><UiText id="disclaimer.page.community.title" fallback="Corrections are welcome" /></h2>
              <p>
                <UiText
                  id="disclaimer.page.community.body"
                  fallback="If you find a wrong word, translation, spelling, dialect label, OCR result, pronunciation or other language issue, please report it. Community review is one of the main ways Zubán can become more accurate and representative."
                />
              </p>
              <div className="disclaimer-actions">
                <Link className="button primary" href="/community">
                  <UiText id="disclaimer.page.community.cta" fallback="Contribute a correction" />
                </Link>
                <Link className="button secondary" href="/research">
                  <UiText id="disclaimer.page.research.cta" fallback="View research" />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
