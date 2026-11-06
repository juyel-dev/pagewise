/** Env-based feature flags (blueprint 01 PLT-7). NEXT_PUBLIC_* values are inlined at build time. */
export const flags = {
  /** false = landing shows the waitlist; true = landing shows sign-in. */
  appOpen: process.env.NEXT_PUBLIC_APP_OPEN === "true",
  /** true = skip the own PDF viewer and use "Open NCERT page N" (docs/blueprint/09 §8). */
  ncertFallback: process.env.NEXT_PUBLIC_NCERT_FALLBACK === "true",
  /** Show "Continue with Google" only after the Google provider is enabled in Supabase. */
  googleAuth: process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true",
} as const;
