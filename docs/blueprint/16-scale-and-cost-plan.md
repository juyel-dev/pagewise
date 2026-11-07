# Blueprint · 16 · Scale, performance and cost plan

**Status:** Proposed. Numbers marked *(assumption)* are planning inputs to be replaced by measurements; plan limits and prices must be **re-checked on the vendors' pages** when a decision depends on them.

## 1. What grows, and how fast

| Data | Grows with | Order of magnitude *(assumption)* | Implication |
|---|---|---|---|
| Content (chapters, pages, questions) | Our output, not users | Hundreds of pages, thousands of questions per subject | Small; cache hard on the CDN |
| `attempts` | Users × questions answered | Tens of bytes to ~150 B per row; 1 M rows is well under 1 GB with indexes | Biggest table; index by `(user_id, created_at)`; partition by month only if it passes ~50 M rows |
| `reading_progress`, `daily_stats` | Users × days | Upsert per user per day/page | Keep as upserts, never append logs |
| PDFs | Chapters | A few MB each, private storage | Serve through signed URLs with long cache headers |

## 2. Performance budgets (enforced in CI where possible)

| Metric | Budget | Where measured |
|---|---|---|
| LCP, landing and study hub | < 2.5 s, mid-range Android, 4G | Lighthouse CI on previews |
| Study workspace first usable (page visible + first question) | < 3 s on the same profile | Playwright timing |
| Interaction (answer, next, page turn) | < 200 ms | Playwright |
| JS per route (first load) | Set from the first measured build, then must not grow > 10 % without a note | `next build` output |
| Server round trips per page render | ≤ 3 sequential, all to a database in the same region | Code review checklist |

Known costs to remove first (from the 2026-11 audit): PDF viewer reads every page size sequentially before showing; all of a chapter's questions load at once; duplicate auth/profile lookups per render.

## 3. Caching

- Public content (chapters, page map, published questions): cached with tags, revalidated by a signed call from the admin app on publish.
- Per-user data: streamed behind the static shell; never cached shared.
- PDFs: signed URL with long `Cache-Control`; browser keeps the chapter after first load.
- Guest data stays in IndexedDB; it costs nothing server-side.

## 4. Capacity and the free tier

Start on free tiers. Re-check limits (database size, egress, auth users, storage, function time, bandwidth) before H3 and again before H4. Likely first pressure points, in order: **storage/egress from PDFs**, **database size from attempts**, **function time**. Responses: longer browser caching, CDN in front of the PDF bucket, pruning raw attempts into per-day aggregates after 12 months (keeping per-question stats), then a paid plan.

## 5. Upgrade triggers (review quarterly)

| Signal | Action |
|---|---|
| Any resource > 70 % of a free limit | Plan the upgrade or the reduction now |
| p75 server render > 800 ms after region fix | Profile queries; add indexes or merge round trips |
| Error rate > 1 % of requests for a day | Incident review, add a test |
| Monthly cost > what the owner has agreed | Decide: cache, reduce, or monetise |

## 6. Observability

- Errors: Sentry in both apps (H1).
- Traces and slow queries: Supabase advisors + `pg_stat_statements` reviewed monthly.
- Web vitals: Vercel Speed Insights.
- Product analytics: cookieless, no ad pixels (decision 14). Learning analytics come from `attempts`.
- Uptime: external check on `/` and one data route.
