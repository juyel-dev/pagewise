"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, RenderTask, TextLayer } from "pdfjs-dist";
import { PageDetector } from "../../lib/pdf/page-detector";
import "./pdf-viewer.css";

const PAD = 16;
const GAP = 12;
const MAX_PARALLEL = 2;

export type PageSize = { w: number; h: number };
export type PageMetric = { page: number; ms: number; scale: number };
export type PdfViewerHandle = { scrollToPage: (page: number, smooth?: boolean) => void };
export type PdfViewerProps = {
  data: ArrayBuffer | null;
  zoom: number; // 1 = fit width
  darkPages?: boolean;
  onPageChange: (page: number, source: "scroll" | "jump") => void;
  onReady: (info: { doc: PDFDocumentProxy; sizes: PageSize[] }) => void;
  onMetric?: (m: PageMetric) => void;
  onError?: (msg: string) => void;
};

type Rendered = { scale: number; status: "rendering" | "done"; canvas: HTMLCanvasElement; textDiv: HTMLDivElement; task: RenderTask | null; text: TextLayer | null };

export const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(function PdfViewer(props, ref) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pagesRef = useRef<PDFPageProxy[]>([]);
  const taskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const pdfjsRef = useRef<typeof import("pdfjs-dist") | null>(null);
  const rendered = useRef(new Map<number, Rendered>());
  const wantRef = useRef<number[]>([]);
  const activeRef = useRef(0);
  const anchorRef = useRef<{ page: number; frac: number } | null>(null);
  const prevScaleRef = useRef(0);

  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [boxW, setBoxW] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const detector = useMemo(() => new PageDetector({ onChange: (p) => propsRef.current.onPageChange(p, "scroll") }), []);
  useEffect(() => () => detector.dispose(), [detector]);

  const scale = sizes.length && boxW ? ((boxW - 2 * PAD) / sizes[0].w) * props.zoom : 0;
  const tops = useMemo(() => {
    const t: number[] = [];
    let y = PAD;
    for (const s of sizes) { t.push(y); y += s.h * scale + GAP; }
    return t;
  }, [sizes, scale]);

  const scaleRef = useRef(scale); scaleRef.current = scale;
  const sizesRef = useRef(sizes); sizesRef.current = sizes;
  const topsRef = useRef(tops); topsRef.current = tops;

  // ---- load document -------------------------------------------------------------------------
  useEffect(() => {
    const data = props.data;
    if (!data) return;
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
        const task = pdfjs.getDocument({
          data: new Uint8Array(data.slice(0)),
          cMapUrl: "/pdfjs/cmaps/", cMapPacked: true,
          standardFontDataUrl: "/pdfjs/standard_fonts/",
        });
        const doc = await task.promise;
        if (cancelled) { void task.destroy(); return; }
        const pages: PDFPageProxy[] = [];
        const sz: PageSize[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const p = await doc.getPage(i);
          const v = p.getViewport({ scale: 1 });
          pages.push(p); sz.push({ w: v.width, h: v.height });
        }
        if (cancelled) { void task.destroy(); return; }
        releaseAll();
        void taskRef.current?.destroy();
        taskRef.current = task; pagesRef.current = pages; pdfjsRef.current = pdfjs;
        setSizes(sz); setStatus("ready");
        propsRef.current.onReady({ doc, sizes: sz });
      } catch (e) {
        if (!cancelled) { setStatus("error"); propsRef.current.onError?.(e instanceof Error ? e.message : String(e)); }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);

  useEffect(() => () => { releaseAll(); void taskRef.current?.destroy(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- render engine --------------------------------------------------------------------------
  function release(pg: number) {
    const r = rendered.current.get(pg);
    if (!r) return;
    r.task?.cancel();
    r.text?.cancel();
    r.canvas.width = 0; r.canvas.height = 0;
    wrapRefs.current[pg - 1]?.replaceChildren();
    rendered.current.delete(pg);
  }
  function releaseAll() { for (const pg of [...rendered.current.keys()]) release(pg); }

  function start(pg: number) {
    const wrap = wrapRefs.current[pg - 1];
    const page = pagesRef.current[pg - 1];
    const pdfjs = pdfjsRef.current;
    const s = scaleRef.current;
    if (!wrap || !page || !pdfjs || !s) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const css = page.getViewport({ scale: s });
    const rv = page.getViewport({ scale: s * dpr });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(rv.width); canvas.height = Math.floor(rv.height);
    canvas.style.width = `${css.width}px`; canvas.style.height = `${css.height}px`;
    const textDiv = document.createElement("div");
    textDiv.style.width = `${css.width}px`; textDiv.style.height = `${css.height}px`;
    textDiv.style.setProperty("--scale-factor", String(s)); textDiv.style.setProperty("--total-scale-factor", String(s));
    const entry: Rendered = { scale: s, status: "rendering", canvas, textDiv, task: null, text: null };
    rendered.current.set(pg, entry);
    activeRef.current++;
    const t0 = performance.now();
    const task = page.render({ canvas, viewport: rv });
    entry.task = task;
    task.promise
      .then(async () => {
        if (rendered.current.get(pg) !== entry) return;
        entry.status = "done";
        wrap.replaceChildren(canvas, textDiv);
        propsRef.current.onMetric?.({ page: pg, ms: Math.round(performance.now() - t0), scale: s });
        const tl = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: textDiv, viewport: css });
        entry.text = tl;
        await tl.render();
      })
      .catch((e: unknown) => {
        const name = (e as { name?: string })?.name;
        if (name !== "RenderingCancelledException" && rendered.current.get(pg) === entry) propsRef.current.onError?.(`page ${pg}: ${String(e)}`);
      })
      .finally(() => { activeRef.current--; pump(); });
  }

  function pump() {
    if (activeRef.current >= MAX_PARALLEL) return;
    for (const pg of wantRef.current) {
      const r = rendered.current.get(pg);
      if (r && r.scale === scaleRef.current) continue;
      if (r) release(pg);
      start(pg);
      if (activeRef.current >= MAX_PARALLEL) break;
    }
  }

  const update = useCallback(() => {
    const el = scrollRef.current;
    const s = scaleRef.current; const sz = sizesRef.current; const t = topsRef.current;
    if (!el || !s || !sz.length) return;
    const top = el.scrollTop, bottom = top + el.clientHeight, margin = el.clientHeight * 1.2;
    const vis = new Map<number, number>();
    const want: number[] = [];
    for (let i = 0; i < sz.length; i++) {
      const pt = t[i], pb = pt + sz[i].h * s;
      vis.set(i + 1, Math.max(0, Math.min(pb, bottom) - Math.max(pt, top)));
      if (pb >= top - margin && pt <= bottom + margin) want.push(i + 1);
    }
    detector.update(vis);
    const mid = (top + bottom) / 2;
    const center = (pg: number) => t[pg - 1] + (sz[pg - 1].h * s) / 2;
    want.sort((a, b) => Math.abs(center(a) - mid) - Math.abs(center(b) - mid));
    wantRef.current = want;
    for (const pg of [...rendered.current.keys()]) if (!want.includes(pg)) release(pg);
    pump();
  }, [detector]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- resize + scroll ------------------------------------------------------------------------
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setBoxW(el.clientWidth)); });
    ro.observe(el);
    setBoxW(el.clientWidth);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      const p = detector.page ?? 1;
      const s = scaleRef.current, sz = sizesRef.current, t = topsRef.current;
      if (s && sz[p - 1]) anchorRef.current = { page: p, frac: (el.scrollTop - t[p - 1]) / (sz[p - 1].h * s) };
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [detector, update]);

  // layout changed (zoom / width / new doc): keep reading position, redraw
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !scale) return;
    const a = anchorRef.current;
    if (a && prevScaleRef.current && prevScaleRef.current !== scale && sizes[a.page - 1]) {
      el.scrollTop = tops[a.page - 1] + a.frac * sizes[a.page - 1].h * scale;
    }
    prevScaleRef.current = scale;
    releaseAll();
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, sizes, tops, update]);

  useImperativeHandle(ref, () => ({
    scrollToPage(page: number, smooth = false) {
      const el = scrollRef.current;
      const n = sizesRef.current.length;
      if (!el || !n) return;
      const p = Math.min(Math.max(1, Math.round(page)), n);
      detector.jumpTo(p);
      el.scrollTo({ top: topsRef.current[p - 1] - PAD / 2, behavior: smooth ? "smooth" : "auto" });
      propsRef.current.onPageChange(p, "jump");
    },
  }), [detector]);

  const pageW = sizes.length ? sizes[0].w * scale : 0;
  return (
    <div ref={scrollRef} className={`pdfv-scroll h-full w-full ${props.darkPages ? "pdfv-dark" : ""}`} tabIndex={0} role="region" aria-label="NCERT chapter PDF">
      {status === "idle" && <p className="p-6 text-sm text-muted">Choose a chapter PDF to start.</p>}
      {status === "loading" && <p className="p-6 text-sm text-muted" role="status">Loading PDF…</p>}
      {status === "error" && <p className="p-6 text-sm text-bad" role="alert">Could not open this PDF.</p>}
      <div style={{ width: Math.max(boxW, pageW + 2 * PAD), paddingTop: PAD, paddingBottom: PAD }}>
        {sizes.map((s, i) => (
          <div key={i} ref={(n) => { wrapRefs.current[i] = n; }} className="pdfv-page" data-page={i + 1}
            style={{ width: s.w * scale, height: s.h * scale }} />
        ))}
      </div>
    </div>
  );
});
