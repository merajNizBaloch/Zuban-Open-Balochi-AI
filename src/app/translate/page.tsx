import { ToolWorkbench } from "@/components/tool-workbench";

export default function TranslatePage() {
  return (
    <section className="section tool-page">
      <div className="shell">
        <h1>Translate Balochi.</h1>
        <p className="lead">Translate between Balochi, English, Urdu and Persian.</p>
        <ToolWorkbench mode="translate" />
      </div>
    </section>
  );
}
