import { useState } from 'react';
import { ChevronRight, ExternalLink, MapPin } from 'lucide-react';
import { routes } from '../config.js';
import useCanonicalData from '../hooks/useCanonicalData.js';
import { AsyncState, ScreenTitle, formatDate } from '../components/UI.jsx';
import DictionaryShowcase from './DictionaryShowcase.jsx';

export function BulletinScreen() {
  const source = useCanonicalData('bulletin');
  const articles = (source.data?.articles || []).filter((item) => item.status === 'published');
  const categories = new Map((source.data?.categories || []).map((item) => [item.id, item.label]));
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Community Bulletin" subtitle="Local stories, research notes and useful Masinloc updates." />
    <AsyncState state={source} label="Community Bulletin" />
    {source.status === 'ready' ? <div className="native-story-list">{articles.map((article) => <button type="button" className="native-story-card" key={article.slug} onClick={() => window.open(`${routes.website}bulletin/${article.slug}.html`, '_blank', 'noopener,noreferrer')}>
      <span>{categories.get(article.category) || 'Bulletin'} · {formatDate(article.published)}</span><h2>{article.title}</h2><p>{article.standfirst || article.description}</p><small>{article.readingMinutes ? `${article.readingMinutes} min read` : 'Read story'} <ChevronRight size={14} /></small>
    </button>)}</div> : null}
  </div>;
}

export function DiscoverScreen() {
  const source = useCanonicalData('discover');
  const [theme, setTheme] = useState('all');
  const articles = source.data?.articles || [];
  const visible = theme === 'all' ? articles : articles.filter((article) => article.theme === theme);
  return <div className="screen-stack mobile-native-stack discover-mobile"><ScreenTitle title={source.data?.section?.name || 'Discover Masinloc'} subtitle={source.data?.section?.intro || 'Places, food, culture and stories from Masinloc.'} />
    <AsyncState state={source} label="Discover Masinloc" />
    {source.status === 'ready' ? <><div className="showcase-chip-row discover-chips"><button type="button" className={theme === 'all' ? 'active' : ''} onClick={() => setTheme('all')}>All</button>{(source.data?.themes || []).map((item) => <button type="button" className={theme === item.id ? 'active' : ''} key={item.id} onClick={() => setTheme(item.id)}>{item.name}</button>)}</div>
      <div className="discover-mobile-list">{visible.map((article) => <article className="discover-mobile-card" key={article.slug}><span className="discover-mobile-icon"><MapPin size={20}/></span><div><small>{formatDate(article.updated || article.published)}</small><h2>{article.title}</h2><p>{article.deck}</p></div></article>)}</div>
      <button className="secondary-button full" type="button" onClick={() => window.open(routes.discover, '_blank', 'noopener,noreferrer')}>Explore full place guides <ExternalLink size={15} /></button></> : null}
  </div>;
}

export function DictionaryScreen({ navigate }) {
  return <DictionaryShowcase navigate={navigate} />;
}

export function HistoryScreen() {
  const source = useCanonicalData('mabayani');
  return <div className="screen-stack mobile-native-stack history-mobile"><ScreenTitle title="Masinloc History" subtitle="Our roots, our stories, our Masinloc." /><AsyncState state={source} label="Masinloc History" />
    {source.status === 'ready' ? <div className="history-mobile-list">{(source.data?.sections || []).map((section) => <article key={section.slug}><span className="history-number">{section.number}</span><div><h2>{section.title || section.label}</h2>{(section.public_copy || []).slice(0, 1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article>)}</div> : null}
    <button className="secondary-button full" type="button" onClick={() => window.open(routes.mabayani, '_blank', 'noopener,noreferrer')}>Read the documented archive <ExternalLink size={15} /></button>
  </div>;
}
