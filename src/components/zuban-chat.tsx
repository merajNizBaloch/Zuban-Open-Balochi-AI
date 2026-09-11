"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ZubanLogo } from "@/components/zuban-logo";
import { browserAiStream, isMissingServerModelMessage, stopBrowserAiGeneration } from "@/lib/browser-ai";
import { useExperience } from "@/components/experience-provider";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

type Dialect = "auto" | "western" | "southern" | "eastern";
type ScriptPreference = "auto" | "arabic" | "latin";

type ApiError = {
  message?: string;
  error?: string;
};

const suggestions = [
  "What does آپ mean?",
  "What does دوست mean?",
  "Translate water into Balochi",
  "Write a short greeting in Balochi",
];

function messageId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ZubanChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { t } = useExperience();
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState<Dialect>("auto");
  const [scriptPreference, setScriptPreference] =
    useState<ScriptPreference>("auto");
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamTextRef = useRef("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        const saved = window.localStorage.getItem("zuban-chat-v1");
        if (saved) {
          const parsed = JSON.parse(saved) as ChatMessage[];
          if (Array.isArray(parsed)) setMessages(parsed.slice(-40));
        }

        const initialPrompt = new URLSearchParams(window.location.search).get("prompt");
        if (initialPrompt && initialPrompt.trim()) {
          setInput(initialPrompt.slice(0, 12000));
        }

        const preferences = window.localStorage.getItem("zuban-chat-preferences-v1");
        if (preferences) {
          const parsed = JSON.parse(preferences) as {
            dialect?: Dialect;
            scriptPreference?: ScriptPreference;
          };

          if (parsed.dialect) setDialect(parsed.dialect);
          if (parsed.scriptPreference) setScriptPreference(parsed.scriptPreference);
        }
      } catch {
        // Ignore unavailable or malformed local storage.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        "zuban-chat-v1",
        JSON.stringify(messages.slice(-40)),
      );
    } catch {
      // Chat still works when local storage is unavailable.
    }
  }, [messages, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        "zuban-chat-preferences-v1",
        JSON.stringify({ dialect, scriptPreference }),
      );
    } catch {
      // Preferences are optional.
    }
  }, [dialect, scriptPreference, hydrated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 180) + "px";
  }, [input]);

  async function sendPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: messageId(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStreamingId("");
    cancelledRef.current = false;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          input: trimmed,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          dialect,
          scriptPreference,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok || contentType.includes("application/json")) {
        const data = (await response.json()) as ApiError;
        const serverMessage =
          data.message ||
          data.error ||
          "Zubán could not answer that message.";

        if (isMissingServerModelMessage(serverMessage)) {
          const assistantId = messageId();
          setStreamingId(assistantId);
          setMessages((current) => [
            ...current,
            { id: assistantId, role: "assistant", content: "" },
          ]);

          const system = [
            "You are Zubán, a Balochi language assistant.",
            "Help with Balochi writing, translation, language learning, and everyday questions.",
            "Respect dialect and orthographic variation. Do not present one regional form as universally correct.",
            "If you are uncertain about a Balochi word or grammar point, say so instead of inventing it.",
            dialect === "auto"
              ? "Dialect preference: auto."
              : "Dialect preference: " + dialect + ".",
            scriptPreference === "auto"
              ? "Script preference: follow the user's script when possible."
              : "Use " + scriptPreference + " script for Balochi unless the user asks otherwise.",
          ].join("\n");

          try {
            await browserAiStream(
              [
                { role: "system", content: system },
                ...nextMessages.slice(-16).map(({ role, content }) => ({ role, content })),
              ],
              (streamedText) => {
                if (cancelledRef.current) return;
                setMessages((current) =>
                  current.map((message) =>
                    message.id === assistantId
                      ? { ...message, content: streamedText }
                      : message,
                  ),
                );
              },
              {
                temperature: 0.25,
                maxTokens: 1200,
                onProgress: ({ progress, text }) => {
                  if (cancelledRef.current) return;
                  const percent = Math.round(progress * 100);
                  setMessages((current) =>
                    current.map((message) =>
                      message.id === assistantId
                        ? {
                            ...message,
                            content:
                              "Preparing private on-device AI… " +
                              (percent > 0 ? percent + "%\n" : "") +
                              text,
                          }
                        : message,
                    ),
                  );
                },
              },
            );
          } catch (browserError) {
            const detail =
              browserError instanceof Error
                ? browserError.message
                : "Browser AI is unavailable.";

            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content:
                        "Zubán could not start local AI. " +
                        detail +
                        " No login is required. On-device AI needs WebGPU and enough browser memory.",
                      error: true,
                    }
                  : message,
              ),
            );
          }

          return;
        }

        setMessages((current) => [
          ...current,
          {
            id: messageId(),
            role: "assistant",
            content: serverMessage,
            error: true,
          },
        ]);
        return;
      }

      if (!response.body) {
        throw new Error("The response stream is unavailable.");
      }

      const assistantId = messageId();
      streamTextRef.current = "";

      setStreamingId(assistantId);
      setMessages((current) => [
        ...current,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamTextRef.current += chunk;
        const streamedText = streamTextRef.current;

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: streamedText }
              : message,
          ),
        );
      }

      const tail = decoder.decode();
      if (tail) {
        streamTextRef.current += tail;
        const finalText = streamTextRef.current;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: finalText }
              : message,
          ),
        );
      }

      if (!streamTextRef.current.trim()) {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: "The model returned an empty response.",
                  error: true,
                }
              : message,
          ),
        );
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: "The chat service could not be reached. Please try again.",
          error: true,
        },
      ]);
    } finally {
      abortRef.current = null;
      setStreamingId("");
      setLoading(false);
    }
  }

  function stopGeneration() {
    cancelledRef.current = true;
    abortRef.current?.abort();
    stopBrowserAiGeneration();
    setStreamingId("");
    setLoading(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendPrompt(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (input.trim() && !loading) void sendPrompt(input);
    }
  }

  function newChat() {
    abortRef.current?.abort();
    stopBrowserAiGeneration();
    setMessages([]);
    setInput("");

    try {
      window.localStorage.removeItem("zuban-chat-v1");
    } catch {
      // Ignore unavailable local storage.
    }

    textareaRef.current?.focus();
  }

  async function copyMessage(content: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Clipboard access can be unavailable in some browsers.
    }
  }

  return (
    <div className="zuban-chat">
      <div className="chat-topbar">
        <div className="chat-title">
          <ZubanLogo width={30} height={30} />
          <span>{t("nav.chat", "Zubán Chat")}</span>
        </div>

        {messages.length > 0 && (
          <button className="new-chat-button" type="button" onClick={newChat}>
            <span aria-hidden="true">＋</span>
            {t("tool.chat.new", "New chat")}
          </button>
        )}
      </div>

      <div className="chat-scroll-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <ZubanLogo
              className="chat-empty-logo"
              alt="Zubán"
              width={92}
              height={92}
              priority
            />
            <h1>{t("tool.chat.title", "How can Zubán help?")}</h1>
            <p>{t("tool.chat.subtitle", "Ask in Balochi, English, Urdu or Persian.")}</p>

            <div className="chat-suggestions">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendPrompt(suggestion)}
                  disabled={loading}
                >
                  <span>{suggestion}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-thread">
            {messages.map((message) => (
              <article
                className={"chat-message " + message.role}
                key={message.id}
              >
                {message.role === "assistant" && (
                  <div className="assistant-avatar">
                    <ZubanLogo width={30} height={30} />
                  </div>
                )}

                <div className="chat-message-content">
                  <div
                    className={message.error ? "chat-bubble error" : "chat-bubble"}
                    dir="auto"
                    lang="bal"
                  >
                    {message.content ||
                      (message.id === streamingId ? "…" : "")}
                  </div>

                  {message.role === "assistant" &&
                    !message.error &&
                    message.content && (
                      <button
                        className="message-action"
                        type="button"
                        onClick={() => void copyMessage(message.content)}
                      >
                        {t("tool.chat.copy", "Copy")}
                      </button>
                    )}
                </div>
              </article>
            ))}

            {loading && !streamingId && (
              <article className="chat-message assistant">
                <div className="assistant-avatar">
                  <ZubanLogo width={30} height={30} />
                </div>
                <div className="chat-thinking" aria-label="Zubán is thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="chat-composer-wrap">
        <form className="chat-composer" onSubmit={submit}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("tool.chat.placeholder", "Message Zubán")}
            aria-label="Message Zubán"
            dir="auto"
          />

          <div className="chat-composer-bottom">
            <div className="chat-preferences">
              <label>
                <span>{t("tool.chat.dialect", "Dialect")}</span>
                <select
                  value={dialect}
                  onChange={(event) => setDialect(event.target.value as Dialect)}
                  aria-label="Preferred Balochi dialect"
                >
                  <option value="auto">{t("tool.chat.auto", "Auto")}</option>
                  <option value="western">{t("tool.chat.western", "Western")}</option>
                  <option value="southern">{t("tool.chat.southern", "Southern")}</option>
                  <option value="eastern">{t("tool.chat.eastern", "Eastern")}</option>
                </select>
              </label>

              <label>
                <span>{t("tool.chat.script", "Script")}</span>
                <select
                  value={scriptPreference}
                  onChange={(event) =>
                    setScriptPreference(event.target.value as ScriptPreference)
                  }
                  aria-label="Preferred Balochi script"
                >
                  <option value="auto">Auto</option>
                  <option value="arabic">{t("tool.chat.arabic", "Arabic")}</option>
                  <option value="latin">{t("tool.chat.latin", "Latin")}</option>
                </select>
              </label>
            </div>

            {loading ? (
              <button
                className="chat-send-button stop"
                type="button"
                onClick={stopGeneration}
                aria-label="Stop generation"
              >
                <span className="stop-generation-icon" />
              </button>
            ) : (
              <button
                className="chat-send-button"
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
                </svg>
              </button>
            )}
          </div>
        </form>

        <p className="chat-disclaimer">
          {t("tool.chat.disclaimer", "Zubán can make mistakes. Check important language and dialect-specific information.")}
        </p>
      </div>
    </div>
  );
}
