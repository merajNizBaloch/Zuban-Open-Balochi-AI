---
title: Zubán Balochi Model Server
emoji: 🗣️
colorFrom: blue
colorTo: cyan
sdk: docker
app_port: 7860
short_description: Open Balochi speech, voice and OCR inference for Zubán.
---

# Zubán model server

Open inference service for the Balochi-specific model adapters used by Zubán.

## Endpoints

- `GET /health`
- `POST /warmup`
- `POST /stt`
- `POST /tts`
- `POST /ocr`

## Models

- STT: `Aynkader/Balochi_STT` — fine-tuned Whisper-small, Latin Balochi output.
- TTS: `Aynkader/Balochi-TTS-Three-Speakers` — SpeechT5, three Balochi speakers.
- OCR: Tesseract Urdu + Persian + Arabic as an interim Arabic-script fallback.

## Run with Docker

```bash
docker build -t zuban-model-server .
docker run --rm -p 7860:7860 zuban-model-server
```

Then configure the Zubán web app:

```env
ZUBAN_MODEL_SERVER_URL=http://localhost:7860
NEXT_PUBLIC_ZUBAN_MODEL_SERVER_URL=http://localhost:7860
```

The public variable lets browsers upload media directly to this service. CORS defaults to `*`; set `ZUBAN_CORS_ORIGINS=https://your-site.example` to restrict it.

## Deploy as a Hugging Face Docker Space

This directory is formatted as a Docker Space. The GitHub repository also contains an optional sync workflow.

Create a Hugging Face Space, then add these GitHub repository settings:

- Repository variable: `HF_SPACE_ID` → for example `your-hf-name/zuban-balochi-model-server`
- Repository secret: `HF_SPACE_TOKEN` → a fine-grained Hugging Face write token for that Space

After those are set, pushes affecting this directory can sync it to the Space.

## Hardware

The default `Dockerfile` installs CPU-only PyTorch and is intended for low-cost/free CPU hosting. `Dockerfile.gpu` is included for GPU deployments.

The first STT/TTS request downloads model weights from Hugging Face. You can pre-load them after deployment:

```bash
curl -X POST https://your-model-server.example/warmup
```

`GET /health` reports whether the STT and TTS weights are currently loaded.

## Known limitations

- STT currently returns **Latin-script Balochi**.
- TTS is trained for **Latin-script Balochi** and performs best on short text.
- OCR is not Balochi-specific yet; it uses related Arabic-script OCR models while a dedicated Balochi OCR dataset/model is developed.
