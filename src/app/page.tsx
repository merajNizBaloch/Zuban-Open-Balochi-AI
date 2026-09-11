import Link from "next/link";
import { tools } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <h1>Zubán</h1>
            <p className="home-kicker">Balochi language, built in the open.</p>
            <p className="home-intro">
              Chat, translate, listen, speak, read and contribute to better Balochi language technology.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/chat">Open Zubán</Link>
              <Link className="text-link" href="/contribute">Contribute →</Link>
            </div>
          </div>

          <div className="home-motif" aria-hidden="true">
            <div className="motif-frame">
              <div className="motif-diamond" />
              <div className="motif-diamond small one" />
              <div className="motif-diamond small two" />
              <div className="motif-line horizontal" />
              <div className="motif-line vertical" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-tools">
        <div className="shell">
          <div className="home-section-title">
            <h2>Tools</h2>
            <p>Start with the language. Everything else stays in the background.</p>
          </div>

          <div className="clean-tool-list">
            {tools.map((tool) => (
              <Link href={tool.href} className="clean-tool-row" key={tool.href}>
                <span className="clean-tool-number">{tool.index}</span>
                <div>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
                <span className="clean-tool-arrow">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-about">
        <div className="shell home-about-grid">
          <div>
            <h2>More than a chatbot.</h2>
          </div>
          <div>
            <p>
              Zubán is being built as open infrastructure for Balochi: language tools, datasets,
              speech, OCR, research and community contributions in one place.
            </p>
            <div className="home-about-links">
              <Link href="/research">Research →</Link>
              <Link href="/datasets">Datasets →</Link>
              <Link href="/technology">Technology →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
