import { ToolWorkbench } from "@/components/tool-workbench";

export default function ChatPage() {
  return <section className="section tool-page"><div className="shell">
    <div className="tool-page-head"><div><p className="eyebrow">ZUBÁN / CHAT</p><h1>Open Balochi AI assistant.</h1></div><span className="status-chip">Alpha</span></div>
    <p className="lead">A conversational interface for Balochi language tasks. The frontend is ready for open or self-hosted models through an OpenAI-compatible adapter.</p>
    <ToolWorkbench mode="chat" />
  </div></section>;
}
