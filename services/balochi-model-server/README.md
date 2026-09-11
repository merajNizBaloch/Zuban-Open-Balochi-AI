# Zubán model server

This optional service hosts the Balochi-specific models that are too large for a normal Vercel function.

## Models

- STT: `Aynkader/Balochi_STT` — fine-tuned Whisper-small, Latin Balochi output.
- TTS: `Aynkader/Balochi-TTS-Three-Speakers` — SpeechT5, three Balochi speakers.
- OCR: Tesseract Urdu + Persian + Arabic as an interim Arabic-script fallback.

## Run with Docker

```bash
cd services/balochi-model-server
docker build -t zuban-model-server .
docker run --rm -p 7860:7860 zuban-model-server
```

Then set in the Next.js app:

```env
ZUBAN_STT_API_URL=http://localhost:7860/stt
ZUBAN_TTS_API_URL=http://localhost:7860/tts
ZUBAN_OCR_API_URL=http://localhost:7860/ocr
```

The first start downloads the model files from Hugging Face. GPU is recommended for STT/TTS; CPU works but can be slow.

## Hugging Face Space

This directory is also suitable for a Docker Space. Create a Docker Space and copy these files into it, then point the three Zubán environment URLs at the Space endpoints.

## Important model limitations

The current STT model returns **Latin-script Balochi**. The current TTS model is also trained for **Latin-script Balochi** and performs best on short text. OCR is not yet Balochi-specific; it uses related Arabic-script language models until a dedicated Balochi OCR dataset/model is trained.
