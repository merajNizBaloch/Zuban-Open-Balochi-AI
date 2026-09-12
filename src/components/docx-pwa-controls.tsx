"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function DocxPwaControls() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [online, setOnline] = useState(true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/docx-sw.js", { scope: "/" });
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  return (
    <div className="docs-pwa-controls">
      <span className={online ? "online" : "offline"}>
        {online ? "Online" : "Offline"}
      </span>
      {!installed && installPrompt ? (
        <button type="button" onClick={install}>
          Install DocX
        </button>
      ) : null}
      {installed ? <span>Installed</span> : null}
    </div>
  );
}
