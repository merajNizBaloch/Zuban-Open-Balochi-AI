"use client";

import Link from "next/link";
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
type TemplateId = "blank" | "essay" | "letter" | "story" | "notes" | "poem";

type Snapshot = {
  id: string;
  createdAt: number;
  html: string;
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
  const selectionRef = useRef<Range | null>(null);
  const [documents, setDocuments] = useState<ZubanDocument[]>([]);
  const [activeId, setActiveId] = useState("");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.75);
  const [guardMessage, setGuardMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [phoneticTyping, setPhoneticTyping] = useState(true);
  const [keyboardShift, setKeyboardShift] = useState(false);
  const [newScript, setNewScript] = useState<ScriptMode>("arabic");
  const [newTemplate, setNewTemplate] = useState<TemplateId>("blank");

  const activeDocument =
    documents.find((document) => document.id === activeId) ?? documents[0];

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      let nextDocuments: ZubanDocument[] = [];

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ZubanDocument[];
          if (Array.isArray(parsed)) nextDocuments = parsed;
        }
      } catch {
        nextDocuments = [];
      }

      if (!nextDocuments.length) nextDocuments = [makeDocument()];

      const storedActive = window.localStorage.getItem(ACTIVE_KEY);
      const nextActive =
        storedActive && nextDocuments.some((item) => item.id === storedActive)
          ? storedActive
          : nextDocuments[0].id;

      setDocuments(nextDocuments);
      setActiveId(nextActive);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
        window.localStorage.setItem(ACTIVE_KEY, activeId);
        setSaved(true);
      } catch {
        setSaved(false);
        setNotice("This document is getting too large to save here. Try a smaller image.");
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [documents, activeId, ready]);

  useEffect(() => {
    if (!editorRef.current || !activeDocument) return;
    editorRef.current.innerHTML = activeDocument.html;
  }, [activeDocument?.id]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return documents;

    return documents.filter((document) => {
      const haystack = document.title + " " + stripHtml(document.html);
      return haystack.toLocaleLowerCase().includes(query);
    });
  }, [documents, search]);

  const metrics = useMemo(
    () =>
      activeDocument
        ? documentMetrics(activeDocument.html, activeDocument.script)
        : documentMetrics("", "arabic"),
    [activeDocument],
  );

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    window.localStorage.setItem(ACTIVE_KEY, activeId);
    setSaved(true);
    setNotice("Document saved on this device.");
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
    updateActive({ html: event.currentTarget.innerHTML });
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
      const output =
        activeDocument.script === "arabic"
          ? keyboardShift
            ? arabicShiftMap[key] ?? arabicPhysicalMap[key] ?? key
            : arabicPhysicalMap[key] ?? key
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

  function chooseImage() {
    captureSelection();
    imageRef.current?.click();
  }

  async function insertImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file.");
      return;
    }

    if (file.size > 8_000_000) {
      setNotice("Please choose an image smaller than 8 MB.");
      return;
    }

    const source = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!source) {
      setNotice("I couldn’t add that image.");
      return;
    }

    const image = new Image();
    image.onload = () => {
      const maxWidth = 1400;
      const scale = Math.min(1, maxWidth / Math.max(1, image.width));
      const canvas = window.document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        setNotice("I couldn’t add that image.");
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/webp", 0.82);
      const safeAlt = escapeHtml(file.name.replace(/\.[^.]+$/, ""));

      restoreSelection();
      document.execCommand(
        "insertHTML",
        false,
        '<figure class="docs-inline-image"><img src="' +
          compressed +
          '" alt="' +
          safeAlt +
          '"><figcaption contenteditable="true">Add a caption…</figcaption></figure><p><br></p>',
      );

      captureSelection();
      if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
      setNotice("Image added.");
    };
    image.onerror = () => setNotice("I couldn’t add that image.");
    image.src = source;
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
    };

    updateActive({
      snapshots: [snapshot, ...activeDocument.snapshots].slice(0, 12),
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

  function exportDoc() {
    if (!activeDocument) return;
    const direction = activeDocument.script === "arabic" ? "rtl" : "ltr";
    const body = editorRef.current?.innerHTML ?? activeDocument.html;
    const file =
      "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" dir=\"" +
      direction +
      "\"><head><meta charset=\"utf-8\"><style>body{font-family:Arial,sans-serif;font-size:14pt;line-height:1.8}</style></head><body>" +
      body +
      "</body></html>";

    downloadFile(
      (activeDocument.title || "zuban-document") + ".doc",
      file,
      "application/msword;charset=utf-8",
    );
  }

  function exportLibraryBackup() {
    downloadFile(
      "zuban-docx-backup.json",
      JSON.stringify(
        {
          version: 1,
          lastDocumentUpdate: documents.reduce(
            (latest, document) => Math.max(latest, document.updatedAt),
            0,
          ),
          documents,
        },
        null,
        2,
      ),
      "application/json;charset=utf-8",
    );
    setNotice("Local library backup exported.");
  }

  function downloadFile(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = name.replace(/[\\/:*?\"<>|]/g, "-");
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 2_000_000) {
      setGuardMessage("Import is limited to 2 MB per document.");
      return;
    }

    const raw = await file.text();
    const htmlLike = /<\/?[a-z][\s\S]*>/i.test(raw);
    const text = htmlLike ? stripHtml(raw) : raw;
    const script = activeDocument?.script ?? "arabic";

    if (!scriptAllowed(text, script)) {
      setGuardMessage(
        "The imported file contains characters outside the current Balochi script mode. Change script mode or clean the file first.",
      );
      return;
    }

    const now = Date.now();
    const titleFromFile = file.name.replace(/\.(txt|html?|md)$/i, "") || "Imported document";
    const document: ZubanDocument = {
      id: makeId(),
      title: sanitizeForScript(titleFromFile, script) || (script === "arabic" ? "درآمد بوتگ دستاویز" : "Import botag dastāvēz"),
      html: htmlLike ? raw : textToHtml(raw),
      script,
      createdAt: now,
      updatedAt: now,
      snapshots: [],
      template: "blank",
    };

    setDocuments((current) => [document, ...current]);
    setActiveId(document.id);
    setSaved(false);
    setNotice("Document imported.");
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
      const mapped = event.shiftKey
        ? arabicShiftMap[key] ?? arabicPhysicalMap[key]
        : arabicPhysicalMap[key];

      if (mapped) {
        event.preventDefault();
        insertCharacter(mapped);
        return;
      }
    }

    if (!(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();

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
        accept=".txt,.md,.html,.htm,text/plain,text/html"
        onChange={importDocument}
      />

      <input
        ref={imageRef}
        className="docs-hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={insertImage}
      />

      <aside className="docs-sidebar">
        <div className="docs-sidebar-head">
          <Link href="/docs" className="docs-app-brand">
            <span>Z</span>
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

        <div className="docs-library">
          {filteredDocuments.map((document) => (
            <button
              className={
                document.id === activeDocument.id
                  ? "docs-library-item active"
                  : "docs-library-item"
              }
              key={document.id}
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
                <button type="button" onClick={exportDoc}>Word-compatible (.doc)</button>
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
          </div>
          <div className="docs-toolbar-group">
            <select
              value={lineHeight}
              aria-label="Line spacing"
              onChange={(event) => setLineHeight(Number(event.target.value))}
            >
              <option value={1.5}>1.5×</option>
              <option value={1.75}>1.75×</option>
              <option value={2}>2×</option>
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
        </div>

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
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            <div className="docs-page-ruler" aria-hidden="true">
              <span>0</span><i /><i /><i /><i /><span>8</span>
            </div>
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
              style={{ lineHeight, fontFamily: currentFont }}
              onInput={onEditorInput}
              onBeforeInput={onBeforeInput}
              onPaste={onPaste}
              onKeyDown={handleEditorKeyDown}
              onMouseUp={captureSelection}
              onKeyUp={captureSelection}
              onFocus={captureSelection}
            />
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
            <label className="docs-phonetic-toggle">
              <input
                type="checkbox"
                checked={phoneticTyping}
                onChange={(event) => setPhoneticTyping(event.target.checked)}
              />
              <span>Use my physical English keyboard for Balochi</span>
            </label>
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
                  const output =
                    activeDocument.script === "arabic"
                      ? keyboardShift
                        ? arabicShiftMap[key] ?? arabicPhysicalMap[key] ?? key
                        : arabicPhysicalMap[key] ?? key
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
              <span>Manual checkpoints stored locally.</span>
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
                  <strong>{new Date(snapshot.createdAt).toLocaleString()}</strong>
                  <span>{stripHtml(snapshot.html).slice(0, 90) || "Empty snapshot"}</span>
                </button>
              ))
            ) : (
              <p>No checkpoints yet. Save one before a major edit.</p>
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
                    {template.id === "blank" ? "□" :
                      template.id === "essay" ? "¶" :
                      template.id === "letter" ? "✉" :
                      template.id === "story" ? "◈" :
                      template.id === "notes" ? "≡" : "❧"}
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
              <span>Save now</span><kbd>Ctrl / ⌘ + S</kbd>
              <span>Save checkpoint</span><kbd>Ctrl / ⌘ + Shift + S</kbd>
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
