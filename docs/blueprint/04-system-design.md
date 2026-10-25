# Blueprint · 04 · System design

Builds on `docs/architecture/01-tech-stack.md`. This doc fixes the decisions that were left open there.

## 1. Rendering and routing

| Route | Rendering | Notes |
|---|---|---|
| `/` landing | static | flag switches waitlist ↔ sign-in |
| `/sign-in`, `/onboarding` | static shell + client | |
| `/home`, `/library`, `/progress`, `/bookmarks`, `/settings` | static shell + streamed user data | auth required |
| `/study/...` | static shell; chapter content from CDN JSON; user state streamed | core screen |
| `/review`, `/admin` | dynamic, role-gated server-side | `noindex`, 404 for non-roles |
| `/privacy`, `/terms`, `/about` | static | |

Auth is enforced in server components/actions and middleware; client checks are only for UX.

## 2. NCERT pane strategy (the biggest technical risk)

Facts to design around: the iframe is cross-origin; we **cannot** read its scroll position, detect its page, or highlight text; mobile browsers often cannot render PDFs inline; NCERT may block framing or change URLs.

**Decision:** the **app-owned page navigator is the source of truth**; the embed is a display surface. Layered strategy:

1. **Tier 1:** iframe to official URL `#page=N` (desktop browsers that pass the spike).
2. **Tier 2:** "Open NCERT page N" button opening the official PDF in a new window, with the chapter and page shown prominently (phones, blocked embeds, timeout).
3. **Tier 3 (optional, later):** user supplies their own copy of the PDF, rendered with pdf.js entirely in the browser; allows true page tracking. Never uploaded or stored by us.

Embed health is measured by the `ncert_embed_failed` event so we know the real failure rate. A **kill switch** (config flag) forces Tier 2 for everyone if NCERT changes behaviour.
**Spike first** (doc 08, S-1): test on Chrome/Edge/Firefox/Safari desktop, Android Chrome, iOS Safari, with real NCERT chapter URLs, before any workspace code.

## 3. Content delivery

- Build step (`scripts/publish-content`) exports `published` questions from Postgres to JSON (doc 03 §4), validates against schemas, writes to `public/content/<release>/` **or** Vercel Blob/another CDN; chosen in decision D-3 (doc 08). Default for MVP: committed to a separate `pagewise-content` repo or bucket so app deploys and content releases are independent.
- Client loads `manifest.json` (short cache), then the chapter file (immutable). Service worker (phase C) caches the last opened chapter.
- Content release is atomic: manifest points to a complete release; rollback = point manifest to the previous release.

## 4. State management

| State | Where |
|---|---|
| Current page, mode | URL (`?p`, `?mode`), shareable and refresh-safe |
| Answers in progress | React state + IndexedDB write-behind queue |
| Preferences | `localStorage` → `profiles.prefs` after sign-in (last-write-wins by timestamp) |
| Server data | Server components + server actions; revalidated by tag |
| Offline writes | Queue in IndexedDB, flush on reconnect, idempotent by `(user, question, attempt_no)` |

No global client store unless profiling shows a need.

## 5. Writes and API surface

Server actions (validated with Zod, auth + RLS enforced), no public REST until needed:

`recordAttempt`, `toggleBookmark`, `submitReport`, `updateReadingProgress` (debounced 5 s), `updateProfile`, `requestAccountDeletion`, `exportMyData`, reviewer actions (`claimItem`, `decide`, `editVersion`), admin actions (`publishRelease`, `setRole`). Rate limits per user/IP on reports, sign-in, consent emails and deletion requests (edge or Upstash-style limiter).

## 6. i18n

`next-intl`; locale in profile + URL-free (no `/hi` prefix in the app, since it is behind auth; public pages may add prefixes later). Catalogues in `messages/<lang>.json`; ICU plurals; content languages are separate files per chapter. Fonts per script self-hosted; RTL for Urdu via `dir`. Language fallback chain: user language → English with a visible "Not yet available in your language" note.

## 7. Performance budgets (enforced in CI where possible)

| Metric | Budget |
|---|---|
| Landing LCP (4G mid phone) | ≤ 2.5 s |
| Workspace interactive (laptop, warm cache) | ≤ 1.5 s |
| Chapter JSON | ≤ 100 KB compressed |
| JS shipped to workspace route | ≤ 200 KB gz (excluding PDF viewer, which is the browser's) |
| Interaction latency (select/check) | ≤ 100 ms |
| CLS | ≤ 0.1 |

Image/font discipline: self-hosted variable fonts with subsetting; no layout-shifting embeds (reserve pane size).

## 8. Reliability and degradation

| Failure | Behaviour |
|---|---|
| Supabase down | Reading and checking continue from static content; writes queue; banner shown |
| CDN content fetch fails | Retry with backoff; fallback to previous release cached in SW |
| NCERT unavailable | Fallback card; practice unaffected |
| Auth expired | Soft re-auth modal preserving state |
| Bad content release | Rollback via manifest pointer |

## 9. Environments, CI/CD

- Branches: `main` (production), feature branches → Vercel preview + dev Supabase.
- GitHub Actions on every PR: install, lint, typecheck, unit tests, schema validation of fixtures, contrast script, build, Playwright smoke on preview, axe.
- Production deploy only from `main`; DB migrations applied through a manual-approval workflow.
- Secrets only in Vercel/Supabase/GitHub secrets. `.env.example` is the contract. **Any token ever pasted in a chat is revoked.**
- Dependabot weekly; Next.js major upgrades read the framework docs first (see `AGENTS.md`).

## 10. Code organisation

```
src/app/(marketing)  src/app/(app)  src/app/(review)
src/features/{auth,library,workspace,practice,progress,bookmarks,review,settings}
src/components/ui     src/lib/{supabase,content,i18n,analytics,flags}
src/types             messages/   content-schemas/   supabase/migrations
scripts/{publish-content,validate-content,check-contrast}
```
Rules: features own their components, hooks, actions and tests; `ui` has no business logic; no cross-feature imports except through `lib`.

## 11. Scale notes

Reads are CDN-served; writes ≈ one attempt row per answered question. At 100k daily actives × 40 answers = 4M rows/day, so plan monthly partitioning of `attempts` before public launch and an archival policy; use Supabase connection pooling; load test at 5× expected peak before exam season. Revisit hosting tier at launch (Vercel Pro and Supabase paid plan).
