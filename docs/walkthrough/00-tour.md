# 00 · The tour: shell, type roles, site map, journeys

## 1. How the app should feel

A student opens Pagewise on a phone at night. The screen is calm: lots of space, one clear thing to do, text that is easy to read, no clutter, nothing slow. It feels like a well-made book that talks back. The same product on a laptop feels like a desk with the book on one side and the questions on the other.

Five rules every page obeys:
1. **One obvious next step** (one primary button per region).
2. **Content first.** Chrome is quiet (borders, small type, muted colours); reading and questions get the space and the contrast.
3. **Honest.** Real data or an honest empty state. Never invented numbers, testimonials or fake activity.
4. **Fast to feel.** Skeletons match the final layout; presses react in < 100 ms; nothing jumps.
5. **Guest-friendly.** Everything for studying works without an account; signing in is always optional and always explained.

## 2. Global shell (appears on many pages)

### 2.1 Public header (landing, help, legal) — 64 px, sticky
```
┌────────────────────────────────────────────────────────────────────────────┐
│ ◆ Pagewise    How it works  Subjects  FAQ        🌐 EN ▾   ◐   Sign in  [Start studying] │
└────────────────────────────────────────────────────────────────────────────┘
```
| E | Component | Copy / style | → |
|---|---|---|---|
| 1 | Logo | mark 28 px `brand` + wordmark `type:H3` | `/` |
| 2 | Nav links (desktop ≥ 768) | "How it works", "Subjects", "FAQ"; `type:Label` `ink-2`, hover `ink`, 8 px gap | Smooth-scroll to `#how`, `#subjects`, `#faq` on landing; `/#how` etc. from other pages |
| 3 | Language menu | globe icon + "EN"; lists only fully translated locales (launch: English); `b:control-border r:8` | Sets locale cookie, reloads page |
| 4 | Theme toggle | icon button, sun/moon/system cycle; `aria-label="Theme"` | Toggles, remembers |
| 5 | "Sign in" | `ghost` md | `/sign-in` |
| 6 | "Start studying" | `primary` md pill | `/study` |
Header bg `canvas`; a 1 px `line` bottom border fades in after 8 px scroll. Phone (< 768): logo left; right side "Start studying" (`primary` sm) + menu icon → Sheet with the links, language, theme, "Sign in".

### 2.2 App shell (signed-in or guest, all `(app)` pages)
```
 ≥1024                                              < 1024
┌────────┬───────────────────────────────────┐      ┌────────────────────────┐
│◆ Page- │ Page title        [⌘K search] 🌐 ◐ (J)│     │◆  Page title  🔍  (J) │
│ wise   ├───────────────────────────────────┤      ├────────────────────────┤
│ ⌂ Home │                                   │      │                        │
│ 📖Study │            content                │      │        content         │
│ 🎯Prac. │                                   │      │                        │
│ 📊Prog. │                                   │      ├────────────────────────┤
│ ☆ Saved│                                   │      │ ⌂   📖   🎯   📊   ⋯  │
│ ──────  │                                   │      └────────────────────────┘
│ ? Help  │                                   │      bottom tab bar, 64 px
│ ⚙ Sett. │                                   │
│[guest/ │                                   │
│ user]  │                                   │
└────────┴───────────────────────────────────┘
```
**Sidebar (≥ 1024), 232 px:** `bg:surface`, right border `line`. Logo row 56 px. Items 40 px tall, `r:8`, icon 20 px + label `type:Label`; idle `ink-2`; hover `bg:surface-2`; **active** `bg:brand-soft`, `brand-text`, 3 px `brand` bar on the left edge. Order: Home, Study, Practice, Progress, Bookmarks · divider · Help, Settings (Settings hidden for guests; replaced by "Sign in"). Bottom card: **guest** → "Studying as a guest" / "Sign in to keep your progress on every device." / `primary` sm "Sign in"; **signed-in** → avatar initial circle 32 px, name, "Class 11 · NEET 2027", chevron → account menu (Settings, Help, Sign out).
**Top bar, 56 px:** left page title (`type:H2`, on `lg+`) ; centre-right search trigger styled like an input (`bg:field`, `b:control-border`, `r:10`, 320 px, text "Search chapters and questions", `⌘K`/`Ctrl K` keycap right); right: language, theme, avatar (or "Sign in" for guests).
**Phone:** no sidebar. Top bar: logo mark, title, search icon, avatar. **Bottom tab bar 64 px** (`bg:surface`, top border `line`, safe-area padding): Home, Study, Practice, Progress, **More** (opens Sheet: Bookmarks, Help, Settings/Sign in, Language, Theme, Legal links). Active tab: `brand-text`, label bold, 3 px top indicator `brand`. The **Study workspace hides this bar** (it has its own).

### 2.3 Public footer — landing, help, legal
```
┌──────────────────────────────────────────────────────────────────────┐
│ ◆ Pagewise                Study        Learn         Help     Legal      │
│ Read the NCERT page.       Biology      How it works  Help    Privacy    │
│ Practise its questions.    Physics      Subjects      Contact Terms      │
│                            Chemistry    FAQ                    Content & NCERT │
├──────────────────────────────────────────────────────────────────────┤
│ © 2026 Pagewise · Made for NEET UG students         🌐 EN   ◐        │
└──────────────────────────────────────────────────────────────────────┘
```
`bg:surface`, top border `line`, 48 px top/bottom padding; columns collapse to 2 on phone, then 1 under 400 px; link `type:Small` `ink-2`, hover underline. "Contact" → `mailto:` from `NEXT_PUBLIC_CONTACT_EMAIL`; if unset the link is hidden.

### 2.4 Global overlays
| Overlay | Trigger | Spec |
|---|---|---|
| Search palette | `⌘/Ctrl K`, search field, search icon | Dialog 640 px; input; groups Chapters, Questions (published only), Pages, Actions; arrows + Enter; Esc closes |
| Shortcuts dialog | `?` | Lists keys by area (Global, Study) |
| Toasts | system | Bottom-centre desktop / above tab bar on phone |
| Offline pill | no network | Small `accent-soft` pill under top bar: "Offline — your answers are saved on this device" |
| Sign-in sheet | guest taps a sign-in-only feature (Review queue, Settings) | Sheet: reason sentence + Google button + "Not now" |

## 3. Type roles (v2, replaces ad-hoc sizes)

Font: Inter Variable. Numerals tabular for counts and timers. Indic scripts use `Noto Sans Devanagari/Bengali` with `line-height +0.1`.
| Role | Phone | Desktop | Weight | Line | Tracking | Use |
|---|---|---|---|---|---|---|
| Display | 40 | 60 | 600 | 1.05 | −0.02em | Landing H1 only |
| H1 | 26 | 32 | 650 | 1.2 | −0.015em | Page title |
| H2 | 20 | 24 | 600 | 1.25 | −0.01em | Section title |
| H3 | 16 | 18 | 600 | 1.35 | 0 | Card title |
| Lede | 17 | 20 | 400 | 1.6 | 0 | Intro paragraphs |
| Body | 15 | 16 | 400 | 1.65 | 0 | Default text, explanations |
| Question | 16 | 17 | 500 | 1.6 | 0 | Question stem |
| Label | 14 | 14 | 500 | 1.4 | 0 | Buttons, nav, form labels |
| Small | 13 | 14 | 400 | 1.5 | 0 | Meta, helper text |
| Caption | 12 | 12 | 500 | 1.4 | 0.01em | Chips, keycaps |
Spacing scale (px): 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 96. Page block gap 24; section gap (landing) 80/112; card padding 20; card gap 16.

## 4. i18n rules for every page
Key format `area.section.element` (e.g. `landing.hero.title`). No text inside images. Plurals through ICU (`{count, plural, …}`). Allow 40 % text growth (Hindi, Bengali): no fixed-width buttons, truncation only for titles with `title` attribute. Dates/numbers via `Intl`. Launch language: English; Hindi and Bengali join as full catalogues, never partial.

## 5. Site map (every page, every route)

| Route | Page | In nav | Who |
|---|---|---|---|
| `/` | Landing | — | all (signed-in → `/home`) |
| `/sign-in` | Sign in | — | all |
| `/onboarding` | Onboarding (3 steps) | — | new signed-in users |
| `/home` | Home | ✓ | all |
| `/study` | Study hub | ✓ | all |
| `/study/[chapter]` | Study workspace | — | all |
| `/practice` | Practice hub | ✓ | all |
| `/practice/new` · `/practice/session/[id]` · `/practice/session/[id]/result` | Practice session (quick or test) | — | all |
| `/practice/review` | Review queue | — | signed-in |
| `/progress` | Progress | ✓ | all (guest = this device) |
| `/bookmarks` | Bookmarks | ✓ | all |
| `/settings` | Settings (Profile, Preferences, Data and privacy, Account) | ✓ | all; Profile and Account need sign-in |
| `/help` | Help centre + FAQ + contact | ✓ | all |
| `/legal/privacy` · `/legal/terms` · `/legal/content` | Legal | footer | all |
| `/start` | **Removed**, redirects to `/study` | — | — |
| `/library` | Redirects to `/study` | — | — |
| 404, error, offline | System pages | — | all |
| `apps/admin` | Admin console (separate site) | — | staff |

## 6. Visitor journeys

**First visit (phone, night).** Landing → reads hero → "Start studying" → Study hub (Biology, Class 11 selected) → taps the live chapter → workspace opens on page 1 with the first page's questions → answers one → sees explanation → taps "Show in NCERT" → PDF highlights the line → keeps going. After ~3 answered questions, a quiet GuestBanner (once) offers "Sign in to keep this". Nothing else interrupts.
**Returning student (daily loop).** Opens app → Home shows "Continue reading — page 4" → taps Resume → lands exactly there → practises → Home next day shows streak and what is due for review.
**Sign-in moment.** Anywhere a guest taps "Sign in" → Google → returns to the same place → progress merges silently → onboarding only if profile incomplete.
