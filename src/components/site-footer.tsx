import Link from "next/link";
import { githubUrl } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer simple-footer">
      <div className="culture-band" aria-hidden="true" />
      <div className="shell footer-simple">
        <div className="footer-brand">
          <strong>Zubán</strong>
          <span>Open tools for the Balochi language.</span>
        </div>
        <div className="footer-links">
          <Link href="/research">Research</Link>
          <Link href="/datasets">Datasets</Link>
          <Link href="/contribute">Contribute</Link>
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </div>
    </footer>
  );
}
