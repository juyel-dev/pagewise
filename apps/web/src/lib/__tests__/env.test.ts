import { describe, expect, it } from "vitest";
import { readEnv } from "../env";

describe("readEnv", () => {
  it("accepts a landing-only setup (no backend)", () => {
    const r = readEnv({});
    expect(r.fatal).toEqual([]);
    expect(r.env.siteUrl).toBe("http://localhost:3000");
    expect(r.env.supabaseUrl).toBe("");
  });
  it("accepts a full backend setup", () => {
    const r = readEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" });
    expect(r.fatal).toEqual([]);
    expect(r.env.supabaseKey).toBe("k");
  });
  it("treats half-configured Supabase as fatal", () => {
    expect(readEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" }).fatal).toHaveLength(1);
    expect(readEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" }).fatal).toHaveLength(1);
  });
  it("rejects a malformed Supabase URL", () => {
    expect(readEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" }).fatal.length).toBeGreaterThan(0);
  });
  it("derives the site URL: explicit > Vercel production host > localhost, without trailing slash", () => {
    expect(readEnv({ NEXT_PUBLIC_SITE_URL: "https://a.example/" }).env.siteUrl).toBe("https://a.example");
    expect(readEnv({ VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app" }).env.siteUrl).toBe("https://b.vercel.app");
  });
  it("warns, does not fail, on a bad site or waitlist URL", () => {
    const r = readEnv({ NEXT_PUBLIC_SITE_URL: "nope", NEXT_PUBLIC_WAITLIST_URL: "nope" });
    expect(r.fatal).toEqual([]);
    expect(r.problems).toHaveLength(2);
    expect(r.env.siteUrl).toBe("http://localhost:3000");
    expect(r.env.waitlistUrl).toBe("");
  });
  it("accepts a valid contact email and ignores an invalid one with a warning", () => {
    expect(readEnv({ NEXT_PUBLIC_CONTACT_EMAIL: "hello@example.com" }).env.contactEmail).toBe("hello@example.com");
    const bad = readEnv({ NEXT_PUBLIC_CONTACT_EMAIL: "not-an-email" });
    expect(bad.env.contactEmail).toBe("");
    expect(bad.problems).toHaveLength(1);
    expect(readEnv({}).env.contactEmail).toBe("");
  });
});
