# JOBIFY — Find your next opportunity

A responsive job and internship portal built with React, TypeScript, Vite, Supabase Auth, PostgreSQL, RLS, and private Supabase Storage. The visual system follows the supplied **Monochrome Pro Dark** Jobify designs in `stitch_jobify_career_portal/`.

## Start locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Without Supabase environment variables, Jobify runs in **browser-local demo mode**: the sample vacancies are clearly marked demo, and local accounts, saved listings, demo applications, employer listings, profile data, and reports are stored only in that browser. This is for trying the product flow, not shared or durable storage. In demo mode, choose the explicit **Admin (demo)** role only to explore moderation.

Build and test the production bundle:

```bash
npm run build
npm run preview
```

## Connect Supabase (production data)

1. Create a Supabase project.
2. In **Project Settings → API**, copy the project URL and the **anon/public** key.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never put a service-role key in a `VITE_` variable or client code.
4. Run `supabase/migrations/001_jobify.sql` in the Supabase SQL Editor (or use the Supabase CLI). The migration creates the relational schema, signup profile/company trigger, indexes, RLS policies, and private PDF `resumes` storage bucket. If the project was set up before these fixes, also run `supabase/migrations/002_admin_fixes.sql` once; it adds the missing `jobs.requirements` column, the admin delete policies, and reloads the PostgREST schema cache.
5. Optionally run `supabase/seed.sql` for eight clearly identified sample vacancies. Seed companies and jobs have `is_demo=true` and are not verified opportunities.
6. Configure Supabase Auth email confirmation, redirect URLs, password reset redirects, and production site URL for your deployment.
7. Register an employer account to create its company profile; candidate and employer signups are supported. Employer listings begin as **pending** and become public only after moderation. Salary is optional and the sample roles without specified compensation display no figure.
8. To grant an administrator, use the Supabase SQL Editor with trusted project-owner access, for example:

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@your-domain.example';
   ```

   Signup metadata cannot create administrator accounts. Do not expose service-role credentials.

### Resume privacy

The migration creates a private `resumes` storage bucket, restricts objects to PDF files up to 10 MB, and limits access to the candidate and employers with the relevant application. Supabase-backed applications upload PDFs using a candidate/application-scoped object path and store that path in the application record. Review the supplied storage and RLS policies before changing access rules.

## Main workflows

- Public homepage, companies directory, internship listings, live keyword/location search, category/type/experience/work-arrangement/salary/date filters, sorting, empty states, and detail pages.
- Candidate authentication, editable profile, PDF resume upload, save/unsave, applications, and employer-controlled application status tracking.
- Employer account/company workspace, job submission for approval, listing closure, applicant list, and status updates.
- Admin-only listing moderation and report review. Promote admins through trusted project-owner access only.

## Deployment

Build with `npm run build`; publish the generated `dist/` directory. For Vercel, import this repository, set the framework to Vite, and add the two public Supabase environment variables from `.env.example`. Vite serves the SPA from `index.html`; the included Vercel configuration below provides clean-route fallback if direct page URLs are added later.

## Project structure

- `src/App.tsx` — responsive portal screens and user workflows
- `src/style.css` — shared Monochrome Pro Dark design system
- `src/data.ts` — explicitly labeled demo listings and category data
- `src/backend.ts` — Supabase operations plus browser-local demo fallback
- `supabase/migrations/001_jobify.sql` — production schema, triggers, storage, and RLS
- `supabase/migrations/002_admin_fixes.sql` — idempotent fixes for existing databases (missing `jobs.requirements`, admin delete policies, schema-cache reload)
- `supabase/seed.sql` — optional demo company and job records
- `stitch_jobify_career_portal/` — supplied visual references and design specification
