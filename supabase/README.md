# Supabase

`migrations/0001_init.sql` creates the schema, RLS policies and column-level grants from `docs/blueprint/03-data-model.md` and `09-pdf-viewer-spec.md`.

- Apply to a **dedicated PageWise project** (dev first). Do not apply to projects used by other apps.
- RLS tests (pgTAP) are added in milestone M4; until then do not point real users at the database.
- Roles: `student` (default), `reviewer`, `admin`. `role` and `consent_status` are not client-writable (column grants). Promote the first admin with SQL from the dashboard.

## Project

- Supabase project **pagewise**, ref `fimtqszwgkjzmycvdrwl`, region ap-south-1 (Mumbai), created 2026-10-25.
- `0001_init` applied to it on 2026-10-25. The two older projects (AI Autopilot, go) were paused at the owner's request.
- API URL: `https://fimtqszwgkjzmycvdrwl.supabase.co`. Publishable key goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Vercel env). The service-role key is never committed.

## Security advisor notes (2026-10-25)

- `parental_consents` has RLS and no policy on purpose: only the service role may touch it.
- `my_role`, `is_staff`, `is_admin`, `write_audit` are SECURITY DEFINER and executable by signed-in users on purpose: RLS policies need them, they only reveal the caller's own role, and `write_audit` writes only when the caller is staff. Revisit by moving helpers to a non-exposed schema before public launch.


## Dashboard settings required for sign-in (cannot be set from code)

1. **Authentication → URL Configuration:** Site URL `https://pagewise-ten.vercel.app`; add Redirect URLs `https://pagewise-ten.vercel.app/**`, `http://localhost:3000/**` and the Vercel preview pattern if previews are used. Without this, sign-in links fall back to the wrong address.
2. **Authentication → SMTP:** the built-in sender allows only a handful of emails per hour. Configure a custom SMTP provider (e.g. Resend) before inviting beta users.
3. **Authentication → Providers:** Email is on by default. Google is added later (needs a Google Cloud OAuth client).
4. Closed beta: consider turning off "Allow new users to sign up" after the invited users have signed in once, or use invite emails.
