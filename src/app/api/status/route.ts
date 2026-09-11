import { NextResponse } from "next/server";
import { textProviderStatus } from "@/lib/text-provider";

type ModelServerHealth = {
  status?: string;
  device?: string;
  models?: {
    stt_loaded?: boolean;
    tts_loaded?: boolean;
  };
};

async function modelServerHealth() {
  const base = (
    process.env.ZUBAN_MODEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_ZUBAN_MODEL_SERVER_URL
  )?.replace(/\/$/, "");

  if (!base) {
    return {
      configured: false,
      reachable: false,
      device: null,
      sttLoaded: false,
      ttsLoaded: false,
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(base + "/health", {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      return {
        configured: true,
        reachable: false,
        device: null,
        sttLoaded: false,
        ttsLoaded: false,
      };
    }

    const data = (await response.json()) as ModelServerHealth;

    return {
      configured: true,
      reachable: true,
      device: data.device ?? null,
      sttLoaded: Boolean(data.models?.stt_loaded),
      ttsLoaded: Boolean(data.models?.tts_loaded),
    };
  } catch {
    return {
      configured: true,
      reachable: false,
      device: null,
      sttLoaded: false,
      ttsLoaded: false,
    };
  }
}

export async function GET() {
  const text = textProviderStatus();
  const modelServer = await modelServerHealth();

  const sharedServerReady = modelServer.configured && modelServer.reachable;

  return NextResponse.json(
    {
      text: text.configured,
      textProvider: text.provider,
      textModel: text.model,
      dictionaryFallback: text.dictionaryFallback,
      browserTextFallback: true,

      modelServerConfigured: modelServer.configured,
      modelServerReachable: modelServer.reachable,
      modelServerDevice: modelServer.device,
      sttModelLoaded: modelServer.sttLoaded,
      ttsModelLoaded: modelServer.ttsLoaded,

      speechToText: Boolean(process.env.ZUBAN_STT_API_URL) || sharedServerReady,
      textToSpeech: Boolean(process.env.ZUBAN_TTS_API_URL) || sharedServerReady,

      ocr: true,
      ocrProvider:
        process.env.ZUBAN_OCR_API_URL || sharedServerReady
          ? "model endpoint"
          : "browser OCR",
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
