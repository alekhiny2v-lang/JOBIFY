-- JOBIFY database schema — run in the Supabase SQL editor or with `supabase db push`.
create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('candidate','employer','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.job_status as enum ('pending','active','closed','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.application_status as enum ('Submitted','Under Review','Shortlisted','Rejected','Hired'); exception when duplicate_object then null; end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references auth.users(id) on delete set null,
  name text not null unique,
  description text,
  website text,
  location text,
  logo_url text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'candidate',
  is_suspended boolean not null default false,
  full_name text not null default '',
  email text,
  headline text,
  education text,
  skills text[] not null default '{}',
  experience text,
  resume_path text,
  company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) >= 30),
  responsibilities text[] not null default '{}',
  qualifications text[] not null default '{}',
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  application_questions text[] not null default '{}',
  category text not null,
  location text not null,
  employment_type text not null check (employment_type in ('Internship','Full-time','Entry-level','Part-time','Contract')),
  work_arrangement text not null check (work_arrangement in ('Remote','Hybrid','On-site')),
  experience_level text not null default 'Entry-level',
  salary_min numeric(12,2) check (salary_min is null or salary_min >= 0),
  salary_max numeric(12,2) check (salary_max is null or salary_max >= 0),
  salary_currency text not null default 'PKR',
  application_deadline date,
  allow_resubmission boolean not null default false,
  status public.job_status not null default 'pending',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (salary_min is null or salary_max is null or salary_max >= salary_min)
);
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text not null default '',
  resume_path text,
  answers jsonb not null default '{}'::jsonb,
  status public.application_status not null default 'Submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.saved_jobs (
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(candidate_id,job_id)
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'pending' check(status in ('pending','reviewed','dismissed','actioned')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz
);
create index if not exists jobs_search_idx on public.jobs using gin (to_tsvector('english', title || ' ' || description || ' ' || category || ' ' || location));
create index if not exists jobs_active_created_idx on public.jobs(status, created_at desc);
create index if not exists jobs_company_idx on public.jobs(company_id,status);
create index if not exists applications_candidate_idx on public.applications(candidate_id,created_at desc);
create index if not exists applications_candidate_job_idx on public.applications(candidate_id,job_id);
create index if not exists applications_job_status_idx on public.applications(job_id,status);
create index if not exists reports_status_idx on public.reports(status,created_at desc);

create or replace function public.is_account_active() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and is_suspended=false)
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin'::public.user_role and is_suspended=false)
$$;
create or replace function public.is_job_owner(target_job uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.jobs j where j.id=target_job and j.created_by=auth.uid())
$$;
create or replace function public.current_user_role() returns public.user_role language sql stable security definer set search_path=public as $$
 select role from public.profiles where id=auth.uid()
$$;
create or replace function public.current_user_company() returns uuid language sql stable security definer set search_path=public as $$
 select company_id from public.profiles where id=auth.uid()
$$;
create or replace function public.can_employer_update_job(target_job uuid,new_status public.job_status) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.jobs j where j.id=target_job and j.created_by=auth.uid() and public.is_account_active() and ((j.status='active' and new_status in ('active','closed')) or (j.status='pending' and new_status in ('pending','closed')) or (j.status='closed' and new_status='closed')))
$$;
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['companies','profiles','jobs','applications'] loop execute format('drop trigger if exists touch_%I_updated_at on public.%I',t,t); execute format('create trigger touch_%I_updated_at before update on public.%I for each row execute function public.touch_updated_at()',t,t); end loop; end $$;

-- Signup metadata may request only candidate/employer. Administrator must be assigned by a trusted operator.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare desired_role public.user_role; company_record uuid;
begin
  desired_role := case when new.raw_user_meta_data->>'role'='employer' then 'employer'::public.user_role else 'candidate'::public.user_role end;
  if desired_role='employer' and nullif(trim(new.raw_user_meta_data->>'company_name'),'') is not null then
    insert into public.companies(owner_id,name) values(new.id,trim(new.raw_user_meta_data->>'company_name')) returning id into company_record;
  end if;
  insert into public.profiles(id,role,full_name,email,company_id)
  values(new.id,desired_role,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,company_record)
  on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created_jobify on auth.users;
create trigger on_auth_user_created_jobify after insert on auth.users for each row execute function public.handle_new_user();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Public read companies" on public.companies;
create policy "Public read companies" on public.companies for select using (true);
create policy "Employer manages own company" on public.companies for update using((owner_id=auth.uid() and public.is_account_active()) or public.is_admin()) with check((owner_id=auth.uid() and public.is_account_active()) or public.is_admin());
create policy "Employer creates own company" on public.companies for insert with check(owner_id=auth.uid() and public.is_account_active() and (select role from public.profiles where id=auth.uid())='employer');
create policy "Admins manage companies" on public.companies for all using(public.is_admin()) with check(public.is_admin());

create policy "Profiles visible to self, relevant employers, admins" on public.profiles for select using (
 (id=auth.uid() and public.is_account_active()) or public.is_admin() or (public.is_account_active() and exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.candidate_id=profiles.id and j.created_by=auth.uid()))
);
create policy "Users create own profile" on public.profiles for insert with check(id=auth.uid() and role in ('candidate','employer'));
create policy "Users update own profile fields" on public.profiles for update using(id=auth.uid() or public.is_admin()) with check((id=auth.uid() and public.is_account_active() and role=public.current_user_role() and company_id is not distinct from public.current_user_company() and (resume_path is null or resume_path like auth.uid()::text || '/%')) or public.is_admin());

create policy "Public read active jobs" on public.jobs for select using(status='active' or (created_by=auth.uid() and public.is_account_active()) or public.is_admin());
create policy "Employer creates own listing" on public.jobs for insert with check(created_by=auth.uid() and public.is_account_active() and status='pending' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='employer' and p.company_id=jobs.company_id));
create policy "Employer updates own listing" on public.jobs for update using((created_by=auth.uid() and public.is_account_active()) or public.is_admin()) with check(public.can_employer_update_job(id,status) or public.is_admin());
create policy "Admin moderates jobs" on public.jobs for all using(public.is_admin()) with check(public.is_admin());

create policy "Candidates read own applications; employers read relevant" on public.applications for select using((candidate_id=auth.uid() and public.is_account_active()) or public.is_admin() or (public.is_account_active() and public.is_job_owner(job_id)));
create policy "Candidates apply to active open jobs" on public.applications for insert with check(candidate_id=auth.uid() and public.is_account_active() and public.current_user_role()='candidate' and status='Submitted' and (resume_path is null or resume_path like auth.uid()::text || '/%') and exists(select 1 from public.jobs j where j.id=job_id and j.status='active' and (j.application_deadline is null or j.application_deadline>=current_date) and (j.allow_resubmission or not exists(select 1 from public.applications a where a.job_id=j.id and a.candidate_id=auth.uid()))));
create policy "Employer/admin updates application status" on public.applications for update using((public.is_account_active() and public.is_job_owner(job_id)) or public.is_admin()) with check((public.is_account_active() and public.is_job_owner(job_id)) or public.is_admin());
create policy "Admins delete applications" on public.applications for delete using(public.is_admin());

create policy "Candidates manage own saved jobs" on public.saved_jobs for all using((candidate_id=auth.uid() and public.is_account_active() and public.current_user_role()='candidate') or public.is_admin()) with check((candidate_id=auth.uid() and public.is_account_active() and public.current_user_role()='candidate') or public.is_admin());
create policy "Users submit reports" on public.reports for insert with check(reporter_id=auth.uid() and public.is_account_active());
create policy "Reporter and admins read reports" on public.reports for select using((reporter_id=auth.uid() and public.is_account_active()) or public.is_admin());
create policy "Admins moderate reports" on public.reports for update using(public.is_admin()) with check(public.is_admin());
create policy "Admins delete reports" on public.reports for delete using(public.is_admin());

-- Create private resume storage bucket. Resume object path: <candidate-auth-uid>/<application-uuid>/<filename>.pdf
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('resumes','resumes',false,10485760,array['application/pdf']) on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['application/pdf'];
drop policy if exists "Candidate uploads own resume" on storage.objects;
create policy "Candidate uploads own resume" on storage.objects for insert to authenticated with check(bucket_id='resumes' and public.is_account_active() and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='candidate'));
drop policy if exists "Candidate and relevant employer reads resume" on storage.objects;
create policy "Candidate and relevant employer reads resume" on storage.objects for select to authenticated using(bucket_id='resumes' and (((storage.foldername(name))[1]=auth.uid()::text and public.is_account_active()) or public.is_admin() or (public.is_account_active() and exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.resume_path=name and j.created_by=auth.uid()))));
drop policy if exists "Candidate deletes own resume" on storage.objects;
create policy "Candidate deletes own resume" on storage.objects for delete to authenticated using(bucket_id='resumes' and public.is_account_active() and (storage.foldername(name))[1]=auth.uid()::text);

-- To grant administrator access, use the Supabase SQL editor as a trusted project owner:
-- update public.profiles set role='admin' where email='admin@example.com';
