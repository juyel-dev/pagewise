# 03 · Onboarding `/onboarding`

**Picture.** A friendly three-step setup, one question per screen, big touch targets, a progress bar at the top. It takes under a minute. Shown once, after the first sign-in. It never blocks a guest (guests skip it entirely).

## Wireframe (card 480 px centred on desktop; full screen on phone)
```
┌────────────────────────────────────────┐
│ ◆                          Skip for now │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░  Step 1 of 3          │
│                                          │
│  Welcome. What should we call you?       │
│  [ Juyel                              ]  │
│                                          │
│  Which class are you in?                 │
│  ( Class 11 ) ( Class 12 ) ( Dropper )   │
│                                          │
│                              [ Continue ]│
└────────────────────────────────────────┘
```
Card `bg:surface b:line r:24 sh:card p:32`; page `bg:canvas`. Progress bar 6 px (`ProgressBar`, brand fill), label `type:Small` `muted`. Footer buttons: "Back" `ghost` left (steps 2–3), primary right. Transitions: fade+slide 150 ms; none under reduced motion.

## Step 1 — About you
| E | Component | Copy / style | Behaviour |
|---|---|---|---|
| 1 | Heading `h1` | "Welcome. What should we call you?" `type:H1` | focus target on load |
| 2 | Text input | label "Your name" · prefilled from Google first name · max 60 | required; trimmed |
| 3 | Heading `h2` | "Which class are you in?" `type:H3` | — |
| 4 | Choice chips ×3 | "Class 11" · "Class 12" · "Dropper / repeater" · `lg` 48 px, `r:12`; selected = `bg:brand-soft b:brand brand-text` | single choice, required |
| 5 | Button | "Continue" `primary` lg | enabled when 2 and 4 valid → Step 2 |

## Step 2 — Your exam
| E | Component | Copy | Behaviour |
|---|---|---|---|
| 1 | Heading | "When are you taking NEET?" | — |
| 2 | Choice chips | three years: first = next May (from today's date; June onwards means next year), then +1, +2 | single, required |
| 3 | Text | "We'll use this to plan your study. You can change it later." `Small` `muted` | — |
| 4 | Buttons | Back · Continue | — |

## Step 3 — Your daily goal
| E | Component | Copy | Behaviour |
|---|---|---|---|
| 1 | Heading | "How many questions a day?" | — |
| 2 | Choice chips | "10" "20" "40" "60" (default 20 selected) | single |
| 3 | Text | "Small and steady beats big and rare. You can change this in Settings." | — |
| 4 | Buttons | Back · **"Start studying"** `primary` | Saves profile (`saveProfile`, sets `onboarded_at`), runs `syncLocalData` if guest data exists → `/study`, or the `next` path |

## Age step (gate) — legal-pending
Because users may be under 18, an **age check** sits between Step 1 and Step 2: "Are you 18 or older?" with two big choices ("Yes, I'm 18 or older" / "No, I'm under 18"). "No" sets `is_minor` and `consent_status = pending` and shows the parental-consent screen. **The exact consent screen text and mechanics are provided by the owner's legal work (decision 48) and are not designed here.** Until then the step is built behind a feature flag, off by default, and Step numbering shows "of 3".

## States
Saving: primary shows spinner, fields disabled. Error: inline `bad-soft` under buttons "We couldn't save that. Please try again." (retry keeps entries). Resume: leaving mid-way and returning restores the step from `sessionStorage`. Already onboarded: redirect to `/home`. Not signed in: redirect to `/sign-in?next=/onboarding`. "Skip for now" (top right) sets defaults (Class 11, next NEET year, 20 a day), keeps `onboarded_at` empty, and shows a one-line reminder on Home "Finish setting up your profile" (dismissible).

## Notes
`robots: noindex`. i18n prefix `onboarding.*`. Each step has one `h1`; focus moves to it on step change and the change is announced ("Step 2 of 3"). Chips are a `radiogroup` with arrow keys.

## Where every click goes
Skip for now → `/home` (defaults) · Back → previous step · Continue → next step · Start studying → `/study` or `next`.
