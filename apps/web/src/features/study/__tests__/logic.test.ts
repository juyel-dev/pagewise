import { describe, expect, it } from "vitest";
import {
  checkAnswer, clampPage, clampRatio, findPassageInSpans, firstUnansweredIndex, followDecision, nearestPageWithQuestions,
  nextPageWithQuestions, normaliseForMatch, pageSummary, pagesWithQuestions, pickOption, previousPageWithQuestions,
  resolveInitialPage, retryQuestion, shortcutFor, splitBounds, type QuestionsByPage, type StateMap,
} from "../logic";
import type { QState, StudyQuestion } from "../types";

const q = (id: string, correct: number[], type: StudyQuestion["type"] = "single_correct"): StudyQuestion => ({
  id, version_id: `v-${id}`, type, difficulty: "medium", status: "published",
  payload: { topic: "t", question: "?", options: ["a", "b", "c", "d"], correct, explanation: "e", source_text: "s", question_origin: "fixture", verification: "fixture" } as StudyQuestion["payload"],
});

describe("pages", () => {
  it("clampPage keeps a page inside the chapter", () => {
    expect(clampPage(5, 9)).toBe(5);
    expect(clampPage(0, 9)).toBe(1);
    expect(clampPage(99, 9)).toBe(9);
    expect(clampPage(Number.NaN, 9)).toBe(1);
    expect(clampPage(3.9, 9)).toBe(3);
    expect(clampPage(4, 0)).toBe(1);
  });
  it("resolveInitialPage: valid ?p wins, then last read page, then 1", () => {
    expect(resolveInitialPage({ param: "5", lastPage: 3, pageCount: 9 })).toBe(5);
    expect(resolveInitialPage({ param: "999", lastPage: 3, pageCount: 9 })).toBe(9);
    expect(resolveInitialPage({ param: "abc", lastPage: 3, pageCount: 9 })).toBe(3);
    expect(resolveInitialPage({ param: "0", lastPage: 3, pageCount: 9 })).toBe(3);
    expect(resolveInitialPage({ param: "-2", lastPage: 3, pageCount: 9 })).toBe(3);
    expect(resolveInitialPage({ param: "2.5", lastPage: 3, pageCount: 9 })).toBe(3);
    expect(resolveInitialPage({ param: undefined, lastPage: 20, pageCount: 9 })).toBe(9);
    expect(resolveInitialPage({ param: "", lastPage: null, pageCount: 9 })).toBe(1);
    expect(resolveInitialPage({ param: null, lastPage: undefined, pageCount: 9 })).toBe(1);
  });
  const map: QuestionsByPage = { "3": [q("a", [0])], "4": [q("b", [1])], "6": [q("c", [2])], "7": [] };
  it("finds pages that have questions", () => {
    expect(pagesWithQuestions(map)).toEqual([3, 4, 6]);
    expect(nextPageWithQuestions(map, 4)).toBe(6);
    expect(nextPageWithQuestions(map, 6)).toBeUndefined();
    expect(previousPageWithQuestions(map, 4)).toBe(3);
    expect(previousPageWithQuestions(map, 3)).toBeUndefined();
  });
  it("nearestPageWithQuestions prefers the closest page, ties forward", () => {
    expect(nearestPageWithQuestions(map, 5)).toBe(6);
    expect(nearestPageWithQuestions(map, 1)).toBe(3);
    expect(nearestPageWithQuestions(map, 4)).toBe(4);
    expect(nearestPageWithQuestions({}, 4)).toBeUndefined();
  });
});

describe("answering", () => {
  const single = q("s", [1]);
  const multi = q("m", [0, 2], "multiple_correct");
  it("pickOption replaces for single choice and toggles (sorted) for multiple", () => {
    expect(pickOption(single, undefined, 2).chosen).toEqual([2]);
    expect(pickOption(single, { chosen: [2], checked: false, attemptNo: 1 }, 3).chosen).toEqual([3]);
    let s = pickOption(multi, undefined, 2);
    s = pickOption(multi, s, 0);
    expect(s.chosen).toEqual([0, 2]);
    expect(pickOption(multi, s, 2).chosen).toEqual([0]);
  });
  it("checkAnswer grades, locks, and remembers the first attempt only", () => {
    expect(checkAnswer(single, undefined)).toBeNull();
    expect(checkAnswer(single, { chosen: [], checked: false, attemptNo: 1 })).toBeNull();
    const r = checkAnswer(single, { chosen: [0], checked: false, attemptNo: 1 })!;
    expect(r.correct).toBe(false);
    expect(r.next).toMatchObject({ checked: true, firstCorrect: false });
    expect(checkAnswer(single, r.next)).toBeNull(); // already checked: a double press does nothing
    const retried = retryQuestion(r.next);
    expect(retried).toMatchObject({ chosen: [], checked: false, attemptNo: 2, firstCorrect: false });
    const second = checkAnswer(single, pickOption(single, retried, 1))!;
    expect(second.correct).toBe(true);
    expect(second.next.firstCorrect).toBe(false); // first attempt still decides accuracy
  });
  it("multi-select is wrong for a partial answer and right for the exact set", () => {
    expect(checkAnswer(multi, { chosen: [0], checked: false, attemptNo: 1 })!.correct).toBe(false);
    expect(checkAnswer(multi, { chosen: [0, 2], checked: false, attemptNo: 1 })!.correct).toBe(true);
  });
});

describe("page summary and follow rule", () => {
  const qs = [q("a", [0]), q("b", [1]), q("c", [2])];
  const done = (firstCorrect: boolean): QState => ({ chosen: [0], checked: true, attemptNo: 1, firstCorrect });
  it("firstUnansweredIndex", () => {
    expect(firstUnansweredIndex(qs, {})).toBe(0);
    expect(firstUnansweredIndex(qs, { a: done(true) })).toBe(1);
    expect(firstUnansweredIndex(qs, { a: done(true), b: done(false), c: done(true) })).toBe(0);
  });
  it("pageSummary counts first attempts and reports completion", () => {
    expect(pageSummary(qs, {})).toMatchObject({ total: 3, answered: 0, correct: 0, complete: false });
    const s = pageSummary(qs, { a: done(true), b: done(false), c: done(true) });
    expect(s).toMatchObject({ answered: 3, correct: 2, complete: true, wrongIds: ["b"] });
    expect(pageSummary([], {}).complete).toBe(false);
  });
  const map: QuestionsByPage = { "4": qs, "5": [q("x", [0])] };
  const base = { follow: true, practisedPage: 4 as number | null, targetPage: 5, map };
  it("followDecision: off, target without questions, or same page does nothing", () => {
    expect(followDecision({ ...base, follow: false, states: {} })).toBe("none");
    expect(followDecision({ ...base, targetPage: 9, states: {} })).toBe("none");
    expect(followDecision({ ...base, targetPage: 4, states: {} })).toBe("none");
  });
  it("followDecision: switches when nothing started or everything answered, defers mid-way", () => {
    expect(followDecision({ ...base, states: {} })).toBe("switch");
    expect(followDecision({ ...base, states: { a: done(true), b: done(true), c: done(false) } })).toBe("switch");
    expect(followDecision({ ...base, states: { a: done(true) } })).toBe("defer");
    expect(followDecision({ ...base, states: { b: { chosen: [1], checked: false, attemptNo: 1 } } as StateMap })).toBe("defer");
    expect(followDecision({ ...base, practisedPage: null, states: {} })).toBe("switch");
  });
});

describe("source passage finder", () => {
  it("normalises ligatures, quotes, dashes, soft hyphens, hyphenated line breaks and spacing", () => {
    expect(normaliseForMatch("The ﬁrst “cell”\u00ad  was—seen")).toBe('the first "cell" was-seen');
    expect(normaliseForMatch("tis-\nsue  grows")).toBe("tissue grows");
  });
  const spans = ["Collenchyma cells have", "thickened corners and provide", "mechanical support to", "growing parts of the plant.", "Sclerenchyma is dead."];
  it("finds an exact passage across spans", () => {
    expect(findPassageInSpans(spans, "thickened corners and provide mechanical support")).toEqual({ from: 1, to: 2 });
  });
  it("ignores case, extra spaces and typographic differences", () => {
    expect(findPassageInSpans(spans, "COLLENCHYMA   cells have thickened corners")).toEqual({ from: 0, to: 1 });
  });
  it("falls back to the longest matching piece (at least 20 characters)", () => {
    const r = findPassageInSpans(spans, "Note: thickened corners and provide mechanical support, as the author writes.");
    expect(r).toEqual({ from: 1, to: 2 });
  });
  it("returns null when nothing long enough matches or the source is too short", () => {
    expect(findPassageInSpans(spans, "completely unrelated sentence about mitochondria")).toBeNull();
    expect(findPassageInSpans(spans, "short")).toBeNull();
    expect(findPassageInSpans([], "thickened corners and provide mechanical support")).toBeNull();
    expect(findPassageInSpans(["", " "], "thickened corners and provide mechanical support")).toBeNull();
  });
});

describe("split pane", () => {
  it("bounds keep both panes above their minimum widths", () => {
    const b = splitBounds(1200, false);
    expect(b.min).toBeGreaterThanOrEqual(Math.ceil((320 / 1188) * 100));
    expect(b.max).toBeLessThanOrEqual(Math.floor(((1188 - 360) / 1188) * 100));
    expect(b.min).toBeLessThan(b.max);
  });
  it("collapses to 50/50 when the window is too narrow, and swapped panes use swapped minimums", () => {
    expect(splitBounds(600, false)).toEqual({ min: 50, max: 50 });
    expect(splitBounds(1200, true).min).toBeGreaterThan(splitBounds(1200, false).min);
  });
  it("clampRatio pins to the bounds", () => {
    const b = splitBounds(1200, false);
    expect(clampRatio(1, 1200, false)).toBe(b.min);
    expect(clampRatio(99, 1200, false)).toBe(b.max);
    expect(clampRatio(45, 1200, false)).toBe(45);
  });
});

describe("shortcuts", () => {
  it("maps digits to options and letters to actions", () => {
    expect(shortcutFor({ key: "3" })).toEqual({ type: "choose", index: 2 });
    expect(shortcutFor({ key: "8" })).toEqual({ type: "choose", index: 7 });
    expect(shortcutFor({ key: "9" })).toBeNull();
    expect(shortcutFor({ key: "Enter" })).toEqual({ type: "enter" });
    expect(shortcutFor({ key: "n" })).toEqual({ type: "next" });
    expect(shortcutFor({ key: "N", shiftKey: true })).toEqual({ type: "previous" });
    expect(shortcutFor({ key: "b" })).toEqual({ type: "bookmark" });
    expect(shortcutFor({ key: "S" })).toEqual({ type: "source" });
    expect(shortcutFor({ key: "r" })).toEqual({ type: "retry" });
    expect(shortcutFor({ key: "q" })).toEqual({ type: "questions" });
    expect(shortcutFor({ key: "v" })).toEqual({ type: "toggleViewer" });
    expect(shortcutFor({ key: "[" })).toEqual({ type: "pdfPrevious" });
    expect(shortcutFor({ key: "]" })).toEqual({ type: "pdfNext" });
    expect(shortcutFor({ key: "/" })).toEqual({ type: "goToPage" });
    expect(shortcutFor({ key: "?" })).toEqual({ type: "help" });
  });
  it("B means bookmark, never option B (letters do not choose options)", () => {
    expect(shortcutFor({ key: "b" })).toEqual({ type: "bookmark" });
    expect(shortcutFor({ key: "a" })).toBeNull();
  });
  it("is ignored while typing or with modifier keys", () => {
    expect(shortcutFor({ key: "n", inEditable: true })).toBeNull();
    expect(shortcutFor({ key: "n", ctrlKey: true })).toBeNull();
    expect(shortcutFor({ key: "r", metaKey: true })).toBeNull();
    expect(shortcutFor({ key: "v", altKey: true })).toBeNull();
  });
});
