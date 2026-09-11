import Link from "next/link";
import { HomePrompt } from "@/components/home-prompt";
import { HomeAiAtmosphere } from "@/components/home-ai-atmosphere";
import { tools } from "@/lib/site";
import { UiText } from "@/components/ui-text";

export default function Home() {
  return (
    <>
      <section className="home-hero home-hero-centered">
        <HomeAiAtmosphere />
        <div className="shell home-center-wrap">
          <p className="home-brand-name hero-brand-word"><UiText id="home.brand" fallback="Zubán" /></p>

          <h1><UiText id="home.title" fallback="Open Balochi language technology." /></h1>

          <p className="home-intro home-intro-centered">
            <UiText id="home.intro" fallback="Chat, translate, read, listen, speak and build better tools for Balochi." />
          </p>

          <div className="hero-actions hero-actions-centered">
            <Link className="button primary" href="/chat"><UiText id="home.open" fallback="Open Zubán" /></Link>
            <Link className="button secondary" href="/community"><UiText id="home.contribute" fallback="Contribute" /></Link>
          </div>

          <HomePrompt />
        </div>
      </section>

      <section className="home-tools home-tools-centered">
        <div className="shell">
          <div className="home-section-title home-section-title-centered">
            <h2><UiText id="home.tools" fallback="Tools" /></h2>
            <p><UiText id="home.tools.desc" fallback="Use Zubán for everyday Balochi language work." /></p>
          </div>

          <div className="home-tool-grid">
            {tools.map((tool) => (
              <Link href={tool.href} className="home-tool-card" key={tool.href}>
                <span className="home-tool-number">{tool.index}</span>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <span className="home-tool-open">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-about home-about-centered">
        <div className="shell home-about-center">
          <h2><UiText id="home.about.title" fallback="Built for Balochi. Open to everyone." /></h2>
          <p>
            <UiText id="home.about.body" fallback="Zubán brings language tools, dictionaries, speech, OCR, datasets and research into one open project that speakers, students, researchers and developers can improve together." />
          </p>

          <div className="home-about-links home-about-links-centered">
            <Link href="/research"><UiText id="home.research" fallback="Research" /> →</Link>
            <Link href="/datasets"><UiText id="home.datasets" fallback="Datasets" /> →</Link>
            <Link href="/technology"><UiText id="home.technology" fallback="Technology" /> →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
