import { describe, expect, it } from "vitest";
import { attemptSummary, pairKey, progressOf, resolveSelection } from "../hub";

describe("resolveSelection", () => {
  const content = [
    { subject: "Biology", classNo: "11", count: 2 },
    { subject: "Biology", classNo: "12", count: 0 },
    { subject: "Physics", classNo: "11", count: 0 },
    { subject: "Physics", classNo: "12", count: 0 },
    { subject: "Chemistry", classNo: "11", count: 0 },
    { subject: "Chemistry", classNo: "12", count: 0 },
  ];

  it("prefers the explicit URL pair and keeps it honest even when empty", () => {
    expect(resolveSelection({ subject: "Physics", class: "12" }, null, content)).toEqual({ subject: "Physics", classNo: "12", explicit: true });
  });
  it("pairs an explicit subject with saved class, then the class holding content", () => {
    const prefs = { study_subject: "Biology", study_class: "12" };
    expect(resolveSelection({ subject: "Chemistry" }, prefs, content)).toEqual({ subject: "Chemistry", classNo: "12", explicit: true });
    expect(resolveSelection({ subject: "Chemistry" }, null, content)).toEqual({ subject: "Chemistry", classNo: "11", explicit: true });
  });
  it("matches subjects case-insensitively and rejects unknown values", () => {
    expect(resolveSelection({ subject: "biology", class: "12" }, null, content).explicit).toBe(true);
    const none = resolveSelection({ subject: "Botany" }, null, content);
    expect(none.subject).toBe("Biology"); // falls back to the first pair with content
    expect(none.classNo).toBe("11");
  });
  it("honours saved prefs, then falls back to any pair with content", () => {
    expect(resolveSelection({}, { study_subject: "Physics", study_class: "11" }, content)).toEqual({ subject: "Physics", classNo: "11", explicit: false });
    expect(resolveSelection({}, null, content)).toEqual({ subject: "Biology", classNo: "11", explicit: false });
  });
  it("falls back to Biology · 11 when nothing has content", () => {
    const nothing = content.map(({ subject, classNo }) => ({ subject, classNo, count: 0 }));
    expect(resolveSelection({}, null, nothing)).toEqual({ subject: "Biology", classNo: "11", explicit: false });
  });
});

describe("progressOf", () => {
  it("counts unique pages seen against the PDF page count", () => {
    const p = { chapter_id: "x", last_page: 9, pages_seen: [1, 2, 2, 3], updated_at: "2026-01-01T00:00:00Z" };
    expect(progressOf({ pageCount: 9 }, p)).toEqual({ seen: 3, total: 9, pct: 33 });
  });
  it("never divides by zero and prefers the largest honest total", () => {
    expect(progressOf({ pageCount: null }, undefined)).toEqual({ seen: 0, total: 1, pct: 0 });
    expect(progressOf({ pageCount: 5 }, { chapter_id: "x", last_page: 4, pages_seen: [1, 2, 3, 4], updated_at: "" }).total).toBe(5);
    expect(progressOf({ pageCount: 2 }, { chapter_id: "x", last_page: 7, pages_seen: [1, 2], updated_at: "" }).total).toBe(7);
  });
  it("caps progress at 100%", () => {
    expect(progressOf({ pageCount: 3 }, { chapter_id: "x", last_page: 3, pages_seen: [1, 2, 3, 4], updated_at: "" }).pct).toBe(100);
  });
});

describe("attemptSummary", () => {
  const set = new Set(["q1", "q2", "q3"]);
  it("keeps only the latest attempt per question and ignores questions outside the set", () => {
    const rows = [
      { question_id: "q1", is_correct: false, attempt_no: 1 },
      { question_id: "q1", is_correct: true, attempt_no: 3 },
      { question_id: "q1", is_correct: false, attempt_no: 2 },
      { question_id: "q2", is_correct: false, attempt_no: 1 },
      { question_id: "otter", is_correct: true, attempt_no: 1 }, // another chapter's question
    ];
    expect(attemptSummary(rows, set)).toEqual({ attempted: 2, correct: 1, wrong: 1 });
  });
  it("handles retries with equal attempt numbers deterministically (last row wins)", () => {
    const rows = [
      { question_id: "q3", is_correct: false, attempt_no: 1 },
      { question_id: "q3", is_correct: true, attempt_no: 1 },
    ];
    expect(attemptSummary(rows, set)).toEqual({ attempted: 1, correct: 1, wrong: 0 });
  });
  it("returns zeros for an empty history", () => {
    expect(attemptSummary([], set)).toEqual({ attempted: 0, correct: 0, wrong: 0 });
  });
});

describe("pairKey", () => {
  it("builds stable selection keys", () => {
    expect(pairKey("Biology", "11")).toBe("Biology|11");
  });
});
