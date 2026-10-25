# Screen 01b · Landing page, launch edition (`/`)

**Status:** spec only, not built · **Builds on:** [01 Landing (waitlist edition)](01-landing.md) · **When:** the day the app opens to users (step 2 ships)

The waitlist edition explains the product and collects emails. The launch edition keeps the same page and swaps the goal from "join the waitlist" to "start practising", and adds the things that only make sense once there is a product to try. Only the differences are specified here.

## 1. What changes

| Area | Waitlist edition (live now) | Launch edition |
|---|---|---|
| Primary CTA | Join the waitlist (`#waitlist`) | Start practising free (`/sign-in?intent=start`) |
| Header | Theme toggle, Join the waitlist | Theme toggle, Sign in (ghost), Start free (primary) |
| Hero eyebrow | `NEET UG · Biology first · Opening soon` | `NEET UG · Biology · Class 11 and 12` (no "Opening soon") |
| Waitlist section | Email capture | Removed. Optionally kept as "Get told when Physics, Chemistry or your language arrives" |
| New sections | none | Interactive demo (§2), coverage (§6) |
| New behaviour | none | In-app browser notice (§4), signed-in swap (§5) |

**One switch.** Add `launchPhase: "waitlist" | "open"` to `src/config/brand.ts`. Components read it for CTA label, destination and which sections render, so launching is a one-line change. Not implemented yet.

## 2. Interactive demo ("Try one question")

Placed after How it works. Heading `Try one question`. Sub: `A sample we wrote for this page. In the app, questions come from the NCERT page you are reading.`

**Layout.** Centred card, max width 720 px. Top row: type chip, difficulty chip, topic `Cell structure`, `Sample` tag. Then question, four options, action row, feedback, explanation. Footer caption: `Sample question written for this page. Not taken from NCERT.`

**Three original questions** (cycle DQ-1 → DQ-2 → DQ-3 → DQ-1):

**DQ-1 · MCQ · Easy**
Which of the following cell organelles is **not** surrounded by a membrane?
A. Mitochondria  B. Ribosomes  C. Lysosomes  D. Golgi apparatus
**Answer B.** Ribosomes are made of rRNA and proteins and have no membrane around them. Mitochondria have a double membrane; lysosomes and the Golgi apparatus are each enclosed by a single membrane.

**DQ-2 · Assertion–Reason · Medium**
**Assertion (A):** Ribosomes are often called the protein factories of the cell.
**Reason (R):** Ribosomes are the sites where amino acids are joined to form polypeptide chains.
A. Both A and R are true, and R is the correct explanation of A
B. Both A and R are true, but R is not the correct explanation of A
C. A is true, but R is false
D. A is false, but R is true
**Answer A.** Protein synthesis (translation) takes place on ribosomes, where amino acids are linked into polypeptides. That is why they are called protein factories, so R explains A.

**DQ-3 · Statement-based · Medium**
Which one of the following is correct about prokaryotic cells?
A. They have a membrane-bound nucleus
B. Their ribosomes are of the 70S type
C. They contain mitochondria
D. Their ribosomes are of the 80S type
**Answer B.** Prokaryotes have no membrane-bound nucleus and no organelles such as mitochondria. Their ribosomes are 70S (50S + 30S subunits). The 80S type is found in the cytoplasm of eukaryotic cells.

*A biology reviewer must approve all three before launch.*

**State machine**

| State | What the user sees | Next |
|---|---|---|
| `idle` | Four unselected options. **Check answer** disabled | Choose an option |
| `selected` | Chosen option: 2 px `brand` border, `brand-soft` fill. **Check answer** enabled | Change choice, or Check |
| `checked-correct` | Option turns `good-soft` with a check icon. Feedback `Correct.` Explanation opens | **Try another** |
| `checked-wrong` | Chosen option turns `bad-soft` with a cross icon. The right option gets a `good` outline and the label `Correct answer`. Feedback `Not quite. The answer is B.` Explanation opens | **Try another** |

After two checked questions, a dismissible inline card appears: `Ready for real NCERT pages?` with the primary CTA. Nothing is saved; reload resets the demo.

**Keyboard and accessibility.** Options are a `radiogroup`; arrow keys move between them. While focus is inside the demo: `1`–`4` or `A`–`D` select, `Enter` checks or advances, `N` next. Shortcuts never fire outside the demo. Hints (`kbd`) show only for fine pointers. Feedback is an `aria-live="polite"` region and never colour-only (icon plus text). Without JavaScript, a `noscript` note says `Turn on JavaScript to try a sample question.`

**Engineering.** Client island, loaded lazily when near the viewport, target 15 KB gzip or less.

## 3. Truth-in-copy flags (decision 13)

Claims are controlled by flags in `src/config/claims.ts`, flipped only when the fact is real. When a flag is off, the claim and any step built on it are omitted, never faked.

| Flag | Controls | Turn on when |
|---|---|---|
| `claims.officialNcert` | "official NCERT page on the left" | The embed feasibility test passes (product doc 03) and the viewer is live |
| `claims.verifyPass` | "checked against the page" | The verification pass runs on all published questions |
| `claims.studentReview` | "reviewed by students" | At least one active reviewer and the review queue is live |
| `claims.reportFlow` | "report a question" | The report button works in the app |
| `pricing.status = "beta"` | "Free during beta" | Pricing is still beta. Otherwise copy falls back to `No card needed` |

**Never on the page:** user counts, ratings, testimonials, "toppers use us", or institution logos, unless real, current and consented. Chapter and question counts are generated from data.

## 4. Sign-in inside social apps

Visitors arrive from Instagram, Facebook, Telegram and YouTube links, which open in an **embedded browser**. Google blocks its sign-in inside many of these, so "Continue with Google" can fail for exactly the people most likely to click.

- `InAppBrowserNotice` detects these browsers and shows a dismissible bar: `To sign in, open this page in Chrome or Safari`, with an **Open in browser** button and a **Copy link** fallback.
- **Requirement for screen 02 (sign-in):** offer a method that works in embedded browsers, such as an email link or phone code, in addition to Google.
- Test on a real Android phone inside the Instagram and Telegram browsers before launch.

## 5. Signed-in visitors

The page stays public and static. After hydration, a tiny island reads a non-sensitive hint cookie `pw_s` set at sign-in. If present, header and hero CTAs become **Continue studying** (`/home`) with an avatar. Slot widths are reserved so nothing shifts. Signed-in users are never redirected away from `/`.

## 6. Coverage section (`#coverage`)

Heading `Biology, Class 11 and 12`; sub `Chapters go live as they pass review.` Tabs for Class 11 and Class 12. Chips per chapter with status shown by icon and text: `Live` (brand-soft, check), `In review` (neutral, clock), `Soon` (outline). Progress line `{n} of {m} chapters live`. `Live` chips link to sign-in with that chapter pre-selected.

**Data:** generated from the content manifest and revalidated hourly, so status changes without a redeploy. Chapter names must match the current NCERT edition. NCERT revises its books, so nothing is hard-coded. If the manifest is empty, show `Class 11 chapters are rolling out. Sign in to see what is live today.`

## 7. SEO, performance, analytics (additions)

- **JSON-LD:** `WebSite`, `Organization` (name and URL only), and `FAQPage` mirroring the FAQ.
- **Budgets:** first-load JS 120 KB gzip or less. LCP 2.2 s or less (p75, mid-range Android on 4G), CLS 0.05 or less, INP 200 ms or less. Still no third-party scripts except cookieless analytics.
- **Extra events:** `demo_select{question,option}`, `demo_check{question,correct}`, `demo_next`, `coverage_tab{class}`. No personal data.
- **CI:** Playwright smoke test (CTA reaches sign-in, demo works, FAQ opens), axe-core scan, Lighthouse budgets, visual snapshots at 360, 768 and 1280 px in light and dark.

## 8. Acceptance criteria

- [ ] `launchPhase` switches every CTA, the header and the hero eyebrow with no leftover waitlist wording.
- [ ] Demo covers all four states by touch, mouse and keyboard, and announces results to screen readers.
- [ ] No claim appears unless its flag is on, and fallback copy shows otherwise.
- [ ] No NCERT text or page image anywhere on the page.
- [ ] `python3 scripts/check-contrast.py` passes, including any new tokens.
- [ ] Lighthouse mobile: Performance 90 or more, Accessibility 95 or more, SEO 95 or more.
- [ ] In-app browser notice verified on Instagram and Telegram on a real phone.
- [ ] A biology reviewer has approved all three demo questions.

## 9. Open questions for the owner

1. **Founder story:** do you want your name and "future doctor who's already building" on the page? It is a strong trust signal, and it is your call.
2. **"Free" promise:** are you comfortable saying the core experience stays free? For now the copy only says "free during beta".
3. **No fake proof:** agree that the page shows no counts or testimonials until they are real?
4. **Sign-in methods:** besides Google, which should work inside Instagram and Telegram (email link, phone code)?
5. **Domain and social handles:** do you already own any?
