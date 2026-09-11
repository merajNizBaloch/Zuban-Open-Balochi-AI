import Link from "next/link";

export default function OcrPage() {
  return <section className="section tool-page"><div className="shell narrow">
    <div className="tool-page-head"><div><p className="eyebrow">ZUBÁN / OCR</p><h1>Bring printed Balochi into searchable text.</h1></div><span className="status-chip">Lab</span></div>
    <p className="lead">The OCR lab will target printed pages, archival material and clear document images. We will benchmark character and word error rates before release claims.</p>
    <div className="upload-zone"><div className="upload-symbol">▧</div><h2>Image-to-text workspace</h2><p>OCR model adapter and licensed evaluation set are the next implementation step.</p><button className="button secondary" disabled>Upload disabled in alpha</button></div>
    <div className="system-note">Have access to reusable printed Balochi material or an OCR dataset? <Link href="/contribute">Contribute the source and license →</Link></div>
  </div></section>;
}
