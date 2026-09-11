import { NextResponse } from "next/server";
import { textProviderStatus } from "@/lib/text-provider";

async function sharedModelServer() {
  const base = process.env.ZUBAN_MODEL_SERVER_URL?.replace(/\/$/, "");
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

  const healthy =
    Boolean(text.configured || text.dictionaryFallback) &&
    (media.reachable || true);

  return NextResponse.json(
    {
      ok: healthy,
      web: true,
      text: {
        modelConnected: text.configured,
        provider: text.provider,
        model: text.model,
        dictionaryFallback: text.dictionaryFallback,
      },
      modelServer: media,
      ocr: {
        browserFallback: true,
      },
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
