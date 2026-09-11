import { NextResponse } from "next/server";
import { textProviderStatus } from "@/lib/text-provider";

async function modelServerHealth() {
  const base = process.env.ZUBAN_MODEL_SERVER_URL?.replace(/\/$/, "");
  if (!base) return { configured: false, reachable: false };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(base + "/health", {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timer);

    return {
      configured: true,
      reachable: response.ok,
    };
  } catch {
    return {
      configured: true,
      reachable: false,
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

      modelServerConfigured: modelServer.configured,
      modelServerReachable: modelServer.reachable,

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
