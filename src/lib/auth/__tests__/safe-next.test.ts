import { describe, expect, it } from "vitest";
import { safeNext } from "../safe-next";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/library")).toBe("/library");
    expect(safeNext("/study/bio/11/ch6?p=3")).toBe("/study/bio/11/ch6?p=3");
  });
  it("rejects external, protocol-relative and missing values", () => {
    for (const v of ["https://evil.com", "//evil.com", "/\\evil.com", "evil.com", "", null, undefined]) {
      expect(safeNext(v as string | null | undefined)).toBe("/home");
    }
  });
  it("never redirects back into auth routes", () => {
    expect(safeNext("/sign-in")).toBe("/home");
    expect(safeNext("/auth/callback?code=x")).toBe("/home");
  });
});
