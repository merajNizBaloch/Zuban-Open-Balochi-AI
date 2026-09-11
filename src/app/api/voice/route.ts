import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };
  if (!body.text?.trim()) return NextResponse.json({ error: "Text is required." }, { status: 400 });
  if (body.text.length > 3000) return NextResponse.json({ error: "Text is too long for the alpha voice interface." }, { status: 400 });

  const endpoint = process.env.ZUBAN_TTS_API_URL;
  const key = process.env.ZUBAN_TTS_API_KEY;
  const model = process.env.ZUBAN_TTS_MODEL;

  if (!endpoint) {
    return NextResponse.json(
      { message: "The open TTS adapter is not configured yet. Add ZUBAN_TTS_API_URL to connect a Balochi speech model." },
      { status: 503 },
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: "Bearer " + key } : {}),
    },
    body: JSON.stringify({ text: body.text.trim(), model }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Configured TTS endpoint returned " + response.status + "." }, { status: 502 });
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
