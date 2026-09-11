import Link from "next/link";
import { UiText } from "@/components/ui-text";

export default function NotFound() {
  return (
    <section className="section">
      <div className="shell narrow not-found">
        <span>404</span>
        <h1><UiText id="notfound.title" fallback="Page not found." /></h1>
        <p><UiText id="notfound.body" fallback="The page may have moved or may not exist yet." /></p>
        <div>
          <Link className="button primary" href="/"><UiText id="notfound.home" fallback="Go home" /></Link>
          <Link className="button secondary" href="/chat"><UiText id="notfound.chat" fallback="Open Zubán Chat" /></Link>
        </div>
      </div>
    </section>
  );
}
