"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { githubUrl, primaryNav } from "@/lib/site";
import { ZubanLogo } from "@/components/zuban-logo";
import { useExperience } from "@/components/experience-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { language, setLanguage, theme, toggleTheme, t } = useExperience();

  const navLabels: Record<string, string> = {
    "/chat": t("nav.chat", "Chat"),
    "/translate": t("nav.translate", "Translate"),
    "/dictionary": t("nav.dictionary", "Dictionary"),
    "/language": t("nav.language", "Language"),
    "/docs": t("nav.docs", "Docs"),
    "/community": t("nav.community", "Community"),
    "/research": t("nav.research", "Research"),
  };

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand brand-logo-link" href="/" aria-label="Zubán home">
          <ZubanLogo className="brand-logo" width={48} height={48} priority />
          <span className="brand-word">Zubán</span>
        </Link>

        <nav className="main-nav desktop-nav" aria-label="Primary navigation">
          {primaryNav.map((item) => (
            <Link className={pathname === item.href ? "active" : ""} key={item.href} href={item.href}>
              {navLabels[item.href] ?? item.label}
            </Link>
          ))}
        </nav>

        <div className="experience-controls" aria-label="Display preferences">
          <button
            className="theme-switch"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Use Makran Night mode" : "Use light mode"}
            title={theme === "light" ? "Makran Night" : "Light"}
          >
            <span className="theme-orbit" aria-hidden="true"><i /></span>
          </button>
          <button
            className="language-switch"
            type="button"
            onClick={() => setLanguage(language === "en" ? "bal" : "en")}
            aria-label={language === "en" ? "View website in Balochi" : "View website in English"}
          >
            {language === "en" ? "بلوچی" : "EN"}
          </button>
        </div>

        <a className="github-link" href={githubUrl} target="_blank" rel="noreferrer">
          {t("nav.github", "GitHub")} ↗
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? t("nav.closeMenu", "Close menu") : t("nav.openMenu", "Open menu")}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-navigation" className={open ? "mobile-navigation open" : "mobile-navigation"}>
        <nav className="shell" aria-label="Mobile navigation">
          {primaryNav.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {navLabels[item.href] ?? item.label}
              <span>↗</span>
            </Link>
          ))}
          <div className="mobile-experience-controls">
            <button type="button" onClick={toggleTheme}>
              {theme === "light" ? t("nav.makran", "Makran Night") : t("nav.light", "Light")}
            </button>
            <button type="button" onClick={() => setLanguage(language === "en" ? "bal" : "en")}>
              {language === "en" ? "بلوچی" : t("nav.english", "English")}
            </button>
          </div>
          <a href={githubUrl} target="_blank" rel="noreferrer">
            {t("nav.github", "GitHub")}
            <span>↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
