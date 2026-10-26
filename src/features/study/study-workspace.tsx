"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PdfViewer, type PdfViewerHandle } from "@/components/viewer/pdf-viewer";
import { createClient } from "@/lib/supabase/client";
import { recordAttempt, saveProgress, toggleBookmark } from "./actions";
import { QuestionCard } from "./question-card";
import type { ChapterContent, ContentQuestion, PageMapRow, QState, StudyChapter } from "./types";

const btn = "inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm text-ink hover:bg-surface-2 disabled:opacity-50";
const btnPrimary = "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50";

// module-level so the purity lint rule does not treat event-handler timing as render-time work
const nowMs = () => Date.now();

type Props = {
  chapter: StudyChapter; pageMap: PageMapRow[]; pdfUrl: string | null; isAdmin: boolean;
  initialPage: number; seenPages: number[]; bookmarkedIds: string[];
};

export function StudyWorkspace({ chapter, pageMap, pdfUrl, isAdmin, initialPage, seenPages, bookmarkedIds }: Props) {
  const router = useRouter();
  const viewer = useRef<PdfViewerHandle>(null);
  const [localData, setLocalData] = useState<ArrayBuffer | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [practicePage, setPracticePage] = useState<number | null>(null);
  const [mode, setMode] = useState<"focus" | "list">("focus");
  const [focusIdx, setFocusIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dark, setDark] = useState(false);
  const [follow, setFollow] = useState(false);
  const [swap, setSwap] = useState(false);
  const [showViewer, setShowViewer] = useState(true);
  const [tab, setTab] = useState<"read" | "practise">("practise");
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [contentError, setContentError] = useState(false);
  const [noContent, setNoContent] = useState(false);
  const [states, setStates] = useState<Record<string, QState>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedIds));
  const [notice, setNotice] = useState("");
  const [jump, setJump] = useState("");
  const [uploading, setUploading] = useState(false);
  const started = useRef<Record<string, number>>({});
  const seen = useRef<Set<number>>(new Set(seenPages));
  const readyRef = useRef(false);

  const labelOf = useCallback((p: number) => pageMap.find((m) => m.pdf_page === p)?.printed_label ?? String(p), [pageMap]);
  const total = numPages || chapter.pageCount;

  // content (static JSON, blueprint 04 §3)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const manifest = await fetch("/content/current.json");
        if (manifest.status === 404) { if (!cancelled) setNoContent(true); return; }
        if (!manifest.ok) throw new Error("content");
        const cur = await manifest.json();
        const res = await fetch(`/content/${cur.release}/en/${chapter.slug}.json`);
        if (res.status === 404) { if (!cancelled) setNoContent(true); return; }
        if (!res.ok) throw new Error("content");
        const json = (await res.json()) as ChapterContent;
        if (!cancelled) setContent(json);
      } catch { if (!cancelled) setContentError(true); }
    })();
    return () => { cancelled = true; };
  }, [chapter.slug]);

  const questionsFor = useCallback((p: number | null): ContentQuestion[] => (p && content ? content.pages[String(p)] ?? [] : []), [content]);
  const here = questionsFor(page).length;
  const qs = questionsFor(practicePage);
  const nextWithQ = useMemo(() => {
    if (!content) return undefined;
    return Object.keys(content.pages).map(Number).filter((p) => p > page && content.pages[String(p)].length > 0).sort((a, b) => a - b)[0];
  }, [content, page]);

  // viewer events
  const onReady = useCallback(({ doc }: { doc: { numPages: number } }) => {
    setNumPages(doc.numPages);
    readyRef.current = true;
    requestAnimationFrame(() => viewer.current?.scrollToPage(initialPage));
  }, [initialPage]);
  const onPageChange = useCallback((p: number) => { setPage(p); }, []);

  // keep URL + progress in sync (debounced)
  useEffect(() => {
    if (!readyRef.current) return;
    const url = new URL(window.location.href);
    url.searchParams.set("p", String(page));
    window.history.replaceState(null, "", url);
    seen.current.add(page);
    const t = setTimeout(() => { void saveProgress({ chapterId: chapter.id, lastPage: page, pagesSeen: [...seen.current] }); }, 5000);
    return () => clearTimeout(t);
  }, [page, chapter.id]);

  useEffect(() => {
    if (!follow) return;
    const t = setTimeout(() => { setPracticePage(page); setFocusIdx(0); }, 1500);
    return () => clearTimeout(t);
  }, [follow, page]);

  const practiseHere = useCallback(() => { setPracticePage(page); setFocusIdx(0); setTab("practise"); }, [page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "p" || e.key === "P") practiseHere();
      else if (e.key === "v" || e.key === "V") setShowViewer((s) => !s);
      else if (e.key === "[") viewer.current?.scrollToPage(page - 1);
      else if (e.key === "]") viewer.current?.scrollToPage(page + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, practiseHere]);

  // question actions
  function pick(q: ContentQuestion, i: number) {
    started.current[q.id] ??= nowMs();
    setStates((s) => ({ ...s, [q.id]: { chosen: i, checked: false, attemptNo: s[q.id]?.attemptNo ?? 1 } }));
  }
  function check(q: ContentQuestion) {
    const st = states[q.id];
    if (!st || st.chosen === null) return;
    setStates((s) => ({ ...s, [q.id]: { ...st, checked: true } }));
    void recordAttempt({
      questionId: q.id, versionId: q.version_id, chosen: st.chosen, isCorrect: st.chosen === q.payload.answer,
      timeMs: nowMs() - (started.current[q.id] ?? nowMs()), attemptNo: st.attemptNo, release: content?.release ?? "", source: "workspace",
    }).then((r) => { if (!r.ok) setNotice("Your answer could not be saved. Check your connection."); });
  }
  function retry(q: ContentQuestion) {
    started.current[q.id] = nowMs();
    setStates((s) => ({ ...s, [q.id]: { chosen: null, checked: false, attemptNo: (s[q.id]?.attemptNo ?? 1) + 1 } }));
  }
  function bookmark(q: ContentQuestion) {
    const on = !bookmarks.has(q.id);
    setBookmarks((b) => { const n = new Set(b); if (on) n.add(q.id); else n.delete(q.id); return n; });
    void toggleBookmark({ questionId: q.id, on }).then((r) => {
      if (!r.ok) { setBookmarks((b) => { const n = new Set(b); if (on) n.delete(q.id); else n.add(q.id); return n; }); setNotice("Could not update the bookmark."); }
    });
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    setLocalFile(f); setLocalData(await f.arrayBuffer());
  }

  async function uploadToStorage() {
    if (!localFile || !localData) return;
    setUploading(true); setNotice("");
    try {
      const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", localData))].map((b) => b.toString(16).padStart(2, "0")).join("");
      const path = `${chapter.slug}.pdf`;
      const sb = createClient();
      const up = await sb.storage.from("chapter-pdfs").upload(path, localFile, { upsert: true, contentType: "application/pdf" });
      if (up.error) throw up.error;
      const upd = await sb.from("chapters").update({ pdf_path: path, pdf_sha256: sha }).eq("id", chapter.id);
      if (upd.error) throw upd.error;
      router.refresh();
    } catch { setNotice("Upload failed. Only admins can upload, and the file must be a PDF under 50 MB."); }
    setUploading(false);
  }

  function goPrinted() {
    const hit = pageMap.find((m) => m.printed_label === jump.trim());
    if (hit) viewer.current?.scrollToPage(hit.pdf_page);
  }

  const hasSource = Boolean(pdfUrl || localData);
  const cur = qs[Math.min(focusIdx, Math.max(qs.length - 1, 0))];

  const practicePane = (
    <section aria-label="Practice" className="flex h-full min-h-0 flex-col overflow-auto bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary} onClick={practiseHere} disabled={!content || here === 0}>
          Practice this page · {here} {here === 1 ? "question" : "questions"}
        </button>
        {content && here === 0 && nextWithQ && <button className={btn} onClick={() => viewer.current?.scrollToPage(nextWithQ)}>Go to next page with questions</button>}
        <div className="ml-auto flex gap-1" role="group" aria-label="Question mode">
          <button className={`${btn} ${mode === "focus" ? "bg-brand-soft text-brand-text" : ""}`} aria-pressed={mode === "focus"} onClick={() => setMode("focus")}>Focus</button>
          <button className={`${btn} ${mode === "list" ? "bg-brand-soft text-brand-text" : ""}`} aria-pressed={mode === "list"} onClick={() => setMode("list")}>List</button>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted" aria-live="polite">Reading: PDF page {page} · printed page {labelOf(page)}</p>
      {contentError && <p role="alert" className="mt-3 text-sm text-bad">Could not load the questions for this chapter.</p>}
      {noContent && <p className="mt-4 text-sm text-ink-2">Questions for this chapter are still being reviewed. Every question is checked before it is published, so none are shown yet. You can read the chapter in the meantime.</p>}
      {content && here === 0 && !practicePage && <p className="mt-4 text-sm text-ink-2">No questions on this page yet. Keep reading, or jump to a page that has some.</p>}

      {practicePage && (
        <div className="mt-4 space-y-3">
          <h2 className="text-sm font-semibold text-ink-2">Questions for printed page {labelOf(practicePage)}</h2>
          {qs.length === 0 && <p className="text-sm text-muted">No questions on this page.</p>}
          {mode === "focus" && cur && (
            <>
              <QuestionCard q={cur} index={Math.min(focusIdx, qs.length - 1)} total={qs.length} state={states[cur.id]} bookmarked={bookmarks.has(cur.id)}
                onPick={(i) => pick(cur, i)} onCheck={() => check(cur)} onRetry={() => retry(cur)} onBookmark={() => bookmark(cur)} onSource={() => viewer.current?.scrollToPage(practicePage, true)} />
              <div className="flex items-center justify-between">
                <button className={btn} disabled={focusIdx === 0} onClick={() => setFocusIdx((i) => i - 1)}>Previous</button>
                <span className="flex gap-1" aria-hidden>{qs.map((q, i) => (
                  <span key={q.id} className={`size-2 rounded-full ${i === focusIdx ? "bg-brand" : states[q.id]?.checked ? (states[q.id].chosen === q.payload.answer ? "bg-good" : "bg-bad") : "bg-line"}`} />
                ))}</span>
                <button className={btn} disabled={focusIdx >= qs.length - 1} onClick={() => setFocusIdx((i) => i + 1)}>Next</button>
              </div>
            </>
          )}
          {mode === "list" && qs.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i} total={qs.length} state={states[q.id]} bookmarked={bookmarks.has(q.id)}
              onPick={(oi) => pick(q, oi)} onCheck={() => check(q)} onRetry={() => retry(q)} onBookmark={() => bookmark(q)} onSource={() => viewer.current?.scrollToPage(practicePage, true)} />
          ))}
        </div>
      )}
    </section>
  );

  const viewerPane = hasSource ? (
    <PdfViewer ref={viewer} data={localData} url={localData ? null : pdfUrl} zoom={zoom} darkPages={dark} onPageChange={onPageChange} onReady={onReady} onError={() => setNotice("The PDF could not be loaded.")} />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface-2 p-6 text-center">
      <h2 className="text-lg font-semibold text-ink">Chapter PDF not available yet</h2>
      <p className="max-w-sm text-sm text-ink-2">{isAdmin ? "Choose the chapter PDF from your device to read it now. You can then upload it to private storage." : "The NCERT page for this chapter is not published yet."}</p>
      {isAdmin && (
        <label className={`${btnPrimary} cursor-pointer`}>Choose PDF from device
          <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <Link href="/library" className={btn}>← Library</Link>
        <strong className="mr-1 max-w-[16rem] truncate text-sm text-ink">{chapter.title}</strong>
        {chapter.status === "draft" && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-text">Draft</span>}
        <button className={btn} onClick={() => viewer.current?.scrollToPage(page - 1)} disabled={page <= 1 || !hasSource} aria-label="Previous page">‹</button>
        <span className="text-xs text-ink-2">PDF {page}/{total} · printed {labelOf(page)}</span>
        <button className={btn} onClick={() => viewer.current?.scrollToPage(page + 1)} disabled={page >= total || !hasSource} aria-label="Next page">›</button>
        <input value={jump} onChange={(e) => setJump(e.target.value)} onKeyDown={(e) => e.key === "Enter" && goPrinted()} inputMode="numeric"
          aria-label="Go to printed page" placeholder="Go to page" className="h-9 w-28 rounded-lg border border-line bg-field px-2 text-xs" />
        <button className={btn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">−</button>
        <span className="w-10 text-center text-xs">{Math.round(zoom * 100)}%</span>
        <button className={btn} onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">+</button>
        <label className="flex items-center gap-1 text-xs text-ink-2"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />Follow my reading</label>
        <label className="flex items-center gap-1 text-xs text-ink-2"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />Dark pages</label>
        <button className={`${btn} hidden md:inline-flex`} onClick={() => setSwap((s) => !s)}>Swap sides</button>
        <button className={`${btn} hidden md:inline-flex`} onClick={() => setShowViewer((s) => !s)}>{showViewer ? "Hide" : "Show"} PDF (V)</button>
        {isAdmin && localData && !pdfUrl && <button className={btn} onClick={uploadToStorage} disabled={uploading}>{uploading ? "Uploading…" : "Upload this PDF to private storage"}</button>}
      </div>
      {notice && <p role="alert" className="bg-bad-soft px-3 py-1 text-xs text-bad">{notice}</p>}
      <div className="flex border-b border-line md:hidden" role="tablist" aria-label="Panels">
        {(["read", "practise"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm ${tab === t ? "border-b-2 border-brand font-medium text-brand-text" : "text-ink-2"}`}>{t === "read" ? "Read" : "Practise"}</button>
        ))}
      </div>
      <div className={`grid min-h-0 flex-1 ${showViewer ? "md:grid-cols-[minmax(320px,1fr)_minmax(360px,1.2fr)]" : "md:grid-cols-1"}`}>
        <div className={`min-h-0 ${tab === "practise" ? "" : "hidden md:block"} ${swap ? "md:order-2" : ""}`}>{practicePane}</div>
        <div className={`min-h-0 ${tab === "read" ? "" : "hidden md:block"} ${showViewer ? "" : "md:hidden"} ${swap ? "md:order-1" : ""}`}>{viewerPane}</div>
      </div>
    </div>
  );
}
