import { ToolWorkbench } from "@/components/tool-workbench";

export default function ChatPage() {
  return (
    <section className="section tool-page">
      <div className="shell">
        <h1>Chat in Balochi.</h1>
        <p className="lead">Write in Balochi, English, Urdu or Persian.</p>
        <ToolWorkbench mode="chat" />
      </div>
    </section>
  );
}
