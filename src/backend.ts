import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { seedJobs, type Job } from './data';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;
export const isDemo = !supabase;

const get = (key: string, fallback: any) => { try { return JSON.parse(localStorage.getItem(`jobify_${key}`) || 'null') ?? fallback } catch { return fallback } };
const put = (key: string, value: any) => localStorage.setItem(`jobify_${key}`, JSON.stringify(value));
export type Account = { id: string; name: string; email: string; role: 'candidate' | 'employer' | 'admin'; company?: string };
export const getAccount = (): Account | null => get('account', null);

export async function signIn(email: string, password: string, role: 'candidate' | 'employer' | 'admin', name: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: profile } = await supabase.from('profiles').select('id,full_name,role,is_suspended').eq('id', data.user.id).single();
    if (!profile) throw new Error('Profile not found. Please register first.');
    if (profile.is_suspended) { await supabase.auth.signOut(); throw new Error('This account has been suspended. Contact Jobify support.'); }
    const account = { id: profile.id, name: profile.full_name || email.split('@')[0], email, role: profile.role };
    put('account', account); return account;
  }
  const accounts = get('accounts', {});
  if (accounts[email] && accounts[email].password !== password) throw new Error('Password does not match this local demo account.');
  const saved = accounts[email];
  if (saved?.suspended) throw new Error('This account has been suspended. Contact Jobify support.');
  const account: Account = saved ? { id: saved.id, name: saved.name, email, role: saved.role, company: saved.company } : { id: `local-${Date.now()}`, name: name || email.split('@')[0], email, role, company: role === 'employer' ? 'My Company' : undefined };
  accounts[email] = { ...account, password }; put('accounts', accounts); put('account', account); return account;
}

export async function registerAccount(email: string, password: string, role: 'candidate' | 'employer', name: string, company?: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role, company_name: company } } });
    if (error) throw error;
    if (!data.session) throw new Error('Check your email to confirm the account, then sign in.');
    const account = { id: data.user!.id, name, email, role, company }; put('account', account); return account;
  }
  const accounts = get('accounts', {});
  if (accounts[email]) throw new Error('An account with this email already exists. Sign in instead.');
  const account = { id: `local-${Date.now()}`, name, email, role, company }; accounts[email] = { ...account, password }; put('accounts', accounts); put('account', account); return account;
}

export async function signOut() { if (supabase) await supabase.auth.signOut(); localStorage.removeItem('jobify_account') }

export async function loadJobs(): Promise<Job[]> {
  if (supabase) {
    const { data, error } = await supabase.from('jobs').select('*, companies(name,logo_url)').eq('status', 'active').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((j: any) => ({
      ...j, company: j.companies?.name || 'Company', companyId: j.created_by, logo: j.companies?.name?.[0] || 'J',
      location: j.location, type: j.employment_type, arrangement: j.work_arrangement, level: j.experience_level,
      posted: new Date(j.created_at).toLocaleDateString(), description: j.description, responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [], requirements: j.requirements || j.qualifications || [], skills: j.skills || [], questions: j.application_questions || [], resubmission: j.allow_resubmission,
      salary: j.salary_min != null && j.salary_max != null ? `${j.salary_currency || 'PKR'} ${Number(j.salary_min).toLocaleString()}–${Number(j.salary_max).toLocaleString()} / month` : undefined,
      deadline: j.application_deadline, demo: j.is_demo, status: j.status
    }))
  }
  const jobs = get('jobs', seedJobs); return jobs.filter((j: Job) => j.status === 'active' || j.status === 'pending')
}

export async function saveJob(jobId: string, userId: string) {
  if (supabase) { const { error } = await supabase.from('saved_jobs').upsert({ job_id: jobId, candidate_id: userId }); if (error) throw error }
  const saved = get('saved', {}); saved[userId] = Array.from(new Set([...(saved[userId] || []), jobId])); put('saved', saved)
}
export async function unsaveJob(jobId: string, userId: string) {
  if (supabase) { const { error } = await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('candidate_id', userId); if (error) throw error }
  const saved = get('saved', {}); saved[userId] = (saved[userId] || []).filter((x: string) => x !== jobId); put('saved', saved)
}
export async function loadSavedJobs(userId: string): Promise<string[]> {
  if (supabase) {
    const { data, error } = await supabase.from('saved_jobs').select('job_id').eq('candidate_id', userId);
    if (error) throw error; const ids = (data || []).map((x: any) => x.job_id);
    const saved = get('saved', {}); saved[userId] = ids; put('saved', saved); return ids
  }
  return get('saved', {})[userId] || []
}
export const savedFor = (userId: string): string[] => get('saved', {})[userId] || [];

export async function applyToJob(jobId: string, account: Account, coverLetter: string, resumeFile: File | null, answers: Record<string, string> = {}) {
  if (supabase) {
    const appId = crypto.randomUUID(); let resumePath: string | null = null;
    if (resumeFile) {
      if (resumeFile.type !== 'application/pdf' || resumeFile.size > 10 * 1024 * 1024) throw new Error('Resume must be a PDF no larger than 10 MB.');
      const safeName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, '_'); resumePath = `${account.id}/${appId}/${safeName}`;
      const { error: uploadError } = await supabase.storage.from('resumes').upload(resumePath, resumeFile, { contentType: 'application/pdf', upsert: false });
      if (uploadError) throw uploadError;
    } else {
      const { data: profile } = await supabase.from('profiles').select('resume_path').eq('id', account.id).single();
      resumePath = profile?.resume_path || null;
    }
    const { error } = await supabase.from('applications').insert({ id: appId, job_id: jobId, candidate_id: account.id, cover_letter: coverLetter, resume_path: resumePath, answers });
    if (error) { if (resumePath && resumeFile) await supabase.storage.from('resumes').remove([resumePath]); throw error; }
    return
  }
  const apps = get('applications', []); const existing = apps.some((a: any) => a.jobId === jobId && a.candidateId === account.id);
  if (existing && !allJobs().find(j => j.id === jobId)?.resubmission) throw new Error('You have already applied to this vacancy.');
  apps.unshift({ id: `app-${Date.now()}`, jobId, candidateId: account.id, candidateName: account.name, candidateEmail: account.email, coverLetter, resumeName: resumeFile?.name || '', answers, status: 'Submitted', createdAt: new Date().toISOString() }); put('applications', apps)
}

export async function uploadProfileResume(account: Account, file: File) {
  if (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) throw new Error('Resume must be a PDF no larger than 10 MB.');
  if (!supabase) { localStorage.setItem('jobify_resume_name', file.name); return file.name }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_'); const path = `${account.id}/profile/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('resumes').upload(path, file, { contentType: 'application/pdf' });
  if (error) throw error;
  const { error: updateError } = await supabase.from('profiles').update({ resume_path: path }).eq('id', account.id);
  if (updateError) { await supabase.storage.from('resumes').remove([path]); throw updateError }
  return file.name
}

export async function requestPasswordReset(email: string) {
  if (!supabase) throw new Error('Password reset email is available after Supabase is configured. Demo accounts are stored only in this browser.');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }); if (error) throw error
}
export async function updatePassword(password: string) {
  if (!supabase) throw new Error('Configure Supabase to use password recovery.');
  const { error } = await supabase.auth.updateUser({ password }); if (error) throw error
}

export const applicationsFor = (userId: string): any[] => get('applications', []).filter((a: any) => a.candidateId === userId);

export async function createJobForEmployer(account: Account, form: Partial<Job> & {requirements?: string[]}) {
  if (supabase) {
    const { data: profile, error: profileError } = await supabase.from('profiles').select('company_id').eq('id', account.id).single();
    if (profileError || !profile?.company_id) throw new Error('Company profile is missing. Please complete employer registration.');
    const nums = (form.salary || '').match(/[0-9][0-9,]*/g)?.map(v => Number(v.replace(/,/g, ''))) || [];
    const { error } = await supabase.from('jobs').insert({
      company_id: profile.company_id, created_by: account.id, title: form.title, description: form.description,
      location: form.location, employment_type: form.type, work_arrangement: form.arrangement, experience_level: form.level,
      category: form.category, skills: form.skills || [], application_questions: form.questions || [],
      responsibilities: form.responsibilities || [], qualifications: form.qualifications || [], requirements: (form as any).requirements || form.qualifications || [],
      salary_min: nums[0] || null, salary_max: nums[1] || nums[0] || null, application_deadline: form.deadline || null,
      allow_resubmission: form.resubmission || false, status: 'pending'
    });
    if (error) throw error; return
  }
  const job = {
    ...form, id: `job-${Date.now()}`, company: account.company || account.name, logo: (account.company || account.name).slice(0, 1).toUpperCase(),
    posted: 'Just now', responsibilities: form.responsibilities || ['Work collaboratively with the team.'],
    qualifications: form.qualifications || ['Relevant experience or equivalent skills.'],
    requirements: (form as any).requirements || form.qualifications || ['Good communication skills','Team player','Eagerness to learn'],
    skills: form.skills || [], status: 'pending' as const,
    companyId: account.id, demo: false
  } as Job; const jobs = get('jobs', seedJobs); jobs.unshift(job); put('jobs', jobs)
}

export function addJob(job: Job) { const jobs = get('jobs', seedJobs); jobs.unshift(job); put('jobs', jobs) }
export function allJobs(): Job[] { return get('jobs', seedJobs) }

export async function getEmployerJobs(userId: string): Promise<Job[]> {
  if (supabase) {
    const { data, error } = await supabase.from('jobs').select('*, companies(name,logo_url)').eq('created_by', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((j: any) => ({
      ...j, id: j.id, company: j.companies?.name || 'Company', companyId: j.created_by, logo: j.companies?.name?.[0] || 'J',
      type: j.employment_type, arrangement: j.work_arrangement, level: j.experience_level, posted: new Date(j.created_at).toLocaleDateString(),
      salary: j.salary_min != null ? `${j.salary_currency} ${j.salary_min}–${j.salary_max}` : undefined, deadline: j.application_deadline,
      status: j.status, demo: j.is_demo, resubmission: j.allow_resubmission, responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [], requirements: j.requirements || j.qualifications || [], skills: j.skills || [], questions: j.application_questions || []
    }))
  }
  return allJobs().filter(j => j.companyId === userId)
}

export async function updateJob(id: string, changes: Partial<Job>) {
  if (supabase) {
    const update: any = {}; if (changes.status) update.status = changes.status;
    const { error } = await supabase.from('jobs').update(update).eq('id', id); if (error) throw error; return
  }
  const jobs = allJobs().map(j => j.id === id ? { ...j, ...changes } : j); put('jobs', jobs)
}

export async function updateEmployerListing(id: string, form: Partial<Job> & {requirements?: string[]}) {
  if (supabase) {
    const nums = (form.salary || '').match(/[0-9][0-9,]*/g)?.map(v => Number(v.replace(/,/g, ''))) || [];
    const { error } = await supabase.from('jobs').update({
      title: form.title, description: form.description, location: form.location, employment_type: form.type,
      work_arrangement: form.arrangement, experience_level: form.level, category: form.category, skills: form.skills || [],
      responsibilities: form.responsibilities || [], qualifications: form.qualifications || [], requirements: (form as any).requirements || [],
      application_questions: form.questions || [], salary_min: nums[0] || null, salary_max: nums[1] || nums[0] || null,
      application_deadline: form.deadline || null, allow_resubmission: form.resubmission || false
    }).eq('id', id);
    if (error) throw error; return
  }
  const jobs = allJobs().map(j => j.id === id ? { ...j, ...form } : j); put('jobs', jobs)
}

export function allApplications(): any[] { return get('applications', []) }

export async function getCandidateApplications(userId: string): Promise<any[]> {
  if (supabase) {
    const { data, error } = await supabase.from('applications').select('*, jobs(title,companies(name,logo_url,location))').eq('candidate_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((a: any) => ({ ...a, jobId: a.job_id, jobTitle: a.jobs?.title, company: a.jobs?.companies?.name, createdAt: a.created_at }))
  }
  return applicationsFor(userId)
}

export async function getEmployerApplications(userId: string): Promise<any[]> {
  if (supabase) {
    const { data, error } = await supabase.from('applications').select('*, jobs!inner(title,created_by,companies(name)), candidate:profiles!applications_candidate_id_fkey(full_name,email)').eq('jobs.created_by', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((a: any) => ({ ...a, jobId: a.job_id, candidateId: a.candidate_id, candidateName: a.candidate?.full_name, candidateEmail: a.candidate?.email, createdAt: a.created_at }))
  }
  const ids = allJobs().filter(j => j.companyId === userId).map(j => j.id); return allApplications().filter(a => ids.includes(a.jobId))
}

export async function updateApplication(id: string, status: string) {
  if (supabase) { const { error } = await supabase.from('applications').update({ status }).eq('id', id); if (error) throw error; return }
  const apps = allApplications().map(a => a.id === id ? { ...a, status } : a); put('applications', apps)
}

export async function getApplicationResume(path: string) {
  if (!supabase) throw new Error('Resume files are available after configuring private Supabase Storage.');
  const { data, error } = await supabase.storage.from('resumes').createSignedUrl(path, 60); if (error) throw error; return data.signedUrl
}

export async function saveCandidateProfile(userId: string, fields: any) {
  if (supabase) {
    const payload = { headline: fields.headline || '', education: fields.education || '', skills: String(fields.skills || '').split(',').map((x: string) => x.trim()).filter(Boolean), experience: fields.experience || '' };
    const { error } = await supabase.from('profiles').update(payload).eq('id', userId); if (error) throw error; return
  }
  put('profile', fields)
}

export async function loadCandidateProfile(userId: string) {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('full_name,headline,education,skills,experience,resume_path').eq('id', userId).single();
    if (error) throw error; return { ...data, name: data.full_name, skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills }
  }
  return get('profile', {})
}

export async function submitJobReport(jobId: string, account: Account, reason: string, details: string) {
  if (supabase) { const { error } = await supabase.from('reports').insert({ job_id: jobId, reporter_id: account.id, reason, details }); if (error) throw error; return }
  const reports = get('reports', []); reports.unshift({ id: `report-${Date.now()}`, jobId, reporter: account.name, reason, details, status: 'pending' }); put('reports', reports)
}

export async function getAdminJobs(): Promise<Job[]> {
  if (supabase) {
    const { data, error } = await supabase.from('jobs').select('*,companies(name)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((j: any) => ({
      ...j, company: j.companies?.name || 'Company', logo: j.companies?.name?.[0] || 'J', type: j.employment_type,
      arrangement: j.work_arrangement, level: j.experience_level, posted: new Date(j.created_at).toLocaleDateString(),
      status: j.status, demo: j.is_demo, resubmission: j.allow_resubmission, skills: j.skills || [], responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [], requirements: j.requirements || j.qualifications || [], questions: j.application_questions || [], description: j.description, title: j.title,
      location: j.location, category: j.category, created_by: j.created_by, company_id: j.company_id, salary: j.salary_min ? `${j.salary_currency} ${j.salary_min}–${j.salary_max}` : undefined
    }))
  }
  return allJobs()
}

export async function getJobReports() {
  if (supabase) { const { data, error } = await supabase.from('reports').select('*,jobs(title,companies(name))').order('created_at', { ascending: false }); if (error) throw error; return data || [] }
  return get('reports', [])
}

export async function getAdminCounts() {
  if (!supabase) return { users: Object.keys(get('accounts', {})).length, employers: Object.values(get('accounts', {})).filter((a: any) => a.role === 'employer').length, applications: allApplications().length, companies: 0, pending: allJobs().filter(j => j.status === 'pending').length, active: allJobs().filter(j => j.status === 'active').length, reports: get('reports', []).length };
  const [u, e, a, c, p, ac, r] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  if (u.error) throw u.error; if (e.error) throw e.error; if (a.error) throw a.error;
  return { users: u.count || 0, employers: e.count || 0, applications: a.count || 0, companies: c.count || 0, pending: p.count || 0, active: ac.count || 0, reports: r.count || 0 }
}

export async function updateJobReport(id: string, status: string) {
  if (supabase) {
    const { error } = await supabase.from('reports').update({ status, reviewed_by: (await supabase.auth.getUser()).data.user?.id, reviewed_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error; return
  }
  put('reports', get('reports', []).map((r: any) => r.id === id ? { ...r, status } : r))
}

export async function getAdminUsers() {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('id,full_name,email,role,is_suspended,headline,education,skills,experience,company_id,created_at,resume_path').order('created_at', { ascending: false });
    if (error) throw error; return data || []
  }
  return Object.values(get('accounts', {})).filter((a: any) => a.role !== 'admin').map((a: any) => ({ id: a.id, full_name: a.name, email: a.email, role: a.role, is_suspended: !!a.suspended }))
}

export async function setUserSuspended(userId: string, suspended: boolean) {
  if (supabase) { const { error } = await supabase.from('profiles').update({ is_suspended: suspended }).eq('id', userId); if (error) throw error; return }
  const accounts = get('accounts', {});
  for (const email of Object.keys(accounts)) { if (accounts[email].id === userId) accounts[email].suspended = suspended }
  put('accounts', accounts)
}

// --- NEW ADMIN FULL ACCESS FUNCTIONS ---

export async function getAdminCompanies() {
  if (supabase) {
    const { data, error } = await supabase.from('companies').select('*, owner:profiles!companies_owner_id_fkey(full_name,email,role), jobs:jobs(count)').order('created_at', { ascending: false });
    if (error) throw error;
    // get job counts per company separately if needed
    const { data: jobCounts } = await supabase.from('jobs').select('company_id');
    const counts: Record<string, number> = {};
    (jobCounts || []).forEach((j: any) => { counts[j.company_id] = (counts[j.company_id] || 0) + 1 });
    return (data || []).map((c: any) => ({ ...c, job_count: counts[c.id] || 0 }));
  }
  return get('companies', []).map((c: any) => ({ ...c, job_count: allJobs().filter(j => j.company === c.name).length }));
}

export async function getAdminApplications() {
  if (supabase) {
    const { data, error } = await supabase.from('applications').select('*, jobs(title,companies(name),created_by), candidate:profiles!applications_candidate_id_fkey(full_name,email,role,headline)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((a: any) => ({
      ...a, jobId: a.job_id, candidateId: a.candidate_id, jobTitle: a.jobs?.title, companyName: a.jobs?.companies?.name,
      candidateName: a.candidate?.full_name, candidateEmail: a.candidate?.email, createdAt: a.created_at
    }));
  }
  return allApplications().map((a: any) => ({ ...a, createdAt: a.createdAt || a.created_at }));
}

export async function adminDeleteJob(id: string) {
  if (supabase) { const { error } = await supabase.from('jobs').delete().eq('id', id); if (error) throw error; return }
  put('jobs', allJobs().filter(j => j.id !== id));
}

export async function adminUpdateCompany(id: string, fields: { name?: string; description?: string; website?: string; location?: string }) {
  if (supabase) { const { error } = await supabase.from('companies').update(fields).eq('id', id); if (error) throw error; return }
  const comps = get('companies', []); put('companies', comps.map((c: any) => c.id === id ? { ...c, ...fields } : c));
}

export async function adminDeleteCompany(id: string) {
  if (supabase) { const { error } = await supabase.from('companies').delete().eq('id', id); if (error) throw error; return }
  const comps = get('companies', []); put('companies', comps.filter((c: any) => c.id !== id));
}

export async function adminUpdateUserRole(userId: string, role: 'candidate' | 'employer' | 'admin') {
  if (supabase) { const { error } = await supabase.from('profiles').update({ role }).eq('id', userId); if (error) throw error; return }
  const accounts = get('accounts', {}); for (const email of Object.keys(accounts)) { if (accounts[email].id === userId) accounts[email].role = role } put('accounts', accounts);
}

export async function adminUpdateUser(userId: string, fields: { full_name?: string; email?: string; headline?: string; education?: string; experience?: string }) {
  if (supabase) { const { error } = await supabase.from('profiles').update(fields).eq('id', userId); if (error) throw error; return }
  // demo fallback
  const accounts = get('accounts', {});
  for (const email of Object.keys(accounts)) { if (accounts[email].id === userId) accounts[email] = { ...accounts[email], ...fields, name: fields.full_name || accounts[email].name } }
  put('accounts', accounts);
}

export async function adminDeleteApplication(id: string) {
  if (supabase) { const { error } = await supabase.from('applications').delete().eq('id', id); if (error) throw error; return }
  put('applications', allApplications().filter(a => a.id !== id));
}

export async function adminDeleteReport(id: string) {
  if (supabase) { const { error } = await supabase.from('reports').delete().eq('id', id); if (error) throw error; return }
  put('reports', get('reports', []).filter((r: any) => r.id !== id));
}

export async function adminUpdateJobFull(id: string, form: Partial<Job> & {requirements?: string[]}) {
  if (supabase) {
    const nums = (form.salary || '').match(/[0-9][0-9,]*/g)?.map(v => Number(v.replace(/,/g, ''))) || [];
    const { error } = await supabase.from('jobs').update({
      title: form.title, description: form.description, location: form.location,
      employment_type: form.type, work_arrangement: form.arrangement, experience_level: form.level,
      category: form.category, skills: form.skills || [], responsibilities: form.responsibilities || [],
      qualifications: form.qualifications || [], requirements: (form as any).requirements || [],
      application_questions: form.questions || [],
      salary_min: nums[0] || null, salary_max: nums[1] || nums[0] || null,
      application_deadline: form.deadline || null, allow_resubmission: form.resubmission || false, status: form.status || undefined
    }).eq('id', id);
    if (error) throw error; return
  }
  const jobs = allJobs().map(j => j.id === id ? { ...j, ...form } : j); put('jobs', jobs)
}
