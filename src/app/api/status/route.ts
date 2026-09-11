import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      text: Boolean(process.env.ZUBAN_TEXT_API_URL && process.env.ZUBAN_TEXT_MODEL),
      speechToText: Boolean(process.env.ZUBAN_STT_API_URL),
      textToSpeech: Boolean(process.env.ZUBAN_TTS_API_URL),
      ocr: Boolean(process.env.ZUBAN_OCR_API_URL),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
