# Blueprint · 05 · Security and privacy

Engineering plan, not legal advice. Lawyer review is a launch gate (doc 07).

## 1. Assets and threats

| Asset | Threat | Control |
|---|---|---|
| Student accounts (many minors) | Account takeover, data leak | Google/OTP auth, short sessions, RLS everywhere, no service key in browser |
| Attempt/progress data | Cross-user read | RLS tests, no admin read of raw attempts |
| Reviewer/admin power | Privilege escalation, rogue edits | Role only via admin function, audit log, 2FA for admins, immutable versions |
| Content accuracy | Poisoned/incorrect questions | Auto-check + human review + report loop + rollback |
| Content itself | Scraping of static JSON | Accepted risk (D-4); ToS, edge rate limits, watermark-free; value is the product |
| Availability | Traffic spike, abuse | CDN, rate limits, degradation plan |
| Secrets | Leak via git/chat | Env vars only, secret scanning on, rotate on exposure |
| Third-party embeds | NCERT changes/blocks | Fallback tier, kill switch |

## 2. Authentication and sessions

Supabase Auth; PKCE; HttpOnly cookies via SSR helpers; session 7 days sliding, re-auth for sensitive actions (delete account, change email, role change). Admin and reviewer accounts require 2FA (phase B). No passwords stored.

## 3. Authorisation

Defence in depth: middleware route gating → server action checks → Postgres RLS. A request must pass all three. Reviewer pages return 404 (not 403) to non-roles.

## 4. Input and output safety

All server actions validate with Zod; question markup is a safe subset rendered by our own parser (no `dangerouslySetInnerHTML`); strict CSP (self + required script/style hashes, frame-src limited to NCERT origin, object-src none); `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal, HSTS.
Note: CSP `frame-src` must include the NCERT origin used by the embed.

## 5. Minors and DPDP Act 2023 (design requirements)

- Collect only: email, display name, class, target year, language, progress.
- Under-18: verifiable parental consent before any personal-data processing beyond the consent request itself; parent email stored hashed after verification; consent record timestamped.
- No advertising, no behavioural tracking or profiling of minors; analytics aggregated and consented; no third-party ad/pixel scripts anywhere.
- Rights: access/export, correction, deletion, grievance officer contact visible in Settings and footer.
- Breach plan: detect, contain, assess, notify Data Protection Board and affected users as required; maintain an incident log.
- Data location and processors: list Supabase, Vercel, Sentry, analytics provider in the privacy policy with purposes.

## 6. Retention and deletion

| Data | Retention |
|---|---|
| Profile and activity | While account active |
| Deleted account | Soft-deleted 7 days (undo), then hard-deleted across all tables; backups age out within 35 days |
| Withdrawn parental consent | Student data deleted per the same job |
| Audit log | 2 years, pseudonymised after account deletion |
| Waitlist emails | Until launch announcement sent, then deleted or converted with consent |

## 7. Abuse prevention

Rate limits: sign-in/magic-link (per IP + email), report submission (per user/day), consent emails, exports. Reports deduplicated per user. Bookmark/attempt endpoints bounded by payload size. Disposable-email and bot checks (Turnstile) only if abuse appears.

## 8. Logging and privacy of telemetry

Sentry: scrub emails/names, no request bodies; sample rate tuned. Product analytics cookieless, no user-level behavioural profiles for minors; events carry pseudonymous ids and no free text. Server logs retain 30 days.

## 9. Supply chain

Lockfile committed, Dependabot, `npm audit` in CI (fail on high), pinned GitHub Actions by SHA, minimal dependencies, review any package that runs install scripts.

## 10. Security checklist before public launch

- [ ] RLS tests green; manual pen-test pass on auth, reports, reviewer routes
- [ ] CSP in enforce mode with no violations in staging
- [ ] 2FA on all admin/reviewer accounts; secrets rotated
- [ ] Consent flow tested with a real parent mailbox
- [ ] Deletion and export tested end to end
- [ ] Backup and restore drill completed
- [ ] Incident runbook written and contact tree agreed
