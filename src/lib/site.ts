export const tools = [
  { href: "/chat", index: "01", title: "Chat", description: "Write and ask in Balochi.", status: "Alpha" },
  { href: "/translate", index: "02", title: "Translate", description: "Translate between English and Balochi.", status: "Alpha" },
  { href: "/dictionary", index: "03", title: "Dictionary", description: "Search sourced words, spellings and meanings.", status: "Live" },
  { href: "/language", index: "04", title: "Script Converter", description: "Switch Balochi between Arabic and Latin writing.", status: "Beta" },
  { href: "/speech", index: "05", title: "Listen & Speak", description: "Turn Balochi speech into text or read text aloud.", status: "Lab" },
  { href: "/ocr", index: "06", title: "Read from Image", description: "Pull Balochi text from a clear photo or scanned page.", status: "Lab" },
  { href: "/docs", index: "07", title: "Zuban DocX", description: "Create, format and save Balochi documents.", status: "New" },
] as const;

export const primaryNav = [
  { href: "/chat", label: "Chat" },
  { href: "/translate", label: "Translate" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/language", label: "Language" },
  { href: "/docs", label: "DocX" },
  { href: "/community", label: "Community" },
  { href: "/research", label: "Research" },
] as const;

export const githubUrl = "https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI";
