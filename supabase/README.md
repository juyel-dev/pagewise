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

## Migrations applied to project `pagewise`

- `0001_init` schema + RLS (2026-10-25)
- `0002_seed_dev_chapter` Class 11 Biology Ch.6 as a **draft** chapter (staff-visible) with 7 unreviewed sample questions; static copy in `public/content/dev.1/`
- `0003_chapter_pdfs_bucket` private `chapter-pdfs` bucket: staff read all, students read live chapters only, only admins write

Promote an admin from the SQL editor: `update public.profiles set role = 'admin' where id = '<user uuid>';`
- `0004_remove_dev_seed_questions` removed the unreviewed sample questions
- `0005_question_bank_format` 5 question types from the owner's question-bank format, `external_id`, `topic`, chapter `pdf_file`/unit fields, student read policies for published questions of live chapters

RLS was verified on 2026-10-26 by running the real policies as an admin and as a student inside a rolled-back transaction: admin import/publish allowed; student sees nothing while a chapter is draft, sees published questions once live, cannot edit questions, cannot self-promote, cannot read or write another user's attempts, cannot import; report counter works.
