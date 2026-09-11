import io
import os
import threading
from functools import lru_cache

import numpy as np
import pytesseract
import soundfile as sf
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from huggingface_hub import hf_hub_download
from PIL import Image
from pydub import AudioSegment
from pydantic import BaseModel
from transformers import (
    SpeechT5ForTextToSpeech,
    SpeechT5HifiGan,
    SpeechT5Processor,
    WhisperForConditionalGeneration,
    WhisperProcessor,
)

app = FastAPI(
    title="Zubán Balochi Model Server",
    description="Open inference service for Zubán speech, voice and OCR.",
    version="0.1.0",
)

cors_origins = [
    item.strip()
    for item in os.getenv("ZUBAN_CORS_ORIGINS", "*").split(",")
    if item.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
STT_MODEL = os.getenv("ZUBAN_STT_MODEL", "Aynkader/Balochi_STT")
TTS_MODEL = os.getenv("ZUBAN_TTS_MODEL", "Aynkader/Balochi-TTS-Three-Speakers")
OCR_LANGS = os.getenv("ZUBAN_OCR_LANGS", "urd+fas+ara")

_stt_lock = threading.Lock()
_tts_lock = threading.Lock()


class TTSRequest(BaseModel):
    text: str
    model: str | None = None
    speaker: str = "ayn_kader"


@lru_cache(maxsize=1)
def load_stt():
    processor = WhisperProcessor.from_pretrained(STT_MODEL, subfolder="best_model/processor")
    model = WhisperForConditionalGeneration.from_pretrained(
        STT_MODEL,
        subfolder="best_model/model",
    ).to(DEVICE)
    model.eval()
    model.config.forced_decoder_ids = None
    model.generation_config.forced_decoder_ids = None
    return processor, model


@lru_cache(maxsize=1)
def load_tts():
    processor = SpeechT5Processor.from_pretrained(TTS_MODEL)
    model = SpeechT5ForTextToSpeech.from_pretrained(TTS_MODEL).to(DEVICE).eval()
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(DEVICE).eval()
    return processor, model, vocoder


def speaker_embedding(speaker: str):
    files = {
        "ayn_kader": "speaker_embedding_ayn_kader.pt",
        "doda": "speaker_embedding_doda.pt",
        "doden": "speaker_embedding_doden.pt",
    }
    filename = files.get(speaker, files["ayn_kader"])
    path = hf_hub_download(TTS_MODEL, filename)
    value = torch.load(path, map_location="cpu", weights_only=False)
    if value.dim() == 1:
        value = value.unsqueeze(0)
    return value.to(DEVICE)


def decode_audio(raw: bytes):
    try:
        audio = AudioSegment.from_file(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unsupported audio file.") from exc

    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    samples = np.array(audio.get_array_of_samples(), dtype=np.float32) / 32768.0
    return samples


def transcribe(samples: np.ndarray):
    processor, model = load_stt()
    chunk_size = 30 * 16000
    chunks = [samples[i : i + chunk_size] for i in range(0, len(samples), chunk_size)]
    outputs: list[str] = []

    with _stt_lock, torch.inference_mode():
        for chunk in chunks:
            if not len(chunk):
                continue
            inputs = processor(
                chunk,
                sampling_rate=16000,
                return_tensors="pt",
                return_attention_mask=True,
            )
            features = inputs.input_features.to(DEVICE)
            attention_mask = inputs.attention_mask.to(DEVICE)
            predicted = model.generate(
                features,
                attention_mask=attention_mask,
                max_new_tokens=224,
            )
            text = processor.batch_decode(predicted.cpu(), skip_special_tokens=True)[0].strip()
            if text:
                outputs.append(text)

    return " ".join(outputs).strip()


@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "online",
        "device": DEVICE,
        "stt_model": STT_MODEL,
        "tts_model": TTS_MODEL,
        "ocr_languages": OCR_LANGS,
        "models": {
            "stt_loaded": load_stt.cache_info().currsize > 0,
            "tts_loaded": load_tts.cache_info().currsize > 0,
        },
        "features": ["Balochi STT", "Balochi TTS", "Arabic-script OCR fallback"],
    }


@app.post("/warmup")
def warmup():
    result = {
        "device": DEVICE,
        "stt_loaded": False,
        "tts_loaded": False,
    }

    try:
        load_stt()
        result["stt_loaded"] = True
    except Exception as exc:
        result["stt_error"] = str(exc)

    try:
        load_tts()
        speaker_embedding("ayn_kader")
        result["tts_loaded"] = True
    except Exception as exc:
        result["tts_error"] = str(exc)

    return result


@app.post("/stt")
async def stt(file: UploadFile = File(...), model: str | None = Form(default=None)):
    del model
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Audio file is empty.")
    if len(raw) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file is too large.")

    samples = decode_audio(raw)
    text = transcribe(samples)
    if not text:
        raise HTTPException(status_code=422, detail="No Balochi speech was recognized.")

    return {
        "text": text,
        "script": "Latin",
        "model": STT_MODEL,
    }


@app.post("/tts")
def tts(request: TTSRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is empty.")
    if len(text) > 600:
        raise HTTPException(status_code=400, detail="Keep TTS input below 600 characters.")

    processor, model, vocoder = load_tts()
    speaker = speaker_embedding(request.speaker)

    try:
        inputs = processor(text=text, return_tensors="pt").to(DEVICE)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="The current Balochi TTS model expects Latin-script Balochi (including á, é and ó).",
        ) from exc

    # SpeechT5 quality is best on short Balochi segments. Break longer text
    # into small chunks and join them with brief silence.
    chunks: list[str] = []
    remaining = text
    while len(remaining) > 100:
        split_at = max(
            remaining.rfind(". ", 0, 100),
            remaining.rfind("? ", 0, 100),
            remaining.rfind("! ", 0, 100),
            remaining.rfind(", ", 0, 100),
            remaining.rfind(" ", 0, 100),
        )
        if split_at < 35:
            split_at = 100
        chunks.append(remaining[:split_at].strip())
        remaining = remaining[split_at:].strip()

    if remaining:
        chunks.append(remaining)

    audio_chunks: list[np.ndarray] = []
    silence = np.zeros(int(16000 * 0.18), dtype=np.float32)

    with _tts_lock, torch.inference_mode():
        for index, chunk in enumerate(chunks):
            chunk_inputs = processor(text=chunk, return_tensors="pt").to(DEVICE)
            chunk_speech = model.generate_speech(
                chunk_inputs["input_ids"],
                speaker,
                vocoder=vocoder,
                threshold=0.62,
                minlenratio=0.10,
                maxlenratio=6.0,
            )
            audio_chunks.append(chunk_speech.detach().cpu().numpy())
            if index < len(chunks) - 1:
                audio_chunks.append(silence)

    speech = np.concatenate(audio_chunks)

    buffer = io.BytesIO()
    sf.write(buffer, speech, 16000, format="WAV")
    return Response(
        buffer.getvalue(),
        media_type="audio/wav",
        headers={"Cache-Control": "no-store", "X-Zuban-Model": TTS_MODEL},
    )


@app.post("/ocr")
async def ocr(file: UploadFile = File(...), model: str | None = Form(default=None)):
    del model
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Image is empty.")

    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unsupported image file.") from exc

    text = pytesseract.image_to_string(image, lang=OCR_LANGS).strip()
    if not text:
        raise HTTPException(status_code=422, detail="No text was detected.")

    return {
        "text": text,
        "engine": "Tesseract",
        "languages": OCR_LANGS,
        "note": "This is an Urdu/Persian/Arabic-script fallback until a Balochi-specific OCR model is trained.",
    }
