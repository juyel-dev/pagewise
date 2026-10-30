# Screen 03 · App shell (P1) + Home dashboard (P2)

**Status: Built 2026-10-30** (owner approved P1+P2 kick-off; supersedes the earlier deferral in decision #36's Study-first steer).
**Approval basis:** owner's UI mock, frame 4 (Home after login) + frame 1–3 context. **Real data replaces every mock number** (truth-in-copy).

## P1 · Dark sidebar shell

| Mock element | Build | Notes |
|---|---|---|
| Dark navy sidebar (all themes) | `<aside>` island with the `.dark` class so existing dark tokens cascade (`--canvas #0b1120`, ink/ink-2/muted) — **zero new tokens, zero contrast-script changes** | Always dark, like the mock |
| Nav items: Home, Study, Practice, Progress, Bookmarks, Settings | `src/config/nav.ts` registry (`{href,label,icon,auth}`) rendered by one client `Sidebar`; feature registration, no page edits (arch spec §6/§2.2) | Active = `bg-brand` pill + white text (validated dark pairs) |
| Guest mode | auth-only items hidden for guests; sidebar shows Home · Study + a sign-in card | Decision 28/32: guests browse, don't fake accounts |
| Top bar (search, bell) in mock | **Omitted for now** — no chapter-search backend and no notifications system exist | Truth-in-copy; parked, not faked. Right side keeps ThemeToggle + UserMenu (avatar) |
| Mobile | `< md`: hamburger + slide-in drawer (same nav), sticky `h-14` top bar; `md:` fixed `w-60` sidebar | Workspace keeps `h-[calc(100dvh-3.5rem)]` under the top bar |
| Route membership | shell applies to `(app)` and `(study)` route groups; Study hub + workspace live under it; student-facing Review/Admin stay reachable from UserMenu | Old top-bar `AppNav` retired |

## P2 · Home dashboard (`/home`, signed in)

Main column:

1. **Greeting** — "Good morning/afternoon/evening, {first} 👋" from server time `Asia/Dhaka`; mock's support line kept verbatim.
2. **4 stat tiles** (mock numbers → real ones): Total Chapters = live chapter count; Pages Studied = distinct `pages_seen` union / total pages of live chapters; Questions Attempted = Σ `daily_stats.answered`; Accuracy = Σ correct / Σ answered (or "—" until first answer).
3. **Continue Studying** — single card for the most recent `reading_progress` row: subject/class label, progress bar, % completed, **Continue Reading** (`/study/slug?p=n`) and **View Questions** (same target), "Last studied: {rel} · Page {n}". Empty → honest prompt (first run). "View all →" goes to `/study`.
4. **Recent Chapters** — 3 rows: subject icon tile (token soft colors: Biology `good`, Physics `accent`, Chemistry `brand`), progress bar, %, "last studied {rel}", Continue button.

Right rail:

5. **Quick Actions** — Browse Chapters → `/study`; Practice Questions → `/study` (page-based MCQs live in the chapter workspace); View Progress → `/progress`; Manage Bookmarks → `/bookmarks`.
6. **Your Progress** — SVG completion ring = pages seen / pages of live chapters; caption "{started} of {total} chapters".
7. **Today's Goal** — real `daily_goal` semantics: "Answered {x} / {goal} questions today" + bar; mock's copy adapted (goal is questions, not pages).
8. **Quote card** — static PageWise quote (copy only, no data).

Guest `/home` keeps the existing honest guest panel inside the shell.

## Sidebar companion pages (same phase, so the shell has no dead ends)

- **`/practice`** — honest real page: per-page MCQ practice lives inside each chapter (live chapter list with direct links); note that chapter-level tests are a later screen (blueprint 02 screens 06). Open to guests (no user data).
- **`/progress`** — real: Σ stats (answered, correct, accuracy, active days) + last 14 days of `daily_stats`. Empty state honest for new users.
- **`/bookmarks`** — real: bookmarked questions → chapter + PDF page of each, linking to `/study/{slug}?p={pdf_page}`; unbookmarking stays in the workspace for now.

None of these fakes leading, streaks, or social data (arch §13/14 parking).
