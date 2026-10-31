"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { PdfViewer, type PdfViewerHandle } from "@/components/viewer/pdf-viewer";
import { isCorrect } from "@/lib/question-bank/format";
import { createClient } from "@/lib/supabase/client";
import { setQuestionStatus } from "../review/actions";
import { recordAttempt, saveProgress, toggleBookmark } from "./actions";
import { QuestionCard } from "./question-card";
import type { PageMapRow, QState, StudyChapter, StudyQuestion } from "./types";

const btn = "inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm text-ink hover:bg-surface-2 disabled:opacity-50";
const btnPrimary = "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50";
// module-level so the purity lint rule does not treat event-handler timing as render-time work
const nowMs = () => Date.now();

function splitBounds(width: number, swap: boolean) {
  const available = Math.max(1, width - 12);
  const leftMin = swap ? 360 : 320;
  const rightMin = swap ? 320 : 360;
  const maxLeft = available - rightMin;
  if (leftMin > maxLeft) return { min: 50, max: 50 };
  return {
    min: Math.ceil((leftMin / available) * 100),
    max: Math.floor((maxLeft / available) * 100),
  };
}

type Props = {
  chapter: StudyChapter; pageMap: PageMapRow[]; pdfUrl: string | null; isAdmin: boolean; review: boolean;
  questionsByPage: Record<string, StudyQuestion[]>; pageTotal?: Record<string, number>;
  initialPage: number; seenPages: number[]; bookmarkedIds: string[];
  guest?: boolean;
};

export function StudyWorkspace({ chapter, pageMap, pdfUrl, isAdmin, review, questionsByPage, pageTotal, initialPage, seenPages, bookmarkedIds, guest = false }: Props) {
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
  const [splitRatio, setSplitRatio] = useState(45);
  const [splitWidth, setSplitWidth] = useState(784);
  const splitRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"read" | "practise">("practise");
  const [states, setStates] = useState<Record<string, QState>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedIds));
  const [notice, setNotice] = useState("");
  const [jump, setJump] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const started = useRef<Record<string, number>>({});
  const seen = useRef<Set<number>>(new Set(seenPages));
  const readyRef = useRef(false);

  useEffect(() => {
    const el = splitRef.current;
    if (!el) return;
    const updateWidth = () => setSplitWidth(el.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function updateSplit(clientX: number) {
    const rect = splitRef.current?.getBoundingClientRect();
    if (!rect) return;
    const bounds = splitBounds(rect.width, swap);
    const usable = Math.max(1, rect.width - 12);
    const next = ((clientX - rect.left - 6) / usable) * 100;
    setSplitRatio(Math.max(bounds.min, Math.min(bounds.max, next)));
  }

  function onSplitPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSplit(e.clientX);
  }

  function onSplitPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) updateSplit(e.clientX);
  }

  function onSplitPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function onSplitKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const bounds = splitBounds(splitWidth, swap);
    const step = e.shiftKey ? 5 : 2;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSplitRatio((value) => Math.max(bounds.min, value - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSplitRatio((value) => Math.min(bounds.max, value + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSplitRatio(bounds.min);
    } else if (e.key === "End") {
      e.preventDefault();
      setSplitRatio(bounds.max);
    }
  }

  const labelOf = useCallback((p: number) => pageMap.find((m) => m.pdf_page === p)?.printed_label ?? String(p), [pageMap]);
  const signInHref = `/sign-in?next=${encodeURIComponent(`/study/${chapter.slug}`)}`;
  const total = numPages || chapter.pageCount;
  const questionsFor = useCallback((p: number | null): StudyQuestion[] => (p ? questionsByPage[String(p)] ?? [] : []), [questionsByPage]);
  const hasAny = Object.values(questionsByPage).some((l) => l.length > 0);
  const here = questionsFor(page).length;
  const activePage = review ? page : practicePage;
  const qs = questionsFor(activePage);
  const lockedHere = guest && activePage ? (pageTotal?.[String(activePage)] ?? 0) - qs.length : 0;
  const nextWithQ = useMemo(
    () => Object.keys(questionsByPage).map(Number).filter((p) => p > page && questionsByPage[String(p)].length > 0).sort((a, b) => a - b)[0],
    [questionsByPage, page],
  );

  const onReady = useCallback(({ doc }: { doc: { numPages: number } }) => {
    setNumPages(doc.numPages);
    readyRef.current = true;
    requestAnimationFrame(() => viewer.current?.scrollToPage(initialPage));
  }, [initialPage]);
  const onPageChange = useCallback((p: number) => { setPage(p); setFocusIdx(0); }, []);

  useEffect(() => {
    if (!readyRef.current || review || guest) return; // guests: progress is not persisted (decision 28)
    const url = new URL(window.location.href);
    url.searchParams.set("p", String(page));
    window.history.replaceState(null, "", url);
    seen.current.add(page);
    const t = setTimeout(() => { void saveProgress({ chapterId: chapter.id, lastPage: page, pagesSeen: [...seen.current] }); }, 5000);
    return () => clearTimeout(t);
  }, [page, chapter.id, review, guest]);

  useEffect(() => {
    if (!follow || review) return;
    const t = setTimeout(() => { setPracticePage(page); setFocusIdx(0); }, 1500);
    return () => clearTimeout(t);
  }, [follow, page, review]);

  const practiseHere = useCallback(() => { setPracticePage(page); setFocusIdx(0); setTab("practise"); }, [page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if ((e.key === "p" || e.key === "P") && !review) practiseHere();
      else if (e.key === "v" || e.key === "V") setShowViewer((s) => !s);
      else if (e.key === "[") viewer.current?.scrollToPage(page - 1);
      else if (e.key === "]") viewer.current?.scrollToPage(page + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, practiseHere, review]);

  // ----- practice actions -----
  function pick(q: StudyQuestion, i: number) {
    started.current[q.id] ??= nowMs();
    const multi = q.type === "multiple_correct";
    setStates((s) => {
      const prev = s[q.id];
      const cur = prev?.chosen ?? [];
      const next = multi ? (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]) : [i];
      return { ...s, [q.id]: { chosen: next, checked: false, attemptNo: prev?.attemptNo ?? 1 } };
    });
  }
  function check(q: StudyQuestion) {
    const st = states[q.id];
    if (!st || st.chosen.length === 0) return;
    setStates((s) => ({ ...s, [q.id]: { ...st, checked: true } }));
    if (guest) return; // guests: attempts are not persisted (decision 28)
    void recordAttempt({
      questionId: q.id, versionId: q.version_id, chosen: st.chosen, isCorrect: isCorrect(st.chosen, q.payload.correct),
      timeMs: nowMs() - (started.current[q.id] ?? nowMs()), attemptNo: st.attemptNo, release: "db", source: "workspace",
    }).then((r) => { if (!r.ok) setNotice("Your answer could not be saved. Check your connection."); });
  }
  function retry(q: StudyQuestion) {
    started.current[q.id] = nowMs();
    setStates((s) => ({ ...s, [q.id]: { chosen: [], checked: false, attemptNo: (s[q.id]?.attemptNo ?? 1) + 1 } }));
  }
  function bookmark(q: StudyQuestion) {
    if (guest) { router.push(signInHref); return; } // sign in to save bookmarks (decision 28)
    const on = !bookmarks.has(q.id);
    setBookmarks((b) => { const n = new Set(b); if (on) n.add(q.id); else n.delete(q.id); return n; });
    void toggleBookmark({ questionId: q.id, on }).then((r) => {
      if (!r.ok) { setBookmarks((b) => { const n = new Set(b); if (on) n.delete(q.id); else n.add(q.id); return n; }); setNotice("Could not update the bookmark."); }
    });
  }

  // ----- review actions -----
  function setStatus(ids: string[], status: "published" | "in_review" | "retired") {
    setNotice("");
    startTransition(async () => {
      const r = await setQuestionStatus({ ids, status });
      if (!r.ok) setNotice(r.error ?? "Could not update.");
      else router.refresh();
    });
  }

  // ----- PDF source -----
  async function onFile(f: File | undefined) {
    if (!f) return;
    setLocalFile(f); setLocalData(await f.arrayBuffer());
  }
  async function uploadToStorage() {
    if (!localFile || !localData) return;
    setUploading(true); setNotice("");
    try {
      const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", localData))].map((b) => b.toString(16).padStart(2, "0")).join("");
      if (chapter.pdfSha256 && sha === chapter.pdfSha256) { // decision 36c: no duplicate uploads of the same file
        setNotice("This exact PDF is already uploaded for this chapter. Nothing was changed.");
        setUploading(false);
        return;
      }
      const path = `${chapter.slug}.pdf`;
      const sb = createClient();
      const up = await sb.storage.from("chapter-pdfs").upload(path, localFile, { upsert: true, contentType: "application/pdf" });
      if (up.error) throw up.error;
      const upd = await sb.from("chapters").update({ pdf_path: path, pdf_sha256: sha, page_count: numPages || undefined }).eq("id", chapter.id);
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
  const effMode = review ? "list" : mode;
  const splitBoundsNow = splitBounds(splitWidth, swap);
  const splitAvailable = Math.max(1, splitWidth - 12);
  const leftMinWidth = swap ? 360 : 320;
  const rightMinWidth = swap ? 320 : 360;
  const leftPaneWidth = Math.max(leftMinWidth, Math.min(
    splitAvailable - rightMinWidth,
    Math.round(splitAvailable * splitRatio / 100),
  ));

  const practicePane = (
    <section aria-label={review ? "Review" : "Practice"} className="flex h-full min-h-0 flex-col overflow-auto bg-surface p-4">
      {review ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-text">Review mode · staff only</span>
          <button className={btnPrimary} disabled={pending || qs.every((q) => q.status === "published") || qs.length === 0}
            onClick={() => setStatus(qs.filter((q) => q.status !== "published").map((q) => q.id), "published")}>
            Publish all on this page ({qs.filter((q) => q.status !== "published").length})
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button className={btnPrimary} onClick={practiseHere} disabled={here === 0}>
            Practice this page · {here} {here === 1 ? "question" : "questions"}
          </button>
          {here === 0 && nextWithQ && <button className={btn} onClick={() => viewer.current?.scrollToPage(nextWithQ)}>Go to next page with questions</button>}
          <div className="ml-auto flex gap-1" role="group" aria-label="Question mode">
            <button className={`${btn} ${mode === "focus" ? "bg-brand-soft text-brand-text" : ""}`} aria-pressed={mode === "focus"} onClick={() => setMode("focus")}>Focus</button>
            <button className={`${btn} ${mode === "list" ? "bg-brand-soft text-brand-text" : ""}`} aria-pressed={mode === "list"} onClick={() => setMode("list")}>List</button>
          </div>
        </div>
      )}
      <p className="mt-2 text-xs text-muted" aria-live="polite">Reading: PDF page {page} · printed page {labelOf(page)}</p>
      {guest && !review && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-canvas px-3 py-2.5">
          <p className="min-w-0 flex-1 text-xs leading-5 text-ink-2"><span className="font-medium text-ink">Guest mode.</span> You can try the first 2 questions on each page. Sign in to keep your progress, bookmarks and attempts.</p>
          <Link href={signInHref} className="shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover">Sign in</Link>
        </div>
      )}
      {lockedHere > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5">
          <p className="min-w-0 flex-1 text-xs leading-5 text-ink-2">{lockedHere} more question{lockedHere === 1 ? "" : "s"} on this page — sign in to see {lockedHere === 1 ? "it" : "them"}.</p>
          <Link href={signInHref} className="shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover">Sign in</Link>
        </div>
      )}
      {!hasAny && !review && <p className="mt-4 text-sm text-ink-2">Questions for this chapter are still being reviewed. Every question is checked before it is published, so none are shown yet. You can read the chapter in the meantime.</p>}
      {!hasAny && review && <p className="mt-4 text-sm text-ink-2">No questions in this chapter yet. Import them from Admin → Import questions.</p>}
      {review && hasAny && qs.length === 0 && <p className="mt-4 text-sm text-ink-2">No questions on this page.{nextWithQ ? " Use “Go to next page with questions” in the page controls." : ""}</p>}

      {activePage && qs.length > 0 && (
        <div className="mt-4 space-y-3">
          <h2 className="text-sm font-semibold text-ink-2">{review ? "Questions" : "Questions"} for printed page {labelOf(activePage)}</h2>
          {effMode === "focus" && cur && (
            <>
              <QuestionCard q={cur} index={Math.min(focusIdx, qs.length - 1)} total={qs.length} state={states[cur.id]} bookmarked={bookmarks.has(cur.id)}
                onPick={(i) => pick(cur, i)} onCheck={() => check(cur)} onRetry={() => retry(cur)} onBookmark={() => bookmark(cur)} onSource={() => viewer.current?.scrollToPage(activePage, true)} />
              <div className="flex items-center justify-between">
                <button className={btn} disabled={focusIdx === 0} onClick={() => setFocusIdx((i) => i - 1)}>Previous</button>
                <span className="flex gap-1" aria-hidden>{qs.map((q, i) => (
                  <span key={q.id} className={`size-2 rounded-full ${i === focusIdx ? "bg-brand" : states[q.id]?.checked ? (isCorrect(states[q.id].chosen, q.payload.correct) ? "bg-good" : "bg-bad") : "bg-line"}`} />
                ))}</span>
                <button className={btn} disabled={focusIdx >= qs.length - 1} onClick={() => setFocusIdx((i) => i + 1)}>Next</button>
              </div>
            </>
          )}
          {effMode === "list" && qs.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i} total={qs.length} state={states[q.id]} bookmarked={bookmarks.has(q.id)}
              review={review ? { busy: pending, onSet: (st) => setStatus([q.id], st) } : undefined}
              onPick={(oi) => pick(q, oi)} onCheck={() => check(q)} onRetry={() => retry(q)} onBookmark={() => bookmark(q)} onSource={() => viewer.current?.scrollToPage(activePage, true)} />
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
      <div className="border-b border-line bg-surface px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={review ? "/review" : "/study"} className={btn}>← {review ? "Review" : "Study"}</Link>
          <strong className="min-w-0 max-w-[16rem] flex-1 truncate text-sm text-ink">{chapter.title}</strong>
          {chapter.status === "draft" && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-text">Draft</span>}
          <div className="flex items-center gap-1">
            <button className={btn} onClick={() => viewer.current?.scrollToPage(page - 1)} disabled={page <= 1 || !hasSource} aria-label="Previous page">‹</button>
            <span className="min-w-28 text-center text-xs text-ink-2">PDF {page}/{total} · printed {labelOf(page)}</span>
            <button className={btn} onClick={() => viewer.current?.scrollToPage(page + 1)} disabled={page >= total || !hasSource} aria-label="Next page">›</button>
          </div>
          <input value={jump} onChange={(e) => setJump(e.target.value)} onKeyDown={(e) => e.key === "Enter" && goPrinted()} inputMode="numeric"
            aria-label="Go to printed page" placeholder="Go to page" className="h-9 w-24 rounded-lg border border-line bg-field px-2 text-xs" />
          <div className="flex items-center gap-1" role="group" aria-label="PDF zoom">
            <button className={btn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">−</button>
            <span className="w-10 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
            <button className={btn} onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">+</button>
          </div>
          <details className="relative ml-auto lg:hidden">
            <summary className={`${btn} cursor-pointer`}>More</summary>
            <div className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-3 rounded-xl border border-line bg-surface p-3 shadow-window">
              {!review && <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />Follow my reading</label>}
              <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />Invert pages</label>
              {isAdmin && localData && !pdfUrl && <button className={btn} onClick={uploadToStorage} disabled={uploading}>{uploading ? "Uploading…" : "Upload PDF"}</button>}
            </div>
          </details>
          <div className="hidden items-center gap-3 lg:flex">
            {!review && <label className="flex items-center gap-1 text-xs text-ink-2"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />Follow my reading</label>}
            <label className="flex items-center gap-1 text-xs text-ink-2"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />Invert pages</label>
            <button className={btn} onClick={() => { setSwap((s) => !s); setSplitRatio((r) => 100 - r); }}>Swap sides</button>
            <button className={btn} onClick={() => setShowViewer((s) => !s)}>{showViewer ? "Hide" : "Show"} PDF (V)</button>
            {isAdmin && localData && !pdfUrl && <button className={btn} onClick={uploadToStorage} disabled={uploading}>{uploading ? "Uploading…" : "Upload this PDF"}</button>}
          </div>
        </div>
      </div>
      {notice && <p role="alert" className="bg-bad-soft px-3 py-1 text-xs text-bad">{notice}</p>}
      <div className="flex border-b border-line lg:hidden" role="tablist" aria-label="Panels">
        {(["read", "practise"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm ${tab === t ? "border-b-2 border-brand font-medium text-brand-text" : "text-ink-2"}`}>{t === "read" ? "Read" : review ? "Review" : "Practise"}</button>
        ))}
      </div>
      <div
        ref={splitRef}
        className={`flex min-h-0 flex-1 flex-col lg:grid ${showViewer ? "" : "lg:grid-cols-1"}`}
        style={showViewer ? { gridTemplateColumns: `minmax(${leftMinWidth}px, ${leftPaneWidth}px) 12px minmax(${rightMinWidth}px, 1fr)` } : undefined}
      >
        <div className={`min-h-0 flex-1 ${tab === "practise" ? "" : "hidden lg:block"} ${showViewer ? (swap ? "lg:col-start-3" : "lg:col-start-1") : "lg:col-start-1"}`}>{practicePane}</div>
        {showViewer && (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize question and PDF panels"
              aria-valuemin={splitBoundsNow.min}
              aria-valuemax={splitBoundsNow.max}
              aria-valuenow={Math.round(splitRatio)}
              aria-valuetext={`${Math.round(splitRatio)}% left panel, ${Math.round(100 - splitRatio)}% right panel`}
              tabIndex={0}
              onPointerDown={onSplitPointerDown}
              onPointerMove={onSplitPointerMove}
              onPointerUp={onSplitPointerUp}
              onPointerCancel={onSplitPointerUp}
              onKeyDown={onSplitKeyDown}
              onDoubleClick={() => setSplitRatio(swap ? 55 : 45)}
              className="group hidden touch-none cursor-col-resize items-center justify-center bg-surface-2 outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand-ring lg:flex"
              style={{ gridColumn: 2 }}
            >
              <span className="h-10 w-1 rounded-full bg-line transition-colors group-hover:bg-brand group-focus-visible:bg-brand" />
            </div>
            <div className={`min-h-0 flex-1 ${tab === "read" ? "" : "hidden lg:block"} ${swap ? "lg:col-start-1" : "lg:col-start-3"}`}>{viewerPane}</div>
          </>
        )}
      </div>
    </div>
  );
}
