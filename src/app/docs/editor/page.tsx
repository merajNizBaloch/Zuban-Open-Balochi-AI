import type { Metadata } from "next";
import { ZubanDocsEditor } from "@/components/zuban-docs-editor";

export const metadata: Metadata = {
  title: "Editor — Zuban Docs",
  description: "Create and edit Balochi documents in Zuban Docs.",
};

export default function ZubanDocsEditorPage() {
  return <ZubanDocsEditor />;
}
