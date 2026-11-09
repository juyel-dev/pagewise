/**
 * Typed, validated public environment (blueprint/14 §10).
 * NEXT_PUBLIC_* values must be read as literal `process.env.X` accesses so Next can inline them,
 * hence the explicit source object below. `readEnv` is pure and unit-tested.
 */
type Source = Record<string, string | undefined>;

export type AppEnv = {
  supabaseUrl: string;
  supabaseKey: string;
  siteUrl: string;
  waitlistUrl: string;
  /** Public contact address for the footer; empty hides the link. */
  contactEmail: string;
};

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function readEnv(source: Source): { env: AppEnv; problems: string[]; fatal: string[] } {
  const problems: string[] = [];
  const fatal: string[] = [];
  const supabaseUrl = (source.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseKey = (source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  // Both unset is a valid "landing page only" setup; exactly one set is a broken deploy.
  if (Boolean(supabaseUrl) !== Boolean(supabaseKey)) fatal.push("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set together.");
  if (supabaseUrl && !isHttpUrl(supabaseUrl)) fatal.push("NEXT_PUBLIC_SUPABASE_URL is not a valid URL.");

  const explicit = (source.NEXT_PUBLIC_SITE_URL ?? "").trim();
  const vercelHost = (source.VERCEL_PROJECT_PRODUCTION_URL ?? "").trim();
  let siteUrl = explicit || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
  if (!isHttpUrl(siteUrl)) {
    problems.push("NEXT_PUBLIC_SITE_URL is not a valid URL; falling back to localhost.");
    siteUrl = "http://localhost:3000";
  }
  siteUrl = siteUrl.replace(/\/+$/, "");

  const waitlistUrl = (source.NEXT_PUBLIC_WAITLIST_URL ?? "").trim();
  if (waitlistUrl && !isHttpUrl(waitlistUrl)) problems.push("NEXT_PUBLIC_WAITLIST_URL is not a valid URL.");

  const contact = (source.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();
  const contactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : "";
  if (contact && !contactEmail) problems.push("NEXT_PUBLIC_CONTACT_EMAIL is not a valid email address.");

  return { env: { supabaseUrl, supabaseKey, siteUrl, waitlistUrl: isHttpUrl(waitlistUrl) ? waitlistUrl : "", contactEmail }, problems, fatal };
}

const result = readEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WAITLIST_URL: process.env.NEXT_PUBLIC_WAITLIST_URL,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
});

for (const p of result.problems) console.warn(`[env] ${p}`);
// A half-configured backend is never intentional: stop the build/boot instead of shipping a broken app.
if (result.fatal.length > 0) throw new Error(`[env] ${result.fatal.join(" ")}`);

export const env: AppEnv = result.env;
