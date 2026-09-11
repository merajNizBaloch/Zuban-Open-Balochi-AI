import { MediaWorkbench } from "@/components/media-workbench";
import { VoiceWorkbench } from "@/components/voice-workbench";

export default function SpeechPage() {
  return <section className="section tool-page"><div className="shell">
    <div className="tool-page-head"><div><p className="eyebrow">ZUBÁN / SPEECH + VOICE</p><h1>Listen. Transcribe. Speak.</h1></div><span className="status-chip">Lab</span></div>
    <p className="lead">The speech workspace supports configurable open ASR and TTS endpoints. Zubán will publish model, dataset and dialect context with every recommended baseline.</p>
    <div className="lab-stack">
      <article>
        <div className="lab-heading"><div><p className="eyebrow">SPEECH → TEXT</p><h2>Transcribe Balochi audio</h2></div><span className="status-chip">Adapter ready</span></div>
        <MediaWorkbench mode="stt" />
      </article>
      <article>
        <div className="lab-heading"><div><p className="eyebrow">TEXT → SPEECH</p><h2>Generate Balochi voice</h2></div><span className="status-chip">Adapter ready</span></div>
        <VoiceWorkbench />
      </article>
    </div>
  </div></section>;
}
