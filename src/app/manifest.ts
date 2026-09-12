import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zuban DocX",
    short_name: "DocX",
    description:
      "A Balochi-first word processor with Arabic and Roman keyboards, local documents, Word files and offline writing.",
    start_url: "/docs/editor",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7f7",
    theme_color: "#062e5a",
    orientation: "any",
    categories: ["productivity", "education", "utilities"],
    icons: [
      {
        src: "/docx-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
