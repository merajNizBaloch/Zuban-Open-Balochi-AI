import type { Metadata } from "next";
import { ZubanDocsEditor } from "@/components/zuban-docs-editor";

export const metadata: Metadata = {
  title: "Editor — Zuban DocX",
  description: "Balochi-first word processor with real DOCX files, Arabic and Roman keyboards, tables, images, page tools and local drafts.",
};

export default function ZubanDocsEditorPage() {
  return <ZubanDocsEditor />;
}
