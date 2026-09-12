-- Run this once in the SQL editor of your existing (already-created)
-- Supabase project. Fixes the landing page always showing "0 applications
-- submitted so far" to logged-out visitors: RLS correctly restricts a
-- plain `select count(*)` to rows the current session can see (its own
-- application, or everything if organizer) - an anonymous visitor can see
-- none, so the count was always 0 regardless of the real total.
--
-- This function bypasses RLS via security definer, but only ever returns
-- a count, never row data - see supabase/schema.sql for the same pattern
-- already used for is_organizer().
--
-- (A brand-new project should just run supabase/schema.sql, which already
-- has this function baked in - this file is only for a DB that was set
-- up before this change.)

create function public.application_count()
returns bigint
language sql
security definer
stable
as $$
  select count(*) from public.applications;
$$;
