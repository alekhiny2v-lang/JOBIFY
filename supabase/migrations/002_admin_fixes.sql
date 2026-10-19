-- Fixes for databases that were created from 001_jobify.sql before these changes.
-- Safe to run more than once. Run this in the Supabase SQL editor.

-- 1) The admin panel previously embedded the company owner with
--    `owner:profiles!companies_owner_id_fkey(...)`. That embed can never resolve:
--    companies.owner_id references auth.users(id), not public.profiles, so PostgREST
--    answered with:
--      "Could not find a relationship between 'companies' and 'profiles' in the schema cache"
--    The client now fetches owner profiles with a separate query, so no schema change is
--    required for that error. (Do not point owner_id at profiles: the signup trigger creates
--    the company before the profile row exists.) The cache reload at the bottom of this file
--    makes PostgREST pick up any relationship changes.

-- 2) jobs.requirements is written by the app when an employer creates or edits a listing,
--    but it was missing from 001. Supabase reported the same style of error:
--      "Could not find the 'requirements' column of 'jobs' in the schema cache"
alter table public.jobs add column if not exists requirements text[] not null default '{}';

-- 3) Admin delete buttons for applications and reports had no DELETE policy, so the
--    deletes silently matched 0 rows and the rows reappeared after reload.
drop policy if exists "Admins delete applications" on public.applications;
create policy "Admins delete applications" on public.applications for delete using (public.is_admin());

drop policy if exists "Admins delete reports" on public.reports;
create policy "Admins delete reports" on public.reports for delete using (public.is_admin());

-- 4) Ask PostgREST to reload its schema cache so new columns/policies are visible
--    immediately instead of waiting for the next automatic reload.
notify pgrst, 'reload schema';
