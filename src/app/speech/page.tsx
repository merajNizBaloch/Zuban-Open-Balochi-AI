import { MediaWorkbench } from "@/components/media-workbench";
import { VoiceWorkbench } from "@/components/voice-workbench";

export default function SpeechPage() {
  return (
    <section className="section tool-page speech-page">
      <div className="shell">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow">SPEECH</p>
          <h1>Speech & voice.</h1>
          <p className="lead">Transcribe Balochi audio or turn Balochi text into speech.</p>
        </div>

        <div className="lab-stack">
          <article>
            <div className="lab-heading"><div><h2>Speech to text</h2></div></div>
            <MediaWorkbench mode="stt" />
          </article>

          <article>
            <div className="lab-heading"><div><h2>Text to speech</h2></div></div>
            <VoiceWorkbench />
          </article>
        </div>
      </div>
    </section>
  );
}
