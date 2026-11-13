import { describe, expect, it, vi } from "vitest";
import { createLocalStore, createRemoteStore, type LocalApi, type RemoteApi } from "../store";

const attempt = { questionId: "q1", versionId: "v1", chapterId: "c1", chosen: [1], timeMs: 1234, attemptNo: 1, correct: true };
const chapter = { id: "c1", slug: "ch-1", title: "The Living World" };
const fixed = () => new Date("2026-11-08T10:00:00.000Z");

function localApi(over: Partial<LocalApi> = {}): LocalApi {
  return { addAttempt: vi.fn().mockResolvedValue(undefined), saveBookmark: vi.fn().mockResolvedValue(undefined), removeBookmark: vi.fn().mockResolvedValue(undefined), saveProgress: vi.fn().mockResolvedValue(undefined), listBookmarks: vi.fn().mockResolvedValue([{ question_id: "q9" }]), ...over };
}
function remoteApi(over: Partial<RemoteApi> = {}): RemoteApi {
  return { recordAttempt: vi.fn().mockResolvedValue({ ok: true }), toggleBookmark: vi.fn().mockResolvedValue({ ok: true }), saveProgress: vi.fn().mockResolvedValue({ ok: true }), ...over };
}

describe("local store (guests)", () => {
  it("saves attempts on this device with the local correctness and a timestamp", async () => {
    const api = localApi();
    expect(await createLocalStore(api, fixed).recordAttempt(attempt)).toBe(true);
    expect(api.addAttempt).toHaveBeenCalledWith({ question_id: "q1", version_id: "v1", chapter_id: "c1", chosen: [1], is_correct: true, attempt_no: 1, time_ms: 1234, source: "workspace", release: "local", created_at: "2026-11-08T10:00:00.000Z" });
  });
  it("never stores a negative time", async () => {
    const api = localApi();
    await createLocalStore(api, fixed).recordAttempt({ ...attempt, timeMs: -50 });
    expect(vi.mocked(api.addAttempt).mock.calls[0][0].time_ms).toBe(0);
  });
  it("adds and removes bookmarks", async () => {
    const api = localApi();
    const store = createLocalStore(api, fixed);
    expect(await store.setBookmark({ questionId: "q1", on: true, chapter, page: 4, stem: "Which tissue…?" })).toBe(true);
    expect(api.saveBookmark).toHaveBeenCalledWith({ question_id: "q1", chapter_id: "c1", chapter_slug: "ch-1", chapter_title: "The Living World", page: 4, stem: "Which tissue…?", created_at: "2026-11-08T10:00:00.000Z" });
    expect(await store.setBookmark({ questionId: "q1", on: false, chapter, page: 4, stem: "" })).toBe(true);
    expect(api.removeBookmark).toHaveBeenCalledWith("q1");
  });
  it("saves progress and lists saved bookmark ids", async () => {
    const api = localApi();
    const store = createLocalStore(api, fixed);
    expect(await store.saveProgress({ chapterId: "c1", chapterSlug: "ch-1", chapterTitle: "T", pageCount: 9, lastPage: 4, pagesSeen: [1, 2, 4] })).toBe(true);
    expect(api.saveProgress).toHaveBeenCalledWith({ chapter_id: "c1", chapter_slug: "ch-1", chapter_title: "T", page_count: 9, last_page: 4, pages_seen: [1, 2, 4], updated_at: "2026-11-08T10:00:00.000Z" });
    expect(await store.loadBookmarkedIds()).toEqual(["q9"]);
  });
  it("reports failure instead of throwing when the browser store breaks", async () => {
    const boom = vi.fn().mockRejectedValue(new Error("quota"));
    const store = createLocalStore(localApi({ addAttempt: boom, saveBookmark: boom, saveProgress: boom, listBookmarks: boom }), fixed);
    expect(await store.recordAttempt(attempt)).toBe(false);
    expect(await store.setBookmark({ questionId: "q", on: true, chapter, page: 1, stem: "" })).toBe(false);
    expect(await store.saveProgress({ chapterId: "c", chapterSlug: "s", chapterTitle: "t", pageCount: 1, lastPage: 1, pagesSeen: [1] })).toBe(false);
    expect(await store.loadBookmarkedIds()).toBeNull();
  });
  it("waits 800 ms before saving progress", () => expect(createLocalStore(localApi()).progressDelayMs).toBe(800));
});

describe("remote store (signed in)", () => {
  it("sends the answer but never the correctness (the database decides)", async () => {
    const api = remoteApi();
    expect(await createRemoteStore(api).recordAttempt(attempt)).toBe(true);
    const sent = vi.mocked(api.recordAttempt).mock.calls[0][0];
    expect(sent).toEqual({ questionId: "q1", versionId: "v1", chosen: [1], timeMs: 1234, attemptNo: 1, release: "db", source: "workspace" });
    expect(sent).not.toHaveProperty("correct");
    expect(sent).not.toHaveProperty("isCorrect");
  });
  it("maps ok:false and thrown errors to false", async () => {
    expect(await createRemoteStore(remoteApi({ recordAttempt: vi.fn().mockResolvedValue({ ok: false }) })).recordAttempt(attempt)).toBe(false);
    expect(await createRemoteStore(remoteApi({ toggleBookmark: vi.fn().mockRejectedValue(new Error("net")) })).setBookmark({ questionId: "q", on: true, chapter, page: 1, stem: "" })).toBe(false);
  });
  it("toggles bookmarks and saves progress through the actions", async () => {
    const api = remoteApi();
    const store = createRemoteStore(api);
    expect(await store.setBookmark({ questionId: "q1", on: true, chapter, page: 4, stem: "x" })).toBe(true);
    expect(api.toggleBookmark).toHaveBeenCalledWith({ questionId: "q1", on: true });
    expect(await store.saveProgress({ chapterId: "c1", chapterSlug: "s", chapterTitle: "t", pageCount: 9, lastPage: 4, pagesSeen: [4] })).toBe(true);
    expect(api.saveProgress).toHaveBeenCalledWith({ chapterId: "c1", lastPage: 4, pagesSeen: [4] });
    expect(await store.loadBookmarkedIds()).toBeNull();
  });
  it("waits 5 s before saving progress", () => expect(createRemoteStore(remoteApi()).progressDelayMs).toBe(5000));
});
