import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { supabase, getMemberProfile } from './lib/platform.js';
import { bottomNav } from './navigation.js';
import { BottomNav, ScreenTopBar } from './components/UI.jsx';
import AccountSheet from './components/AccountSheet.jsx';
import NativeAuthBridge from './components/NativeAuthBridge.jsx';
import JoinFlow from './screens/JoinFlow.jsx';
import { HomeHub } from './screens/HomeMore.jsx';

const MoreServicesScreen = lazy(() => import('./screens/MoreServicesScreen.jsx'));
const NotificationsScreen = lazy(() => import('./screens/HomeUtilities.jsx').then((module) => ({ default: module.NotificationsScreen })));
const SavedScreen = lazy(() => import('./screens/HomeUtilities.jsx').then((module) => ({ default: module.SavedScreen })));
const MarketplaceScreen = lazy(() => import('./screens/MarketplaceScreen.jsx'));
const JobsScreen = lazy(() => import('./screens/JobsScreen.jsx'));
const HelpDeskScreen = lazy(() => import('./screens/HelpDeskScreen.jsx'));
const SellerHub = lazy(() => import('./screens/SellerHubLive.jsx'));
const SellerGuidelinesScreen = lazy(() => import('./screens/SellerHubLive.jsx').then((module) => ({ default: module.SellerGuidelinesScreen })));
const SignatureResumeScreen = lazy(() => import('./screens/ActionScreens.jsx').then((module) => ({ default: module.SignatureResumeScreen })));
const ApplicationsScreen = lazy(() => import('./screens/ApplicationsLive.jsx'));
const ContributionScreen = lazy(() => import('./screens/ContributionsLive.jsx').then((module) => ({ default: module.ContributionScreen })));
const MySubmissionsScreen = lazy(() => import('./screens/ContributionsLive.jsx').then((module) => ({ default: module.MySubmissionsScreen })));
const BulletinScreen = lazy(() => import('./screens/ContentScreens.jsx').then((module) => ({ default: module.BulletinScreen })));
const DictionaryScreen = lazy(() => import('./screens/ContentScreens.jsx').then((module) => ({ default: module.DictionaryScreen })));
const DiscoverScreen = lazy(() => import('./screens/ContentScreens.jsx').then((module) => ({ default: module.DiscoverScreen })));
const HistoryScreen = lazy(() => import('./screens/ContentScreens.jsx').then((module) => ({ default: module.HistoryScreen })));
const AboutScreen = lazy(() => import('./screens/UtilityScreens.jsx').then((module) => ({ default: module.AboutScreen })));
const ContactScreen = lazy(() => import('./screens/UtilityScreens.jsx').then((module) => ({ default: module.ContactScreen })));
const PoliciesScreen = lazy(() => import('./screens/UtilityScreens.jsx').then((module) => ({ default: module.PoliciesScreen })));
const ProfileScreen = lazy(() => import('./screens/UtilityScreens.jsx').then((module) => ({ default: module.ProfileScreen })));

const JOIN_SEEN_KEY = 'masinloc-connect-join-seen-v1';

function ScreenFallback() {
  return <div className="async-state" role="status"><strong>Loading…</strong></div>;
}

export default function App() {
  const [view, setView] = useState('home');
  const [viewHistory, setViewHistory] = useState([]);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [authError, setAuthError] = useState('');
  const user = session?.user || null;
  const primary = bottomNav.some((item) => item.id === view);
  const activeTab = primary ? view : 'home';
  const immersive = view === 'jobs' || view === 'dictionary';

  const refreshProfile = useCallback(async (activeUser) => {
    if (!activeUser) return setProfile(null);
    try { setProfile(await getMemberProfile(activeUser.id)); } catch { setProfile(null); }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const nextSession = data.session || null;
      setSession(nextSession);
      refreshProfile(nextSession?.user);
      const alreadySeen = window.localStorage.getItem(JOIN_SEEN_KEY) === 'yes';
      setShowJoin(!alreadySeen);
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      refreshProfile(nextSession?.user);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [refreshProfile]);

  useEffect(() => {
    const onNativeAuthError = (event) => setAuthError(event.detail?.message || 'The sign-in link could not be completed.');
    window.addEventListener('masinloc-auth-error', onNativeAuthError);
    return () => window.removeEventListener('masinloc-auth-error', onNativeAuthError);
  }, []);

  const enterApp = useCallback(() => {
    window.localStorage.setItem(JOIN_SEEN_KEY, 'yes');
    setShowJoin(false);
    setViewHistory([]);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const requireAccount = useCallback((reason, destination) => {
    if (user) { if (destination) setView(destination); return true; }
    setAuthPrompt({ reason, destination }); return false;
  }, [user]);

  const goBack = useCallback(() => {
    setViewHistory((items) => {
      const next = [...items];
      const previous = next.pop() || 'home';
      setView(previous);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  }, []);

  const handleNativeBack = useCallback(() => {
    if (authPrompt) {
      setAuthPrompt(null);
      return true;
    }
    if (view !== 'home') {
      goBack();
      return true;
    }
    return false;
  }, [authPrompt, goBack, view]);

  const navigate = (next) => {
    if (next === '__back') return goBack();
    if ((next === 'profile' || next === 'resume') && !user) return requireAccount(next === 'resume' ? 'create and manage your Signature Resume' : 'open your profile and account settings', next);
    if (next !== view) setViewHistory((items) => [...items, view].slice(-20));
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!sessionReady) return <><NativeAuthBridge /><div className="entry-loading"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /></div></>;
  if (showJoin) return <><NativeAuthBridge /><JoinFlow user={user} onExplore={enterApp} onContinue={enterApp} /></>;

  const screens = {
    home: <HomeHub navigate={navigate} />,
    notifications: <NotificationsScreen user={user} />,
    profile: <ProfileScreen user={user} profile={profile} onSaved={setProfile} navigate={navigate} />,
    discover: <DiscoverScreen />,
    saved: <SavedScreen user={user} navigate={navigate} requireAccount={requireAccount} />,
    marketplace: <MarketplaceScreen navigate={navigate} />,
    jobs: <JobsScreen user={user} requireAccount={requireAccount} navigate={navigate} />,
    resume: <SignatureResumeScreen user={user} requireAccount={requireAccount} />,
    applications: <ApplicationsScreen user={user} />,
    report: <HelpDeskScreen />,
    more: <MoreServicesScreen navigate={navigate} />,
    'submit-history': <ContributionScreen mode="submit-history" />,
    'submit-word': <ContributionScreen mode="submit-word" />,
    'my-submissions': <MySubmissionsScreen navigate={navigate} />,
    'suggest-correction': <ContributionScreen mode="suggest-correction" />,
    bulletin: <BulletinScreen />,
    sellers: <SellerHub navigate={navigate} />,
    'seller-guidelines': <SellerGuidelinesScreen />,
    dictionary: <DictionaryScreen navigate={navigate} />,
    history: <HistoryScreen />,
    about: <AboutScreen />,
    policies: <PoliciesScreen />,
    contact: <ContactScreen navigate={navigate} />,
  };

  return <div className="app-frame app-frame-v2">
    <NativeAuthBridge onBack={handleNativeBack} />
    {authError ? <div className="native-auth-error" role="alert"><span>{authError}</span><button type="button" onClick={() => setAuthError('')}>Dismiss</button></div> : null}
    <div className={`app-shell${immersive ? ' immersive-shell' : ''}`}>
      {view === 'home' || immersive ? null : <ScreenTopBar onBack={goBack} onHome={() => navigate('home')} />}
      <main className={view === 'home' ? 'screen home-root' : immersive ? 'screen showcase-screen' : 'screen'} id="main-content"><Suspense fallback={<ScreenFallback />}>{screens[view] || screens.home}</Suspense></main>
      <BottomNav active={activeTab} onNavigate={navigate} />
    </div>
    {authPrompt ? <AccountSheet prompt={authPrompt} user={user} onClose={() => setAuthPrompt(null)} onSignedIn={() => { const destination = authPrompt.destination; setAuthPrompt(null); if (destination) navigate(destination); }} /> : null}
  </div>;
}
