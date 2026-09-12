import Link from "next/link";
import { SetupDashboard } from "@/components/setup-dashboard";
import { UiText } from "@/components/ui-text";

export default function SetupPage() {
  return (
    <section className="section setup-page">
      <div className="shell">
        <h1 className="page-title"><UiText id="page.setup.title" fallback="What's ready." /></h1>
        <p className="lead wide"><UiText id="setup.lead" fallback="See which Zubán features are ready to use right now." /></p>

        <SetupDashboard />

        <div className="setup-links">
          <Link href="/technology"><UiText id="setup.technology" fallback="How Zubán works →" /></Link>
          <a
            href="https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI"
            target="_blank"
            rel="noreferrer"
          >
            <UiText id="setup.repository" fallback="View the project ↗" />
          </a>
        </div>
      </div>
    </section>
  );
}
