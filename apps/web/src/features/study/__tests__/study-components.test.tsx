// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { PageChipRail } from "../page-chip-rail";
import { PageSummary } from "../page-summary";
import { QuestionCard } from "../question-card";
import { QuestionDots } from "../question-dots";
import { SourceQuote } from "../source-quote";
import type { QState, StudyQuestion } from "../types";

const q = (type: StudyQuestion["type"] = "single_correct", correct = [1]): StudyQuestion => ({
  id: "q1", version_id: "v1", type, difficulty: "medium", status: "published",
  payload: { topic: "Tissues", question: "Which tissue?", options: ["Parenchyma", "Collenchyma", "Sclerenchyma"], correct, explanation: "Because corners are thick.", source_text: "Collenchyma has thickened corners.", question_origin: "fixture", verification: "fixture", ...(type === "match_the_following" ? { column_a: ["A1", "A2"], column_b: ["B1", "B2"] } : {}) } as StudyQuestion["payload"],
});
const done = (chosen: number[], firstCorrect: boolean): QState => ({ chosen, checked: true, attemptNo: 1, firstCorrect });

describe("QuestionCard", () => {
  it("shows topic, difficulty, position and numbered options; Check is disabled until a choice", () => {
    const onPick = vi.fn();
    render(<QuestionCard q={q()} index={1} total={4} onPick={onPick} onCheck={() => {}} />);
    expect(screen.getByText("Tissues")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("2 of 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check" })).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: /Collenchyma/ }));
    expect(onPick).toHaveBeenCalledWith(1);
  });
  it("arrow keys move and select among single-choice options", () => {
    const onPick = vi.fn();
    render(<QuestionCard q={q()} index={0} total={1} onPick={onPick} />);
    screen.getByRole("radio", { name: /Parenchyma/ }).focus();
    fireEvent.keyDown(screen.getByRole("radio", { name: /Parenchyma/ }), { key: "ArrowDown" });
    expect(onPick).toHaveBeenCalledWith(1);
  });
  it("correct answer: ✓ Correct answer, Correct., explanation, source line, Show in NCERT and Try again", () => {
    const onSource = vi.fn(), onRetry = vi.fn();
    render(<QuestionCard q={q()} index={0} total={1} state={done([1], true)} onSource={onSource} onRetry={onRetry} />);
    expect(screen.getByText("Correct.")).toBeInTheDocument();
    expect(screen.getByText("✓ Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Because corners are thick.")).toBeInTheDocument();
    expect(screen.getByText(/From the page:/).closest("p")).toHaveTextContent("From the page: “Collenchyma has thickened corners.”");
    fireEvent.click(screen.getByRole("button", { name: "Show in NCERT" }));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onSource).toHaveBeenCalled(); expect(onRetry).toHaveBeenCalled();
    for (const o of screen.getAllByRole("radio")) expect(o).toBeDisabled();
  });
  it("wrong answer marks both the pick (✗ Your answer) and the right option, never by colour alone", () => {
    render(<QuestionCard q={q()} index={0} total={1} state={done([0], false)} />);
    expect(screen.getByText("Not quite.")).toBeInTheDocument();
    expect(screen.getByText("✗ Your answer")).toBeInTheDocument();
    expect(screen.getByText("✓ Correct answer")).toBeInTheDocument();
  });
  it("retry attempts say only the first counts", () => {
    render(<QuestionCard q={q()} index={0} total={1} state={{ chosen: [1], checked: true, attemptNo: 2, firstCorrect: false }} />);
    expect(screen.getByText("Only your first attempt counts toward your accuracy.")).toBeInTheDocument();
  });
  it("multiple-select uses checkboxes and a hint", () => {
    render(<QuestionCard q={q("multiple_correct", [0, 2])} index={0} total={1} state={{ chosen: [0], checked: false, attemptNo: 1 }} />);
    expect(screen.getByText("Select all that apply.")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });
  it("match-the-column shows both columns", () => {
    render(<QuestionCard q={q("match_the_following", [0])} index={0} total={1} />);
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("B1")).toBeInTheDocument();
  });
  it("bookmark button reflects and toggles the saved state", () => {
    const onBookmark = vi.fn();
    const { rerender } = render(<QuestionCard q={q()} index={0} total={1} bookmarked={false} onBookmark={onBookmark} />);
    expect(screen.getByRole("button", { name: "Save question" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Save question" }));
    expect(onBookmark).toHaveBeenCalled();
    rerender(<QuestionCard q={q()} index={0} total={1} bookmarked onBookmark={onBookmark} />);
    expect(screen.getByRole("button", { name: "Save question" })).toHaveAttribute("aria-pressed", "true");
  });
  it("staff review mode shows status and the three review actions, no Check", () => {
    const onSet = vi.fn();
    render(<QuestionCard q={{ ...q(), status: "in_review" }} index={0} total={1} review={{ busy: false, onSet }} />);
    expect(screen.getByText("In review")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(onSet).toHaveBeenCalledWith("published");
  });
  it("has no a11y violations (unanswered and answered)", async () => {
    const a = render(<QuestionCard q={q()} index={0} total={1} bookmarked onBookmark={() => {}} />);
    await expectNoA11yViolations(a.container);
    const b = render(<QuestionCard q={q()} index={0} total={1} state={done([0], false)} />);
    await expectNoA11yViolations(b.container);
  });
});

describe("SourceQuote", () => {
  it("shows short quotes in full and clamps long ones behind More / Less", () => {
    const { rerender } = render(<SourceQuote text="Short line." />);
    expect(screen.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
    rerender(<SourceQuote text={"long ".repeat(60)} />);
    const more = screen.getByRole("button", { name: "More" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(more);
    expect(screen.getByRole("button", { name: "Less" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("QuestionDots", () => {
  const qs = [q(), { ...q(), id: "q2" }, { ...q(), id: "q3" }];
  it("labels every dot with its status and jumps on click", () => {
    const onSelect = vi.fn();
    render(<QuestionDots questions={qs} states={{ q1: done([1], true), q2: done([0], false) }} current={2} onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: "Go to question 1, answered correctly" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to question 2, answered incorrectly" })).toBeInTheDocument();
    const current = screen.getByRole("button", { name: "Go to question 3, current, not answered" });
    expect(current).toHaveAttribute("aria-current", "step");
    fireEvent.click(screen.getByRole("button", { name: /question 1/ }));
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});

describe("PageChipRail", () => {
  const pages = [{ pdfPage: 3, label: "76", count: 5, complete: true }, { pdfPage: 4, label: "77", count: 4, complete: false }];
  it("selects the practised page, names each chip fully and reports clicks", () => {
    const onSelect = vi.fn();
    render(<PageChipRail pages={pages} current={4} onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: "p.77, 4 questions" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "p.76, 5 questions, all answered" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: /p\.76/ }));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
  it("←/→ move focus between chips, wrapping", () => {
    render(<PageChipRail pages={pages} current={4} onSelect={() => {}} />);
    const first = screen.getByRole("button", { name: /p\.76/ });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: /p\.77/ })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("button", { name: /p\.77/ }), { key: "ArrowRight" });
    expect(first).toHaveFocus();
  });
  it("renders nothing when no page has questions", () => {
    const { container } = render(<PageChipRail pages={[]} current={null} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("has no a11y violations", async () => {
    const { container } = render(<PageChipRail pages={pages} current={4} onSelect={() => {}} />);
    await expectNoA11yViolations(container);
  });
});

describe("PageSummary", () => {
  const summary = { total: 4, answered: 4, correct: 3, wrongIds: ["q4"], complete: true };
  it("shows first-attempt counts and the three actions", () => {
    const next = vi.fn(), retry = vi.fn(), keep = vi.fn();
    render(<PageSummary summary={summary} nextPageLabel="78" onNextPage={next} onRetryMissed={retry} onKeepReading={keep} />);
    expect(screen.getByText("Page complete")).toBeInTheDocument();
    expect(screen.getByText("3 of 4")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Correct answers on this page" })).toHaveAttribute("aria-valuenow", "3");
    fireEvent.click(screen.getByRole("button", { name: /Next page with questions \(p\.78\)/ }));
    fireEvent.click(screen.getByRole("button", { name: "Retry the ones you missed" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep reading" }));
    expect(next).toHaveBeenCalled(); expect(retry).toHaveBeenCalled(); expect(keep).toHaveBeenCalled();
  });
  it("hides Retry when nothing was missed and Next page when there is none", () => {
    render(<PageSummary summary={{ ...summary, correct: 4, wrongIds: [] }} onRetryMissed={() => {}} onKeepReading={() => {}} />);
    expect(screen.queryByRole("button", { name: "Retry the ones you missed" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next page/ })).not.toBeInTheDocument();
  });
});
