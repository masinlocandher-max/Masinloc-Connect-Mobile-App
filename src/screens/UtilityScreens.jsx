import { useEffect, useState } from 'react';
import { AlertTriangle, BellOff, BriefcaseBusiness, ChevronRight, CircleUserRound, Compass, Database, ExternalLink, FileText, HardDrive, HelpCircle, Mail, MapPin, Shield, ShoppingCart, Store } from 'lucide-react';
import { routes } from '../config.js';
import { saveMemberProfile, signOut, supabase } from '../lib/platform.js';
import { AvatarPicker, DEFAULT_AVATAR_ID, FruitAvatar } from '../avatars.jsx';
import { Callout, EmptyState, ScreenTitle } from '../components/UI.jsx';

export function ProfileScreen({ user, profile, onSaved, navigate }) {
  const savedAvatar = user?.user_metadata?.masinloc_avatar || DEFAULT_AVATAR_ID;
  const [form, setForm] = useState({ display_name: profile?.display_name || '', current_location: profile?.current_location || '' });
  const [avatarId, setAvatarId] = useState(savedAvatar);
  const [status, setStatus] = useState('idle');

  useEffect(() => { setForm({ display_name: profile?.display_name || '', current_location: profile?.current_location || '' }); }, [profile]);
  useEffect(() => setAvatarId(savedAvatar), [savedAvatar]);

  if (!user) return <EmptyState icon={CircleUserRound} title="Account required" body="Continue with Email to open your Masinloc Connect profile." />;

  const save = async (event) => {
    event.preventDefault(); setStatus('saving');
    try {
      const saved = await saveMemberProfile(user.id, form);
      const { error } = await supabase.auth.updateUser({ data: { masinloc_avatar: avatarId } });
      if (error) throw error;
      onSaved(saved); setStatus('saved');
    } catch { setStatus('error'); }
  };

  return <div className="screen-stack mobile-native-stack profile-mobile">
    <ScreenTitle title="Profile" subtitle="Your Masinloc Connect identity and account tools." />
    <section className="profile-avatar-card" aria-label="Current profile avatar"><FruitAvatar id={avatarId} size={88} /><div className="profile-avatar-copy"><strong>{form.display_name.trim() || 'Masinloc Connect Member'}</strong><span>{user.email}</span></div></section>
    {navigate ? <div className="native-action-list profile-shortcuts"><button type="button" onClick={()=>navigate('resume')}><span className="native-action-icon"><FileText size={20}/></span><div><strong>Signature Resume</strong><span>Manage your career profile</span></div><ChevronRight size={18}/></button><button type="button" onClick={()=>navigate('applications')}><span className="native-action-icon"><BriefcaseBusiness size={20}/></span><div><strong>My Applications</strong><span>Review opportunities you opened</span></div><ChevronRight size={18}/></button></div> : null}
    <form className="native-form-card" onSubmit={save}><AvatarPicker value={avatarId} onChange={(next) => { setAvatarId(next); setStatus('idle'); }} /><label>Name<input autoComplete="name" value={form.display_name} onChange={(e) => { setForm({ ...form, display_name: e.target.value }); setStatus('idle'); }} placeholder="Your name" /></label><label>Location / Barangay<input autoComplete="address-level2" value={form.current_location} onChange={(e) => { setForm({ ...form, current_location: e.target.value }); setStatus('idle'); }} placeholder="Optional" /></label>{status === 'error' ? <div className="native-message error" role="alert"><AlertTriangle size={18} /><span>Could not save your profile.</span></div> : null}<button className="primary-button full" type="submit" disabled={status === 'saving'} aria-live="polite">{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save profile'}</button></form>
    <button className="secondary-button full" type="button" onClick={() => signOut()}>Sign out</button>
  </div>;
}

export function AboutScreen() {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="About Masinloc Connect" subtitle="Connecting Masinloqueños to the World." /><div className="about-panel native-about-panel"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /><p>Masinloc Connect is the mobile action layer of the Masinloc digital ecosystem. It is designed for doing things: finding opportunities, discovering local businesses, learning Sambal Tina, saving useful information and reaching community help.</p><div className="mini-feature-list"><div><Compass size={18} /><span>Discover and learn</span></div><div><ShoppingCart size={18} /><span>Support local businesses</span></div><div><BriefcaseBusiness size={18} /><span>Find opportunities</span></div><div><HelpCircle size={18} /><span>Reach local help</span></div></div><button className="secondary-button full" type="button" onClick={() => window.open(routes.website, '_blank', 'noopener,noreferrer')}>Open public Masinloc website <ExternalLink size={15} /></button></div></div>;
}

export function PoliciesScreen() {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Privacy, Terms & Policies" subtitle="A plain-language summary of how Masinloc Connect currently handles data and permissions." />
    <div className="policy-list native-policy-list">
      <article><Shield size={22} /><div><h2>Browse-first access</h2><p>Public discovery, Sambal Tina, Marketplace and Help Desk do not require an account. Sign-in is reserved for profile, synced saves, career tools and other account-based activity.</p></div></article>
      <article><Database size={22} /><div><h2>Account data</h2><p>When you sign in, account-based profile, saved-job, career, resume and application-activity records are stored in the connected backend and protected by account ownership rules.</p></div></article>
      <article><HardDrive size={22} /><div><h2>Data stored on this device</h2><p>Device-only Sambal Tina favorites, selected drafts, cached public content and limited workflow state can remain on this device. Public-content caching is used so previously opened information can still be available when connectivity drops.</p></div></article>
      <article><HelpCircle size={22} /><div><h2>Help Desk reports</h2><p>An unsent emergency report is stored locally so it can be retried. After confirmed delivery, the app removes the description, precise GPS coordinates and reporter contact details from persistent device storage and keeps only the minimum tracking information needed to check status.</p></div></article>
      <article><MapPin size={22} /><div><h2>Location permission</h2><p>Location is requested only when you choose Use GPS in Help Desk. You can report using a barangay or landmark instead. Masinloc Connect does not need background location access.</p></div></article>
      <article><Store size={22} /><div><h2>Business-owner submissions</h2><p>Private review details may be kept while you intentionally save a draft. After successful submission, the local saved snapshot keeps public listing details and the review reference, not the private owner-review contact fields.</p></div></article>
      <article><BellOff size={22} /><div><h2>Notifications</h2><p>In-app notifications do not require device push permission. The app will not request push-notification access until production push delivery and device-token registration are actually connected.</p></div></article>
      <article><ExternalLink size={22} /><div><h2>External services</h2><p>Job application links, the public Masinloc website and other external destinations may open outside Masinloc Connect. Their own terms and privacy practices apply once you leave the app.</p></div></article>
    </div>
    <p className="policy-note">This screen describes current product behavior. The published legal/privacy documents remain the authoritative policy for public launch and should stay synchronized with the app.</p>
    <button className="secondary-button full" type="button" onClick={() => window.open(routes.website, '_blank', 'noopener,noreferrer')}>Open public Masinloc website <ExternalLink size={15} /></button>
  </div>;
}

export function ContactScreen({ navigate }) {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Contact / Feedback" subtitle="Get information, send feedback or reach emergency help." /><Callout icon={Mail} title="Public contact information" body="Open the public Masinloc site for the latest project contact details." action="Open website" onAction={() => window.open(routes.website, '_blank', 'noopener,noreferrer')} /><Callout icon={HelpCircle} title="Need emergency help?" body="Use the Help Desk for PNP or MDRRMO reporting. An account is not required." action="Open Help Desk" onAction={() => navigate('report')} /></div>;
}
