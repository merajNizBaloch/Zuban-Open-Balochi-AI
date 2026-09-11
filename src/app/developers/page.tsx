const endpoints = [
  ["GET", "/api/dictionary?q=water", "Search sourced Balochi dictionary entries by script, Latin form, or English meaning."],
  ["POST", "/api/language", "Normalize Balochi text, detect script, or convert Arabic ↔ Latin."],
  ["POST", "/api/chat/stream", "Stream Chat responses as UTF-8 text. Supports dialect and script preferences."],
  ["POST", "/api/text", "Non-stream Chat or translation endpoint."],
  ["POST", "/api/media", "Speech-to-text or OCR through the configured model server."],
  ["POST", "/api/voice", "Generate Balochi SpeechT5 audio through the configured model server."],
  ["GET", "/api/community", "Read the public language-contribution review queue."],
  ["GET", "/api/status", "Inspect model/provider status for this deployment."],
  ["GET", "/api/health", "Deployment health endpoint."],
];

const languageExample = `await fetch("/api/language", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "transliterate",
    input: "آپ",
    target: "latin"
  })
});`;

const chatExample = `const response = await fetch("/api/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    input: "Write a short Balochi greeting",
    dialect: "western",
    scriptPreference: "arabic",
    messages: []
  })
});

const reader = response.body.getReader();`;

export default function DevelopersPage() {
  return (
    <section className="section developers-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow">DEVELOPERS</p>
          <h1 className="page-title">Build with Zubán.</h1>
          <p className="lead wide">
            The same open language services used by the website are exposed as simple HTTP endpoints for experiments, education and Balochi-language products.
          </p>
        </div>

        <div className="developer-endpoints">
          {endpoints.map(([method, route, description]) => (
            <article key={route}>
              <span>{method}</span>
              <code>{route}</code>
              <p>{description}</p>
            </article>
          ))}
        </div>

        <div className="developer-examples">
          <article>
            <h2>Script conversion</h2>
            <pre>{languageExample}</pre>
          </article>
          <article>
            <h2>Streaming Chat</h2>
            <pre>{chatExample}</pre>
          </article>
        </div>

        <div className="developer-note">
          <h2>Open, but not careless.</h2>
          <p>
            Dictionary and language endpoints work without model credentials. Chat, translation, STT and TTS depend on the providers configured by the deployment. Public deployments should add their own rate limiting before exposing expensive inference at scale.
          </p>
        </div>
      </div>
    </section>
  );
}
