import { NextResponse } from "next/server";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  input?: string;
  messages?: ConversationMessage[];
  dialect?: "auto" | "western" | "southern" | "eastern";
  scriptPreference?: "auto" | "arabic" | "latin";
};

type GatewayResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function validMessages(messages: unknown): messages is ConversationMessage[] {
  if (!Array.isArray(messages)) return false;

  return messages.every(
    (message) =>
      message &&
      typeof message === "object" &&
      "role" in message &&
      ((message as ConversationMessage).role === "user" ||
        (message as ConversationMessage).role === "assistant") &&
      "content" in message &&
      typeof (message as ConversationMessage).content === "string" &&
      (message as ConversationMessage).content.length <= 12000,
  );
}

function systemPrompt(body: RequestBody) {
  const dialect = body.dialect ?? "auto";
  const script = body.scriptPreference ?? "auto";

  return [
    "You are Zubán, a concise Balochi language assistant.",
    "Help with Balochi language, writing, translation, language learning, and ordinary everyday questions.",
    "Respect Balochi dialect and orthographic variation. Never present one regional form as universally correct.",
    "If you are uncertain about a Balochi word or grammar point, say so instead of inventing it.",
    dialect === "auto"
      ? "Dialect preference: auto."
      : "Preferred Balochi dialect: " + dialect + ".",
    script === "auto"
      ? "Script preference: follow the user's script when practical."
      : "Preferred Balochi script: " + script + ".",
  ].join("\n");
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const input = body.input?.trim();

  if (!input) {
    return NextResponse.json(
      { error: "A non-empty input is required." },
      { status: 400 },
    );
  }

  if (input.length > 12000) {
    return NextResponse.json({ error: "Input is too long." }, { status: 400 });
  }

  if (body.messages !== undefined && !validMessages(body.messages)) {
    return NextResponse.json(
      { error: "Invalid conversation history." },
      { status: 400 },
    );
  }

  const oidcToken =
    request.headers.get("x-vercel-oidc-token") ||
    process.env.VERCEL_OIDC_TOKEN ||
    "";
  const apiKey = process.env.AI_GATEWAY_API_KEY || oidcToken;

  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "Zubán AI authentication is not available on this deployment.",
      },
      { status: 503 },
    );
  }

  const history =
    body.messages?.slice(-12) ??
    [{ role: "user" as const, content: input }];

  try {
    const response = await fetch(
      "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model:
            process.env.ZUBAN_VERCEL_TEXT_MODEL ||
            "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt(body) },
            ...history,
          ],
          temperature: 0.25,
          max_tokens: 700,
          stream: false,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );

    const raw = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: "Zubán AI could not answer this request.",
          detail: "AI Gateway returned " + response.status + ": " + raw.slice(0, 300),
        },
        { status: 502 },
      );
    }

    let data: GatewayResponse;

    try {
      data = JSON.parse(raw) as GatewayResponse;
    } catch {
      return NextResponse.json(
        { message: "Zubán AI returned an invalid response." },
        { status: 502 },
      );
    }

    const output = data.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return NextResponse.json(
        { message: "Zubán AI returned an empty response." },
        { status: 502 },
      );
    }

    return new Response(output, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Zubán AI is temporarily unavailable.",
        detail: error instanceof Error ? error.message : "Unknown server error.",
      },
      { status: 503 },
    );
  }
}
