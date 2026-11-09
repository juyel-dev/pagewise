// @vitest-environment jsdom
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderWithIntl } from "@/test/intl";
import { AppShell, isActive, isWorkspacePath } from "../app-shell";
import { OfflinePill } from "../offline-pill";

let pathname = "/home";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

beforeEach(() => { pathname = "/home"; });

describe("isActive", () => {
  it("matches the route and its children, not look-alikes", () => {
    expect(isActive("/study", "/study")).toBe(true);
    expect(isActive("/study/class11-bio-ch01", "/study")).toBe(true);
    expect(isActive("/studying", "/study")).toBe(false);
    expect(isActive("/home", "/study")).toBe(false);
  });
});

describe("isWorkspacePath", () => {
  it("is true for chapter workspaces only, so the hub keeps its tab bar", () => {
    expect(isWorkspacePath("/study/class11-bio-ch01")).toBe(true);
    expect(isWorkspacePath("/review/class11-bio-ch01")).toBe(true);
    expect(isWorkspacePath("/study")).toBe(false);
    expect(isWorkspacePath("/study/")).toBe(false);
    expect(isWorkspacePath("/home")).toBe(false);
  });
});

describe("AppShell", () => {
  it("shows the tab bar on the hub but not in a workspace", () => {
    pathname = "/study";
    const hub = renderWithIntl(<AppShell guest>x</AppShell>);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    hub.unmount();
    pathname = "/study/class11-bio-ch01";
    renderWithIntl(<AppShell guest>x</AppShell>);
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });
  it("guest: sidebar lists study surfaces but not Settings, and offers sign-in", () => {
    renderWithIntl(<AppShell guest>content</AppShell>);
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const n of ["Home", "Study", "Practice", "Progress", "Bookmarks"]) expect(within(nav).getByRole("link", { name: n })).toBeInTheDocument();
    expect(within(nav).queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.getByText("Studying as a guest")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Sign in" }).length).toBeGreaterThan(0);
  });
  it("signed in: shows Settings and the user card with class and NEET year", () => {
    renderWithIntl(<AppShell guest={false} user={{ name: "Juyel", cls: "11", year: 2027 }}>x</AppShell>);
    expect(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText("Juyel")).toBeInTheDocument();
    expect(screen.getByText("Class 11 · NEET 2027")).toBeInTheDocument();
  });
  it("marks the current route with aria-current and uses it as the page title", () => {
    pathname = "/study/class11-bio-ch01";
    renderWithIntl(<AppShell guest>x</AppShell>);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Study" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("banner")).toHaveTextContent("Study");
  });
  it("phone tab bar has four tabs plus More, and More opens the sheet with Bookmarks", async () => {
    renderWithIntl(<AppShell guest>x</AppShell>);
    const tabs = screen.getByRole("navigation", { name: "Primary" });
    expect(within(tabs).getAllByRole("link")).toHaveLength(4);
    await userEvent.click(within(tabs).getByRole("button", { name: "More" }));
    const sheet = screen.getByRole("dialog", { name: "More" });
    expect(within(sheet).getByRole("link", { name: "Bookmarks" })).toHaveAttribute("href", "/bookmarks");
    expect(within(sheet).getByRole("link", { name: "Terms of service" })).toHaveAttribute("href", "/legal/terms");
    expect(within(sheet).queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
  });
  it("hideTabBar removes the tab bar (Study workspace has its own action bar)", () => {
    renderWithIntl(<AppShell guest hideTabBar>x</AppShell>);
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });
  it("renders the right-hand cluster and children", () => {
    renderWithIntl(<AppShell guest right={<span>theme</span>}><p>page</p></AppShell>);
    expect(screen.getByText("theme")).toBeInTheDocument();
    expect(screen.getByText("page")).toBeInTheDocument();
  });
  it("has no a11y violations", async () => {
    const { container } = renderWithIntl(<AppShell guest={false} user={{ name: "Juyel", cls: "12", year: null }}><main>x</main></AppShell>);
    await expectNoA11yViolations(container);
  });
});

describe("OfflinePill", () => {
  it("appears only while offline and reacts to events", () => {
    renderWithIntl(<OfflinePill />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    act(() => { Object.defineProperty(navigator, "onLine", { configurable: true, value: false }); window.dispatchEvent(new Event("offline")); });
    expect(screen.getByRole("status")).toHaveTextContent("Offline");
    act(() => { Object.defineProperty(navigator, "onLine", { configurable: true, value: true }); window.dispatchEvent(new Event("online")); });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
