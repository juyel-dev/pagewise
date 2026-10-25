# Blueprint · 00 · Master blueprint

**Status:** v1.0, approved by owner on 2026-10-25 (all recommendations in doc 08 accepted; PDF approach per doc 09). App code may start with milestone M1 spikes, in the order of doc 09.
**Roles in this document:** product (what), architecture (how), design (feel), ops (run), all written to production level.

## 1. What we are building

A web app where a NEET UG aspirant reads an NCERT page on the left and practises original, reviewed questions for exactly that page on the right. See `docs/product/01-vision-and-positioning.md` for positioning; this blueprint turns it into a buildable, testable specification.

**North-star outcome:** a student reads a page, answers its questions, sees the explanation and the source page, and comes back tomorrow.

## 2. How to use this blueprint

| Doc | Answers |
|---|---|
| `01-feature-spec.md` | Every feature, its ID, priority, phase and acceptance criteria |
| `02-screens-spec.md` | Every screen: layout, states, interactions, keyboard, events |
| `03-data-model.md` | Database schema, RLS, content file format, versioning |
| `04-system-design.md` | Rendering, content delivery, PDF viewer strategy, i18n, performance, CI/CD |
| `05-security-privacy.md` | Threats, auth, minors/DPDP, abuse, retention |
| `06-content-and-reviewers.md` | Question pipeline, quality bar, reviewer console and community |
| `07-quality-ops.md` | Testing, accessibility, analytics events, SEO, observability, launch checklist |
| `08-build-plan-and-open-questions.md` | Milestones, spikes, risks, accepted decisions |
| `09-pdf-viewer-spec.md` | **Own PDF.js viewer, page detection, page mapping, practice-this-page, PDF storage** (supersedes iframe approach) |

Existing docs (vision, roadmap, design foundations, tech stack, content guardrails, decisions) remain valid. Where this blueprint refines them, it says so and `decisions.md` is updated after approval.

## 3. Scope by phase

| Phase | Name | Outcome |
|---|---|---|
| P-A | **MVP / closed beta** | Biology 11+12, English, laptop-first. Sign-in, library, workspace, answer + explanation, bookmarks, reports, progress basics, reviewer console. Invite-only. |
| P-B | **Public launch** | Parent-consent flow, privacy policy and terms, load-tested, mobile-usable workspace, analytics, error tracking, support channel. |
| P-C | **Depth** | Hindi + Bengali, mistake notebook, chapter tests, spaced repetition, notes, PWA. |
| P-D | **Breadth** | Physics + Chemistry, more languages, full mocks, rank/percentile. |
| P-E | **Scale and revenue** | Premium tier, coaching dashboards, AI tutor, referral, native wrappers. |

Anything not listed in a phase is out of scope until added here with an ID.

## 4. Non-negotiable principles (from vision, made testable)

1. **Page-anchored:** a question without a verified source page cannot reach `published`.
2. **Accuracy over volume:** no question is visible to students without passing auto-check and human review.
3. **Content is static, users are dynamic:** no AI call in any student request path.
4. **Minors are first-class:** no ads, no behavioural tracking, parental consent before public launch.
5. **Honest copy:** no claim on any screen that is not true on launch day.
6. **Calm UI:** no streak-shaming, no fake urgency, no notification spam.
7. **Accessible by default:** WCAG 2.2 AA is a release gate, not a nice-to-have.

## 5. Definition of done (every feature)

- Acceptance criteria in `01-feature-spec.md` pass.
- Loading, empty, error and offline states exist (see `02-screens-spec.md`).
- Keyboard-operable; axe has zero serious or critical issues; contrast script green.
- Works in light and dark themes and at 360 px, 768 px, 1280 px widths.
- Events from `07-quality-ops.md` fire; errors reach Sentry.
- RLS verified by tests for any new table or column.
- Docs updated (spec, decisions, build log).

## 6. Glossary

| Term | Meaning |
|---|---|
| Page | One page of an NCERT chapter PDF, addressed as `(chapter, page_in_chapter_pdf)` |
| Question | Original MCQ-family item tied to one source page |
| Version | Immutable snapshot of a question's text in one language |
| Published | Passed auto-check and review; exported to static content |
| Workspace | The split screen: NCERT page left, questions right |
| Focus / List mode | One question at a time / all questions of the page |
| Reviewer | Medical student or high scorer who approves questions |
