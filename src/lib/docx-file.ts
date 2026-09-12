"use client";

export type DocxPageSettings = {
  title: string;
  script: "arabic" | "latin";
  fontFamily?: string;
  pageSize: "a4" | "letter";
  orientation: "portrait" | "landscape";
  marginMm: number;
  headerText?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  showDate?: boolean;
};

function mmToTwip(mm: number) {
  return Math.round(mm * 56.692913);
}

function pageDimensions(pageSize: "a4" | "letter") {
  return pageSize === "letter"
    ? { width: 12240, height: 15840 }
    : { width: 11906, height: 16838 };
}

function dataUrlToBytes(url: string) {
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return { mime: match[1], bytes };
}

function imageTypeFromMime(mime: string) {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("bmp")) return "bmp";
  if (mime.includes("svg")) return "svg";
  return "png";
}

function cleanColor(value: string) {
  const match = value.match(/#([0-9a-f]{6})/i);
  return match?.[1]?.toUpperCase();
}

function numericFontSize(styleValue: string) {
  const px = Number.parseFloat(styleValue);
  if (!Number.isFinite(px)) return undefined;
  return Math.max(8, Math.min(72, Math.round(px * 0.75 * 2)));
}

export async function createDocxBlob(
  html: string,
  settings: DocxPageSettings,
): Promise<Blob> {
  const d = (await import("docx")) as any;
  const parser = new DOMParser();
  const documentHtml = parser.parseFromString(
    '<div id="zuban-docx-root">' + html + "</div>",
    "text/html",
  );
  const root = documentHtml.querySelector("#zuban-docx-root");
  const rtl = settings.script === "arabic";

  function inlineRuns(node: Node, inherited: Record<string, unknown> = {}): any[] {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text) return [];
      return [
        new d.TextRun({
          text,
          rightToLeft: rtl,
          ...inherited,
        }),
      ];
    }

    if (!(node instanceof HTMLElement)) return [];

    const tag = node.tagName.toLowerCase();
    if (tag === "br") {
      return [new d.TextRun({ break: 1, rightToLeft: rtl, ...inherited })];
    }

    const next = { ...inherited } as Record<string, unknown>;
    if (tag === "b" || tag === "strong") next.bold = true;
    if (tag === "i" || tag === "em") next.italics = true;
    if (tag === "u") next.underline = {};
    if (tag === "s" || tag === "strike") next.strike = true;

    const color = cleanColor(node.style.color);
    const highlight = cleanColor(node.style.backgroundColor);
    const size = numericFontSize(node.style.fontSize);
    if (color) next.color = color;
    if (highlight) next.highlight = highlight;
    if (size) next.size = size;

    return Array.from(node.childNodes).flatMap((child) => inlineRuns(child, next));
  }

  function paragraphFromElement(element: HTMLElement, forcedText?: string) {
    const tag = element.tagName.toLowerCase();
    const alignValue = element.style.textAlign;
    const alignment =
      alignValue === "center"
        ? d.AlignmentType.CENTER
        : alignValue === "right"
          ? d.AlignmentType.RIGHT
          : alignValue === "justify"
            ? d.AlignmentType.JUSTIFIED
            : d.AlignmentType.LEFT;

    const heading =
      tag === "h1"
        ? d.HeadingLevel.HEADING_1
        : tag === "h2"
          ? d.HeadingLevel.HEADING_2
          : tag === "h3"
            ? d.HeadingLevel.HEADING_3
            : undefined;

    const children = forcedText
      ? [new d.TextRun({ text: forcedText, rightToLeft: rtl })]
      : inlineRuns(element);

    return new d.Paragraph({
      children: children.length
        ? children
        : [new d.TextRun({ text: "", rightToLeft: rtl })],
      heading,
      alignment,
      bidirectional: rtl,
      spacing: {
        after: 160,
        line: 300,
      },
      indent: {
        left: Number.parseInt(element.style.marginLeft || "0", 10) * 15 || undefined,
        right: Number.parseInt(element.style.marginRight || "0", 10) * 15 || undefined,
      },
    });
  }

  function tableFromElement(table: HTMLTableElement) {
    const rows = Array.from(table.rows).map(
      (row) =>
        new d.TableRow({
          children: Array.from(row.cells).map(
            (cell) =>
              new d.TableCell({
                children: [
                  new d.Paragraph({
                    children: inlineRuns(cell),
                    bidirectional: rtl,
                    alignment: rtl ? d.AlignmentType.RIGHT : d.AlignmentType.LEFT,
                  }),
                ],
              }),
          ),
        }),
    );

    return new d.Table({
      rows,
      width: { size: 100, type: d.WidthType.PERCENTAGE },
      borders: table.dataset.borderless === "true"
        ? {
            top: { style: d.BorderStyle.NONE },
            bottom: { style: d.BorderStyle.NONE },
            left: { style: d.BorderStyle.NONE },
            right: { style: d.BorderStyle.NONE },
            insideHorizontal: { style: d.BorderStyle.NONE },
            insideVertical: { style: d.BorderStyle.NONE },
          }
        : undefined,
    });
  }

  function imageParagraph(image: HTMLImageElement) {
    const decoded = dataUrlToBytes(image.src);
    if (!decoded) {
      return new d.Paragraph({ text: image.alt || "" });
    }

    const width = Number.parseInt(image.style.width || "", 10) || 520;
    const height = Math.round(width * 0.62);

    return new d.Paragraph({
      alignment:
        image.dataset.align === "left"
          ? d.AlignmentType.LEFT
          : image.dataset.align === "right"
            ? d.AlignmentType.RIGHT
            : d.AlignmentType.CENTER,
      children: [
        new d.ImageRun({
          data: decoded.bytes,
          type: imageTypeFromMime(decoded.mime),
          transformation: {
            width: Math.max(120, Math.min(640, width)),
            height: Math.max(80, Math.min(500, height)),
          },
        }),
      ],
    });
  }

  const children: any[] = [];

  if (root) {
    for (const node of Array.from(root.children)) {
      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();

      if (element.classList.contains("docs-page-break")) {
        children.push(new d.Paragraph({ children: [new d.PageBreak()] }));
        continue;
      }

      if (tag === "table") {
        children.push(tableFromElement(element as HTMLTableElement));
        continue;
      }

      if (tag === "figure") {
        const image = element.querySelector("img");
        const caption = element.querySelector("figcaption")?.textContent?.trim();
        if (image) children.push(imageParagraph(image));
        if (caption) {
          children.push(
            new d.Paragraph({
              alignment: d.AlignmentType.CENTER,
              children: [new d.TextRun({ text: caption, italics: true, size: 18 })],
            }),
          );
        }
        continue;
      }

      if (tag === "ul" || tag === "ol") {
        for (const item of Array.from(element.querySelectorAll(":scope > li"))) {
          children.push(
            new d.Paragraph({
              children: inlineRuns(item),
              bidirectional: rtl,
              bullet: tag === "ul" ? { level: 0 } : undefined,
              numbering: tag === "ol" ? { reference: "zuban-numbering", level: 0 } : undefined,
            }),
          );
        }
        continue;
      }

      children.push(paragraphFromElement(element));
    }
  }

  const size = pageDimensions(settings.pageSize);
  const landscape = settings.orientation === "landscape";
  const pageWidth = landscape ? size.height : size.width;
  const pageHeight = landscape ? size.width : size.height;
  const margin = mmToTwip(settings.marginMm);

  const headerRuns: any[] = [];
  if (settings.headerText) {
    headerRuns.push(new d.TextRun({ text: settings.headerText, rightToLeft: rtl }));
  }
  if (settings.showDate) {
    if (headerRuns.length) headerRuns.push(new d.TextRun({ text: " · " }));
    headerRuns.push(new d.TextRun({ text: new Date().toLocaleDateString(), rightToLeft: rtl }));
  }

  const footerRuns: any[] = [];
  if (settings.footerText) {
    footerRuns.push(new d.TextRun({ text: settings.footerText, rightToLeft: rtl }));
  }
  if (settings.showPageNumbers) {
    if (footerRuns.length) footerRuns.push(new d.TextRun({ text: " · " }));
    footerRuns.push(
      new d.TextRun({
        children: ["Page ", d.PageNumber.CURRENT, " of ", d.PageNumber.TOTAL_PAGES],
      }),
    );
  }

  const doc = new d.Document({
    numbering: {
      config: [
        {
          reference: "zuban-numbering",
          levels: [
            {
              level: 0,
              format: d.LevelFormat.DECIMAL,
              text: "%1.",
              alignment: rtl ? d.AlignmentType.RIGHT : d.AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: {
            font: settings.fontFamily?.split(",")[0]?.replace(/["']/g, "").trim() || "Arial",
            size: 24,
            rightToLeft: rtl,
          },
          paragraph: {
            bidirectional: rtl,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageWidth,
              height: pageHeight,
              orientation: landscape
                ? d.PageOrientation.LANDSCAPE
                : d.PageOrientation.PORTRAIT,
            },
            margin: {
              top: margin,
              bottom: margin,
              left: margin,
              right: margin,
            },
          },
        },
        headers: headerRuns.length
          ? {
              default: new d.Header({
                children: [
                  new d.Paragraph({
                    children: headerRuns,
                    alignment: rtl ? d.AlignmentType.RIGHT : d.AlignmentType.LEFT,
                    bidirectional: rtl,
                  }),
                ],
              }),
            }
          : undefined,
        footers: footerRuns.length
          ? {
              default: new d.Footer({
                children: [
                  new d.Paragraph({
                    children: footerRuns,
                    alignment: d.AlignmentType.CENTER,
                  }),
                ],
              }),
            }
          : undefined,
        children,
      },
    ],
  });

  return d.Packer.toBlob(doc);
}

export async function importDocxToHtml(arrayBuffer: ArrayBuffer) {
  const mammoth = (await import("mammoth")) as any;

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement(async (image: any) => {
        const base64 = await image.read("base64");
        return {
          src: "data:" + image.contentType + ";base64," + base64,
        };
      }),
    },
  );

  const parser = new DOMParser();
  const parsed = parser.parseFromString(result.value || "", "text/html");

  parsed.querySelectorAll("script,iframe,object,embed,link,style").forEach((node) => node.remove());
  parsed.querySelectorAll("*").forEach((node) => {
    for (const attr of Array.from(node.attributes)) {
      if (attr.name.toLowerCase().startsWith("on")) node.removeAttribute(attr.name);
      if (
        (attr.name === "href" || attr.name === "src") &&
        /^javascript:/i.test(attr.value)
      ) {
        node.removeAttribute(attr.name);
      }
    }
  });

  return {
    html: parsed.body.innerHTML || "<p></p>",
    messages: result.messages ?? [],
  };
}
