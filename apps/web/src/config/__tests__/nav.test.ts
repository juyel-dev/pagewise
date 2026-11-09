import { describe, expect, it } from "vitest";
import messages from "../../../messages/en.json";
import { NAV_ITEMS } from "../nav";

describe("nav registry", () => {
  it("every item has an English label and a root-relative href", () => {
    for (const i of NAV_ITEMS) {
      expect(messages.nav[i.key], `missing nav.${i.key}`).toBeTruthy();
      expect(i.href.startsWith("/")).toBe(true);
    }
  });
  it("has exactly four phone tabs; only Settings needs an account", () => {
    expect(NAV_ITEMS.filter((i) => i.tab)).toHaveLength(4);
    expect(NAV_ITEMS.filter((i) => i.auth).map((i) => i.key)).toEqual(["settings"]);
  });
  it("hrefs are unique", () => {
    expect(new Set(NAV_ITEMS.map((i) => i.href)).size).toBe(NAV_ITEMS.length);
  });
});
