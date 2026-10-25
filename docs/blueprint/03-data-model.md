# Blueprint · 03 · Data model

Refines `docs/architecture/01-tech-stack.md` §5. **Important correction:** NCERT publishes **chapter-wise PDFs**, so a page is addressed by `(chapter, page_in_chapter_pdf)`, and the official URL belongs to the chapter, not the book. The page-number mapping must be verified in the feasibility spike (doc 08).

## 1. Tables (Postgres on Supabase)

```sql
-- identity
profiles(
  id uuid pk references auth.users,
  display_name text not null,
  class text check (class in ('11','12','dropper')),
  neet_year int, language text default 'en',
  is_minor boolean default false,
  consent_status text default 'not_required'
    check (consent_status in ('not_required','pending','verified','withdrawn')),
  daily_goal int default 20,
  prefs jsonb default '{}',         -- mode, split, theme (non-sensitive)
  role text default 'student' check (role in ('student','reviewer','admin')),
  created_at timestamptz default now(), deleted_at timestamptz)

parental_consents(id, student_id, parent_email_hash, token_hash,
  requested_at, verified_at, withdrawn_at)

-- catalogue (admin-managed, public read)
books(id, subject, class, title, edition, edition_year)
chapters(id, book_id, number, slug, title, official_pdf_url, page_count,
  first_page int default 1, status text)          -- status: draft|live

-- content
questions(id, chapter_id, page int, type text, difficulty text,
  tags text[], status text, current_version_id,
  hidden boolean default false, report_count int default 0,
  created_at, retired_at)
question_versions(id, question_id, lang text, version int,
  payload jsonb not null,           -- validated against type schema (§3)
  source_note text, created_by, created_at, unique(question_id, lang, version))
reviews(id, question_version_id, reviewer_id, decision text,
  reason text, checklist jsonb, created_at)
content_releases(id, content_version text, manifest jsonb, created_by,
  created_at, git_sha)

-- student activity (RLS: own rows only)
attempts(id, user_id, question_id, version_id, chosen jsonb, is_correct,
  time_ms, attempt_no int, source text, created_at,
  unique(user_id, question_id, attempt_no))
bookmarks(user_id, question_id, created_at, pk(user_id, question_id))
reports(id, question_id, user_id, reason text, note text,
  status text default 'open', created_at,
  unique(user_id, question_id) where status='open')
reading_progress(user_id, chapter_id, last_page, pages_seen int[], updated_at,
  pk(user_id, chapter_id))
daily_stats(user_id, day date, answered int, correct int, seconds int,
  pk(user_id, day))
notes(id, user_id, chapter_id, page, body, updated_at)          -- phase C
mistakes(user_id, question_id, reason_tag, correct_streak, last_seen, ...) -- phase C

-- governance
audit_log(id, actor_id, action, entity, entity_id, before jsonb, after jsonb, at)
```

## 2. State machine for questions

`draft → auto_checked → in_review → published → flagged → retired`
- `auto_check_failed` is a flag on `auto_checked`, routes to priority review.
- Only `published` and not `hidden` is exported.
- Published versions are immutable; edits create a new version and re-enter `in_review` (the old version stays live until the new one publishes).
- Reports hide at threshold (default 3 distinct users) via trigger; an admin or reviewer un-hides or retires.

## 3. Question payload schemas (JSON Schema, per type, validated on write and at export)

Common: `stem` (≤ 600 chars), `explanation` (≤ 500 chars), `source_note` (page reference text, no long NCERT quotation), `markup` limited to a safe subset: `_sub_`, `^sup^`, symbols, line breaks; **no HTML**.

| Type | Extra fields | Rule |
|---|---|---|
| `mcq` | `options[4]`, `answer` (index) | exactly 4 options, no duplicates |
| `assertion_reason` | `assertion`, `reason`, fixed 5 standard options, `answer` | options are the standard template, localised |
| `statements` | `statements[2..4]`, `options[4]`, `answer` | statements numbered |
| `match` | `left[4]`, `right[4..5]`, `options[4]` each a mapping, `answer` | mappings validated as permutations |

## 4. Static content format (what students download)

Per chapter and language, versioned by release:

```
/content/{release}/manifest.json            -- chapters, page counts, question counts
/content/{release}/{lang}/{chapter-slug}.json
{
  "chapter": "...", "release": "2026.10.1",
  "pages": { "3": [ {id, version_id, type, difficulty, tags, payload} , ... ] }
}
```

- Chapter file is one request, gzip/brotli, ~20–80 KB; immutable URL per release (`Cache-Control: public, max-age=31536000, immutable`); manifest is short-cache.
- **Correct answers are inside the file.** Checking happens client-side; this is acceptable for practice, not for ranked mocks (phase D needs server-side scoring with a separate gated path).
- Client stores `release` with every attempt to attribute answers to the right version.

## 5. RLS policy outline

| Table | Student | Reviewer | Admin |
|---|---|---|---|
| profiles | read/update self (not `role`, not `consent_status`) | read self | all |
| catalogue tables | read | read | write |
| questions, versions | none directly (static export) | read/write via review functions | all |
| attempts, bookmarks, reading_progress, daily_stats, notes, mistakes | own rows | none | none (aggregate views only) |
| reports | insert own, read own | read all | all |
| reviews, audit_log | none | insert own / read own | read all |

Role changes only via an admin-only SQL function; `role` never writable from client. All policies covered by automated tests (doc 07).

## 6. Indexes and retention

Indexes: `attempts(user_id, created_at)`, `attempts(question_id)`, `questions(chapter_id, page, status)`, `reports(status, created_at)`. Retention and deletion rules are in doc 05; deletion cascades through every user-owned table and is verified by a test that counts remaining rows.

## 7. Migration policy

SQL migrations in `supabase/migrations`, forward-only, reviewed in PR, applied to preview before production; every migration with RLS changes ships with tests.
