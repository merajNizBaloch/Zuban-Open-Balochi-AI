"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ScriptMode = "arabic" | "latin";

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
};

const STORAGE_KEY = "zuban-docs-v1";
const ACTIVE_KEY = "zuban-docs-active-v1";

const arabicCharacters = [
  "ا", "آ", "ء", "ب", "پ", "ت", "ٹ", "ج", "چ", "د", "ڈ", "ر", "ڑ",
  "ز", "ژ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک",
  "گ", "ل", "م", "ن", "ں", "و", "ؤ", "ہ", "ھ", "ی", "ے",
];

const latinCharacters = [
  "ā", "ē", "ī", "ō", "ū", "š", "ž", "ṭ", "ḍ", "ṛ", "ŋ", "č", "ǰ",
];

const blankArabic =
  "<h1>نوکیں دستاویز</h1><p>اِدا بلوچیءَ بنویس…</p>";
const blankLatin =
  "<h1>Nōkēn dastāvēz</h1><p>Ēdā Balōčīyā benawīs…</p>";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeDocument(script: ScriptMode = "arabic"): ZubanDocument {
  const now = Date.now();
  return {
    id: makeId(),
    title: script === "arabic" ? "نوکیں دستاویز" : "Nōkēn dastāvēz",
    html: script === "arabic" ? blankArabic : blankLatin,
    script,
    createdAt: now,
    updatedAt: now,
    snapshots: [],
  };
}

function stripHtml(value: string) {
  return value
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ZubanDocsEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState<ZubanDocument[]>([]);
  const [activeId, setActiveId] = useState("");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.75);
  const [guardMessage, setGuardMessage] = useState("");
  const [showSnapshots, setShowSnapshots] = useState(false);

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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      window.localStorage.setItem(ACTIVE_KEY, activeId);
      setSaved(true);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [documents, activeId, ready]);

  useEffect(() => {
    if (!editorRef.current || !activeDocument) return;
    editorRef.current.innerHTML = activeDocument.html;
  }, [activeDocument?.id]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return documents;

    return documents.filter((document) => {
      const haystack =
        document.title + " " + stripHtml(document.html);
      return haystack.toLocaleLowerCase().includes(query);
    });
  }, [documents, search]);

  const plainText = activeDocument ? stripHtml(activeDocument.html) : "";
  const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const characters = plainText.length;
  const readingMinutes = Math.max(1, Math.ceil(words / 180));
  const charactersForMode =
    activeDocument?.script === "latin" ? latinCharacters : arabicCharacters;

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

  function createDocument(script: ScriptMode = activeDocument?.script ?? "arabic") {
    const document = makeDocument(script);
    setDocuments((current) => [document, ...current]);
    setActiveId(document.id);
    setSaved(false);
    setGuardMessage("");
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
  }

  function deleteDocument() {
    if (!activeDocument) return;

    if (documents.length === 1) {
      const replacement = makeDocument(activeDocument.script);
      setDocuments([replacement]);
      setActiveId(replacement.id);
      return;
    }

    const remaining = documents.filter(
      (document) => document.id !== activeDocument.id,
    );
    setDocuments(remaining);
    setActiveId(remaining[0].id);
    setSaved(false);
  }

  function switchScript(script: ScriptMode) {
    if (!activeDocument || activeDocument.script === script) return;

    const currentText = editorRef.current?.innerText.trim() ?? "";
    if (currentText && !scriptAllowed(currentText, script)) {
      setGuardMessage(
        script === "arabic"
          ? "This document contains Latin text. Remove or convert it before switching to Arabic script."
          : "This document contains Arabic-script text. Remove or convert it before switching to Latin script.",
      );
      return;
    }

    setGuardMessage("");
    updateActive({ script });
  }

  function onEditorInput(event: FormEvent<HTMLDivElement>) {
    const html = event.currentTarget.innerHTML;
    updateActive({ html });
    setGuardMessage("");
  }

  function onBeforeInput(event: FormEvent<HTMLDivElement>) {
    if (!activeDocument) return;

    const inputEvent = event.nativeEvent as InputEvent;
    if (!inputEvent.data) return;

    if (!scriptAllowed(inputEvent.data, activeDocument.script)) {
      event.preventDefault();
      setGuardMessage(
        activeDocument.script === "arabic"
          ? "Arabic-script Balochi mode is active. Latin letters were blocked."
          : "Latin-script Balochi mode is active. Arabic-script characters were blocked.",
      );
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    if (!activeDocument) return;
    event.preventDefault();

    const pasted = event.clipboardData.getData("text/plain");
    const clean = sanitizeForScript(pasted, activeDocument.script);

    if (clean !== pasted) {
      setGuardMessage(
        "Mixed-script characters were removed from the pasted text.",
      );
    }

    document.execCommand("insertText", false, clean);
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    if (editorRef.current) {
      updateActive({ html: editorRef.current.innerHTML });
    }
  }

  function insertCharacter(character: string) {
    editorRef.current?.focus();
    document.execCommand("insertText", false, character);
    if (editorRef.current) {
      updateActive({ html: editorRef.current.innerHTML });
    }
  }

  function titleChange(value: string) {
    if (!activeDocument) return;
    const clean = sanitizeForScript(value, activeDocument.script);
    if (clean !== value) {
      setGuardMessage("Document titles follow the selected Balochi script.");
    }
    updateActive({ title: clean });
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
  }

  function restoreSnapshot(snapshot: Snapshot) {
    if (!activeDocument) return;
    updateActive({ html: snapshot.html });
    if (editorRef.current) editorRef.current.innerHTML = snapshot.html;
    setShowSnapshots(false);
  }

  function exportTxt() {
    if (!activeDocument) return;
    const text = editorRef.current?.innerText ?? plainText;
    downloadFile(
      (activeDocument.title || "zuban-document") + ".txt",
      text,
      "text/plain;charset=utf-8",
    );
  }

  function exportHtml() {
    if (!activeDocument) return;
    const direction = activeDocument.script === "arabic" ? "rtl" : "ltr";
    const language = "bal";
    const body = editorRef.current?.innerHTML ?? activeDocument.html;
    const file =
      "<!doctype html><html lang=\"" +
      language +
      "\" dir=\"" +
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

  function downloadFile(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = name.replace(/[\\/:*?\"<>|]/g, "-");
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      setSaved(true);
    }
  }

  if (!ready || !activeDocument) {
    return (
      <section className="docs-editor-loading">
        <span className="pulse" />
        Loading Zuban Docs…
      </section>
    );
  }

  return (
    <section
      className={focusMode ? "docs-app docs-focus" : "docs-app"}
      data-script={activeDocument.script}
    >
      <aside className="docs-sidebar">
        <div className="docs-sidebar-head">
          <Link href="/docs" className="docs-app-brand">
            <span>Z</span>
            <div>
              <strong>Zuban Docs</strong>
              <small>بلوچی نویسگ</small>
            </div>
          </Link>
          <button
            className="docs-icon-button"
            type="button"
            onClick={() => createDocument()}
            title="New document"
          >
            +
          </button>
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
        </div>

        <div className="docs-sidebar-foot">
          <span>{documents.length} local document{documents.length === 1 ? "" : "s"}</span>
          <small>Stored on this device</small>
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
              {saved ? "Saved locally" : "Saving…"}
            </span>
          </div>

          <div className="docs-top-actions">
            <button type="button" onClick={createSnapshot}>Checkpoint</button>
            <button type="button" onClick={() => setFocusMode((value) => !value)}>
              {focusMode ? "Exit focus" : "Focus"}
            </button>
            <button type="button" onClick={() => window.print()}>Print</button>
            <details className="docs-export-menu">
              <summary>Export</summary>
              <div>
                <button type="button" onClick={exportTxt}>Plain text (.txt)</button>
                <button type="button" onClick={exportHtml}>Web document (.html)</button>
              </div>
            </details>
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
            <button type="button" onClick={() => command("bold")}><b>B</b></button>
            <button type="button" onClick={() => command("italic")}><i>I</i></button>
            <button type="button" onClick={() => command("underline")}><u>U</u></button>
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

        <div className="docs-character-bar">
          <span>
            {activeDocument.script === "arabic"
              ? "Balochi character palette"
              : "Latin Balochi character palette"}
          </span>
          <div>
            {charactersForMode.map((character) => (
              <button
                key={character}
                type="button"
                onClick={() => insertCharacter(character)}
              >
                {character}
              </button>
            ))}
          </div>
        </div>

        {guardMessage ? (
          <div className="docs-guard-message">
            <strong>Script guard</strong>
            <span>{guardMessage}</span>
            <button type="button" onClick={() => setGuardMessage("")}>×</button>
          </div>
        ) : null}

        <div className="docs-canvas-wrap">
          <div
            className="docs-paper"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
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
              style={{ lineHeight }}
              onInput={onEditorInput}
              onBeforeInput={onBeforeInput}
              onPaste={onPaste}
              onKeyDown={handleEditorKeyDown}
            />
          </div>
        </div>

        <footer className="docs-statusbar">
          <div>
            <span>
              {activeDocument.script === "arabic"
                ? "Arabic-script Balochi"
                : "Latin-script Balochi"}
            </span>
            <span>{words} words</span>
            <span>{characters} characters</span>
            <span>~{readingMinutes} min read</span>
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
              <p>No checkpoints yet.</p>
            )}
          </div>
        </aside>
      ) : null}
    </section>
  );
}
