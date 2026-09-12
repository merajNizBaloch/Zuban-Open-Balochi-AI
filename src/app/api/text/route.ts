import { NextResponse } from "next/server";
import {
  runTextModel,
  type ConversationMessage,
  type DialectPreference,
  type ScriptPreference,
} from "@/lib/text-provider";

type RequestBody = {
  mode?: "chat" | "translate";
  input?: string;
  source?: string;
  target?: string;
  messages?: ConversationMessage[];
  dialect?: DialectPreference;
  scriptPreference?: ScriptPreference;
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

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  if ((body.mode !== "chat" && body.mode !== "translate") || !body.input?.trim()) {
    return NextResponse.json(
      { error: "A valid mode and non-empty input are required." },
      { status: 400 },
    );
  }

  if (body.input.length > 12000) {
    return NextResponse.json({ error: "Input is too long." }, { status: 400 });
  }

  if (body.messages !== undefined && !validMessages(body.messages)) {
    return NextResponse.json(
      { error: "Invalid conversation history." },
      { status: 400 },
    );
  }

  try {
    const result = await runTextModel({
      mode: body.mode,
      input: body.input.trim(),
      source: body.source,
      target: body.target,
      messages: body.messages,
      dialect: body.dialect,
      scriptPreference: body.scriptPreference,
    });

    return NextResponse.json(result, { status: result.configured ? 200 : 503 });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown model error.";

    return NextResponse.json(
      {
        message:
          "Server AI is temporarily unavailable. Please try again.",
        detail,
      },
      { status: 503 },
    );
  }
}
