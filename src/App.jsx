import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleUserRound,
  CloudSun,
  Compass,
  ExternalLink,
  FileText,
  Heart,
  Home,
  Languages,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Menu,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingBag,
  Store,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react';
import { assets, MASINLOC_CENTER, routes, WEATHER_ENDPOINT, WEBSITE_BASE } from './config.js';
import { requestAccountDeletion } from './lib/account.js';
import {
  getCareerProfile,
  getEmergencyStatus,
  getJobProviders,
  getLiveJobs,
  getMemberProfile,
  getResumeVersions,
  getSavedContent,
  getSavedJobs,
  loadCanonicalData,
  randomReportSecret,
  saveMemberProfile,
  saveSignatureResume,
  sendEmailSignIn,
  signOut,
  submitEmergencyReport,
  supabase,
  toggleSavedContent,
  toggleSavedJob,
} from './lib/platform.js';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'report', label: 'Report', icon: ShieldAlert },
  { id: 'more', label: 'More', icon: Menu },
];

const weatherLabels = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Foggy', 48: 'Foggy',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain',
  65: 'Heavy rain', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

const incidentTypes = {
  pnp: [
    ['crime', 'Crime / ongoing incident'], ['threat', 'Threat / immediate danger'],
    ['suspicious_activity', 'Suspicious activity'], ['missing_person', 'Missing person'],
    ['accident', 'Road / vehicle accident'], ['traffic', 'Traffic / public safety'],
    ['other', 'Other police concern'],
  ],
  mdrrmo: [
    ['flood', 'Flood / rising water'], ['fire', 'Fire'], ['rescue', 'Rescue / trapped person'],
    ['medical', 'Medical emergency / ambulance'], ['storm_hazard', 'Storm / fallen tree / hazard'],
    ['evacuation', 'Evacuation assistance'], ['accident', 'Accident / rescue needed'],
    ['other', 'Other emergency / disaster concern'],
  ],
};

const reportStatusCopy = {
  saved_offline: ['Saved offline · not yet received', 'Stored on this device. PNP/MDRRMO has not received it yet.'],
  sending: ['Sending', 'A connection is available. Sending your report now.'],
  received: ['Received by emergency system', 'The server accepted your report. Human acknowledgement may still be pending.'],
  acknowledged: ['Acknowledged', 'An authorized responder has acknowledged this report.'],
  assigned: ['Responder assigned', 'The incident has been assigned to a unit or responder.'],
  dispatched: ['Dispatched', 'A response unit has been dispatched.'],
  en_route: ['Responder en route', 'The assigned response unit is on the way.'],
  on_scene: ['Responder on scene', 'The response team marked the incident as on scene.'],
  resolved: ['Resolved', 'The response team marked this incident resolved.'],
  closed: ['Closed', 'This incident record has been closed.'],
};

const reportStorageKey = 'masinloc-connect-active-report-v1';

function openExternal(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function getGreeting(firstName) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Maabig a bocla' : hour < 18 ? 'Maabig a apon' : 'Maabig a yabi';
  return firstName ? `${greeting}, ${firstName}` : `${greeting} cababali`;
}

function formatToday() {
  return new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
}

function shortDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function useMasinlocWeather() {
  const [weather, setWeather] = useState({ state: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    fetch(WEATHER_ENDPOINT(MASINLOC_CENTER), { signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Weather unavailable');
        return response.json();
      })
      .then((data) => setWeather({
        state: 'ready',
        temperature: Math.round(data.current.temperature_2m),
        condition: weatherLabels[data.current.weather_code] || 'Current weather',
      }))
      .catch((error) => {
        if (error.name !== 'AbortError') setWeather({ state: 'unavailable' });
      });
    return () => controller.abort();
  }, []);
  return weather;
}

function useCanonicalData(key) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const load = useCallback(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, status: 'loading', error: null }));
    loadCanonicalData(key, controller.signal)
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null, error });
      });
    return controller;
  }, [key]);
  useEffect(() => {
    const controller = load();
    return () => controller.abort();
  }, [load]);
  return { ...state, reload: load };
}

function App() {
  const [view, setView] = useState('home');
  const [authPrompt, setAuthPrompt] = useState(null);
  const [session, setSession] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [savedContent, setSavedContent] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [accountLoading, setAccountLoading] = useState(true);
  const weather = useMasinlocWeather();

  const user = session?.user || null;
  const firstName = memberProfile?.display_name?.trim()?.split(/\s+/)[0] || null;
  const activeTab = navItems.some((item) => item.id === view) ? view : 'more';

  const refreshUserState = useCallback(async (activeUser) => {
    if (!activeUser) {
      setMemberProfile(null);
      setSavedContent([]);
      setSavedJobs([]);
      return;
    }
    const [profile, content, jobs] = await Promise.all([
      getMemberProfile(activeUser.id),
      getSavedContent(activeUser.id),
      getSavedJobs(activeUser.id),
    ]);
    setMemberProfile(profile);
    setSavedContent(content);
    setSavedJobs(jobs);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
      refreshUserState(data.session?.user).catch(() => {});
      setAccountLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      refreshUserState(nextSession?.user).catch(() => {});
      setAccountLoading(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshUserState]);

  const requireAccount = useCallback((reason, afterSignInView) => {
    if (user) {
      if (afterSignInView) setView(afterSignInView);
      return true;
    }
    setAuthPrompt({ reason, afterSignInView });
    return false;
  }, [user]);

  const isContentSaved = useCallback((type, key) => (
    savedContent.some((item) => item.content_type === type && item.content_key === key)
  ), [savedContent]);

  const handleToggleContent = useCallback(async (type, key, reason) => {
    if (!user) {
      setAuthPrompt({ reason });
      return false;
    }
    const current = isContentSaved(type, key);
    const next = await toggleSavedContent(user.id, type, key, current);
    setSavedContent((items) => next
      ? [{ content_type: type, content_key: key, created_at: new Date().toISOString() }, ...items]
      : items.filter((item) => !(item.content_type === type && item.content_key === key)));
    return next;
  }, [user, isContentSaved]);

  const isJobSaved = useCallback((jobId) => savedJobs.some((item) => item.external_job_id === jobId), [savedJobs]);

  const handleToggleJob = useCallback(async (jobId) => {
    if (!user) {
      setAuthPrompt({ reason: 'save job opportunities and return to them from any device' });
      return false;
    }
    const current = isJobSaved(jobId);
    const next = await toggleSavedJob(user.id, jobId, current);
    setSavedJobs((items) => next
      ? [{ external_job_id: jobId, created_at: new Date().toISOString() }, ...items]
      : items.filter((item) => item.external_job_id !== jobId));
    return next;
  }, [user, isJobSaved]);

  const screenProps = {
    navigate: setView,
    user,
    memberProfile,
    weather,
    requireAccount,
    isContentSaved,
    onToggleContent: handleToggleContent,
    isJobSaved,
    onToggleJob: handleToggleJob,
  };

  let screen;
  switch (view) {
    case 'marketplace': screen = <MarketplaceScreen {...screenProps} />; break;
    case 'jobs': screen = <JobsScreen {...screenProps} />; break;
    case 'report': screen = <ReportScreen {...screenProps} />; break;
    case 'more': screen = <MoreScreen {...screenProps} />; break;
    case 'mabayani': screen = <MabayaniScreen {...screenProps} />; break;
    case 'dictionary': screen = <DictionaryScreen {...screenProps} />; break;
    case 'discover': screen = <DiscoverScreen {...screenProps} />; break;
    case 'profile': screen = <ProfileScreen {...screenProps} onProfileSaved={(profile) => setMemberProfile(profile)} />; break;
    case 'resume': screen = <ResumeScreen {...screenProps} />; break;
    default: screen = <HomeScreen {...screenProps} firstName={firstName} />;
  }

  return (
    <div className="app-frame">
      <div className="app-shell">
        <AppTopBar
          view={view}
          user={user}
          accountLoading={accountLoading}
          onBack={() => setView('more')}
          onProfile={() => user ? setView('profile') : setAuthPrompt({ reason: 'personalize your Masinloc Connect experience' })}
        />
        <main className="screen" id="main-content">{screen}</main>
        <BottomNav activeTab={activeTab} onNavigate={setView} />
      </div>
      {authPrompt ? (
        <AccountSheet
          prompt={authPrompt}
          user={user}
          onClose={() => setAuthPrompt(null)}
          onSignedIn={() => {
            const next = authPrompt.afterSignInView;
            setAuthPrompt(null);
            if (next) setView(next);
          }}
        />
      ) : null}
    </div>
  );
}

function AppTopBar({ view, user, accountLoading, onBack, onProfile }) {
  const secondary = !navItems.some((item) => item.id === view) && view !== 'home';
  return (
    <header className="app-topbar">
      {secondary ? (
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back to More"><ArrowLeft size={21} /></button>
      ) : (
        <button className="brand-button" type="button" onClick={() => openExternal(routes.website)} aria-label="Open Masinloc website">
          <img src={assets.logo} alt="Masinloc Zambales" />
        </button>
      )}
      <div className="topbar-actions">
        <button className="avatar-button" type="button" onClick={onProfile} aria-label={user ? 'Open profile' : 'Sign in'}>
          {accountLoading ? <LoaderCircle className="spin" size={23} /> : <CircleUserRound size={25} strokeWidth={1.75} />}
        </button>
      </div>
    </header>
  );
}

function HomeScreen({ weather, navigate, firstName, user, requireAccount }) {
  const marketplace = useCanonicalData('marketplace');
  const mabayani = useCanonicalData('mabayani');
  const featuredBusiness = marketplace.data?.businesses?.[0];
  const featuredStory = mabayani.data?.sections?.find((section) => section.number !== '00');

  return (
    <div className="screen-stack home-screen">
      <section className="welcome-block" aria-labelledby="home-greeting">
        <div>
          <p className="locality"><MapPin size={14} /> Masinloc, Zambales</p>
          <h1 id="home-greeting">{getGreeting(firstName)}</h1>
          <p className="today">{formatToday()}</p>
        </div>
        <div className="weather-chip" aria-live="polite">
          <CloudSun size={21} />
          <div>
            <strong>{weather.state === 'ready' ? `${weather.temperature}°C` : '—'}</strong>
            <span>{weather.state === 'ready' ? weather.condition : weather.state === 'loading' ? 'Loading weather' : 'Weather unavailable'}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-actions-title">
        <SectionHeading title="What do you need?" compact />
        <div className="quick-grid">
          <QuickAction className="urgent" icon={ShieldAlert} label="Report Incident" onClick={() => navigate('report')} />
          <QuickAction icon={ShoppingBag} label="Marketplace" onClick={() => navigate('marketplace')} />
          <QuickAction icon={BriefcaseBusiness} label="Find Jobs" onClick={() => navigate('jobs')} />
          <QuickAction icon={BookOpen} label="Mabayani" onClick={() => navigate('mabayani')} />
          <QuickAction icon={Languages} label="Dictionary" onClick={() => navigate('dictionary')} />
        </div>
      </section>

      <section className="source-card">
        <div className="source-copy">
          <span className="source-label">Masinloc to the World</span>
          <h2>The world finds us here.</h2>
          <p>The website publishes the verified source. This app turns the same Masinloc platform into a faster daily experience.</p>
          <button className="text-action" type="button" onClick={() => navigate('discover')}>Discover Masinloc <ChevronRight size={17} /></button>
        </div>
        <img src={assets.hero} alt="Masinloc community and heritage" />
      </section>

      <section>
        <SectionHeading eyebrow="Today in Masinloc" title="From the same platform" />
        <div className="home-feed">
          <button type="button" className="feed-card" onClick={() => navigate('marketplace')}>
            <span className="feed-icon"><Store size={20} /></span>
            <div><strong>{featuredBusiness?.name || 'Marketplace'}</strong><span>{featuredBusiness?.descriptor || 'Explore local businesses'}</span></div>
            <ChevronRight size={18} />
          </button>
          <button type="button" className="feed-card" onClick={() => navigate('mabayani')}>
            <span className="feed-icon"><BookOpen size={20} /></span>
            <div><strong>{featuredStory?.title || featuredStory?.label || 'Mabayani'}</strong><span>Continue the documented story of Masinloc.</span></div>
            <ChevronRight size={18} />
          </button>
          <button type="button" className="feed-card" onClick={() => navigate('jobs')}>
            <span className="feed-icon"><BriefcaseBusiness size={20} /></span>
            <div><strong>Verified opportunities</strong><span>Browse live jobs from trusted providers.</span></div>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {!user ? (
        <section>
          <SectionHeading eyebrow="For you" title="Make the app yours" />
          <button className="personalize-card" type="button" onClick={() => requireAccount('save jobs, products, stories and personalize what you see')}>
            <div className="personalize-icon"><UserRound size={22} /></div>
            <div><strong>Continue with Email</strong><span>Save what matters and access it again from another device.</span></div>
            <ChevronRight size={20} />
          </button>
        </section>
      ) : null}
    </div>
  );
}

function MarketplaceScreen({ user, requireAccount, isContentSaved, onToggleContent }) {
  const source = useCanonicalData('marketplace');
  const logos = useCanonicalData('marketplaceLogos');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const businesses = useMemo(() => {
    const items = source.data?.businesses || [];
    const needle = query.trim().toLowerCase();
    return items.filter((business) => {
      const inCategory = category === 'all' || business.category === category;
      const haystack = `${business.name} ${business.descriptor || ''} ${business.location || ''} ${business.description || ''}`.toLowerCase();
      return inCategory && (!needle || haystack.includes(needle));
    });
  }, [source.data, query, category]);

  return (
    <div className="screen-stack">
      <ScreenTitle title="Marketplace" subtitle="The same reviewed local directory from the Masinloc website, designed for mobile." />
      <SearchInput value={query} onChange={setQuery} placeholder="Search businesses" />

      {source.status === 'ready' ? (
        <div className="chip-row" aria-label="Marketplace categories">
          <button className={category === 'all' ? 'chip active' : 'chip'} onClick={() => setCategory('all')} type="button">All</button>
          {(source.data.categories || []).map((item) => (
            <button className={category === item.id ? 'chip active' : 'chip'} onClick={() => setCategory(item.id)} type="button" key={item.id}>{item.label}</button>
          ))}
        </div>
      ) : null}

      <AsyncState state={source} label="Marketplace" />

      {source.status === 'ready' ? (
        <section>
          <SectionHeading eyebrow={`${businesses.length} listing${businesses.length === 1 ? '' : 's'}`} title="Local businesses" compact />
          {businesses.length ? (
            <div className="market-grid">
              {businesses.map((business) => (
                <MarketplaceCard
                  key={business.slug}
                  business={business}
                  logo={logos.data?.[business.slug]}
                  saved={isContentSaved('marketplace', business.slug)}
                  onSave={() => onToggleContent('marketplace', business.slug, 'save Marketplace businesses and return to them from any device')}
                />
              ))}
            </div>
          ) : <EmptyState icon={Search} title="No matching businesses" body="Try another search or category." />}
        </section>
      ) : null}

      <section className="business-card">
        <div className="business-icon"><Store size={24} /></div>
        <div><span>For business owners</span><h2>Sell in Marketplace. Run it with Masinloc POS.</h2><p>POS stays inside the business journey, while Marketplace stays simple for residents and visitors.</p></div>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => requireAccount('create a business profile and start selling')}>Start Selling</button>
          <button className="secondary-button" type="button" onClick={() => openExternal(routes.pos)}>Learn More</button>
        </div>
      </section>
    </div>
  );
}

function MarketplaceCard({ business, logo, saved, onSave }) {
  const logoUrl = logo ? `${WEBSITE_BASE}/assets/marketplace/${business.slug}-320.avif` : null;
  return (
    <article className="market-card">
      <div className="market-visual">
        {logoUrl ? <img src={logoUrl} alt={logo.alt || `${business.name} logo`} onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <span>{business.name.slice(0, 1)}</span>}
        <button className={saved ? 'save-button saved' : 'save-button'} type="button" onClick={onSave} aria-label={saved ? `Remove ${business.name} from saved` : `Save ${business.name}`}>
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="market-copy">
        <span className="overline">{business.descriptor || 'Local business'}</span>
        <h3>{business.name}</h3>
        <p className="line-clamp-2">{business.description}</p>
        <span className="location-line"><MapPin size={14} /> {business.location}</span>
        {business.facebook ? <button type="button" className="text-action" onClick={() => openExternal(business.facebook)}>View public page <ExternalLink size={15} /></button> : null}
      </div>
    </article>
  );
}

function JobsScreen({ user, requireAccount, isJobSaved, onToggleJob, navigate }) {
  const [state, setState] = useState({ status: 'loading', jobs: [], providers: [], error: null });
  const [query, setQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const load = useCallback(() => {
    setState((current) => ({ ...current, status: 'loading', error: null }));
    Promise.all([getLiveJobs(), getJobProviders()])
      .then(([jobs, providers]) => setState({ status: 'ready', jobs, providers, error: null }))
      .catch((error) => setState({ status: 'error', jobs: [], providers: [], error }));
  }, []);
  useEffect(() => { load(); }, [load]);

  const providerMap = useMemo(() => new Map(state.providers.map((provider) => [provider.id, provider])), [state.providers]);
  const jobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.jobs.filter((job) => {
      const text = `${job.title} ${job.company} ${job.location} ${job.employment_type || ''} ${job.work_setup || ''}`.toLowerCase();
      const remoteMatch = !remoteOnly || /home|remote|online/i.test(`${job.work_setup || ''} ${job.employment_type || ''}`);
      return remoteMatch && (!needle || text.includes(needle));
    });
  }, [state.jobs, query, remoteOnly]);

  return (
    <div className="screen-stack">
      <ScreenTitle title="Find Jobs" subtitle="Live opportunities from the same trusted jobs system used by Masinloc Connect." />
      <SearchInput value={query} onChange={setQuery} placeholder="Search job, company or location" />
      <div className="chip-row">
        <button className={!remoteOnly ? 'chip active' : 'chip'} type="button" onClick={() => setRemoteOnly(false)}>All jobs</button>
        <button className={remoteOnly ? 'chip active' : 'chip'} type="button" onClick={() => setRemoteOnly(true)}>Work from home</button>
      </div>

      {state.status === 'loading' ? <LoadingState label="Loading verified jobs" /> : null}
      {state.status === 'error' ? <ErrorState title="Jobs could not load" onRetry={load} /> : null}

      {state.status === 'ready' ? (
        <section>
          <SectionHeading eyebrow={`${jobs.length} live opportunit${jobs.length === 1 ? 'y' : 'ies'}`} title="Latest jobs" compact />
          {jobs.length ? <div className="job-list">{jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              provider={providerMap.get(job.provider_id)}
              saved={isJobSaved(job.id)}
              onSave={() => onToggleJob(job.id)}
            />
          ))}</div> : <EmptyState icon={Search} title="No matching jobs" body="Try another keyword or turn off the work-from-home filter." />}
        </section>
      ) : null}

      <section>
        <SectionHeading title="Your job tools" compact />
        <div className="utility-list">
          <button type="button" onClick={() => user ? navigate('resume') : requireAccount('create and keep your Signature Resume', 'resume')}>
            <FileText size={21} /><div><strong>Signature Resume</strong><span>Create and keep a reusable career profile.</span></div><ChevronRight size={19} />
          </button>
          <button type="button" onClick={() => user ? null : requireAccount('save job opportunities')}>
            <Heart size={21} /><div><strong>Saved Jobs</strong><span>{user ? 'Saved jobs stay connected to your account.' : 'Continue with Email to keep opportunities.'}</span></div><ChevronRight size={19} />
          </button>
        </div>
      </section>
    </div>
  );
}

function JobCard({ job, provider, saved, onSave }) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <div><span className="overline">{job.work_setup || job.employment_type || 'Opportunity'}</span><h3>{job.title}</h3><p>{job.company}</p></div>
        <button className={saved ? 'save-button saved' : 'save-button'} type="button" onClick={onSave} aria-label={saved ? 'Remove saved job' : 'Save job'}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="job-meta">
        <span><MapPin size={14} /> {job.location}</span>
        {job.employment_type ? <span><BriefcaseBusiness size={14} /> {job.employment_type}</span> : null}
      </div>
      {job.requirements_excerpt ? <p className="job-note">{job.requirements_excerpt}</p> : null}
      <div className="job-footer">
        <div><span className="verified-dot"><Check size={12} /></span><span>{provider?.attribution_label || provider?.name || 'Trusted Job Provider'} · verified {shortDate(job.published_at)}</span></div>
        <button className="primary-button small" type="button" onClick={() => openExternal(job.apply_url)}>Apply <ExternalLink size={15} /></button>
      </div>
    </article>
  );
}

function ReportScreen() {
  const [agency, setAgency] = useState('');
  const [mode, setMode] = useState('emergency');
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeReport, setActiveReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem(reportStorageKey) || 'null'); } catch { return null; }
  });
  const [form, setForm] = useState({ incident_type: '', description: '', barangay: '', landmark: '', reporter_name: '', reporter_contact: '', contact_preference: 'chat' });

  const persistReport = useCallback((report) => {
    setActiveReport(report);
    localStorage.setItem(reportStorageKey, JSON.stringify(report));
  }, []);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setFormError('Location is not supported on this device. Enter a barangay or landmark instead.');
      return;
    }
    setLocating(true);
    setFormError('');
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy_m: position.coords.accuracy,
        location_captured_at: new Date(position.timestamp || Date.now()).toISOString(),
      });
      setLocating(false);
    }, () => {
      setLocation(null);
      setLocating(false);
      setFormError('GPS is unavailable. Enter a barangay or nearest landmark so responders know where help is needed.');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }, []);

  const deliverReport = useCallback(async (report) => {
    if (!navigator.onLine) return report;
    const sendingReport = { ...report, sync_state: 'sending', status: 'sending', updated_local_at: new Date().toISOString() };
    persistReport(sendingReport);
    try {
      const data = await submitEmergencyReport(sendingReport);
      const delivered = {
        ...sendingReport,
        sync_state: 'delivered',
        status: data.status || 'received',
        reference: data.reference || sendingReport.reference,
        received_at: data.received_at || sendingReport.received_at,
        updated_local_at: new Date().toISOString(),
        last_error: null,
      };
      persistReport(delivered);
      return delivered;
    } catch (error) {
      const queued = { ...report, sync_state: 'queued', status: 'saved_offline', last_error: error.message, updated_local_at: new Date().toISOString() };
      persistReport(queued);
      return queued;
    }
  }, [persistReport]);

  useEffect(() => {
    const retry = () => {
      if (activeReport?.sync_state === 'queued') deliverReport(activeReport);
    };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [activeReport, deliverReport]);

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!agency) return setFormError('Choose PNP or MDRRMO.');
    if (!form.incident_type) return setFormError('Choose an incident type.');
    if (form.description.trim().length < 3) return setFormError('Describe what is happening.');
    if (!location && !form.barangay.trim() && !form.landmark.trim()) return setFormError('Allow GPS or enter a barangay / landmark.');

    setSending(true);
    const report = {
      client_report_id: crypto.randomUUID(),
      report_secret: randomReportSecret(),
      target_agency: agency,
      report_mode: mode,
      incident_type: form.incident_type,
      description: form.description.trim(),
      reporter_name: form.reporter_name.trim() || null,
      reporter_contact: form.reporter_contact.trim() || null,
      contact_preference: form.contact_preference,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      accuracy_m: location?.accuracy_m ?? null,
      location_captured_at: location?.location_captured_at ?? null,
      barangay: form.barangay.trim() || null,
      landmark: form.landmark.trim() || null,
      source_created_at: new Date().toISOString(),
      sync_state: 'queued',
      status: 'saved_offline',
      reference: null,
      received_at: null,
      updated_local_at: new Date().toISOString(),
    };
    persistReport(report);
    await deliverReport(report);
    setSending(false);
  };

  const refreshStatus = async () => {
    if (!activeReport || activeReport.sync_state !== 'delivered') return;
    setSending(true);
    try {
      const data = await getEmergencyStatus(activeReport.client_report_id, activeReport.report_secret);
      const incident = data.incident || {};
      persistReport({
        ...activeReport,
        status: incident.status || activeReport.status,
        reference: incident.public_reference || activeReport.reference,
        received_at: incident.received_at || activeReport.received_at,
        acknowledged_at: incident.acknowledged_at || null,
        assigned_unit: incident.assigned_unit || null,
        resolved_at: incident.resolved_at || null,
        messages: data.messages || [],
        updated_local_at: new Date().toISOString(),
      });
    } catch (error) {
      setFormError(error.message || 'Could not refresh report status.');
    } finally { setSending(false); }
  };

  if (activeReport) {
    const copy = reportStatusCopy[activeReport.status] || [activeReport.status, 'Status updated.'];
    return (
      <div className="screen-stack report-screen">
        <ScreenTitle title="Your Report" subtitle="This report stays on this device even when you are not signed in." />
        <section className={activeReport.sync_state === 'delivered' ? 'status-card delivered' : 'status-card offline'}>
          {activeReport.sync_state === 'delivered' ? <Check size={26} /> : <WifiOff size={26} />}
          <div><span>{activeReport.reference || 'Pending delivery'}</span><h2>{copy[0]}</h2><p>{copy[1]}</p></div>
        </section>
        <div className="report-facts">
          <div><span>Agency</span><strong>{activeReport.target_agency?.toUpperCase()}</strong></div>
          <div><span>Incident</span><strong>{activeReport.incident_type?.replaceAll('_', ' ')}</strong></div>
          <div><span>Location</span><strong>{activeReport.barangay || activeReport.landmark || (activeReport.latitude ? 'GPS captured' : 'Not available')}</strong></div>
        </div>
        {activeReport.messages?.length ? <section><SectionHeading title="Responder messages" compact /><div className="message-list">{activeReport.messages.map((message, index) => <div className="message-card" key={message.id || index}><MessageCircle size={17} /><p>{message.message || message.body || String(message)}</p></div>)}</div></section> : null}
        <div className="button-column">
          {activeReport.sync_state === 'queued' ? <button className="primary-button danger" type="button" disabled={!navigator.onLine || sending} onClick={() => deliverReport(activeReport)}>{sending ? 'Sending…' : 'Retry sending'}</button> : null}
          {activeReport.sync_state === 'delivered' ? <button className="primary-button" type="button" disabled={sending} onClick={refreshStatus}><RefreshCw size={17} /> {sending ? 'Refreshing…' : 'Refresh status'}</button> : null}
          <button className="secondary-button" type="button" onClick={() => { localStorage.removeItem(reportStorageKey); setActiveReport(null); }}>Start another report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-stack report-screen">
      <ScreenTitle title="Report Incident" subtitle="Get to the right help quickly. An account is never required to report." />
      <a className="emergency-banner" href="tel:911"><ShieldAlert size={27} /><div><strong>Immediate life-threatening emergency?</strong><span>Call 911 when you are able. Masinloc Connect is an additional connection to local responders.</span></div><ChevronRight size={18} /></a>

      <form className="report-form" onSubmit={submit}>
        <fieldset>
          <legend>Who do you need?</legend>
          <div className="responder-grid">
            <button className={agency === 'pnp' ? 'selected' : ''} type="button" onClick={() => { setAgency('pnp'); setForm((current) => ({ ...current, incident_type: '' })); }}><span className="responder-icon police"><ShieldAlert size={25} /></span><strong>PNP</strong><span>Police, safety, crime or immediate danger</span></button>
            <button className={agency === 'mdrrmo' ? 'selected' : ''} type="button" onClick={() => { setAgency('mdrrmo'); setForm((current) => ({ ...current, incident_type: '' })); }}><span className="responder-icon rescue"><ShieldAlert size={25} /></span><strong>MDRRMO</strong><span>Rescue, disaster, medical or hazard response</span></button>
          </div>
        </fieldset>

        {agency ? <>
          <fieldset><legend>How urgent is this?</legend><div className="segmented"><button className={mode === 'emergency' ? 'active' : ''} type="button" onClick={() => setMode('emergency')}>Emergency</button><button className={mode === 'assistance' ? 'active' : ''} type="button" onClick={() => setMode('assistance')}>Assistance</button></div><p className="field-help">If you are unsure, choose Emergency. The agency decides operational priority.</p></fieldset>
          <label>Incident type<select value={form.incident_type} onChange={(event) => setForm({ ...form, incident_type: event.target.value })}><option value="">Choose incident type</option>{incidentTypes[agency].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>What is happening?<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="4" placeholder="Describe what responders need to know." /></label>

          <section className={location ? 'location-card captured' : 'location-card'}>
            <LocateFixed size={22} />
            <div><strong>{location ? 'Location captured' : 'Share your location'}</strong><span>{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} · ±${Math.round(location.accuracy_m)}m` : 'GPS helps responders find you. You can enter your location manually instead.'}</span></div>
            <button type="button" onClick={captureLocation} disabled={locating}>{locating ? 'Locating…' : location ? 'Refresh' : 'Use GPS'}</button>
          </section>
          <div className="two-fields"><label>Barangay<input value={form.barangay} onChange={(event) => setForm({ ...form, barangay: event.target.value })} placeholder="e.g. Inhobol" /></label><label>Nearest landmark<input value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} placeholder="Optional if GPS works" /></label></div>
          <details className="optional-details"><summary>Optional contact details</summary><div className="details-fields"><label>Your name<input value={form.reporter_name} onChange={(event) => setForm({ ...form, reporter_name: event.target.value })} /></label><label>Contact number or email<input value={form.reporter_contact} onChange={(event) => setForm({ ...form, reporter_contact: event.target.value })} /></label><label>Preferred contact<select value={form.contact_preference} onChange={(event) => setForm({ ...form, contact_preference: event.target.value })}><option value="chat">In-app / report chat</option><option value="call">Call</option><option value="sms">SMS</option></select></label></div></details>
          {formError ? <div className="form-error"><AlertTriangle size={18} /> {formError}</div> : null}
          <button className="primary-button danger full" type="submit" disabled={sending}>{sending ? 'Saving report…' : navigator.onLine ? 'Send report' : 'Save report offline'}</button>
          <p className="privacy-note">Your report is stored on this device first. “Received” is shown only after the emergency server confirms delivery.</p>
        </> : null}
      </form>
    </div>
  );
}

function MoreScreen({ navigate, user, requireAccount }) {
  return (
    <div className="screen-stack">
      <ScreenTitle title="More" subtitle="Our stories, language, places and your account." />
      <section className="mabayani-card" onClick={() => navigate('mabayani')} role="button" tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && navigate('mabayani')}>
        <img src={assets.mabayaniHistory} alt="Historical image used by the Masinloc Mabayani archive" />
        <div><span>History & heritage</span><h2>Mabayani</h2><p>Read the documented story in an app-first format, from the same source as the website.</p><span className="card-link">Open Mabayani <ChevronRight size={17} /></span></div>
      </section>
      <div className="utility-list">
        <button type="button" onClick={() => navigate('dictionary')}><Languages size={21} /><div><strong>Sambal Tina Dictionary</strong><span>Search the full website dictionary without leaving the app.</span></div><ChevronRight size={19} /></button>
        <button type="button" onClick={() => navigate('discover')}><Compass size={21} /><div><strong>Discover Masinloc</strong><span>Places, food, culture and evidence-led stories.</span></div><ChevronRight size={19} /></button>
        <button type="button" onClick={() => navigate('report')}><ShieldAlert size={21} /><div><strong>Help Desk</strong><span>Report directly to the existing PNP/MDRRMO system.</span></div><ChevronRight size={19} /></button>
        <button type="button" onClick={() => user ? navigate('profile') : requireAccount('save, personalize and access your account')}><CircleUserRound size={21} /><div><strong>{user ? 'My Profile' : 'Continue with Email'}</strong><span>{user ? 'Saved items, profile and account.' : 'Register only when you want personalized features.'}</span></div><ChevronRight size={19} /></button>
      </div>
      <section className="about-card"><img src={assets.logo} alt="Masinloc" /><div><span>One platform. Two experiences.</span><h2>Connecting Masinloqueños to the World.</h2><p>The website remains the publishing source. The app uses the same data and services with a mobile-first experience.</p></div></section>
    </div>
  );
}

function MabayaniScreen({ isContentSaved, onToggleContent }) {
  const source = useCanonicalData('mabayani');
  const [selected, setSelected] = useState(null);
  const sections = source.data?.sections || [];
  const section = selected ? sections.find((item) => item.slug === selected) : sections[0];

  return (
    <div className="screen-stack editorial-screen">
      <ScreenTitle title="Mabayani" subtitle="The documented human history of Masinloc, using the website's canonical public source." />
      <AsyncState state={source} label="Mabayani" />
      {source.status === 'ready' && section ? <>
        <div className="story-map" aria-label="Mabayani chapters">{sections.map((item) => <button type="button" className={item.slug === section.slug ? 'story-dot active' : 'story-dot'} key={item.slug} onClick={() => setSelected(item.slug)}><span>{item.number}</span>{item.title || item.label}</button>)}</div>
        <article className="story-reader">
          <div className="story-reader-head"><div><span className="overline">Chapter {section.number}</span><h2>{section.title || section.label}</h2></div><button className={isContentSaved('mabayani', section.slug) ? 'save-button saved' : 'save-button'} type="button" onClick={() => onToggleContent('mabayani', section.slug, 'save Mabayani chapters and continue reading later')}><Heart size={19} fill={isContentSaved('mabayani', section.slug) ? 'currentColor' : 'none'} /></button></div>
          {(section.public_copy || []).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {section.record ? <details className="record-drawer"><summary>View the record</summary><div>{section.record.evidence_status?.length ? <RecordGroup title="Evidence status" items={section.record.evidence_status} /> : null}{section.record.what_we_know?.length ? <RecordGroup title="What we know" items={section.record.what_we_know} /> : null}{section.record.what_remains_uncertain?.length ? <RecordGroup title="What remains uncertain" items={section.record.what_remains_uncertain} /> : null}{section.record.sources?.length ? <RecordGroup title="Sources" items={section.record.sources} /> : null}</div></details> : null}
        </article>
      </> : null}
    </div>
  );
}

function RecordGroup({ title, items }) {
  return <section className="record-group"><h3>{title}</h3>{items.map((item, index) => <p key={index}>{item}</p>)}</section>;
}

function DictionaryScreen({ isContentSaved, onToggleContent }) {
  const source = useCanonicalData('dictionary');
  const [query, setQuery] = useState('');
  const entries = useMemo(() => {
    if (!source.data?.entries) return [];
    const columns = source.data.columns || ['tina', 'pos', 'en', 'fil', 'pages', 'status', 'conf', 'notes'];
    return source.data.entries.map((entry) => Object.fromEntries(columns.map((column, index) => [column, entry[index]])));
  }, [source.data]);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle ? entries.filter((entry) => `${entry.tina} ${entry.en || ''} ${entry.fil || ''}`.toLowerCase().includes(needle)) : entries;
    return filtered.slice(0, 60);
  }, [entries, query]);
  const dailyWord = useMemo(() => {
    if (!entries.length) return null;
    const day = Math.floor(Date.now() / 86400000);
    return entries[day % entries.length];
  }, [entries]);

  return (
    <div className="screen-stack dictionary-screen">
      <ScreenTitle title="Sambal Tina" subtitle="Search the same source-supported dictionary published by the Masinloc website." />
      <SearchInput value={query} onChange={setQuery} placeholder="Search Sambal Tina, English or Filipino" autoFocus={false} />
      <AsyncState state={source} label="Dictionary" />
      {source.status === 'ready' ? <>
        {dailyWord && !query ? <section className="word-of-day"><span>Word of the day</span><h2>{dailyWord.tina}</h2><p>{dailyWord.en || dailyWord.fil || 'Source entry'}</p><button className={isContentSaved('dictionary', dailyWord.tina) ? 'text-action saved-text' : 'text-action'} type="button" onClick={() => onToggleContent('dictionary', dailyWord.tina, 'save Sambal Tina words and continue learning across devices')}><Heart size={16} fill={isContentSaved('dictionary', dailyWord.tina) ? 'currentColor' : 'none'} /> {isContentSaved('dictionary', dailyWord.tina) ? 'Saved' : 'Save word'}</button></section> : null}
        <section><SectionHeading eyebrow={`${matches.length}${entries.length > 60 && !query ? '+' : ''} shown · ${entries.length.toLocaleString()} entries`} title={query ? 'Search results' : 'Dictionary'} compact /><div className="dictionary-list">{matches.map((entry, index) => {
          const key = `${entry.tina}-${entry.pos || ''}-${index}`;
          const saved = isContentSaved('dictionary', entry.tina);
          return <article className="dictionary-entry" key={key}><div><span className="part-of-speech">{entry.pos || 'entry'}</span><h3>{entry.tina}</h3><p><strong>English:</strong> {entry.en || '—'}</p>{entry.fil ? <p><strong>Filipino:</strong> {entry.fil}</p> : null}{entry.pages ? <small>Source page: {entry.pages}</small> : null}</div><button className={saved ? 'save-button saved' : 'save-button'} type="button" aria-label={saved ? `Remove ${entry.tina} from saved` : `Save ${entry.tina}`} onClick={() => onToggleContent('dictionary', entry.tina, 'save Sambal Tina words and continue learning across devices')}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></article>;
        })}</div>{!matches.length ? <EmptyState icon={Languages} title="No matching word" body="Try a different spelling or search in English or Filipino." /> : null}</section>
      </> : null}
    </div>
  );
}

function DiscoverScreen() {
  const source = useCanonicalData('discover');
  const [theme, setTheme] = useState('all');
  const [selected, setSelected] = useState(null);
  const articles = source.data?.articles || [];
  const visible = theme === 'all' ? articles : articles.filter((article) => article.theme === theme);
  const article = selected ? articles.find((item) => item.slug === selected) : null;

  if (article) {
    return <div className="screen-stack editorial-screen"><button className="back-inline" type="button" onClick={() => setSelected(null)}><ArrowLeft size={17} /> All Discover stories</button><article className="discover-reader"><span className="overline">{source.data?.themes?.find((item) => item.id === article.theme)?.name || 'Discover Masinloc'}</span><h1>{article.title}</h1><p className="deck">{article.deck}</p>{(article.body || []).map((block, index) => block.type === 'h2' ? <h2 key={index}>{block.text}</h2> : block.type === 'h3' ? <h3 key={index}>{block.text}</h3> : <p key={index}>{block.text}</p>)}</article></div>;
  }

  return (
    <div className="screen-stack">
      <ScreenTitle title={source.data?.section?.name || 'Discover Masinloc'} subtitle={source.data?.section?.intro || 'Places, food, culture and stories from Masinloc.'} />
      <AsyncState state={source} label="Discover" />
      {source.status === 'ready' ? <>
        <div className="chip-row"><button className={theme === 'all' ? 'chip active' : 'chip'} type="button" onClick={() => setTheme('all')}>All</button>{(source.data.themes || []).map((item) => <button className={theme === item.id ? 'chip active' : 'chip'} type="button" onClick={() => setTheme(item.id)} key={item.id}>{item.name}</button>)}</div>
        <div className="discover-list">{visible.map((item) => <button className="discover-card" type="button" key={item.slug} onClick={() => setSelected(item.slug)}><div><span>{shortDate(item.updated || item.published)}</span><h3>{item.title}</h3><p>{item.deck}</p></div><ChevronRight size={19} /></button>)}</div>
      </> : null}
    </div>
  );
}

function ProfileScreen({ user, memberProfile, onProfileSaved, navigate }) {
  const [form, setForm] = useState({ display_name: memberProfile?.display_name || '', current_location: memberProfile?.current_location || '' });
  const [state, setState] = useState('idle');
  const [deleteState, setDeleteState] = useState('idle');
  if (!user) return <EmptyState icon={UserRound} title="Sign in to open your profile" body="Registration is only required for saved and personalized features." />;

  const save = async (event) => {
    event.preventDefault();
    setState('saving');
    try {
      const profile = await saveMemberProfile(user.id, form);
      onProfileSaved(profile);
      setState('saved');
    } catch { setState('error'); }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm('Delete your Masinloc Connect account? Your profile, saved items, saved jobs and resume data will be removed. This cannot be undone.');
    if (!confirmed) return;
    setDeleteState('deleting');
    try {
      await requestAccountDeletion();
      setDeleteState('deleted');
      navigate('home');
    } catch (error) {
      setDeleteState('error');
    }
  };

  return (
    <div className="screen-stack profile-screen">
      <ScreenTitle title="My Profile" subtitle={user.email} />
      <form className="profile-form" onSubmit={save}><label>Name<input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} placeholder="How should Masinloc Connect greet you?" /></label><label>Location / Barangay<input value={form.current_location} onChange={(event) => setForm({ ...form, current_location: event.target.value })} placeholder="Optional" /></label><button className="primary-button full" disabled={state === 'saving'} type="submit">{state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Save profile'}</button>{state === 'error' ? <p className="form-error">Could not save your profile right now.</p> : null}</form>
      <div className="utility-list"><button type="button" onClick={() => navigate('resume')}><FileText size={21} /><div><strong>Signature Resume</strong><span>Your reusable career profile.</span></div><ChevronRight size={19} /></button></div>
      <button className="secondary-button full" type="button" onClick={() => signOut()}>Sign out</button>
      <section className="account-danger-zone" aria-labelledby="delete-account-title">
        <h2 id="delete-account-title">Delete account</h2>
        <p>Deletes your account, profile, saved items, saved jobs and resume data. Emergency reports and required transaction or audit records may be retained where needed for safety or recordkeeping without an active account.</p>
        {deleteState === 'error' ? <p className="form-error">Could not delete your account right now. Please try again.</p> : null}
        <button className="secondary-button full" type="button" disabled={deleteState === 'deleting'} onClick={deleteAccount}>{deleteState === 'deleting' ? 'Deleting account…' : 'Delete account'}</button>
      </section>
    </div>
  );
}

function ResumeScreen({ user, requireAccount }) {
  const [profile, setProfile] = useState(null);
  const [versions, setVersions] = useState([]);
  const [state, setState] = useState('loading');
  const [form, setForm] = useState({ name: 'Signature Resume', full_name: '', current_location: '', target_role: '', skills: '', profile_summary: '', availability: '' });

  useEffect(() => {
    if (!user) { setState('signed-out'); return; }
    Promise.all([getCareerProfile(user.id), getResumeVersions(user.id)]).then(([career, resumes]) => {
      setProfile(career);
      setVersions(resumes);
      setForm((current) => ({
        ...current,
        full_name: career?.full_name || '',
        current_location: career?.current_location || '',
        target_role: career?.target_roles?.[0] || '',
        skills: career?.skills?.join(', ') || '',
        profile_summary: career?.profile_summary || '',
        availability: career?.availability || '',
      }));
      setState('ready');
    }).catch(() => setState('error'));
  }, [user]);

  if (!user) return <div className="screen-stack"><ScreenTitle title="Signature Resume" subtitle="Create once and keep it with your Masinloc Connect account." /><button className="primary-button" type="button" onClick={() => requireAccount('create and keep your Signature Resume', 'resume')}>Continue with Email</button></div>;

  const save = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim() || !form.target_role.trim()) { setState('invalid'); return; }
    setState('saving');
    try {
      const created = await saveSignatureResume(user, form);
      setVersions((items) => [created, ...items]);
      setState('saved');
    } catch { setState('error'); }
  };

  return (
    <div className="screen-stack resume-screen">
      <ScreenTitle title="Signature Resume" subtitle="Stored in the same career system as Masinloc Connect jobs." />
      {state === 'loading' ? <LoadingState label="Loading your career profile" /> : null}
      <form className="profile-form" onSubmit={save}>
        <label>Resume name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Full name<input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label>
        <label>Current location<input value={form.current_location} onChange={(event) => setForm({ ...form, current_location: event.target.value })} /></label>
        <label>Target role<input required value={form.target_role} onChange={(event) => setForm({ ...form, target_role: event.target.value })} placeholder="e.g. Customer Service Representative" /></label>
        <label>Skills<input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Separate skills with commas" /></label>
        <label>Profile summary<textarea rows="4" value={form.profile_summary} onChange={(event) => setForm({ ...form, profile_summary: event.target.value })} /></label>
        <label>Availability<input value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })} placeholder="e.g. Immediately available" /></label>
        {(state === 'invalid' || state === 'error') ? <div className="form-error"><AlertTriangle size={17} /> {state === 'invalid' ? 'Add your full name and target role.' : 'Could not save the resume right now.'}</div> : null}
        <button className="primary-button full" type="submit" disabled={state === 'saving'}>{state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved · Create another version' : 'Save Signature Resume'}</button>
      </form>
      {versions.length ? <section><SectionHeading title="Resume versions" compact /><div className="resume-list">{versions.map((version) => <div className="resume-version" key={version.id}><FileText size={20} /><div><strong>{version.name}</strong><span>{version.target_role || 'General resume'} · {shortDate(version.updated_at || version.created_at)}</span></div>{version.is_primary ? <span className="primary-tag">Primary</span> : null}</div>)}</div></section> : null}
    </div>
  );
}

function AccountSheet({ prompt, user, onClose, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => { if (user) onSignedIn(); }, [user, onSignedIn]);

  const submit = async (event) => {
    event.preventDefault();
    setState('sending');
    setMessage('');
    try {
      await sendEmailSignIn(email);
      setState('sent');
      setMessage('Check your email and open the secure sign-in link.');
    } catch (error) {
      setState('error');
      setMessage(error.message || 'Could not send the sign-in email.');
    }
  };

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="account-sheet" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <div className="sheet-handle" />
        <button className="sheet-close" type="button" onClick={onClose} aria-label="Close"><X size={21} /></button>
        <div className="account-mark"><CircleUserRound size={28} /></div>
        <span className="overline">Masinloc Connect account</span>
        <h2 id="account-title">Continue with Email</h2>
        <p>Create an account only when you want to {prompt.reason || 'save and personalize your experience'}.</p>
        <form onSubmit={submit}><label>Email address<input type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><button className="primary-button full" type="submit" disabled={state === 'sending' || state === 'sent'}>{state === 'sending' ? 'Sending…' : state === 'sent' ? 'Email sent' : 'Continue with Email'}</button></form>
        {message ? <div className={state === 'error' ? 'sheet-message error' : 'sheet-message'}>{state === 'sent' ? <Check size={17} /> : <AlertTriangle size={17} />}{message}</div> : null}
        <button className="text-button" type="button" onClick={onClose}>Not now</button>
        <small>No account is required to browse or report an incident.</small>
      </section>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, className = '' }) {
  return <button type="button" className={`quick-action ${className}`} onClick={onClick}><span className="quick-icon"><Icon size={23} strokeWidth={1.9} /></span><span>{label}</span></button>;
}

function BottomNav({ activeTab, onNavigate }) {
  return <nav className="bottom-nav" aria-label="Primary navigation">{navItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={activeTab === id ? 'active' : ''} onClick={() => onNavigate(id)} aria-current={activeTab === id ? 'page' : undefined}><Icon size={21} strokeWidth={activeTab === id ? 2.2 : 1.8} /><span>{label}</span></button>)}</nav>;
}

function ScreenTitle({ title, subtitle }) {
  return <header className="screen-title"><h1>{title}</h1><p>{subtitle}</p></header>;
}

function SectionHeading({ eyebrow, title, compact = false }) {
  return <div className={`section-heading ${compact ? 'compact' : ''}`}><div>{eyebrow ? <span>{eyebrow}</span> : null}<h2>{title}</h2></div></div>;
}

function SearchInput({ value, onChange, placeholder, autoFocus = false }) {
  return <label className="search-field"><Search size={19} /><input value={value} autoFocus={autoFocus} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><button type="button" className={value ? 'clear-search visible' : 'clear-search'} onClick={() => onChange('')} aria-label="Clear search"><X size={16} /></button></label>;
}

function LoadingState({ label }) {
  return <div className="async-state"><LoaderCircle className="spin" size={23} /><strong>{label}</strong></div>;
}

function ErrorState({ title, onRetry }) {
  return <div className="async-state error"><AlertTriangle size={22} /><div><strong>{title}</strong><span>Check your connection and try again.</span></div>{onRetry ? <button type="button" onClick={onRetry}><RefreshCw size={16} /> Retry</button> : null}</div>;
}

function AsyncState({ state, label }) {
  if (state.status === 'loading') return <LoadingState label={`Loading ${label}`} />;
  if (state.status === 'error') return <ErrorState title={`${label} could not load`} onRetry={() => { const controller = state.reload(); return () => controller?.abort(); }} />;
  return null;
}

function EmptyState({ icon: Icon, title, body }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={26} /></span><h2>{title}</h2><p>{body}</p></div>;
}

export default App;
