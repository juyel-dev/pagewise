# 10 · Admin console (`apps/admin`, `pagewise-admin.vercel.app`)

**Picture.** A quiet, dense workbench for the people who prepare content. It must be obviously different from the student app (so nobody confuses them), fast for repetitive work (import → review → publish), and impossible to misuse by accident (every risky action asks, every action is logged). Behaviour and security rules: `docs/blueprint/18-admin-app-spec.md`. Visual language: same tokens as the student app; **denser** and **table-first**.

## 0 · Admin shell and rules

```
▓▓▓▓▓▓▓▓▓▓▓▓ 3 px accent stripe across the top (staff cue) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
┌────────────┬────────────────────────────────────────────────────────────────┐
│ ◆ Pagewise │ Review queue › The Living World      [Dev/Test]  🔍 Jump to…  (A)▾│
│ [Admin]    ├────────────────────────────────────────────────────────────────┤
│ ▣ Dashboard│                                                                │
│ ✓ Review 38│                       page content                             │
│ ⇪ Import   │                                                                │
│ ▤ Chapters │                                                                │
│ ☰ Page maps│                                                                │
│ ⚑ Reports 4│                                                                │
│ ─ admin ─  │                                                                │
│ ⚇ Users    │                                                                │
│ ≡ Audit log│                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```
- **Sizes:** sidebar 232 px (`surface`, right `line`); top bar 52 px; controls 36 px (`sm`/`md` tight); table rows 44 px; body 14 px (`Small` role is the default body here); page padding 24; cards `r:12`.
- **Staff cues:** 3 px `accent` stripe at the very top, an "Admin" `accent` chip under the logo, environment pill in the top bar ("Dev/Test" `accent`, "Production" `bad` once production exists). Sidebar active item `bg:brand-soft`, `brand-text`, left 3 px bar.
- **Top bar:** breadcrumb (left); environment pill; "Jump to…" input (chapter title, question id, user email → opens it); account menu: name, role chip (Reviewer / Admin), "Sign out".
- **Sidebar badges:** Review = questions `in_review`; Reports = open reports; hidden at 0. "Users" and "Audit log" show only to admins.
- **Supported width:** ≥ 768. Below that: StatusPage "Use a larger screen — the admin console needs at least 768 px."
- **Every write** shows a toast "Saved" / error; risky actions use Dialog with a safe default button; every write appears in the audit log; the page shows "Updated by {name} {time}" where useful.
- **Light and dark** both supported; **no keyboard trap**; all tables are real `<table>`s with sortable headers (`aria-sort`).
- **Idle:** after 60 min idle or 12 h since sign-in a Dialog "Please sign in again" appears; unsaved edits are kept locally and restored after re-authentication.

## A01 · Staff sign in `/sign-in`
```
┌──────────── Staff sign in ────────────┐   step 2        step 2 (first time)
│ [Admin]                               │  ┌ Enter code ┐ ┌ Set up 2-step ┐
│ Staff sign in                         │  │ ▢▢▢ ▢▢▢    │ │ [QR code]     │
│ Staff accounts only. Every action is  │  │ [Verify]   │ │ key ABCD…     │
│ logged.                               │  │ Use recovery│ │ Code [ ▢▢▢▢▢▢ ]│
│ [ G  Continue with Google ]           │  │ code        │ │ [Verify]      │
└───────────────────────────────────────┘  └────────────┘ └───────────────┘
```
| Step | Elements |
|---|---|
| 1 Google | Card 420, `[Admin]` chip, `h1` "Staff sign in", `Small` "Staff accounts only. Every action is logged.", Google button (secondary lg, full width). No password. |
| 2a Verify | Heading "Enter your 6-digit code", text "Open your authenticator app and enter the current code.", six single-digit boxes (auto-advance, paste fills all, numeric keypad on phone), `primary` "Verify", `ghost` "Use a recovery code" (one text field), error "That code didn't work. Check the time on your phone and try again." (3 fails → 30 s wait) |
| 2b First time | Heading "Set up 2-step verification", QR code (208 px), "Can't scan? Enter this key" + monospace key with Copy, input "6-digit code", `primary` "Verify and continue" |
| 2c Recovery codes (once) | Heading "Save your recovery codes", 10 codes in a mono grid, buttons "Copy" "Download", Checkbox "I've saved these somewhere safe" gating `primary` "Continue" |
| No access | Signed in with Google but not staff: StatusPage "You don't have access to the admin console." + `secondary` "Sign out" |
After verification the session is `aal2` → `/` (Dashboard).

## A02 · Dashboard `/`
```
│ Dashboard                                                                  │
│ ┌ In review ┐ ┌ Open reports ┐ ┌ Chapters ┐ ┌ Last import ───────────┐     │
│ │ 38        │ │ 4            │ │ 1 live · 1 draft │ │ today · {name}  │     │
│ └───────────┘ └──────────────┘ └──────────┘ └─────────────────────────┘     │
│ ┌ Needs review, by chapter ────────────┐ ┌ Recent activity ────────────────┐│
│ │ Anatomy of Flowering Plants  38 [Review]│ │ {name} published 12 · 2h ago    ││
│ │ The Living World             0 ✓       │ │ …8 latest audit events          ││
│ └──────────────────────────────────────┘ └─────────────────────────────────┘│
│ ┌ Publishing health ───────────────────────────────────────────────────────┐│
│ │ Last publish → student app refreshed ✓ 2 min ago      [Retry if failed]   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
```
Tiles = `StatTile` (real counts, clickable: In review → `/review`, Reports → `/reports`, Chapters → `/chapters`, Last import → `/import`). Needs-review card: rows with chapter, count, `primary` sm "Review" (0 shows `good` "✓ Done"). Recent activity: latest 8 `audit_log` rows ("{actor} {verb} {object}", relative time, link to entity). Health card: shows result of the last revalidate call; failed → `bad-soft` message + `secondary` "Retry". Quick actions row (top right): `primary` "Import questions", `secondary` "Open review queue". Empty states: "No questions waiting."

## A03 · Review queue `/review` and `/review/[chapter]`
`/review`: table of chapters with In review / Published / Retired counts and `primary` sm "Review". `/review/[chapter]` is the main workbench:
```
┌ breadcrumb ─────────────────────────────────────────────────────────────────┐
│ [Status ▾ In review] [Page ▾] 🔍                     38 questions            │
├────────────────┬───────────────────────────────┬────────────────────────────┤
│ LIST 300       │ EDITOR (flex)                 │ SOURCE PDF 420             │
│ p.4 (4)        │ Question  [textarea]          │ ‹ page 4 ›   zoom          │
│ ▪ Which tissue…│ Type [Single ▾] Difficulty [▾]│ ┌────────────────────────┐ │
│   In review    │ Topic [Tissues ▾]             │ │ NCERT page with the    │ │
│ ▫ Meristematic…│ Options                       │ │ source line highlighted│ │
│ p.6 (3)        │  ◉ Parenchyma        [×]      │ └────────────────────────┘ │
│                │  ○ Collenchyma       [×]      │ Source text [textarea]     │
│                │  [+ Add option]               │ [Find in page] ✓ Found     │
│                │ Explanation [textarea]        │                            │
│                │ Checks  ✓ one correct  ✓ ≥2 opts  ✗ source not found      │
│                │ Note to author [ ]                                          │
│                │ [Approve and publish] [Save] [Request changes] [Retire]    │
└────────────────┴───────────────────────────────┴────────────────────────────┘
```
| Region | Elements (top to bottom) |
|---|---|
| Filter bar | Status Select (In review default, Published, Needs changes, Retired, All), Page Select, search; right: count "38 questions"; `ghost` "Select" for bulk |
| List | Grouped by PDF page ("p.4 · printed 77 (4)"); row: status dot, stem (2 lines), chips (type, topic); selected `bg:brand-soft`; checkbox in select mode; keys `J`/`K` move |
| Editor | Fields: Question (textarea, auto-grow), Type (Single / Multiple / Assertion-reason / Statement / Match), Difficulty, Topic (typeahead from existing topics + "Add new"), Options (list: radio or checkbox for correct, drag handle, delete ×, "+ Add option", 2–8), Column A/B (match type), Explanation, Source text, Origin and verification (read-only chips), "Note to author" |
| Checks panel | Live, gates publish: ✓/✗ "Exactly one correct answer (single)" · "At least 2 options" · "Explanation is not empty" · "Source text found on page {n}" · "No duplicate of another published question" · "No unfinished placeholders" |
| Diff | If the question is published: toggle "Show changes from version {v}" (inline diff of text fields, options reordered/changed highlighted) |
| Source PDF | Page viewer jumped to the question's page; source text highlighted using the same finder as the student app; "Find in page" re-runs it; not found → `bad` hint and publish blocked until fixed or overridden by an admin with a reason |
| Actions (sticky bottom) | `primary` "Approve and publish" (→ new immutable version if edited, status Published, audit entry, revalidate web) · `secondary` "Save changes" (stays in review) · `secondary` "Request changes" (Dialog: note required → status Needs changes) · `ghost` bad "Retire" (Dialog: reason required) |
Bulk (Select mode): "Publish selected ({n})" only for questions with all checks ✓ and no edits; confirmation lists counts. Keys: `J/K` move, `E` focus editor, `⌘/Ctrl+Enter` approve (when checks pass), `⌘/Ctrl+S` save. Unsaved-edit guard. Conflict: if someone else changed it, banner "Updated by {name} — reload to see changes" (no silent overwrite).
States: loading skeleton columns; empty list "Nothing to review here ✓"; publish failure keeps the editor open with the error.

## A04 · Import `/import`
```
│ Import questions                                                           │
│ ┌ Drop JSON files here, or [Choose files] ────────────────────────────────┐│
│ Chapter [ The Living World ▾ ]   If a question already exists: (•) new version ( ) skip│
│ ┌ Files ───────────────────────────────────────────────────────────────────┐│
│ │ kebo101_p004.json  p.4  12 questions  ✓ Valid                             ││
│ │ kebo101_p009.json  p.9   8 questions  ✗ 2 errors  ▸ show                   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│ 12 valid · 1 file with errors            [Import 12 as In review]            │
```
Elements: dropzone (`b:dashed line r:16 p:40`, drag state `brand-soft`); chapter Select (auto-detected from file names, editable; required); conflict policy radio; file table (name, page, count, status chip `good`/`bad`, expandable error list with line/field and message e.g. "options: exactly one correct answer required"); summary; `primary` "Import {n} as In review" (disabled with errors only if nothing valid); `ghost` "Clear". After import: result card "{n} questions imported (✓ {x} new, {y} new versions, {z} skipped)" + `primary` "Review them" → `/review/{chapter}?status=in_review`. All validation uses `@pagewise/question-schema` (same as the server).

## A05 · Chapters and PDFs `/chapters`, `/chapters/[slug]`
List: table — Chapter (title + "Class 11 · Biology"), PDF (✓ "9 pages · 3.2 MB" / "—"), Page map (✓ / ⚠ "Not saved"), Questions ("171 published · 0 in review"), Status chip (Live / Draft), row actions `secondary` sm "Open". Top right `primary` "New chapter".
**New chapter Dialog:** Subject, Class, Unit title, Chapter number, Title, Slug (auto, editable, unique) → creates Draft.
**Chapter page** `/chapters/[slug]`: header (title, status chip, `primary` "Publish chapter" or `secondary` "Unpublish"), Tabs **Overview · PDF · Page map · Questions · History**.
- *Overview:* editable title/unit/number; **Publish checklist** card: ✓ PDF uploaded · ✓ Page map saved and matches PDF page count · ✓ ≥ 1 published question · ✓ Title and unit set; "Publish chapter" enabled only when all pass; Unpublish → Dialog with warning "Students will no longer see this chapter."
- *PDF:* current file (name, pages, size, uploaded by/at, sha256 short), `secondary` "Replace PDF"; dropzone with progress bar; checks hash first: same file → "This file is already uploaded."; different page count → warning "The new PDF has {n} pages, the page map has {m}. Update the page map after replacing." Private storage note "Stored privately; students get time-limited links."
- *Page map:* link-card to A06.
- *Questions:* counts per status/page and link to review.
- *History:* chapter-scoped audit rows.

## A06 · Page maps `/page-maps/[slug]`
```
│ Page map · The Living World        [Detect printed numbers] [Reset] [Save map]│
│ ┌ PDF page ┬ thumb ┬ Printed label ┬ Kind          ┬ Questions ┬ Note ┐        │
│ │ 1        │ ▭     │ [ i  ]        │ Cover ▾       │ 0         │      │        │
│ │ 2        │ ▭     │ [ 75 ]        │ Content ▾     │ 5         │      │        │
│ └──────────┴───────┴───────────────┴───────────────┴───────────┴──────┘        │
│ Side panel: PDF preview of the selected row                                   │
```
Table rows 56 px with 40 px thumbnail; Printed label `Input` sm (validate unique, allow roman numerals); Kind Select (Cover, Front matter, Unit intro, Content, Exercise, Blank); Questions count read-only (warns if a page with questions is set to Cover/Blank); toolbar: "Detect printed numbers" (reads page text, fills labels with a confidence dot — green/amber/red — never overwrites without confirmation), "Fill from row…" (sequential from a start value), "Reset", "Save map" (diff summary Dialog "Changed 7 rows"). Side preview follows row focus. Errors list under the toolbar (duplicate labels, gaps). Saving writes audit and revalidates the student app.

## A07 · Reports `/reports`
Filters: status tabs (Open · Resolved · Dismissed), reason Select, chapter Select. Table grouped by question: stem (2 lines), reason chips with counts ("Wrong answer ×3", "Unclear ×1"), chapter/page, first reported, last reported. Default sort: most reports first. Row click → right Drawer 520: the question as students see it (options, correct marked, explanation) + list of reports (reason, optional note, time; reporters anonymous) + buttons `primary` "Open in review" → editor · `secondary` "Resolve — fixed" (Select the new version) · `secondary` "Dismiss — not an issue" (reason required). States: empty "No open reports ✓".

## A08 · Users and roles `/users` (admin only)
Top: search by email/name, role filter, `primary` "Invite reviewer". Table: Name · Email · Role chip (Student / Reviewer / Admin) · Joined · Last active · Status (Active / Pending invite) · `ghost` "Change role". **Invite:** Dialog with email → creates a pending invite; the role applies when that email first signs in with Google. **Change role:** Dialog with the role Select and a plain-language line ("Admins can publish content and manage users."); promoting to Admin requires typing the user's email. Guards: you cannot change your own role; the last admin cannot be demoted ("There must always be at least one admin."). Footer note: "Role changes are recorded in the audit log."

## A09 · Audit log `/audit` (admin only)
Filters: actor Select, action Select (e.g. `question.publish`), entity type, date range; search. Table: Time (absolute, relative on hover), Actor, Action (monospace `Caption`), Entity (type + link), Summary. Row expands to **Before / After** (formatted key–value diff; secrets redacted). Append-only notice `Small` `muted`: "This log cannot be edited." `secondary` "Export CSV" (current filter). Cursor pagination, 50 per page. i18n: admin UI is English only.

## System states in admin
Offline banner "You're offline — changes can't be saved"; save conflict banner (see A03); 404 "That page doesn't exist" + "Go to Dashboard"; generic error "Something went wrong" + "Try again"; session-expired Dialog (see §0).

## Where every click goes
Sidebar → the nine screens · Dashboard tiles → their screens · Import "Review them" → `/review/{chapter}` · Reports "Open in review" → editor · Chapter "Page map" tab → A06 · Publish/Retire/Approve → write + audit + student-app refresh · "Jump to…" → entity.
