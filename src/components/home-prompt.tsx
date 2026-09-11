"use client";

import { FormEvent, useState } from "react";
import { useExperience } from "@/components/experience-provider";
import { useRouter } from "next/navigation";

export function HomePrompt() {
  const [value, setValue] = useState("");
  const { t } = useExperience();
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = value.trim();
    if (!prompt) return;

    router.push("/chat?prompt=" + encodeURIComponent(prompt));
  }

  return (
    <form className="home-prompt" onSubmit={submit}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("home.ask", "Ask something in Balochi…")}
        aria-label={t("home.ask", "Ask Zubán")}
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
