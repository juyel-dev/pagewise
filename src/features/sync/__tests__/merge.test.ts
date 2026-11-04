import { describe, expect, it } from "vitest";
import { mergeProgress, type ProgressRow } from "../merge";

const local = (chapter_id: string, last_page: number, pages_seen: number[], updated_at: string): ProgressRow => ({
  chapter_id,
  last_page,
  pages_seen,
  updated_at,
});

describe("mergeProgress", () => {
  it("keeps local progress when the account has none for that chapter", () => {
    const merged = mergeProgress([local("c1", 5, [1, 2, 5], "2026-11-03T10:00:00.000Z")], []);
    expect(merged).toEqual([{ chapter_id: "c1", last_page: 5, pages_seen: [1, 2, 5], updated_at: "2026-11-03T10:00:00.000Z" }]);
  });

  it("unions pages seen and lets the newer copy choose the last page", () => {
    const merged = mergeProgress(
      [local("c1", 9, [7, 8, 9], "2026-11-03T10:00:00.000Z")],
      [{ chapter_id: "c1", last_page: 4, pages_seen: [1, 2, 4], updated_at: "2026-11-01T10:00:00.000Z" }],
    );
    expect(merged[0]).toEqual({ chapter_id: "c1", last_page: 9, pages_seen: [1, 2, 4, 7, 8, 9], updated_at: "2026-11-03T10:00:00.000Z" });
  });

  it("keeps the account's last page when it is newer, but still unions pages", () => {
    const merged = mergeProgress(
      [local("c1", 2, [1, 2], "2026-10-30T10:00:00.000Z")],
      [{ chapter_id: "c1", last_page: 12, pages_seen: [3, 12], updated_at: "2026-11-02T10:00:00.000Z" }],
    );
    expect(merged[0]).toEqual({ chapter_id: "c1", last_page: 12, pages_seen: [1, 2, 3, 12], updated_at: "2026-11-02T10:00:00.000Z" });
  });

  it("dedupes and sorts pages, and ignores invalid page numbers", () => {
    const merged = mergeProgress(
      [local("c1", 3, [3, 1, 1, 0, -2, 2.5, 3], "2026-11-03T10:00:00.000Z")],
      [{ chapter_id: "c1", last_page: null, pages_seen: [2, 2, 7], updated_at: "2026-11-01T10:00:00.000Z" }],
    );
    expect(merged[0].pages_seen).toEqual([1, 2, 3, 7]);
    expect(merged[0].last_page).toBe(3);
  });

  it("merges each chapter independently", () => {
    const merged = mergeProgress(
      [local("c1", 3, [3], "2026-11-03T10:00:00.000Z"), local("c2", 1, [1], "2026-11-03T10:00:00.000Z")],
      [{ chapter_id: "c2", last_page: 8, pages_seen: [8], updated_at: "2026-11-04T10:00:00.000Z" }],
    );
    expect(merged.map((r) => [r.chapter_id, r.last_page])).toEqual([["c1", 3], ["c2", 8]]);
  });
});
