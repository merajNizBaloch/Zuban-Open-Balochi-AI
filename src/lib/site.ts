export const tools = [
  { href: "/chat", index: "01", title: "Chat", description: "Write and ask in Balochi.", status: "Alpha" },
  { href: "/translate", index: "02", title: "Translate", description: "Balochi with English, Urdu and Persian.", status: "Alpha" },
  { href: "/dictionary", index: "03", title: "Dictionary", description: "Search sourced words, spellings and meanings.", status: "Live" },
  { href: "/language", index: "04", title: "Script Lab", description: "Normalize text and convert Arabic ↔ Latin Balochi.", status: "Beta" },
  { href: "/speech", index: "05", title: "Speech + Voice", description: "Turn Balochi speech into text and text into voice.", status: "Lab" },
  { href: "/ocr", index: "06", title: "OCR", description: "Read printed Balochi from images and pages.", status: "Lab" },
] as const;

export const primaryNav = [
  { href: "/chat", label: "Chat" },
  { href: "/translate", label: "Translate" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/language", label: "Language" },
  { href: "/community", label: "Community" },
  { href: "/research", label: "Research" },
] as const;

export const githubUrl = "https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI";
