# Decision log

Lightweight record of decisions, newest last. Each entry: what, why, and what would make us revisit.

| # | Decision | Why | Revisit if |
|---|---|---|---|
| 1 | Audience: all NEET UG aspirants in India (not a personal tool) | Product is meant to scale to lakhs of users | n/a |
| 2 | **Biology first**, Class 11 + 12 | Biology is half of NEET marks and almost entirely NCERT-line based; smallest, highest-value content set to get right | Strong demand for Physics/Chemistry early |
| 3 | **English first**; UI and content i18n-ready from day one; Hindi and other Indian languages in later phases | Faster to get quality right in one language; architecture must not block more | n/a |
| 4 | **Laptop/desktop first**, phone next. Layouts stay responsive from the start | Split-screen reading works best on large screens; official PDF embedding is most reliable on desktop | Analytics show most users on phones |
| 5 | Placeholder brand name **PageWise**, isolated in `src/config/brand.ts` | Name is undecided; must be a one-line change | Real name chosen |
| 6 | Primary colour: emerald (`--brand`), defined as CSS variables | Biology association; calm; owner will react after seeing it | Owner feedback |
| 7 | Question view supports **Focus mode and List mode**, user-selectable, remembered | Different students study differently; owner request | Usage data |
| 8 | Hosting: **Vercel** (owner's choice) | Best Next.js fit, easy previews | Costs or policy. Note: Vercel Hobby is for non-commercial use; move to Pro before monetising |
| 9 | NCERT pages are loaded from **NCERT's official links**, never hosted by us | Avoids redistributing copyrighted books | Embed test fails on target devices (see doc 03) |
| 10 | Questions are generated once offline, reviewed, then served as static data. No per-user AI calls | Accuracy control and near-zero marginal cost at scale | n/a |
| 11 | Backend: Supabase (Postgres + Auth + RLS), added in step 2 | Fast, relational, generous free tier | Scale or cost |
| 12 | Waitlist stored via Google Apps Script + Sheet until a database exists | Zero-cost, no backend needed for the landing page | Step 2 ships |
| 13 | **Truth in copy:** no invented numbers, testimonials or claims. Statements about review or verification go live only when they are true | Trust is the product, and students will check | n/a |
| 14 | Analytics, when added: cookieless, no third-party advertising pixels | Many users are under 18, and India's DPDP Act needs verifiable parental consent for minors. Needs legal review | Legal advice differs |
| 15 | Colour contrast is machine-checked (`scripts/check-contrast.py`); token changes must keep it green | An audit on 2026-10-25 found three failing pairs in the first build | n/a |
| 16 | The landing page stays mobile-first even though the app is laptop-first *(proposed, please confirm)* | Visitors arrive from Instagram, YouTube and Telegram links, mostly on phones | Analytics show otherwise |
| 17 | When the app opens, the landing page switches from waitlist to sign-in with one config flag (spec: screens/01b) | Avoids rebuilding the page | n/a |
