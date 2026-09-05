import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, Check, ChevronRight, FileText, History, Lightbulb, Save, Search, Sparkles } from 'lucide-react';
import { getCareerProfile, getResumeVersions, saveSignatureResume } from '../lib/platform.js';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

const CONTRIBUTIONS_KEY = 'masinloc-connect-contributions-v1';
const APPLICATIONS_KEY = 'masinloc-connect-applications-v1';

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function writeLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

export function SignatureResumeScreen({ user, requireAccount }) {
  const [versions, setVersions] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name:'Signature Resume', full_name:'', current_location:'', target_role:'', skills:'', profile_summary:'', availability:'' });

  useEffect(() => {
    if (!user) return;
    Promise.all([getCareerProfile(user.id), getResumeVersions(user.id)]).then(([profile, items]) => {
      setVersions(items || []);
      if (profile) setForm((current) => ({ ...current, full_name: profile.full_name || '', current_location: profile.current_location || '', target_role: profile.target_roles?.[0] || '', skills: (profile.skills || []).join(', '), profile_summary: profile.profile_summary || '', availability: profile.availability || '' }));
    }).catch(() => setMessage('Your saved career profile could not be loaded.'));
  }, [user]);

  if (!user) return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Signature Resume" subtitle="Build a reusable Masinloc Connect career profile." /><EmptyState icon={FileText} title="Sign in to build your resume" body="Your resume is account-based so it can stay available across devices." /><button className="primary-button full" type="button" onClick={() => requireAccount('create and manage your Signature Resume', 'resume')}>Continue with Email</button></div>;

  const submit = async (event) => {
    event.preventDefault(); setStatus('saving'); setMessage('');
    try {
      const saved = await saveSignatureResume(user, form);
      setVersions((items) => [saved, ...items]); setStatus('saved'); setMessage('Signature Resume saved.');
    } catch (error) { setStatus('error'); setMessage(error.message || 'Could not save your resume.'); }
  };

  return <div className="screen-stack mobile-native-stack">
    <ScreenTitle title="Signature Resume" subtitle="One career profile you can keep updating for opportunities." />
    <form className="native-form-card" onSubmit={submit}>
      <label>Resume name<input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} /></label>
      <label>Full name<input required value={form.full_name} onChange={(e) => setForm({...form,full_name:e.target.value})} placeholder="Full name" /></label>
      <label>Current location<input value={form.current_location} onChange={(e) => setForm({...form,current_location:e.target.value})} placeholder="Masinloc, Zambales" /></label>
      <label>Target role<input required value={form.target_role} onChange={(e) => setForm({...form,target_role:e.target.value})} placeholder="e.g. Customer Service Representative" /></label>
      <label>Skills<input value={form.skills} onChange={(e) => setForm({...form,skills:e.target.value})} placeholder="Communication, Excel, customer service" /></label>
      <label>Professional summary<textarea rows="5" value={form.profile_summary} onChange={(e) => setForm({...form,profile_summary:e.target.value})} placeholder="A concise summary of your experience and strengths." /></label>
      <label>Availability<input value={form.availability} onChange={(e) => setForm({...form,availability:e.target.value})} placeholder="Immediately / 2 weeks / weekends" /></label>
      {message ? <div className={`native-message ${status === 'error' ? 'error' : ''}`}>{status === 'saved' ? <Check size={18}/> : <AlertCircle size={18}/>}<span>{message}</span></div> : null}
      <button className="primary-button full" disabled={status === 'saving'} type="submit"><Save size={17}/>{status === 'saving' ? 'Saving…' : 'Save Signature Resume'}</button>
    </form>
    {versions.length ? <section className="native-section"><div className="native-section-title"><h2>Resume versions</h2><span>{versions.length}</span></div><div className="native-list">{versions.map((item) => <article key={item.id}><span className="native-list-icon"><FileText size={20}/></span><div><strong>{item.name}</strong><small>{item.target_role || 'General resume'} · {item.is_primary ? 'Primary' : 'Saved version'}</small></div></article>)}</div></section> : null}
  </div>;
}

export function ApplicationsScreen() {
  const [items, setItems] = useState(() => readLocal(APPLICATIONS_KEY));
  const [query, setQuery] = useState('');
  const visible = useMemo(() => items.filter((item) => !query || `${item.title} ${item.company} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const clear = () => { writeLocal(APPLICATIONS_KEY, []); setItems([]); };
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="My Applications" subtitle="Keep track of opportunities you choose to follow up on." />
    <label className="native-search"><Search size={19}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search applications" /></label>
    {visible.length ? <><div className="native-list applications-list">{visible.map((item) => <article key={item.id}><span className="native-list-icon"><BriefcaseBusiness size={20}/></span><div><strong>{item.title}</strong><small>{item.company || 'Opportunity'} · {item.status || 'Opened externally'}</small></div><span className="status-dot">{item.status || 'Opened'}</span></article>)}</div><button className="text-button centered" type="button" onClick={clear}>Clear local tracker</button></> : <EmptyState icon={BriefcaseBusiness} title="No tracked applications yet" body="When application tracking is connected to a provider, your status will appear here. This screen never invents application records." />}
  </div>;
}

const contributionConfig = {
  'submit-history': { title:'Submit Masinloc History', subtitle:'Share a local story, record, source or correction for review.', icon:History, fields:[['title','Story / subject'],['source','Source or reference'],['details','What should we know?']] },
  'submit-word': { title:'Submit a Sambal Tina Word', subtitle:'Contribute a word for source checking before it enters the dictionary.', icon:Sparkles, fields:[['title','Tina word'],['source','Where did you learn or find it?'],['details','Meaning, usage or notes']] },
  'suggest-correction': { title:'Suggest a Correction', subtitle:'Flag information that may need an update or source check.', icon:Lightbulb, fields:[['title','Page / topic'],['source','Supporting source, if any'],['details','What should be corrected?']] },
};

export function ContributionScreen({ mode }) {
  const config = contributionConfig[mode] || contributionConfig['suggest-correction'];
  const Icon = config.icon;
  const [form, setForm] = useState({ title:'', source:'', details:'', contact:'' });
  const [saved, setSaved] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    const items = readLocal(CONTRIBUTIONS_KEY);
    const item = { id: crypto.randomUUID(), type: mode, ...form, created_at: new Date().toISOString(), status:'Saved on device' };
    writeLocal(CONTRIBUTIONS_KEY, [item, ...items]); setSaved(true); setForm({ title:'', source:'', details:'', contact:'' });
  };
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title={config.title} subtitle={config.subtitle} />
    <div className="native-callout"><Icon size={23}/><div><strong>Community contribution</strong><span>Saved locally in this build. It is not presented as reviewed or published until a submission backend is connected.</span></div></div>
    <form className="native-form-card" onSubmit={submit}>{config.fields.map(([key,label]) => <label key={key}>{label}{key === 'details' ? <textarea required rows="6" value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} /> : <input required={key === 'title'} value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} />}</label>)}<label>Contact (optional)<input value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})} placeholder="Email or phone" /></label>{saved ? <div className="native-message"><Check size={18}/><span>Saved to My Submissions on this device.</span></div> : null}<button className="primary-button full" type="submit"><Save size={17}/>Save Submission</button></form>
  </div>;
}

export function MySubmissionsScreen({ navigate }) {
  const [items, setItems] = useState(() => readLocal(CONTRIBUTIONS_KEY));
  const remove = (id) => { const next = items.filter((item)=>item.id!==id); writeLocal(CONTRIBUTIONS_KEY,next); setItems(next); };
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="My Submissions" subtitle="Your locally saved history, word and correction contributions." />
    {items.length ? <div className="native-list submissions-list">{items.map((item)=><article key={item.id}><span className="native-list-icon"><FileText size={20}/></span><div><strong>{item.title}</strong><small>{item.type.replaceAll('-',' ')} · {new Date(item.created_at).toLocaleDateString('en-PH')}</small></div><button type="button" onClick={()=>remove(item.id)}>Remove</button></article>)}</div> : <EmptyState icon={FileText} title="No submissions yet" body="Contribute a history item, Sambal Tina word, or correction and it will appear here on this device." />}
    <div className="native-action-list"><button type="button" onClick={()=>navigate('submit-history')}><History size={20}/><span>Submit Masinloc History</span><ChevronRight size={18}/></button><button type="button" onClick={()=>navigate('submit-word')}><Sparkles size={20}/><span>Submit a Sambal Tina Word</span><ChevronRight size={18}/></button><button type="button" onClick={()=>navigate('suggest-correction')}><Lightbulb size={20}/><span>Suggest a Correction</span><ChevronRight size={18}/></button></div>
  </div>;
}
