export const tools = [
  { href: "/chat", index: "01", title: "Chat", description: "Write and ask in Balochi.", status: "Alpha" },
  { href: "/translate", index: "02", title: "Translate", description: "Balochi with English, Urdu and Persian.", status: "Alpha" },
  { href: "/dictionary", index: "03", title: "Dictionary", description: "Words, meanings, examples and sources.", status: "Building" },
  { href: "/speech", index: "04", title: "Speech + Voice", description: "Turn Balochi speech into text and text into voice.", status: "Lab" },
  { href: "/ocr", index: "05", title: "OCR", description: "Read printed Balochi from images and pages.", status: "Lab" },
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
