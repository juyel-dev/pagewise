# Architecture · 01 · Tech stack and system design

Goal: serve lakhs of students cheaply and reliably, keep content accuracy under tight control, and let one person (plus AI) build and run it.

## 1. Guiding idea

> **Content is static, users are dynamic.**
> Questions are generated and reviewed *offline*, published as versioned static data on a CDN, and read by every student. The database only holds *users and their activity*. This keeps cost near zero per extra student and removes AI from the request path.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, Cache Components / PPR), React 19, TypeScript | Static shell + streamed dynamic parts |
| Styling | Tailwind CSS v4 + CSS-variable tokens | Theme + subject colours via variables |
| UI | Own primitives (shadcn-style), lucide-react | See design foundations |
| i18n | `next-intl` (from step 2) | English first; catalogues per language |
| Auth | **Supabase Auth**: Google first, phone OTP later | Parent-consent flow for under-18 before public launch |
| Database | **Supabase Postgres** with Row Level Security | Users, progress, bookmarks, reports, review workflow |
| Content delivery | Static JSON per `(book, page, lang)` versioned, served from CDN | Built from the reviewed content DB |
| Question pipeline | Offline scripts (Node/TS) + Gemini for generation, second pass for verification | Run by us, never per user |
| Hosting | **Vercel** | Owner's choice; Hobby = non-commercial, upgrade to Pro before monetising |
| Observability | Sentry (errors), privacy-safe product analytics (PostHog or Plausible) | No tracking of minors beyond aggregate, consented analytics |
| CI | GitHub Actions: lint, typecheck, build on every PR | Vercel preview per PR |

## 3. High-level diagram

```
                +-----------------------+
 Student  ----> |  Next.js app (Vercel) | ----> Supabase (Auth, Postgres+RLS)
 browser        |  static shell + PPR   |         users, progress, bookmarks, reports
   |            +-----------+-----------+
   |                        |
   |                        v
   |             Static question JSON (CDN, versioned)
   |                        ^
   |                        | publish
   |            +-----------+-----------+
   |            | Content pipeline      |  generate -> auto-check -> human review
   |            | (offline scripts)     |  (reviewer console writes to Supabase)
   |            +-----------------------+
   v
 NCERT official site (PDF opened/embedded from NCERT's own URL; never copied by us)
```

## 4. Frontend architecture

- **Routes** (planned): `/` landing · `/sign-in` · `/home` · `/library` · `/study/[subject]/[class]/[chapter]` (workspace) · `/progress` · `/bookmarks` · `/settings` · `/review` (reviewer console).
- **Rendering:** marketing pages static; app pages use a static shell with per-user data streamed in; question data fetched from CDN JSON and cached.
- **State:** server data via React Server Components + small client islands; client UI state in React state/URL (current page, mode); lightweight store only if needed. Persist preferences (mode, split position, theme, language) in `localStorage` and sync to the profile once signed in.
- **Workspace internals:** `SplitPane` (resizable, keyboard-accessible), `PdfPane` (embed or fallback), `PracticePane` with `FocusMode` and `ListMode`, shared `QuestionCard`; keyboard shortcut layer.
- **Structure:** feature folders under `src/features/<name>` (components, hooks, server actions, types) once the app shell lands; shared primitives remain in `src/components/ui`.
- **Quality:** TypeScript strict, ESLint, Vitest for logic, Playwright for key flows (sign-in, answer a question, switch mode), axe checks for accessibility.

## 5. Data model (first cut, Supabase Postgres)

| Table | Key fields |
|---|---|
| `profiles` | `id (auth uid)`, `display_name`, `neet_year`, `language`, `is_minor`, `consent_status`, `role (student/reviewer/admin)` |
| `books` | `id`, `subject`, `class`, `title`, `official_url`, `edition` |
| `chapters` | `id`, `book_id`, `number`, `title`, `first_pdf_page`, `last_pdf_page` |
| `questions` | `id`, `chapter_id`, `pdf_page`, `type`, `difficulty`, `status`, `current_version_id` |
| `question_versions` | `id`, `question_id`, `lang`, `stem`, `options[]`, `answer`, `explanation`, `created_by`, `created_at` |
| `reviews` | `id`, `question_version_id`, `reviewer_id`, `decision`, `notes`, `created_at` |
| `attempts` | `id`, `user_id`, `question_id`, `chosen`, `is_correct`, `time_ms`, `created_at` |
| `bookmarks` | `user_id`, `question_id`, `created_at` |
| `reports` | `id`, `question_id`, `user_id`, `reason`, `status` |
| `reading_progress` | `user_id`, `chapter_id`, `last_page`, `updated_at` |

Rules: RLS on every table; students can only read/write their own rows; reviewers get scoped access to the review queue; published questions are exported as static JSON, never queried per request.

## 6. Scale and cost

- **Reads** (questions): CDN-cached static JSON → effectively free per user.
- **Writes** (attempts, bookmarks): batched/debounced client-side; Postgres handles this volume comfortably; add read replicas/caching only when metrics demand it.
- **AI cost:** one-off per page per language, not per user. Adding a language = one batch run + review.
- **Peak risk:** the weeks around the exam. Load-test before then; keep the auth and attempts path lean.

## 7. Security

- Supabase RLS everywhere; service-role key only in server-side scripts, never in the browser.
- Secrets in Vercel/Supabase env, never in git; `.env*` ignored except `.env.example`.
- Input validation on all server actions; rate limiting on report and sign-in endpoints.
- Reviewer console behind role checks; audit trail via `reviews` and `question_versions`.
- Dependency updates automated (Dependabot).

## 8. Environments

| Env | Purpose |
|---|---|
| Local | `npm run dev`, Supabase local or a dev project |
| Preview | Vercel preview per PR, dev Supabase project |
| Production | Vercel production, production Supabase project |

## 9. Build order (frontend first)

1. Landing page (done) →
2. App shell: sign-in, onboarding, layout, i18n scaffolding, design-system components →
3. Library + Study workspace on **sample content** (static fixtures) →
4. Supabase wiring: auth, attempts, bookmarks, progress →
5. Content pipeline + reviewer console →
6. Biology 11 and 12 content, closed beta with student reviewers →
7. Public launch (privacy policy, parental consent, load test).
