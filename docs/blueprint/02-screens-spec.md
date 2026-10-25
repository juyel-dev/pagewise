# Blueprint · 02 · Screens specification

Screens 02–10 from `docs/README.md`, plus shared states. Landing (01) is already specified. All screens: light + dark, 360/768/1280 px, keyboard operable, i18n strings from catalogues. Event names are defined in doc 07.

## Shared patterns

| Pattern | Rule |
|---|---|
| Loading | Skeleton matching final layout; never a blank page; spinner only for actions under 1 s |
| Empty | Icon + one sentence + one primary action |
| Error | Plain-language message, retry button, error id; never raw stack text |
| Offline | Top banner "You're offline. Answers will sync when you're back." Reading and checking continue from cached content |
| Toasts | Max 1 visible; 4 s; never for errors that need a decision |
| App shell | Top bar (logo, chapter breadcrumb, search `/`, theme, avatar menu); left rail on ≥1280 px with Home, Library, Progress, Bookmarks, Settings |

## 02 · Sign in and onboarding

**Routes:** `/sign-in`, `/onboarding`, `/consent-pending` (phase B).
**Sign-in:** centred card: logo, one sentence of value, "Continue with Google", "Email me a link", links to Privacy/Terms. No account-creation vs sign-in split.
**Onboarding (3 steps, one screen each, progress dots, Back allowed):**
1. Name (prefilled from Google, editable), class (11 / 12 / Dropper).
2. NEET target year, daily goal (10/20/40 questions, default 20).
3. Language (English only in phase A, shown as a list with "More coming" row), theme.
Phase B inserts the age gate before step 1; under-18 goes to the consent flow.
**States:** Google error → inline message + retry; magic link sent → confirmation with resend after 30 s; onboarding refresh mid-way resumes at the same step.
**Events:** `sign_in_started`, `sign_in_completed`, `onboarding_step_completed {step}`, `onboarding_completed`.

## 03 · Home

**Purpose:** answer "what should I do now?" in one glance.
**Layout:** greeting + daily goal ring · big **Resume** card (chapter, page, last activity) · "Continue this chapter" next-page suggestion · weakest chapter nudge (phase C) · bookmarks count · quiet streak chip.
**Rules:** one primary action only (Resume). No leaderboards, no red badges. First-time user sees "Start with Chapter 1" instead of Resume.
**Empty:** brand-new user → starter card with the first chapter.
**Events:** `home_viewed`, `resume_clicked`.

## 04 · Library

**Route:** `/library?class=11|12`.
**Layout:** class toggle; chapter grid/list (toggle remembered) with number, title, pages, questions, progress ring, "Continue" if started; search field.
**Interactions:** click chapter → workspace at last page or page 1; `/` focuses search; keyboard arrow navigation across cards.
**States:** chapter with zero published questions shows "Coming soon" and is not clickable into practice but offers the NCERT link.
**Events:** `library_viewed`, `chapter_opened {chapter_id}`.

## 05 · Study workspace (core screen)

**Route:** `/study/[subject]/[class]/[chapter]?p=N&mode=focus|list`.

```
+--------------------------------------------------------------------+
| top bar: < Library · Ch 5 Morphology · p. 3 of 12   [outline] [?]  |
+----------------------------+--+------------------------------------+
|  NCERT pane                |||  Practice pane                      |
|  [embed #page=N]           |||  mode toggle [Focus|List]  3/8      |
|  or fallback card          |||  question card(s)                   |
|                            |||  Check / Next                       |
+----------------------------+--+------------------------------------+
| page navigator: [<] page 3 [>]  jump-to  · bookmarks · report        |
+--------------------------------------------------------------------+
```

**Page model:** see WS-3/4/5. `currentPage` lives in the URL; navigator, outline, "See source page" and keyboard ←/→ all change it.
**NCERT pane states:** loading (skeleton, 8 s timeout) → loaded; blocked/failed/mobile → fallback card with "Open NCERT page N", plus one-line explanation and a "Why can't I see it here?" disclosure.
**Practice pane (Focus):** stem, options (radio group), Check, explanation panel, Next. Progress dots coloured by state (unanswered, correct, wrong, skipped) with icons for non-colour cue.
**Practice pane (List):** sticky mini-summary (answered x/m, correct y) above scrollable cards.
**Outline drawer:** list of pages with count and status dot (not started / in progress / done); click jumps.
**Narrow layout (<1024 px):** tabs "Read" and "Practise"; page navigator persistent in both; "See source page" switches to Read tab.
**Edge cases:** page without questions (WS-7); last page → Next becomes "Back to library" with chapter summary; question retired mid-session → silently removed on next load, current answer kept; content version changes → banner "Updated questions available. Refresh".
**Keyboard:** per PRA-10; focus order: top bar → NCERT pane → divider → practice pane → navigator; visible focus ring; `?` opens shortcut sheet.
**Events:** `workspace_opened`, `page_changed {source: nav|outline|source_link|key}`, `mode_changed`, `question_answered {type, correct, time_ms, attempt_no}`, `source_link_clicked`, `ncert_embed_failed {reason}`, `divider_moved`.

## 06 · Chapter test and results (phase C)

**Setup:** pick chapters, count (10/20/30), timer on/off, difficulty mix. **Run:** one question per screen, palette of numbered chips, mark-for-review, submit with confirmation listing unanswered. **Results:** score, accuracy, time, per-page breakdown, review list with wrong first, each linking to the source page and "Add to mistake notebook". Auto-save every answer; resuming after refresh restores timer state from server time.

## 07 · Progress

**Tabs:** Overview · Chapters · Time (phase C). Overview: questions this week, accuracy trend (7/30 days), daily goal history, streak. Chapters: table sorted by weakness with sample sizes; click → workspace at weakest page. Show "Not enough data yet" under 10 attempts instead of a misleading percentage. No comparison with other students in phases A–C.

## 08 · Bookmarks and mistake notebook

**Bookmarks (A):** list grouped by chapter, filter, open in workspace at source page, remove. **Mistake notebook (C):** all first-attempt wrong answers; filters (chapter, reason tag: concept gap, misread, silly, guess); "Re-attempt" session; item leaves the notebook after 2 consecutive correct re-attempts on different days.

## 09 · Settings

Sections: Profile (name, year, class) · Preferences (language, theme, default mode, show timer, daily goal) · Privacy (export data, delete account, consent status for minors) · About (version, content version, licences, NCERT/NTA disclaimer, contact). Destructive actions need typed confirmation.

## 10 · Reviewer console (internal)

**Routes:** `/review`, `/review/queue`, `/review/q/[id]`, `/review/reports`, `/review/stats`, `/admin/*`.
**Queue:** filters (chapter, state, reason, assigned), counts, claim item (locks 15 min).
**Review screen:** split view again: official NCERT page left (same embed/fallback), question editor right with live student-view preview. Actions: Approve, Edit and approve, Reject (reason required), Escalate. Shortcuts: `A` approve, `R` reject, `E` edit, `N` next.
**Checklist enforced before Approve:** answer supported by the page · exactly one defensible option · no verbatim long NCERT passage · explanation short and factual · tags correct.
**Admin:** role management, chapter metadata (official URL, page range), publish export (dry-run diff then publish), audit log viewer.
**Events (internal):** `review_claimed`, `review_decided {decision}`, `publish_started`.

## 11 · Legal and utility pages

`/privacy`, `/terms`, `/about`, `/contact`, `/contributors` (phase C), `404`, `500`, `/offline`. Plain, readable, linked from footer and sign-in.
