import { NextResponse } from "next/server";

type MediaMode = "stt" | "ocr";

function config(mode: MediaMode) {
  if (mode === "stt") {
    return {
      endpoint: process.env.ZUBAN_STT_API_URL,
      key: process.env.ZUBAN_STT_API_KEY,
      model: process.env.ZUBAN_STT_MODEL,
    };
  }
  return {
    endpoint: process.env.ZUBAN_OCR_API_URL,
    key: process.env.ZUBAN_OCR_API_KEY,
    model: process.env.ZUBAN_OCR_MODEL,
  };
}

export async function POST(request: Request) {
  const incoming = await request.formData();
  const mode = incoming.get("mode");
  const file = incoming.get("file");

  if ((mode !== "stt" && mode !== "ocr") || !(file instanceof File)) {
    return NextResponse.json({ error: "A valid media mode and file are required." }, { status: 400 });
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "The alpha currently limits uploads to 15 MB." }, { status: 400 });
  }

  const { endpoint, key, model } = config(mode);
  if (!endpoint) {
    return NextResponse.json(
      { message: "This open model adapter is not configured yet. Add its endpoint in the Zubán environment settings." },
      { status: 503 },
    );
  }

  const outgoing = new FormData();
  outgoing.set("file", file, file.name);
  if (model) outgoing.set("model", model);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: key ? { Authorization: "Bearer " + key } : undefined,
    body: outgoing,
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Configured model endpoint returned " + response.status + "." }, { status: 502 });
  }

  const data = (await response.json()) as { text?: string; output?: string };
  const text = data.text ?? data.output;
  if (!text) return NextResponse.json({ error: "The configured endpoint returned no text." }, { status: 502 });

  return NextResponse.json({ text });
}
