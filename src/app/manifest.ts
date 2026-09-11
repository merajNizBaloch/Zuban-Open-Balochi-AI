import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zubán",
    short_name: "Zubán",
    description: "Open Balochi language technology.",
    start_url: "/",
    display: "standalone",
    background_color: "#fefdfd",
    theme_color: "#062e5a",
    icons: [
      {
        src: "/zuban-mark.png",
        type: "image/png",
      },
    ],
  };
}
