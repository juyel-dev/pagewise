// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderWithIntl } from "@/test/intl";
import { PublicFooter } from "../public-footer";
import { PublicHeader } from "../public-header";

vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }) }));

describe("PublicHeader", () => {
  it("links to sign in and, as the primary action, to Study (no sign-up wall)", () => {
    renderWithIntl(<PublicHeader />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
    expect(screen.getByRole("link", { name: "Start studying" })).toHaveAttribute("href", "/study");
    expect(screen.getByRole("link", { name: "Pagewise home" })).toHaveAttribute("href", "/");
  });
  it("shows no section links unless given (no dead anchors)", () => {
    renderWithIntl(<PublicHeader />);
    expect(screen.queryByRole("navigation", { name: "Site" })).not.toBeInTheDocument();
  });
  it("renders provided section links", () => {
    renderWithIntl(<PublicHeader links={[{ href: "#how", label: "How it works" }]} />);
    expect(within(screen.getByRole("navigation", { name: "Site" })).getByRole("link", { name: "How it works" })).toHaveAttribute("href", "#how");
  });
  it("has no a11y violations", async () => {
    const { container } = renderWithIntl(<PublicHeader />);
    await expectNoA11yViolations(container);
  });
});

describe("PublicFooter", () => {
  it("keeps the NCERT/NTA non-affiliation disclaimer and legal links", () => {
    renderWithIntl(<PublicFooter />);
    expect(screen.getByText(/not affiliated with, or endorsed by, NCERT or NTA/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms of service" })).toHaveAttribute("href", "/legal/terms");
    expect(screen.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/legal/privacy");
  });
  it("hides Contact when no contact email is configured", () => {
    renderWithIntl(<PublicFooter />);
    expect(screen.queryByRole("link", { name: "Contact" })).not.toBeInTheDocument();
  });
  it("has no a11y violations", async () => {
    const { container } = renderWithIntl(<PublicFooter />);
    await expectNoA11yViolations(container);
  });
});
