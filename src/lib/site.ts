export const tools = [
  { href: "/chat", index: "01", title: "Chat", description: "Ask, write and explore in Balochi with an open model adapter.", status: "Alpha" },
  { href: "/translate", index: "02", title: "Translate", description: "Balochi with English, Urdu and Persian in a dialect-aware workspace.", status: "Alpha" },
  { href: "/dictionary", index: "03", title: "Dictionary", description: "A source-aware lexicon designed for community review.", status: "Building" },
  { href: "/speech", index: "04", title: "Speech + Voice", description: "Speech recognition, text-to-speech and future voice contribution.", status: "Lab" },
  { href: "/ocr", index: "05", title: "OCR", description: "Turn printed Balochi pages and images into editable text.", status: "Lab" },
] as const;

export const primaryNav = [
  { href: "/chat", label: "Chat" },
  { href: "/translate", label: "Translate" },
  { href: "/research", label: "Research" },
  { href: "/datasets", label: "Datasets" },
  { href: "/technology", label: "Technology" },
  { href: "/contribute", label: "Contribute" },
] as const;

export const githubUrl = "https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI";
