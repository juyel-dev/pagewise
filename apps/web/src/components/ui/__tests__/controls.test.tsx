// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Button, ButtonLink } from "../button";
import { Badge, Chip } from "../chip";
import { IconButton } from "../icon-button";
import { SegmentedControl } from "../segmented-control";
import { Tabs } from "../tabs";

describe("Button", () => {
  it("renders label and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("loading disables it, keeps the label and announces busy", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Save</Button>);
    const b = screen.getByRole("button", { name: "Save" });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute("aria-busy", "true");
    await userEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
  });
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
  it("ButtonLink renders a link", () => {
    render(<ButtonLink href="/study">Study</ButtonLink>);
    expect(screen.getByRole("link", { name: "Study" })).toHaveAttribute("href", "/study");
  });
  it("has no a11y violations", async () => {
    const { container } = render(<div><Button>A</Button><Button variant="danger" size="sm">B</Button></div>);
    await expectNoA11yViolations(container);
  });
});

describe("IconButton", () => {
  it("exposes its label as the accessible name", () => {
    render(<IconButton label="Close"><span aria-hidden="true">×</span></IconButton>);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});

describe("Chip and Badge", () => {
  it("Chip reports selection with aria-pressed and shows the count", async () => {
    const onClick = vi.fn();
    render(<Chip selected count={4} onClick={onClick}>p.4</Chip>);
    const c = screen.getByRole("button", { name: /p\.4/ });
    expect(c).toHaveAttribute("aria-pressed", "true");
    expect(c).toHaveTextContent("4");
    await userEvent.click(c);
    expect(onClick).toHaveBeenCalled();
  });
  it("Badge renders text", () => {
    render(<Badge tone="good">Live</Badge>);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});

function Seg() {
  const [v, setV] = useState<"focus" | "list">("focus");
  return <SegmentedControl label="Question view" value={v} onChange={setV} options={[{ value: "focus", label: "Focus" }, { value: "list", label: "List" }]} />;
}
describe("SegmentedControl", () => {
  it("is a radiogroup with one tab stop on the selected option", () => {
    render(<Seg />);
    expect(screen.getByRole("radiogroup", { name: "Question view" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Focus" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("tabindex", "-1");
  });
  it("arrow keys move focus and selection, wrapping around", async () => {
    render(<Seg />);
    screen.getByRole("radio", { name: "Focus" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "List" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Focus" })).toBeChecked();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "Focus" })).toBeChecked();
  });
  it("has no a11y violations", async () => {
    const { container } = render(<Seg />);
    await expectNoA11yViolations(container);
  });
});

describe("Tabs", () => {
  const tabs = [{ id: "read", label: "Read", panel: <p>PDF</p> }, { id: "practise", label: "Practise", panel: <p>Questions</p> }];
  it("shows only the selected panel but keeps others mounted", () => {
    render(<Tabs label="Study" tabs={tabs} defaultValue="practise" />);
    expect(screen.getByRole("tab", { name: "Practise" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Questions")).toBeVisible();
    expect(screen.getByText("PDF", { selector: "p" })).not.toBeVisible();
  });
  it("arrow keys switch tabs; Home and End jump", async () => {
    const onValueChange = vi.fn();
    render(<Tabs label="Study" tabs={tabs} onValueChange={onValueChange} />);
    screen.getByRole("tab", { name: "Read" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith("practise");
    expect(screen.getByRole("tab", { name: "Practise" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(onValueChange).toHaveBeenLastCalledWith("read");
  });
  it("has no a11y violations", async () => {
    const { container } = render(<Tabs label="Study" tabs={tabs} />);
    await expectNoA11yViolations(container);
  });
});
