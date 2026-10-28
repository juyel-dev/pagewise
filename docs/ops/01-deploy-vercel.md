# Ops · 01 · Deploy on Vercel

## First deploy (about 3 minutes)

1. Push this repo to GitHub (private is fine).
2. Go to **vercel.com → Add New → Project → Import** the repo.
3. Framework preset: **Next.js** (auto-detected). Build command and output directory: leave defaults.
4. Environment variables (optional for now):
   - `NEXT_PUBLIC_WAITLIST_URL` (see [ops 02](02-waitlist-apps-script.md))
   - `NEXT_PUBLIC_SITE_URL` (your final domain, once you have one)
5. Click **Deploy**. You get a URL like `https://<project>.vercel.app`: that is the live app.

> **Production URL timeline:** `pagewise-ten.vercel.app` (2026-10-25) → **`neet-aspirants.vercel.app`** (renamed 2026-10-27; the old alias was removed and returns 404). Use the new domain in docs and tests. `NEXT_PUBLIC_SITE_URL` should be set to the new URL; on Vercel metadata also falls back to the build domain automatically.

Every push to `main` deploys to production; every pull request gets its own preview URL.

## Custom domain

Project → Settings → Domains → add your domain → follow the DNS instructions. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` domain so Open Graph links are correct.

## Plan caveat (important)

Vercel's **Hobby** plan is for non-commercial, personal use. Once the product is public and monetised (or runs ads/paid plans), move to **Pro** (per-seat monthly fee). Budget for it; it is small compared with the value.

## Checks before sharing the link widely

- [ ] Open the URL on desktop Chrome and your phone; toggle dark mode.
- [ ] Send the link in WhatsApp/Telegram and confirm the preview card (Open Graph image) looks right.
- [ ] Waitlist: submit your own email and confirm a row appears in the sheet.
- [ ] Lighthouse (Chrome DevTools): aim for 90+ on Performance, Accessibility, Best Practices, SEO.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails on Vercel but passes locally | Check Node version (Project → Settings → General → Node.js 22.x) and run `npm ci && npm run build` locally |
| Waitlist button stays disabled | `NEXT_PUBLIC_WAITLIST_URL` not set. Add it in Vercel and **redeploy** (public env vars are baked in at build time) |
| Wrong preview image/links | Set `NEXT_PUBLIC_SITE_URL` and redeploy |
