/**
 * Where a student's study data is saved. The workspace talks to one `StudyStore`; whether the
 * student is a guest (this browser) or signed in (the database) is decided once, here, instead of
 * with `if (guest)` branches everywhere (docs/blueprint/14 §4, decision 38).
 */
export type AttemptInput = { questionId: string; versionId: string; chapterId: string; chosen: number[]; timeMs: number; attemptNo: number; correct: boolean };
export type BookmarkInput = { questionId: string; on: boolean; chapter: { id: string; slug: string; title: string }; page: number; stem: string };
export type ProgressInput = { chapterId: string; chapterSlug: string; chapterTitle: string; pageCount: number; lastPage: number; pagesSeen: number[] };

export interface StudyStore {
  readonly kind: "local" | "remote";
  /** How long to wait after a page change before saving reading progress. */
  readonly progressDelayMs: number;
  /** Resolves true when saved. Never throws. */
  recordAttempt(i: AttemptInput): Promise<boolean>;
  setBookmark(i: BookmarkInput): Promise<boolean>;
  saveProgress(i: ProgressInput): Promise<boolean>;
  /** Bookmarks saved on this device (local store only; the server sends them with the page). */
  loadBookmarkedIds(): Promise<string[] | null>;
}

export type LocalApi = {
  addAttempt(a: { question_id: string; version_id: string; chapter_id: string; chosen: number[]; is_correct: boolean; attempt_no: number; time_ms: number; source: string; release: string; created_at: string }): Promise<void>;
  saveBookmark(b: { question_id: string; chapter_id: string; chapter_slug: string; chapter_title: string; page: number; stem: string; created_at: string }): Promise<void>;
  removeBookmark(questionId: string): Promise<void>;
  saveProgress(p: { chapter_id: string; chapter_slug: string; chapter_title: string; page_count: number; last_page: number; pages_seen: number[]; updated_at: string }): Promise<void>;
  listBookmarks(): Promise<{ question_id: string }[]>;
};

export type RemoteApi = {
  recordAttempt(i: { questionId: string; versionId: string; chosen: number[]; timeMs: number; attemptNo: number; release: string; source: string }): Promise<{ ok: boolean }>;
  toggleBookmark(i: { questionId: string; on: boolean }): Promise<{ ok: boolean }>;
  saveProgress(i: { chapterId: string; lastPage: number; pagesSeen: number[] }): Promise<{ ok: boolean }>;
};

const safe = async (task: () => Promise<boolean | void>): Promise<boolean> => {
  try { return (await task()) !== false; } catch { return false; }
};

/** Guests: everything stays in IndexedDB until they sign in (then `syncLocalData` merges it). */
export function createLocalStore(api: LocalApi, now: () => Date = () => new Date()): StudyStore {
  return {
    kind: "local",
    progressDelayMs: 800,
    recordAttempt: (i) => safe(() => api.addAttempt({
      question_id: i.questionId, version_id: i.versionId, chapter_id: i.chapterId, chosen: i.chosen, is_correct: i.correct,
      attempt_no: i.attemptNo, time_ms: Math.max(0, i.timeMs), source: "workspace", release: "local", created_at: now().toISOString(),
    })),
    setBookmark: (i) => safe(() => i.on
      ? api.saveBookmark({ question_id: i.questionId, chapter_id: i.chapter.id, chapter_slug: i.chapter.slug, chapter_title: i.chapter.title, page: i.page, stem: i.stem, created_at: now().toISOString() })
      : api.removeBookmark(i.questionId)),
    saveProgress: (i) => safe(() => api.saveProgress({
      chapter_id: i.chapterId, chapter_slug: i.chapterSlug, chapter_title: i.chapterTitle, page_count: i.pageCount,
      last_page: i.lastPage, pages_seen: i.pagesSeen, updated_at: now().toISOString(),
    })),
    loadBookmarkedIds: async () => { try { return (await api.listBookmarks()).map((b) => b.question_id); } catch { return null; } },
  };
}

/** Signed-in students: server actions. Correctness is decided by the database, so `correct` is not sent (decision 41). */
export function createRemoteStore(api: RemoteApi): StudyStore {
  return {
    kind: "remote",
    progressDelayMs: 5000,
    recordAttempt: (i) => safe(async () => (await api.recordAttempt({ questionId: i.questionId, versionId: i.versionId, chosen: i.chosen, timeMs: i.timeMs, attemptNo: i.attemptNo, release: "db", source: "workspace" })).ok),
    setBookmark: (i) => safe(async () => (await api.toggleBookmark({ questionId: i.questionId, on: i.on })).ok),
    saveProgress: (i) => safe(async () => (await api.saveProgress({ chapterId: i.chapterId, lastPage: i.lastPage, pagesSeen: i.pagesSeen })).ok),
    loadBookmarkedIds: async () => null,
  };
}
