-- Foundry hackathon portal — schema + row level security
-- Run this once in your Supabase project's SQL editor.

-- ─────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────

-- 'hacker', 'judge', 'mentor', 'volunteer' are applicant types (each with
-- their own question set, see src/lib/questions.ts). 'organizer' is not a
-- fifth applicant type — it's the reviewer role; see docs/DECISIONS.md D1.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  type text not null check (type in ('hacker', 'judge', 'mentor', 'volunteer', 'organizer')),
  created_at timestamptz not null default now()
);

-- One application per account. `answers` is jsonb because each applicant
-- type asks different questions (see src/lib/questions.ts) — a fixed set
-- of columns would mean a lot of always-null columns per row.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null unique references public.profiles (id) on delete cascade,
  type text not null check (type in ('hacker', 'judge', 'mentor', 'volunteer', 'organizer')),
  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'accepted', 'waitlisted', 'rejected')),
  answers jsonb not null default '{}'::jsonb,
  score numeric check (score >= 0 and score <= 10),
  organizer_notes text,
  reviewed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Team formation board. Split out from `applications` because it's a
-- different concern (who wants to team up) that only applies to hackers
-- and changes independently of the application itself.
create table public.hacker_profiles (
  applicant_id uuid primary key references public.profiles (id) on delete cascade,
  skills text[] not null default '{}',
  bio text not null default '',
  looking_for_team boolean not null default true
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- unique(applicant_id) enforces "one team per hacker at a time" at the DB
-- level rather than relying on application code to check first.
create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  applicant_id uuid not null unique references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, applicant_id)
);

-- ─────────────────────────────────────────────────────────────
-- Helper: check organizer status without triggering recursive RLS
-- ─────────────────────────────────────────────────────────────

create function public.is_organizer(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and type = 'organizer'
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Row level security
-- ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.hacker_profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- profiles: you can see your own row; organizers can see everyone's
-- (needed to show applicant names on the review queue).
create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or public.is_organizer(auth.uid()));
create policy "profiles_insert" on public.profiles for insert
  with check (id = auth.uid());
create policy "profiles_update" on public.profiles for update
  using (id = auth.uid());

-- applications: applicants manage their own; organizers can read and
-- update any application (that's how reviewing/grading works).
create policy "applications_select" on public.applications for select
  using (applicant_id = auth.uid() or public.is_organizer(auth.uid()));
create policy "applications_insert" on public.applications for insert
  with check (applicant_id = auth.uid());
create policy "applications_update" on public.applications for update
  using (applicant_id = auth.uid() or public.is_organizer(auth.uid()));

-- hacker_profiles: any signed-in hacker can browse the team board, but
-- only edit their own row.
create policy "hacker_profiles_select" on public.hacker_profiles for select
  using (auth.role() = 'authenticated');
create policy "hacker_profiles_upsert" on public.hacker_profiles for insert
  with check (applicant_id = auth.uid());
create policy "hacker_profiles_update" on public.hacker_profiles for update
  using (applicant_id = auth.uid());

-- teams / team_members: any signed-in hacker can browse teams and
-- rosters; only the team creator can create a team, only a member can
-- remove themselves.
create policy "teams_select" on public.teams for select
  using (auth.role() = 'authenticated');
create policy "teams_insert" on public.teams for insert
  with check (created_by = auth.uid());

create policy "team_members_select" on public.team_members for select
  using (auth.role() = 'authenticated');
create policy "team_members_insert" on public.team_members for insert
  with check (applicant_id = auth.uid());
create policy "team_members_delete" on public.team_members for delete
  using (applicant_id = auth.uid());
