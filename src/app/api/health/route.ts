import { NextResponse } from "next/server";
import { textProviderStatus } from "@/lib/text-provider";

async function sharedModelServer() {
  const base = (
    process.env.ZUBAN_MODEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_ZUBAN_MODEL_SERVER_URL
  )?.replace(/\/$/, "");
  if (!base) return { configured: false, reachable: false };

  try {
    const response = await fetch(base + "/health", {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });

    return { configured: true, reachable: response.ok };
  } catch {
    return { configured: true, reachable: false };
  }
}

export async function GET() {
  const text = textProviderStatus();
  const media = await sharedModelServer();

  const degraded = media.configured && !media.reachable;

  return NextResponse.json(
    {
      ok: true,
      degraded,
      web: true,
      text: {
        modelConnected: text.configured,
        provider: text.provider,
        model: text.model,
        dictionaryFallback: text.dictionaryFallback,
        browserFallback: false,
        freeLexiconFallback: true,
      },
      modelServer: media,
      ocr: {
        browserFallback: true,
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
