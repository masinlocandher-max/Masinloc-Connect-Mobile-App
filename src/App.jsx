import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleUserRound,
  CloudSun,
  Compass,
  Heart,
  Home,
  Languages,
  MapPin,
  Menu,
  Search,
  ShieldAlert,
  ShoppingBag,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { assets, MASINLOC_CENTER, routes, WEATHER_ENDPOINT } from './config.js';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'report', label: 'Report', icon: ShieldAlert },
  { id: 'more', label: 'More', icon: Menu },
];

const weatherLabels = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

function useMasinlocWeather() {
  const [weather, setWeather] = useState({ state: 'loading' });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch(WEATHER_ENDPOINT(MASINLOC_CENTER), {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Weather request failed');
        const data = await response.json();
        if (!active) return;
        const current = data.current;
        setWeather({
          state: 'ready',
          temperature: Math.round(current.temperature_2m),
          condition: weatherLabels[current.weather_code] || 'Current weather',
        });
      } catch (error) {
        if (!active || error.name === 'AbortError') return;
        setWeather({ state: 'unavailable' });
      }
    }

    loadWeather();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return weather;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Maabig a bocla cababali';
  if (hour < 18) return 'Maabig a apon cababali';
  return 'Maabig a yabi cababali';
}

function formatToday() {
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function openExternal(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [authPrompt, setAuthPrompt] = useState(null);
  const weather = useMasinlocWeather();

  const screen = useMemo(() => {
    switch (activeTab) {
      case 'marketplace':
        return <MarketplaceScreen onRequireAccount={setAuthPrompt} />;
      case 'jobs':
        return <JobsScreen onRequireAccount={setAuthPrompt} />;
      case 'report':
        return <ReportScreen />;
      case 'more':
        return <MoreScreen onRequireAccount={setAuthPrompt} />;
      default:
        return (
          <HomeScreen
            weather={weather}
            onNavigate={setActiveTab}
            onRequireAccount={setAuthPrompt}
          />
        );
    }
  }, [activeTab, weather]);

  return (
    <div className="app-frame">
      <div className="app-shell">
        <AppTopBar onProfile={() => setAuthPrompt('personalize your Masinloc Connect experience')} />
        <main className="screen" id="main-content">
          {screen}
        </main>
        <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />
      </div>
      {authPrompt ? <AccountSheet reason={authPrompt} onClose={() => setAuthPrompt(null)} /> : null}
    </div>
  );
}

function AppTopBar({ onProfile }) {
  return (
    <header className="app-topbar">
      <button className="brand-button" type="button" onClick={() => openExternal(routes.website)} aria-label="Open Masinloc website">
        <img src={assets.logo} alt="Masinloc Zambales" />
      </button>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications" disabled title="Notifications will activate with account sync">
          <Bell size={20} strokeWidth={1.9} />
        </button>
        <button className="avatar-button" type="button" onClick={onProfile} aria-label="Profile and sign in">
          <CircleUserRound size={25} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}

function HomeScreen({ weather, onNavigate, onRequireAccount }) {
  return (
    <div className="screen-stack home-screen">
      <section className="welcome-block" aria-labelledby="home-greeting">
        <div>
          <p className="locality"><MapPin size={14} /> Masinloc, Zambales</p>
          <h1 id="home-greeting">{getGreeting()}</h1>
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
        <div className="section-heading compact">
          <h2 id="quick-actions-title">What do you need?</h2>
        </div>
        <div className="quick-grid">
          <QuickAction className="urgent" icon={ShieldAlert} label="Report Incident" onClick={() => onNavigate('report')} />
          <QuickAction icon={ShoppingBag} label="Marketplace" onClick={() => onNavigate('marketplace')} />
          <QuickAction icon={BriefcaseBusiness} label="Find Jobs" onClick={() => onNavigate('jobs')} />
          <QuickAction icon={BookOpen} label="Mabayani" onClick={() => openExternal(routes.mabayani)} />
          <QuickAction icon={Languages} label="Dictionary" onClick={() => openExternal(routes.dictionary)} />
        </div>
      </section>

      <section className="source-card" aria-label="Website source of truth">
        <div className="source-copy">
          <span className="source-label">From the website</span>
          <h2>The world finds us here.</h2>
          <p>Verified stories, places, history and language stay on the Masinloc website. The app brings the actions closer.</p>
          <button className="text-action" type="button" onClick={() => openExternal(routes.discover)}>
            Explore Masinloc <ChevronRight size={17} />
          </button>
        </div>
        <img src={assets.hero} alt="Binabayani performers in front of San Andres Church during a Masinloc fiesta" />
      </section>

      <section>
        <div className="section-heading">
          <div>
            <span>For you</span>
            <h2>Make the app yours</h2>
          </div>
        </div>
        <button className="personalize-card" type="button" onClick={() => onRequireAccount('save jobs, products, stories and personalize what you see')}>
          <div className="personalize-icon"><UserRound size={22} /></div>
          <div>
            <strong>Continue with Email</strong>
            <span>Save what matters and access it again from another device.</span>
          </div>
          <ChevronRight size={20} />
        </button>
      </section>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, className = '' }) {
  return (
    <button type="button" className={`quick-action ${className}`} onClick={onClick}>
      <span className="quick-icon"><Icon size={23} strokeWidth={1.9} /></span>
      <span>{label}</span>
    </button>
  );
}

function MarketplaceScreen({ onRequireAccount }) {
  return (
    <div className="screen-stack">
      <ScreenTitle title="Marketplace" subtitle="Local products and businesses, closer to home." />
      <button className="search-field" type="button" onClick={() => openExternal(routes.marketplace)}>
        <Search size={19} />
        <span>Search the Masinloc Marketplace</span>
      </button>

      <section className="feature-image-card">
        <img src={assets.marketplaceCafe} alt="1418 Cafe, a business listed in the Masinloc Marketplace" />
        <div className="feature-image-copy">
          <span>Local marketplace</span>
          <h2>Support businesses from Masinloc.</h2>
          <p>The website remains the live catalog while the app commerce layer is connected.</p>
          <button className="primary-button inverse" type="button" onClick={() => openExternal(routes.marketplace)}>Browse Marketplace</button>
        </div>
      </section>

      <section>
        <div className="section-heading compact"><h2>Saved items</h2></div>
        <button className="empty-action" type="button" onClick={() => onRequireAccount('save Marketplace items and access them from any device')}>
          <Heart size={22} />
          <div><strong>Save products you like</strong><span>Continue with Email when you want to keep something.</span></div>
          <ChevronRight size={19} />
        </button>
      </section>

      <section className="business-card">
        <div className="business-icon"><Store size={24} /></div>
        <div>
          <span>For business owners</span>
          <h2>Sell in Marketplace. Run it with Masinloc POS.</h2>
          <p>POS stays inside the business journey, not in the resident navigation.</p>
        </div>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => onRequireAccount('create a business profile and start selling')}>Start Selling</button>
          <button className="secondary-button" type="button" onClick={() => openExternal(routes.pos)}>Learn More</button>
        </div>
      </section>
    </div>
  );
}

function JobsScreen({ onRequireAccount }) {
  return (
    <div className="screen-stack">
      <ScreenTitle title="Find Jobs" subtitle="A focused space for trusted opportunities for Masinloqueños." />
      <div className="search-field static"><Search size={19} /><span>Search jobs</span></div>

      <section className="empty-state large">
        <div className="empty-icon"><BriefcaseBusiness size={28} /></div>
        <h2>Job listings are being connected.</h2>
        <p>We will not fill this screen with invented vacancies. Trusted Job Providers and real listings will appear here once the jobs data source is connected.</p>
      </section>

      <section>
        <div className="section-heading compact"><h2>Your job tools</h2></div>
        <div className="utility-list">
          <button type="button" onClick={() => onRequireAccount('save job opportunities')}>
            <Heart size={21} /><div><strong>Saved Jobs</strong><span>Keep opportunities you want to return to.</span></div><ChevronRight size={19} />
          </button>
          <button type="button" onClick={() => onRequireAccount('create and keep your Signature Resume')}>
            <UserRound size={21} /><div><strong>Signature Resume</strong><span>Create once, use for future applications.</span></div><ChevronRight size={19} />
          </button>
        </div>
      </section>
    </div>
  );
}

function ReportScreen() {
  return (
    <div className="screen-stack report-screen">
      <ScreenTitle title="Report Incident" subtitle="Get to the right help quickly. An account is never required to report." />

      <section className="emergency-banner">
        <ShieldAlert size={27} />
        <div><strong>Immediate life-threatening emergency?</strong><span>Call 911 when you are able. Masinloc Connect reporting is an additional connection to local responders.</span></div>
      </section>

      <section>
        <div className="section-heading compact"><h2>Who do you need?</h2></div>
        <div className="responder-grid">
          <button type="button" onClick={() => openExternal(routes.helpDesk)}>
            <span className="responder-icon police"><ShieldAlert size={25} /></span>
            <strong>PNP</strong>
            <span>Police, safety, crime or immediate danger</span>
            <ChevronRight size={19} />
          </button>
          <button type="button" onClick={() => openExternal(routes.helpDesk)}>
            <span className="responder-icon rescue"><ShieldAlert size={25} /></span>
            <strong>MDRRMO</strong>
            <span>Rescue, disaster, medical or hazard response</span>
            <ChevronRight size={19} />
          </button>
        </div>
      </section>

      <section className="secure-report-card">
        <MapPin size={23} />
        <div>
          <strong>Use the production Help Desk</strong>
          <p>The current secure reporting system already supports GPS capture, offline-safe report storage and responder status updates. This first app slice opens that live flow instead of duplicating it unsafely.</p>
        </div>
        <button className="primary-button danger" type="button" onClick={() => openExternal(routes.helpDesk)}>Open Report Form</button>
      </section>
    </div>
  );
}

function MoreScreen({ onRequireAccount }) {
  return (
    <div className="screen-stack">
      <ScreenTitle title="More" subtitle="Our stories, language, places and your account." />

      <section className="mabayani-card" onClick={() => openExternal(routes.mabayani)} role="button" tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && openExternal(routes.mabayani)}>
        <img src={assets.mabayaniHistory} alt="Historical image used by the Masinloc Mabayani archive" />
        <div><span>History & heritage</span><h2>Mabayani</h2><p>Carry our stories, with the website remaining the verified source.</p><span className="card-link">Open Mabayani <ChevronRight size={17} /></span></div>
      </section>

      <div className="utility-list">
        <button type="button" onClick={() => openExternal(routes.dictionary)}>
          <Languages size={21} /><div><strong>Sambal Tina Dictionary</strong><span>Search the language archive and learning tools.</span></div><ChevronRight size={19} />
        </button>
        <button type="button" onClick={() => openExternal(routes.discover)}>
          <Compass size={21} /><div><strong>Discover Masinloc</strong><span>Places, culture and experiences from the website.</span></div><ChevronRight size={19} />
        </button>
        <button type="button" onClick={() => openExternal(routes.helpDesk)}>
          <ShieldAlert size={21} /><div><strong>Help Desk</strong><span>Emergency reporting and community support.</span></div><ChevronRight size={19} />
        </button>
        <button type="button" onClick={() => onRequireAccount('save activity and personalize the app')}>
          <CircleUserRound size={21} /><div><strong>Profile</strong><span>Saved items, reports, learning and preferences.</span></div><ChevronRight size={19} />
        </button>
        <button type="button" onClick={() => openExternal(routes.website)}>
          <Building2 size={21} /><div><strong>Masinloc Website</strong><span>Open the source of truth.</span></div><ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}

function ScreenTitle({ title, subtitle }) {
  return (
    <header className="screen-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

function BottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="App navigation">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => onNavigate(id)} aria-current={activeTab === id ? 'page' : undefined}>
          <Icon size={22} strokeWidth={activeTab === id ? 2.25 : 1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function AccountSheet({ reason, onClose }) {
  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="account-sheet" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <div className="sheet-handle" />
        <button className="sheet-close" type="button" onClick={onClose} aria-label="Close"><X size={21} /></button>
        <div className="account-mark"><UserRound size={28} /></div>
        <h2 id="account-title">Make Masinloc Connect yours.</h2>
        <p>Create an account when you want to {reason}. Browsing and emergency reporting remain available without registration.</p>
        <label htmlFor="account-email">Email address</label>
        <input id="account-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" disabled />
        <button className="primary-button full" type="button" disabled>Continue with Email</button>
        <p className="connection-note">Account authentication is not connected in this foundation build yet. This control stays disabled so the app never pretends an account was created.</p>
        <button className="secondary-button full" type="button" onClick={onClose}>Not Now</button>
      </section>
    </div>
  );
}

export default App;
