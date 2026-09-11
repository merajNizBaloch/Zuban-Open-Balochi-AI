import { NextResponse } from "next/server";
import { runTextModel } from "@/lib/text-provider";

type RequestBody = { mode?: "chat" | "translate"; input?: string; source?: string; target?: string };

export async function POST(request: Request) {
  let body: RequestBody;
  try { body = (await request.json()) as RequestBody; }
  catch { return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 }); }

  if ((body.mode !== "chat" && body.mode !== "translate") || !body.input?.trim()) {
    return NextResponse.json({ error: "A valid mode and non-empty input are required." }, { status: 400 });
  }
  if (body.input.length > 12000) return NextResponse.json({ error: "Input is too long for the alpha interface." }, { status: 400 });

  try {
    const result = await runTextModel({ mode: body.mode, input: body.input.trim(), source: body.source, target: body.target });
    return NextResponse.json(result, { status: result.configured ? 200 : 503 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown model error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
