import { NextResponse } from "next/server";
import {
  detectBalochiScript,
  normalizeBalochi,
  transliterateBalochi,
  type TransliterationTarget,
} from "@/lib/balochi-language";

type RequestBody = {
  action?: "normalize" | "transliterate" | "detect";
  input?: string;
  target?: TransliterationTarget;
};

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const input = body.input?.trim() ?? "";
  if (!input) {
    return NextResponse.json({ error: "Input is required." }, { status: 400 });
  }

  if (input.length > 12000) {
    return NextResponse.json({ error: "Input is too long." }, { status: 400 });
  }

  if (body.action === "detect") {
    return NextResponse.json({
      script: detectBalochiScript(input),
    });
  }

  if (body.action === "normalize") {
    const normalized = normalizeBalochi(input);
    return NextResponse.json({
      input,
      output: normalized,
      script: detectBalochiScript(input),
      changed: normalized !== input,
    });
  }

  if (body.action === "transliterate") {
    if (body.target !== "arabic" && body.target !== "latin") {
      return NextResponse.json({ error: "A valid target script is required." }, { status: 400 });
    }

    return NextResponse.json(transliterateBalochi(input, body.target));
  }

  return NextResponse.json({ error: "Unknown language action." }, { status: 400 });
}
