"use client";

import Link from "next/link";
import { ZubanLogo } from "@/components/zuban-logo";
import {
  getDocxStorageEstimate,
  loadDocxLibrary,
  migrateDocxFromLocalStorage,
  saveDocxLibrary,
} from "@/lib/docx-storage";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ScriptMode = "arabic" | "latin";
type TemplateId =
  | "blank"
  | "essay"
  | "letter"
  | "story"
  | "notes"
  | "poem"
  | "cv"
  | "application"
  | "official-letter"
  | "research"
  | "assignment";
type LibraryView = "all" | "recent" | "favorites";
type KeyboardLayout = "phonetic" | "traditional";
type CommandId =
  | "new"
  | "find"
  | "outline"
  | "page"
  | "balochi"
  | "image"
  | "table"
  | "link"
  | "page-break"
  | "checkpoint"
  | "focus"
  | "keyboard"
  | "docx"
  | "print";

type Snapshot = {
  id: string;
  createdAt: number;
  html: string;
  source?: "manual" | "auto";
};

type ZubanDocument = {
  id: string;
  title: string;
  html: string;
  script: ScriptMode;
  createdAt: number;
  updatedAt: number;
  snapshots: Snapshot[];
  template?: TemplateId;
  fontFamily?: string;
  favorite?: boolean;
  pageSize?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  marginMm?: number;
  headerText?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  showDate?: boolean;
  paragraphSpacing?: number;
};

type Template = {
  id: TemplateId;
  label: string;
  description: string;
  arabicTitle: string;
  latinTitle: string;
  arabicHtml: string;
  latinHtml: string;
};

const STORAGE_KEY = "zuban-docs-v1";
const ACTIVE_KEY = "zuban-docs-active-v1";

const arabicCharacters = [
  "ا", "آ", "ء", "ب", "پ", "ت", "ٹ", "ج", "چ", "د", "ڈ", "ر", "ڑ",
  "ز", "ژ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک",
  "گ", "ل", "م", "ن", "ں", "و", "ؤ", "ہ", "ھ", "ی", "ے", "،", "؟",
];

const latinCharacters = [
  "ā", "ē", "ī", "ō", "ū", "š", "ž", "ṭ", "ḍ", "ṛ", "ŋ", "č", "ǰ", "’",
];

type KeyboardKey = {
  key: string;
  label?: string;
  shifted?: string;
};

const qwertyRows: KeyboardKey[][] = [
  [
    { key: "q" }, { key: "w" }, { key: "e" }, { key: "r" }, { key: "t" },
    { key: "y" }, { key: "u" }, { key: "i" }, { key: "o" }, { key: "p" },
  ],
  [
    { key: "a" }, { key: "s" }, { key: "d" }, { key: "f" }, { key: "g" },
    { key: "h" }, { key: "j" }, { key: "k" }, { key: "l" },
  ],
  [
    { key: "z" }, { key: "x" }, { key: "c" }, { key: "v" }, { key: "b" },
    { key: "n" }, { key: "m" },
  ],
];

const arabicPhysicalMap: Record<string, string> = {
  a: "ا", b: "ب", c: "چ", d: "د", e: "ے", f: "ف", g: "گ", h: "ہ",
  i: "ی", j: "ج", k: "ک", l: "ل", m: "م", n: "ن", o: "و", p: "پ",
  q: "ق", r: "ر", s: "س", t: "ت", u: "ؤ", v: "و", w: "و", x: "خ",
  y: "ی", z: "ز",
};

const arabicShiftMap: Record<string, string> = {
  a: "آ", d: "ڈ", h: "ھ", n: "ں", r: "ڑ", s: "ش", t: "ٹ", z: "ژ",
};


const traditionalArabicMap: Record<string, string> = {
  q: "ق", w: "و", e: "ع", r: "ر", t: "ت", y: "ے", u: "ء", i: "ی", o: "ہ", p: "پ",
  a: "ا", s: "س", d: "د", f: "ف", g: "گ", h: "ھ", j: "ج", k: "ک", l: "ل",
  z: "ز", x: "ش", c: "چ", v: "ط", b: "ب", n: "ن", m: "م",
};

const traditionalArabicShiftMap: Record<string, string> = {
  a: "آ", d: "ڈ", r: "ڑ", s: "ص", t: "ٹ", x: "ژ", y: "ۏ", n: "ں",
};

const arabicFonts = [
  ["Zuban Default", "\"Noto Naskh Arabic\", \"Noto Sans Arabic\", serif"],
  ["Noto Naskh Arabic", "\"Noto Naskh Arabic\", serif"],
  ["Noto Sans Arabic", "\"Noto Sans Arabic\", sans-serif"],
  ["Noto Nastaliq Urdu", "\"Noto Nastaliq Urdu\", serif"],
  ["Scheherazade New", "\"Scheherazade New\", serif"],
  ["Amiri", "Amiri, serif"],
  ["Lateef", "Lateef, serif"],
  ["Jameel Noori Nastaleeq", "\"Jameel Noori Nastaleeq\", \"Noto Nastaliq Urdu\", serif"],
  ["Tahoma", "Tahoma, sans-serif"],
  ["Arial", "Arial, sans-serif"],
] as const;

const latinFonts = [
  ["Zuban Roman", "\"Noto Sans\", Arial, sans-serif"],
  ["Noto Sans", "\"Noto Sans\", sans-serif"],
  ["Noto Serif", "\"Noto Serif\", serif"],
  ["Georgia", "Georgia, serif"],
  ["Times New Roman", "\"Times New Roman\", serif"],
  ["Arial", "Arial, sans-serif"],
  ["Verdana", "Verdana, sans-serif"],
  ["Tahoma", "Tahoma, sans-serif"],
] as const;


const commandCatalog: Array<{
  id: CommandId;
  label: string;
  hint: string;
  icon: string;
}> = [
  { id: "new", label: "New document", hint: "Create a new Balochi document", icon: "＋" },
  { id: "find", label: "Find & Replace", hint: "Search inside this document", icon: "⌕" },
  { id: "outline", label: "Document outline", hint: "Jump between headings", icon: "☷" },
  { id: "page", label: "Page setup", hint: "Size, margins, header and footer", icon: "▤" },
  { id: "balochi", label: "Balochi tools", hint: "Meaning, script conversion, spelling", icon: "ب" },
  { id: "image", label: "Insert image", hint: "Add a compressed image", icon: "▧" },
  { id: "table", label: "Insert 3 × 3 table", hint: "Add an editable table", icon: "▦" },
  { id: "link", label: "Insert link", hint: "Link selected text or add a new link", icon: "↗" },
  { id: "page-break", label: "Insert page break", hint: "Start a new printed page", icon: "↵" },
  { id: "checkpoint", label: "Save checkpoint", hint: "Keep a recoverable version", icon: "◷" },
  { id: "focus", label: "Toggle focus mode", hint: "Hide distractions", icon: "◉" },
  { id: "keyboard", label: "Balochi keyboard", hint: "Open the floating keyboard", icon: "⌨" },
  { id: "docx", label: "Export Word DOCX", hint: "Download a Microsoft Word file", icon: "W" },
  { id: "print", label: "Print / Save PDF", hint: "Open the browser print view", icon: "⎙" },
];

function templateIcon(id: TemplateId) {
  const icons: Record<TemplateId, string> = {
    blank: "□",
    essay: "¶",
    letter: "✉",
    story: "◈",
    notes: "≡",
    poem: "❧",
    cv: "CV",
    application: "↗",
    "official-letter": "▤",
    research: "⌕",
    assignment: "A",
  };
  return icons[id];
}

const templates: Template[] = [
  {
    id: "blank",
    label: "Blank document",
    description: "A clean page for any kind of Balochi writing.",
    arabicTitle: "نوکیں دستاویز",
    latinTitle: "Nōkēn dastāvēz",
    arabicHtml: "<h1>نوکیں دستاویز</h1><p>اِدا بلوچیءَ بنویس…</p>",
    latinHtml: "<h1>Nōkēn dastāvēz</h1><p>Ēdā Balōčīyā benawīs…</p>",
  },
  {
    id: "essay",
    label: "Essay",
    description: "Structured title, introduction, body and conclusion.",
    arabicTitle: "بلوچی مضمون",
    latinTitle: "Balōčī mazmūn",
    arabicHtml:
      "<h1>مضمون ءِ سرلیک</h1><p><strong>پیشگفت:</strong> اِدا موضوع ءِ باروا مختصر پیشگفت بنویس.</p><h2>بنیادی گپ</h2><p>دلیل، مثال و تفصیل اِدا بنویس.</p><h2>نتیجہ</h2><p>مضمون ءِ بنیادی نتیجہ اِدا بنویس.</p>",
    latinHtml:
      "<h1>Mazmūnē sarēlik</h1><p><strong>Pēšgoft:</strong> Ēdā mawzūē bārwā moxtasar pēšgoft benawīs.</p><h2>Bonyādī gap</h2><p>Dalīl, misāl o tafsīl ēdā benawīs.</p><h2>Natīja</h2><p>Mazmūnē bonyādī natīja ēdā benawīs.</p>",
  },
  {
    id: "letter",
    label: "Letter",
    description: "A clean Balochi personal or formal letter layout.",
    arabicTitle: "بلوچی خط",
    latinTitle: "Balōčī xat",
    arabicHtml:
      "<p>تاریخ: __________</p><p>گرامی __________،</p><p>سلامت باتے.</p><p>اِدا وتی خط ءِ متن بنویس.</p><p>منت واراں،</p><p>__________</p>",
    latinHtml:
      "<p>Tārīx: __________</p><p>Grāmī __________,</p><p>Salāmat bātē.</p><p>Ēdā watī xatē matn benawīs.</p><p>Mennat wārān,</p><p>__________</p>",
  },
  {
    id: "story",
    label: "Story",
    description: "A distraction-free structure for Balochi storytelling.",
    arabicTitle: "بلوچی قصہ",
    latinTitle: "Balōčī qissa",
    arabicHtml:
      "<h1>قصہ ءِ نام</h1><p><em>جاگہ · زمانگ · کردار</em></p><p>یک روچے…</p><h2>قصہ ءِ میان</h2><p>اِدا قصہ پیش ببر.</p><h2>انجام</h2><p>قصہ ءِ انجام اِدا بنویس.</p>",
    latinHtml:
      "<h1>Qissay nām</h1><p><em>Jāgah · zamānag · kirdār</em></p><p>Yak rōčē…</p><h2>Qissay mayān</h2><p>Ēdā qissa pēš bebar.</p><h2>Anjām</h2><p>Qissay anjām ēdā benawīs.</p>",
  },
  {
    id: "notes",
    label: "Notes",
    description: "Fast headings and bullet points for classes or research.",
    arabicTitle: "بلوچی نوٹ",
    latinTitle: "Balōčī nōt",
    arabicHtml:
      "<h1>نوٹ ءِ سرلیک</h1><h2>بنیادی نکات</h2><ul><li>اولی نکتہ</li><li>دومی نکتہ</li><li>سومی نکتہ</li></ul><h2>یادداشت</h2><p>اِدا گیشتر تفصیل بنویس.</p>",
    latinHtml:
      "<h1>Nōtē sarēlik</h1><h2>Bonyādī nokāt</h2><ul><li>Awwalī nokta</li><li>Dōmī nokta</li><li>Sōmī nokta</li></ul><h2>Yāddāšt</h2><p>Ēdā gēštir tafsīl benawīs.</p>",
  },
  {
    id: "poem",
    label: "Poem",
    description: "Minimal spacing for verse, poetry and lyrics.",
    arabicTitle: "بلوچی شاعری",
    latinTitle: "Balōčī šāhirī",
    arabicHtml:
      "<h1>شعر ءِ نام</h1><p>اولی مصرع<br>دومی مصرع</p><p>سومی مصرع<br>چارمی مصرع</p>",
    latinHtml:
      "<h1>Šihrē nām</h1><p>Awwalī misra<br>Dōmī misra</p><p>Sōmī misra<br>Čāromī misra</p>",
  },
  {
    id: "cv",
    label: "CV / Resume",
    description: "Name, profile, education, experience and skills.",
    arabicTitle: "سوانحی دستاویز",
    latinTitle: "CV / Resume",
    arabicHtml:
      "<h1>نام</h1><p><strong>رابطہ:</strong> فون · ایمیل · شہر</p><h2>مختصر پروفائل</h2><p>وتی باروا مختصر تعارف بنویس.</p><h2>تعلیم</h2><ul><li>ڈگری · ادارہ · سال</li></ul><h2>تجربہ</h2><ul><li>عہدہ · ادارہ · مدت</li></ul><h2>مہارت</h2><p>مہارت 1 · مہارت 2 · مہارت 3</p>",
    latinHtml:
      "<h1>Name</h1><p><strong>Contact:</strong> phone · email · city</p><h2>Profile</h2><p>Write a short profile.</p><h2>Education</h2><ul><li>Degree · institution · year</li></ul><h2>Experience</h2><ul><li>Role · organization · period</li></ul><h2>Skills</h2><p>Skill 1 · Skill 2 · Skill 3</p>",
  },
  {
    id: "application",
    label: "Application",
    description: "A clean application format for school, office or department.",
    arabicTitle: "درخواست",
    latinTitle: "Darkhwāst",
    arabicHtml:
      "<p>تاریخ: __________</p><p>بنام: __________</p><p><strong>موضوع:</strong> __________</p><p>محترم/محترمہ،</p><p>اِدا وتی درخواست ءِ متن بنویس.</p><p>منّت واراں،</p><p>نام: __________</p><p>رابطہ: __________</p>",
    latinHtml:
      "<p>Date: __________</p><p>To: __________</p><p><strong>Subject:</strong> __________</p><p>Dear Sir/Madam,</p><p>Write your application here.</p><p>Regards,</p><p>Name: __________</p><p>Contact: __________</p>",
  },
  {
    id: "official-letter",
    label: "Official letter",
    description: "Formal office correspondence with reference and subject.",
    arabicTitle: "سرکاری خط",
    latinTitle: "Official Letter",
    arabicHtml:
      "<p>نمبر: __________</p><p>تاریخ: __________</p><p>بنام: __________</p><h2>موضوع: __________</h2><p>اِدا رسمی خط ءِ متن بنویس.</p><p>مخلص،</p><p>نام · عہدہ · ادارہ</p>",
    latinHtml:
      "<p>Ref: __________</p><p>Date: __________</p><p>To: __________</p><h2>Subject: __________</h2><p>Write the official letter here.</p><p>Sincerely,</p><p>Name · designation · organization</p>",
  },
  {
    id: "research",
    label: "Research notes",
    description: "Question, sources, findings and references in one place.",
    arabicTitle: "تحقیقی نوٹ",
    latinTitle: "Research Notes",
    arabicHtml:
      "<h1>تحقیق ءِ عنوان</h1><h2>سوال</h2><p>بنیادی تحقیقی سوال بنویس.</p><h2>سرچشمگ</h2><ul><li>سرچشمگ 1</li></ul><h2>یافتگ</h2><p>اہم یافتگ اِدا بنویس.</p><h2>حوالہ</h2><p>حوالہ جات اِدا بنویس.</p>",
    latinHtml:
      "<h1>Research title</h1><h2>Question</h2><p>Write the main research question.</p><h2>Sources</h2><ul><li>Source 1</li></ul><h2>Findings</h2><p>Write key findings here.</p><h2>References</h2><p>Add references here.</p>",
  },
  {
    id: "assignment",
    label: "School assignment",
    description: "Student name, class, subject and structured answer.",
    arabicTitle: "اسائنمنٹ",
    latinTitle: "School Assignment",
    arabicHtml:
      "<h1>اسائنمنٹ ءِ عنوان</h1><p><strong>طالب علم:</strong> __________</p><p><strong>کلاس:</strong> __________ · <strong>مضمون:</strong> __________</p><h2>تعارف</h2><p>اِدا بنویس.</p><h2>بنیادی جواب</h2><p>اِدا تفصیلی جواب بنویس.</p><h2>نتیجہ</h2><p>نتیجہ اِدا بنویس.</p>",
    latinHtml:
      "<h1>Assignment title</h1><p><strong>Student:</strong> __________</p><p><strong>Class:</strong> __________ · <strong>Subject:</strong> __________</p><h2>Introduction</h2><p>Write here.</p><h2>Main answer</h2><p>Write the detailed answer here.</p><h2>Conclusion</h2><p>Write the conclusion here.</p>",
  },
];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getTemplate(id: TemplateId) {
  return templates.find((template) => template.id === id) ?? templates[0];
}

function makeDocument(
  script: ScriptMode = "arabic",
  templateId: TemplateId = "blank",
): ZubanDocument {
  const now = Date.now();
  const template = getTemplate(templateId);

  return {
    id: makeId(),
    title: script === "arabic" ? template.arabicTitle : template.latinTitle,
    html: script === "arabic" ? template.arabicHtml : template.latinHtml,
    script,
    createdAt: now,
    updatedAt: now,
    snapshots: [],
    template: templateId,
    favorite: false,
    pageSize: "a4",
    orientation: "portrait",
    marginMm: 20,
    headerText: "",
    footerText: "",
    showPageNumbers: false,
    showDate: false,
    paragraphSpacing: 18,
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}


function documentOutline(html: string) {
  const items: Array<{ level: number; text: string; index: number }> = [];
  const pattern = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(html))) {
    const text = stripHtml(match[2]);
    if (text) {
      items.push({
        level: Number(match[1]),
        text,
        index,
      });
    }
    index += 1;
  }

  return items;
}

function sanitizeImportedHtml(value: string) {
  if (typeof window === "undefined") return value;

  const parser = new DOMParser();
  const parsed = parser.parseFromString(value, "text/html");
  parsed
    .querySelectorAll("script,iframe,object,embed,meta,link,style")
    .forEach((node) => node.remove());

  parsed.querySelectorAll("*").forEach((node) => {
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLocaleLowerCase();
      const raw = attr.value.trim();

      if (name.startsWith("on")) {
        node.removeAttribute(attr.name);
        continue;
      }

      if (
        (name === "href" || name === "src") &&
        /^javascript:/i.test(raw)
      ) {
        node.removeAttribute(attr.name);
      }
    }
  });

  return parsed.body.innerHTML;
}

function scriptAllowed(value: string, script: ScriptMode) {
  if (!value) return true;

  if (script === "arabic") {
    return !/[A-Za-zÀ-ž]/u.test(value);
  }

  return !/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u.test(value);
}

function sanitizeForScript(value: string, script: ScriptMode) {
  if (script === "arabic") {
    return value.replace(/[A-Za-zÀ-ž]/gu, "");
  }

  return value.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/gu, "");
}

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => "<p>" + escapeHtml(paragraph).replace(/\n/g, "<br>") + "</p>")
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function documentMetrics(html: string, script: ScriptMode) {
  const text = stripHtml(html);
  const tokens = text ? text.split(/\s+/).filter(Boolean) : [];
  const normalizedWords = tokens
    .map((word) => word.replace(/[“”"'.,!?؟،؛:;()[\]{}]/g, ""))
    .filter(Boolean);
  const uniqueWords = new Set(normalizedWords.map((word) => word.toLocaleLowerCase())).size;
  const sentenceCount = text
    ? Math.max(1, text.split(/[.!?؟]+/).map((part) => part.trim()).filter(Boolean).length)
    : 0;
  const paragraphCount = Math.max(
    0,
    (html.match(/<(p|h1|h2|h3|blockquote|li)(\s|>)/gi) ?? []).length,
  );

  const arabicLetters =
    (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/gu) ?? []).length;
  const latinLetters = (text.match(/[A-Za-zÀ-ž]/gu) ?? []).length;
  const relevantLetters = arabicLetters + latinLetters;
  const foreignLetters = script === "arabic" ? latinLetters : arabicLetters;
  const purity =
    relevantLetters === 0
      ? 100
      : Math.max(0, Math.round(((relevantLetters - foreignLetters) / relevantLetters) * 100));

  return {
    text,
    words: tokens.length,
    characters: text.length,
    uniqueWords,
    sentenceCount,
    paragraphCount,
    foreignLetters,
    purity,
    readingMinutes: Math.max(1, Math.ceil(tokens.length / 180)),
  };
}

export function ZubanDocsEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const replaceImageRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const autoSnapshotRef = useRef<{ documentId: string; at: number; html: string }>({
    documentId: "",
    at: Date.now(),
    html: "",
  });
  const [documents, setDocuments] = useState<ZubanDocument[]>([]);
  const [activeId, setActiveId] = useState("");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [storageLabel, setStorageLabel] = useState("Local");
  const [search, setSearch] = useState("");
  const [libraryView, setLibraryView] = useState<LibraryView>("all");
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.75);
  const [guardMessage, setGuardMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findCursor, setFindCursor] = useState(-1);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [showLanguageTools, setShowLanguageTools] = useState(false);
  const [toolBusy, setToolBusy] = useState(false);
  const [toolTitle, setToolTitle] = useState("Balochi tools");
  const [toolBody, setToolBody] = useState("Select some text, then choose a tool.");
  const [toolReplacement, setToolReplacement] = useState("");
  const [spellIssues, setSpellIssues] = useState<
    Array<{ word: string; suggestions: string[] }>
  >([]);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [phoneticTyping, setPhoneticTyping] = useState(true);
  const [keyboardShift, setKeyboardShift] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>("phonetic");
  const [newScript, setNewScript] = useState<ScriptMode>("arabic");
  const [newTemplate, setNewTemplate] = useState<TemplateId>("blank");

  const activeDocument =
    documents.find((document) => document.id === activeId) ?? documents[0];

  useEffect(() => {
    let cancelled = false;

    async function loadLocalLibrary() {
      let library:
        | {
            documents: ZubanDocument[];
            activeId: string;
          }
        | null = null;

      try {
        library = await loadDocxLibrary<ZubanDocument>();

        if (!library?.documents?.length) {
          library = await migrateDocxFromLocalStorage<ZubanDocument>(
            STORAGE_KEY,
            ACTIVE_KEY,
          );
        }
      } catch {
        library = null;
      }

      if (cancelled) return;

      const nextDocuments =
        library?.documents?.length ? library.documents : [makeDocument()];
      const nextActive =
        library?.activeId &&
        nextDocuments.some((item) => item.id === library?.activeId)
          ? library.activeId
          : nextDocuments[0].id;

      setDocuments(nextDocuments);
      setActiveId(nextActive);
      setReady(true);

      try {
        const estimate = await getDocxStorageEstimate();
        if (!cancelled && estimate?.quota) {
          const usageMb = estimate.usage / 1024 / 1024;
          const quotaMb = estimate.quota / 1024 / 1024;
          setStorageLabel(
            usageMb >= 1
              ? usageMb.toFixed(1) + " MB local"
              : "Local · " + Math.round(quotaMb) + " MB+ available",
          );
        }
      } catch {
        setStorageLabel("Local");
      }
    }

    void loadLocalLibrary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      void saveDocxLibrary(documents, activeId)
        .then(async () => {
          setSaved(true);
          const estimate = await getDocxStorageEstimate().catch(() => null);
          if (estimate?.quota) {
            const usageMb = estimate.usage / 1024 / 1024;
            setStorageLabel(
              usageMb >= 1 ? usageMb.toFixed(1) + " MB local" : "Local",
            );
          }
        })
        .catch(() => {
          setSaved(false);
          setNotice("I couldn’t save this document on this device.");
        });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [documents, activeId, ready]);

  useEffect(() => {
    if (!editorRef.current || !activeDocument) return;
    editorRef.current.innerHTML = activeDocument.html;
    autoSnapshotRef.current = {
      documentId: activeDocument.id,
      at: Date.now(),
      html: activeDocument.html,
    };
  }, [activeDocument?.id]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);


  useEffect(() => {
    function onWindowKeyDown(event: globalThis.KeyboardEvent) {
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLocaleLowerCase();

      if (modifier && key === "k") {
        event.preventDefault();
        setCommandQuery("");
        setShowCommandPalette((value) => !value);
        return;
      }

      if (modifier && key === "f") {
        event.preventDefault();
        setShowFind(true);
        return;
      }

      if (modifier && event.shiftKey && key === "o") {
        event.preventDefault();
        setShowOutline((value) => !value);
        return;
      }

      if (event.key === "Escape") {
        setShowCommandPalette(false);
        setShowFind(false);
        setShowPageSetup(false);
        setShowLanguageTools(false);
        setShowOutline(false);
        setSelectedImage(null);
      }
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return documents
      .filter((document) => {
        if (libraryView === "favorites" && !document.favorite) return false;
        if (!query) return true;
        const haystack = document.title + " " + stripHtml(document.html);
        return haystack.toLocaleLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (libraryView === "recent") return b.updatedAt - a.updatedAt;
        if (Boolean(a.favorite) !== Boolean(b.favorite)) {
          return a.favorite ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      });
  }, [documents, search, libraryView]);

  const metrics = useMemo(
    () =>
      activeDocument
        ? documentMetrics(activeDocument.html, activeDocument.script)
        : documentMetrics("", "arabic"),
    [activeDocument],
  );


  const outlineItems = useMemo(
    () => documentOutline(activeDocument?.html ?? ""),
    [activeDocument?.html],
  );


  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLocaleLowerCase();
    if (!query) return commandCatalog;
    return commandCatalog.filter((item) =>
      (item.label + " " + item.hint).toLocaleLowerCase().includes(query),
    );
  }, [commandQuery]);

  const charactersForMode =
    activeDocument?.script === "latin" ? latinCharacters : arabicCharacters;
  const fontsForMode =
    activeDocument?.script === "latin" ? latinFonts : arabicFonts;
  const currentFont =
    activeDocument?.fontFamily ??
    (activeDocument?.script === "latin" ? latinFonts[0][1] : arabicFonts[0][1]);

  const updateActive = useCallback(
    (patch: Partial<ZubanDocument>) => {
      if (!activeDocument) return;
      setSaved(false);
      setDocuments((current) =>
        current.map((document) =>
          document.id === activeDocument.id
            ? { ...document, ...patch, updatedAt: Date.now() }
            : document,
        ),
      );
    },
    [activeDocument],
  );

  const saveNow = useCallback(() => {
    void saveDocxLibrary(documents, activeId)
      .then(() => {
        setSaved(true);
        setNotice("Document saved on this device.");
      })
      .catch(() => {
        setSaved(false);
        setNotice("I couldn’t save this document on this device.");
      });
  }, [documents, activeId]);

  function openCreateDialog() {
    setNewScript(activeDocument?.script ?? "arabic");
    setNewTemplate("blank");
    setShowCreate(true);
  }

  function createDocument(
    script: ScriptMode = newScript,
    templateId: TemplateId = newTemplate,
  ) {
    const document = makeDocument(script, templateId);
    setDocuments((current) => [document, ...current]);
    setActiveId(document.id);
    setSaved(false);
    setGuardMessage("");
    setShowCreate(false);
    setNotice("New Balochi document created.");
  }

  function duplicateDocument() {
    if (!activeDocument) return;
    const now = Date.now();
    const copy: ZubanDocument = {
      ...activeDocument,
      id: makeId(),
      title:
        activeDocument.script === "arabic"
          ? activeDocument.title + " — کاپی"
          : activeDocument.title + " — copy",
      createdAt: now,
      updatedAt: now,
      snapshots: [],
    };
    setDocuments((current) => [copy, ...current]);
    setActiveId(copy.id);
    setSaved(false);
    setNotice("Document duplicated.");
  }

  function deleteDocument() {
    if (!activeDocument) return;
    if (!window.confirm("Delete this local document? This cannot be undone.")) return;

    if (documents.length === 1) {
      const replacement = makeDocument(activeDocument.script);
      setDocuments([replacement]);
      setActiveId(replacement.id);
      setNotice("Document deleted.");
      return;
    }

    const remaining = documents.filter(
      (document) => document.id !== activeDocument.id,
    );
    setDocuments(remaining);
    setActiveId(remaining[0].id);
    setSaved(false);
    setNotice("Document deleted.");
  }

  function toggleFavorite(id: string) {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? { ...document, favorite: !document.favorite, updatedAt: Date.now() }
          : document,
      ),
    );
    setSaved(false);
  }

  function switchScript(script: ScriptMode) {
    if (!activeDocument || activeDocument.script === script) return;

    const currentText = editorRef.current?.innerText.trim() ?? "";
    if (currentText && !scriptAllowed(currentText, script)) {
      setGuardMessage(
        script === "arabic"
          ? "Arabic-script mode selected. Existing Latin text is kept; the script guide will only warn, not block typing."
          : "Latin-script mode selected. Existing Arabic text is kept; the script guide will only warn, not block typing.",
      );
    } else {
      setGuardMessage("");
    }

    updateActive({ script });
  }

  function onEditorInput(event: FormEvent<HTMLDivElement>) {
    const html = event.currentTarget.innerHTML;

    if (activeDocument) {
      const tracker = autoSnapshotRef.current;
      const now = Date.now();

      if (
        tracker.documentId === activeDocument.id &&
        tracker.html &&
        tracker.html !== html &&
        now - tracker.at >= 180_000
      ) {
        const snapshot: Snapshot = {
          id: makeId(),
          createdAt: now,
          html: tracker.html,
          source: "auto",
        };

        updateActive({
          html,
          snapshots: [snapshot, ...activeDocument.snapshots].slice(0, 18),
        });

        autoSnapshotRef.current = {
          documentId: activeDocument.id,
          at: now,
          html,
        };
        setGuardMessage("");
        return;
      }

      if (tracker.documentId !== activeDocument.id) {
        autoSnapshotRef.current = {
          documentId: activeDocument.id,
          at: now,
          html,
        };
      }
    }

    updateActive({ html });
    setGuardMessage("");
  }

  function onBeforeInput(event: FormEvent<HTMLDivElement>) {
    if (!activeDocument) return;
    const inputEvent = event.nativeEvent as InputEvent;
    if (!inputEvent.data) return;

    if (!scriptAllowed(inputEvent.data, activeDocument.script)) {
      setGuardMessage(
        activeDocument.script === "arabic"
          ? "Arabic-script mode is active. Latin letters are allowed; switch to Balōčī mode if you want Latin direction and formatting."
          : "Latin-script mode is active. Arabic letters are allowed; switch to بلوچی mode if you want RTL direction and formatting.",
      );
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    if (!activeDocument) return;

    const pasted = event.clipboardData.getData("text/plain");
    const pastedHtml = event.clipboardData.getData("text/html");

    if (pastedHtml) {
      event.preventDefault();
      const safeHtml = sanitizeImportedHtml(pastedHtml);
      document.execCommand("insertHTML", false, safeHtml);
      if (editorRef.current) {
        updateActive({ html: editorRef.current.innerHTML });
      }
    }

    if (!scriptAllowed(pasted, activeDocument.script)) {
      setGuardMessage(
        "Mixed-script text was pasted. Nothing was removed; the script guide is advisory only.",
      );
    }
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
  }

  function clearFormatting() {
    command("removeFormat");
    setNotice("Formatting cleared from the selection.");
  }


  function scrollToOutlineItem(index: number) {
    const heading = editorRef.current?.querySelectorAll("h1,h2,h3")[index] as
      | HTMLElement
      | undefined;

    if (!heading) return;
    heading.scrollIntoView({ behavior: "smooth", block: "center" });
    heading.animate(
      [
        { backgroundColor: "rgba(3,159,171,.18)" },
        { backgroundColor: "transparent" },
      ],
      { duration: 900, easing: "ease-out" },
    );
  }

  function insertLink() {
    captureSelection();
    restoreSelection();

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? "";
    const rawUrl = window.prompt("Paste a web or email link:");
    if (!rawUrl?.trim()) return;

    let href = rawUrl.trim();
    if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(href)) {
      href = "mailto:" + href;
    } else if (!/^(https?:|mailto:)/i.test(href)) {
      href = "https://" + href;
    }

    if (!/^(https?:|mailto:)/i.test(href)) {
      setNotice("Please use a valid web or email link.");
      return;
    }

    if (selectedText) {
      document.execCommand("createLink", false, href);
      const anchor = editorRef.current?.querySelector(
        'a[href="' + CSS.escape(href) + '"]',
      ) as HTMLAnchorElement | null;
      if (anchor) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
    } else {
      const label = window.prompt("Link text:", href) || href;
      document.execCommand(
        "insertHTML",
        false,
        '<a href="' +
          escapeHtml(href) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(label) +
          "</a>",
      );
    }

    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
    setNotice("Link added.");
  }

  function captureSelection() {
    const selection = window.getSelection();
    if (
      !selection ||
      !selection.rangeCount ||
      !editorRef.current?.contains(selection.anchorNode)
    ) {
      return;
    }

    selectionRef.current = selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || !selectionRef.current) return;
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  }

  function insertCharacter(character: string) {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("insertText", false, character);
    captureSelection();
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
  }
  function getSelectedText() {
    restoreSelection();
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (!text) {
      setNotice("Select some text first.");
      return "";
    }
    return text;
  }

  function replaceSelectedText(value: string) {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = window.document.createTextNode(value);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    selectionRef.current = range.cloneRange();
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
  }

  async function transliterateSelection(target: ScriptMode) {
    const input = getSelectedText();
    if (!input) return;
    setShowLanguageTools(true);
    setToolBusy(true);
    setToolTitle(target === "arabic" ? "Arabic-script Balochi" : "Roman Balochi");
    setToolBody("Converting…");
    setToolReplacement("");

    try {
      const response = await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transliterate", input, target }),
      });
      const data = (await response.json()) as { output?: string; error?: string };
      const output = data.output?.trim() ?? "";
      setToolBody(output || data.error || "I couldn’t convert that text.");
      setToolReplacement(output);
    } catch {
      setToolBody("I couldn’t convert that text. Please try again.");
    } finally {
      setToolBusy(false);
    }
  }

  async function lookupSelection() {
    const input = getSelectedText();
    if (!input) return;
    setShowLanguageTools(true);
    setToolBusy(true);
    setToolTitle("Word meaning");
    setToolBody("Looking it up…");
    setToolReplacement("");

    try {
      const response = await fetch(
        "/api/dictionary?q=" + encodeURIComponent(input) + "&limit=5",
      );
      const data = (await response.json()) as {
        entries?: Array<{
          word: string;
          latin?: string[];
          part?: string;
          meanings: string[];
        }>;
      };
      const entries = data.entries ?? [];
      setToolBody(
        entries.length
          ? entries
              .map(
                (entry) =>
                  entry.word +
                  (entry.latin?.[0] ? " (" + entry.latin[0] + ")" : "") +
                  " — " +
                  entry.meanings.join(", "),
              )
              .join("\n")
          : "I couldn’t find that word in the Zubán dictionary.",
      );
    } catch {
      setToolBody("I couldn’t look that word up. Please try again.");
    } finally {
      setToolBusy(false);
    }
  }

  async function translateSelection(target: "English" | "Balochi") {
    const input = getSelectedText();
    if (!input) return;
    setShowLanguageTools(true);
    setToolBusy(true);
    setToolTitle(target === "English" ? "English translation" : "Balochi translation");
    setToolBody("Translating…");
    setToolReplacement("");

    try {
      const response = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "translate",
          input,
          source: target === "English" ? "Balochi" : "English",
          target,
        }),
      });
      const data = (await response.json()) as {
        output?: string;
        message?: string;
        error?: string;
      };
      const output = data.output?.trim() ?? "";
      setToolBody(output || data.message || data.error || "I couldn’t translate that.");
      setToolReplacement(output);
    } catch {
      setToolBody("I couldn’t translate that. Please try again.");
    } finally {
      setToolBusy(false);
    }
  }

  async function checkDocumentSpelling() {
    const text = editorRef.current?.innerText ?? metrics.text;
    const words = Array.from(
      new Set(
        (text.match(/[\p{L}\p{M}’'-]+/gu) ?? [])
          .map((word) => word.replace(/^[’'-]+|[’'-]+$/g, ""))
          .filter((word) => word.length > 1),
      ),
    ).slice(0, 80);

    if (!words.length) {
      setNotice("There aren’t enough words to check yet.");
      return;
    }

    setShowLanguageTools(true);
    setToolBusy(true);
    setToolTitle("Spelling");
    setToolBody("Checking the document…");
    setToolReplacement("");
    setSpellIssues([]);

    try {
      const response = await fetch(
        "/api/dictionary?check=" + encodeURIComponent(words.join("|")),
      );
      const data = (await response.json()) as {
        unknown?: Array<{ word: string; suggestions: string[] }>;
      };
      const unknown = data.unknown ?? [];
      setSpellIssues(unknown);
      setToolBody(
        unknown.length
          ? unknown.length +
              " word" +
              (unknown.length === 1 ? "" : "s") +
              " weren’t found in the current Zubán dictionary."
          : "No spelling issues were found in the checked words.",
      );
    } catch {
      setToolBody("I couldn’t check spelling right now.");
    } finally {
      setToolBusy(false);
    }
  }

  function escapeRegex(value: string) {
    return value.replace(
      /[|\\{}()[\]^$+*?.-]/g,
      (character) => "\\" + character,
    );
  }

  function replaceWordEverywhere(from: string, to: string) {
    const editor = editorRef.current;
    if (!editor || !from) return;
    const walker = window.document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const pattern = new RegExp(escapeRegex(from), "gu");
    let node = walker.nextNode() as Text | null;
    while (node) {
      node.textContent = (node.textContent ?? "").replace(pattern, to);
      node = walker.nextNode() as Text | null;
    }
    updateActive({ html: editor.innerHTML });
    setSpellIssues((current) => current.filter((issue) => issue.word !== from));
    setNotice("Spelling updated.");
  }

  function findRanges(query: string) {
    const editor = editorRef.current;
    if (!editor || !query) return [] as Range[];

    const ranges: Range[] = [];
    const needle = query.toLocaleLowerCase();
    const walker = window.document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;

    while (node) {
      const value = node.textContent ?? "";
      const lower = value.toLocaleLowerCase();
      let start = 0;
      while (start <= lower.length - needle.length) {
        const index = lower.indexOf(needle, start);
        if (index < 0) break;
        const range = window.document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + query.length);
        ranges.push(range);
        start = index + Math.max(1, query.length);
      }
      node = walker.nextNode() as Text | null;
    }

    return ranges;
  }

  function findNextOccurrence() {
    const ranges = findRanges(findText);
    if (!ranges.length) {
      setNotice("No matches found.");
      setFindCursor(-1);
      return;
    }

    const next = (findCursor + 1) % ranges.length;
    const range = ranges[next];
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    selectionRef.current = range.cloneRange();
    range.startContainer.parentElement?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
    setFindCursor(next);
    setNotice("Match " + (next + 1) + " of " + ranges.length);
  }

  function replaceCurrentMatch() {
    const selection = window.getSelection();
    if (!selection?.toString()) {
      findNextOccurrence();
      return;
    }
    replaceSelectedText(replaceText);
    setNotice("Match replaced.");
  }

  function replaceAllMatches() {
    const editor = editorRef.current;
    if (!editor || !findText) return;
    const walker = window.document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const pattern = new RegExp(escapeRegex(findText), "giu");
    let count = 0;
    let node = walker.nextNode() as Text | null;
    while (node) {
      const before = node.textContent ?? "";
      node.textContent = before.replace(pattern, () => {
        count += 1;
        return replaceText;
      });
      node = walker.nextNode() as Text | null;
    }
    updateActive({ html: editor.innerHTML });
    setNotice(
      count
        ? count + " match" + (count === 1 ? "" : "es") + " replaced."
        : "No matches found.",
    );
    setFindCursor(-1);
  }


  function pressVirtualKey(key: string) {
    if (key === "BACKSPACE") {
      restoreSelection();
      document.execCommand("delete");
    } else if (key === "ENTER") {
      restoreSelection();
      document.execCommand("insertLineBreak");
    } else if (key === "SPACE") {
      insertCharacter(" ");
      return;
    } else {
      const baseMap =
        keyboardLayout === "traditional" ? traditionalArabicMap : arabicPhysicalMap;
      const shiftMap =
        keyboardLayout === "traditional"
          ? traditionalArabicShiftMap
          : arabicShiftMap;
      const output =
        activeDocument.script === "arabic"
          ? keyboardShift
            ? shiftMap[key] ?? baseMap[key] ?? key
            : baseMap[key] ?? key
          : keyboardShift
            ? key.toUpperCase()
            : key;

      insertCharacter(output);
      setKeyboardShift(false);
      return;
    }

    captureSelection();
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
  }

  function changeDocumentFont(fontFamily: string) {
    updateActive({ fontFamily });
    setNotice("Font changed.");
  }

  function applyInlineStyle(styles: Partial<CSSStyleDeclaration>) {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) {
      setNotice("Select some text first.");
      return;
    }

    const range = selection.getRangeAt(0);
    const span = window.document.createElement("span");
    Object.assign(span.style, styles);
    span.appendChild(range.extractContents());
    range.insertNode(span);
    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
    selectionRef.current = range.cloneRange();
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
  }

  function setParagraphSpacing(spacing: number) {
    const editor = editorRef.current;
    if (!editor) return;
    editor
      .querySelectorAll<HTMLElement>("p,li,blockquote,h1,h2,h3")
      .forEach((block) => {
        block.style.marginBottom = spacing + "px";
      });
    updateActive({
      html: editor.innerHTML,
      paragraphSpacing: spacing,
    });
    setNotice("Paragraph spacing updated.");
  }

  function insertPageBreak() {
    restoreSelection();
    document.execCommand(
      "insertHTML",
      false,
      '<div class="docs-page-break" contenteditable="false"><span>Page break</span></div><p><br></p>',
    );
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
  }

  function insertTable(rows = 3, columns = 3) {
    restoreSelection();
    const body = Array.from({ length: rows }, () =>
      "<tr>" +
      Array.from({ length: columns }, () => "<td><br></td>").join("") +
      "</tr>",
    ).join("");
    document.execCommand(
      "insertHTML",
      false,
      '<table class="docs-table"><tbody>' + body + "</tbody></table><p><br></p>",
    );
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
    setNotice(rows + " × " + columns + " table added.");
  }

  function currentTableContext() {
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const element =
      node instanceof HTMLElement ? node : node?.parentElement ?? null;
    const cell = element?.closest("td,th") as HTMLTableCellElement | null;
    const row = cell?.closest("tr") as HTMLTableRowElement | null;
    const table = cell?.closest("table") as HTMLTableElement | null;
    return { cell, row, table };
  }

  function changeTable(action: "row" | "column" | "delete-row" | "delete-column" | "merge" | "borders") {
    const { cell, row, table } = currentTableContext();
    if (!cell || !row || !table) {
      setNotice("Place the cursor inside a table first.");
      return;
    }

    if (action === "row") {
      const clone = row.cloneNode(true) as HTMLTableRowElement;
      clone.querySelectorAll("td,th").forEach((item) => {
        item.innerHTML = "<br>";
      });
      row.insertAdjacentElement("afterend", clone);
    }

    if (action === "column") {
      const index = cell.cellIndex + 1;
      Array.from(table.rows).forEach((tableRow) => {
        const next = tableRow.insertCell(Math.min(index, tableRow.cells.length));
        next.innerHTML = "<br>";
      });
    }

    if (action === "delete-row") {
      row.remove();
    }

    if (action === "delete-column") {
      const index = cell.cellIndex;
      Array.from(table.rows).forEach((tableRow) => {
        if (tableRow.cells[index]) tableRow.deleteCell(index);
      });
    }

    if (action === "merge") {
      const next = cell.nextElementSibling as HTMLTableCellElement | null;
      if (!next) {
        setNotice("There isn’t another cell to merge with.");
        return;
      }
      cell.colSpan = (cell.colSpan || 1) + (next.colSpan || 1);
      const extra = next.innerHTML.trim();
      if (extra && extra !== "<br>") {
        cell.innerHTML += " " + extra;
      }
      next.remove();
    }

    if (action === "borders") {
      table.dataset.borderless =
        table.dataset.borderless === "true" ? "false" : "true";
    }

    updateActive({ html: editorRef.current?.innerHTML ?? activeDocument.html });
    setNotice("Table updated.");
  }

  async function prepareImage(file: File) {
    if (!file.type.startsWith("image/")) return "";
    if (file.size > 8_000_000) return "";

    const source = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });

    if (!source) return "";

    return new Promise<string>((resolve) => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1400;
        const scale = Math.min(1, maxWidth / Math.max(1, image.width));
        const canvas = window.document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          resolve("");
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.onerror = () => resolve("");
      image.src = source;
    });
  }

  function chooseImage() {
    captureSelection();
    imageRef.current?.click();
  }

  async function insertImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const compressed = await prepareImage(file);
    if (!compressed) {
      setNotice("Please choose a supported image smaller than 8 MB.");
      return;
    }

    const safeAlt = escapeHtml(file.name.replace(/\.[^.]+$/, ""));
    restoreSelection();
    document.execCommand(
      "insertHTML",
      false,
      '<figure class="docs-inline-image" data-align="center">' +
        '<img src="' +
        compressed +
        '" alt="' +
        safeAlt +
        '" style="width:75%" data-align="center">' +
        '<figcaption contenteditable="true">Add a caption…</figcaption>' +
        "</figure><p><br></p>",
    );
    captureSelection();
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
    setNotice("Image added.");
  }

  function handleEditorClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const image =
      target instanceof HTMLImageElement
        ? target
        : (target.closest("img") as HTMLImageElement | null);
    setSelectedImage(image);
    captureSelection();
  }

  function updateSelectedImage(
    options: { width?: number; align?: "left" | "center" | "right"; wrap?: boolean },
  ) {
    if (!selectedImage) {
      setNotice("Select an image first.");
      return;
    }

    const figure = selectedImage.closest("figure") as HTMLElement | null;
    if (options.width) selectedImage.style.width = options.width + "%";

    if (options.align) {
      selectedImage.dataset.align = options.align;
      if (figure) {
        figure.dataset.align = options.align;
        figure.style.textAlign = options.align;
      }
    }

    if (options.wrap !== undefined && figure) {
      if (options.wrap) {
        const align = selectedImage.dataset.align === "right" ? "right" : "left";
        figure.style.float = align;
        figure.style.width = selectedImage.style.width || "50%";
        figure.style.margin =
          align === "right" ? "12px 0 18px 24px" : "12px 24px 18px 0";
      } else {
        figure.style.float = "";
        figure.style.width = "";
        figure.style.margin = "24px auto";
      }
    }

    updateActive({ html: editorRef.current?.innerHTML ?? activeDocument.html });
  }

  function deleteSelectedImage() {
    if (!selectedImage) return;
    selectedImage.closest("figure")?.remove();
    setSelectedImage(null);
    updateActive({ html: editorRef.current?.innerHTML ?? activeDocument.html });
    setNotice("Image removed.");
  }

  function chooseReplacementImage() {
    if (!selectedImage) {
      setNotice("Select an image first.");
      return;
    }
    replaceImageRef.current?.click();
  }

  async function replaceSelectedImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedImage) return;
    const compressed = await prepareImage(file);
    if (!compressed) {
      setNotice("Please choose a supported image smaller than 8 MB.");
      return;
    }
    selectedImage.src = compressed;
    selectedImage.alt = file.name.replace(/\.[^.]+$/, "");
    updateActive({ html: editorRef.current?.innerHTML ?? activeDocument.html });
    setNotice("Image replaced.");
  }

  function titleChange(value: string) {
    if (!activeDocument) return;
    if (!scriptAllowed(value, activeDocument.script)) {
      setGuardMessage(
        "Mixed-script title detected. It is allowed; the script guide will not remove your text.",
      );
    }
    updateActive({ title: value });
  }

  function createSnapshot() {
    if (!activeDocument) return;
    const snapshot: Snapshot = {
      id: makeId(),
      createdAt: Date.now(),
      html: editorRef.current?.innerHTML ?? activeDocument.html,
      source: "manual",
    };

    updateActive({
      snapshots: [snapshot, ...activeDocument.snapshots].slice(0, 18),
    });
    setShowSnapshots(true);
    setNotice("Checkpoint saved.");
  }

  function restoreSnapshot(snapshot: Snapshot) {
    if (!activeDocument) return;
    updateActive({ html: snapshot.html });
    if (editorRef.current) editorRef.current.innerHTML = snapshot.html;
    setShowSnapshots(false);
    setNotice("Earlier version restored.");
  }

  async function copyDocument() {
    const text = editorRef.current?.innerText ?? metrics.text;
    await navigator.clipboard.writeText(text);
    setNotice("Document copied.");
  }

  function exportTxt() {
    if (!activeDocument) return;
    const text = editorRef.current?.innerText ?? metrics.text;
    downloadFile(
      (activeDocument.title || "zuban-document") + ".txt",
      text,
      "text/plain;charset=utf-8",
    );
  }

  function exportHtml() {
    if (!activeDocument) return;
    const direction = activeDocument.script === "arabic" ? "rtl" : "ltr";
    const body = editorRef.current?.innerHTML ?? activeDocument.html;
    const file =
      "<!doctype html><html lang=\"bal\" dir=\"" +
      direction +
      "\"><head><meta charset=\"utf-8\"><title>" +
      escapeHtml(activeDocument.title) +
      "</title><style>body{max-width:760px;margin:60px auto;font-family:system-ui,sans-serif;font-size:18px;line-height:1.8;padding:0 24px}h1,h2,h3{line-height:1.2}</style></head><body>" +
      body +
      "</body></html>";

    downloadFile(
      (activeDocument.title || "zuban-document") + ".html",
      file,
      "text/html;charset=utf-8",
    );
  }

  async function exportDocx() {
    if (!activeDocument) return;
    setNotice("Creating Word file…");

    try {
      const { createDocxBlob } = await import("@/lib/docx-file");
      const blob = await createDocxBlob(
        editorRef.current?.innerHTML ?? activeDocument.html,
        {
          title: activeDocument.title,
          script: activeDocument.script,
          fontFamily: currentFont,
          pageSize: activeDocument.pageSize ?? "a4",
          orientation: activeDocument.orientation ?? "portrait",
          marginMm: activeDocument.marginMm ?? 20,
          headerText: activeDocument.headerText ?? "",
          footerText: activeDocument.footerText ?? "",
          showPageNumbers: Boolean(activeDocument.showPageNumbers),
          showDate: Boolean(activeDocument.showDate),
        },
      );
      downloadBlob((activeDocument.title || "zuban-document") + ".docx", blob);
      setNotice("Word document downloaded.");
    } catch {
      setNotice("I couldn’t create the Word file. Please try again.");
    }
  }

  function exportZdocx(document: ZubanDocument = activeDocument) {
    if (!document) return;
    downloadFile(
      (document.title || "zuban-document") + ".zdocx",
      JSON.stringify(
        {
          format: "zuban-docx",
          version: 2,
          exportedAt: Date.now(),
          document: {
            ...document,
            html: editorRef.current?.innerHTML ?? document.html,
          },
        },
        null,
        2,
      ),
      "application/vnd.zuban.docx+json;charset=utf-8",
    );
    setNotice("Zuban DocX file downloaded.");
  }

  function exportLibraryBackup() {
    downloadFile(
      "zuban-docx-library.zdocx",
      JSON.stringify(
        {
          format: "zuban-docx-library",
          version: 2,
          exportedAt: Date.now(),
          lastDocumentUpdate: documents.reduce(
            (latest, document) => Math.max(latest, document.updatedAt),
            0,
          ),
          documents,
        },
        null,
        2,
      ),
      "application/vnd.zuban.docx+json;charset=utf-8",
    );
    setNotice("Your DocX library backup is ready.");
  }

  function downloadBlob(name: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = name.replace(/[\\/:*?\"<>|]/g, "-");
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadFile(name: string, content: string, type: string) {
    downloadBlob(name, new Blob([content], { type }));
  }

  function makeImportedDocument(
    title: string,
    html: string,
    script: ScriptMode,
  ): ZubanDocument {
    const now = Date.now();
    return {
      id: makeId(),
      title:
        title ||
        (script === "arabic" ? "درآمد بوتگ دستاویز" : "Imported document"),
      html,
      script,
      createdAt: now,
      updatedAt: now,
      snapshots: [],
      template: "blank",
      favorite: false,
      pageSize: "a4",
      orientation: "portrait",
      marginMm: 20,
      headerText: "",
      footerText: "",
      showPageNumbers: false,
      showDate: false,
      paragraphSpacing: 18,
    };
  }

  async function importDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLocaleLowerCase() ?? "";
    const largerFile = extension === "docx" || extension === "zdocx";
    if (file.size > (largerFile ? 15_000_000 : 2_000_000)) {
      setGuardMessage(
        largerFile
          ? "Please choose a DOCX or ZDOCX file smaller than 15 MB."
          : "Please choose a text document smaller than 2 MB.",
      );
      return;
    }

    if (extension === "zdocx") {
      try {
        const parsed = JSON.parse(await file.text()) as {
          format?: string;
          document?: ZubanDocument;
          documents?: ZubanDocument[];
        };

        if (parsed.format === "zuban-docx" && parsed.document) {
          const imported = {
            ...makeDocument(parsed.document.script ?? "arabic"),
            ...parsed.document,
            id: makeId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setDocuments((current) => [imported, ...current]);
          setActiveId(imported.id);
          setSaved(false);
          setNotice("Zuban DocX document restored.");
          return;
        }

        if (parsed.format === "zuban-docx-library" && Array.isArray(parsed.documents)) {
          const restored = parsed.documents.map((document) => ({
            ...makeDocument(document.script ?? "arabic"),
            ...document,
            id: makeId(),
            updatedAt: Date.now(),
          }));
          if (restored.length) {
            setDocuments((current) => [...restored, ...current]);
            setActiveId(restored[0].id);
            setSaved(false);
            setNotice(restored.length + " documents restored.");
            return;
          }
        }

        setNotice("That ZDOCX file doesn’t look valid.");
      } catch {
        setNotice("I couldn’t open that ZDOCX file.");
      }
      return;
    }

    if (extension === "docx") {
      setNotice("Opening Word document…");
      try {
        const { importDocxToHtml } = await import("@/lib/docx-file");
        const result = await importDocxToHtml(await file.arrayBuffer());
        const text = stripHtml(result.html);
        const arabicCount =
          (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/gu) ?? [])
            .length;
        const latinCount = (text.match(/[A-Za-zÀ-ž]/gu) ?? []).length;
        const script: ScriptMode = arabicCount >= latinCount ? "arabic" : "latin";
        const title = file.name.replace(/\.docx$/i, "") || "Imported document";
        const document = makeImportedDocument(title, result.html, script);
        setDocuments((current) => [document, ...current]);
        setActiveId(document.id);
        setSaved(false);
        setNotice("Word document imported.");
      } catch {
        setNotice("I couldn’t open that Word document.");
      }
      return;
    }

    const raw = await file.text();
    const htmlLike = /<\/?[a-z][\s\S]*>/i.test(raw);
    const text = htmlLike ? stripHtml(raw) : raw;
    const arabicCount =
      (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/gu) ?? []).length;
    const latinCount = (text.match(/[A-Za-zÀ-ž]/gu) ?? []).length;
    const script: ScriptMode =
      arabicCount || latinCount
        ? arabicCount >= latinCount
          ? "arabic"
          : "latin"
        : activeDocument?.script ?? "arabic";

    const titleFromFile =
      file.name.replace(/\.(txt|html?|md)$/i, "") || "Imported document";
    const document = makeImportedDocument(
      sanitizeForScript(titleFromFile, script) ||
        (script === "arabic" ? "درآمد بوتگ دستاویز" : "Imported document"),
      htmlLike ? sanitizeImportedHtml(raw) : textToHtml(raw),
      script,
    );

    setDocuments((current) => [document, ...current]);
    setActiveId(document.id);
    setSaved(false);
    setNotice("Document imported.");
  }

  function runCommand(id: CommandId) {
    setShowCommandPalette(false);
    setCommandQuery("");

    if (id === "new") openCreateDialog();
    if (id === "find") setShowFind(true);
    if (id === "outline") setShowOutline(true);
    if (id === "page") setShowPageSetup(true);
    if (id === "balochi") setShowLanguageTools(true);
    if (id === "image") chooseImage();
    if (id === "table") insertTable(3, 3);
    if (id === "link") insertLink();
    if (id === "page-break") insertPageBreak();
    if (id === "checkpoint") createSnapshot();
    if (id === "focus") setFocusMode((value) => !value);
    if (id === "keyboard") setShowKeyboard(true);
    if (id === "docx") void exportDocx();
    if (id === "print") window.print();
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      activeDocument.script === "arabic" &&
      phoneticTyping &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      /^[a-zA-Z]$/.test(event.key)
    ) {
      const key = event.key.toLowerCase();
      const baseMap =
        keyboardLayout === "traditional" ? traditionalArabicMap : arabicPhysicalMap;
      const shiftMap =
        keyboardLayout === "traditional"
          ? traditionalArabicShiftMap
          : arabicShiftMap;
      const mapped = event.shiftKey
        ? shiftMap[key] ?? baseMap[key]
        : baseMap[key];

      if (mapped) {
        event.preventDefault();
        insertCharacter(mapped);
        return;
      }
    }

    if (!(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();

    if (key === "enter") {
      event.preventDefault();
      insertPageBreak();
      return;
    }

    if (key === "k") {
      event.preventDefault();
      setCommandQuery("");
      setShowCommandPalette(true);
      return;
    }

    if (key === "f") {
      event.preventDefault();
      setShowFind(true);
      return;
    }

    if (key === "o" && event.shiftKey) {
      event.preventDefault();
      setShowOutline((value) => !value);
      return;
    }

    if (key === "s" && event.shiftKey) {
      event.preventDefault();
      createSnapshot();
      return;
    }

    if (key === "s") {
      event.preventDefault();
      saveNow();
      return;
    }

    if (key === "b") {
      event.preventDefault();
      command("bold");
      return;
    }

    if (key === "i") {
      event.preventDefault();
      command("italic");
      return;
    }

    if (key === "u") {
      event.preventDefault();
      command("underline");
    }
  }

  const pagePreset =
    (activeDocument?.pageSize ?? "a4") === "letter"
      ? { width: 816, height: 1056 }
      : { width: 794, height: 1123 };
  const landscape = (activeDocument?.orientation ?? "portrait") === "landscape";
  const pageWidthPx = landscape ? pagePreset.height : pagePreset.width;
  const pageHeightPx = landscape ? pagePreset.width : pagePreset.height;
  const pageMarginPx = Math.max(
    24,
    Math.round((activeDocument?.marginMm ?? 20) * 3.78),
  );

  if (!ready || !activeDocument) {
    return (
      <section className="docs-editor-loading">
        <span className="pulse" />
        Loading Zuban DocX…
      </section>
    );
  }

  return (
    <section
      className={focusMode ? "docs-app docs-focus" : "docs-app"}
      data-script={activeDocument.script}
    >
      <input
        ref={importRef}
        className="docs-hidden-input"
        type="file"
        accept=".txt,.md,.html,.htm,.docx,.zdocx,text/plain,text/html,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={importDocument}
      />

      <input
        ref={imageRef}
        className="docs-hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={insertImage}
      />
      <input
        ref={replaceImageRef}
        className="docs-hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={replaceSelectedImage}
      />

      <aside className="docs-sidebar">
        <div className="docs-sidebar-head">
          <Link href="/docs" className="docs-app-brand">
            <ZubanLogo
              className="docs-brand-logo"
              alt="Zubán"
              width={38}
              height={38}
              priority
            />
            <div>
              <strong>Zuban DocX</strong>
              <small>بلوچی نویسگ</small>
            </div>
          </Link>
          <button
            className="docs-icon-button"
            type="button"
            onClick={openCreateDialog}
            title="New document"
          >
            +
          </button>
        </div>

        <div className="docs-sidebar-actions">
          <button type="button" onClick={openCreateDialog}>＋ New</button>
          <button type="button" onClick={() => importRef.current?.click()}>↑ Import</button>
        </div>

        <label className="docs-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search documents"
          />
        </label>

        <div className="docs-library-tabs" aria-label="Document views">
          <button
            className={libraryView === "all" ? "active" : ""}
            type="button"
            onClick={() => setLibraryView("all")}
          >
            All
          </button>
          <button
            className={libraryView === "recent" ? "active" : ""}
            type="button"
            onClick={() => setLibraryView("recent")}
          >
            Recent
          </button>
          <button
            className={libraryView === "favorites" ? "active" : ""}
            type="button"
            onClick={() => setLibraryView("favorites")}
          >
            ★ Favorites
          </button>
        </div>

        <div className="docs-library">
          {filteredDocuments.map((document) => (
            <div
              className={
                document.id === activeDocument.id
                  ? "docs-library-row active"
                  : "docs-library-row"
              }
              key={document.id}
            >
              <button
                className="docs-library-item"
                type="button"
                onClick={() => {
                  setActiveId(document.id);
                  setGuardMessage("");
                }}
                dir={document.script === "arabic" ? "rtl" : "ltr"}
              >
                <strong>{document.title || "Untitled"}</strong>
                <span>
                  {new Date(document.updatedAt).toLocaleDateString()} ·{" "}
                  {stripHtml(document.html).slice(0, 42) || "Empty document"}
                </span>
              </button>
              <button
                className={document.favorite ? "docs-favorite active" : "docs-favorite"}
                type="button"
                onClick={() => toggleFavorite(document.id)}
                aria-label={document.favorite ? "Remove from favorites" : "Add to favorites"}
                title={document.favorite ? "Remove from favorites" : "Add to favorites"}
              >
                ★
              </button>
            </div>
          ))}

          {!filteredDocuments.length ? (
            <div className="docs-library-empty">
              <strong>No matching documents</strong>
              <span>Try a different search.</span>
            </div>
          ) : null}
        </div>

        <div className="docs-sidebar-foot">
          <div>
            <span>{documents.length} local document{documents.length === 1 ? "" : "s"}</span>
            <small>Private on this device</small>
          </div>
          <button type="button" onClick={exportLibraryBackup}>Backup</button>
        </div>
      </aside>

      <div className="docs-workspace">
        <header className="docs-topbar">
          <div className="docs-title-block">
            <input
              value={activeDocument.title}
              onChange={(event) => titleChange(event.target.value)}
              dir={activeDocument.script === "arabic" ? "rtl" : "ltr"}
              aria-label="Document title"
            />
            <span className={saved ? "docs-save-state saved" : "docs-save-state"}>
              <i />
              {saved ? "Saved locally" : "Saving…"}
            </span>
          </div>

          <div className="docs-top-actions">
            <button
              type="button"
              onClick={() => {
                setCommandQuery("");
                setShowCommandPalette(true);
              }}
              title="Commands · Ctrl/⌘ + K"
            >
              Commands
            </button>
            <button
              type="button"
              onClick={() => setShowOutline((value) => !value)}
              title="Outline · Ctrl/⌘ + Shift + O"
            >
              Outline
            </button>
            <button
              type="button"
              onClick={() => setShowFind((value) => !value)}
            >
              Find
            </button>
            <button
              type="button"
              onClick={() => setShowPageSetup((value) => !value)}
            >
              Page
            </button>
            <button
              type="button"
              onMouseDown={captureSelection}
              onClick={() => setShowLanguageTools((value) => !value)}
            >
              Balochi Tools
            </button>
            <button type="button" onClick={() => setShowInspector((value) => !value)}>
              Inspect
            </button>
            <button type="button" onClick={createSnapshot}>Checkpoint</button>
            <button type="button" onClick={() => setFocusMode((value) => !value)}>
              {focusMode ? "Exit focus" : "Focus"}
            </button>
            <button type="button" onClick={() => window.print()}>Print / PDF</button>
            <details className="docs-export-menu">
              <summary>Export</summary>
              <div>
                <button type="button" onClick={exportTxt}>Plain text (.txt)</button>
                <button type="button" onClick={exportHtml}>Web document (.html)</button>
                <button type="button" onClick={exportDocx}>Microsoft Word (.docx)</button>
                <button type="button" onClick={() => exportZdocx()}>Zuban DocX (.zdocx)</button>
                <button type="button" onClick={copyDocument}>Copy all text</button>
              </div>
            </details>
            <button
              className="docs-help-button"
              type="button"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts"
            >
              ?
            </button>
          </div>
        </header>

        <div className="docs-toolbar" aria-label="Document formatting toolbar">
          <div className="docs-toolbar-group">
            <button type="button" onClick={() => command("undo")} title="Undo">↶</button>
            <button type="button" onClick={() => command("redo")} title="Redo">↷</button>
          </div>
          <div className="docs-toolbar-group">
            <select
              aria-label="Text style"
              defaultValue="p"
              onChange={(event) => command("formatBlock", event.target.value)}
            >
              <option value="p">Paragraph</option>
              <option value="h1">Title</option>
              <option value="h2">Heading</option>
              <option value="h3">Subheading</option>
              <option value="blockquote">Quote</option>
            </select>
            <button type="button" onClick={() => command("bold")} title="Bold"><b>B</b></button>
            <button type="button" onClick={() => command("italic")} title="Italic"><i>I</i></button>
            <button type="button" onClick={() => command("underline")} title="Underline"><u>U</u></button>
            <button type="button" onClick={clearFormatting} title="Clear formatting">Tx</button>
          </div>
          <div className="docs-toolbar-group">
            <button type="button" onClick={() => command("insertUnorderedList")} title="Bulleted list">•≡</button>
            <button type="button" onClick={() => command("insertOrderedList")} title="Numbered list">1.</button>
            <button type="button" onClick={() => command("justifyLeft")} title="Align left">≡</button>
            <button type="button" onClick={() => command("justifyCenter")} title="Align center">≣</button>
            <button type="button" onClick={() => command("justifyRight")} title="Align right">≡</button>
          </div>
          <div className="docs-toolbar-group docs-script-toggle">
            <button
              className={activeDocument.script === "arabic" ? "active" : ""}
              type="button"
              onClick={() => switchScript("arabic")}
            >
              بلوچی
            </button>
            <button
              className={activeDocument.script === "latin" ? "active" : ""}
              type="button"
              onClick={() => switchScript("latin")}
            >
              Balōčī
            </button>
          </div>
          <div className="docs-toolbar-group">
            <select
              value={currentFont}
              aria-label="Balochi font"
              onChange={(event) => changeDocumentFont(event.target.value)}
              title="Balochi font"
            >
              {fontsForMode.map(([label, value]) => (
                <option key={label} value={value}>{label}</option>
              ))}
            </select>
            <button type="button" onClick={chooseImage} title="Add image">▧ Image</button>
            <button
              type="button"
              onMouseDown={captureSelection}
              onClick={insertLink}
              title="Insert link"
            >
              ↗ Link
            </button>
          </div>
          <div className="docs-toolbar-group">
            <select
              defaultValue="18"
              aria-label="Font size"
              title="Font size"
              onChange={(event) =>
                applyInlineStyle({ fontSize: event.target.value + "px" })
              }
            >
              {[10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72].map(
                (size) => (
                  <option key={size} value={size}>{size}px</option>
                ),
              )}
            </select>
            <label className="docs-color-control" title="Text color">
              A
              <input
                type="color"
                defaultValue="#163d61"
                onChange={(event) => applyInlineStyle({ color: event.target.value })}
              />
            </label>
            <label className="docs-color-control highlight" title="Highlight">
              ▰
              <input
                type="color"
                defaultValue="#fff2a8"
                onChange={(event) =>
                  applyInlineStyle({ backgroundColor: event.target.value })
                }
              />
            </label>
            <button type="button" onClick={() => command("outdent")} title="Decrease indent">⇤</button>
            <button type="button" onClick={() => command("indent")} title="Increase indent">⇥</button>
          </div>
          <div className="docs-toolbar-group">
            <select
              value={lineHeight}
              aria-label="Line spacing"
              onChange={(event) => setLineHeight(Number(event.target.value))}
            >
              <option value={1.2}>1.2×</option>
              <option value={1.5}>1.5×</option>
              <option value={1.75}>1.75×</option>
              <option value={2}>2×</option>
              <option value={2.5}>2.5×</option>
            </select>
            <select
              value={activeDocument.paragraphSpacing ?? 18}
              aria-label="Paragraph spacing"
              onChange={(event) => setParagraphSpacing(Number(event.target.value))}
            >
              <option value={0}>0px after</option>
              <option value={8}>8px after</option>
              <option value={12}>12px after</option>
              <option value={18}>18px after</option>
              <option value={24}>24px after</option>
              <option value={32}>32px after</option>
            </select>
            <select
              value={zoom}
              aria-label="Page zoom"
              onChange={(event) => setZoom(Number(event.target.value))}
            >
              <option value={80}>80%</option>
              <option value={90}>90%</option>
              <option value={100}>100%</option>
              <option value={110}>110%</option>
              <option value={125}>125%</option>
            </select>
          </div>
          <div className="docs-toolbar-group">
            <details className="docs-insert-menu">
              <summary>＋ Insert</summary>
              <div>
                <button type="button" onClick={() => insertTable(2, 2)}>2 × 2 table</button>
                <button type="button" onClick={() => insertTable(3, 3)}>3 × 3 table</button>
                <button type="button" onClick={() => insertTable(4, 4)}>4 × 4 table</button>
                <button type="button" onClick={chooseImage}>Image</button>
                <button type="button" onClick={insertPageBreak}>Page break</button>
              </div>
            </details>
            <details className="docs-insert-menu">
              <summary>Table</summary>
              <div>
                <button type="button" onClick={() => changeTable("row")}>Add row below</button>
                <button type="button" onClick={() => changeTable("column")}>Add column right</button>
                <button type="button" onClick={() => changeTable("merge")}>Merge with next cell</button>
                <button type="button" onClick={() => changeTable("borders")}>Toggle borders</button>
                <button type="button" onClick={() => changeTable("delete-row")}>Delete row</button>
                <button type="button" onClick={() => changeTable("delete-column")}>Delete column</button>
              </div>
            </details>
          </div>
        </div>

        {selectedImage ? (
          <div className="docs-image-toolbar">
            <strong>Image</strong>
            <button type="button" onClick={() => updateSelectedImage({ width: 25 })}>25%</button>
            <button type="button" onClick={() => updateSelectedImage({ width: 50 })}>50%</button>
            <button type="button" onClick={() => updateSelectedImage({ width: 75 })}>75%</button>
            <button type="button" onClick={() => updateSelectedImage({ width: 100 })}>100%</button>
            <button type="button" onClick={() => updateSelectedImage({ align: "left" })}>Left</button>
            <button type="button" onClick={() => updateSelectedImage({ align: "center" })}>Center</button>
            <button type="button" onClick={() => updateSelectedImage({ align: "right" })}>Right</button>
            <button type="button" onClick={() => updateSelectedImage({ wrap: true })}>Wrap text</button>
            <button type="button" onClick={() => updateSelectedImage({ wrap: false })}>No wrap</button>
            <label className="docs-image-alt">
              <span>Alt text</span>
              <input
                key={selectedImage.src + selectedImage.alt}
                defaultValue={selectedImage.alt}
                placeholder="Describe this image"
                onBlur={(event) => {
                  selectedImage.alt = event.target.value.trim();
                  updateActive({
                    html: editorRef.current?.innerHTML ?? activeDocument.html,
                  });
                  setNotice("Image description saved.");
                }}
              />
            </label>
            <button type="button" onClick={chooseReplacementImage}>Replace</button>
            <button className="docs-danger" type="button" onClick={deleteSelectedImage}>Delete</button>
            <button type="button" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        ) : null}

        {guardMessage ? (
          <div className="docs-guard-message">
            <strong>Script guide</strong>
            <span>{guardMessage}</span>
            <button type="button" onClick={() => setGuardMessage("")}>×</button>
          </div>
        ) : null}

        <div className="docs-canvas-wrap">
          <div
            className="docs-paper"
            data-page-size={activeDocument.pageSize ?? "a4"}
            data-orientation={activeDocument.orientation ?? "portrait"}
            style={{
              width: pageWidthPx,
              minHeight: pageHeightPx,
              maxWidth: "calc(100vw - var(--docs-sidebar) - 96px)",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            <div className="docs-page-ruler" aria-hidden="true">
              <span>0</span><i /><i /><i /><i /><span>8</span>
            </div>
            {(activeDocument.headerText || activeDocument.showDate) ? (
              <div
                className="docs-page-header"
                dir={activeDocument.script === "arabic" ? "rtl" : "ltr"}
                style={{ paddingInline: pageMarginPx }}
              >
                <span>{activeDocument.headerText}</span>
                {activeDocument.showDate ? <span>{new Date().toLocaleDateString()}</span> : null}
              </div>
            ) : null}
            <div
              ref={editorRef}
              className="docs-content"
              contentEditable
              spellCheck={false}
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label="Balochi document editor"
              dir={activeDocument.script === "arabic" ? "rtl" : "ltr"}
              lang="bal"
              style={{
                lineHeight,
                fontFamily: currentFont,
                padding: pageMarginPx,
                minHeight: Math.max(520, pageHeightPx - 150),
              }}
              onInput={onEditorInput}
              onBeforeInput={onBeforeInput}
              onPaste={onPaste}
              onKeyDown={handleEditorKeyDown}
              onMouseUp={captureSelection}
              onKeyUp={captureSelection}
              onFocus={captureSelection}
              onClick={handleEditorClick}
            />
            {(activeDocument.footerText || activeDocument.showPageNumbers) ? (
              <div
                className="docs-page-footer"
                dir={activeDocument.script === "arabic" ? "rtl" : "ltr"}
                style={{ paddingInline: pageMarginPx }}
              >
                <span>{activeDocument.footerText}</span>
                {activeDocument.showPageNumbers ? <span>Page 1</span> : null}
              </div>
            ) : null}
          </div>
        </div>

        <footer className="docs-statusbar">
          <div>
            <span className="docs-status-language">
              <i className={metrics.purity === 100 ? "clean" : ""} />
              {activeDocument.script === "arabic"
                ? "Arabic-script Balochi"
                : "Latin-script Balochi"}
            </span>
            <span>{metrics.words} words</span>
            <span>{metrics.characters} characters</span>
            <span title="Saved in your browser">{storageLabel}</span>
            <span>{metrics.purity}% script purity</span>
            <span>~{metrics.readingMinutes} min</span>
          </div>
          <div>
            <button type="button" onClick={() => setShowSnapshots((value) => !value)}>
              Versions {activeDocument.snapshots.length ? `(${activeDocument.snapshots.length})` : ""}
            </button>
            <button type="button" onClick={duplicateDocument}>Duplicate</button>
            <button className="docs-danger" type="button" onClick={deleteDocument}>Delete</button>
          </div>
        </footer>
      </div>

      <button
        className={showKeyboard ? "docs-keyboard-fab active" : "docs-keyboard-fab"}
        type="button"
        onMouseDown={captureSelection}
        onClick={() => setShowKeyboard((value) => !value)}
        title="Balochi keyboard"
        aria-label="Open Balochi keyboard"
      >
        ⌨
      </button>

      {showKeyboard ? (
        <aside className="docs-floating-keyboard" aria-label="Balochi keyboard">
          <div className="docs-keyboard-head">
            <div>
              <strong>
                {activeDocument.script === "arabic"
                  ? "بلوچی Keyboard"
                  : "Balōčī Keyboard"}
              </strong>
              <span>
                {activeDocument.script === "arabic"
                  ? "Type with English keys — Zuban writes Balochi letters."
                  : "Roman Balochi with quick access to special letters."}
              </span>
            </div>
            <button type="button" onClick={() => setShowKeyboard(false)}>×</button>
          </div>

          {activeDocument.script === "arabic" ? (
            <>
              <div className="docs-keyboard-layouts">
                <button
                  className={keyboardLayout === "phonetic" ? "active" : ""}
                  type="button"
                  onClick={() => setKeyboardLayout("phonetic")}
                >
                  Phonetic QWERTY
                </button>
                <button
                  className={keyboardLayout === "traditional" ? "active" : ""}
                  type="button"
                  onClick={() => setKeyboardLayout("traditional")}
                >
                  Traditional
                </button>
              </div>
              <label className="docs-phonetic-toggle">
                <input
                  type="checkbox"
                  checked={phoneticTyping}
                  onChange={(event) => setPhoneticTyping(event.target.checked)}
                />
                <span>Use my physical English keyboard for Balochi</span>
              </label>
            </>
          ) : (
            <div className="docs-latin-specials">
              {latinCharacters.map((character) => (
                <button
                  key={character}
                  type="button"
                  onMouseDown={captureSelection}
                  onClick={() => insertCharacter(character)}
                >
                  {character}
                </button>
              ))}
            </div>
          )}

          <div className="docs-qwerty">
            {qwertyRows.map((row, rowIndex) => (
              <div className="docs-qwerty-row" key={rowIndex}>
                {row.map(({ key }) => {
                  const baseMap =
                    keyboardLayout === "traditional"
                      ? traditionalArabicMap
                      : arabicPhysicalMap;
                  const shiftMap =
                    keyboardLayout === "traditional"
                      ? traditionalArabicShiftMap
                      : arabicShiftMap;
                  const output =
                    activeDocument.script === "arabic"
                      ? keyboardShift
                        ? shiftMap[key] ?? baseMap[key] ?? key
                        : baseMap[key] ?? key
                      : keyboardShift
                        ? key.toUpperCase()
                        : key;

                  return (
                    <button
                      type="button"
                      key={key}
                      onMouseDown={captureSelection}
                      onClick={() => pressVirtualKey(key)}
                    >
                      <span>{output}</span>
                      <small>{key.toUpperCase()}</small>
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="docs-qwerty-row docs-qwerty-actions">
              <button
                className={keyboardShift ? "active wide" : "wide"}
                type="button"
                onClick={() => setKeyboardShift((value) => !value)}
              >
                ⇧ Shift
              </button>
              <button className="space" type="button" onClick={() => pressVirtualKey("SPACE")}>
                Space
              </button>
              <button className="wide" type="button" onClick={() => pressVirtualKey("BACKSPACE")}>
                ⌫
              </button>
              <button className="wide" type="button" onClick={() => pressVirtualKey("ENTER")}>
                ↵
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      {showCommandPalette ? (
        <div
          className="docs-command-backdrop"
          role="presentation"
          onMouseDown={() => setShowCommandPalette(false)}
        >
          <section
            className="docs-command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Zuban DocX commands"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="docs-command-search">
              <span>⌘</span>
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Type a command…"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredCommands[0]) {
                    event.preventDefault();
                    runCommand(filteredCommands[0].id);
                  }
                }}
              />
              <kbd>Esc</kbd>
            </div>
            <div className="docs-command-list">
              {filteredCommands.length ? (
                filteredCommands.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => runCommand(item.id)}
                  >
                    <span className="docs-command-icon">{item.icon}</span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p>No matching commands.</p>
              )}
            </div>
            <div className="docs-command-foot">
              <span>Enter to run first result</span>
              <span>Ctrl / ⌘ + K to open</span>
            </div>
          </section>
        </div>
      ) : null}

      {showOutline ? (
        <aside className="docs-tool-panel docs-outline-panel">
          <div className="docs-panel-head">
            <div>
              <strong>Document outline</strong>
              <span>Jump between titles and headings.</span>
            </div>
            <button type="button" onClick={() => setShowOutline(false)}>×</button>
          </div>

          <div className="docs-outline-summary">
            <span>{outlineItems.length} heading{outlineItems.length === 1 ? "" : "s"}</span>
            <span>{metrics.words} words</span>
          </div>

          <div className="docs-outline-list">
            {outlineItems.length ? (
              outlineItems.map((item, outlineIndex) => (
                <button
                  key={item.index + "-" + outlineIndex + "-" + item.text}
                  type="button"
                  data-level={item.level}
                  onClick={() => scrollToOutlineItem(item.index)}
                >
                  <small>H{item.level}</small>
                  <span>{item.text}</span>
                </button>
              ))
            ) : (
              <div className="docs-outline-empty">
                <strong>No headings yet</strong>
                <span>Use Title, Heading or Subheading to build an outline.</span>
              </div>
            )}
          </div>
        </aside>
      ) : null}

      {showFind ? (
        <aside className="docs-tool-panel docs-find-panel">
          <div className="docs-panel-head">
            <div>
              <strong>Find & Replace</strong>
              <span>Search inside this document.</span>
            </div>
            <button type="button" onClick={() => setShowFind(false)}>×</button>
          </div>
          <label>
            <span>Find</span>
            <input
              value={findText}
              onChange={(event) => {
                setFindText(event.target.value);
                setFindCursor(-1);
              }}
              placeholder="Text to find"
            />
          </label>
          <label>
            <span>Replace with</span>
            <input
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
              placeholder="Replacement text"
            />
          </label>
          <div className="docs-panel-actions">
            <button type="button" onClick={findNextOccurrence}>Find next</button>
            <button type="button" onClick={replaceCurrentMatch}>Replace</button>
            <button type="button" onClick={replaceAllMatches}>Replace all</button>
          </div>
        </aside>
      ) : null}

      {showPageSetup ? (
        <aside className="docs-tool-panel docs-page-panel">
          <div className="docs-panel-head">
            <div>
              <strong>Page setup</strong>
              <span>Size, margins, header and footer.</span>
            </div>
            <button type="button" onClick={() => setShowPageSetup(false)}>×</button>
          </div>

          <div className="docs-form-grid">
            <label>
              <span>Page size</span>
              <select
                value={activeDocument.pageSize ?? "a4"}
                onChange={(event) =>
                  updateActive({
                    pageSize: event.target.value as "a4" | "letter",
                  })
                }
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </label>
            <label>
              <span>Orientation</span>
              <select
                value={activeDocument.orientation ?? "portrait"}
                onChange={(event) =>
                  updateActive({
                    orientation: event.target.value as "portrait" | "landscape",
                  })
                }
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
            <label>
              <span>Margins</span>
              <select
                value={activeDocument.marginMm ?? 20}
                onChange={(event) =>
                  updateActive({ marginMm: Number(event.target.value) })
                }
              >
                <option value={10}>Narrow · 10 mm</option>
                <option value={15}>Compact · 15 mm</option>
                <option value={20}>Normal · 20 mm</option>
                <option value={25}>Wide · 25 mm</option>
                <option value={30}>Extra wide · 30 mm</option>
              </select>
            </label>
          </div>

          <label>
            <span>Header text</span>
            <input
              value={activeDocument.headerText ?? ""}
              onChange={(event) => updateActive({ headerText: event.target.value })}
              placeholder="Optional header"
            />
          </label>
          <label>
            <span>Footer text</span>
            <input
              value={activeDocument.footerText ?? ""}
              onChange={(event) => updateActive({ footerText: event.target.value })}
              placeholder="Optional footer"
            />
          </label>

          <label className="docs-check-row">
            <input
              type="checkbox"
              checked={Boolean(activeDocument.showPageNumbers)}
              onChange={(event) =>
                updateActive({ showPageNumbers: event.target.checked })
              }
            />
            <span>Show page numbers</span>
          </label>
          <label className="docs-check-row">
            <input
              type="checkbox"
              checked={Boolean(activeDocument.showDate)}
              onChange={(event) => updateActive({ showDate: event.target.checked })}
            />
            <span>Show date in header</span>
          </label>

          <div className="docs-panel-actions">
            <button type="button" onMouseDown={captureSelection} onClick={insertPageBreak}>
              Insert page break
            </button>
            <button type="button" onClick={() => window.print()}>
              Print / Save PDF
            </button>
          </div>
        </aside>
      ) : null}

      {showLanguageTools ? (
        <aside className="docs-tool-panel docs-language-panel">
          <div className="docs-panel-head">
            <div>
              <strong>Balochi tools</strong>
              <span>Work with the text you selected.</span>
            </div>
            <button type="button" onClick={() => setShowLanguageTools(false)}>×</button>
          </div>

          <div className="docs-language-actions">
            <button type="button" onMouseDown={captureSelection} onClick={lookupSelection}>
              Word meaning
            </button>
            <button
              type="button"
              onMouseDown={captureSelection}
              onClick={() => transliterateSelection("latin")}
            >
              Arabic → Roman
            </button>
            <button
              type="button"
              onMouseDown={captureSelection}
              onClick={() => transliterateSelection("arabic")}
            >
              Roman → Arabic
            </button>
            <button
              type="button"
              onMouseDown={captureSelection}
              onClick={() => translateSelection("English")}
            >
              Translate → English
            </button>
            <button
              type="button"
              onMouseDown={captureSelection}
              onClick={() => translateSelection("Balochi")}
            >
              Translate → Balochi
            </button>
            <button type="button" onClick={checkDocumentSpelling}>
              Check spelling
            </button>
          </div>

          <div className={toolBusy ? "docs-tool-result loading" : "docs-tool-result"}>
            <strong>{toolTitle}</strong>
            <p>{toolBody}</p>
            {toolReplacement ? (
              <button
                type="button"
                onMouseDown={captureSelection}
                onClick={() => replaceSelectedText(toolReplacement)}
              >
                Replace selected text
              </button>
            ) : null}
          </div>

          {spellIssues.length ? (
            <div className="docs-spell-list">
              {spellIssues.slice(0, 30).map((issue) => (
                <div key={issue.word}>
                  <strong>{issue.word}</strong>
                  {issue.suggestions.length ? (
                    <div>
                      {issue.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => replaceWordEverywhere(issue.word, suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span>No suggestion yet</span>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </aside>
      ) : null}

      {showInspector ? (
        <aside className="docs-inspector">
          <div className="docs-panel-head">
            <div>
              <strong>Writing inspector</strong>
              <span>Offline document analysis</span>
            </div>
            <button type="button" onClick={() => setShowInspector(false)}>×</button>
          </div>

          <div className="docs-purity-card">
            <div>
              <strong>{metrics.purity}%</strong>
              <span>script purity</span>
            </div>
            <div className="docs-purity-track">
              <i style={{ width: metrics.purity + "%" }} />
            </div>
            <p>
              {metrics.foreignLetters === 0
                ? "No mixed-script letters detected."
                : metrics.foreignLetters + " foreign-script letters detected."}
            </p>
          </div>

          <div className="docs-metric-grid">
            <div><strong>{metrics.words}</strong><span>Words</span></div>
            <div><strong>{metrics.uniqueWords}</strong><span>Unique</span></div>
            <div><strong>{metrics.sentenceCount}</strong><span>Sentences</span></div>
            <div><strong>{metrics.paragraphCount}</strong><span>Blocks</span></div>
          </div>

          <div className="docs-inspector-note">
            <strong>Script guidance</strong>
            <p>
              Arabic mode can reliably block Latin text. Latin Balochi shares
              the Latin alphabet with other languages, so this inspector checks
              script consistency rather than claiming perfect language detection.
            </p>
          </div>

          <div className="docs-document-meta">
            <span>Created</span>
            <strong>{new Date(activeDocument.createdAt).toLocaleString()}</strong>
            <span>Last edited</span>
            <strong>{new Date(activeDocument.updatedAt).toLocaleString()}</strong>
          </div>
        </aside>
      ) : null}

      {showSnapshots ? (
        <aside className="docs-version-panel">
          <div className="docs-version-head">
            <div>
              <strong>Document versions</strong>
              <span>Manual and automatic recovery points stored locally.</span>
            </div>
            <button type="button" onClick={() => setShowSnapshots(false)}>×</button>
          </div>
          <button className="button secondary" type="button" onClick={createSnapshot}>
            Save checkpoint
          </button>
          <div className="docs-version-list">
            {activeDocument.snapshots.length ? (
              activeDocument.snapshots.map((snapshot) => (
                <button
                  type="button"
                  key={snapshot.id}
                  onClick={() => restoreSnapshot(snapshot)}
                >
                  <div className="docs-version-meta">
                    <strong>{new Date(snapshot.createdAt).toLocaleString()}</strong>
                    <em>{snapshot.source === "auto" ? "Auto recovery" : "Manual"}</em>
                  </div>
                  <span>{stripHtml(snapshot.html).slice(0, 90) || "Empty snapshot"}</span>
                </button>
              ))
            ) : (
              <p>No versions yet. Manual checkpoints and automatic recovery points will appear here.</p>
            )}
          </div>
        </aside>
      ) : null}

      {showCreate ? (
        <div className="docs-modal-backdrop" role="presentation" onMouseDown={() => setShowCreate(false)}>
          <section className="docs-create-modal" role="dialog" aria-modal="true" aria-label="Create document" onMouseDown={(event) => event.stopPropagation()}>
            <div className="docs-panel-head">
              <div>
                <strong>Create Balochi document</strong>
                <span>Choose a script and starting structure.</span>
              </div>
              <button type="button" onClick={() => setShowCreate(false)}>×</button>
            </div>

            <div className="docs-create-script">
              <button
                type="button"
                className={newScript === "arabic" ? "active" : ""}
                onClick={() => setNewScript("arabic")}
              >
                <strong>بلوچی</strong>
                <span>Arabic script · RTL</span>
              </button>
              <button
                type="button"
                className={newScript === "latin" ? "active" : ""}
                onClick={() => setNewScript("latin")}
              >
                <strong>Balōčī</strong>
                <span>Latin script · LTR</span>
              </button>
            </div>

            <div className="docs-template-grid">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={newTemplate === template.id ? "active" : ""}
                  onClick={() => setNewTemplate(template.id)}
                >
                  <span className="docs-template-icon">
                    {templateIcon(template.id)}
                  </span>
                  <strong>{template.label}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>

            <div className="docs-modal-actions">
              <button className="button secondary" type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="button primary" type="button" onClick={() => createDocument()}>
                Create document
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showShortcuts ? (
        <div className="docs-modal-backdrop" role="presentation" onMouseDown={() => setShowShortcuts(false)}>
          <section className="docs-shortcuts-modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onMouseDown={(event) => event.stopPropagation()}>
            <div className="docs-panel-head">
              <div>
                <strong>Keyboard shortcuts</strong>
                <span>Faster writing without leaving the keyboard.</span>
              </div>
              <button type="button" onClick={() => setShowShortcuts(false)}>×</button>
            </div>
            <div className="docs-shortcut-list">
              <span>Commands</span><kbd>Ctrl / ⌘ + K</kbd>
              <span>Find & Replace</span><kbd>Ctrl / ⌘ + F</kbd>
              <span>Document outline</span><kbd>Ctrl / ⌘ + Shift + O</kbd>
              <span>Save now</span><kbd>Ctrl / ⌘ + S</kbd>
              <span>Save checkpoint</span><kbd>Ctrl / ⌘ + Shift + S</kbd>
              <span>Insert page break</span><kbd>Ctrl / ⌘ + Enter</kbd>
              <span>Bold</span><kbd>Ctrl / ⌘ + B</kbd>
              <span>Italic</span><kbd>Ctrl / ⌘ + I</kbd>
              <span>Underline</span><kbd>Ctrl / ⌘ + U</kbd>
              <span>Undo / Redo</span><kbd>Ctrl / ⌘ + Z / Y</kbd>
            </div>
          </section>
        </div>
      ) : null}

      {notice ? <div className="docs-toast">{notice}</div> : null}
    </section>
  );
}
