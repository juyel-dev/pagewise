# 04 · Data contracts

What each screen reads and writes. Names are the real functions in `apps/web/src/features/**` unless marked *(new)*. Result shape for writes: `{ ok: true } | { ok: false, error: string }`. Every write that touches Postgres runs as the signed-in user under RLS; guests never call server writes (their data stays in IndexedDB).

## 1. Reads

| Read | Function | Returns | Used by | Cache |
|---|---|---|---|---|
| Chapter + study payload | `loadStudy(slug, { p, review })` | `StudyData`: chapter, `pageMap[]`, signed `pdfUrl`, `questionsByPage{}`, `initialPage`, `seenPages[]`, `bookmarkedIds[]`, `guest`, `isAdmin` | S05 | Public parts tagged `chapter:{id}`, `questions:{chapterId}` *(new tags, F3)*; user parts never shared |
| Hub list | `loadHub()` *(helpers in `features/study/hub.ts`)* | chapters for (subject, class) with progress | S06, S07 | `chapters` tag |
| Profile + prefs | `getSession()` | `{ user, profile } \| null` | all | per request |
| Stats | direct reads of `attempts`, `daily_stats`, `reading_progress` | counts, accuracy, streak | S07, S11 | none |

Question payload (`QuestionPayload`): `topic`, `question`, `options[]`, `correct[]`, optional `column_a[]`/`column_b[]`, `explanation`, `source_text`, `question_origin`, `verification`. Types: single MCQ, multi-select, assertion–reason, statement-based, match-the-column.

## 2. Writes (server actions)

| Action | Input | Effect | Notes |
|---|---|---|---|
| `recordAttempt` | `{ questionId, versionId, chosen[], timeMs }` | Inserts attempt; **DB trigger sets `is_correct`** | Client never sends correctness. Ungradable rows are skipped silently |
| `saveProgress` | `{ chapterId, lastPage, pagesSeen[] }` | Upsert `reading_progress` | Debounced ≥ 5 s and on page hide |
| `toggleBookmark` | `{ questionId, on }` | Insert/delete `bookmarks` | Optimistic in UI |
| `setStudyPrefs` | `{ subject?, class? }` | Merge into `profiles.prefs` | Hub filter memory |
| `saveProfile` | form data | Update `profiles` (name, class, NEET year, language, goal) | Zod-free validation in action; returns field errors |
| `syncLocalData` | `LocalSnapshot` | Idempotent merge of guest data | Runs once after sign-in; safe to retry |
| `setQuestionStatus` | `{ ids[], status }` | Staff only; publish / send back / retire | **Moves to admin app (F3)** |

Rate limits (F2 follow-up): 60 writes/min/user for attempts and bookmarks. Over limit → `{ ok:false, error:"rate_limited" }` and the UI queues locally.

## 3. Error taxonomy

| Code | Meaning | UI |
|---|---|---|
| `unauthenticated` | Needs an account | Soft sign-in prompt with reason |
| `forbidden` | Role missing | "No access" page |
| `not_found` | Chapter/page missing | 404 page |
| `rate_limited` | Too many writes | Quiet toast; local queue retries |
| `validation` | Bad input | Inline field messages |
| `network` | Offline/timeout | Offline banner; local queue |
| `unknown` | Anything else | Error page with retry; logged |

## 4. Local (guest) store

IndexedDB via `lib/local-db`: `attempts`, `bookmarks`, `progress`, `prefs`. Same shapes as server rows minus `user_id`. The workspace talks to one `StudyStore` interface (F4) with `LocalStore` and `RemoteStore`; screens never branch on "guest" for data access.
