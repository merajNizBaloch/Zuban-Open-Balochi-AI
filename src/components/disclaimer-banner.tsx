"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useExperience } from "@/components/experience-provider";

const STORAGE_KEY = "zuban-disclaimer-dismissed-v1";

export function DisclaimerBanner() {
  const { t } = useExperience();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        setVisible(window.localStorage.getItem(STORAGE_KEY) !== "true");
      } catch {
        setVisible(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    setVisible(false);

    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Dismissal can remain session-only when storage is unavailable.
    }
  }

  if (!visible) return null;

  return (
    <aside className="disclaimer-banner" aria-label={t("disclaimer.banner.label", "Project disclaimer")}>
      <div className="shell disclaimer-banner-inner">
        <p>
          <span>{t("disclaimer.banner.text", "Zubán is built from publicly available Balochi data and open resources. Balochi’s digital resources are still developing, so mistakes can occur.")}</span>
          {" "}
          <Link href="/disclaimer">{t("disclaimer.banner.link", "Read disclaimer")} →</Link>
        </p>

        <button
          type="button"
          className="disclaimer-banner-close"
          onClick={dismiss}
          aria-label={t("disclaimer.banner.close", "Close disclaimer")}
          title={t("disclaimer.banner.close", "Close disclaimer")}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </aside>
  );
}
