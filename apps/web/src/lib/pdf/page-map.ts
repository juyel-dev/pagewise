/**
 * Printed-page-number extraction (blueprint 09 §4).
 * Pure functions: the browser/node caller supplies text items with y measured from the TOP of the page (pt).
 */
export type TextItem = { str: string; x: number; y: number };
export type PageText = { pdfPage: number; width: number; height: number; items: TextItem[] };
export type LabelConfidence = "high" | "inferred" | "review";
export type PageLabel = { pdfPage: number; label: string; confidence: LabelConfidence };
export type PageMapResult = { labels: PageLabel[]; offset: number | null; agreement: number };

const BAND = 0.14; // header/footer band as a fraction of page height

export function candidateNumbers(p: PageText): number[] {
  const out: number[] = [];
  for (const it of p.items) {
    const s = it.str.trim();
    if (!s) continue;
    const inBand = it.y <= p.height * BAND || it.y >= p.height * (1 - BAND);
    if (!inBand) continue;
    const m =
      s.match(/^(\d{1,4})$/) ??
      s.match(/^[A-Z][A-Z ]{5,}\s+(\d{1,4})$/) ??
      s.match(/^(\d{1,4})\s+[A-Z][A-Z ]{3,}$/);
    if (m) out.push(parseInt(m[1], 10));
  }
  return out;
}

/** Infers one constant offset (printed = pdfPage + offset) by majority vote, then flags disagreements for human review. */
export function extractPrintedLabels(pages: PageText[]): PageMapResult {
  const found = pages.map((p) => ({ pdfPage: p.pdfPage, nums: candidateNumbers(p) }));
  const votes = new Map<number, number>();
  for (const f of found) for (const n of new Set(f.nums)) votes.set(n - f.pdfPage, (votes.get(n - f.pdfPage) ?? 0) + 1);
  let offset: number | null = null;
  let best = 0;
  for (const [o, c] of votes) if (c > best) { best = c; offset = o; }
  if (offset === null) {
    return { labels: pages.map((p) => ({ pdfPage: p.pdfPage, label: "?", confidence: "review" as const })), offset: null, agreement: 0 };
  }
  let agree = 0;
  const labels = found.map((f): PageLabel => {
    const expected = f.pdfPage + offset!;
    if (f.nums.includes(expected)) { agree++; return { pdfPage: f.pdfPage, label: String(expected), confidence: "high" }; }
    if (f.nums.length === 0) return { pdfPage: f.pdfPage, label: String(expected), confidence: "inferred" };
    return { pdfPage: f.pdfPage, label: String(expected), confidence: "review" };
  });
  return { labels, offset, agreement: pages.length ? agree / pages.length : 0 };
}
