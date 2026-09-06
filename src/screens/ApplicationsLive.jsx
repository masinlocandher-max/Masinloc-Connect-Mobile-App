import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Check, Search } from 'lucide-react';
import { confirmApplicationApplied, getApplicationActivity } from '../lib/mobileBackend.js';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

const LOCAL_KEY = 'masinloc-connect-applications-v1';

function localItems() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
}

function normalizeRemote(item) {
  const snapshot = item.job_snapshot || {};
  return {
    id: item.id,
    title: snapshot.title || 'Opportunity',
    company: snapshot.company || '',
    status: item.status === 'user_confirmed_applied' ? 'Applied' : 'Opened externally',
    remote: true,
    updated_at: item.updated_at,
  };
}

export default function ApplicationsScreen({ user }) {
  const [items, setItems] = useState(() => localItems());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(user ? 'loading' : 'local');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.id) { setItems(localItems()); setStatus('local'); return; }
    setStatus('loading');
    getApplicationActivity(user.id)
      .then((rows) => { setItems(rows.map(normalizeRemote)); setStatus('ready'); })
      .catch(() => { setItems(localItems()); setStatus('fallback'); setMessage('Account activity could not load. Showing this device’s local tracker.'); });
  }, [user]);

  const visible = useMemo(() => items.filter((item) => !query || `${item.title} ${item.company} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  const markApplied = async (item) => {
    if (!user?.id || !item.remote || item.status === 'Applied') return;
    try {
      await confirmApplicationApplied(user.id, item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'Applied' } : entry));
    } catch { setMessage('Could not update this application right now.'); }
  };

  return <div className="screen-stack mobile-native-stack">
    <ScreenTitle title="My Applications" subtitle="Track opportunities you opened from Masinloc Connect." />
    <label className="native-search"><Search size={19}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search applications" /></label>
    {message ? <div className="native-message error"><span>{message}</span></div> : null}
    {status === 'loading' ? <div className="async-state">Loading your application activity…</div> : null}
    {visible.length ? <div className="native-list applications-list">{visible.map((item) => <article key={item.id}>
      <span className="native-list-icon"><BriefcaseBusiness size={20}/></span>
      <div><strong>{item.title}</strong><small>{item.company || 'Opportunity'} · {item.status}</small></div>
      {user?.id && item.remote && item.status !== 'Applied' ? <button type="button" onClick={() => markApplied(item)}>I applied</button> : <span className="status-dot">{item.status === 'Applied' ? <><Check size={12}/> Applied</> : item.status}</span>}
    </article>)}</div> : status !== 'loading' ? <EmptyState icon={BriefcaseBusiness} title="No tracked applications yet" body="Open an opportunity from Jobs & Opportunities and it will appear here. Masinloc Connect only marks an application as applied when you confirm it." /> : null}
  </div>;
}
