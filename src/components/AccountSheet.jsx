import { useEffect, useState } from 'react';
import { CircleUserRound, X } from 'lucide-react';
import { sendEmailSignIn } from '../lib/platform.js';

export default function AccountSheet({ prompt, user, onClose, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  useEffect(() => { if (user) onSignedIn(); }, [user, onSignedIn]);
  const submit = async (event) => {
    event.preventDefault(); setState('sending'); setMessage('');
    try { await sendEmailSignIn(email); setState('sent'); setMessage('Check your email and open the secure sign-in link.'); }
    catch (error) { setState('error'); setMessage(error.message || 'Could not send the sign-in email.'); }
  };
  return <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="account-sheet" role="dialog" aria-modal="true" aria-labelledby="account-sheet-title">
      <button className="sheet-close" type="button" onClick={onClose} aria-label="Close"><X size={20} /></button>
      <span className="account-sheet-icon"><CircleUserRound size={30} /></span><h2 id="account-sheet-title">Continue with Email</h2>
      <p>Create an account only when you want to {prompt.reason}.</p>
      <form onSubmit={submit}><label>Email address<input required type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <button className="primary-button full" type="submit" disabled={state === 'sending' || state === 'sent'}>{state === 'sending' ? 'Sending…' : state === 'sent' ? 'Email sent' : 'Continue with Email'}</button></form>
      {message ? <div className={state === 'error' ? 'sheet-message error' : 'sheet-message'}>{message}</div> : null}
      <button className="text-button centered" type="button" onClick={onClose}>Not now</button>
    </section>
  </div>;
}
