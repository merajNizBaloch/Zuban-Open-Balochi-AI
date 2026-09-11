import Link from "next/link";
import { SetupDashboard } from "@/components/setup-dashboard";

export default function SetupPage() {
  return (
    <section className="section setup-page">
      <div className="shell">
        <h1 className="page-title">Zubán setup.</h1>
        <p className="lead wide">
          Check what is actually connected on this deployment. Fallback services are shown separately from full model-backed features.
        </p>

        <SetupDashboard />

        <div className="setup-links">
          <Link href="/technology">Technology →</Link>
          <a
            href="https://github.com/merajNizBaloch/Zuban-Open-Balochi-AI"
            target="_blank"
            rel="noreferrer"
          >
            Repository ↗
          </a>
        </div>
      </div>
    </section>
  );
}
