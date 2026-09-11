import { UiText } from "@/components/ui-text";

const endpoints = [
  ["GET", "/api/dictionary?q=water", "developers.endpoint.dictionary", "Search sourced Balochi dictionary entries by script, Latin form, or English meaning."],
  ["POST", "/api/language", "developers.endpoint.language", "Normalize Balochi text, detect script, or convert Arabic ↔ Latin."],
  ["POST", "/api/chat/stream", "developers.endpoint.chat", "Stream Chat responses as UTF-8 text. Supports dialect and script preferences."],
  ["POST", "/api/text", "developers.endpoint.text", "Non-stream Chat or translation endpoint."],
  ["POST", "/api/media", "developers.endpoint.media", "Speech-to-text or OCR through the configured model server."],
  ["POST", "/api/voice", "developers.endpoint.voice", "Generate Balochi SpeechT5 audio through the configured model server."],
  ["GET", "/api/community", "developers.endpoint.community", "Read the public language-contribution review queue."],
  ["GET", "/api/status", "developers.endpoint.status", "Inspect model/provider status for this deployment."],
  ["GET", "/api/health", "developers.endpoint.health", "Deployment health endpoint."],
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
          <p className="eyebrow"><UiText id="page.developers.eyebrow" fallback="DEVELOPERS" /></p>
          <h1 className="page-title"><UiText id="page.developers.title" fallback="Build with Zubán." /></h1>
          <p className="lead wide"><UiText id="developers.lead" fallback="The same open language services used by the website are exposed as simple HTTP endpoints for experiments, education and Balochi-language products." /></p>
        </div>

        <div className="developer-endpoints">
          {endpoints.map(([method, route, descriptionId, description]) => (
            <article key={route}>
              <span>{method}</span>
              <code>{route}</code>
              <p><UiText id={descriptionId} fallback={description} /></p>
            </article>
          ))}
        </div>

        <div className="developer-examples">
          <article>
            <h2><UiText id="developers.script" fallback="Script conversion" /></h2>
            <pre>{languageExample}</pre>
          </article>
          <article>
            <h2><UiText id="developers.chat" fallback="Streaming Chat" /></h2>
            <pre>{chatExample}</pre>
          </article>
        </div>

        <div className="developer-note">
          <h2><UiText id="developers.open" fallback="Open, but not careless." /></h2>
          <p>
            <UiText id="developers.open.desc" fallback="Dictionary and language endpoints work without model credentials. Chat, translation, STT and TTS depend on the providers configured by the deployment. Public deployments should add their own rate limiting before exposing expensive inference at scale." />
          </p>
        </div>
      </div>
    </section>
  );
}
