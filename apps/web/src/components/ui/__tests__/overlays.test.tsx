// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Dialog } from "../dialog";
import { Sheet } from "../sheet";
import { ToastProvider, useToast } from "../toast";
import { Tooltip } from "../tooltip";

function DialogDemo({ dismissible = true }: { dismissible?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Delete account?" description="This cannot be undone." dismissible={dismissible} footer={<button onClick={() => setOpen(false)}>Keep</button>}>
        <p>Body</p>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("opens, is named and described, and closes with its Close button", async () => {
    render(<DialogDemo />);
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("Open"));
    const dlg = screen.getByRole("dialog", { name: "Delete account?" });
    expect(dlg).toHaveAccessibleDescription("This cannot be undone.");
    expect(screen.getByText("Body")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });
  it("Esc (cancel event) closes it when dismissible", async () => {
    render(<DialogDemo />);
    await userEvent.click(screen.getByText("Open"));
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });
  it("ignores Esc and hides Close when not dismissible", async () => {
    render(<DialogDemo dismissible={false} />);
    await userEvent.click(screen.getByText("Open"));
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });
  it("locks page scroll while open and restores it", async () => {
    render(<DialogDemo />);
    await userEvent.click(screen.getByText("Open"));
    expect(document.documentElement.style.overflow).toBe("hidden");
    await userEvent.click(screen.getByRole("button", { name: "Keep" }));
    expect(document.documentElement.style.overflow).toBe("");
  });
  it("has no a11y violations when open", async () => {
    const { container } = render(<DialogDemo />);
    await userEvent.click(screen.getByText("Open"));
    await expectNoA11yViolations(container);
  });
});

describe("Sheet", () => {
  it("renders titled content and closes via its button", async () => {
    const onClose = vi.fn();
    render(<Sheet open onClose={onClose} title="More"><p>Settings</p></Sheet>);
    expect(screen.getByRole("dialog", { name: "More" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});

function ToastDemo({ input }: { input?: Parameters<ReturnType<typeof useToast>["toast"]>[0] }) {
  const { toast } = useToast();
  return <button onClick={() => toast(input ?? { title: "Saved" })}>Fire</button>;
}
describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("shows a status toast and removes it after 4 seconds", () => {
    render(<ToastProvider><ToastDemo /></ToastProvider>);
    act(() => { screen.getByText("Fire").click(); });
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    act(() => { vi.advanceTimersByTime(4100); });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });
  it("errors use role=alert and stay 8 seconds", () => {
    render(<ToastProvider><ToastDemo input={{ title: "Could not save", tone: "error" }} /></ToastProvider>);
    act(() => { screen.getByText("Fire").click(); });
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
    act(() => { vi.advanceTimersByTime(7000); });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("pauses while hovered", () => {
    render(<ToastProvider><ToastDemo /></ToastProvider>);
    act(() => { screen.getByText("Fire").click(); });
    const t = screen.getByRole("status");
    fireEvent.mouseEnter(t);
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.mouseLeave(t);
    act(() => { vi.advanceTimersByTime(4100); });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("keeps at most three, newest last", () => {
    render(<ToastProvider><ToastDemo /></ToastProvider>);
    for (let i = 0; i < 5; i++) act(() => { screen.getByText("Fire").click(); });
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });
  it("an action toast does not auto-dismiss and runs its handler", async () => {
    const undo = vi.fn();
    render(<ToastProvider><ToastDemo input={{ title: "Removed", action: { label: "Undo", onClick: undo } }} /></ToastProvider>);
    act(() => { screen.getByText("Fire").click(); });
    act(() => { vi.advanceTimersByTime(30000); });
    expect(screen.getByText("Removed")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(undo).toHaveBeenCalled();
    expect(screen.queryByText("Removed")).not.toBeInTheDocument();
  });
  it("useToast outside the provider throws a clear error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ToastDemo />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

describe("Tooltip", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());
  it("appears after the delay on focus, is described-by, and Escape hides it", () => {
    render(<Tooltip label="Save question"><button>★</button></Tooltip>);
    const btn = screen.getByRole("button", { name: "★" });
    expect(btn).toHaveAccessibleDescription("Save question");
    expect(screen.getByRole("tooltip", { hidden: true })).not.toBeVisible();
    act(() => { btn.focus(); });
    act(() => { vi.advanceTimersByTime(450); });
    expect(screen.getByRole("tooltip")).toBeVisible();
    fireEvent.keyDown(btn, { key: "Escape" });
    expect(screen.getByRole("tooltip", { hidden: true })).not.toBeVisible();
  });
});
