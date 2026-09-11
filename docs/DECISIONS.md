# Decision log

Each entry: what we decided, why, what else we considered, and — most
importantly — a **status** flag. Read the status before changing anything:

- **LOCKED (user)** — the person building this explicitly chose this. Don't
  change it without asking; if a "cleaner" refactor would undo it, say so
  and ask first instead of just doing it.
- **DEFAULT (Claude's call)** — a reasonable choice made under time
  pressure to keep moving, not a hard requirement. Open to revisit, but
  understand the reasoning below before replacing it, since the
  replacement should solve the same problem, not reintroduce it.
- **TRADEOFF (time-boxed)** — a corner cut specifically because of the
  same-day deadline in docs/ASSIGNMENT.md. Fine for the submission, but
  flagged as the first thing to fix if this becomes a real project.

---

### D1. Two applicant types: Hacker + Organizer (not Judge/Mentor/Volunteer)
**Status: LOCKED (user)**

The assignment allows picking any two of hacker/judge/mentor/volunteer. We
picked hacker + organizer, where "organizer" is *not* one of the four
listed options — it's a deliberate rename/merge of "judge" with the
reviewer role.

**Why:** In this design there is no separate admin/reviewer role layered on
top of an applicant type. Signing up as an "organizer" *is* how you get
review/grading access — an organizer submits their own short application
(background, expertise, availability) and gets immediate access to the
review queue, modeling the real fact that the people organizing this
hackathon are also the ones judging it. This also removes any need for a
manual seeding step (service-role script, hand-edited SQL to flag an
admin) — the whole "how does anyone become an organizer" question is
answered by the signup flow itself.

**Alternatives considered:** hacker + judge as two applicant types, with a
third, separately-provisioned "organizer/admin" role that reviews both.
Rejected because it needs an out-of-band way to create that first admin
account, which is exactly the kind of setup friction not worth the time.

**If you're tempted to change this:** don't reintroduce a `judge` type or
an `is_admin`/`is_organizer` flag bolted onto `profiles` — `profiles.type`
(`'hacker' | 'organizer'`) is meant to be the single source of truth. If
mentor/volunteer types get added later, decide which "side" (hacker-like
applicant flow vs. organizer-like reviewer flow) they belong to rather than
inventing a third parallel UI.

---

### D2. Extra feature: Team Formation Board
**Status: LOCKED (user)**

Chosen from a shortlist (organizer analytics dashboard / AI-assisted
scoring / applicant status tracker / team formation board). Hackers set
skills + bio + a "looking for team" toggle, browse others in the same
state, and create or join a team via a join code.

**Why this one:** it's the feature actual applicants (not just organizers)
get direct value from, and it's a natural companion to the "hacker" side
of the app rather than a nice-to-have analytics layer for organizers.

---

### D3. `applications.answers` is `jsonb`, not fixed columns
**Status: DEFAULT (open to revisit)**

Hacker and organizer applications ask different questions
(`src/lib/questions.ts`). A fixed-column schema would need every column
nullable for whichever type didn't answer it, and adding a question would
mean a migration.

**Trade-off accepted:** you lose DB-level type/required-field enforcement
on individual answers — that validation currently lives only in the form
(`ApplyForm.tsx`) and isn't re-checked server-side. Fine for a hackathon
project; worth adding a server-side check (or moving to a validated schema
per type) before this handles real applicant data.

---

### D4. `hacker_profiles` is a separate table from `applications`
**Status: DEFAULT (open to revisit)**

Team-board data (skills, bio, looking-for-team) could have lived inside
`applications.answers` for hackers. It's a separate table instead.

**Why:** it's a different concern that changes on its own schedule — a
hacker might update their team status after their application is already
locked/decided, and organizers reviewing an application shouldn't see
"looking for team" mixed into application answers.

---

### D5. One application per account (`applications.applicant_id` is unique)
**Status: DEFAULT, but fairly load-bearing**

The whole `/apply` → `/dashboard` or `/organizer` redirect logic (D9)
assumes exactly zero or one application per account. Supporting multiple
applications per account (e.g., re-applying next year) would need
rethinking that routing, not just a schema change.

---

### D6. `is_organizer()` Postgres function, marked `security definer`
**Status: technical necessity, not really optional**

The `profiles` RLS select policy needs to let organizers read every
profile. Checking that with a subquery *on the `profiles` table itself*
inside a `profiles` policy is a recursive RLS check. `is_organizer()` is
`security definer` so it bypasses RLS when it runs, breaking the
recursion. If you refactor the roles system, keep some equivalent
mechanism — don't just inline a `select ... from profiles` into a
`profiles` policy.

---

### D7. RLS is row-level only, not column-level
**Status: TRADEOFF (time-boxed) — see also README.md**

An organizer's `UPDATE` policy on `applications` technically permits
changing `answers`, not just `status`/`score`/`organizer_notes`. The app's
UI never does this, but the database doesn't stop a direct API call from
doing it either. Fixing this properly means splitting review fields
(`status`, `score`, `organizer_notes`, `reviewed_by`) into their own table
with their own policy, which was cut for time.

---

### D8. Email confirmation is disabled in Supabase Auth
**Status: TRADEOFF (time-boxed) — see also README.md**

Turned off so `signUp()` returns a session immediately and the client can
insert the matching `profiles` row right away (RLS requires
`auth.uid()` to match, which needs an active session). With confirmation
on, there'd be a gap between account creation and profile creation.

**Right way to do this in production:** leave confirmation on, and create
the `profiles` row from a server-side auth webhook/trigger instead of from
the client right after `signUp()`.

---

### D9. `/apply` is a centralized post-auth router
**Status: DEFAULT (open to revisit)**

Both `LoginForm` and `SignupForm` just push to `/apply` regardless of
account state. `/apply`'s Server Component then checks: no application yet
→ show the form; application exists → redirect to `/dashboard` (hacker) or
`/organizer` (organizer).

**Why:** "where does this user go next" logic lives in exactly one place
instead of being duplicated in both the login and signup flows.

---

### D10. Mutations use Next.js Server Actions, not API routes
**Status: DEFAULT (low-stakes to change)**

Team creation/joining and application review (`teams/actions.ts`,
`organizer/actions.ts`) are Server Actions wired straight into
`<form action={...}>`, not fetch calls to route handlers. Idiomatic for
App Router, avoids extra client-side JS/state for simple form
submissions. No strong reason not to convert to route handlers if a future
feature needs a JSON API (e.g., a mobile client).

---

### D11. Middleware only refreshes the auth session; role checks live in pages
**Status: DEFAULT (open to revisit)**

`src/middleware.ts` just keeps the Supabase session cookie fresh. Deciding
"can a hacker see `/organizer`?" happens inside each protected page's
Server Component (fetch profile, check `.type`, redirect if wrong).

**Why:** simpler to reason about than doing the same DB join inside edge
middleware for every request. Trade-off: the role check is duplicated
across pages (`/dashboard`, `/teams`, `/organizer`, `/organizer/[id]`)
instead of centralized. Worth consolidating into a shared helper
(`requireProfile(type)`) if more protected pages get added.

---

### D12. Visual design system (see docs/DESIGN.md for full rationale)
**Status: DEFAULT (purely aesthetic, freely open to revisit)**

Brand name "Foundry," sage/forest/coral palette, Space Grotesk + IBM Plex
Sans. Chosen deliberately to avoid generic "AI-generated" Tailwind
defaults (cream + terracotta, dark + neon, rounded-card-with-shadow kit —
see docs/DESIGN.md for the full list of what was avoided and why). If
reskinning, it's the *principles* in docs/DESIGN.md worth preserving, not
necessarily the exact hex values.
