import { MediaWorkbench } from "@/components/media-workbench";

export default function OcrPage() {
  return <section className="section tool-page"><div className="shell narrow">
    <div className="tool-page-head"><div><p className="eyebrow">ZUBÁN / OCR</p><h1>Bring printed Balochi into searchable text.</h1></div><span className="status-chip">Lab</span></div>
    <p className="lead">Upload a clear document image and send it through the configured open OCR adapter. Zubán will benchmark character and word error rates before recommending a production model.</p>
    <MediaWorkbench mode="ocr" />
  </div></section>;
}
