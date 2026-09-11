import Link from "next/link";
import { githubUrl } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer simple-footer">
      <div className="culture-band" aria-hidden="true" />
      <div className="shell footer-simple">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="footer-logo"
            src="/zuban-mark.png?v=1"
            alt=""
            width="72"
            height="72"
          />
          <div>
            <strong>Zubán</strong>
            <span>Open Balochi language technology.</span>
          </div>
        </div>

        <div className="footer-links">
          <Link href="/language">Language Lab</Link>
          <Link href="/community">Community</Link>
          <Link href="/datasets">Datasets</Link>
          <Link href="/technology">Technology</Link>
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </div>
    </footer>
  );
}
