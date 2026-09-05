import { useCallback, useEffect, useState } from 'react';
import { supabase, getMemberProfile } from './lib/platform.js';
import { bottomNav } from './navigation.js';
import { BottomNav, ScreenTopBar } from './components/UI.jsx';
import AccountSheet from './components/AccountSheet.jsx';
import JoinFlow from './screens/JoinFlow.jsx';
import { HomeHub, MoreScreen } from './screens/HomeMore.jsx';
import { NotificationsScreen, SavedScreen } from './screens/HomeUtilities.jsx';
import MarketplaceScreen from './screens/MarketplaceScreen.jsx';
import JobsScreen from './screens/JobsScreen.jsx';
import HelpDeskScreen from './screens/HelpDeskScreen.jsx';
import { BulletinScreen, DictionaryScreen, DiscoverScreen, HistoryScreen } from './screens/ContentScreens.jsx';
import { AboutScreen, ContactScreen, OrdersScreen, PoliciesScreen, ProfileScreen, SellerScreen } from './screens/UtilityScreens.jsx';

const JOIN_SEEN_KEY = 'masinloc-connect-join-seen-v1';

export default function App() {
  const [view, setView] = useState('home');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
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
      setShowJoin(!nextSession && !alreadySeen);
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      refreshProfile(nextSession?.user);
      if (nextSession?.user) setShowJoin(true);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [refreshProfile]);

  const enterApp = useCallback(() => {
    window.localStorage.setItem(JOIN_SEEN_KEY, 'yes');
    setShowJoin(false);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const requireAccount = useCallback((reason, destination) => {
    if (user) { if (destination) setView(destination); return true; }
    setAuthPrompt({ reason, destination }); return false;
  }, [user]);

  const navigate = (next) => {
    if (next === 'profile' && !user) return requireAccount('open your profile and account settings', 'profile');
    if (next === 'saved' && !user) return requireAccount('view your saved jobs and content', 'saved');
    if ((next === 'orders' || next === 'tracking') && !user) return requireAccount('view your orders and delivery status', next);
    setView(next); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!sessionReady) return <div className="entry-loading"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /></div>;
  if (showJoin) return <JoinFlow user={user} onExplore={enterApp} onContinue={enterApp} />;

  const screens = {
    home: <HomeHub navigate={navigate} />,
    notifications: <NotificationsScreen user={user} />,
    profile: <ProfileScreen user={user} profile={profile} onSaved={setProfile} />,
    discover: <DiscoverScreen />,
    saved: <SavedScreen user={user} navigate={navigate} requireAccount={requireAccount} />,
    marketplace: <MarketplaceScreen />,
    jobs: <JobsScreen user={user} requireAccount={requireAccount} navigate={navigate} />,
    report: <HelpDeskScreen />,
    more: <MoreScreen navigate={navigate} />,
    bulletin: <BulletinScreen />,
    orders: <OrdersScreen mode="orders" user={user} />,
    tracking: <OrdersScreen mode="tracking" user={user} />,
    sellers: <SellerScreen />,
    dictionary: <DictionaryScreen navigate={navigate} />,
    history: <HistoryScreen />,
    about: <AboutScreen />,
    policies: <PoliciesScreen />,
    contact: <ContactScreen navigate={navigate} />,
  };

  return <div className="app-frame app-frame-v2">
    <div className={`app-shell${immersive ? ' immersive-shell' : ''}`}>
      {view === 'home' || immersive ? null : <ScreenTopBar onBack={() => navigate(primary ? 'home' : 'more')} onHome={() => navigate('home')} />}
      <main className={view === 'home' ? 'screen home-root' : immersive ? 'screen showcase-screen' : 'screen'} id="main-content">{screens[view] || screens.home}</main>
      <BottomNav active={activeTab} onNavigate={navigate} />
    </div>
    {authPrompt ? <AccountSheet prompt={authPrompt} user={user} onClose={() => setAuthPrompt(null)} onSignedIn={() => { const destination = authPrompt.destination; setAuthPrompt(null); if (destination) setView(destination); }} /> : null}
  </div>;
}
