import type { Metadata } from "next";
import { ZubanDocsEditor } from "@/components/zuban-docs-editor";

export const metadata: Metadata = {
  title: "Editor — Zuban DocX",
  description: "Balochi-first word processor with real DOCX files, Arabic and Roman keyboards, tables, images, page tools and local drafts.",
  manifest: "/docx.webmanifest",
  applicationName: "Zuban DocX",
  appleWebApp: {
    capable: true,
    title: "Zuban DocX",
    statusBarStyle: "default",
  },
};

export default function ZubanDocsEditorPage() {
  return <ZubanDocsEditor />;
}
