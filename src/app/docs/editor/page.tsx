import type { Metadata } from "next";
import { ZubanDocsEditor } from "@/components/zuban-docs-editor";

export const metadata: Metadata = {
  title: "Editor — Zuban DocX",
  description: "Create and edit Balochi documents in Zuban DocX.",
};

export default function ZubanDocsEditorPage() {
  return <ZubanDocsEditor />;
}
