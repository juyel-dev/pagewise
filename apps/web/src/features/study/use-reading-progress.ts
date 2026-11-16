"use client";

import { useEffect, useState } from "react";
import type { StudyStore } from "./store";
import type { StudyChapter } from "./types";

type Options = { chapter: StudyChapter; store: StudyStore; initialPage: number; seenPages: number[]; pageCount: number; enabled: boolean; ready: boolean };

/**
 * Tracks the page being read, keeps `?p=` in the address bar, remembers which pages were seen and
 * saves progress after the store's delay (800 ms local, 5 s signed in).
 */
export function useReadingProgress({ chapter, store, initialPage, seenPages, pageCount, enabled, ready }: Options) {
  const [page, setPage] = useState(initialPage);
  // Pages the student has been on: what was saved before, plus every page visited in this session.
  const [seen, setSeen] = useState<Set<number>>(() => new Set([...seenPages, initialPage]));

  useEffect(() => {
    if (!ready || !enabled) return;
    const url = new URL(window.location.href);
    url.searchParams.set("p", String(page));
    window.history.replaceState(null, "", url);
    const timer = setTimeout(() => {
      void store.saveProgress({ chapterId: chapter.id, chapterSlug: chapter.slug, chapterTitle: chapter.title, pageCount, lastPage: page, pagesSeen: [...seen].sort((a, b) => a - b) });
    }, store.progressDelayMs);
    return () => clearTimeout(timer);
  }, [page, seen, ready, enabled, store, chapter.id, chapter.slug, chapter.title, pageCount]);

  const onPageChange = (p: number) => {
    setPage(p);
    setSeen((prev) => (prev.has(p) ? prev : new Set(prev).add(p)));
  };
  return { page, onPageChange, seenCount: seen.size };
}
