import { MediaWorkbench } from "@/components/media-workbench";

export default function OcrPage() {
  return (
    <section className="section tool-page ocr-page">
      <div className="shell narrow">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow">OCR</p>
          <h1>Read Balochi from images.</h1>
          <p className="lead">Upload a clear image of printed Balochi and convert it into editable text.</p>
        </div>
        <MediaWorkbench mode="ocr" />
      </div>
    </section>
  );
}
