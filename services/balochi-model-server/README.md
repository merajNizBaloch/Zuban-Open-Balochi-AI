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
ZUBAN_STT_API_URL=http://localhost:7860/stt
ZUBAN_TTS_API_URL=http://localhost:7860/tts
ZUBAN_OCR_API_URL=http://localhost:7860/ocr
```

## Deploy as a Hugging Face Docker Space

This directory is formatted as a Docker Space. The GitHub repository also contains an optional sync workflow.

Create a Hugging Face Space, then add these GitHub repository settings:

- Repository variable: `HF_SPACE_ID` → for example `your-hf-name/zuban-balochi-model-server`
- Repository secret: `HF_SPACE_TOKEN` → a fine-grained Hugging Face write token for that Space

After those are set, pushes affecting this directory can sync it to the Space.

## Hardware

The service can start on CPU, but Balochi Whisper and SpeechT5 are much more practical on GPU hardware. The first request downloads model weights from Hugging Face.

## Known limitations

- STT currently returns **Latin-script Balochi**.
- TTS is trained for **Latin-script Balochi** and performs best on short text.
- OCR is not Balochi-specific yet; it uses related Arabic-script OCR models while a dedicated Balochi OCR dataset/model is developed.
