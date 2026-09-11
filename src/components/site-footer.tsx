import Link from "next/link";
import { githubUrl } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="culture-band" aria-hidden="true" />
      <div className="shell footer-grid">
        <div>
          <p className="eyebrow">ZUBÁN / OPEN BALOCHI AI</p>
          <h2>Language technology should belong to its speakers.</h2>
        </div>
        <div className="footer-links">
          <Link href="/contribute">Contribute</Link>
          <Link href="/research">Research</Link>
          <Link href="/datasets">Datasets</Link>
          <a href={githubUrl} target="_blank" rel="noreferrer">Source code ↗</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>Free · Open source · Community built</span>
        <span>Alpha 0.1</span>
      </div>
    </footer>
  );
}
