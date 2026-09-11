import Link from "next/link";
import { tools } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <div className="hero-brand-lockup" aria-label="Zubán">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/zuban-mark.webp?v=4" alt="" width="112" height="112" />
              <span>Zubán</span>
            </div>

            <h1>Balochi language technology, built in the open.</h1>
            <p className="home-intro">
              Chat, translate, speech, OCR, datasets and research for Balochi.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/chat">Open Zubán</Link>
              <Link className="text-link" href="/contribute">Contribute →</Link>
            </div>
          </div>

          <div className="home-logo-stage" aria-hidden="true">
            <div className="home-mark-orbit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="home-logo-mark"
                src="/zuban-mark.webp?v=4"
                alt=""
                width="420"
                height="420"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="home-tools">
        <div className="shell">
          <div className="home-section-title">
            <h2>Tools</h2>
            <p>Simple tools for using, studying and building with Balochi.</p>
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
            <h2>Open technology. Shared knowledge.</h2>
          </div>
          <div>
            <p>
              Zubán brings Balochi language tools, datasets, speech, OCR and research into one open project that people can use, study and improve together.
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
