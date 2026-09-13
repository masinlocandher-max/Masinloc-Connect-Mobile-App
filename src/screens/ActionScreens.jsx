import { useEffect, useState } from 'react';
import { AlertCircle, Check, FileText, Save } from 'lucide-react';
import { getCareerProfile, getResumeVersions, saveSignatureResume } from '../lib/platform.js';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

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
  }, [user?.id]);

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
