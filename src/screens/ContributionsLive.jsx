import { useState } from 'react';
import { Check, ChevronRight, FileText, History, Lightbulb, Send, Sparkles } from 'lucide-react';
import { submitMobileContribution } from '../lib/mobileBackend.js';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

const CONTRIBUTIONS_KEY = 'masinloc-connect-contributions-v2';

function readItems() {
  try { return JSON.parse(localStorage.getItem(CONTRIBUTIONS_KEY) || '[]'); } catch { return []; }
}

function writeItems(items) { localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(items)); }

const config = {
  'submit-history': {
    title: 'Submit Masinloc History',
    subtitle: 'Share a local story, record or source for review.',
    icon: History,
    category: 'story',
    fields: [['title','Story / subject'],['source','Source or reference'],['details','Story, record or context']],
  },
  'submit-word': {
    title: 'Submit a Sambal Tina Word',
    subtitle: 'Contribute a word for source checking before it enters the dictionary.',
    icon: Sparkles,
    category: 'dictionary',
    fields: [['title','Tina word'],['source','Where did you learn or find it?'],['details','Meaning, usage or notes']],
  },
  'suggest-correction': {
    title: 'Suggest a Correction',
    subtitle: 'Flag information that may need an update or source check.',
    icon: Lightbulb,
    category: 'contact',
    fields: [['title','Page / topic'],['source','Supporting source, if any'],['details','What should be corrected?']],
  },
};

function payloadFor(mode, form) {
  if (mode === 'submit-history') return {
    title: form.title,
    about: form.source || 'Community history contribution',
    story: form.details,
    contributorName: form.name,
    contributorContact: form.email,
  };
  if (mode === 'submit-word') return {
    submissionType: 'new_entry',
    headword: form.title,
    contributionDetails: [form.details, form.source ? `Source/context: ${form.source}` : ''].filter(Boolean).join('\n\n'),
    contributorName: form.name,
    contributorContact: form.email,
    creditName: form.name,
    creditConsent: form.credit,
  };
  return {
    senderName: form.name,
    senderEmail: form.email,
    topic: 'correction',
    subject: form.title,
    message: [form.details, form.source ? `Supporting source: ${form.source}` : ''].filter(Boolean).join('\n\n'),
  };
}

export function ContributionScreen({ mode }) {
  const item = config[mode] || config['suggest-correction'];
  const Icon = item.icon;
  const [form, setForm] = useState({ title:'', source:'', details:'', name:'', email:'', credit:false });
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setState('sending'); setMessage('');
    try {
      const result = await submitMobileContribution(item.category, payloadFor(mode, form));
      const record = {
        id: result.id || crypto.randomUUID(),
        type: mode,
        title: form.title,
        created_at: new Date().toISOString(),
        status: 'Submitted for review',
        reference_code: result.reference_code || null,
      };
      writeItems([record, ...readItems()].slice(0, 100));
      setState('sent');
      setMessage(result.reference_code ? `Submitted for review. Reference: ${result.reference_code}` : 'Submitted for review.');
      setForm({ title:'', source:'', details:'', name:'', email:'', credit:false });
    } catch (error) {
      setState('error');
      setMessage(error.message || 'Could not submit right now.');
    }
  };

  return <div className="screen-stack mobile-native-stack">
    <ScreenTitle title={item.title} subtitle={item.subtitle} />
    <div className="native-callout"><Icon size={23}/><div><strong>Community contribution</strong><span>Submissions go to the Masinloc Connect review queue. Nothing is published automatically.</span></div></div>
    <form className="native-form-card" onSubmit={submit}>
      {item.fields.map(([key,label]) => <label key={key}>{label}{key === 'details' ? <textarea required rows="6" value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} /> : <input required={key === 'title'} value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} />}</label>)}
      <label>Your name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
      <label>Email for review follow-up<input required type="email" inputMode="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
      {mode === 'submit-word' ? <label className="native-checkbox"><input type="checkbox" checked={form.credit} onChange={(e)=>setForm({...form,credit:e.target.checked})} /><span>Credit my name publicly if this contribution is approved.</span></label> : null}
      {message ? <div className={`native-message ${state === 'error' ? 'error' : ''}`}>{state === 'sent' ? <Check size={18}/> : null}<span>{message}</span></div> : null}
      <button className="primary-button full" type="submit" disabled={state === 'sending'}><Send size={17}/>{state === 'sending' ? 'Submitting…' : 'Submit for Review'}</button>
    </form>
  </div>;
}

export function MySubmissionsScreen({ navigate }) {
  const [items, setItems] = useState(readItems);
  const remove = (id) => { const next = items.filter((entry)=>entry.id!==id); writeItems(next); setItems(next); };
  return <div className="screen-stack mobile-native-stack">
    <ScreenTitle title="My Submissions" subtitle="Submissions sent from this device to the Masinloc Connect review queue." />
    {items.length ? <div className="native-list submissions-list">{items.map((entry)=><article key={entry.id}><span className="native-list-icon"><FileText size={20}/></span><div><strong>{entry.title}</strong><small>{entry.type.replaceAll('-',' ')} · {entry.reference_code || entry.status}</small></div><button type="button" onClick={()=>remove(entry.id)}>Hide</button></article>)}</div> : <EmptyState icon={FileText} title="No submissions yet" body="Contribute a history item, Sambal Tina word or correction and its review reference will appear here." />}
    <div className="native-action-list"><button type="button" onClick={()=>navigate('submit-history')}><History size={20}/><span>Submit Masinloc History</span><ChevronRight size={18}/></button><button type="button" onClick={()=>navigate('submit-word')}><Sparkles size={20}/><span>Submit a Sambal Tina Word</span><ChevronRight size={18}/></button><button type="button" onClick={()=>navigate('suggest-correction')}><Lightbulb size={20}/><span>Suggest a Correction</span><ChevronRight size={18}/></button></div>
  </div>;
}
