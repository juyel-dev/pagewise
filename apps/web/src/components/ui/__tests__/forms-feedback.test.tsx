// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Card } from "../card";
import { EmptyState } from "../empty-state";
import { Checkbox, SelectField, Switch, TextField, TextareaField } from "../field";
import { KeyHint } from "../key-hint";
import { ProgressBar, ProgressRing } from "../progress";
import { Skeleton, SkeletonGroup } from "../skeleton";

describe("fields", () => {
  it("TextField links label, helper and error for assistive tech", () => {
    const { rerender } = render(<TextField label="Your name" helper="As on your ID" />);
    const input = screen.getByLabelText("Your name");
    expect(input).toHaveAccessibleDescription("As on your ID");
    expect(input).not.toHaveAttribute("aria-invalid");
    rerender(<TextField label="Your name" helper="As on your ID" error="Name is required" />);
    expect(screen.getByLabelText("Your name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Your name")).toHaveAccessibleDescription("Name is required");
  });
  it("hideLabel keeps the label for screen readers only", () => {
    render(<TextField label="Search" hideLabel />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toHaveClass("sr-only");
  });
  it("Textarea and Select expose labels", () => {
    render(<div><TextareaField label="Message" /><SelectField label="Class"><option>11</option></SelectField></div>);
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByLabelText("Class")).toBeInTheDocument();
  });
  it("Checkbox toggles from its label", async () => {
    render(<Checkbox label="Remember me" />);
    await userEvent.click(screen.getByText("Remember me"));
    expect(screen.getByRole("checkbox", { name: "Remember me" })).toBeChecked();
  });
  it("has no a11y violations", async () => {
    const { container } = render(<div><TextField label="Name" error="Required" /><SelectField label="Class"><option>11</option></SelectField><Checkbox label="OK" /></div>);
    await expectNoA11yViolations(container);
  });
});

function Sw() {
  const [on, setOn] = useState(false);
  return <Switch label="Follow my reading" checked={on} onCheckedChange={setOn} />;
}
describe("Switch", () => {
  it("is role=switch, toggles by click and keyboard, label click works", async () => {
    render(<Sw />);
    const s = screen.getByRole("switch", { name: "Follow my reading" });
    expect(s).toHaveAttribute("aria-checked", "false");
    await userEvent.click(s);
    expect(s).toHaveAttribute("aria-checked", "true");
    s.focus();
    await userEvent.keyboard(" ");
    expect(s).toHaveAttribute("aria-checked", "false");
    await userEvent.click(screen.getByText("Follow my reading"));
    expect(s).toHaveAttribute("aria-checked", "true");
  });
  it("has no a11y violations", async () => {
    const { container } = render(<Sw />);
    await expectNoA11yViolations(container);
  });
});

describe("progress", () => {
  it("ProgressBar exposes value, clamps and has a name", () => {
    const { rerender } = render(<ProgressBar value={3} max={9} label="Pages read" />);
    const bar = screen.getByRole("progressbar", { name: "Pages read" });
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemax", "9");
    rerender(<ProgressBar value={99} max={9} label="Pages read" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "9");
  });
  it("ProgressRing is an image with a full-sentence label and shows its content", () => {
    render(<ProgressRing value={12} max={20} label="12 of 20 questions today"><span>12 / 20</span></ProgressRing>);
    expect(screen.getByRole("img", { name: "12 of 20 questions today" })).toHaveTextContent("12 / 20");
  });
});

describe("skeleton, empty state, key hint, card", () => {
  it("SkeletonGroup announces one Loading", () => {
    render(<SkeletonGroup><Skeleton className="h-4" /><Skeleton className="h-4" /></SkeletonGroup>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });
  it("EmptyState renders title, text and action", () => {
    render(<EmptyState title="No saved questions yet" action={<button>Go to Study</button>}>Tap the star on any question.</EmptyState>);
    expect(screen.getByRole("heading", { name: "No saved questions yet" })).toBeInTheDocument();
    expect(screen.getByText("Tap the star on any question.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to Study" })).toBeInTheDocument();
  });
  it("KeyHint renders a kbd", () => {
    render(<KeyHint>N</KeyHint>);
    expect(screen.getByText("N").tagName).toBe("KBD");
  });
  it("Card renders children", () => {
    render(<Card variant="raised">Hello</Card>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
