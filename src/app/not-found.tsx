import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="shell narrow not-found">
        <span>404</span>
        <h1>Page not found.</h1>
        <p>The page may have moved or may not exist yet.</p>
        <div>
          <Link className="button primary" href="/">Go home</Link>
          <Link className="button secondary" href="/chat">Open Zubán Chat</Link>
        </div>
      </div>
    </section>
  );
}
