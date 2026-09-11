import Link from "next/link";
import { HomePrompt } from "@/components/home-prompt";
import { HomeAiAtmosphere } from "@/components/home-ai-atmosphere";
import { ZubanLogo } from "@/components/zuban-logo";
import { tools } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="home-hero home-hero-centered">
        <HomeAiAtmosphere />
        <div className="shell home-center-wrap">
          <div className="home-logo-wrap">
            <ZubanLogo
              className="home-primary-logo"
              alt="Zubán"
              width={320}
              height={320}
              priority
            />
          </div>

          <p className="home-brand-name">Zubán</p>

          <h1>Open Balochi language technology.</h1>

          <p className="home-intro home-intro-centered">
            Chat, translate, read, listen, speak and build better tools for Balochi.
          </p>

          <div className="hero-actions hero-actions-centered">
            <Link className="button primary" href="/chat">Open Zubán</Link>
            <Link className="button secondary" href="/community">Contribute</Link>
          </div>

          <HomePrompt />
        </div>
      </section>

      <section className="home-tools home-tools-centered">
        <div className="shell">
          <div className="home-section-title home-section-title-centered">
            <h2>Tools</h2>
            <p>Use Zubán for everyday Balochi language work.</p>
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
          <h2>Built for Balochi. Open to everyone.</h2>
          <p>
            Zubán brings language tools, dictionaries, speech, OCR, datasets and research
            into one open project that speakers, students, researchers and developers can improve together.
          </p>

          <div className="home-about-links home-about-links-centered">
            <Link href="/research">Research →</Link>
            <Link href="/datasets">Datasets →</Link>
            <Link href="/technology">Technology →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
