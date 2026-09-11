const layers = [
  ["INTERFACE", "Chat · Translate · Dictionary · Speech · OCR"],
  ["ADAPTERS", "Text model · STT · TTS · OCR · Embeddings"],
  ["LANGUAGE", "Normalization · tokenization · dialect/script metadata"],
  ["KNOWLEDGE", "Lexicon · corpora · literature · verified sources"],
  ["RESEARCH", "Model cards · experiments · Zubán Bench"],
];

export default function TechnologyPage() {
  return <section className="section"><div className="shell">
    <p className="eyebrow">ZUBÁN / TECHNOLOGY</p><h1 className="page-title">Modular by design.</h1>
    <p className="lead wide">Zubán is not tied to one model provider. Components can improve independently while the public interfaces stay consistent.</p>
    <div className="stack-map">{layers.map(([label, text], index) => <div className="stack-layer" key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><p>{text}</p></div>)}</div>
    <div className="two-col">
      <article className="info-card"><p className="eyebrow">TEXT PROVIDER</p><h3>OpenAI-compatible, not OpenAI-dependent.</h3><p>The first adapter uses a standard chat-completions shape so an open/self-hosted endpoint can be swapped in without redesigning the product.</p></article>
      <article className="info-card"><p className="eyebrow">NEXT</p><h3>Model adapters + evaluation.</h3><p>STT, TTS and OCR connectors will follow the same pattern, each paired with a public model card and benchmark result.</p></article>
    </div>
  </div></section>;
}
