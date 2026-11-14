"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PdfViewer, type PdfViewerHandle } from "@/components/viewer/pdf-viewer";
import { isCorrect } from "@pagewise/question-schema";
import { createClient } from "@/lib/supabase/client";
import { setQuestionStatus } from "../review/actions";
import { followDecision, nextPageWithQuestions } from "./logic";
import { QuestionCard } from "./question-card";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { createStudyStore } from "./store-wiring";
import type { PageMapRow, StudyChapter, StudyQuestion } from "./types";
import { usePracticeSession } from "./use-practice-session";
import { useReadingProgress } from "./use-reading-progress";
import { useSplitPane } from "./use-split-pane";
import { useWorkspaceShortcuts } from "./use-workspace-shortcuts";

const btn = "inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm text-ink hover:bg-surface-2 disabled:opacity-50";
const btnPrimary = "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50";

type Props = {
  chapter: StudyChapter; pageMap: PageMapRow[]; pdfUrl: string | null; isAdmin: boolean; review: boolean;
  questionsByPage: Record<string, StudyQuestion[]>;
  initialPage: number; seenPages: number[]; bookmarkedIds: string[];
  guest?: boolean;
};

export function StudyWorkspace({ chapter, pageMap, pdfUrl, isAdmin, review, questionsByPage, initialPage, seenPages, bookmarkedIds, guest = false }: Props) {
  const router = useRouter();
  const viewer = useRef<PdfViewerHandle>(null);
  const jumpInput = useRef<HTMLInputElement>(null);
  const store = useMemo(() => createStudyStore(guest), [guest]);
  const { attach: attachSplit, ...split } = useSplitPane();
  const [localData, setLocalData] = useState<ArrayBuffer | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [viewerReady, setViewerReady] = useState(false);
  const [mode, setMode] = useState<"focus" | "list">("focus");
  const [zoom, setZoom] = useState(1);
  const [dark, setDark] = useState(false);
  const [follow, setFollow] = useState(true);
  const [deferredPage, setDeferredPage] = useState<number | null>(null);
  const [showViewer, setShowViewer] = useState(true);
  const [tab, setTab] = useState<"read" | "practise">("practise");
  const [helpOpen, setHelpOpen] = useState(false);
  const [pdfIssue, setPdfIssue] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [jump, setJump] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const readyRef = useRef(false);

  const total = numPages || chapter.pageCount;
  const { page, onPageChange } = useReadingProgress({ chapter, store, initialPage, seenPages, pageCount: total, enabled: !review, ready: viewerReady });
  const { states, bookmarks, practisedPage, practisePage, focusIdx, setFocusIdx, notice, setNotice, pick, check, retry, toggleBookmark } = usePracticeSession({ chapter, store, questionsByPage, bookmarkedIds });

  const labelOf = (p: number) => pageMap.find((m) => m.pdf_page === p)?.printed_label ?? String(p);
  const signInHref = `/sign-in?next=${encodeURIComponent(`/study/${chapter.slug}?p=${page}`)}`;
  const questionsFor = (p: number | null): StudyQuestion[] => (p ? questionsByPage[String(p)] ?? [] : []);
  const hasAny = Object.values(questionsByPage).some((l) => l.length > 0);
  const here = questionsFor(page).length;
  const activePage = review ? page : practisedPage;
  const qs = questionsFor(activePage);
  const nextWithQ = nextPageWithQuestions(questionsByPage, page);
  const cur = qs[Math.min(focusIdx, Math.max(qs.length - 1, 0))];
  const effMode = review ? "list" : mode;
  const hasSource = Boolean(pdfUrl || localData);
  const bookmark = (q: StudyQuestion) => toggleBookmark(q, activePage ?? page);

  function onReady({ doc }: { doc: { numPages: number } }) {
    setNumPages(doc.numPages);
    readyRef.current = true;
    setViewerReady(true);
    requestAnimationFrame(() => viewer.current?.scrollToPage(page || initialPage));
  }
  function toggleViewer() {
    if (showViewer) setTab("practise");
    setShowViewer(!showViewer);
  }

  // "Follow my reading": when the PDF moves to a page with questions, switch if it will not interrupt work in progress, else offer a chip.
  const latest = useRef({ practisedPage, states });
  useEffect(() => { latest.current = { practisedPage, states }; });
  useEffect(() => {
    if (review) return;
    const t = setTimeout(() => {
      const decision = followDecision({ follow, practisedPage: latest.current.practisedPage, targetPage: page, map: questionsByPage, states: latest.current.states });
      if (decision === "switch") { practisePage(page); setDeferredPage(null); }
      else setDeferredPage(decision === "defer" ? page : null);
    }, 800);
    return () => clearTimeout(t);
    // Only a change of the page being read (or the toggle) may trigger this, never an answer being given.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow, page, review]);

  function practiseHere() { practisePage(page); setDeferredPage(null); setTab("practise"); }

  useWorkspaceShortcuts({
    choose: ({ index }) => { if (cur && !states[cur.id]?.checked && index < cur.payload.options.length) pick(cur, index); },
    enter: () => {
      if (!cur) return;
      const st = states[cur.id];
      if (st && st.chosen.length > 0 && !st.checked) check(cur);
      else if (st?.checked) setFocusIdx((i) => Math.min(i + 1, qs.length - 1));
    },
    next: () => setFocusIdx((i) => Math.min(i + 1, Math.max(qs.length - 1, 0))),
    previous: () => setFocusIdx((i) => Math.max(i - 1, 0)),
    bookmark: () => { if (cur) bookmark(cur); },
    source: () => { if (cur && activePage) viewer.current?.scrollToPage(activePage, true); },
    retry: () => { if (cur && states[cur.id]?.checked) retry(cur); },
    questions: () => { if (!review) practiseHere(); },
    toggleViewer,
    pdfPrevious: () => viewer.current?.scrollToPage(page - 1),
    pdfNext: () => viewer.current?.scrollToPage(page + 1),
    goToPage: () => jumpInput.current?.focus(),
    help: () => setHelpOpen(true),
  });

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
          {deferredPage !== null && deferredPage !== practisedPage && (
            <button type="button" className={btn} onClick={() => { practisePage(deferredPage); setDeferredPage(null); }}>Page {labelOf(deferredPage)} has {questionsFor(deferredPage).length} questions — Switch</button>
          )}
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
          <p className="min-w-0 flex-1 text-xs leading-5 text-ink-2"><span className="font-medium text-ink">Guest mode — everything is free.</span> Every chapter and every question is open to you. Progress and bookmarks stay in this browser; sign in to sync them across devices.</p>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-2" aria-live="polite">Question {focusIdx + 1} of {qs.length}</span>
                  <ol aria-label="Question progress" className="flex items-center gap-1">
                    {qs.map((q, i) => {
                      const answer = states[q.id];
                      const correct = Boolean(answer?.checked && isCorrect(answer.chosen, q.payload.correct));
                      const incorrect = Boolean(answer?.checked && !correct);
                      const status = correct ? "answered correctly" : incorrect ? "answered incorrectly" : "not answered";
                      const current = i === focusIdx;
                      return (
                        <li key={q.id}>
                          <button type="button" aria-current={current ? "step" : undefined}
                            aria-label={`Go to question ${i + 1}, ${current ? "current, " : ""}${status}`}
                            title={`Question ${i + 1}: ${status}`} onClick={() => setFocusIdx(i)}
                            className={`grid size-6 place-items-center rounded-full border text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring ${
                              current ? "border-brand bg-brand-soft text-brand-text" :
                              correct ? "border-good bg-good-soft text-good" :
                              incorrect ? "border-bad bg-bad-soft text-bad" :
                              "border-line bg-surface text-muted"
                            }`}>
                            {correct ? "✓" : incorrect ? "×" : current ? String(i + 1) : "•"}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
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
    <PdfViewer key={viewerKey} ref={viewer} data={localData} url={localData ? null : pdfUrl} zoom={zoom} darkPages={dark} onPageChange={onPageChange} onReady={onReady}
      onError={() => setPdfIssue(true)} onRetry={() => { setPdfIssue(false); setViewerKey((key) => key + 1); }} />
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
          <input ref={jumpInput} value={jump} onChange={(e) => setJump(e.target.value)} onKeyDown={(e) => e.key === "Enter" && goPrinted()} inputMode="numeric"
            aria-label="Go to printed page" placeholder="Go to page" className="h-9 w-24 rounded-lg border border-control-border bg-field px-2 text-xs" />
          <div className="flex items-center gap-1" role="group" aria-label="PDF zoom">
            <button className={btn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">−</button>
            <span className="w-10 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
            <button className={btn} onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">+</button>
          </div>
          <details className="relative ml-auto lg:hidden">
            <summary className={`${btn} cursor-pointer`}>More</summary>
            <div className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-3 rounded-xl border border-line bg-surface p-3 shadow-window">
              <button className={btn} onClick={toggleViewer}>{showViewer ? "Hide PDF" : "Show PDF"}</button>
              {!review && <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />Follow my reading</label>}
              <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />Invert pages</label>
              {isAdmin && localData && !pdfUrl && <button className={btn} onClick={uploadToStorage} disabled={uploading}>{uploading ? "Uploading…" : "Upload PDF"}</button>}
            </div>
          </details>
          <div className="hidden items-center gap-3 lg:flex">
            {!review && <label className="flex items-center gap-1 text-xs text-ink-2"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />Follow my reading</label>}
            <label className="flex items-center gap-1 text-xs text-ink-2"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />Invert pages</label>
            <button className={btn} onClick={split.toggleSwap}>Swap sides</button>
            <button className={btn} onClick={toggleViewer}>{showViewer ? "Hide" : "Show"} PDF (V)</button>
            {isAdmin && localData && !pdfUrl && <button className={btn} onClick={uploadToStorage} disabled={uploading}>{uploading ? "Uploading…" : "Upload this PDF"}</button>}
          </div>
        </div>
      </div>
      {notice && <p role="alert" className="bg-bad-soft px-3 py-1 text-xs text-bad">{notice}</p>}
      {pdfIssue && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 bg-bad-soft px-3 py-2 text-xs text-bad">
        <span>A PDF page could not be displayed.</span>
        <button type="button" className="rounded-md border border-current px-2 py-1 font-medium" onClick={() => { setPdfIssue(false); setViewerKey((key) => key + 1); }}>Reload PDF</button>
      </div>}
      <div className="flex border-b border-line lg:hidden" role="group" aria-label="Study panels">
        {(["read", "practise"] as const).filter((t) => t !== "read" || showViewer).map((t) => (
          <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm ${tab === t ? "border-b-2 border-brand font-medium text-brand-text" : "text-ink-2"}`}>{t === "read" ? "Read" : review ? "Review" : "Practise"}</button>
        ))}
      </div>
      <div
        ref={attachSplit}
        className={`flex min-h-0 flex-1 flex-col lg:grid ${showViewer ? "" : "lg:grid-cols-1"}`}
        style={showViewer ? { gridTemplateColumns: `minmax(${split.leftMin}px, ${split.leftWidth}px) 12px minmax(${split.rightMin}px, 1fr)` } : undefined}
      >
        <div className={`min-h-0 flex-1 ${tab === "practise" ? "" : "hidden lg:block"} ${showViewer ? (split.swap ? "lg:col-start-3" : "lg:col-start-1") : "lg:col-start-1"}`}>{practicePane}</div>
        {showViewer && (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize question and PDF panels"
              aria-valuemin={split.bounds.min}
              aria-valuemax={split.bounds.max}
              aria-valuenow={split.ratio}
              aria-valuetext={`${split.ratio}% left panel, ${100 - split.ratio}% right panel`}
              tabIndex={0}
              {...split.handleProps}
              onPointerCancel={split.handleProps.onPointerUp}
              onDoubleClick={split.reset}
              className="group hidden touch-none cursor-col-resize items-center justify-center bg-surface-2 outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand-ring lg:flex"
              style={{ gridColumn: 2 }}
            >
              <span className="h-10 w-1 rounded-full bg-line transition-colors group-hover:bg-brand group-focus-visible:bg-brand" />
            </div>
            <div className={`min-h-0 flex-1 ${tab === "read" ? "" : "hidden lg:block"} ${split.swap ? "lg:col-start-1" : "lg:col-start-3"}`}>{viewerPane}</div>
          </>
        )}
      </div>
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
