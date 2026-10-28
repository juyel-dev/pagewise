# Blueprint · 11 · Architecture spec v1.0 → codebase mapping

Companion to `10-architecture-spec-v1.md`. Maps the locked spec onto the repo as of commit `ac51e62` (2026-10-28). Not an implementation authorization; the phased kickoff below needs owner approval.

## 1. Spec → current code

| Spec area | Current state | Verdict |
|---|---|---|
| Auth (Google-only, session) | Supabase OAuth + session lib; magic link removed | ✅ reusable |
| Onboarding (profile: year/target/language) | `/onboarding` post-auth form | ✅ reusable, becomes the post-auth step |
| **3-screen public intro** (spec §2, mock frames 1–3) | absent | 🆕 build (public, pre-auth carousel) |
| Application shell + navigation | top-bar shell `(app)` + `(study)`, hard-coded links | 🆕 **dark-sidebar shell + nav registry** (spec §6) |
| Home Page System | home is a plain page inside the shell | 🆕 **section-registry Home system** (spec §4); gets its own layout apart from feature pages |
| Study module | `features/study` + viewer + actions (owner-crafted) | ✅ reusable; **Continue Studying / Recent Chapters move here** (owner 2026-10-28); library merges into Study |
| Practice | embedded in workspace only | 🆕 standalone Practice page (page-wise MCQs) |
| Progress | DB tables exist, no page | 🆕 Progress page |
| Bookmarks | DB + workspace UI, no dedicated page | 🆕 Bookmarks page |
| Settings | exists | ✅ reuse, restyle in shell |
| Review / admin import | in student app | Admin moves to **separate app** (decision 30) — unchanged |
| Guest mode | shipped (decisions 28–29) | ✅ stays — **owner addendum after mock: guest mode retained** |
| Landing | content-heavy marketing page | 🏗 redesign to the mock's minimal hero; later spec §5 public sections when real content exists |
| Home sections 4–9 (leaderboard, badges, events, notices, affiliate, sponsored) | absent + no data model | 🅿️ parked — registry supports them; each gets its own spec + schema before build (spec §13/14, truth-in-copy D-13) |
| Design system | tokens + ui primitives + contrast script | ✅ reuse; add sidebar/cards/badges/notice primitives |
| Data | `0001`–`0006` migrations; attempts/progress/bookmarks/questions all present | ✅ mostly no schema change until module specs |

## 2. Compliance notes (vs spec acceptance criteria)

- Home isolation → met by (a) own route group + layout for Home, (b) typed section registry (`home.sections.config`), (c) sections composition via shared components only.
- Nav extensibility → `nav.config` single file; feature registers `{href,label,icon,roles?}`; shell renders it; no page edits.
- Public vs authenticated content boundaries → sections declare `visibility: public | auth`; server-side guards untouched; RLS stays the real authorization (never UI hiding alone).
- Guest mode → guests are signed-out users; every "authenticated Home" must degrade honestly (CTA sign-in) without leaking private data.

## 3. Proposed phased kickoff (needs owner approval — spec §14)

| Phase | Deliverable |
|---|---|
| P1 Shell | Dark-sider shell + nav registry, mobile drawer; move settings/home/library under it |
| P2 Home system | Home route group + section registry + first live sections: hero banner, Explore shortcuts, Today's goal, footer links (others parked honestly) |
| P3 Study hub | Continue Studying + Recent Chapters + progress summary here; library folded in; workspace untouched |
| P4 Practice + Progress + Bookmarks | three pages off existing tables |
| P5 Onboarding + landing | public 3-slide intro; landing restored to mock layout; sign-in polish; post-auth profile capture |
| P6 → | Leaderboard/badges/events/notices/affiliate/sponsors: each = separate mini-spec (schema + rules + consent) then build |

## 4. Owner addenda captured with this lock

1. Brand stays **PageWise** for now; domain `neet-aspirants.vercel.app` (can change later).
2. Continue Studying / Recent Chapters live in **Study**, not Home.
3. **Guest mode stays** even though the mock shows Google-only.
