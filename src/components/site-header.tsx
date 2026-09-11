import Image from "next/image";
import Link from "next/link";
import { githubUrl, primaryNav } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Zubán home">
          <Image src="/zuban-mark.svg" alt="" width={30} height={30} />
          <span>Zubán</span>
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
