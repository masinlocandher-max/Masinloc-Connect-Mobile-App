import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { sendEmailSignIn } from '../lib/platform.js';

export default function JoinFlow({ user, onExplore, onContinue }) {
  const [step, setStep] = useState(user ? 'success' : 'welcome');
  const [email, setEmail] = useState(user?.email || '');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      await sendEmailSignIn(email);
      setStatus('sent');
      setStep('sent');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Could not send the secure sign-in link.');
    }
  };

  if (user || step === 'success') {
    return <main className="join-flow join-success">
      <div className="join-brand"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /></div>
      <section className="join-success-card">
        <span className="join-success-icon"><CheckCircle2 size={42} /></span>
        <h1>Welcome to Masinloc Connect</h1>
        <p>Your account is connected. You can now save opportunities, manage your profile and keep account-based activity across devices.</p>
        <button className="join-primary" type="button" onClick={onContinue}>Continue to Masinloc Connect <ArrowRight size={19} /></button>
      </section>
    </main>;
  }

  if (step === 'sent') {
    return <main className="join-flow join-sent">
      <button className="join-back" type="button" onClick={() => setStep('email')} aria-label="Back"><ArrowLeft size={22} /></button>
      <div className="join-brand"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /></div>
      <section className="join-panel">
        <span className="join-mail-icon"><Mail size={32} /></span>
        <h1>Check your email</h1>
        <p>We sent a secure sign-in link to <strong>{email}</strong>. Open it on this device to continue.</p>
        <button className="join-secondary" type="button" onClick={() => { setStep('email'); setStatus('idle'); }}>Use a different email</button>
        <button className="join-text" type="button" onClick={onExplore}>Explore as guest instead</button>
      </section>
    </main>;
  }

  if (step === 'email') {
    return <main className="join-flow join-email">
      <button className="join-back" type="button" onClick={() => setStep('welcome')} aria-label="Back"><ArrowLeft size={22} /></button>
      <div className="join-brand"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /></div>
      <section className="join-panel">
        <h1>Join Masinloc Connect</h1>
        <p>Use your email to save jobs, manage your profile, track account activity and access personalized features.</p>
        <form className="join-form" onSubmit={submit}>
          <label>Email address<input required type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          {message ? <div className="join-error">{message}</div> : null}
          <button className="join-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending secure link…' : 'Continue with Email'} <ArrowRight size={19} /></button>
        </form>
        <div className="join-security"><ShieldCheck size={18} /><span>Passwordless sign-in. We send a secure link to your email.</span></div>
        <button className="join-text" type="button" onClick={onExplore}>Explore as guest</button>
      </section>
    </main>;
  }

  return <main className="join-flow join-welcome">
    <div className="join-visual" aria-hidden="true" />
    <div className="join-welcome-content">
      <div className="join-brand"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /></div>
      <div className="join-copy">
        <h1>Masinloc, in your pocket.</h1>
        <p>Discover local services, find opportunities, support businesses, learn Sambal Tina and reach community help in one mobile app.</p>
      </div>
      <div className="join-actions">
        <button className="join-primary" type="button" onClick={() => setStep('email')}>Join Masinloc Connect <ArrowRight size={19} /></button>
        <button className="join-secondary" type="button" onClick={onExplore}>Explore as guest</button>
        <small>Joining is optional. Public information remains available without an account.</small>
      </div>
    </div>
  </main>;
}
