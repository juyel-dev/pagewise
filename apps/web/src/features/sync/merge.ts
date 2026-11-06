import type { LocalProgress } from "@/lib/local/types";

export type ProgressRow = Pick<LocalProgress, "chapter_id" | "last_page" | "pages_seen" | "updated_at">;

export type ExistingProgress = {
  chapter_id: string;
  last_page: number | null;
  pages_seen: number[] | null;
  updated_at: string;
};

function uniquePages(pages: number[]): number[] {
  return [...new Set(pages.filter((n) => Number.isInteger(n) && n >= 1))].sort((a, b) => a - b);
}

/**
 * Merge guest progress into an account without losing either side:
 * pages seen are unioned, and the last page comes from whichever copy is newer.
 */
export function mergeProgress(local: ProgressRow[], existing: ExistingProgress[]): ProgressRow[] {
  const byChapter = new Map(existing.map((r) => [r.chapter_id, r]));
  return local.map((l) => {
    const e = byChapter.get(l.chapter_id);
    const localPages = uniquePages(l.pages_seen);
    if (!e) {
      return { chapter_id: l.chapter_id, last_page: Math.max(1, l.last_page), pages_seen: localPages, updated_at: l.updated_at };
    }
    const localNewer = Date.parse(l.updated_at) >= Date.parse(e.updated_at);
    return {
      chapter_id: l.chapter_id,
      last_page: localNewer ? Math.max(1, l.last_page) : Math.max(1, e.last_page ?? 1),
      pages_seen: uniquePages([...(e.pages_seen ?? []), ...localPages]),
      updated_at: localNewer ? l.updated_at : e.updated_at,
    };
  });
}
