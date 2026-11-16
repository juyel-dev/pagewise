// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useImperativeHandle, type Ref } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudyStore } from "../store";
import type { PageMapRow, StudyChapter, StudyQuestion } from "../types";

// ---- test doubles for everything outside the workspace's own logic ----
const viewerHandle = { scrollToPage: vi.fn() };
let viewerProps: { onPageChange: (p: number, s: "scroll" | "jump") => void; onReady: (i: { doc: { numPages: number }; sizes: [] }) => void } | null = null;
vi.mock("@/components/viewer/pdf-viewer", () => ({
  PdfViewer: ({ ref, ...props }: { ref?: Ref<typeof viewerHandle>; onPageChange: never; onReady: never }) => {
    viewerProps = props;
    useImperativeHandle(ref, () => viewerHandle);
    return <div data-testid="pdf-viewer" />;
  },
}));
const store: StudyStore = {
  kind: "remote", progressDelayMs: 1000,
  recordAttempt: vi.fn().mockResolvedValue(true), setBookmark: vi.fn().mockResolvedValue(true),
  saveProgress: vi.fn().mockResolvedValue(true), loadBookmarkedIds: vi.fn().mockResolvedValue(null),
};
vi.mock("../store-wiring", () => ({ createStudyStore: () => store }));
vi.mock("../../review/actions", () => ({ setQuestionStatus: vi.fn().mockResolvedValue({ ok: true }) }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({}) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { StudyWorkspace } from "../study-workspace";

const chapter: StudyChapter = { id: "c1", slug: "class11-bio-ch01", title: "The Living World", pageCount: 9, status: "live", unit: null, pdfSha256: null };
const pageMap: PageMapRow[] = Array.from({ length: 9 }, (_, i) => ({ pdf_page: i + 1, printed_label: String(73 + i), kind: "content" }));
const q = (id: string, stem: string, options: string[], correct: number[]): StudyQuestion => ({
  id, version_id: `v-${id}`, type: "single_correct", difficulty: "easy", status: "published",
  payload: { topic: "Tissues", question: stem, options, correct, explanation: `Because ${id}.`, source_text: "src", question_origin: "fixture", verification: "fixture" } as StudyQuestion["payload"],
});
const questionsByPage = {
  "4": [q("a", "First stem?", ["Parenchyma", "Collenchyma", "Sclerenchyma", "Phloem"], [1]), q("b", "Second stem?", ["One", "Two"], [0])],
  "5": [q("c", "Page five stem?", ["Yes", "No"], [0])],
};

function mount(over: Partial<Parameters<typeof StudyWorkspace>[0]> = {}) {
  return render(<StudyWorkspace chapter={chapter} pageMap={pageMap} pdfUrl="https://x/y.pdf" isAdmin={false} review={false} questionsByPage={questionsByPage} initialPage={4} seenPages={[]} bookmarkedIds={[]} {...over} />);
}
const settle = () => act(() => { vi.advanceTimersByTime(900); });

beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); vi.clearAllMocks(); viewerProps = null; });
afterEach(() => { vi.useRealTimers(); window.history.replaceState(null, "", "/"); });

describe("StudyWorkspace (student path)", () => {
  it("opens on the requested page and shows that page's first question straight away", () => {
    mount();
    expect(screen.getByRole("article", { name: "Question 1 of 2" })).toHaveTextContent("First stem?");
    expect(screen.getByRole("navigation", { name: "Pages with questions" })).toBeInTheDocument();
  });

  it("with no questions on the opening page it offers the nearest page that has some", () => {
    mount({ initialPage: 2 });
    expect(screen.getByRole("heading", { name: "No questions on this page" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Go to page 76" }));
    expect(viewerHandle.scrollToPage).toHaveBeenCalledWith(4);
  });

  it("choose with a digit key, check with Enter, see the explanation, and record exactly one attempt", async () => {
    mount(); settle();
    fireEvent.keyDown(document.body, { key: "2" });
    expect(screen.getByRole("radio", { name: /Collenchyma/ })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(screen.getByText("Correct.")).toBeInTheDocument();
    expect(screen.getByText("Because a.")).toBeInTheDocument();
    expect(store.recordAttempt).toHaveBeenCalledTimes(1);
    expect(vi.mocked(store.recordAttempt).mock.calls[0][0]).toMatchObject({ questionId: "a", chosen: [1], chapterId: "c1", attemptNo: 1 });
  });

  it("pressing Enter on the focused Check button checks once, not twice", async () => {
    mount(); settle();
    fireEvent.click(screen.getByRole("radio", { name: /Parenchyma/ }));
    const check = screen.getAllByRole("button", { name: "Check" })[0];
    check.focus();
    fireEvent.keyDown(check, { key: "Enter" });
    fireEvent.click(check);
    expect(store.recordAttempt).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Not quite.")).toBeInTheDocument();
  });

  it("N moves to the next question, Shift+N back; Enter after checking also advances", () => {
    mount(); settle();
    fireEvent.keyDown(document.body, { key: "n" });
    expect(screen.getByRole("article", { name: "Question 2 of 2" })).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "N", shiftKey: true });
    expect(screen.getByRole("article", { name: "Question 1 of 2" })).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "1" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(screen.getByRole("article", { name: "Question 2 of 2" })).toBeInTheDocument();
  });

  it("R lets you try again; the retry is attempt 2", () => {
    mount(); settle();
    fireEvent.keyDown(document.body, { key: "1" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "r" });
    fireEvent.keyDown(document.body, { key: "2" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(vi.mocked(store.recordAttempt).mock.calls[1][0]).toMatchObject({ attemptNo: 2, chosen: [1] });
  });

  it("B saves and unsaves the question through the store", async () => {
    mount(); settle();
    fireEvent.keyDown(document.body, { key: "b" });
    expect(screen.getByRole("button", { name: "Save question" })).toHaveAttribute("aria-pressed", "true");
    expect(vi.mocked(store.setBookmark).mock.calls[0][0]).toMatchObject({ questionId: "a", on: true, page: 4 });
    fireEvent.keyDown(document.body, { key: "b" });
    expect(screen.getByRole("button", { name: "Save question" })).toHaveAttribute("aria-pressed", "false");
  });

  it("typing in the Go to page box never triggers shortcuts", async () => {
    mount(); settle();
    const box = screen.getByLabelText("Go to printed page");
    fireEvent.keyDown(box, { key: "n" });
    fireEvent.keyDown(box, { key: "1" });
    expect(screen.getByRole("article", { name: "Question 1 of 2" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Parenchyma/ })).toHaveAttribute("aria-checked", "false");
  });

  it("V hides and shows the PDF; / focuses the page box; ? opens the shortcut list", async () => {
    mount(); settle();
    expect(screen.getByTestId("pdf-viewer")).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "v" });
    expect(screen.queryByTestId("pdf-viewer")).not.toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "v" });
    expect(screen.getByTestId("pdf-viewer")).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "/" });
    expect(screen.getByLabelText("Go to printed page")).toHaveFocus();
    fireEvent.keyDown(document.body, { key: "?" });
    expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
  });

  it("[ and ] turn the PDF page; S scrolls to the question's page after answering", () => {
    mount(); settle();
    act(() => { viewerProps?.onReady({ doc: { numPages: 9 }, sizes: [] }); });
    fireEvent.keyDown(document.body, { key: "]" });
    expect(viewerHandle.scrollToPage).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(document.body, { key: "[" });
    expect(viewerHandle.scrollToPage).toHaveBeenLastCalledWith(3);
    fireEvent.keyDown(document.body, { key: "s" });
    expect(viewerHandle.scrollToPage).toHaveBeenLastCalledWith(4, true);
  });

  it("follow: scrolling the PDF to a page with questions switches when nothing was started", () => {
    mount(); settle();
    act(() => { viewerProps?.onPageChange(5, "scroll"); });
    settle();
    expect(screen.getByRole("article", { name: "Question 1 of 1" })).toHaveTextContent("Page five stem?");
  });

  it("follow: with work in progress it offers a chip instead of switching, and the chip switches", async () => {
    mount(); settle();
    fireEvent.keyDown(document.body, { key: "1" }); // started, not finished
    act(() => { viewerProps?.onPageChange(5, "scroll"); });
    settle();
    expect(screen.getByRole("article", { name: "Question 1 of 2" })).toBeInTheDocument();
    const chip = screen.getByRole("button", { name: /Page 77 has 1 questions — Switch/ });
    fireEvent.click(chip);
    expect(screen.getByRole("article", { name: "Question 1 of 1" })).toHaveTextContent("Page five stem?");
    expect(screen.queryByRole("button", { name: /Switch/ })).not.toBeInTheDocument();
  });

  it("follow off: nothing switches", () => {
    mount(); settle();
    fireEvent.click(screen.getByRole("switch", { name: "Follow my reading" }));
    act(() => { viewerProps?.onPageChange(5, "scroll"); });
    settle();
    expect(screen.getByRole("article", { name: "Question 1 of 2" })).toBeInTheDocument();
  });

  it("saves reading progress after the store delay once the PDF is ready, with the page in the URL", () => {
    mount(); settle();
    act(() => { viewerProps?.onReady({ doc: { numPages: 9 }, sizes: [] }); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(store.saveProgress).toHaveBeenCalledWith(expect.objectContaining({ chapterId: "c1", lastPage: 4, pageCount: 9 }));
    expect(window.location.search).toBe("?p=4");
  });

  it("shows the 'still being reviewed' message when the chapter has no published questions", () => {
    mount({ questionsByPage: {} });
    expect(screen.getByText(/still being reviewed/)).toBeInTheDocument();
  });

  it("tells the student when an answer could not be saved", async () => {
    vi.mocked(store.recordAttempt).mockResolvedValueOnce(false);
    mount(); settle();
    fireEvent.keyDown(document.body, { key: "1" });
    await act(async () => { fireEvent.keyDown(document.body, { key: "Enter" }); });
    expect(screen.getByText(/could not be saved/)).toBeInTheDocument();
  });

  it("page chips switch the practised page and turn the PDF to it", () => {
    mount();
    const chip = screen.getByRole("button", { name: /p\.77, 1 question/ });
    fireEvent.click(chip);
    expect(screen.getByRole("article", { name: "Question 1 of 1" })).toHaveTextContent("Page five stem?");
    expect(viewerHandle.scrollToPage).toHaveBeenLastCalledWith(5);
  });

  it("finishing a page shows the summary with first-attempt counts, then moves to the next page", () => {
    mount();
    fireEvent.keyDown(document.body, { key: "2" }); // correct
    fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "Enter" }); // next question
    fireEvent.keyDown(document.body, { key: "2" }); // wrong (correct is option 1)
    fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "Enter" }); // finish page
    const summary = screen.getByRole("region", { name: "Page complete" });
    expect(summary).toHaveTextContent("1 of 2 correct");
    fireEvent.click(screen.getByRole("button", { name: /Next page with questions/ }));
    expect(viewerHandle.scrollToPage).toHaveBeenLastCalledWith(5);
    expect(screen.getByRole("article", { name: "Question 1 of 1" })).toHaveTextContent("Page five stem?");
    expect(screen.queryByRole("region", { name: "Page complete" })).not.toBeInTheDocument();
  });

  it("'Retry the ones you missed' reopens only the missed question as attempt 2", () => {
    mount();
    fireEvent.keyDown(document.body, { key: "2" }); fireEvent.keyDown(document.body, { key: "Enter" }); fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "2" }); fireEvent.keyDown(document.body, { key: "Enter" }); fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Retry the ones you missed" }));
    expect(screen.getByRole("article", { name: "Question 2 of 2" })).toHaveTextContent("Second stem?");
    fireEvent.keyDown(document.body, { key: "1" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(vi.mocked(store.recordAttempt).mock.calls.at(-1)?.[0]).toMatchObject({ questionId: "b", attemptNo: 2, correct: true });
  });

  it("'Keep reading' returns to the list of the page's questions", () => {
    mount();
    fireEvent.keyDown(document.body, { key: "2" }); fireEvent.keyDown(document.body, { key: "Enter" }); fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "1" }); fireEvent.keyDown(document.body, { key: "Enter" }); fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Keep reading" }));
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("the phone action bar's big button walks Check → Next question", () => {
    mount();
    const primary = () => screen.getAllByRole("button").find((b) => ["Check", "Next question", "Finish page", "Next page", "Choose an answer"].includes(b.textContent?.trim() ?? "") && b.className.includes("flex-1"))!;
    expect(primary()).toHaveTextContent("Choose an answer");
    fireEvent.click(screen.getByRole("radio", { name: /Collenchyma/ }));
    expect(primary()).toHaveTextContent("Check");
    fireEvent.click(primary());
    expect(primary()).toHaveTextContent("Next question");
    fireEvent.click(primary());
    expect(screen.getByRole("article", { name: "Question 2 of 2" })).toBeInTheDocument();
  });

  it("phone tabs switch panes; the PDF tab disappears when the PDF is hidden", () => {
    mount();
    const tabs = screen.getByRole("tablist", { name: "Study panels" });
    expect(within(tabs).getByRole("tab", { name: "Practise" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(within(tabs).getByRole("tab", { name: "Read" }));
    expect(within(tabs).getByRole("tab", { name: "Read" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(document.body, { key: "v" });
    expect(within(tabs).queryByRole("tab", { name: "Read" })).not.toBeInTheDocument();
  });
});
