import Link from "next/link";
import { githubUrl } from "@/lib/site";
import { ZubanLogo } from "@/components/zuban-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer simple-footer">
      <div className="culture-band" aria-hidden="true" />
      <div className="shell footer-simple">
        <div className="footer-brand">
          <ZubanLogo className="footer-logo" width={72} height={72} />
          <div>
            <strong>Zubán</strong>
            <span>Open Balochi language technology.</span>
          </div>
        </div>

        <div className="footer-links">
          <Link href="/language">Language Lab</Link>
          <Link href="/community">Community</Link>
          <Link href="/datasets">Datasets</Link>
          <Link href="/developers">Developers</Link>
          <Link href="/roadmap">Roadmap</Link>
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </div>
    </footer>
  );
}
