import { MediaWorkbench } from "@/components/media-workbench";

export default function OcrPage() {
  return (
    <section className="section tool-page">
      <div className="shell narrow">
        <h1>Read Balochi from images.</h1>
        <p className="lead">Upload a clear image of printed Balochi and convert it into editable text.</p>
        <MediaWorkbench mode="ocr" />
      </div>
    </section>
  );
}
