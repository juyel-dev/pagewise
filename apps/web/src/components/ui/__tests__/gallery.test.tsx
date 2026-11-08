// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Gallery } from "@/app/dev/components/gallery";
import { ToastProvider } from "@/components/ui/toast";
import { expectNoA11yViolations } from "@/test/axe";

describe("design-system gallery", () => {
  it("renders every section without accessibility violations", async () => {
    const { container } = render(<ToastProvider><Gallery /></ToastProvider>);
    for (const name of ["Type roles", "Colour tokens", "Buttons", "Chips, badges, keys", "Segmented control and tabs", "Fields", "Progress and loading", "Cards and empty state", "Overlays"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    await expectNoA11yViolations(container);
  });
});
