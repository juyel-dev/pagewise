import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { candidateNumbers, extractPrintedLabels, type PageText } from "../page-map";
import { readPageTexts, type PdfDocLike } from "../extract";

const page = (pdfPage: number, items: { str: string; y: number }[]): PageText => ({
  pdfPage, width: 612, height: 800, items: items.map((i) => ({ ...i, x: 50 })),
});

describe("printed page labels", () => {
  it("reads numbers only from the header/footer band (including BIOLOGY 74 style running heads)", () => {
    expect(candidateNumbers(page(1, [{ str: "73", y: 40 }, { str: "12", y: 400 }, { str: "BIOLOGY 74", y: 30 }]))).toEqual([73, 74]);
  });

  it("finds a constant offset, fills gaps as inferred and flags disagreements", () => {
    const r = extractPrintedLabels([
      page(1, [{ str: "71", y: 30 }]),
      page(2, [{ str: "72", y: 30 }]),
      page(3, []),
      page(4, [{ str: "99", y: 30 }]),
      page(5, [{ str: "75", y: 30 }]),
    ]);
    expect(r.offset).toBe(70);
    expect(r.labels.map((l) => [l.label, l.confidence])).toEqual([
      ["71", "high"], ["72", "high"], ["73", "inferred"], ["74", "review"], ["75", "high"],
    ]);
  });

  it("returns review labels when nothing can be read", () => {
    const r = extractPrintedLabels([page(1, [])]);
    expect(r.offset).toBeNull();
    expect(r.labels[0].confidence).toBe("review");
  });

  const file = "private-content/class11-bio-ch6.pdf";
  it.skipIf(!existsSync(file))("maps the real Class 11 Biology Ch.6 PDF to printed pages 71-78", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = (await pdfjs.getDocument({ data: new Uint8Array(readFileSync(file)), useSystemFonts: true, isEvalSupported: false }).promise) as PdfDocLike;
    const r = extractPrintedLabels(await readPageTexts(doc));
    expect(r.labels.map((l) => l.label)).toEqual(["71", "72", "73", "74", "75", "76", "77", "78"]);
    expect(r.offset).toBe(70);
    console.log("real PDF agreement:", r.agreement, r.labels.map((l) => `${l.pdfPage}:${l.label}:${l.confidence}`).join(" "));
  }, 30000);
});
