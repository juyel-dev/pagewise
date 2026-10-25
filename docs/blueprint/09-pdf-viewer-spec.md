# Blueprint · 09 · Own PDF viewer, page detection and page mapping

**Owner decision D-15 (2026-10-25):** PageWise ships its **own PDF.js viewer** showing **authorized** NCERT PDFs. The owner is responsible for obtaining and holding the permission (see §8). This supersedes the "official link only / never host" approach in `docs/product/03-content-and-legal-guardrails.md` §1 and blueprint 04 §2 (iframe becomes a fallback/spike, not the main path).
**Build order:** Viewer → Page detection → Page mapping → Question database → Practice mode.

## 1. What this unlocks

- Real page tracking (we render the pages, so we know which is visible).
- Reliable behaviour on phones (no dependence on the browser's PDF plugin).
- Page-anchored questions with correct printed page labels.
- Later: in-chapter search, highlights/notes anchored to page coordinates.

## 2. Viewer

| Item | Spec |
|---|---|
| Library | `pdfjs-dist`, version pinned, worker and cMaps self-hosted (no external CDN) |
| Rendering | Canvas per page + text layer (for selection, search, screen readers); virtualised: render visible page ±2, destroy others; cap DPR at 2 |
| Modes | Continuous scroll (default) and single-page; fit-width default, zoom 50–300%, `+ / - / 0` keys |
| Loading | HTTP range requests, progressive; skeleton per page; first page visible < 1.5 s on warm CDN |
| Theme | Optional "dark pages" (CSS invert filter) that keeps images readable |
| Controls | Page box ("Page 5 · PDF 7"), prev/next, jump to printed page, zoom, fit, hide viewer |
| Errors | Load failure → retry + "Report problem"; corrupted page → placeholder, others continue |
| Memory | Phone budget ≤ 150 MB canvas memory; downscale or lower DPR on low-memory devices |
| Accessibility | Text layer on, page landmarks, keyboard scroll and zoom, announce page changes politely |

## 3. Page detection

Goal: know which page the student is reading without surprises.

1. Track visible ratio of each rendered page (IntersectionObserver on page containers).
2. `candidatePage` = page with the largest visible area (ties → the earlier page).
3. Emit `currentPage` only after the candidate is stable for 400 ms (debounce) and differs by ≥ 1 page; ignore changes caused by programmatic scrolling (jump, nav button).
4. Manual page selector always overrides; typing a page scrolls the viewer and sets `currentPage` immediately.
5. URL keeps `?p=<pdf_page>` (replaceState, throttled) so refresh and shared links return to the same page.
6. Question side behaves per setting **Follow my reading** (default OFF): OFF = student presses **Practice this page**; ON = questions switch automatically after the page is stable for 1.5 s, with an undo chip. Either way the answered state of other pages is kept.
7. Edge cases: two pages half visible → larger wins; zoomed-out multi-page view → centre page wins; fast fling scroll → no emits until settled.

**Acceptance:** on the fixture PDF, 100 scripted scroll stops (slow, fast, zoomed) detect the correct page ≥ 99%, never flicker between pages while stationary, and emit at most one change per 400 ms.

## 4. Page mapping (PDF page ↔ printed page)

NCERT chapter PDFs contain covers, preliminary pages, blank pages and exercises whose printed numbers do not equal PDF indices.

```sql
page_map(
  chapter_id, pdf_page int, printed_label text,   -- e.g. '7', 'iv', null
  kind text check (kind in ('cover','front','content','blank','activity','summary','exercise','back')),
  has_figure boolean, notes text,
  verified_by uuid, verified_at timestamptz,
  primary key (chapter_id, pdf_page))
```
and `chapters.pdf_path`, `chapters.pdf_sha256`, `chapters.edition`.

- **Anchoring rule:** a question is anchored to `(chapter_id, pdf_page)`; students see the printed label (`printed_label`) in the UI, with the PDF index shown subtly when they differ.
- **Build process:** script extracts footer/header page numbers per PDF page → proposes mapping → a human verifies every page in an admin screen (side-by-side image + proposed label).
- **Integrity:** if `pdf_sha256` changes, all questions of that chapter go to `flagged` until mapping is re-verified.
- Pages of kind `cover/front/blank/back` never get questions; `content/activity/summary/exercise` may.
- Coverage report lists every page as covered / intentionally empty (with kind) / gap.

## 5. Practice this page

- Button label: "Practice this page" (shows count: "Practice this page · 8 questions"); disabled with explanation when the page has none, with "Go to next page with questions".
- Pressing it loads the page's published questions into the question panel (Focus or List mode as chosen).
- Pages kept in a small session stack so Back returns to the previous page's questions.
- Keyboard: `P` practise current page, `[`/`]` previous/next page with questions.

## 6. Layout (latest owner request)

| Item | Spec |
|---|---|
| Default | **Questions panel on the left, NCERT viewer on the right** (owner request) |
| Swap | Setting "Swap sides" restores NCERT-left layout (the earlier request); remembered per user |
| Hide | Hide/show viewer button + `V`; hidden viewer leaves a 40 px rail; questions go full width |
| Resize | Draggable keyboard-accessible divider (blueprint 01 WS-2) |
| Narrow screens | Tabs "Read" / "Practise"; the same detection and button |

## 7. Delivery and storage of PDFs

- Stored in a **private** bucket (Supabase Storage or equivalent), never in git (`/private-content/` and `*.pdf` git-ignored); upload via an admin script that records `sha256`.
- Served only to signed-in users through short-lived signed URLs (default 1 h, issued by a server action), CDN-cached by object, byte-range enabled.
- No directory listing, no public URLs, no hotlinking; `Content-Disposition: inline`; viewer hides the download button (cannot fully prevent saving; do not claim that it does).
- Optional later: subtle per-user watermark in the viewer footer.
- Bandwidth plan: ≈ 38 chapter PDFs × a few MB; estimate egress with S-1 numbers before launch and cap with CDN caching; PDF.js loads only ranges needed.

## 8. Legal and compliance gate (owner-managed)

The owner confirms he is obtaining permission. To keep the product safe, the repo gets:
- `docs/legal/ncert-permission.md`: scope (books, editions, usage, duration), date, source of the permission (the document itself is stored privately, not in git).
- **Release gate:** no PDF is uploaded to production storage until that file says permission covers hosting and display in this app.
- If scope is narrower than "host and display", the viewer falls back to the iframe/"Open NCERT page" tier (blueprint 04 §2), which stays in the code as a feature-flagged fallback.
- NCERT/NTA logos and endorsement claims remain prohibited; disclaimer stays in footer and Settings → About.

## 9. Security and CSP

CSP `worker-src 'self' blob:`, `img-src 'self' data: blob:`, `connect-src` includes the storage origin; `frame-src` no longer needs the NCERT origin unless the fallback flag is on. PDF.js `isEvalSupported=false`. Signed-URL issuing is rate-limited per user.

## 10. Spikes replacing S-1

| ID | Check | Pass |
|---|---|---|
| S-1a | PDF.js render + virtualised scroll of a real chapter PDF on desktop Chrome/Edge/Firefox/Safari and Android Chrome/iOS Safari | smooth scroll, memory within budget |
| S-1b | Page detection accuracy on a real chapter (script + manual) | ≥ 99% as in §3 |
| S-1c | Auto-extraction of printed page numbers from 3 chapters | ≥ 90% proposed correctly; rest fixable in admin screen |
| S-1d | Signed URL + range request + CDN caching on Vercel/Supabase | works; egress per read measured |
| S-1e | Iframe/`#page=N` test (cheap, for fallback tier only) | result recorded |

## 11. Milestone impact

| Old | New |
|---|---|
| M1 Spikes | S-1a…S-1e, S-2, S-3, S-4 |
| M2 App shell | + PDF storage, signed URL action, `chapters.pdf_*` fields |
| M3 Workspace on fixtures | **Viewer (M3a) → Page detection (M3b) → Page mapping + admin verification screen (M3c)** → Practice this page on fixture questions (M3d) |
| M4/M5 | Question database and reviewer console use `(chapter_id, pdf_page)` anchors and `page_map` |

## 12. Acceptance criteria summary

- Viewer loads a chapter and scrolls smoothly on desktop and a mid-range Android phone.
- Detection meets §3; manual selector and URL `?p` work and agree with detection.
- Every PDF page has a verified `page_map` row before questions are generated for that chapter.
- "Practice this page" shows exactly that page's published questions, none from other pages.
- Swap, hide, resize and tab layouts work; preferences persist.
- With the fallback flag on, the app degrades to "Open NCERT page N" without errors.
