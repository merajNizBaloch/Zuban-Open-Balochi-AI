import Image from "next/image";
import Link from "next/link";
import { githubUrl, primaryNav } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand brand-logo-link" href="/" aria-label="Zubán home">
          <Image
            className="brand-logo"
            src="/zuban-mark.webp"
            alt="Zubán"
            width={512}
            height={512}
            priority
          />
        </Link>

        <nav className="main-nav" aria-label="Primary navigation">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>

        <a className="github-link" href={githubUrl} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>
    </header>
  );
}
