# Foundry — Hackathon Application Portal

A miniature version of a hackathon management platform: applicants sign up
as a **hacker** or an **organizer**, fill out an application backed by a
real database, and organizers review, score, and decide on every
application. Hackers also get a team formation board to find teammates.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth) via `@supabase/ssr`
- Deployed on Vercel

## How the account types work

There are five account types on `profiles.type`: four applicant types —
**hacker**, **judge**, **mentor**, **volunteer** — each with their own
application questions, and a separate **organizer** type that isn't an
applicant at all. There's no separate "admin" account to seed manually:
signing up as an organizer *is* how you get reviewer access — an organizer
submits their own short application (background, expertise, availability)
and immediately gets access to the review queue. Judge is a real applicant
type here (someone who judges demos/projects at the event), distinct from
organizer (someone who reviews applications during intake) — see D1 in
`docs/DECISIONS.md` for why those got split apart. Every applicant type
lands on the same `/dashboard` after applying; only hackers additionally
see the team board. `profiles.type` is the single source of truth every
page checks to decide what to show.

## Data model

- `profiles` — one row per account; `type` is `hacker`, `judge`, `mentor`,
  `volunteer`, or `organizer`.
- `applications` — one row per account (`applicant_id` is unique). Answers
  are stored as `jsonb` because each type asks different questions
  (see `src/lib/questions.ts`) — a fixed-column schema would mean a lot of
  always-null columns. `status`, `score`, and `organizer_notes` live on the
  same row since they're set together during review.
- `hacker_profiles` — team-board specific data (skills, bio, looking for a
  team). Split out from `applications` because it's a different concern
  that only applies to hackers and changes on its own schedule.
- `teams` / `team_members` — a hacker creates a team (gets a join code) or
  joins one with a code. `team_members.applicant_id` is unique, so the
  database enforces "one team at a time" instead of relying on app code.

Full schema + row-level security policies are in `supabase/schema.sql`.
RLS is the actual access control: applicants can only read/write their own
application; a Postgres function `is_organizer()` (marked
`security definer` to avoid recursive policy checks) lets organizers read
and update every application, which is what powers the review queue.

## Local setup

1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`.
3. In **Authentication → Providers → Email**, turn **off** "Confirm email"
   so signups get a session immediately (simpler for a demo — see
   Trade-offs below).
4. Copy `.env.local.example` to `.env.local` and fill in your project URL
   and anon key (Settings → API).
5. `npm install`
6. `npm run dev` and visit `http://localhost:3000`.

## Deploying

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
   Environment Variables in the Vercel project settings.
4. Deploy.

## Design notes

Palette and type were chosen for a builder/engineering audience rather than
a generic SaaS look: `Space Grotesk` for display type and stat numbers,
`IBM Plex Sans` for body text, a sage-paper background with forest-green
ink and a coral accent for primary actions. Status badges (submitted /
under review / accepted / waitlisted / rejected) use color consistently
across the applicant dashboard and the organizer queue so state is
recognizable at a glance in both places.

## Trade-offs, given the timeline

- Email confirmation is off so the demo doesn't depend on inbox access.
  In production you'd leave it on and create the `profiles` row from a
  server-side auth webhook instead of right after client-side `signUp()`.
- RLS is row-level, not column-level: an organizer's `UPDATE` policy on
  `applications` technically allows changing `answers`, not just
  `status`/`score`/`notes`. The app's UI never does this, but a stricter
  version would split review fields into their own table with their own
  policy.
- No email notifications on status change — noted as a natural next
  feature but out of scope for the time available.
