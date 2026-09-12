import Link from "next/link";
import { githubUrl } from "@/lib/site";
import { ZubanLogo } from "@/components/zuban-logo";
import { UiText } from "@/components/ui-text";

export function SiteFooter() {
  return (
    <footer className="site-footer simple-footer">
      <div className="culture-band" aria-hidden="true" />
      <div className="shell footer-simple">
        <div className="footer-brand">
          <ZubanLogo className="footer-logo" width={72} height={72} />
          <div>
            <strong>Zubán</strong>
            <span><UiText id="footer.tagline" fallback="Open Balochi language technology." /></span>
          </div>
        </div>

        <div className="footer-links">
          <Link href="/docs">Zuban Docs</Link>
          <Link href="/language"><UiText id="footer.language" fallback="Language Lab" /></Link>
          <Link href="/community"><UiText id="footer.community" fallback="Community" /></Link>
          <Link href="/datasets"><UiText id="footer.datasets" fallback="Datasets" /></Link>
          <Link href="/developers"><UiText id="footer.developers" fallback="Developers" /></Link>
          <Link href="/roadmap"><UiText id="footer.roadmap" fallback="Roadmap" /></Link>
          <Link href="/disclaimer"><UiText id="footer.disclaimer" fallback="Disclaimer" /></Link>
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </div>
    </footer>
  );
}
