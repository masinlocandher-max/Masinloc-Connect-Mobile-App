import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ExternalLink,
  FileText,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  getCareerProfile,
  getJobProviders,
  getLiveJobs,
  getResumeVersions,
  getSavedJobs,
  saveSignatureResume,
  toggleSavedJob,
} from '../lib/platform.js';
import { EmptyState, ScreenTitle, SearchField, formatDate } from '../components/UI.jsx';

const EMPTY_RESUME = {
  name: 'Signature Resume',
  full_name: '',
  current_location: '',
  target_role: '',
  skills: '',
  profile_summary: '',
  availability: '',
};

function isRemote(job) {
  return /remote|work from home|wfh|online/i.test(`${job.work_setup || ''} ${job.employment_type || ''}`);
}

function isMasinloc(job) {
  return /masinloc/i.test(job.location || '');
}

function isOpenJob(job) {
  if (!job.closing_date) return true;
  const closingTime = new Date(job.closing_date).getTime();
  return !Number.isFinite(closingTime) || closingTime >= Date.now();
}

function JobCard({ job, provider, saved, onSave }) {
  const providerLabel = provider?.attribution_label || provider?.name || 'Trusted Job Provider';
  const verified = ['verified', 'live'].includes(job.verification_status);

  return <article className="job-card job-card-v2">
    <div className="job-top">
      <div>
        <div className="job-badge-row">
          <span>{job.work_setup || job.employment_type || 'Opportunity'}</span>
          {verified ? <b><ShieldCheck size={13} /> Verified source</b> : null}
        </div>
        <h2>{job.title}</h2>
        <p className="job-company">{job.company}</p>
      </div>
      <button className={saved ? 'save-button saved' : 'save-button'} type="button" onClick={() => onSave(job.id)} aria-label={saved ? 'Remove saved job' : 'Save job'}>
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </div>

    <div className="job-details-grid">
      {job.location ? <span><MapPin size={14} /><b>Location</b>{job.location}</span> : null}
      {job.employment_type ? <span><BriefcaseBusiness size={14} /><b>Type</b>{job.employment_type}</span> : null}
      {job.salary_text ? <span><Banknote size={14} /><b>Pay</b>{job.salary_text}</span> : null}
      {job.closing_date ? <span><CalendarDays size={14} /><b>Closes</b>{formatDate(job.closing_date)}</span> : null}
    </div>

    {job.description_excerpt ? <p className="job-description">{job.description_excerpt}</p> : null}
    {job.requirements_excerpt ? <div className="job-requirements"><strong>What they’re looking for</strong><p>{job.requirements_excerpt}</p></div> : null}

    <div className="job-footer">
      <small><Check size={12} /> {providerLabel}{job.published_at ? ` · ${formatDate(job.published_at)}` : ''}</small>
      {job.apply_url ? <button type="button" onClick={() => window.open(job.apply_url, '_blank', 'noopener,noreferrer')}>Apply <ExternalLink size={14} /></button> : null}
    </div>
  </article>;
}

function ResumePanel({ user, requireAccount }) {
  const [career, setCareer] = useState({ status: 'idle', profile: null, versions: [], error: null });
  const [form, setForm] = useState(EMPTY_RESUME);
  const [saveState, setSaveState] = useState('idle');

  const load = useCallback(async () => {
    if (!user) return;
    setCareer((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const [profile, versions] = await Promise.all([getCareerProfile(user.id), getResumeVersions(user.id)]);
      setCareer({ status: 'ready', profile, versions, error: null });
      setForm({
        name: versions[0]?.name || 'Signature Resume',
        full_name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
        current_location: profile?.current_location || '',
        target_role: profile?.target_roles?.[0] || '',
        skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : '',
        profile_summary: profile?.profile_summary || '',
        availability: profile?.availability || '',
      });
    } catch (error) {
      setCareer({ status: 'error', profile: null, versions: [], error });
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) return <section className="resume-locked-panel">
    <span><UserRound size={28} /></span>
    <div><h2>Create your Signature Resume</h2><p>Sign in to build and save a reusable career profile for Masinloc Connect job opportunities.</p></div>
    <button className="primary-button full" type="button" onClick={() => requireAccount('create and save your Signature Resume')}>Continue with account</button>
  </section>;

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveState('idle');
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim() || !form.target_role.trim()) {
      setSaveState('invalid');
      return;
    }
    setSaveState('saving');
    try {
      await saveSignatureResume(user, form);
      setSaveState('saved');
      await load();
    } catch {
      setSaveState('error');
    }
  };

  return <div className="resume-panel">
    <section className="resume-intro">
      <span><FileText size={28} /></span>
      <div><h2>Signature Resume</h2><p>Build one clean career profile, then keep updated versions for future applications.</p></div>
    </section>

    {career.status === 'loading' ? <div className="async-state">Loading your career profile…</div> : null}
    {career.status === 'error' ? <div className="async-state error"><strong>Career profile could not load.</strong><button type="button" onClick={load}>Retry</button></div> : null}

    {career.status === 'ready' ? <>
      <form className="form-card resume-form" onSubmit={save}>
        <div className="resume-form-grid">
          <label>Resume name<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Signature Resume" /></label>
          <label>Full name<input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Your full name" required /></label>
          <label>Current location<input value={form.current_location} onChange={(e) => update('current_location', e.target.value)} placeholder="Masinloc, Zambales" /></label>
          <label>Target role<input value={form.target_role} onChange={(e) => update('target_role', e.target.value)} placeholder="e.g. Customer Service Representative" required /></label>
        </div>
        <label>Skills<input value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="Customer service, Excel, sales" /></label>
        <label>Profile summary<textarea rows="4" value={form.profile_summary} onChange={(e) => update('profile_summary', e.target.value)} placeholder="A short professional summary employers can scan quickly." /></label>
        <label>Availability<input value={form.availability} onChange={(e) => update('availability', e.target.value)} placeholder="e.g. Available immediately" /></label>
        {saveState === 'invalid' ? <div className="form-message">Full name and target role are required.</div> : null}
        {saveState === 'error' ? <div className="form-message">Your Signature Resume could not be saved. Try again.</div> : null}
        {saveState === 'saved' ? <div className="resume-success"><Check size={17} /> Signature Resume saved.</div> : null}
        <button className="primary-button full" type="submit" disabled={saveState === 'saving'}>{saveState === 'saving' ? 'Saving…' : 'Save Signature Resume'}</button>
      </form>

      {career.versions.length ? <section className="resume-versions">
        <div className="section-heading"><div><strong>Saved versions</strong><span>{career.versions.length} version{career.versions.length === 1 ? '' : 's'}</span></div></div>
        <div className="resume-version-list">{career.versions.slice(0, 5).map((version) => <article key={version.id}>
          <FileText size={18} />
          <div><strong>{version.name}</strong><span>{version.target_role || 'General resume'} · {formatDate(version.updated_at || version.created_at)}</span></div>
          {version.is_primary ? <b>Primary</b> : null}
        </article>)}</div>
      </section> : null}
    </> : null}
  </div>;
}

function ProvidersPanel({ state, onRetry }) {
  if (state.status === 'loading') return <div className="async-state">Loading trusted providers…</div>;
  if (state.status === 'error') return <div className="async-state error"><strong>Providers could not load.</strong><button type="button" onClick={onRetry}>Retry</button></div>;
  if (!state.providers.length) return <EmptyState icon={ShieldCheck} title="No live providers yet" body="Trusted providers will appear here after their connection is live." />;

  return <div className="provider-list">{state.providers.map((provider) => <article className="provider-card" key={provider.id}>
    <span className="provider-icon"><ShieldCheck size={21} /></span>
    <div><h2>{provider.attribution_label || provider.name}</h2><p>{provider.public_note || 'Live job provider connected to Masinloc Connect.'}</p></div>
    {provider.homepage_url ? <button className="secondary-button" type="button" onClick={() => window.open(provider.homepage_url, '_blank', 'noopener,noreferrer')}>Provider site <ExternalLink size={14} /></button> : null}
  </article>)}</div>;
}

export default function JobsScreen({ user, requireAccount }) {
  const [section, setSection] = useState('jobs');
  const [jobsState, setJobsState] = useState({ status: 'loading', jobs: [], error: null });
  const [providersState, setProvidersState] = useState({ status: 'loading', providers: [], error: null });
  const [saved, setSaved] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [saveError, setSaveError] = useState('');

  const loadJobs = useCallback(() => {
    setJobsState((current) => ({ ...current, status: 'loading', error: null }));
    getLiveJobs()
      .then((jobs) => setJobsState({ status: 'ready', jobs, error: null }))
      .catch((error) => setJobsState({ status: 'error', jobs: [], error }));
  }, []);

  const loadProviders = useCallback(() => {
    setProvidersState((current) => ({ ...current, status: 'loading', error: null }));
    getJobProviders()
      .then((providers) => setProvidersState({ status: 'ready', providers, error: null }))
      .catch((error) => setProvidersState({ status: 'error', providers: [], error }));
  }, []);

  useEffect(() => { loadJobs(); loadProviders(); }, [loadJobs, loadProviders]);
  useEffect(() => {
    if (user) getSavedJobs(user.id).then(setSaved).catch(() => setSaved([]));
    else setSaved([]);
  }, [user]);

  const providers = useMemo(() => new Map(providersState.providers.map((provider) => [provider.id, provider])), [providersState.providers]);
  const jobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobsState.jobs.filter((job) => {
      const text = `${job.title || ''} ${job.company || ''} ${job.location || ''} ${job.work_setup || ''} ${job.employment_type || ''}`.toLowerCase();
      if (!isOpenJob(job)) return false;
      if (filter === 'remote' && !isRemote(job)) return false;
      if (filter === 'masinloc' && !isMasinloc(job)) return false;
      return !needle || text.includes(needle);
    });
  }, [jobsState.jobs, query, filter]);

  const isSaved = (id) => saved.some((item) => item.external_job_id === id);
  const saveJob = async (id) => {
    setSaveError('');
    if (!user) return requireAccount('save job opportunities and return to them later');
    try {
      const next = await toggleSavedJob(user.id, id, isSaved(id));
      setSaved((items) => next
        ? [{ external_job_id: id, created_at: new Date().toISOString() }, ...items]
        : items.filter((item) => item.external_job_id !== id));
    } catch {
      setSaveError('Could not update your saved jobs. Try again.');
    }
  };

  return <div className="screen-stack jobs-screen">
    <ScreenTitle title="Jobs & Opportunities" subtitle="Search trusted listings, save jobs, and keep a Signature Resume ready for applications." />

    <nav className="jobs-section-tabs" aria-label="Jobs and opportunities sections">
      <button type="button" className={section === 'jobs' ? 'active' : ''} onClick={() => setSection('jobs')}><BriefcaseBusiness size={17} /> Jobs</button>
      <button type="button" className={section === 'resume' ? 'active' : ''} onClick={() => setSection('resume')}><FileText size={17} /> Signature Resume</button>
      <button type="button" className={section === 'providers' ? 'active' : ''} onClick={() => setSection('providers')}><ShieldCheck size={17} /> Providers</button>
    </nav>

    {section === 'jobs' ? <>
      <SearchField value={query} onChange={setQuery} placeholder="Search job, company or location" />
      <div className="chip-row jobs-filter-row">
        <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All jobs</button>
        <button type="button" className={filter === 'masinloc' ? 'active' : ''} onClick={() => setFilter('masinloc')}>In Masinloc</button>
        <button type="button" className={filter === 'remote' ? 'active' : ''} onClick={() => setFilter('remote')}>Work from home</button>
      </div>

      {jobsState.status === 'ready' ? <div className="jobs-result-summary"><span>{jobs.length} matching opportunit{jobs.length === 1 ? 'y' : 'ies'}</span><small>Applications open on the provider’s official listing.</small></div> : null}
      {saveError ? <div className="form-message">{saveError}</div> : null}
      {jobsState.status === 'loading' ? <div className="async-state">Loading verified jobs…</div> : null}
      {jobsState.status === 'error' ? <div className="async-state error"><strong>Jobs could not load.</strong><button type="button" onClick={loadJobs}>Retry</button></div> : null}
      {jobsState.status === 'ready' ? jobs.length ? <div className="job-list">{jobs.map((job) => <JobCard key={job.id} job={job} provider={providers.get(job.provider_id)} saved={isSaved(job.id)} onSave={saveJob} />)}</div> : <EmptyState icon={Search} title="No matching jobs" body="Try another keyword or remove the current filter." /> : null}
    </> : null}

    {section === 'resume' ? <ResumePanel user={user} requireAccount={requireAccount} /> : null}
    {section === 'providers' ? <ProvidersPanel state={providersState} onRetry={loadProviders} /> : null}
  </div>;
}
