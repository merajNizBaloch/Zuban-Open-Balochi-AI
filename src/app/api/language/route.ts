import { NextResponse } from "next/server";
import {
  detectBalochiScript,
  normalizeBalochi,
  transliterateBalochi,
  type TransliterationTarget,
} from "@/lib/balochi-language";

type RequestBody = {
  action?: "normalize" | "transliterate" | "transliterate-html" | "detect";
  input?: string;
  target?: TransliterationTarget;
};

function transliterateHtml(
  html: string,
  target: TransliterationTarget,
) {
  let dictionaryMatches = 0;
  let ruleBasedSegments = 0;

  const output = html.replace(/<[^>]+>|[^<]+/g, (segment) => {
    if (segment.startsWith("<")) return segment;

    return segment
      .split(/(&[#a-zA-Z0-9]+;)/g)
      .map((part) => {
        if (!part || /^&[#a-zA-Z0-9]+;$/.test(part)) return part;

        const leading = part.match(/^\s*/)?.[0] ?? "";
        const trailing = part.match(/\s*$/)?.[0] ?? "";
        const core = part.slice(
          leading.length,
          Math.max(leading.length, part.length - trailing.length),
        );

        if (!core) return part;

        const result = transliterateBalochi(core, target);
        dictionaryMatches += result.dictionaryMatches;
        ruleBasedSegments += result.ruleBasedSegments;
        return leading + result.output + trailing;
      })
      .join("");
  });

  return {
    output,
    dictionaryMatches,
    ruleBasedSegments,
    warning:
      ruleBasedSegments > 0
        ? "Some unknown words used approximate script conversion."
        : "Document text converted using the Zubán dictionary and script rules.",
  };
}

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

  const maxLength = body.action === "transliterate-html" ? 250000 : 12000;
  if (input.length > maxLength) {
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

  if (body.action === "transliterate-html") {
    if (body.target !== "arabic" && body.target !== "latin") {
      return NextResponse.json({ error: "A valid target script is required." }, { status: 400 });
    }

    return NextResponse.json(transliterateHtml(input, body.target));
  }

  return NextResponse.json({ error: "Unknown language action." }, { status: 400 });
}
