import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Check, ChevronRight, ExternalLink, FileText, Heart, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { getJobProviders, getLiveJobs, getSavedJobs, toggleSavedJob } from '../lib/platform.js';
import { EmptyState } from '../components/UI.jsx';

const categories = ['All', 'Jobs', 'Scholarships', 'Training', 'Internships'];
const locations = ['Masinloc', 'Nearby', 'Remote'];
const workTypes = ['Full-time', 'Part-time', 'Contract'];
const APPLICATIONS_KEY = 'masinloc-connect-applications-v1';

function kindOf(job) {
  const text = `${job.title || ''} ${job.employment_type || ''}`.toLowerCase();
  if (text.includes('scholar')) return 'Scholarships';
  if (text.includes('training') || text.includes('course') || text.includes('bootcamp')) return 'Training';
  if (text.includes('intern') || text.includes('ojt')) return 'Internships';
  return 'Jobs';
}

function posted(value) {
  if (!value) return '';
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  if (!days) return 'Posted today';
  return `Posted ${days} day${days === 1 ? '' : 's'} ago`;
}

function trackOpened(job) {
  try {
    const current = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    const existing = current.find((item) => item.job_id === job.id);
    const nextItem = { id: existing?.id || crypto.randomUUID(), job_id: job.id, title: job.title, company: job.company, status: 'Opened externally', opened_at: new Date().toISOString(), apply_url: job.apply_url };
    const next = [nextItem, ...current.filter((item) => item.job_id !== job.id)];
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(next));
  } catch { /* local tracker is best-effort only */ }
}

export default function JobsShowcase({ user, requireAccount, navigate }) {
  const [state, setState] = useState({ status: 'loading', jobs: [], providers: [] });
  const [saved, setSaved] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(() => {
    setState((current) => ({ ...current, status: 'loading' }));
    Promise.all([getLiveJobs(), getJobProviders()])
      .then(([jobs, providers]) => setState({ status: 'ready', jobs, providers }))
      .catch(() => setState({ status: 'error', jobs: [], providers: [] }));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { user ? getSavedJobs(user.id).then(setSaved).catch(() => setSaved([])) : setSaved([]); }, [user]);

  const providerMap = useMemo(() => new Map(state.providers.map((item) => [item.id, item])), [state.providers]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.jobs.filter((job) => {
      const text = `${job.title} ${job.company} ${job.location} ${job.work_setup || ''} ${job.employment_type || ''}`.toLowerCase();
      const locationText = `${job.location || ''} ${job.work_setup || ''}`.toLowerCase();
      const categoryOk = category === 'All' || kindOf(job) === category;
      const locationOk = !location || (location === 'Masinloc' ? locationText.includes('masinloc') : location === 'Remote' ? /remote|online|wfh/.test(locationText) : !locationText.includes('masinloc') && !/remote|online|wfh/.test(locationText));
      const typeOk = !workType || (job.employment_type || '').toLowerCase().replace(' ', '-').includes(workType.toLowerCase());
      return categoryOk && locationOk && typeOk && (!needle || text.includes(needle));
    });
  }, [state.jobs, query, category, location, workType]);

  const isSaved = (id) => saved.some((item) => item.external_job_id === id);
  const save = async (id) => {
    if (!user) return requireAccount('save job opportunities and return to them later');
    const next = await toggleSavedJob(user.id, id, isSaved(id));
    setSaved((items) => next ? [{ external_job_id: id, created_at: new Date().toISOString() }, ...items] : items.filter((item) => item.external_job_id !== id));
  };

  const openOpportunity = (job) => {
    trackOpened(job);
    window.open(job.apply_url, '_blank', 'noopener,noreferrer');
  };

  return <div className="jobs-showcase">
    <section className="showcase-hero jobs-hero">
      <div className="showcase-hero-photo" aria-hidden="true" />
      <div className="showcase-hero-fade" aria-hidden="true" />
      <div className="showcase-hero-top">
        <button className="showcase-back" type="button" onClick={() => navigate('home')} aria-label="Back"><ArrowLeft size={22} /></button>
        <img className="showcase-logo" src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" />
      </div>
      <div className="showcase-script jobs-script">Masinloqueños can go further.<span /></div>
      <div className="jobs-hero-copy"><p className="jobs-kicker">SKILLED PEOPLE. STRONGER MASINLOC.</p><h1>Jobs &amp; Opportunities</h1><p>Find work, scholarships and verified opportunities.</p></div>
    </section>

    <section className="showcase-content jobs-content">
      <div className="jobs-search-row">
        <label className="showcase-search"><Search size={21} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs, companies, skills…" /></label>
        <button className={`jobs-filter-button${filtersOpen ? ' active' : ''}`} type="button" onClick={() => setFiltersOpen(!filtersOpen)} aria-label="Filters"><SlidersHorizontal size={20} /></button>
      </div>
      <div className="showcase-chip-row">{categories.map((item) => <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className={`jobs-filter-panel${filtersOpen ? ' open' : ''}`}>
        <div className="showcase-chip-row secondary">{locations.map((item) => <button key={item} type="button" className={location === item ? 'active' : ''} onClick={() => setLocation(location === item ? '' : item)}>{item}</button>)}</div>
        <div className="showcase-chip-row secondary">{workTypes.map((item) => <button key={item} type="button" className={workType === item ? 'active' : ''} onClick={() => setWorkType(workType === item ? '' : item)}>{item}</button>)}</div>
      </div>

      <div className="career-tools">
        <button className="career-tool-card" type="button" onClick={() => navigate('resume')}><span className="career-tool-icon"><FileText size={23} /></span><div><strong>Signature Resume</strong><p>Create and manage your Masinloc Connect resume.</p></div><ChevronRight size={17}/></button>
        <button className="career-tool-card" type="button" onClick={() => navigate('applications')}><span className="career-tool-icon alt"><BriefcaseBusiness size={23} /></span><div><strong>My Applications</strong><p>Track opportunities you opened from the app.</p></div><ChevronRight size={17}/></button>
      </div>

      <div className="jobs-section-heading"><h2>Latest Opportunities</h2><button type="button" onClick={() => { setCategory('All'); setLocation(''); setWorkType(''); }}>See all <ChevronRight size={15} /></button></div>
      {state.status === 'loading' ? <div className="showcase-async">Loading verified opportunities…</div> : null}
      {state.status === 'error' ? <div className="showcase-async error"><strong>Opportunities could not load.</strong><button type="button" onClick={load}>Retry</button></div> : null}
      {state.status === 'ready' ? visible.length ? <div className="showcase-job-list">{visible.map((job) => {
        const provider = providerMap.get(job.provider_id);
        const savedJob = isSaved(job.id);
        return <article className="showcase-job-card" key={job.id}>
          <div className="showcase-job-head"><span className="job-company-mark">{(job.company || 'MC').split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()}</span><div className="showcase-job-title"><h3>{job.title}</h3><p>{job.company}</p></div><button className={`showcase-save${savedJob ? ' saved' : ''}`} type="button" onClick={() => save(job.id)} aria-label="Save"><Heart size={20} fill={savedJob ? 'currentColor' : 'none'} /></button></div>
          <div className="showcase-job-meta">{job.location ? <span><MapPin size={14} />{job.location}</span> : null}{job.employment_type ? <span><BriefcaseBusiness size={14} />{job.employment_type}</span> : null}</div>
          {job.salary_text ? <p className="showcase-job-pay">{job.salary_text}</p> : null}
          <div className="showcase-job-dates">{job.published_at ? <span>{posted(job.published_at)}</span> : null}{job.closing_date ? <span>Apply by {new Date(job.closing_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span> : null}</div>
          <div className="showcase-job-footer"><small><Check size={13} />{provider?.attribution_label || provider?.name || 'Trusted Job Provider'}</small><button type="button" onClick={() => openOpportunity(job)}>{kindOf(job) === 'Jobs' ? 'View Job' : 'View Details'} <ExternalLink size={14} /></button></div>
        </article>;
      })}</div> : <EmptyState icon={Search} title="No matching opportunities" body="Try another keyword or clear a filter." /> : null}
    </section>
  </div>;
}
