import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zuban DocX — Balochi Document Editor",
  description:
    "A Balochi-first document workspace for writing, formatting, saving and exporting Balochi documents.",
};

export default function ZubanDocsPage() {
  return (
    <div className="docs-landing">
      <section className="docs-hero section">
        <div className="shell docs-hero-grid">
          <div className="docs-hero-copy">
            <p className="eyebrow">ZUBAN DOCX · بلوچی نویسگ</p>
            <h1>Write Balochi without fighting your editor.</h1>
            <p className="lead">
              Zuban DocX is a Balochi-first word processor. Write in Arabic or
              Roman Balochi, use Balochi keyboards and fonts, add images and
              tables, work with Word files, and keep private local drafts.
            </p>
            <div className="hero-actions">
              <Link
                className="button primary"
                href="/docs/editor"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Zuban DocX ↗
              </Link>
              <a className="button secondary" href="#features">
                Explore features
              </a>
            </div>
            <div className="docs-hero-meta">
              <span>BALOCHI ONLY</span>
              <span>ARABIC + LATIN SCRIPT</span>
              <span>WORD .DOCX</span>
              <span>LOCAL AUTOSAVE</span>
              <span>NO ACCOUNT REQUIRED</span>
            </div>
          </div>

          <div className="docs-preview" aria-label="Zuban DocX editor preview">
            <div className="docs-preview-top">
              <span className="docs-preview-dot" />
              <strong>زُبان DocX</strong>
              <span>Saved</span>
            </div>
            <div className="docs-preview-toolbar">
              <span>B</span><span>I</span><span>U</span><i />
              <span>¶</span><span>↔</span><span>100%</span>
            </div>
            <div className="docs-preview-page" dir="rtl">
              <small>بلوچی · عربی رسم الخط</small>
              <h2>مئے زبان، مئے نویسگ</h2>
              <p>
                بلوچی نویسگ ءَ یک سادہ، صاف و آرامیں جاگہے۔ زُبان DocX ءَ
                نوشتگ، سنبھالگ و دگہ کاراں ءِ واستہ جوڑ کنگ بوتگ۔
              </p>
              <p>
                رسم الخط، نوشتن ءِ سمت و خاص حرف یکجاہ دسترس ءَ انت۔
              </p>
              <div className="docs-preview-cursor" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section docs-feature-section">
        <div className="shell">
          <div className="home-section-title">
            <div>
              <p className="eyebrow">BUILT FOR THE LANGUAGE</p>
              <h2>Not a generic editor with a Balochi label.</h2>
            </div>
            <p>
              The writing environment itself understands script direction,
              Balochi character needs and document workflows.
            </p>
          </div>

          <div className="docs-feature-grid">
            <article>
              <span>01</span>
              <h3>Balochi keyboards</h3>
              <p>
                Keep a document in Arabic-script Balochi or Latin-script
                Balochi. Mixed-script text is flagged before it becomes a mess.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Real document tools</h3>
              <p>
                Page sizes, margins, headers, footers, page numbers, tables,
                images, exact font sizes, colors, Find & Replace and real DOCX.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Balochi fonts</h3>
              <p>
                Insert commonly needed extended Arabic or Latin characters
                without changing your operating-system keyboard.
              </p>
            </article>
            <article>
              <span>04</span>
              <h3>Images in your documents</h3>
              <p>
                Documents autosave in your browser. Create, duplicate, search,
                checkpoint and restore drafts without an account.
              </p>
            </article>
            <article>
              <span>05</span>
              <h3>Dialect-respectful</h3>
              <p>
                Zuban DocX does not force one regional spelling as the only
                valid form. The editor focuses on script consistency, not
                policing dialect.
              </p>
            </article>
            <article>
              <span>06</span>
              <h3>Balochi tools inside the page</h3>
              <p>
                Select text to look up a meaning, translate it, switch Arabic
                and Roman writing, or check spelling with the Zubán dictionary.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section docs-cta-section">
        <div className="shell docs-cta">
          <div>
            <p className="eyebrow">START WRITING</p>
            <h2>Your Balochi document workspace is ready.</h2>
          </div>
          <Link
            className="button primary"
            href="/docs/editor"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create a document ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
