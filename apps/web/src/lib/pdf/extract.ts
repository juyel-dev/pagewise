import type { PageText } from "./page-map";

/** Minimal structural type so the same code runs with the browser build and the node legacy build of PDF.js. */
export type PdfDocLike = {
  numPages: number;
  getPage(n: number): Promise<{
    getViewport(o: { scale: number }): { width: number; height: number };
    getTextContent(): Promise<{ items: unknown[] }>;
  }>;
};

export async function readPageTexts(doc: PdfDocLike): Promise<PageText[]> {
  const out: PageText[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const { width, height } = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    const items = tc.items
      .filter((it): it is { str: string; transform: number[] } => {
        const t = it as { str?: unknown; transform?: unknown };
        return typeof t.str === "string" && Array.isArray(t.transform);
      })
      .map((it) => ({ str: it.str, x: it.transform[4], y: height - it.transform[5] }));
    out.push({ pdfPage: i, width, height, items });
  }
  return out;
}
