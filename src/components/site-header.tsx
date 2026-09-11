"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { githubUrl, primaryNav } from "@/lib/site";
import { ZubanLogo } from "@/components/zuban-logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
              {item.label}
            </Link>
          ))}
        </nav>

        <a className="github-link" href={githubUrl} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
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
              {item.label}
              <span>↗</span>
            </Link>
          ))}
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
            <span>↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
