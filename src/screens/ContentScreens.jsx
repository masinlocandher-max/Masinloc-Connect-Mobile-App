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

function normalizeDictionaryEntries(data) {
  if (!Array.isArray(data?.entries)) return [];
  const columns = Array.isArray(data.columns) && data.columns.length ? data.columns : ['tina', 'pos', 'en', 'fil', 'pages'];
  return data.entries.map((entry, index) => {
    if (!Array.isArray(entry)) return { ...entry, _index: index };
    return { ...Object.fromEntries(columns.map((column, columnIndex) => [column, entry[columnIndex]])), _index: index };
  });
}

function normalizeSearch(value) {
  return String(value || '').normalize('NFKD').toLocaleLowerCase('en-PH').trim();
}

function DictionaryEntry({ entry }) {
  return <article className="dictionary-entry dictionary-entry-v2">
    <div className="dictionary-entry-head">
      <div><span>{entry.pos || 'Sambal Tina'}</span><h2>{entry.tina || '—'}</h2></div>
      {entry.pages ? <small>p. {entry.pages}</small> : null}
    </div>
    <div className="dictionary-translation-grid">
      <div><b>English</b><p>{entry.en || '—'}</p></div>
      <div><b>Filipino</b><p>{entry.fil || '—'}</p></div>
    </div>
  </article>;
}

export function DictionaryScreen() {
  const source = useCanonicalData('dictionary');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [letter, setLetter] = useState('all');
  const entries = useMemo(() => normalizeDictionaryEntries(source.data), [source.data]);

  const letters = useMemo(() => {
    const found = new Set();
    entries.forEach((entry) => {
      const first = String(entry.tina || '').trim().charAt(0).toLocaleUpperCase('en-PH');
      if (/^[A-ZÑ]$/u.test(first)) found.add(first);
    });
    return [...found].sort((a, b) => a.localeCompare(b, 'en-PH'));
  }, [entries]);

  const matches = useMemo(() => {
    const needle = normalizeSearch(query);
    const searchFields = scope === 'tina' ? ['tina'] : scope === 'en' ? ['en'] : scope === 'fil' ? ['fil'] : ['tina', 'en', 'fil'];
    const filtered = entries.filter((entry) => {
      if (letter !== 'all' && String(entry.tina || '').trim().charAt(0).toLocaleUpperCase('en-PH') !== letter) return false;
      if (!needle) return true;
      return searchFields.some((field) => normalizeSearch(entry[field]).includes(needle));
    });

    if (!needle) return filtered;
    return [...filtered].sort((a, b) => {
      const aTina = normalizeSearch(a.tina);
      const bTina = normalizeSearch(b.tina);
      const aExact = aTina === needle ? 0 : aTina.startsWith(needle) ? 1 : 2;
      const bExact = bTina === needle ? 0 : bTina.startsWith(needle) ? 1 : 2;
      if (aExact !== bExact) return aExact - bExact;
      return aTina.localeCompare(bTina, 'en-PH');
    });
  }, [entries, query, scope, letter]);

  const visible = matches.slice(0, 100);

  return <div className="screen-stack dictionary-screen">
    <ScreenTitle title="Sambal Tina Dictionary" subtitle="Search verified Sambal Tina entries with English and Filipino meanings from the canonical dictionary source." />
    <SearchField value={query} onChange={setQuery} placeholder="Search Sambal Tina, English or Filipino" />

    <div className="dictionary-controls">
      <div className="chip-row" aria-label="Dictionary language filter">
        <button type="button" className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>All languages</button>
        <button type="button" className={scope === 'tina' ? 'active' : ''} onClick={() => setScope('tina')}>Sambal Tina</button>
        <button type="button" className={scope === 'en' ? 'active' : ''} onClick={() => setScope('en')}>English</button>
        <button type="button" className={scope === 'fil' ? 'active' : ''} onClick={() => setScope('fil')}>Filipino</button>
      </div>
      {letters.length ? <div className="dictionary-letter-row" aria-label="Browse by first letter">
        <button type="button" className={letter === 'all' ? 'active' : ''} onClick={() => setLetter('all')}>All</button>
        {letters.map((item) => <button type="button" className={letter === item ? 'active' : ''} key={item} onClick={() => setLetter(item)}>{item}</button>)}
      </div> : null}
    </div>

    <AsyncState state={source} label="Sambal Tina Dictionary" />
    {source.status === 'ready' ? <>
      <div className="dictionary-result-summary">
        <span><BookOpen size={16} /> {matches.length.toLocaleString('en-PH')} matching entr{matches.length === 1 ? 'y' : 'ies'}</span>
        <small>{matches.length > visible.length ? `Showing first ${visible.length.toLocaleString('en-PH')}` : 'Source-supported dictionary view'}</small>
      </div>
      {visible.length ? <div className="dictionary-list dictionary-list-v2">{visible.map((entry) => <DictionaryEntry entry={entry} key={`${entry.tina || 'entry'}-${entry._index}`} />)}</div> : <EmptyState icon={Search} title="No matching word" body="Try another spelling, language filter or first letter." />}
    </> : null}
  </div>;
}

export function HistoryScreen() {
  const source = useCanonicalData('mabayani');
  return <div className="screen-stack"><ScreenTitle title="Masinloc History" subtitle="Documented history and heritage from Masinloc's canonical public record." /><AsyncState state={source} label="Masinloc History" />
    {source.status === 'ready' ? <div className="history-list">{(source.data?.sections || []).map((section) => <article key={section.slug}><span>{section.number}</span><div><h2>{section.title || section.label}</h2>{(section.public_copy || []).slice(0, 1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article>)}</div> : null}
    <button className="secondary-button full" type="button" onClick={() => window.open(routes.mabayani, '_blank', 'noopener,noreferrer')}>Open verified history website <ExternalLink size={15} /></button>
  </div>;
}
