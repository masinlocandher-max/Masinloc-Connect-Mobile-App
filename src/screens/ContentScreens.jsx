import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight, ExternalLink, Search } from 'lucide-react';
import { routes } from '../config.js';
import useCanonicalData from '../hooks/useCanonicalData.js';
import { AsyncState, EmptyState, ScreenTitle, SearchField, formatDate } from '../components/UI.jsx';

export function BulletinScreen() {
  const source = useCanonicalData('bulletin');
  const articles = (source.data?.articles || []).filter((item) => item.status === 'published');
  const categories = new Map((source.data?.categories || []).map((item) => [item.id, item.label]));
  return <div className="screen-stack"><ScreenTitle title="Community Bulletin" subtitle="Published Masinloc stories, research notes and community context from the canonical website source." />
    <AsyncState state={source} label="Community Bulletin" />
    {source.status === 'ready' ? <div className="article-list">{articles.map((article) => <button type="button" className="article-card" key={article.slug} onClick={() => window.open(`${routes.website}bulletin/${article.slug}.html`, '_blank', 'noopener,noreferrer')}>
      <span>{categories.get(article.category) || 'Bulletin'} · {formatDate(article.published)}</span><h2>{article.title}</h2><p>{article.standfirst || article.description}</p><small>{article.readingMinutes ? `${article.readingMinutes} min read` : 'Read story'} <ChevronRight size={14} /></small>
    </button>)}</div> : null}
  </div>;
}

export function DiscoverScreen() {
  const source = useCanonicalData('discover');
  const [theme, setTheme] = useState('all');
  const articles = source.data?.articles || [];
  const visible = theme === 'all' ? articles : articles.filter((article) => article.theme === theme);
  return <div className="screen-stack"><ScreenTitle title={source.data?.section?.name || 'Discover Masinloc'} subtitle={source.data?.section?.intro || 'Places, food, culture and stories from Masinloc.'} />
    <AsyncState state={source} label="Discover Masinloc" />
    {source.status === 'ready' ? <><div className="chip-row"><button type="button" className={theme === 'all' ? 'active' : ''} onClick={() => setTheme('all')}>All</button>{(source.data?.themes || []).map((item) => <button type="button" className={theme === item.id ? 'active' : ''} key={item.id} onClick={() => setTheme(item.id)}>{item.name}</button>)}</div>
      <div className="article-list">{visible.map((article) => <article className="article-card static" key={article.slug}><span>{formatDate(article.updated || article.published)}</span><h2>{article.title}</h2><p>{article.deck}</p></article>)}</div>
      <button className="secondary-button full" type="button" onClick={() => window.open(routes.discover, '_blank', 'noopener,noreferrer')}>Open Discover website <ExternalLink size={15} /></button></> : null}
  </div>;
}

export function DictionaryScreen() {
  const source = useCanonicalData('dictionary');
  const [query, setQuery] = useState('');
  const entries = useMemo(() => {
    if (!source.data?.entries) return [];
    const columns = source.data.columns || ['tina', 'pos', 'en', 'fil', 'pages'];
    return source.data.entries.map((entry) => Object.fromEntries(columns.map((column, index) => [column, entry[index]])));
  }, [source.data]);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (needle ? entries.filter((entry) => `${entry.tina} ${entry.en || ''} ${entry.fil || ''}`.toLowerCase().includes(needle)) : entries).slice(0, 80);
  }, [entries, query]);
  return <div className="screen-stack"><ScreenTitle title="Sambal Tina" subtitle="Search the same source-supported dictionary published by Masinloc Connect." /><SearchField value={query} onChange={setQuery} placeholder="Search Sambal Tina, English or Filipino" />
    <AsyncState state={source} label="Sambal Tina Dictionary" />
    {source.status === 'ready' ? matches.length ? <div className="dictionary-list">{matches.map((entry, index) => <article className="dictionary-entry" key={`${entry.tina}-${index}`}><span>{entry.pos || 'entry'}</span><h2>{entry.tina}</h2><p><strong>English:</strong> {entry.en || '—'}</p>{entry.fil ? <p><strong>Filipino:</strong> {entry.fil}</p> : null}{entry.pages ? <small>Source page: {entry.pages}</small> : null}</article>)}</div> : <EmptyState icon={Search} title="No matching word" body="Try another spelling or search in English or Filipino." /> : null}
  </div>;
}

export function HistoryScreen() {
  const source = useCanonicalData('mabayani');
  return <div className="screen-stack"><ScreenTitle title="Masinloc History" subtitle="Documented history and heritage from Masinloc's canonical public record." /><AsyncState state={source} label="Masinloc History" />
    {source.status === 'ready' ? <div className="history-list">{(source.data?.sections || []).map((section) => <article key={section.slug}><span>{section.number}</span><div><h2>{section.title || section.label}</h2>{(section.public_copy || []).slice(0, 1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article>)}</div> : null}
    <button className="secondary-button full" type="button" onClick={() => window.open(routes.mabayani, '_blank', 'noopener,noreferrer')}>Open verified history website <ExternalLink size={15} /></button>
  </div>;
}
