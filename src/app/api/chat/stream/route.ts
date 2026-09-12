import {
  streamChatModel,
  type ConversationMessage,
  type DialectPreference,
  type ScriptPreference,
} from "@/lib/text-provider";

export const runtime = "nodejs";

type RequestBody = {
  input?: string;
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
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const input = body.input?.trim();

  if (!input) {
    return Response.json(
      { error: "A non-empty input is required." },
      { status: 400 },
    );
  }

  if (input.length > 12000) {
    return Response.json({ error: "Input is too long." }, { status: 400 });
  }

  if (body.messages !== undefined && !validMessages(body.messages)) {
    return Response.json(
      { error: "Invalid conversation history." },
      { status: 400 },
    );
  }

  try {
    const response = await streamChatModel({
      mode: "chat",
      input,
      messages: body.messages,
      dialect: body.dialect,
      scriptPreference: body.scriptPreference,
    });

    if (!response) {
      return Response.json(
        { message: "Zubán AI is not configured on this deployment." },
        { status: 503 },
      );
    }

    return response;
  } catch (error) {
    return Response.json(
      {
        message: "Zubán AI is temporarily unavailable.",
        detail:
          error instanceof Error ? error.message : "Unknown server error.",
      },
      { status: 503 },
    );
  }
}
