import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CloudSun,
  Search,
  ShoppingCart,
  Store,
  UsersRound,
} from 'lucide-react';
import { MASINLOC_CENTER, WEATHER_ENDPOINT, WEBSITE_BASE } from '../config.js';
import { moreItems } from '../navigation.js';
import { MenuCard, ScreenTitle } from '../components/UI.jsx';

const HIGHLIGHT_ASSET_BASE = `${WEBSITE_BASE}/assets/locations`;
const MASINLOC_TIME_ZONE = 'Asia/Manila';

// HD originals are curated in Google Drive > Highlight Images. The mobile app
// consumes the canonical optimized derivatives published by Masinloc-Website.
const highlights = [
  { name: 'San Andres Church', src: `${HIGHLIGHT_ASSET_BASE}/san-andres-church-card-1200.webp`, position: '50% 48%' },
  { name: 'Bacala Sandbar', src: `${HIGHLIGHT_ASSET_BASE}/bacala-sandbar-guesthouse-1120.webp`, position: '50% 54%' },
  { name: 'Coto Kidz Pool', src: `${HIGHLIGHT_ASSET_BASE}/coto-kidz-pool-1120.webp`, position: '50% 52%' },
  { name: 'Hamat River', src: `${HIGHLIGHT_ASSET_BASE}/hamat-river-1120.webp`, position: '50% 50%' },
  { name: 'Masinloc Baywalk', src: `${HIGHLIGHT_ASSET_BASE}/masinloc-baywalk-1120.webp`, position: '50% 52%' },
  { name: 'Sitio Buri', src: `${HIGHLIGHT_ASSET_BASE}/sitio-buri-1120.webp`, position: '50% 48%' },
  { name: 'Bunga Cave', src: `${HIGHLIGHT_ASSET_BASE}/bunga-cave-1120.webp`, position: '50% 54%' },
  { name: 'San Salvador Island', src: `${HIGHLIGHT_ASSET_BASE}/san-salvador-island-1120.webp`, position: '50% 48%' },
];

const weatherLabels = {
  0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Cloudy', 45: 'Foggy', 48: 'Foggy',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle', 61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  80: 'Rain Showers', 81: 'Rain Showers', 82: 'Heavy Showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

const homeCards = [
  { id: 'dictionary', title: 'Sambal Tina', body: 'Search the Sambal Tina dictionary', icon: BookOpen, tone: 'orange' },
  { id: 'history', title: 'Masinloc History', body: 'Our roots, our stories, our Masinloc.', icon: Building2, tone: 'blue' },
  { id: 'jobs', title: 'Jobs & Opportunities', body: 'Jobs, scholarships and more', icon: BriefcaseBusiness, tone: 'green' },
  { id: 'marketplace', title: 'Marketplace', body: 'Buy, sell and support local', icon: ShoppingCart, tone: 'red' },
  { id: 'sellers', title: 'For Sellers', body: 'List your business and access POS.', icon: Store, tone: 'violet' },
  { id: 'more', title: 'More Services', body: 'Contribute history, words and community knowledge.', icon: UsersRound, tone: 'purple' },
];

function getMasinlocHour() {
  return Number(new Intl.DateTimeFormat('en-PH', {
    timeZone: MASINLOC_TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(new Date()));
}

function getMasinlocGreeting() {
  const hour = getMasinlocHour();
  if (hour < 12) return 'Maabig a bocla cababali!';
  if (hour < 18) return 'Maabig a apon cababali!';
  return 'Maabig a yabi cababali!';
}

function useMasinlocGreeting() {
  const [greeting, setGreeting] = useState(getMasinlocGreeting);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getMasinlocGreeting());
    const timer = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return greeting;
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
        condition: weatherLabels[data.current.weather_code] || 'Current Weather',
      }))
      .catch((error) => {
        if (error.name !== 'AbortError') setWeather({ state: 'unavailable' });
      });
    return () => controller.abort();
  }, []);
  return weather;
}

export function HomeHub({ navigate }) {
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState('');
  const weather = useMasinlocWeather();
  const greeting = useMasinlocGreeting();

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % highlights.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const extras = [
      { id: 'discover', title: 'Discover Masinloc', body: 'Places, food, culture and local stories' },
      { id: 'bulletin', title: 'Community Bulletin', body: 'Published Masinloc updates and community information' },
      { id: 'report', title: 'Report an Issue', body: 'PNP / MDRRMO help desk' },
      { id: 'profile', title: 'Profile / Account', body: 'Manage your Masinloc Connect account' },
    ];
    return [...homeCards, ...extras].filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(needle)).slice(0, 5);
  }, [query]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (searchResults[0]) navigate(searchResults[0].id);
  };

  return <div className="home-screen-v2">
    <section className="home-hero" aria-label="Masinloc highlights">
      <div className="hero-rotator" aria-hidden="true">
        {highlights.map((item, index) => <img
          key={item.src}
          src={item.src}
          alt=""
          className={index === slide ? 'hero-slide active' : 'hero-slide'}
          style={{ objectPosition: item.position }}
          loading={index < 2 ? 'eager' : 'lazy'}
        />)}
      </div>
      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-brand-row">
        <img className="hero-logo" src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect — Connecting Masinloqueños to the World" />
        <div className="weather-card" aria-live="polite">
          <CloudSun size={31} strokeWidth={1.8} />
          <div><strong>{weather.state === 'ready' ? `${weather.temperature}°C` : '—'}</strong><span>{weather.state === 'ready' ? weather.condition : weather.state === 'loading' ? 'Loading' : 'Unavailable'}</span></div>
        </div>
      </div>

      <div className="hero-message">
        <h1>{greeting}</h1>
        <p>Let’s build a brighter<br />Masinloc together.</p>
      </div>
    </section>

    <div className="home-content-v2">
      <form className="home-search" onSubmit={submitSearch} role="search">
        <Search size={26} strokeWidth={2.3} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services, places, or information..." aria-label="Search Masinloc Connect" />
      </form>
      {query ? <div className="home-search-results">
        {searchResults.length ? searchResults.map((item) => <button key={item.id} type="button" onClick={() => navigate(item.id)}><div><strong>{item.title}</strong><span>{item.body}</span></div><ArrowRight size={18} /></button>) : <span>No matching service found.</span>}
      </div> : null}

      <section className="home-service-grid" aria-label="Main services">
        {homeCards.map(({ id, title, body, icon: Icon, tone }) => <button key={id} className={`home-service-card home-tone-${tone}`} type="button" onClick={() => navigate(id)}>
          <div className="home-service-top"><span className="home-service-icon"><Icon size={28} strokeWidth={2.35} /></span><ArrowRight className="home-service-arrow" size={22} /></div>
          <strong>{title}</strong><span>{body}</span><i aria-hidden="true" />
        </button>)}
      </section>

      <button className="report-issue-banner" type="button" onClick={() => navigate('report')}>
        <span className="report-alert"><AlertTriangle size={31} fill="currentColor" /></span>
        <span className="report-copy"><strong>Report an Issue</strong><b>PNP / MDRRMO</b><small>Photo · Location · Details. Send.</small></span>
        <span className="report-image" aria-hidden="true" />
        <span className="report-arrow"><ArrowRight size={28} /></span>
      </button>
    </div>
  </div>;
}

export function MoreScreen({ navigate }) {
  return <div className="screen-stack">
    <ScreenTitle title="More Services" subtitle="Contribute history, words and community knowledge, and access other Masinloc Connect services." />
    <section className="more-menu-grid" aria-label="More services">
      {moreItems.map((item) => <MenuCard compact key={`${item.id}-${item.label}`} item={item} onClick={() => navigate(item.id)} />)}
    </section>
  </div>;
}
