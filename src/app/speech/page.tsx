export default function SpeechPage() {
  return <section className="section tool-page"><div className="shell">
    <div className="tool-page-head"><div><p className="eyebrow">ZUBÁN / SPEECH + VOICE</p><h1>Listen. Transcribe. Speak.</h1></div><span className="status-chip">Lab</span></div>
    <p className="lead">The speech workspace is being prepared around open ASR and TTS models. Model quality will be published with dialect and dataset context.</p>
    <div className="lab-grid">
      <article className="lab-card"><div className="lab-icon">WAV</div><p className="eyebrow">SPEECH → TEXT</p><h2>Transcribe Balochi audio</h2><p>Upload or record speech, then pass it to the configured Zubán STT adapter.</p><button className="button secondary" disabled>STT adapter coming next</button></article>
      <article className="lab-card"><div className="lab-icon">TTS</div><p className="eyebrow">TEXT → SPEECH</p><h2>Generate Balochi voice</h2><p>Voice synthesis will expose model, speaker and dataset provenance rather than hide it behind a generic player.</p><button className="button secondary" disabled>TTS adapter coming next</button></article>
    </div>
  </div></section>;
}
