import { useMemo, useState } from 'react';
import { ArrowLeft, Heart, Search, Volume2 } from 'lucide-react';
import useCanonicalData from '../hooks/useCanonicalData.js';
import { AsyncState, EmptyState } from '../components/UI.jsx';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function speakWord(word) {
  if (!('speechSynthesis' in window) || !word) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'fil-PH';
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

export default function DictionaryShowcase({ navigate }) {
  const source = useCanonicalData('dictionary');
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('All');
  const [descending, setDescending] = useState(false);
  const [saved, setSaved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('masinloc-dictionary-saved') || '[]')); } catch { return new Set(); }
  });

  const entries = useMemo(() => {
    if (!source.data?.entries) return [];
    const columns = source.data.columns || ['tina', 'pos', 'en', 'fil', 'pages'];
    return source.data.entries.map((entry) => Object.fromEntries(columns.map((column, index) => [column, entry[index]])));
  }, [source.data]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries
      .filter((entry) => (letter === 'All' || String(entry.tina || '').toUpperCase().startsWith(letter)) && (!needle || `${entry.tina} ${entry.en || ''} ${entry.fil || ''}`.toLowerCase().includes(needle)))
      .sort((a, b) => String(a.tina).localeCompare(String(b.tina)) * (descending ? -1 : 1))
      .slice(0, 100);
  }, [entries, query, letter, descending]);

  const toggleSaved = (word) => {
    const next = new Set(saved);
    next.has(word) ? next.delete(word) : next.add(word);
    setSaved(next);
    localStorage.setItem('masinloc-dictionary-saved', JSON.stringify([...next]));
  };

  return <div className="dictionary-showcase">
    <section className="showcase-hero dictionary-hero">
      <div className="showcase-hero-photo" aria-hidden="true" />
      <div className="showcase-hero-fade" aria-hidden="true" />
      <div className="showcase-hero-top">
        <button className="showcase-back" type="button" onClick={() => navigate('home')} aria-label="Back"><ArrowLeft size={22} /></button>
        <img className="showcase-logo" src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" />
      </div>
      <div className="showcase-script dictionary-script">Our words. Our stories. Our Masinloc.<span /></div>
      <div className="dictionary-hero-copy"><h1>Sambal Tina</h1><p>A living dictionary of our words, stories and identity.</p></div>
    </section>

    <section className="showcase-content dictionary-content">
      <label className="showcase-search dictionary-search"><Search size={21} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a Tina word… (e.g. abagat, agtay, ambay)" /></label>
      <div className="showcase-chip-row dictionary-alphabet"><button type="button" className={letter === 'All' ? 'active' : ''} onClick={() => setLetter('All')}>All</button>{alphabet.map((item) => <button key={item} type="button" className={letter === item ? 'active' : ''} onClick={() => setLetter(item)}>{item}</button>)}</div>
      <div className="dictionary-toolbar"><strong>{entries.length.toLocaleString()} words</strong><button type="button" onClick={() => setDescending(!descending)}>Sort: {descending ? 'Z - A' : 'A - Z'}</button></div>

      <AsyncState state={source} label="Sambal Tina Dictionary" />
      {source.status === 'ready' ? matches.length ? <div className="dictionary-card-list">{matches.map((entry, index) => {
        const key = `${entry.tina}-${index}`;
        const isSaved = saved.has(entry.tina);
        return <article className="dictionary-word-card" key={key}>
          <div className="dictionary-word-copy">
            <div className="dictionary-word-heading"><h2>{entry.tina}</h2><span>{entry.pos || 'entry'}</span></div>
            <p className="dictionary-english">{entry.en || '—'}.</p>
            {entry.fil ? <p className="dictionary-filipino">Pilipino: <em>{entry.fil}</em></p> : null}
          </div>
          <div className="dictionary-actions">
            <button className="dictionary-audio" type="button" onClick={() => speakWord(entry.tina)} aria-label={`Hear ${entry.tina}`}><Volume2 size={19} /></button>
            <button className={`dictionary-save${isSaved ? ' saved' : ''}`} type="button" onClick={() => toggleSaved(entry.tina)} aria-label={`Save ${entry.tina}`}><Heart size={20} fill={isSaved ? 'currentColor' : 'none'} /></button>
          </div>
        </article>;
      })}</div> : <EmptyState icon={Search} title="No matching word" body="Try another spelling or search in English or Filipino." /> : null}
    </section>
  </div>;
}
