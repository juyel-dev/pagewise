"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkAnswer, firstUnansweredIndex, pickOption, retryQuestion, type QuestionsByPage } from "./logic";
import type { StudyStore } from "./store";
import type { QState, StudyChapter, StudyQuestion } from "./types";

const nowMs = () => Date.now();

type Options = { chapter: StudyChapter; store: StudyStore; questionsByPage: QuestionsByPage; bookmarkedIds: string[] };

/**
 * Practice state for the workspace: answers, bookmarks, which page is being practised and which
 * question is in focus. Saving goes through the `StudyStore`, so this hook never asks "guest or not?".
 */
export function usePracticeSession({ chapter, store, questionsByPage, bookmarkedIds }: Options) {
  const [states, setStates] = useState<Record<string, QState>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set(bookmarkedIds));
  const [practisedPage, setPractisedPage] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const [notice, setNotice] = useState("");
  const startedAt = useRef<Record<string, number>>({});

  // Guests: bookmarks saved in this browser.
  useEffect(() => {
    let alive = true;
    void store.loadBookmarkedIds().then((ids) => { if (alive && ids && ids.length > 0) setBookmarks(new Set(ids)); });
    return () => { alive = false; };
  }, [store]);

  const practisePage = useCallback((page: number | null) => {
    setPractisedPage(page);
    setFocusIdx(page === null ? 0 : firstUnansweredIndex(questionsByPage[String(page)] ?? [], states));
  }, [questionsByPage, states]);

  const pick = useCallback((q: StudyQuestion, index: number) => {
    startedAt.current[q.id] ??= nowMs();
    setStates((s) => ({ ...s, [q.id]: pickOption(q, s[q.id], index) }));
  }, []);

  const check = useCallback((q: StudyQuestion) => {
    const result = checkAnswer(q, states[q.id]);
    if (!result) return;
    setStates((s) => ({ ...s, [q.id]: result.next }));
    const timeMs = Math.max(0, nowMs() - (startedAt.current[q.id] ?? nowMs()));
    void store.recordAttempt({
      questionId: q.id, versionId: q.version_id, chapterId: chapter.id, chosen: result.next.chosen,
      timeMs, attemptNo: result.next.attemptNo, correct: result.correct,
    }).then((ok) => {
      if (!ok) setNotice(store.kind === "local" ? "Your answer could not be saved in this browser." : "Your answer could not be saved. Check your connection.");
    });
  }, [states, store, chapter.id]);

  const retry = useCallback((q: StudyQuestion) => {
    startedAt.current[q.id] = nowMs();
    setStates((s) => ({ ...s, [q.id]: retryQuestion(s[q.id]) }));
  }, []);

  const toggleBookmark = useCallback((q: StudyQuestion, page: number) => {
    const on = !bookmarks.has(q.id);
    const apply = (value: boolean) => setBookmarks((b) => { const n = new Set(b); if (value) n.add(q.id); else n.delete(q.id); return n; });
    apply(on);
    void store.setBookmark({ questionId: q.id, on, chapter: { id: chapter.id, slug: chapter.slug, title: chapter.title }, page, stem: q.payload.question }).then((ok) => {
      if (!ok) { apply(!on); setNotice(store.kind === "local" ? "Could not update the bookmark in this browser." : "Could not update the bookmark."); }
    });
  }, [bookmarks, store, chapter.id, chapter.slug, chapter.title]);

  return { states, bookmarks, practisedPage, practisePage, focusIdx, setFocusIdx, notice, setNotice, pick, check, retry, toggleBookmark };
}
