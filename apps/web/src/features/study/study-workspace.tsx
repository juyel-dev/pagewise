"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PdfViewer, type PdfViewerHandle } from "@/components/viewer/pdf-viewer";
import { createClient } from "@/lib/supabase/client";
import { setQuestionStatus } from "../review/actions";
import { followDecision, nextPageWithQuestions, pageSummary, pagesWithQuestions, primaryAction } from "./logic";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/chip";
import { PageChipRail } from "./page-chip-rail";
import { PageSummary } from "./page-summary";
import { PdfToolbar } from "./pdf-toolbar";
import { PracticeFooter } from "./practice-footer";
import { QuestionCard } from "./question-card";
import { StudyTabs } from "./study-tabs";
import { WorkspaceHeader } from "./workspace-header";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { createStudyStore } from "./store-wiring";
import type { PageMapRow, StudyChapter, StudyQuestion } from "./types";
import { usePracticeSession } from "./use-practice-session";
import { useReadingProgress } from "./use-reading-progress";
import { useSplitPane } from "./use-split-pane";
import { useWorkspaceShortcuts } from "./use-workspace-shortcuts";

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
  const [showSummary, setShowSummary] = useState(false);
  const [pdfIssue, setPdfIssue] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [jump, setJump] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const readyRef = useRef(false);

  const total = numPages || chapter.pageCount;
  const { page, onPageChange, seenCount } = useReadingProgress({ chapter, store, initialPage, seenPages, pageCount: total, enabled: !review, ready: viewerReady });
  const { states, bookmarks, practisedPage, practisePage, focusIdx, setFocusIdx, notice, setNotice, pick, check, retry, toggleBookmark } = usePracticeSession({ chapter, store, questionsByPage, bookmarkedIds, initialPage });

  const labelOf = (p: number) => pageMap.find((m) => m.pdf_page === p)?.printed_label ?? String(p);
  const signInHref = `/sign-in?next=${encodeURIComponent(`/study/${chapter.slug}?p=${page}`)}`;
  const questionsFor = (p: number | null): StudyQuestion[] => (p ? questionsByPage[String(p)] ?? [] : []);
  const hasAny = Object.values(questionsByPage).some((l) => l.length > 0);
  const here = questionsFor(page).length;
  const activePage = review ? page : practisedPage;
  const qs = questionsFor(activePage);
  const nextWithQ = nextPageWithQuestions(questionsByPage, page);
  const nextPracticePage = activePage ? nextPageWithQuestions(questionsByPage, activePage) : undefined;
  const summary = pageSummary(qs, states);
  const isLast = qs.length === 0 || focusIdx >= qs.length - 1;
  const cur = qs[Math.min(focusIdx, Math.max(qs.length - 1, 0))];
  const effMode = review ? "list" : mode;
  const hasSource = Boolean(pdfUrl || localData);
  const bookmark = (q: StudyQuestion) => toggleBookmark(q, activePage ?? page);

  function selectPage(p: number | null) { practisePage(p); setShowSummary(false); }
  function goNext() {
    if (!isLast) setFocusIdx((i) => i + 1);
    else if (cur && states[cur.id]?.checked) setShowSummary(true);
  }
  function goNextPage() {
    if (nextPracticePage === undefined) return;
    selectPage(nextPracticePage);
    viewer.current?.scrollToPage(nextPracticePage);
  }
  const primary = primaryAction({ state: cur ? states[cur.id] : undefined, isLast, summaryShown: showSummary, hasNextPage: nextPracticePage !== undefined });
  function runPrimary() {
    if (primary === "check" && cur) check(cur);
    else if (primary === "next" || primary === "summary") goNext();
    else if (primary === "nextPage") goNextPage();
  }
  function retryMissed() {
    const missed = qs.filter((q) => summary.wrongIds.includes(q.id));
    missed.forEach(retry);
    setShowSummary(false);
    setMode("focus");
    setFocusIdx(Math.max(0, qs.findIndex((q) => q.id === missed[0]?.id)));
  }
  function keepReading() { setShowSummary(false); setMode("list"); }

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
      if (decision === "switch") { selectPage(page); setDeferredPage(null); }
      else setDeferredPage(decision === "defer" ? page : null);
    }, 800);
    return () => clearTimeout(t);
    // Only a change of the page being read (or the toggle) may trigger this, never an answer being given.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow, page, review]);

  function practiseHere() { selectPage(page); setDeferredPage(null); setTab("practise"); }

  useWorkspaceShortcuts({
    choose: ({ index }) => { if (cur && !states[cur.id]?.checked && index < cur.payload.options.length) pick(cur, index); },
    enter: () => {
      if (!cur) return;
      const st = states[cur.id];
      if (st && st.chosen.length > 0 && !st.checked) check(cur);
      else if (st?.checked) goNext();
    },
    next: () => goNext(),
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

  const railPages = pagesWithQuestions(questionsByPage).map((p) => ({ pdfPage: p, label: labelOf(p), count: questionsByPage[String(p)].length, complete: pageSummary(questionsByPage[String(p)], states).complete }));
  const nextPracticeLabel = nextPracticePage !== undefined ? labelOf(nextPracticePage) : undefined;

  const practicePane = (
    <section aria-label={review ? "Review" : "Practice"} className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3">
        {review ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Review mode · staff only</Badge>
            <Button size="sm" disabled={pending || qs.every((q) => q.status === "published") || qs.length === 0}
              onClick={() => setStatus(qs.filter((q) => q.status !== "published").map((q) => q.id), "published")}>
              Publish all on this page ({qs.filter((q) => q.status !== "published").length})
            </Button>
          </div>
        ) : (
          <>
            <PageChipRail pages={railPages} current={practisedPage} onSelect={(p) => { selectPage(p); viewer.current?.scrollToPage(p); }} />
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl label="Question view" size="sm" value={mode} onChange={setMode} options={[{ value: "focus", label: "Focus" }, { value: "list", label: "List" }]} />
              <Switch label="Follow my reading" checked={follow} onCheckedChange={setFollow} className="ml-auto min-h-0" />
            </div>
          </>
        )}
        <p className="text-small text-muted" aria-live="polite">Reading: PDF page {page} · printed page {labelOf(page)}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
        <div className="mx-auto flex max-w-[720px] flex-col gap-4">
          {guest && !review && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-brand/20 bg-brand-soft px-3 py-2.5">
              <p className="min-w-0 flex-1 text-small text-ink-2"><span className="font-medium text-ink">Guest mode — everything is free.</span> Progress and bookmarks stay in this browser. Sign in to keep them on all your devices.</p>
              <Link href={signInHref} className="shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-small font-medium text-white hover:bg-brand-hover">Sign in</Link>
            </div>
          )}
          {deferredPage !== null && deferredPage !== practisedPage && !review && (
            <button type="button" className="self-start rounded-full bg-accent-soft px-3 py-1.5 text-small text-accent-text hover:underline" onClick={() => { selectPage(deferredPage); setDeferredPage(null); }}>
              Page {labelOf(deferredPage)} has {questionsFor(deferredPage).length} questions — Switch
            </button>
          )}

          {!hasAny && !review && <EmptyState title="Questions are on the way">Questions for this chapter are still being reviewed. Every question is checked before it is published, so none are shown yet. You can read the chapter now.</EmptyState>}
          {!hasAny && review && <EmptyState title="No questions yet">No questions in this chapter yet. Import them from Admin → Import questions.</EmptyState>}
          {hasAny && !activePage && !review && (
            <EmptyState title="No questions on this page" action={nextWithQ ? <Button variant="secondary" onClick={() => { selectPage(nextWithQ); viewer.current?.scrollToPage(nextWithQ); }}>Go to page {labelOf(nextWithQ)}</Button> : undefined}>
              {nextWithQ ? `The next page with questions is page ${labelOf(nextWithQ)}.` : "There are no more pages with questions after this one."}
            </EmptyState>
          )}
          {review && hasAny && qs.length === 0 && <EmptyState title="No questions on this page">{nextWithQ ? "Use the page controls to go to the next page with questions." : "There are no more pages with questions after this one."}</EmptyState>}

          {activePage && qs.length > 0 && (
            showSummary && !review ? (
              <PageSummary summary={summary} nextPageLabel={nextPracticeLabel} onNextPage={nextPracticePage !== undefined ? goNextPage : undefined} onRetryMissed={retryMissed} onKeepReading={keepReading} />
            ) : (
              <>
                <h2 className="text-label text-ink-2">Questions for printed page {labelOf(activePage)}</h2>
                {effMode === "focus" && cur && (
                  <QuestionCard q={cur} index={Math.min(focusIdx, qs.length - 1)} total={qs.length} state={states[cur.id]} bookmarked={bookmarks.has(cur.id)}
                    onPick={(i) => pick(cur, i)} onCheck={() => check(cur)} onRetry={() => retry(cur)} onBookmark={() => bookmark(cur)} onSource={() => viewer.current?.scrollToPage(activePage, true)} />
                )}
                {effMode === "list" && qs.map((q, i) => (
                  <QuestionCard key={q.id} q={q} index={i} total={qs.length} state={states[q.id]} bookmarked={bookmarks.has(q.id)}
                    review={review ? { busy: pending, onSet: (st) => setStatus([q.id], st) } : undefined}
                    onPick={(oi) => pick(q, oi)} onCheck={() => check(q)} onRetry={() => retry(q)} onBookmark={() => bookmark(q)} onSource={() => viewer.current?.scrollToPage(activePage, true)} />
                ))}
              </>
            )
          )}
        </div>
      </div>

      {!review && effMode === "focus" && activePage && qs.length > 0 && (
        <PracticeFooter questions={qs} states={states} index={Math.min(focusIdx, qs.length - 1)} onSelect={setFocusIdx}
          onPrevious={() => { setShowSummary(false); setFocusIdx((i) => Math.max(0, i - 1)); }} onNext={goNext}
          primary={primary} onPrimary={runPrimary} canShowSource={Boolean(cur && states[cur.id]?.checked)} onSource={() => viewer.current?.scrollToPage(activePage, true)} />
      )}
    </section>
  );

  const viewerContent = hasSource ? (
    <PdfViewer key={viewerKey} ref={viewer} data={localData} url={localData ? null : pdfUrl} zoom={zoom} darkPages={dark} onPageChange={onPageChange} onReady={onReady}
      onError={() => setPdfIssue(true)} onRetry={() => { setPdfIssue(false); setViewerKey((key) => key + 1); }} />
  ) : (
    <EmptyState className="h-full justify-center" title="Chapter PDF not available yet"
      action={isAdmin ? <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-brand px-4 text-label text-white hover:bg-brand-hover">Choose PDF from device<input type="file" accept="application/pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} /></label> : undefined}>
      {isAdmin ? "Choose the chapter PDF from your device to read it now. You can then upload it to private storage." : "The NCERT page for this chapter is not published yet."}
    </EmptyState>
  );

  const viewerPane = (
    <div className="flex h-full min-h-0 flex-col bg-surface-2">
      <PdfToolbar page={page} total={total} label={labelOf(page)} hasSource={hasSource}
        onPrevious={() => viewer.current?.scrollToPage(page - 1)} onNext={() => viewer.current?.scrollToPage(page + 1)}
        jump={jump} onJumpChange={setJump} onJumpSubmit={goPrinted} jumpInput={jumpInput}
        zoom={zoom} onZoom={setZoom} dark={dark} onDark={setDark} showViewer={showViewer} onToggleViewer={toggleViewer} onSwap={split.toggleSwap}
        extra={isAdmin && localData && !pdfUrl ? <Button variant="secondary" size="sm" onClick={uploadToStorage} disabled={uploading}>{uploading ? "Uploading…" : "Upload this PDF"}</Button> : undefined} />
      <div className="min-h-0 flex-1">{viewerContent}</div>
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <WorkspaceHeader backHref={review ? "/review" : "/study"} backLabel={review ? "Review" : "Study"} title={chapter.title} draft={chapter.status === "draft"} seen={seenCount} total={total} />
      {notice && <p role="alert" className="bg-bad-soft px-4 py-1.5 text-small text-bad">{notice}</p>}
      {pdfIssue && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 bg-bad-soft px-4 py-2 text-small text-bad">
        <span>A PDF page could not be displayed.</span>
        <Button variant="secondary" size="sm" onClick={() => { setPdfIssue(false); setViewerKey((key) => key + 1); }}>Reload PDF</Button>
      </div>}
      <StudyTabs value={tab} onChange={setTab} showRead={showViewer} practiseLabel={review ? "Review" : "Practise"} />
      <div
        ref={attachSplit}
        className={`flex min-h-0 flex-1 flex-col lg:grid ${showViewer ? "" : "lg:grid-cols-1"}`}
        style={showViewer ? { gridTemplateColumns: `minmax(${split.leftMin}px, ${split.leftWidth}px) 12px minmax(${split.rightMin}px, 1fr)` } : undefined}
      >
        <div id="study-pane-practise" role="tabpanel" aria-labelledby="study-tab-practise" className={`min-h-0 flex-1 ${tab === "practise" ? "" : "hidden lg:block"} ${showViewer ? (split.swap ? "lg:col-start-3" : "lg:col-start-1") : "lg:col-start-1"}`}>{practicePane}</div>
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
            <div id="study-pane-read" role="tabpanel" aria-labelledby="study-tab-read" className={`min-h-0 flex-1 ${tab === "read" ? "" : "hidden lg:block"} ${split.swap ? "lg:col-start-1" : "lg:col-start-3"}`}>{viewerPane}</div>
          </>
        )}
      </div>
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
