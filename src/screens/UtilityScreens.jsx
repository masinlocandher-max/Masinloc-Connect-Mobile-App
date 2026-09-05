import { useEffect, useState } from 'react';
import { AlertTriangle, BriefcaseBusiness, ChevronRight, CircleUserRound, Compass, ExternalLink, FileText, HelpCircle, Mail, PackageCheck, Shield, ShoppingCart } from 'lucide-react';
import { routes } from '../config.js';
import { saveMemberProfile, signOut, supabase } from '../lib/platform.js';
import { AvatarPicker, DEFAULT_AVATAR_ID, FruitAvatar } from '../avatars.jsx';
import { Callout, EmptyState, ScreenTitle } from '../components/UI.jsx';

export function OrdersScreen({ mode, user, navigate }) {
  const tracking = mode === 'tracking';
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title={tracking ? 'Order Status / Tracking' : 'My Orders'} subtitle={tracking ? 'Follow Marketplace order status when seller synchronization is connected.' : 'Your Marketplace orders will live here.'} />
    <div className="native-callout"><PackageCheck size={23}/><div><strong>{user ? 'Order sync ready for connection' : 'Account-based order history'}</strong><span>{user ? 'No order is shown unless a real Marketplace order service returns it.' : 'Sign in is required when real order history and tracking are connected.'}</span></div></div>
    <EmptyState icon={PackageCheck} title={user ? 'No synced orders yet' : 'Sign in to see your orders'} body={user ? 'The app does not invent order records. Your real purchases will appear here once Marketplace ordering is connected.' : 'Order history and tracking are account-based so they can stay connected across devices.'} />
    {navigate ? <button className="primary-button full" type="button" onClick={()=>navigate('marketplace')}>Browse Marketplace <ShoppingCart size={16}/></button> : null}
  </div>;
}

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
    <form className="native-form-card" onSubmit={save}><AvatarPicker value={avatarId} onChange={(next) => { setAvatarId(next); setStatus('idle'); }} /><label>Name<input value={form.display_name} onChange={(e) => { setForm({ ...form, display_name: e.target.value }); setStatus('idle'); }} placeholder="Your name" /></label><label>Location / Barangay<input value={form.current_location} onChange={(e) => { setForm({ ...form, current_location: e.target.value }); setStatus('idle'); }} placeholder="Optional" /></label>{status === 'error' ? <div className="native-message error"><AlertTriangle size={18} /><span>Could not save your profile.</span></div> : null}<button className="primary-button full" type="submit" disabled={status === 'saving'}>{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save profile'}</button></form>
    <button className="secondary-button full" type="button" onClick={() => signOut()}>Sign out</button>
  </div>;
}

export function AboutScreen() {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="About Masinloc Connect" subtitle="Connecting Masinloqueños to the World." /><div className="about-panel native-about-panel"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /><p>Masinloc Connect is the mobile action layer of the Masinloc digital ecosystem. It is designed for doing things: finding opportunities, discovering local businesses, learning Sambal Tina, saving useful information and reaching community help.</p><div className="mini-feature-list"><div><Compass size={18} /><span>Discover and learn</span></div><div><ShoppingCart size={18} /><span>Support local businesses</span></div><div><BriefcaseBusiness size={18} /><span>Find opportunities</span></div><div><HelpCircle size={18} /><span>Reach local help</span></div></div><button className="secondary-button full" type="button" onClick={() => window.open(routes.website, '_blank', 'noopener,noreferrer')}>Open public Masinloc website <ExternalLink size={15} /></button></div></div>;
}

export function PoliciesScreen() {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Privacy, Terms & Policies" subtitle="How account, saved data and emergency features behave in the app." /><div className="policy-list native-policy-list"><article><Shield size={22} /><div><h2>Browse-first access</h2><p>An account is requested only for personalized, saved, tracked or synchronized activity.</p></div></article><article><HelpCircle size={22} /><div><h2>Emergency access</h2><p>Reporting remains usable without an account. A report is only shown as received after the emergency service confirms delivery.</p></div></article><article><CircleUserRound size={22} /><div><h2>Account data</h2><p>Profile and account-based saved features use your connected account so they can be restored across devices.</p></div></article></div><p className="policy-note">Final legal text must remain synchronized with the published policy documents before public launch.</p></div>;
}

export function ContactScreen({ navigate }) {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Contact / Feedback" subtitle="Get information, send feedback or reach emergency help." /><Callout icon={Mail} title="Public contact information" body="Open the public Masinloc site for the latest project contact details." action="Open website" onAction={() => window.open(routes.website, '_blank', 'noopener,noreferrer')} /><Callout icon={HelpCircle} title="Need emergency help?" body="Use the Help Desk for PNP or MDRRMO reporting. An account is not required." action="Open Help Desk" onAction={() => navigate('report')} /></div>;
}
