import Link from "next/link";
import { SetupDashboard } from "@/components/setup-dashboard";
import { UiText } from "@/components/ui-text";

export default function SetupPage() {
  return (
    <section className="section setup-page">
      <div className="shell">
        <h1 className="page-title"><UiText id="page.setup.title" fallback="Zubán setup." /></h1>
        <p className="lead wide"><UiText id="setup.lead" fallback="Check what is actually connected on this deployment. Fallback services are shown separately from full model-backed features." /></p>

        <SetupDashboard />

        <div className="setup-links">
          <Link href="/technology"><UiText id="setup.technology" fallback="Technology →" /></Link>
          <a
            href="https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI"
            target="_blank"
            rel="noreferrer"
          >
            <UiText id="setup.repository" fallback="Repository ↗" />
          </a>
        </div>
      </div>
    </section>
  );
}
