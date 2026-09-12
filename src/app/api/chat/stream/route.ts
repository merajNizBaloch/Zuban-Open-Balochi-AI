import { NextResponse } from "next/server";
import {
  runTextModel,
  streamChatModel,
  type ConversationMessage,
  type DialectPreference,
  type ScriptPreference,
} from "@/lib/text-provider";

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

function validDialect(value: unknown): value is DialectPreference {
  return value === undefined ||
    value === "auto" ||
    value === "western" ||
    value === "southern" ||
    value === "eastern";
}

function validScript(value: unknown): value is ScriptPreference {
  return value === undefined ||
    value === "auto" ||
    value === "arabic" ||
    value === "latin";
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  if (!body.input?.trim()) {
    return NextResponse.json({ error: "A non-empty input is required." }, { status: 400 });
  }

  if (body.input.length > 12000) {
    return NextResponse.json({ error: "Input is too long." }, { status: 400 });
  }

  if (body.messages !== undefined && !validMessages(body.messages)) {
    return NextResponse.json({ error: "Invalid conversation history." }, { status: 400 });
  }

  if (!validDialect(body.dialect) || !validScript(body.scriptPreference)) {
    return NextResponse.json({ error: "Invalid Balochi preference." }, { status: 400 });
  }

  const modelRequest = {
    mode: "chat" as const,
    input: body.input.trim(),
    messages: body.messages,
    dialect: body.dialect ?? "auto",
    scriptPreference: body.scriptPreference ?? "auto",
  };

  try {
    const upstream = await streamChatModel(modelRequest);

    if (!upstream) {
      const fallback = await runTextModel(modelRequest);

      if (!fallback.configured || !fallback.output) {
        return NextResponse.json(
          { message: fallback.message || "No text model is connected." },
          { status: 503 },
        );
      }

      return new Response(fallback.output, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Zuban-Provider": "dictionary",
        },
      });
    }

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return NextResponse.json(
        {
          error:
            "Text model returned " +
            upstream.status +
            (detail ? ": " + detail.slice(0, 180) : ""),
        },
        { status: 502 },
      );
    }

    if (upstream.headers.get("X-Zuban-Stream-Format") === "plain") {
      return upstream;
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();

          if (done) {
            if (buffer.trim()) processLine(buffer, controller, encoder);
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            processLine(line, controller, encoder);
          }
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        void reader.cancel();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
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

function processLine(
  rawLine: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
) {
  const line = rawLine.trim();

  if (!line.startsWith("data:")) return;

  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return;

  try {
    const parsed = JSON.parse(data) as {
      choices?: Array<{
        delta?: { content?: string };
        message?: { content?: string };
      }>;
    };

    const text =
      parsed.choices?.[0]?.delta?.content ??
      parsed.choices?.[0]?.message?.content ??
      "";

    if (text) controller.enqueue(encoder.encode(text));
  } catch {
    // Ignore provider keep-alive or non-JSON SSE lines.
  }
}
