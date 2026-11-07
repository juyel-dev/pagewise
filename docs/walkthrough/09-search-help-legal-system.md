# 09 · Search, Help, Legal, System pages

## A · Search palette (overlay, `⌘/Ctrl K`)
```
        ┌ Search ───────────────────────────────────────────────┐
        │ 🔍  tissue                                  Esc       │
        ├────────────────────────────────────────────────────────┤
        │ Chapters                                               │
        │  ▸ The Living World · Biology · Class 11              │
        │ Questions                                              │
        │  ▸ Which tissue gives mechanical support… · p.4       │
        │ Pages                                                  │
        │  ▸ The Living World · printed page 77                 │
        │ Actions                                                │
        │  ▸ Open bookmarks    ▸ Start quick practice            │
        ├────────────────────────────────────────────────────────┤
        │ ↑↓ move · Enter open · Esc close                       │
        └────────────────────────────────────────────────────────┘
```
Dialog 640 px, `r:16 sh:window`, backdrop 50 % `ink`; phone: full-width sheet from the top. Input 56 px `Body`. Results grouped (max 5 per group), keyboard moves a single highlighted row (`bg:brand-soft`), mouse hover syncs. Sources: chapters (titles), published question stems (text search), printed page labels ("p 77", "page 77"), static actions. Empty query shows "Recent" (last 5 opened chapters) and Actions. No results: "No results for “{q}”." + "Try a chapter name or a topic." Debounce 150 ms; question text matched only on published questions. Opening a question → `/study/{slug}?p={page}&q={id}` (scrolls to and focuses that question). i18n `search.*`.

## B · Help `/help`
```
┌ public/app shell ───────────────────────────────────────────────────────────┐
│ Help                                                                         │
│ Find an answer or tell us what's wrong.                                      │
│ [ Getting started | Studying | Your account and data | About the content ]    │
│ ▸ accordion rows …                                                           │
│ ┌ #feedback ─────────────────────────────────────────────────────────────┐   │
│ │ Tell us                                                                  │   │
│ │ What is it about? (•) A bug ( ) An idea ( ) A chapter I need ( ) Other   │   │
│ │ Message [ textarea, 1000 max, counter ]                                  │   │
│ │ Email (optional, so we can reply) [ prefilled for signed-in ]            │   │
│ │ [ Send ]                                                                 │   │
│ └──────────────────────────────────────────────────────────────────────────┘   │
│ Prefer email?  hello@…  (from NEXT_PUBLIC_CONTACT_EMAIL; hidden if unset)    │
└──────────────────────────────────────────────────────────────────────────────┘
```
Top to bottom: `h1` "Help" · lede "Find an answer or tell us what's wrong." · Tabs (4 groups) · accordion (same behaviour as landing FAQ; content = landing FAQ plus: "How do I report a wrong question?" → "Tap the flag on a question and choose a reason." ; "How do I move my progress to another device?" → "Sign in on both devices."; "How do I delete my data?" → "Settings → Account → Delete my account.") · Feedback card (RadioGroup, Textarea, Input, `primary` "Send") · contact line. Submitting writes to a new `feedback` table (id, user_id?, kind, message, email?, page, created_at), rate-limited 5/hour/device; success replaces the form with "Thanks — we read every message." States: sending, error "We couldn't send that. Please try again.". `/help#feedback` scrolls to the card. Public header/footer for guests, app shell for signed-in users. i18n `help.*`.

## C · Legal `/legal/privacy`, `/legal/terms`, `/legal/content`
```
┌ public header ──────────────────────────────────────────────────────────────┐
│ Privacy policy                    On this page            │
│ Last updated: {date}              1 What we collect       │
│                                   2 Why we collect it     │
│ 1 What we collect                 3 Where it is stored    │
│  paragraphs (Body, 65–75 ch)      …                       │
│ [Print]                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```
Layout: `Container` narrow; `h1` `type:H1`; "Last updated: {date}" `Small` `muted`; two columns ≥ 1024 (content 8 / sticky "On this page" 4 with scroll-spy); headings `h2` `type:H2` with anchor links; text `Body`; lists with 8 px spacing; a "Print" ghost button (print stylesheet: white background, no chrome). **The text itself is supplied by the owner's legal work (decision 48).** Required structure so engineering can build now:
- **Privacy:** What we collect · Why · Where it is stored (Supabase, Mumbai region) · Guests and accounts · Under 18 · Cookies and tracking (none for advertising) · Sharing · Your rights (export, delete) · Retention · Contact · Changes.
- **Terms:** Using Pagewise · Accounts · Acceptable use · Content and questions · No guarantee of results · Liability · Changes · Contact.
- **Content and NCERT:** How the books are used · Credit · Question authorship and review · Report a problem or request removal · Contact.
Tab bar at the top of the three pages ("Privacy · Terms · Content and NCERT"). Static pages. i18n `legal.*` (text stays English until the lawyer approves translations).

## D · System pages
| Page | When | Content / actions |
|---|---|---|
| **404** | unknown route, draft chapter for non-staff | code "404" `Display` `brand-text`, `h1` "This page isn't in the chapter", text "The link may be old, or the chapter is not published yet.", `primary` "Go to Study", `secondary` "Home" |
| **Error** | unexpected failure in a route | `h1` "Something went wrong", "We could not load this page. Your progress is safe. Try again, or head back home.", `primary` "Try again", `secondary` "Go home" |
| **Global error** | root crash | same copy, inline styles, "Try again" |
| **Offline page** | navigating while offline with nothing cached | `h1` "You're offline", "Chapters you've already opened still work. Reconnect to open new ones.", `primary` "Try again" |
| **No access** | staff route without role, expired staff session | `h1` "You don't have access to this page", `primary` "Go home" |
| **Session expired** | server rejects an old session | Toast "You were signed out. Sign in to keep syncing." + sign-in sheet; local progress is kept |
All use `StatusPage`: centred column max 448, `gap:16`, `H1` title, `Body` `ink-2`, buttons in a wrapping row. Document titles "Page not found", "Something went wrong"… `robots: noindex`. i18n `system.*`.
