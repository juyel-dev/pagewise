# 03 · Navigation, access and relations

## 1. Route map (student app, `apps/web`)

| Route | Screen | Guest | Signed-in | Staff | Rendering |
|---|---|---|---|---|---|
| `/` | S01 Landing | ✓ | redirect → `/home` | same | Static |
| `/start` | S02 Start carousel | ✓ | ✓ | ✓ | Static |
| `/sign-in` | S03 Sign in | ✓ | redirect → `next` or `/home` | same | Static |
| `/onboarding` | S04 Onboarding | ✗ (→ sign-in) | ✓ first time only | ✓ | Dynamic |
| `/home` | S07 Home | ✓ (local data) | ✓ | ✓ | Shell static + data streamed |
| `/study` | S06 Study hub | ✓ | ✓ | ✓ (+ drafts) | Shell static + data streamed |
| `/study/[chapter]?p=N` | S05 Workspace | ✓ | ✓ | ✓ | Shell static + data streamed |
| `/practice` | S08 Practice hub | ✓ | ✓ | ✓ | Streamed |
| `/practice/test/...` | S09 Test | ✓ | ✓ | ✓ | Streamed |
| `/practice/review` | S10 Review session | ✗ (needs account) | ✓ | ✓ | Dynamic |
| `/progress` | S11 | ✓ (local) | ✓ | ✓ | Streamed |
| `/bookmarks` | S12 | ✓ (local) | ✓ | ✓ | Streamed |
| `/settings` | S13 | ✗ (→ sign-in) | ✓ | ✓ | Dynamic |
| `/legal/[doc]` | S15 | ✓ | ✓ | ✓ | Static |
| `/library` | — | redirect → `/study` | same | same | — |
| `/review`, `/review/[chapter]`, `/admin/import` | Staff routes | ✗ | ✗ | ✓ | **Removed from web in F3**, live in `apps/admin` |

Guest rule (decision 38): every study surface is open to guests with data in the browser; only features that need an account (Settings, Review session, cross-device sync) ask to sign in. Asking is always a soft prompt with the reason, never a wall in the middle of studying.

URL parameters: `/study?subject=Biology&class=11` (hub filter, also saved to profile prefs); `/study/[chapter]?p=<pdf page>` (deep link to a page; used by "Show in NCERT" and Bookmarks); `/sign-in?next=<path>` (safe-path only, `safeNext`).

## 2. Global navigation

Registry: `apps/web/src/config/nav.ts`. Order: **Home · Study · Practice · Progress · Bookmarks · Settings** (Settings only for signed-in). Desktop: dark sidebar, 220 px. Below `lg`: top bar + drawer; the workspace hides the sidebar entirely and uses its own back link. Active item = route prefix match.

## 3. Screen graph (from → trigger → to)

| From | Trigger | To |
|---|---|---|
| Landing | "Start studying" | Study hub (guest) |
| Landing | "Sign in with Google" | Sign-in → Home |
| Home | "Continue reading" card | Workspace at last page |
| Home | Chapter row | Workspace |
| Home | "Review queue" tile | Review session |
| Study hub | Chapter card "Study" | Workspace |
| Workspace | Back link | Study hub |
| Workspace | Question "Show in NCERT" | Same screen, PDF scrolls and highlights source |
| Workspace | Page complete → "Next page with questions" | Same screen, next page |
| Bookmarks | "Open page" | Workspace at `?p=` of that question |
| Progress | Weak topic → "Practise" | Practice (filtered) |
| Practice hub | Mode cards | Workspace / Test setup / Review session |
| Any | `⌘/Ctrl+K` | Search |
| Any guest surface | "Sign in to sync" | Sign-in with `next` back to the same place |

## 4. Entity relations (database)

```
auth.users 1─1 profiles (role: student | reviewer | admin)
books 1─* chapters 1─* page_map (pdf_page → printed_label, kind)
chapters 1─* questions 1─* question_versions   (questions.current_version_id → one version)
users 1─* attempts *─1 question_versions       (is_correct set by DB trigger, decision 41)
users 1─* bookmarks *─1 questions
users 1─* reading_progress *─1 chapters        (last_page, pages_seen[])
users 1─* daily_stats (per day: answered, correct, seconds)
questions 1─* reviews, reports ; staff actions → audit_log
```

Rules: published questions are immutable per version; editing creates a new version and moves `current_version_id`; retire instead of delete; attempts keep the version they were answered against.

## 5. Guest vs signed-in data

| Data | Guest | Signed-in |
|---|---|---|
| Attempts, bookmarks, reading progress, goal | IndexedDB in the browser | Postgres via server actions |
| Profile, preferences | Local only | `profiles` |
| On sign-in | One-time merge of local data (`syncLocalData`, "latest attempt wins, nothing is lost") | — |
