# 02 · Sign in `/sign-in?next=<path>`

**Picture.** A single quiet card in the middle of the screen. One way in: Google. A clear way to carry on without an account. Nothing else.

## Wireframe (desktop and phone are the same card; phone is full-bleed with 20 px side padding)
```
              ┌───────────────────────────────┐
              │            ◆ Pagewise          │
              │                                │
              │     Sign in to Pagewise        │
              │  Keep your progress and saved  │
              │  questions on every device.    │
              │                                │
              │  [ G  Continue with Google ]   │
              │                                │
              │  ✓ Pick up where you stopped   │
              │  ✓ Keep your saved questions   │
              │  ✓ Use it on any device        │
              │                                │
              │ ───────────────────────────── │
              │     Continue as a guest        │
              │  By continuing you agree to    │
              │  the Terms and Privacy Policy. │
              └───────────────────────────────┘
```
Page `bg:canvas`; card `bg:surface b:line r:24 sh:card p:32` (phone p:24), max width 420, vertically centred in `100dvh`, top-left small "← Back" ghost link on desktop (→ browser back, else `/`).

## Elements top to bottom
| E | Component | Copy / style | → |
|---|---|---|---|
| 1 | Logo | mark + wordmark, centred, `mb:24` | `/` |
| 2 | Heading `h1` | "Sign in to Pagewise" · `type:H1` · centred | none |
| 3 | Text | "Keep your progress and saved questions on every device." · `type:Body` `ink-2` · centred · `mt:8` | none |
| 4 | Button | **Google** official multicolour "G" mark + "Continue with Google" · `secondary` lg full width · `b:control-border` · `mt:24` | Starts Google OAuth; `redirectTo` = `/auth/callback?next=<safe next>` |
| 5 | List | three rows, ✓ `good` 16 px + `type:Small` `ink-2`: "Pick up where you stopped" · "Keep your saved questions" · "Use it on any device" · `mt:24` | none |
| 6 | Divider | 1 px `line`, `my:24` | — |
| 7 | Button | "Continue as a guest" · `ghost` md full width | `next` if safe, else `/study` |
| 8 | Text | "By continuing you agree to the Terms and Privacy Policy." · `type:Caption` `muted` · centred · links underlined | `/legal/terms`, `/legal/privacy` |

## States
| State | What changes |
|---|---|
| Idle | as above |
| Starting | E4 shows spinner + "Opening Google…", disabled, `aria-busy` |
| Cancelled at Google | back on page; inline `bad-soft` message above E4: "Sign-in was cancelled. You can try again or continue as a guest." |
| Failed | "We couldn't sign you in. Please try again." + "Try again" |
| Offline | E4 disabled; message "You're offline. Connect to sign in, or continue as a guest." |
| Already signed in | redirect to `next` or `/home` before render |
| Guest data exists | tiny line under E3: "Your progress on this device will be added to your account." |
| After success | Callback → `syncLocalData` → `/onboarding` if profile incomplete, else `next` or `/home` |

## Rules
Google is the only provider (decision 27). `next` must pass `safeNext` (same-origin paths only). No password, no email link. Document title "Sign in · Pagewise", `robots: noindex`. i18n prefix `auth.signIn.*`. Focus lands on E4 on load.

## Where every click goes
Logo → `/` · Back → previous page · Continue with Google → Google → callback · Continue as a guest → `next` or `/study` · Terms → `/legal/terms` · Privacy → `/legal/privacy`.
