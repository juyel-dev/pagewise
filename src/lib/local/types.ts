/** Shared local-first types. Safe to import from both client components and server actions. */

export type LocalBookmark = {
  question_id: string;
  chapter_id: string;
  chapter_slug: string;
  chapter_title: string;
  /** PDF page the question belongs to. */
  page: number;
  /** Question stem snapshot, so the bookmarks page renders without a server round-trip. */
  stem: string;
  created_at: string;
};

export type LocalProgress = {
  chapter_id: string;
  chapter_slug: string;
  chapter_title: string;
  page_count: number;
  last_page: number;
  pages_seen: number[];
  updated_at: string;
};

export type LocalAttempt = {
  /** IndexedDB auto-increment key; never sent to the server. */
  id?: number;
  question_id: string;
  version_id: string | null;
  chapter_id: string;
  chosen: number[];
  is_correct: boolean;
  attempt_no: number;
  time_ms: number;
  source: string;
  release: string;
  created_at: string;
};

export type LocalSnapshot = {
  bookmarks: LocalBookmark[];
  progress: LocalProgress[];
  attempts: LocalAttempt[];
};

export type SyncCounts = { bookmarks: number; progress: number; attempts: number };
