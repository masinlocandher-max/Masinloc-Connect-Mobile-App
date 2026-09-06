import { useCallback, useEffect, useState } from 'react';
import { supabase, getMemberProfile } from './lib/platform.js';
import { bottomNav } from './navigation.js';
import { BottomNav, ScreenTopBar } from './components/UI.jsx';
import AccountSheet from './components/AccountSheet.jsx';
import NativeAuthBridge from './components/NativeAuthBridge.jsx';
import JoinFlow from './screens/JoinFlow.jsx';
import { HomeHub } from './screens/HomeMore.jsx';
import MoreServicesScreen from './screens/MoreServicesScreen.jsx';
import { NotificationsScreen, SavedScreen } from './screens/HomeUtilities.jsx';
import MarketplaceScreen from './screens/MarketplaceScreen.jsx';
import JobsScreen from './screens/JobsScreen.jsx';
import HelpDeskScreen from './screens/HelpDeskScreen.jsx';
import SellerHub, { SellerGuidelinesScreen } from './screens/SellerHubLive.jsx';
import { SignatureResumeScreen } from './screens/ActionScreens.jsx';
import ApplicationsScreen from './screens/ApplicationsLive.jsx';
import { ContributionScreen, MySubmissionsScreen } from './screens/ContributionsLive.jsx';
import BuyerOrdersScreen from './screens/BuyerOrdersScreen.jsx';
import { BulletinScreen, DictionaryScreen, DiscoverScreen, HistoryScreen } from './screens/ContentScreens.jsx';
import { AboutScreen, ContactScreen, PoliciesScreen, ProfileScreen } from './screens/UtilityScreens.jsx';

const JOIN_SEEN_KEY = 'masinloc-connect-join-seen-v1';

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

  const goBack = () => {
    setViewHistory((items) => {
      const next = [...items];
      const previous = next.pop() || 'home';
      setView(previous);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  };

  const navigate = (next) => {
    if (next === '__back') return goBack();
    if ((next === 'profile' || next === 'resume') && !user) return requireAccount(next === 'resume' ? 'create and manage your Signature Resume' : 'open your profile and account settings', next);
    if (next === 'saved' && !user) return requireAccount('view your saved jobs and content', 'saved');
    if ((next === 'orders' || next === 'tracking') && !user) return requireAccount('view your orders and delivery status', next);
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
    orders: <BuyerOrdersScreen mode="orders" user={user} />,
    tracking: <BuyerOrdersScreen mode="tracking" user={user} />,
    sellers: <SellerHub navigate={navigate} />,
    'seller-guidelines': <SellerGuidelinesScreen />,
    dictionary: <DictionaryScreen navigate={navigate} />,
    history: <HistoryScreen />,
    about: <AboutScreen />,
    policies: <PoliciesScreen />,
    contact: <ContactScreen navigate={navigate} />,
  };

  return <div className="app-frame app-frame-v2">
    <NativeAuthBridge />
    {authError ? <div className="native-auth-error" role="alert"><span>{authError}</span><button type="button" onClick={() => setAuthError('')}>Dismiss</button></div> : null}
    <div className={`app-shell${immersive ? ' immersive-shell' : ''}`}>
      {view === 'home' || immersive ? null : <ScreenTopBar onBack={goBack} onHome={() => navigate('home')} />}
      <main className={view === 'home' ? 'screen home-root' : immersive ? 'screen showcase-screen' : 'screen'} id="main-content">{screens[view] || screens.home}</main>
      <BottomNav active={activeTab} onNavigate={navigate} />
    </div>
    {authPrompt ? <AccountSheet prompt={authPrompt} user={user} onClose={() => setAuthPrompt(null)} onSignedIn={() => { const destination = authPrompt.destination; setAuthPrompt(null); if (destination) navigate(destination); }} /> : null}
  </div>;
}
