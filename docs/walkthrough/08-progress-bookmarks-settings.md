# 08 · Progress, Bookmarks, Settings

## A · Progress `/progress`

**Picture.** An honest mirror of what the student has done. Four numbers on top, one chart, then where they are strong and weak. Nothing is invented; with no data yet it explains how to start. Guests see the same page for **this device** and a quiet reminder that signing in keeps it safe.

```
┌ top bar: Progress ──────────────────────────────────────────────────────────┐
│ Progress                                         [ 7 days | 30 days | All ]  │
│ (guest) This shows what you've done on this device.   [Sign in to keep it]   │
│ ┌ Answered ┐ ┌ Accuracy ┐ ┌ Pages read ┐ ┌ Streak ──┐                        │
│ │ 214      │ │ 68 %     │ │ 25         │ │ 6 days   │                        │
│ └──────────┘ └──────────┘ └────────────┘ └──────────┘                        │
│ ┌ Daily activity ─────────────────────────────────────────  [Chart | Table] ┐│
│ │ ▇▅▃▇▆▂▁ stacked correct / missed per day, goal line dashed                 ││
│ └────────────────────────────────────────────────────────────────────────────┘│
│ ┌ By chapter ────────────────────┐ ┌ By topic ─────────────────────────────┐│
│ │ The Living World  38 % read    │ │ Topic            Accuracy  Answers     ││
│ │  accuracy 71 %   [Open]        │ │ Plant tissues    35 %      20          ││
│ └────────────────────────────────┘ └───────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```
Top to bottom:
| E | Component | Copy / style |
|---|---|---|
| 1 | `h1` + range SegmentedControl | "Progress" · "7 days" / "30 days" / "All time" (default 7 days) |
| 2 | Guest note | `brand-soft` bar "This shows what you've done on this device." + "Sign in to keep it" → `/sign-in?next=/progress` |
| 3 | StatTiles ×4 | "Answered" (count) · "Accuracy" (first attempts only, needs ≥ 10 answers else "—") · "Pages read" · "Streak" ("{n} days", sub "Best: {m}") |
| 4 | Activity chart card | `h2` "Daily activity"; stacked bars per day (correct `good`, missed `bad`), dashed goal line `ink-2`; hover/focus tooltip; toggle "Chart / Table" (table = accessible equivalent, always available); axis labels `Caption`; ≥ 4.5:1 non-colour cues (pattern fill on missed bars) |
| 5 | By chapter card | rows: title, "{p} % read", accuracy "{a} %" or "Not tried", `secondary` sm "Open" → workspace |
| 6 | By topic card | sortable table (Topic · Accuracy · Answers), default weakest first, topics with < 5 answers marked "Not enough yet"; row button "Practise" → `/practice/new?type=quick&topic=` |
| 7 | Time studied (optional tile row under chart) | "Time studied: 3 h 20 min" from `daily_stats.seconds` |
States: no data → EmptyState "Nothing here yet. Answer a few questions and your progress appears." + `primary` "Start studying"; loading skeletons; chart error shows the table. Phone: tiles 2 × 2, chart full width scrollable by day, cards stacked. i18n `progress.*`.
Clicks: Open → workspace · Practise → setup · Sign in → sign-in.

---

## B · Bookmarks `/bookmarks`

**Picture.** A tidy shelf of questions the student saved, with a second shelf for questions they missed (the mistake notebook). From here they can reopen the page, or practise them as a set.

```
┌ top bar: Bookmarks ─────────────────────────────────────────────────────────┐
│ Saved questions                                    [Practise these (12)]     │
│ [ Saved | Missed ]   Chapter [All ▾]   Topic [All ▾]   🔍 Search            │
│ ┌ row ───────────────────────────────────────────────────────────────────┐  │
│ │ Which tissue gives mechanical support to young stems…                    │  │
│ │ The Living World · p.4 · Tissues     [Missed]          [Open page] [★]   │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```
| E | Component | Copy / style |
|---|---|---|
| 1 | `h1` | "Saved questions" (tab Saved) / "Questions you missed" (tab Missed) |
| 2 | Primary action | `primary` md "Practise these ({n})" → starts a quick session of the visible list (disabled at 0) |
| 3 | SegmentedControl | "Saved" \| "Missed" |
| 4 | Filters | Chapter Select, Topic Select, search input (client-side) |
| 5 | Row | `Card flat p:16`: stem (`Body`, 2-line clamp, tap to expand), meta `Small` `muted` "{chapter} · p.{printed} · {topic}", status Chip (`good` "Got it right" / `bad` "Missed" / `muted` "Not tried"), buttons: `secondary` sm "Open page" → `/study/{slug}?p={pdf_page}`; IconButton ★ "Remove from saved" (Saved tab) or `ghost` sm "Mark as understood" (Missed tab, removes it from Missed) |
| 6 | Expand | Clicking the row shows options with the correct one marked, the explanation and source quote inline |
Remove → optimistic + toast "Removed from saved · Undo" (6 s). Missed tab lists questions whose latest first attempt was wrong and not yet marked understood.
States: empty Saved: EmptyState "No saved questions yet. Tap ☆ on any question to keep it here." + "Go to Study"; empty Missed: "No missed questions. Nice." ; guest: works from device, banner as on Progress. i18n `bookmarks.*`.

---

## C · Settings `/settings`

**Picture.** Everything about the student and the app in one calm page with four tabs. Guests can use **Preferences** and **Data and privacy** for this device (decision 50); Profile and Account ask them to sign in.

```
┌ top bar: Settings ──────────────────────────────────────────────────────────┐
│ Settings                                                                     │
│ [Profile] [Preferences] [Data and privacy] [Account]     ← left list ≥1024,  │
│ ┌ Profile ───────────────────────────────────────────┐   segmented/scroll    │
│ │ (J) Juyel  juyel@…  (from Google, read-only)        │   below              │
│ │ Your name [ Juyel                              ]    │                      │
│ │ Class [Class 11 ▾]  NEET year [2027 ▾]  Language [English ▾] │              │
│ │                                          [ Save ]   │                      │
│ └────────────────────────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────────────────────┘
```
Each tab is a `Card p:24 r:16` max width 640, fields stacked `gap:16`, labels above (`Label`), helper `Small` `muted`, `Save` `primary` md right-aligned, success shown as inline "Saved ✓" (`good`, 3 s) and a toast.
**Profile (signed-in):** avatar circle (Google initial/photo), email read-only; Name; Class (11/12/Dropper); NEET year; UI language (only complete locales).
**Preferences (everyone):** Theme — three radio cards "Light" "Dark" "System" with tiny previews; Daily goal chips 10/20/40/60; "Study defaults": Switch "Follow my reading" (default on), SegmentedControl "Question view: Focus | List", Switch "Invert PDF pages by default", Select "Default zoom" (Fit width, 100 %, 125 %); Switch "Show keyboard hints".
**Data and privacy:** line "Your progress is stored {on this device | in your account}." · "Last synced {time}" (signed-in) · `secondary` "Export my data" (downloads JSON: profile, attempts, bookmarks, progress) · `secondary` "Clear data on this device" (Dialog, guests: warns it deletes progress) · links "Privacy policy" · "Terms" · "Content and NCERT".
**Account (signed-in):** "Signed in with Google · {email}" · `secondary` "Sign out" · **Danger zone** card (`b:bad`, `bad-soft` heading): "Delete my account" `secondary` with `bad` text → Dialog: list "This removes your progress, bookmarks and profile.", input "Type DELETE to confirm", buttons "Keep my account" (primary, safe default) / "Delete account" (`bad`, disabled until typed). After deletion: sign-out and farewell page `/` with toast "Your account has been deleted." Data is removed immediately; backups age out as per the privacy policy (legal text from owner).
States: saving, validation errors (inline under field, `aria-describedby`), save failure toast, unsaved-changes guard (Dialog "Discard changes?"). Guest sees "Sign in to edit your profile" `brand-soft` card on Profile and Account tabs.
i18n `settings.*`. Deep links: `/settings#preferences`, `#data`, `#account`.
Clicks: Save → saves · Export → file · Sign out → `/` · Delete → dialog · policy links → legal pages.
