// @vitest-environment jsdom
import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionsByPage } from "../logic";
import type { StudyStore } from "../store";
import type { StudyChapter, StudyQuestion } from "../types";
import { usePracticeSession } from "../use-practice-session";
import { useReadingProgress } from "../use-reading-progress";
import { useSplitPane } from "../use-split-pane";
import { useWorkspaceShortcuts } from "../use-workspace-shortcuts";

const chapter: StudyChapter = { id: "c1", slug: "ch-1", title: "The Living World", pageCount: 9, status: "live", unit: null, pdfSha256: null };
const q = (id: string, correct: number[], type: StudyQuestion["type"] = "single_correct"): StudyQuestion => ({
  id, version_id: `v-${id}`, type, difficulty: "easy", status: "published",
  payload: { topic: "t", question: "Stem?", options: ["a", "b", "c", "d"], correct, explanation: "e", source_text: "s", question_origin: "fixture", verification: "fixture" } as StudyQuestion["payload"],
});

function fakeStore(over: Partial<StudyStore> = {}): StudyStore {
  return {
    kind: "remote", progressDelayMs: 1000,
    recordAttempt: vi.fn().mockResolvedValue(true), setBookmark: vi.fn().mockResolvedValue(true),
    saveProgress: vi.fn().mockResolvedValue(true), loadBookmarkedIds: vi.fn().mockResolvedValue(null), ...over,
  };
}

describe("usePracticeSession", () => {
  const map: QuestionsByPage = { "4": [q("a", [1]), q("b", [0, 2], "multiple_correct")] };
  const setup = (store = fakeStore(), bookmarkedIds: string[] = []) => renderHook(() => usePracticeSession({ chapter, store, questionsByPage: map, bookmarkedIds }));

  it("pick then check saves the attempt without sending correctness, and locks the answer", async () => {
    const store = fakeStore();
    const { result } = setup(store);
    act(() => result.current.pick(map["4"][0], 1));
    expect(result.current.states.a).toMatchObject({ chosen: [1], checked: false });
    act(() => result.current.check(map["4"][0]));
    expect(result.current.states.a).toMatchObject({ checked: true, firstCorrect: true });
    expect(store.recordAttempt).toHaveBeenCalledTimes(1);
    expect(vi.mocked(store.recordAttempt).mock.calls[0][0]).toMatchObject({ questionId: "a", versionId: "v-a", chapterId: "c1", chosen: [1], attemptNo: 1 });
  });
  it("a second check on a locked answer does nothing (no duplicate attempt)", () => {
    const store = fakeStore();
    const { result } = setup(store);
    act(() => result.current.pick(map["4"][0], 1));
    act(() => result.current.check(map["4"][0]));
    act(() => result.current.check(map["4"][0]));
    expect(store.recordAttempt).toHaveBeenCalledTimes(1);
  });
  it("check without a choice does nothing", () => {
    const store = fakeStore();
    const { result } = setup(store);
    act(() => result.current.check(map["4"][0]));
    expect(store.recordAttempt).not.toHaveBeenCalled();
  });
  it("retry starts attempt 2 and keeps the first attempt's result", () => {
    const store = fakeStore();
    const { result } = setup(store);
    act(() => result.current.pick(map["4"][0], 3));
    act(() => result.current.check(map["4"][0]));
    act(() => result.current.retry(map["4"][0]));
    expect(result.current.states.a).toMatchObject({ chosen: [], checked: false, attemptNo: 2, firstCorrect: false });
    act(() => result.current.pick(map["4"][0], 1));
    act(() => result.current.check(map["4"][0]));
    expect(vi.mocked(store.recordAttempt).mock.calls[1][0]).toMatchObject({ attemptNo: 2, correct: true });
    expect(result.current.states.a.firstCorrect).toBe(false);
  });
  it("shows a notice when saving fails, worded for the store kind", async () => {
    const { result } = setup(fakeStore({ recordAttempt: vi.fn().mockResolvedValue(false) }));
    act(() => result.current.pick(map["4"][0], 1));
    await act(async () => result.current.check(map["4"][0]));
    expect(result.current.notice).toMatch(/Check your connection/);
    const local = setup(fakeStore({ kind: "local", recordAttempt: vi.fn().mockResolvedValue(false) }));
    act(() => local.result.current.pick(map["4"][0], 1));
    await act(async () => local.result.current.check(map["4"][0]));
    expect(local.result.current.notice).toMatch(/in this browser/);
  });
  it("bookmarks are optimistic and roll back with a notice on failure", async () => {
    const store = fakeStore({ setBookmark: vi.fn().mockResolvedValue(false) });
    const { result } = setup(store);
    await act(async () => result.current.toggleBookmark(map["4"][0], 4));
    expect(result.current.bookmarks.has("a")).toBe(false);
    expect(result.current.notice).toMatch(/bookmark/);
    expect(vi.mocked(store.setBookmark).mock.calls[0][0]).toMatchObject({ questionId: "a", on: true, page: 4, stem: "Stem?" });
  });
  it("bookmarks toggle on and off, starting from the server-provided ids", async () => {
    const { result } = setup(fakeStore(), ["a"]);
    expect(result.current.bookmarks.has("a")).toBe(true);
    await act(async () => result.current.toggleBookmark(map["4"][0], 4));
    expect(result.current.bookmarks.has("a")).toBe(false);
  });
  it("hydrates local bookmarks from the store", async () => {
    const store = fakeStore({ loadBookmarkedIds: vi.fn().mockResolvedValue(["b"]) });
    const { result } = renderHook(() => usePracticeSession({ chapter, store, questionsByPage: map, bookmarkedIds: [] }));
    await act(async () => {});
    expect(result.current.bookmarks.has("b")).toBe(true);
  });
  it("practisePage focuses the first unanswered question", () => {
    const { result } = setup();
    act(() => result.current.pick(map["4"][0], 1));
    act(() => result.current.check(map["4"][0]));
    act(() => result.current.practisePage(4));
    expect(result.current.practisedPage).toBe(4);
    expect(result.current.focusIdx).toBe(1);
  });
});

describe("useReadingProgress", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); window.history.replaceState(null, "", "/"); });

  it("does nothing until the viewer is ready, then writes ?p= and saves after the store delay", () => {
    const store = fakeStore();
    const { result, rerender } = renderHook((p: { ready: boolean }) => useReadingProgress({ chapter, store, initialPage: 2, seenPages: [1], pageCount: 9, enabled: true, ready: p.ready }), { initialProps: { ready: false } });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(store.saveProgress).not.toHaveBeenCalled();
    rerender({ ready: true });
    expect(window.location.search).toBe("?p=2");
    act(() => { vi.advanceTimersByTime(999); });
    expect(store.saveProgress).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(store.saveProgress).toHaveBeenCalledWith({ chapterId: "c1", chapterSlug: "ch-1", chapterTitle: "The Living World", pageCount: 9, lastPage: 2, pagesSeen: [1, 2] });
    act(() => result.current.onPageChange(3));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(vi.mocked(store.saveProgress).mock.calls[1][0]).toMatchObject({ lastPage: 3, pagesSeen: [1, 2, 3] });
  });
  it("rapid page changes save only the last page", () => {
    const store = fakeStore();
    const { result } = renderHook(() => useReadingProgress({ chapter, store, initialPage: 1, seenPages: [], pageCount: 9, enabled: true, ready: true }));
    act(() => { result.current.onPageChange(2); result.current.onPageChange(3); result.current.onPageChange(4); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(store.saveProgress).toHaveBeenCalledTimes(1);
    expect(vi.mocked(store.saveProgress).mock.calls[0][0]).toMatchObject({ lastPage: 4 });
  });
  it("is off when disabled (staff review mode)", () => {
    const store = fakeStore();
    renderHook(() => useReadingProgress({ chapter, store, initialPage: 1, seenPages: [], pageCount: 9, enabled: false, ready: true }));
    act(() => { vi.advanceTimersByTime(10000); });
    expect(store.saveProgress).not.toHaveBeenCalled();
  });
});

describe("useWorkspaceShortcuts", () => {
  it("calls the matching handler and prevents the default", () => {
    const next = vi.fn(), choose = vi.fn();
    renderHook(() => useWorkspaceShortcuts({ next, choose }));
    const e = new KeyboardEvent("keydown", { key: "n", bubbles: true, cancelable: true });
    window.dispatchEvent(e);
    expect(next).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);
    fireEvent.keyDown(window, { key: "3" });
    expect(choose).toHaveBeenCalledWith({ type: "choose", index: 2 });
  });
  it("ignores keys typed into inputs and leaves unhandled keys alone", () => {
    const next = vi.fn();
    renderHook(() => useWorkspaceShortcuts({ next }));
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "n" });
    expect(next).not.toHaveBeenCalled();
    const e = new KeyboardEvent("keydown", { key: "q", bubbles: true, cancelable: true });
    window.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
    input.remove();
  });
  it("Enter on a focused button keeps its native meaning (no double check)", () => {
    const enter = vi.fn();
    renderHook(() => useWorkspaceShortcuts({ enter }));
    const btn = document.createElement("button");
    document.body.appendChild(btn);
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(enter).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(enter).toHaveBeenCalledTimes(1);
    btn.remove();
  });
  it("uses the latest handlers without resubscribing", () => {
    const a = vi.fn(), b = vi.fn();
    const { rerender } = renderHook((h: { fn: () => void }) => useWorkspaceShortcuts({ next: h.fn }), { initialProps: { fn: a } });
    rerender({ fn: b });
    fireEvent.keyDown(window, { key: "n" });
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe("useSplitPane", () => {
  const key = (k: string, shiftKey = false) => ({ key: k, shiftKey, preventDefault: vi.fn() }) as unknown as Parameters<ReturnType<typeof useSplitPane>["handleProps"]["onKeyDown"]>[0];

  it("starts at 45 % inside the bounds for the default 784 px width", () => {
    const { result } = renderHook(() => useSplitPane());
    expect(result.current.bounds).toEqual({ min: 42, max: 53 });
    expect(result.current.ratio).toBe(45);
    expect(result.current.leftWidth).toBeGreaterThanOrEqual(result.current.leftMin);
  });
  it("swap mirrors the ratio and reset returns to the swapped default", () => {
    const { result } = renderHook(() => useSplitPane());
    act(() => result.current.toggleSwap());
    expect(result.current.swap).toBe(true);
    expect(result.current.ratio).toBe(55);
    act(() => result.current.handleProps.onKeyDown(key("ArrowLeft")));
    expect(result.current.ratio).toBe(53);
    act(() => result.current.reset());
    expect(result.current.ratio).toBe(55);
  });
  it("arrow keys move by 2 (10 with Shift) and never leave the bounds; Home and End jump to them", () => {
    const { result } = renderHook(() => useSplitPane());
    act(() => result.current.handleProps.onKeyDown(key("ArrowRight")));
    expect(result.current.ratio).toBe(47);
    act(() => result.current.handleProps.onKeyDown(key("ArrowRight", true)));
    expect(result.current.ratio).toBe(53); // clamped to max
    act(() => result.current.handleProps.onKeyDown(key("Home")));
    expect(result.current.ratio).toBe(42);
    act(() => result.current.handleProps.onKeyDown(key("End")));
    expect(result.current.ratio).toBe(53);
    const other = key("x");
    act(() => result.current.handleProps.onKeyDown(other));
    expect(other.preventDefault).not.toHaveBeenCalled();
  });
});
