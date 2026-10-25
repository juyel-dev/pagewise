"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PdfViewer, type PageMetric, type PageSize, type PdfViewerHandle } from "../viewer/pdf-viewer";
import { extractPrintedLabels, type PageLabel } from "../../lib/pdf/page-map";
import { readPageTexts } from "../../lib/pdf/extract";
import { CH6_QUESTIONS, type SampleQuestion } from "../../lib/fixtures/ch6-sample";

type Answer = { chosen: number; checked: boolean };
const btn = "inline-flex items-center rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:bg-surface-2 disabled:opacity-50";
const btnPrimary = "inline-flex items-center rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50";

export function ViewerLab() {
  const viewer = useRef<PdfViewerHandle>(null);
  const [data, setData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [labels, setLabels] = useState<PageLabel[]>([]);
  const [offset, setOffset] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [practicePage, setPracticePage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dark, setDark] = useState(false);
  const [follow, setFollow] = useState(false);
  const [swap, setSwap] = useState(false);
  const [showViewer, setShowViewer] = useState(true);
  const [metrics, setMetrics] = useState<Record<number, number>>({});
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [jump, setJump] = useState("");

  const labelOf = useCallback((p: number) => labels.find((l) => l.pdfPage === p)?.label ?? String(p), [labels]);
  const byPage = useMemo(() => {
    const m = new Map<number, SampleQuestion[]>();
    for (const q of CH6_QUESTIONS) m.set(q.pdfPage, [...(m.get(q.pdfPage) ?? []), q]);
    return m;
  }, []);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setError(""); setMetrics({}); setLog([]); setLabels([]); setPracticePage(null);
    setFileName(f.name);
    setData(await f.arrayBuffer());
  }

  const onReady = useCallback(async ({ doc }: { doc: PDFDocumentProxy; sizes: PageSize[] }) => {
    setNumPages(doc.numPages); setPage(1);
    const r = extractPrintedLabels(await readPageTexts(doc));
    setLabels(r.labels); setOffset(r.offset);
  }, []);

  const onPageChange = useCallback((p: number, source: "scroll" | "jump") => {
    setPage(p);
    setLog((l) => [`${new Date().toLocaleTimeString()}  page ${p}  (${source})`, ...l].slice(0, 8));
  }, []);
  const onMetric = useCallback((m: PageMetric) => setMetrics((x) => ({ ...x, [m.page]: m.ms })), []);

  // optional "follow my reading": switch questions after the page has been stable for 1.5 s
  useEffect(() => {
    if (!follow) return;
    const t = setTimeout(() => setPracticePage(page), 1500);
    return () => clearTimeout(t);
  }, [follow, page]);

  // keyboard: P practise, V toggle viewer, [ ] previous/next page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select")) return;
      if (e.key === "p" || e.key === "P") setPracticePage(page);
      else if (e.key === "v" || e.key === "V") setShowViewer((s) => !s);
      else if (e.key === "[") viewer.current?.scrollToPage(page - 1);
      else if (e.key === "]") viewer.current?.scrollToPage(page + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page]);

  const qs = practicePage ? byPage.get(practicePage) ?? [] : [];
  const here = byPage.get(page)?.length ?? 0;
  const nextWithQ = [...byPage.keys()].filter((p) => p > page).sort((a, b) => a - b)[0];
  const slow = Object.entries(metrics).sort((a, b) => b[1] - a[1])[0];

  function goPrinted() {
    const hit = labels.find((l) => l.label === jump.trim());
    if (hit) viewer.current?.scrollToPage(hit.pdfPage);
  }

  const questions = (
    <section aria-label="Practice" className="flex h-full min-h-0 flex-col overflow-auto bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary} onClick={() => setPracticePage(page)} disabled={!numPages || here === 0}>
          Practice this page · {here} {here === 1 ? "question" : "questions"}
        </button>
        {numPages > 0 && here === 0 && nextWithQ && (
          <button className={btn} onClick={() => viewer.current?.scrollToPage(nextWithQ)}>Go to next page with questions</button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted" aria-live="polite">Reading: PDF page {page} · printed page {labelOf(page)}</p>

      {practicePage && (
        <div className="mt-4 space-y-4">
          <h2 className="text-sm font-semibold text-ink-2">Questions for printed page {labelOf(practicePage)}</h2>
          {qs.length === 0 && <p className="text-sm text-muted">No questions on this page.</p>}
          {qs.map((q, qi) => {
            const a = answers[q.id];
            return (
              <article key={q.id} className="rounded-xl border border-line p-4">
                <p className="text-sm font-medium text-ink">{qi + 1}. {q.stem}</p>
                <div role="radiogroup" aria-label={`Options for question ${qi + 1}`} className="mt-3 space-y-2">
                  {q.options.map((o, oi) => {
                    const picked = a?.chosen === oi;
                    const state = a?.checked ? (oi === q.answer ? "border-good bg-good-soft" : picked ? "border-bad bg-bad-soft" : "border-line") : picked ? "border-brand bg-brand-soft" : "border-line";
                    return (
                      <button key={oi} role="radio" aria-checked={picked} disabled={a?.checked}
                        onClick={() => setAnswers((x) => ({ ...x, [q.id]: { chosen: oi, checked: false } }))}
                        className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${state}`}>
                        <span className="mr-2 font-medium">{"ABCD"[oi]}.</span>{o}
                        {a?.checked && oi === q.answer && <span className="ml-2 text-good"> ✓ correct</span>}
                        {a?.checked && picked && oi !== q.answer && <span className="ml-2 text-bad"> ✗ your answer</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {!a?.checked && <button className={btn} disabled={a === undefined} onClick={() => setAnswers((x) => ({ ...x, [q.id]: { ...x[q.id], checked: true } }))}>Check</button>}
                  {a?.checked && <button className={btn} onClick={() => viewer.current?.scrollToPage(q.pdfPage, true)}>See source page</button>}
                </div>
                {a?.checked && <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm text-ink-2">{q.explanation}</p>}
              </article>
            );
          })}
        </div>
      )}

      <details className="mt-6 text-xs text-muted">
        <summary className="cursor-pointer font-medium text-ink-2">Spike metrics</summary>
        <p className="mt-2">Offset (printed − PDF): {offset ?? "?"} · slowest page: {slow ? `PDF ${slow[0]} (${slow[1]} ms)` : "—"}</p>
        <table className="mt-2 w-full text-left"><thead><tr><th>PDF</th><th>Printed</th><th>Confidence</th><th>Render ms</th></tr></thead>
          <tbody>{labels.map((l) => (
            <tr key={l.pdfPage}><td>{l.pdfPage}</td><td>{l.label}</td><td>{l.confidence}</td>
              <td className={(metrics[l.pdfPage] ?? 0) > 300 ? "font-semibold text-accent-text" : ""}>{metrics[l.pdfPage] ?? "—"}</td></tr>))}</tbody></table>
        <p className="mt-3 font-medium text-ink-2">Detection log</p>
        <ul className="mt-1 font-mono">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
      </details>
    </section>
  );

  const viewerPane = (
    <div className="h-full min-h-0">
      <PdfViewer ref={viewer} data={data} zoom={zoom} darkPages={dark} onPageChange={onPageChange} onReady={onReady} onMetric={onMetric} onError={setError} />
    </div>
  );

  return (
    <main className="flex h-dvh flex-col bg-canvas text-ink">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <strong className="mr-2 text-sm">Viewer lab</strong>
        <label className={`${btn} cursor-pointer`}>Open chapter PDF
          <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <span className="max-w-[16rem] truncate text-xs text-muted">{fileName || "Nothing opened. The file stays in your browser."}</span>
        <span className="mx-1 h-5 w-px bg-line" />
        <button className={btn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">−</button>
        <span className="w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
        <button className={btn} onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">+</button>
        <button className={btn} onClick={() => setZoom(1)}>Fit width</button>
        <button className={btn} onClick={() => viewer.current?.scrollToPage(page - 1)} disabled={page <= 1}>‹</button>
        <span className="text-xs">PDF {page}/{numPages || "–"} · printed {labelOf(page)}</span>
        <button className={btn} onClick={() => viewer.current?.scrollToPage(page + 1)} disabled={page >= numPages}>›</button>
        <input value={jump} onChange={(e) => setJump(e.target.value)} onKeyDown={(e) => e.key === "Enter" && goPrinted()}
          inputMode="numeric" aria-label="Go to printed page" placeholder="Go to printed page" className="w-36 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs" />
        <span className="mx-1 h-5 w-px bg-line" />
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />Follow my reading</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />Dark pages</label>
        <button className={btn} onClick={() => setSwap((s) => !s)}>Swap sides</button>
        <button className={btn} onClick={() => setShowViewer((s) => !s)}>{showViewer ? "Hide" : "Show"} viewer (V)</button>
      </header>
      {error && <p role="alert" className="bg-bad-soft px-3 py-1 text-xs text-bad">{error}</p>}
      <div className={`grid min-h-0 flex-1 ${showViewer ? "md:grid-cols-[minmax(320px,1fr)_minmax(360px,1.2fr)]" : "grid-cols-1"}`}>
        <div className={`min-h-0 ${swap ? "md:order-2" : ""}`}>{questions}</div>
        <div className={`min-h-0 ${showViewer ? "" : "hidden"} ${swap ? "md:order-1" : ""}`}>{viewerPane}</div>
      </div>
    </main>
  );
}
