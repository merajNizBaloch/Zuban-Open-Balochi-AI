type TextMode = "chat" | "translate";

type TextRequest = {
  mode: TextMode;
  input: string;
  source?: string;
  target?: string;
};

type CompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>;
};

export async function runTextModel(request: TextRequest) {
  const endpoint = process.env.ZUBAN_TEXT_API_URL;
  const model = process.env.ZUBAN_TEXT_MODEL;
  const apiKey = process.env.ZUBAN_TEXT_API_KEY;

  if (!endpoint || !model) {
    return {
      configured: false,
      output: "",
      message:
        "The open text-model connector is not configured yet. Add ZUBAN_TEXT_API_URL and ZUBAN_TEXT_MODEL to connect a compatible open/self-hosted model.",
    };
  }

  const system =
    request.mode === "translate"
      ? `You are Zubán Translate, an experimental assistant for Balochi language technology. Translate from ${request.source ?? "auto"} to ${request.target ?? "Balochi"}. Preserve meaning. Never invent certainty about dialect-specific forms. When a wording may depend on dialect, say so briefly.`
      : "You are Zubán, an experimental open Balochi language assistant. Be useful and concise. Respect dialect differences, do not present one variety as universally correct, and explicitly acknowledge linguistic uncertainty.";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: request.input },
      ],
      temperature: 0.25,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Model endpoint returned ${response.status}`);
  }

  const data = (await response.json()) as CompletionPayload;
  const output = data.choices?.[0]?.message?.content?.trim();

  if (!output) throw new Error("Model endpoint returned no text.");

  return { configured: true, output, message: "" };
}
