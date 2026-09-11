"use client";

import { FormEvent, useState } from "react";

export function HomePrompt() {
  const [value, setValue] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = value.trim();
    if (!prompt) return;

    window.location.href = "/chat?prompt=" + encodeURIComponent(prompt);
  }

  return (
    <form className="home-prompt" onSubmit={submit}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask something in Balochi…"
        aria-label="Ask Zubán"
        dir="auto"
      />
      <button type="submit" disabled={!value.trim()} aria-label="Open in Zubán Chat">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
        </svg>
      </button>
    </form>
  );
}
