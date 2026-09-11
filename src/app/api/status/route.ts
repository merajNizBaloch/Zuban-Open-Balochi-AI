import { NextResponse } from "next/server";
import { textProviderStatus } from "@/lib/text-provider";

export async function GET() {
  const text = textProviderStatus();

  return NextResponse.json(
    {
      text: text.configured,
      textProvider: text.provider,
      textModel: text.model,
      speechToText: Boolean(process.env.ZUBAN_STT_API_URL),
      textToSpeech: Boolean(process.env.ZUBAN_TTS_API_URL),
      ocr: true,
      ocrProvider: process.env.ZUBAN_OCR_API_URL ? "model endpoint" : "browser OCR",
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
