# Jobify: Job and Internship Portal - Product Requirements Document & Technical Architecture

## 1. Overview & Core Objective
Jobify is a full-featured, responsive job and internship portal connecting candidates (students, fresh graduates, job seekers) with employers, governed by an administrative moderation layer.

## 2. Design System: Monochrome Pro Dark Edition
- **Main Background**: `#09090B` (zinc-950)
- **Card Background**: `#18181B` (zinc-900)
- **Elevated Surfaces / Modals**: `#27272A` (zinc-800)
- **Border Tone**: `#303036` / `#27272A`
- **Primary Text**: `#E4E4E7` (zinc-200)
- **Secondary Text**: `#A1A1AA` (zinc-400)
- **Primary Accent / Button**: `#FFFFFF` with `#09090B` text
- **Typography**: Inter / sans-serif with crisp hierarchy
- **Styling**: 12-16px rounded corners, minimal Lucide-style vector iconography, subtle transitions, no neon or excessive gradients. Natural color imagery preserved.

## 3. Scope of Key Core Screens
1. **Homepage & Discovery Portal**: Sticky navbar, hero search, category browser, featured internships & jobs, social proof & employer callout.
2. **Job & Internship Search with Multi-Facet Filters**: Category, remote/hybrid/on-site, experience level, salary range, sorting controls, empty states, and pagination/load-more.
3. **Job Details & Interactive Application Modal**: Comprehensive job spec, requirements, salary, similar vacancies, direct apply modal with PDF resume picker & cover note.
4. **Candidate Dashboard**: Profile completeness, applied jobs tracker (Submitted, Under Review, Shortlisted, Rejected, Hired), saved vacancies, resume management.
5. **Employer Workspace & Applicant Management**: Company profile, vacancy publisher, active vs expired tabs, pipeline applicant review & status update controls.
6. **Admin Moderation & Analytics Panel**: System stats, pending job approvals, reported listing moderation, user management overview.
7. **Database Schema & Row Level Security (Supabase PostgreSQL)**: Comprehensive SQL schema with `profiles`, `companies`, `jobs`, `applications`, `saved_jobs`, `reports`, triggers, and RLS policies.
