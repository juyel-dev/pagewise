import axe from "axe-core";
import { expect } from "vitest";

/** Fails with a readable list when axe finds violations. Colour contrast is checked separately (scripts/check-contrast.py). */
export async function expectNoA11yViolations(container: Element) {
  const result = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}
