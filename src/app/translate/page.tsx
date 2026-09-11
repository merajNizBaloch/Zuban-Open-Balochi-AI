import { ToolWorkbench } from "@/components/tool-workbench";

export default function TranslatePage() {
  return <section className="section tool-page"><div className="shell">
    <div className="tool-page-head"><div><p className="eyebrow">ZUBÁN / TRANSLATE</p><h1>Translate without hiding uncertainty.</h1></div><span className="status-chip">Alpha</span></div>
    <p className="lead">Balochi ↔ English, Urdu and Persian. Dialect-sensitive evaluation will be added before any model is described as production quality.</p>
    <ToolWorkbench mode="translate" />
  </div></section>;
}
