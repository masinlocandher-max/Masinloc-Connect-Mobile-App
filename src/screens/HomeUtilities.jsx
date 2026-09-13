import { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, Bookmark, BriefcaseBusiness, BookOpen, ChevronRight, Search } from 'lucide-react';
import { getLiveJobs, getSavedJobs } from '../lib/platform.js';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

export function NotificationsScreen({ user }) {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Notifications" subtitle="Important Masinloc Connect updates in one place." />
    <section className="notification-summary"><span className="notification-bell"><Bell size={23}/></span><div><strong>You're up to date</strong><span>{user ? 'Account and service updates will appear here when they are available.' : 'Public in-app alerts can appear here. Sign in later for account-based updates.'}</span></div></section>
    <section className="native-callout" aria-label="Push notification status"><BellOff size={20}/><div><strong>Device push alerts are not enabled yet</strong><span>Masinloc Connect will not ask for notification permission until production push delivery and device-token registration are connected. In-app notifications remain available without that permission.</span></div></section>
    <EmptyState icon={Bell} title="No notifications yet" body="Nothing needs your attention right now." />
  </div>;
}

export function SavedScreen({ user, navigate, requireAccount }) {
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [dictionaryWords] = useState(() => { try { return JSON.parse(localStorage.getItem('masinloc-dictionary-saved') || '[]'); } catch { return []; } });
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([getLiveJobs(), getSavedJobs(user.id)]).then(([allJobs, saved]) => { setJobs(allJobs || []); setSavedIds((saved || []).map((item)=>item.external_job_id)); }).catch(() => { setJobs([]); setSavedIds([]); });
  }, [user?.id]);

  const savedJobs = useMemo(() => jobs.filter((job)=>savedIds.includes(job.id) && (!query || `${job.title} ${job.company}`.toLowerCase().includes(query.toLowerCase()))), [jobs, savedIds, query]);
  const words = useMemo(() => dictionaryWords.filter((word)=>!query || word.toLowerCase().includes(query.toLowerCase())), [dictionaryWords, query]);

  if (!user) return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Saved" subtitle="Keep useful Masinloc Connect items together." /><EmptyState icon={Bookmark} title="Device saves are available without an account" body="Sambal Tina favorites stay on this device. Sign in only if you want account-based saved jobs and synced features." />{dictionaryWords.length ? <div className="saved-word-preview"><strong>Saved Sambal Tina words on this device</strong><div>{dictionaryWords.slice(0,8).map((word)=><span key={word}>{word}</span>)}</div></div> : null}<button className="primary-button full" type="button" onClick={() => requireAccount('sync saved jobs and account-based activity', 'saved')}>Sign In for Synced Saves</button></div>;

  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Saved" subtitle="Return to jobs and words you want to keep." />
    <label className="native-search"><Search size={19}/><span className="sr-only">Search saved items</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search saved items" aria-label="Search saved items" /></label>
    <section className="native-section"><div className="native-section-title"><h2>Saved Jobs</h2><span>{savedJobs.length}</span></div>{savedJobs.length ? <div className="native-list">{savedJobs.map((job)=><button className="saved-job-row" type="button" key={job.id} onClick={()=>navigate('jobs')}><span className="native-list-icon"><BriefcaseBusiness size={20}/></span><div><strong>{job.title}</strong><small>{job.company} · {job.location}</small></div><ChevronRight size={18}/></button>)}</div> : <EmptyState icon={BriefcaseBusiness} title="No saved jobs" body="Save opportunities from Jobs & Opportunities and they will appear here." />}</section>
    <section className="native-section"><div className="native-section-title"><h2>Sambal Tina</h2><span>{words.length}</span></div>{words.length ? <div className="saved-word-grid">{words.map((word)=><button type="button" key={word} onClick={()=>navigate('dictionary')}><BookOpen size={15}/>{word}</button>)}</div> : <EmptyState icon={BookOpen} title="No saved words" body="Tap the heart beside a Sambal Tina word to keep it here on this device." />}</section>
  </div>;
}
