"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StudyStore } from "./store";
import type { StudyChapter } from "./types";

type Options = { chapter: StudyChapter; store: StudyStore; initialPage: number; seenPages: number[]; pageCount: number; enabled: boolean; ready: boolean };

/**
 * Tracks the page being read, keeps `?p=` in the address bar, remembers which pages were seen and
 * saves progress after the store's delay (800 ms local, 5 s signed in).
 */
export function useReadingProgress({ chapter, store, initialPage, seenPages, pageCount, enabled, ready }: Options) {
  const [page, setPage] = useState(initialPage);
  const seen = useRef<Set<number>>(new Set(seenPages));

  useEffect(() => {
    if (!ready || !enabled) return;
    const url = new URL(window.location.href);
    url.searchParams.set("p", String(page));
    window.history.replaceState(null, "", url);
    seen.current.add(page);
    const timer = setTimeout(() => {
      void store.saveProgress({ chapterId: chapter.id, chapterSlug: chapter.slug, chapterTitle: chapter.title, pageCount, lastPage: page, pagesSeen: [...seen.current] });
    }, store.progressDelayMs);
    return () => clearTimeout(timer);
  }, [page, ready, enabled, store, chapter.id, chapter.slug, chapter.title, pageCount]);

  const onPageChange = useCallback((p: number) => setPage(p), []);
  return { page, onPageChange };
}
