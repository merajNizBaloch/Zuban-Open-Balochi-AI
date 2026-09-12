export const runtime = "edge";

export async function POST() {
  return new Response("ZUBAN_CHAT_EDGE_OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
