import { MediaWorkbench } from "@/components/media-workbench";
import { VoiceWorkbench } from "@/components/voice-workbench";
import { UiText } from "@/components/ui-text";

export default function SpeechPage() {
  return (
    <section className="section tool-page speech-page">
      <div className="shell">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow"><UiText id="page.speech.eyebrow" fallback="SPEECH" /></p>
          <h1><UiText id="page.speech.title" fallback="Speech & voice." /></h1>
          <p className="lead"><UiText id="page.speech.lead" fallback="Transcribe Balochi audio or turn Balochi text into speech." /></p>
        </div>

        <div className="lab-stack">
          <article>
            <div className="lab-heading"><div><h2><UiText id="speech.stt" fallback="Speech to text" /></h2></div></div>
            <MediaWorkbench mode="stt" />
          </article>

          <article>
            <div className="lab-heading"><div><h2><UiText id="speech.tts" fallback="Text to speech" /></h2></div></div>
            <VoiceWorkbench />
          </article>
        </div>
      </div>
    </section>
  );
}
