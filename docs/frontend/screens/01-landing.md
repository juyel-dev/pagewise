# Screen 01 · Landing page (`/`)

**Status:** built · **Route:** `/` · **Rendering:** fully static · **Goal:** explain the product in 10 seconds and collect waitlist emails.

## 1. Purpose and audience

- Visitors: NEET aspirants (mostly on laptop during study hours, but many arrive from phone via social links), parents, teachers, potential reviewers.
- Primary action: **Join the waitlist.** Secondary: understand how it works.
- Success: waitlist conversion rate; scroll depth to "How it works"; FAQ opens.

## 2. Page structure

| # | Section | Component | Anchor | Purpose |
|---|---|---|---|---|
| 0 | Skip link | `layout.tsx` | – | Keyboard users jump to `#main` |
| 1 | Header | `site-header.tsx`, `mobile-nav.tsx` | – | Logo, nav anchors, theme toggle, CTA |
| 2 | Hero | `hero.tsx` + `workspace-preview.tsx` | – | Promise + product visual |
| 3 | Problem | `problem.tsx` | – | Why it exists (3 pains) |
| 4 | How it works | `how-it-works.tsx` | `#how-it-works` | 3 steps |
| 5 | Features | `features.tsx` | `#features` | 8 cards (4 launching, 4 "coming soon") |
| 6 | Accuracy | `accuracy.tsx` | `#accuracy` | 4-step review process + disclaimer |
| 7 | Roadmap | `roadmap.tsx` | `#roadmap` | Now / Next / Later + 13 languages |
| 8 | FAQ | `faq.tsx` | `#faq` | 8 questions, native `<details>` |
| 9 | Waitlist | `waitlist.tsx`, `waitlist-form.tsx` | `#waitlist` | Email capture |
| 10 | Footer | `site-footer.tsx` | – | Nav, disclaimer |

## 3. Section specs

### 3.1 Header
- Sticky, 64 px, `canvas/80` + backdrop blur, 1 px bottom border at 70% opacity.
- Left: logo (mark + name). Centre (≥ `md`): 5 anchor links. Right: theme toggle, "Join the waitlist" button (≥ `sm`), hamburger (< `md`).
- Mobile menu: disclosure panel below the header, full-width links (44 px rows) + full-width CTA; closes on link tap and Escape.

### 3.2 Hero
- Eyebrow pill: `NEET UG · Biology first · Opening soon`.
- H1: "Read the NCERT page." / (brand-coloured) "Practise that same page." 40 px (mobile) → 60 px (≥ `sm`).
- Lede (18–20 px, max 42rem): the side-by-side promise.
- CTAs: **Join the waitlist** (primary, large) + **See how it works** (secondary). Stacked and full-width on mobile.
- Proof list (3 factual bullets): Biology Class 11 & 12 first · A source page for every question · English now, Hindi & more next.
- Visual: `WorkspacePreview` below, 64–80 px gap. Soft radial brand glow behind.

### 3.3 Workspace preview (illustration, not interactive)
- Window chrome: three dots, breadcrumb pill ("Biology › Class 11 › Cell: The Unit of Life"), streak chip.
- Left pane (hidden below `md`): "Official NCERT PDF" toolbar (page 12 / 20, zoom), abstract page skeleton (grey bars + diagram placeholder). **Never real NCERT text.**
- Right pane: "Practice · this page", progress dots (question 3 of 6), question card with chips (MCQ, Medium), bookmark/flag icons, an original sample MCQ, four options with B shown correct (check icon + green), short explanation + "See the source page →".
- `role="img"` with one descriptive `aria-label`; all inner content `aria-hidden`.
- Honesty rule: the preview shows only features that exist in the MVP (no line highlighting, since the official embed can't do it).

### 3.4 Problem
- Tinted band. H2: "NEET Biology lives in the NCERT line. Your practice should too."
- 3 cards: *You read, then go hunting* · *Questions don't point back* · *Revision loses context*.

### 3.5 How it works
- 3 numbered cards with icon: Open a chapter · Practise the page you just read · Turn mistakes into revision.

### 3.6 Features
- Grid: 1 col (mobile) / 2 (`sm`) / 4 (`lg`). Cards flagged **Coming soon** use a dimmed surface + pill.
- Launching: Split-screen workspace · Focus mode or full list · Real NEET question styles · Built for laptops (keyboard, dark mode).
- Coming soon: Bookmarks & mistake notebook · Progress by chapter · Your language · Phone-friendly experience.

### 3.7 Accuracy
- 4 numbered steps (written from the page → checked against it → reviewed by students → fixed when flagged) + disclaimer that practice does not replace the textbook.
- **Content rule:** these claims must be true at launch (see product doc 03 §4).

### 3.8 Roadmap
- Three columns (Launching first / Next / Later) with 5 bullets each; plus a panel listing the 13 NEET languages (English highlighted as first).

### 3.9 FAQ
- 8 items in one bordered list, native `<details>/<summary>`, plus-icon rotates 45° when open. Content in `faq.tsx`.

### 3.10 Waitlist
- Centred card with soft glow. H2 "Be first in when PageWise opens".
- Fields: **Email** (required) and **I'm aiming for** (NEET 2027 / 2028 / 2029 or later / Just exploring).
- Hidden honeypot field `company`.
- Microcopy: "We'll only use your email to tell you when early access opens."

### 3.11 Footer
- Logo + tagline, anchor links, legal disclaimer (independent project; not affiliated with NCERT or NTA; NCERT books remain NCERT's property; AI-assisted, student-reviewed questions), `© PageWise`.
- **Pre-launch TODO:** Privacy Policy and Terms links.

## 4. Waitlist form states

| State | UI |
|---|---|
| Not configured (`NEXT_PUBLIC_WAITLIST_URL` empty) | Inputs and button disabled; helper text "Waitlist signups open very soon." |
| Idle | Enabled; helper text about email use |
| Loading | Button disabled with spinner "Joining…" |
| Success | Green confirmation panel (`role="status"`) replaces the form |
| Error: invalid email | Inline `role="alert"` message, field `aria-invalid` |
| Error: network | Inline message asking to retry |
| Honeypot filled | Silently shows success, sends nothing |

Transport: `fetch` POST, `mode: "no-cors"`, `text/plain` JSON body `{ email, goal, source }` to a Google Apps Script web app (response is opaque; resolved request = success).

## 5. Responsive behaviour

| Breakpoint | Changes |
|---|---|
| < 640 | Single column; stacked full-width CTAs; hamburger; preview shows question pane only |
| 640–767 | Two-column grids start; header CTA appears |
| ≥ 768 | Inline nav; preview shows both panes |
| ≥ 1024 | Features in 4 columns; roadmap/steps in 3–4 columns |

## 6. Accessibility

- One `h1`, seven `h2`s, `h3`s inside cards. Each `<section>` is labelled by its heading.
- Skip link, landmarks (`header`, `nav` ×3 with labels, `main`, `footer`).
- Menu button has `aria-expanded`, `aria-controls`, label that changes with state.
- Theme toggle has a label; icons swapped by CSS so server/client markup match.
- Status and error messages use `role="status"` / `role="alert"`.
- All colours verified for both themes (see design foundations).

## 7. SEO and sharing

- `<title>`: "PageWise — NCERT page + NEET practice, side by side". Meta description from `brand.description`.
- Open Graph + Twitter card with generated 1200×630 image (`opengraph-image.tsx`). `metadataBase` from env.
- Favicon: `icon.svg`.
- Landing text is our own; no NCERT text is published anywhere.

## 8. Analytics events (to add when analytics is chosen)

`landing_view`, `cta_click{location}`, `nav_click{target}`, `faq_open{question}`, `theme_toggle{to}`, `waitlist_submit{status, goal}`. No personal data in events.

## 9. Performance budget

- Fully static; no client JS except theme, mobile menu and waitlist form.
- Fonts self-hosted (Inter variable), no third-party requests.
- No images on the page (illustration is CSS/SVG).

## 10. Open design questions for the owner

1. Primary colour: keep emerald or try another? (one-line change)
2. Hero headline and tone: confident-calm vs. more energetic?
3. Show the "Coming soon" features on the landing page, or keep it MVP-only?
4. Final product name and domain.

## 11. Acceptance criteria

- [x] `npm run lint`, typecheck and `npm run build` pass.
- [x] Static prerender of `/`, OG image and icon.
- [ ] Reviewed visually on Chrome desktop, Android Chrome and iOS Safari (owner).
- [ ] Waitlist connected to a Google Sheet and tested end to end (owner, see ops doc 02).
- [ ] Copy approved by the owner; claims verified true at launch.

## 12. Changelog

- **2026-10-25.** Header CTA is now hidden below 640 px as specified (it was overflowing the header and clipping the menu button on phones). Verified no horizontal scroll at 320, 360 and 390 px. Waitlist input borders and the streak chip were darkened to pass contrast (see design foundations §12).
- **Next:** launch edition (waitlist → sign-in, interactive demo): [01b](01b-landing-launch-edition.md).
