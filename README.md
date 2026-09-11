# Zubán — Open Balochi AI

Free, open-source language technology for Balochi.

Zubán combines a public product, reusable model adapters, open language resources, research, datasets, and a community contribution workflow.

## What works

- **Chat** — ChatGPT-style conversation UI with thread history, local persistence, sourced dictionary hints, and open-model providers.
- **Translate** — Balochi / English / Urdu / Persian translation workspace.
- **Dictionary** — searchable Balochi dictionary seed derived from Wiktionary with source attribution.
- **Speech-to-text** — audio upload and browser microphone recording, ready for the open Balochi Whisper model.
- **Text-to-speech** — three Balochi SpeechT5 voices with playback and download.
- **OCR** — image upload, preview and extraction. If no server is configured, OCR runs in the browser using Urdu + Persian + Arabic Tesseract language data as a Balochi-script fallback.
- **Research** — reusable Balochi models/resources registry.
- **Datasets** — external resources plus Zubán dataset roadmap/status.
- **Contribute** — structured contribution form that opens a pre-filled GitHub issue.
- **Technology** — live provider/model status.
- Responsive navigation, app metadata and automated CI.

The product does not invent fake model outputs when a service is unavailable.

## Local development

```bash
git clone https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI.git
cd Zuban-Open-Balochi-AI
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## 1. Chat + Translate

### Hugging Face Inference Providers

The easiest hosted setup is a Hugging Face token with **Make calls to Inference Providers** permission:

```env
HF_TOKEN=hf_...
ZUBAN_HF_TEXT_MODEL=Qwen/Qwen3-8B:cheapest
```

Zubán automatically uses:

```text
https://router.huggingface.co/v1/chat/completions
```

The default open model is Qwen3-8B. You can replace it with any compatible chat-completion model served by Hugging Face Inference Providers.

### Custom OpenAI-compatible endpoint

```env
ZUBAN_TEXT_API_URL=https://your-host/v1/chat/completions
ZUBAN_TEXT_API_KEY=
ZUBAN_TEXT_MODEL=your-model-id
```

A custom endpoint takes priority over Hugging Face.

### Local Ollama

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
```

This lets Chat and Translate run against a fully local open model.

## 2. Balochi Speech + Voice

The repository includes a deployable FastAPI service:

```text
services/balochi-model-server
```

It uses:

- STT: `Aynkader/Balochi_STT` — fine-tuned Whisper-small for Balochi, returning Latin-script Balochi.
- TTS: `Aynkader/Balochi-TTS-Three-Speakers` — SpeechT5 with Ayn Káder, Dódá and Dódén voices.
- OCR: Tesseract Urdu + Persian + Arabic as an interim Arabic-script fallback.

Run it:

```bash
cd services/balochi-model-server
docker build -t zuban-model-server .
docker run --rm -p 7860:7860 zuban-model-server
```

Connect the Next.js app with one URL:

```env
ZUBAN_MODEL_SERVER_URL=http://localhost:7860
```

Zubán derives `/stt`, `/tts`, `/ocr` and `/health` from that base URL. Individual endpoint variables remain available as overrides.

Check a deployment with:

```bash
ZUBAN_MODEL_SERVER_URL=http://localhost:7860 npm run check:model-server
```

### Hugging Face Space deployment

The service directory is already configured as a Docker Space. To keep it synchronized from GitHub:

1. Create a Hugging Face Docker Space.
2. In this GitHub repository add variable `HF_SPACE_ID` with `your-hf-user/your-space`.
3. Add secret `HF_SPACE_TOKEN` with a fine-grained Hugging Face write token for that Space.
4. The `Sync Balochi model server to Hugging Face` workflow will mirror `services/balochi-model-server` to the Space when that directory changes.

Once the Space is running, put its public base URL into `ZUBAN_MODEL_SERVER_URL` on the web deployment.

GPU is recommended for STT/TTS.

## 3. OCR without a server

OCR works even when `ZUBAN_OCR_API_URL` is empty. The browser dynamically loads Tesseract.js and the Urdu, Persian and Arabic language packs.

This is an **interim fallback**, not a claim of Balochi-specific OCR accuracy. A dedicated Balochi OCR dataset/model is still a research task.

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
