@AGENTS.md

# CLAUDE.md

## What this is

Foundry — a miniature hackathon application portal, built against the
brief in `docs/ASSIGNMENT.md`. Applicants sign up as a **hacker** or an
**organizer**, submit a database-backed application, and organizers review
and grade every application. Hackers also get a team formation board.

The original deadline was 5:00 PM the same day this was built — several
choices below are explicitly time-boxed trade-offs, not "the right
long-term answer." They're flagged as such in `docs/DECISIONS.md`.

**Read `docs/DECISIONS.md` before making architectural changes.** It's a
decision log with a status on every entry — `LOCKED (user)` means don't
change it without asking, `DEFAULT` means it was a reasonable call under
time pressure and is genuinely open to revisit, `TRADEOFF` means it was a
known corner cut for the deadline. A generic `/init`-style scan of this
codebase will tell you *what* exists; it won't tell you which parts were a
deliberate choice vs. which parts are just what was fastest — that
distinction lives in that file.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, Supabase (Postgres +
Auth via `@supabase/ssr`), deployed on Vercel. This matches what the
assignment brief suggested — see `docs/ASSIGNMENT.md`.

## The one thing to understand before touching auth/roles

There are exactly two account types, `hacker` and `organizer`
(`profiles.type`), and **organizer is not "judge" renamed as a cosmetic
choice** — it's a deliberate merge of the applicant-type "judge" with the
reviewer/admin role. Signing up as an organizer *is* how you get
review/grading access; there's no separate seeding step. Full reasoning
in `docs/DECISIONS.md`, entry D1 — read it before adding a third role or
an admin flag.

## Where the reasoning lives

- **`docs/ASSIGNMENT.md`** — the original brief, verbatim: requirements,
  judging criteria, deadline. Ground truth for what was actually required
  vs. what was a design choice on top of it.
- **`docs/DECISIONS.md`** — decision log. What we chose, why, what else
  was considered, and how locked-in each choice is. Start here.
- **`docs/DESIGN.md`** — visual design rationale (palette, type, layout
  principles), so a reskin doesn't accidentally regress into generic
  Tailwind-default patterns.
- **`README.md`** — the "how": local setup, running the SQL schema,
  deploying. Not the "why."

## Data model, at a glance

- `profiles` — one row per account, `type` is `'hacker' | 'organizer'`.
- `applications` — one row per account (unique `applicant_id`). Answers are
  `jsonb` because the two types ask different questions
  (`src/lib/questions.ts`).
- `hacker_profiles` — team-board data (skills, bio, looking-for-team),
  split out from `applications` deliberately (D4).
- `teams` / `team_members` — join-code based team formation; DB enforces
  one team per hacker via a unique constraint (D5-adjacent).

Full schema + RLS policies: `supabase/schema.sql`. RLS is the actual access
control (not app-layer checks) — see D6/D7 in the decision log for the
`is_organizer()` function and its known limitation.

## Current status (as of hand-off)

- All routes/pages listed below are implemented: `/`, `/login`, `/signup`,
  `/apply`, `/dashboard`, `/teams`, `/organizer`, `/organizer/[id]`.
- Type-checked (`tsc --noEmit`) clean and `next build` verified successful.
- **Not yet done:** connected to a real Supabase project (schema hasn't
  been run against a live DB), not yet deployed to Vercel, no end-to-end
  test against real auth, no demo video recorded.
- GitHub/Supabase/Vercel accounts already exist for this project (per the
  person building it) — setup docs assume you're creating a *new* Supabase
  project and Vercel import, not new accounts.

## Explicitly open for you to change

Everything tagged `DEFAULT` in `docs/DECISIONS.md` (D3, D4, D9, D10, D11,
D12) was Claude's call, not a hard requirement — feel free to push back on
any of it. Everything tagged `LOCKED (user)` (D1, D2) was a specific choice
made by the person building this; check in before undoing it. Everything
tagged `TRADEOFF` (D7, D8) is a known, intentional corner cut for the
deadline — safe to leave as-is for the submission, worth fixing first if
this continues past it.
