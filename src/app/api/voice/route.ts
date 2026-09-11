import { NextResponse } from "next/server";

const allowedSpeakers = new Set(["ayn_kader", "doda", "doden"]);

function ttsEndpoint() {
  if (process.env.ZUBAN_TTS_API_URL) return process.env.ZUBAN_TTS_API_URL;
  const base = process.env.ZUBAN_MODEL_SERVER_URL?.replace(/\/$/, "");
  return base ? base + "/tts" : undefined;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string; speaker?: string };

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  if (body.text.length > 600) {
    return NextResponse.json(
      { error: "The current Balochi TTS model is intended for short text. Keep input below 600 characters." },
      { status: 400 },
    );
  }

  const endpoint = ttsEndpoint();
  const key = process.env.ZUBAN_TTS_API_KEY;
  const model = process.env.ZUBAN_TTS_MODEL || "Aynkader/Balochi-TTS-Three-Speakers";
  const speaker = allowedSpeakers.has(body.speaker ?? "") ? body.speaker : "ayn_kader";

  if (!endpoint) {
    return NextResponse.json(
      {
        message:
          "Balochi voice needs the model server. Deploy services/balochi-model-server and set ZUBAN_MODEL_SERVER_URL.",
      },
      { status: 503 },
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: "Bearer " + key } : {}),
    },
    body: JSON.stringify({
      text: body.text.trim(),
      model,
      speaker,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return NextResponse.json(
      { error: "Balochi TTS returned " + response.status + (detail ? ": " + detail.slice(0, 180) : "") },
      { status: 502 },
    );
  }

  const contentType = response.headers.get("content-type") ?? "audio/wav";
  if (!contentType.startsWith("audio/")) {
    return NextResponse.json({ error: "The configured TTS endpoint did not return audio." }, { status: 502 });
  }

  return new Response(await response.arrayBuffer(), {
    status: 200,
    headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
  });
}
