import * as pdfjsLib from "pdfjs-dist";

// Use the local worker file copied to public/ (avoids CDN version mismatch)
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

type TextItem = {
  str: string;
  transform: number[]; // [scaleX, skewX, skewY, scaleY, translateX, translateY]
  width: number;
  height: number;
  hasEOL?: boolean;
};

/**
 * Extract text content from a PDF file using pdfjs-dist (client-side).
 *
 * Uses the position data (transform matrix) of each text item to
 * reconstruct line breaks. Items on the same Y-position (within
 * tolerance) are placed on the same line; a significant Y-change
 * inserts a newline.
 *
 * For multi-column layouts (e.g. Modern template), the text is
 * grouped by Y-position so sidebar and main-content text on the
 * same vertical row appear on the same line, but different rows
 * get proper line breaks.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Filter to items with actual text content
    const items = (content.items as TextItem[]).filter(
      (item) => item.str !== undefined
    );

    if (items.length === 0) {
      textParts.push("");
      continue;
    }

    // Group items into lines by their Y-position
    // In PDF coordinates, Y goes up (higher Y = higher on page)
    // The transform matrix is [scaleX, skewX, skewY, scaleY, tx, ty]
    // ty (transform[5]) is the Y-position
    const LINE_TOLERANCE = 3; // pixels tolerance for same-line grouping

    type LineGroup = { y: number; items: { x: number; str: string }[] };
    const lineGroups: LineGroup[] = [];

    for (const item of items) {
      const y = item.transform[5];
      const x = item.transform[4];
      const str = item.str;

      // Find an existing line group within tolerance
      let found = false;
      for (const group of lineGroups) {
        if (Math.abs(group.y - y) <= LINE_TOLERANCE) {
          group.items.push({ x, str });
          found = true;
          break;
        }
      }

      if (!found) {
        lineGroups.push({ y, items: [{ x, str }] });
      }
    }

    // Sort lines top-to-bottom (higher Y = higher on page, so descending Y)
    lineGroups.sort((a, b) => b.y - a.y);

    // Within each line, sort items left-to-right (ascending X)
    const pageLines: string[] = [];
    for (const group of lineGroups) {
      group.items.sort((a, b) => a.x - b.x);
      const lineText = group.items.map((item) => item.str).join(" ").trim();
      if (lineText) {
        pageLines.push(lineText);
      }
    }

    textParts.push(pageLines.join("\n"));
  }

  return textParts.join("\n");
}
