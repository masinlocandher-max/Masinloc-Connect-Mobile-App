import { useEffect, useState } from 'react';
import { AlertTriangle, BriefcaseBusiness, Check, CircleUserRound, Compass, ExternalLink, HelpCircle, Mail, PackageCheck, Shield, ShoppingCart, Store } from 'lucide-react';
import { routes } from '../config.js';
import { saveMemberProfile, signOut } from '../lib/platform.js';
import { Callout, EmptyState, ScreenTitle } from '../components/UI.jsx';

export function SellerScreen() {
  return <div className="screen-stack"><ScreenTitle title="For Sellers" subtitle="Marketplace discovery for customers, Masinloc POS for day-to-day business operations." />
    <div className="seller-hero"><span className="seller-mark"><Store size={30} /></span><h2>Sell locally. Manage simply.</h2><p>Use the free POS while the Marketplace ordering layer is being completed. When both systems are calibrated, customers can see order status inside Masinloc Connect.</p><button className="primary-button full" type="button" onClick={() => window.open(routes.pos, '_blank', 'noopener,noreferrer')}>Open Masinloc POS <ExternalLink size={16} /></button></div>
    <div className="mini-feature-list"><div><Check size={18} /><span>Local seller discovery</span></div><div><Check size={18} /><span>POS tools for business operations</span></div><div><Check size={18} /><span>Designed for future order-status sync</span></div></div>
  </div>;
}

export function OrdersScreen({ mode, user }) {
  return <div className="screen-stack"><ScreenTitle title={mode === 'tracking' ? 'Order Status / Tracking' : 'My Orders'} subtitle="Marketplace orders will appear here when the shared ordering service is connected." />
    <EmptyState icon={PackageCheck} title={user ? 'No synced orders yet' : 'Sign in to see your orders'} body={user ? 'This build does not invent order records. The interface is ready for the shared Marketplace order service when it is connected.' : 'Order history and tracking are account-based so they can stay connected across devices.'} />
  </div>;
}

export function ProfileScreen({ user, profile, onSaved }) {
  const [form, setForm] = useState({ display_name: profile?.display_name || '', current_location: profile?.current_location || '' });
  const [status, setStatus] = useState('idle');
  useEffect(() => setForm({ display_name: profile?.display_name || '', current_location: profile?.current_location || '' }), [profile]);
  if (!user) return <EmptyState icon={CircleUserRound} title="Account required" body="Continue with Email to open your Masinloc Connect profile." />;
  const save = async (event) => {
    event.preventDefault(); setStatus('saving');
    try { const saved = await saveMemberProfile(user.id, form); onSaved(saved); setStatus('saved'); } catch { setStatus('error'); }
  };
  return <div className="screen-stack"><ScreenTitle title="Profile / Account" subtitle={user.email} /><form className="form-card" onSubmit={save}>
    <label>Name<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Your name" /></label>
    <label>Location / Barangay<input value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })} placeholder="Optional" /></label>
    {status === 'error' ? <div className="form-message"><AlertTriangle size={18} />Could not save your profile.</div> : null}
    <button className="primary-button full" type="submit" disabled={status === 'saving'}>{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save profile'}</button></form>
    <button className="secondary-button full" type="button" onClick={() => signOut()}>Sign out</button>
  </div>;
}

export function AboutScreen() {
  return <div className="screen-stack"><ScreenTitle title="About Masinloc Connect" subtitle="Connecting Masinloqueños to the World." /><div className="about-panel"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /><p>Masinloc Connect is the mobile action layer of the Masinloc digital ecosystem. The website remains the public source of truth for verified history, Sambal Tina records, places and long-form content.</p><div className="mini-feature-list"><div><Compass size={18} /><span>Discover and learn</span></div><div><ShoppingCart size={18} /><span>Browse and buy locally</span></div><div><BriefcaseBusiness size={18} /><span>Find opportunities</span></div><div><HelpCircle size={18} /><span>Reach local help</span></div></div><button className="secondary-button full" type="button" onClick={() => window.open(routes.website, '_blank', 'noopener,noreferrer')}>Visit Masinloc website <ExternalLink size={15} /></button></div></div>;
}

export function PoliciesScreen() {
  return <div className="screen-stack"><ScreenTitle title="Privacy, Terms & Policies" subtitle="Core operating rules for account, data and emergency features." /><div className="policy-list">
    <article><Shield size={22} /><div><h2>Browse-first access</h2><p>An account is requested only for personalized, saved, tracked or synchronized activity.</p></div></article>
    <article><HelpCircle size={22} /><div><h2>Emergency access</h2><p>Reporting remains usable without an account. A report is only presented as received after the emergency service confirms delivery.</p></div></article>
    <article><CircleUserRound size={22} /><div><h2>Account data</h2><p>Profile and saved-item features use the connected account so activity can be restored across devices.</p></div></article>
  </div><p className="policy-note">This screen summarizes app behavior. Final legal text must remain synchronized with the canonical published policy documents before launch.</p></div>;
}

export function ContactScreen({ navigate }) {
  return <div className="screen-stack"><ScreenTitle title="Contact / Feedback" subtitle="Use the Masinloc platform for current contact information, feedback and emergency reporting." />
    <Callout icon={Mail} title="Visit the Masinloc website" body="The website is the canonical public source for current contact information and published project information." action="Open website" onAction={() => window.open(routes.website, '_blank', 'noopener,noreferrer')} />
    <Callout icon={HelpCircle} title="Need emergency help?" body="Use the Help Desk for PNP or MDRRMO reporting. An account is not required." action="Open Help Desk" onAction={() => navigate('report')} />
  </div>;
}
