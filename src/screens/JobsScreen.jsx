import { useCallback, useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Check, ExternalLink, Heart, MapPin, Search } from 'lucide-react';
import { getJobProviders, getLiveJobs, getSavedJobs, toggleSavedJob } from '../lib/platform.js';
import { EmptyState, ScreenTitle, SearchField, formatDate } from '../components/UI.jsx';

export default function JobsScreen({ user, requireAccount }) {
  const [state, setState] = useState({ status: 'loading', jobs: [], providers: [], error: null });
  const [saved, setSaved] = useState([]);
  const [query, setQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const load = useCallback(() => {
    setState((current) => ({ ...current, status: 'loading', error: null }));
    Promise.all([getLiveJobs(), getJobProviders()])
      .then(([jobs, providers]) => setState({ status: 'ready', jobs, providers, error: null }))
      .catch((error) => setState({ status: 'error', jobs: [], providers: [], error }));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (user) getSavedJobs(user.id).then(setSaved).catch(() => setSaved([])); else setSaved([]); }, [user]);
  const providers = useMemo(() => new Map(state.providers.map((p) => [p.id, p])), [state.providers]);
  const jobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.jobs.filter((job) => {
      const text = `${job.title} ${job.company} ${job.location} ${job.work_setup || ''} ${job.employment_type || ''}`.toLowerCase();
      return (!remoteOnly || /home|remote|online/i.test(`${job.work_setup || ''} ${job.employment_type || ''}`)) && (!needle || text.includes(needle));
    });
  }, [state.jobs, query, remoteOnly]);
  const isSaved = (id) => saved.some((item) => item.external_job_id === id);
  const saveJob = async (id) => {
    if (!user) return requireAccount('save job opportunities and return to them later');
    const next = await toggleSavedJob(user.id, id, isSaved(id));
    setSaved((items) => next ? [{ external_job_id: id, created_at: new Date().toISOString() }, ...items] : items.filter((item) => item.external_job_id !== id));
  };

  return <div className="screen-stack">
    <ScreenTitle title="Jobs & Opportunities" subtitle="Live opportunities from trusted providers connected to Masinloc Connect." />
    <SearchField value={query} onChange={setQuery} placeholder="Search job, company or location" />
    <div className="chip-row"><button type="button" className={!remoteOnly ? 'active' : ''} onClick={() => setRemoteOnly(false)}>All jobs</button><button type="button" className={remoteOnly ? 'active' : ''} onClick={() => setRemoteOnly(true)}>Work from home</button></div>
    {state.status === 'loading' ? <div className="async-state">Loading verified jobs…</div> : null}
    {state.status === 'error' ? <div className="async-state error"><strong>Jobs could not load.</strong><button type="button" onClick={load}>Retry</button></div> : null}
    {state.status === 'ready' ? jobs.length ? <div className="job-list">{jobs.map((job) => {
      const provider = providers.get(job.provider_id);
      const savedJob = isSaved(job.id);
      return <article className="job-card" key={job.id}>
        <div className="job-top"><div><span>{job.work_setup || job.employment_type || 'Opportunity'}</span><h2>{job.title}</h2><p>{job.company}</p></div><button className={savedJob ? 'save-button saved' : 'save-button'} type="button" onClick={() => saveJob(job.id)} aria-label={savedJob ? 'Remove saved job' : 'Save job'}><Heart size={18} fill={savedJob ? 'currentColor' : 'none'} /></button></div>
        <div className="job-meta"><span><MapPin size={13} />{job.location}</span>{job.employment_type ? <span><BriefcaseBusiness size={13} />{job.employment_type}</span> : null}</div>
        {job.requirements_excerpt ? <p className="job-note">{job.requirements_excerpt}</p> : null}
        <div className="job-footer"><small><Check size={12} /> {provider?.attribution_label || provider?.name || 'Trusted Job Provider'} · {formatDate(job.published_at)}</small><button type="button" onClick={() => window.open(job.apply_url, '_blank', 'noopener,noreferrer')}>Apply <ExternalLink size={14} /></button></div>
      </article>;
    })}</div> : <EmptyState icon={Search} title="No matching jobs" body="Try another keyword or remove the filter." /> : null}
  </div>;
}
