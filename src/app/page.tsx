import Link from "next/link";
import { tools } from "@/lib/site";

const principles = [
  ["01", "Dialect aware", "Western, Southern and Eastern varieties should be labelled rather than flattened."],
  ["02", "Provenance first", "Data keeps its source, license, script, dialect and verification history."],
  ["03", "Open by default", "Code, methods, model cards and reproducible evaluations belong in public."],
];

export default function Home() {
  return (
    <>
      <section className="hero section">
        <div className="shell hero-grid">
          <div>
            <div className="status-line"><span className="pulse" /> PUBLIC ALPHA · OPEN SOURCE</div>
            <h1>AI that speaks<span>Balochi.</span></h1>
            <p className="hero-copy">Zubán is a free, open-source initiative building language models, speech technology, datasets and research infrastructure for Balochi.</p>
            <div className="hero-actions">
              <Link className="button primary" href="/chat">Try Zubán</Link>
              <Link className="button secondary" href="/contribute">Contribute</Link>
            </div>
            <div className="hero-meta"><span>FREE FOREVER</span><span>COMMUNITY BUILT</span><span>RESEARCH DRIVEN</span></div>
          </div>

          <div className="signal-panel">
            <div className="signal-head"><span>ZUBÁN / SYSTEM MAP</span><span>v0.1</span></div>
            <div className="motif-core" aria-hidden="true"><div className="core-diamond">Z</div></div>
            <div className="signal-nodes"><span>TEXT</span><span>SPEECH</span><span>VISION</span><span>DATA</span><span>RESEARCH</span><span>COMMUNITY</span></div>
            <p>Built as modular open infrastructure rather than a single closed chatbot.</p>
          </div>
        </div>
        <div className="shell"><div className="culture-rule" aria-hidden="true" /></div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div><p className="eyebrow">TOOLS / 01—05</p><h2>One open language workspace.</h2></div>
            <p>Interfaces are available from day one; model-backed features are labelled honestly while their open adapters are connected and evaluated.</p>
          </div>
          <div className="tool-grid">
            {tools.map((tool) => (
              <Link className="tool-card" href={tool.href} key={tool.href}>
                <div className="tool-top"><span className="tool-index">{tool.index}</span><span className="status-chip">{tool.status}</span></div>
                <h3>{tool.title}</h3><p>{tool.description}</p><span className="card-link">Open tool →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section inverse">
        <div className="shell">
          <div className="section-heading"><div><p className="eyebrow">WHY ZUBÁN</p><h2>Built around the language, not around hype.</h2></div></div>
          <div className="principle-grid">
            {principles.map(([index, title, text]) => <article key={index}><span>{index}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell open-call">
          <p className="eyebrow">COMMUNITY / OPEN CALL</p>
          <h2>You do not need to be an AI researcher to help.</h2>
          <p>Speakers can verify translations. Writers can review spelling. Researchers can reproduce benchmarks. Developers can improve the platform. Every reviewed contribution makes Balochi AI better.</p>
          <Link className="button primary" href="/contribute">See ways to contribute</Link>
        </div>
      </section>
    </>
  );
}
