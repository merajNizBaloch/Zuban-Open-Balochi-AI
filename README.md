# Zubán — Open Balochi AI

Free, open-source language technology for Balochi.

Zubán combines a public product, reusable model adapters, open language resources, research, datasets, and a community contribution workflow.

## What works

- **Chat** — conversational interface with thread history, local persistence, and OpenAI-compatible model adapter.
- **Translate** — Balochi / English / Urdu / Persian translation workspace.
- **Dictionary** — searchable Balochi dictionary seed derived from Wiktionary with source attribution.
- **Speech-to-text** — file upload and browser microphone recording.
- **Text-to-speech** — Balochi voice generation through a configurable endpoint, with playback and download.
- **OCR** — document image upload, preview, extraction, and copy workflow.
- **Research** — reusable Balochi models/resources registry.
- **Datasets** — external resources plus Zubán dataset roadmap/status.
- **Contribute** — structured contribution form that opens a pre-filled GitHub issue.
- **Technology** — live model-adapter status on the current deployment.
- Responsive navigation and mobile layouts.

Model-backed tools require a configured model service. The product does not return fake results when a service is missing.

## Local development

```bash
git clone https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI.git
cd Zuban-Open-Balochi-AI
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Model adapters

Zubán deliberately keeps model hosting separate from the frontend.

### Chat + Translate

Set:

```env
ZUBAN_TEXT_API_URL=https://your-host/v1/chat/completions
ZUBAN_TEXT_API_KEY=
ZUBAN_TEXT_MODEL=your-model-id
```

The endpoint must accept an OpenAI-compatible chat-completions payload and return:

```json
{
  "choices": [
    {
      "message": {
        "content": "..."
      }
    }
  ]
}
```

Hugging Face Inference Providers expose an OpenAI-compatible router at `https://router.huggingface.co/v1/chat/completions`; a token with inference permission is required.

### Speech-to-text

Set `ZUBAN_STT_API_URL`. Zubán sends a multipart form with `file` and optional `model`. The service should return:

```json
{ "text": "transcription" }
```

The existing Balochi Whisper work can be self-hosted behind this adapter.

### Text-to-speech

Set `ZUBAN_TTS_API_URL`. Zubán sends:

```json
{ "text": "Balochi text", "model": "optional-model-id" }
```

The endpoint should return an `audio/*` response.

### OCR

Set `ZUBAN_OCR_API_URL`. Zubán sends an image as multipart form data and expects:

```json
{ "text": "extracted text" }
```

## Dictionary data

The initial dictionary seed is derived from the **Baluchi-English Wiktionary dictionary** in Vuizur/Wiktionary-Dictionaries. That dictionary data follows Wiktionary's dual licensing: **CC BY-SA 3.0 / GFDL**. The Zubán software remains Apache-2.0. Data licensing is tracked separately.

## Principles

- Free to use
- Open source
- Dialect-aware
- Script-aware
- Provenance-first data
- Reproducible research
- Community review
- No fake model outputs

## Contributing

See `CONTRIBUTING.md`. Speakers, linguists, researchers, students, writers, and developers are all welcome.

## License

Software: **Apache-2.0**

External datasets and dictionary material retain their own licenses and attribution requirements.
