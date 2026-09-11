"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

type ApiResult = {
  configured?: boolean;
  output?: string;
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
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      window.localStorage.setItem("zuban-chat-v1", JSON.stringify(messages.slice(-40)));
    } catch {
      // Chat still works when local storage is unavailable.
    }
  }, [messages, hydrated]);

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

    try {
      const response = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          input: trimmed,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as ApiResult;

      if (data.output) {
        setMessages((current) => [
          ...current,
          { id: messageId(), role: "assistant", content: data.output as string },
        ]);
      } else {
        const text = data.message || data.error || "Zubán could not answer that message.";

        setMessages((current) => [
          ...current,
          { id: messageId(), role: "assistant", content: text, error: true },
        ]);
      }
    } catch {
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
      setLoading(false);
    }
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zuban-mark.webp?v=4" alt="" width="30" height="30" />
          <span>Zubán Chat</span>
        </div>
        {messages.length > 0 && (
          <button className="new-chat-button" type="button" onClick={newChat}>
            <span aria-hidden="true">＋</span>
            New chat
          </button>
        )}
      </div>

      <div className="chat-scroll-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="chat-empty-logo" src="/zuban-mark.webp?v=4" alt="Zubán" width="92" height="92" />
            <h1>How can Zubán help?</h1>
            <p>Ask in Balochi, English, Urdu or Persian.</p>

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
              <article className={"chat-message " + message.role} key={message.id}>
                {message.role === "assistant" && (
                  <div className="assistant-avatar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/zuban-mark.webp?v=4" alt="" width="30" height="30" />
                  </div>
                )}

                <div className="chat-message-content">
                  <div
                    className={message.error ? "chat-bubble error" : "chat-bubble"}
                    dir="auto"
                    lang="bal"
                  >
                    {message.content}
                  </div>

                  {message.role === "assistant" && !message.error && (
                    <button
                      className="message-action"
                      type="button"
                      onClick={() => void copyMessage(message.content)}
                    >
                      Copy
                    </button>
                  )}
                </div>
              </article>
            ))}

            {loading && (
              <article className="chat-message assistant">
                <div className="assistant-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/zuban-mark.webp?v=4" alt="" width="30" height="30" />
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
            placeholder="Message Zubán"
            aria-label="Message Zubán"
            dir="auto"
          />

          <div className="chat-composer-bottom">
            <span className="composer-hint">Shift + Enter for new line</span>
            <button
              className="chat-send-button"
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
              </svg>
            </button>
          </div>
        </form>
        <p className="chat-disclaimer">
          Zubán can make mistakes. Check important language and dialect-specific information.
        </p>
      </div>
    </div>
  );
}
