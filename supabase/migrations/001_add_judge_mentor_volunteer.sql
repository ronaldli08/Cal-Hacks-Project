-- Run this once in the SQL editor of your existing (already-created)
-- Supabase project — it updates the live check constraints to allow the
-- new applicant types without touching any existing rows.
--
-- (A brand-new project should just run supabase/schema.sql, which already
-- has these values baked in — this file is only for a DB that was set up
-- before this change.)

alter table public.profiles drop constraint profiles_type_check;
alter table public.profiles add constraint profiles_type_check
  check (type in ('hacker', 'judge', 'mentor', 'volunteer', 'organizer'));

alter table public.applications drop constraint applications_type_check;
alter table public.applications add constraint applications_type_check
  check (type in ('hacker', 'judge', 'mentor', 'volunteer', 'organizer'));
