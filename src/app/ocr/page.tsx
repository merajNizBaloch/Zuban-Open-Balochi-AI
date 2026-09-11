import { MediaWorkbench } from "@/components/media-workbench";
import { UiText } from "@/components/ui-text";

export default function OcrPage() {
  return (
    <section className="section tool-page ocr-page">
      <div className="shell narrow">
        <div className="page-intro-center compact-page-intro">
          <p className="eyebrow"><UiText id="page.ocr.eyebrow" fallback="OCR" /></p>
          <h1><UiText id="page.ocr.title" fallback="Read Balochi from images." /></h1>
          <p className="lead"><UiText id="page.ocr.lead" fallback="Upload a clear image of printed Balochi and convert it into editable text." /></p>
        </div>
        <MediaWorkbench mode="ocr" />
      </div>
    </section>
  );
}
