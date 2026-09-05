import { useMemo, useState } from 'react';
import { ExternalLink, MapPin, Search, Store } from 'lucide-react';
import { routes, WEBSITE_BASE } from '../config.js';
import useCanonicalData from '../hooks/useCanonicalData.js';
import { AsyncState, EmptyState, ScreenTitle, SearchField } from '../components/UI.jsx';

export default function MarketplaceScreen() {
  const source = useCanonicalData('marketplace');
  const logos = useCanonicalData('marketplaceLogos');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const businesses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (source.data?.businesses || []).filter((business) => {
      const categoryMatch = category === 'all' || business.category === category;
      const text = `${business.name} ${business.descriptor || ''} ${business.location || ''} ${business.description || ''}`.toLowerCase();
      return categoryMatch && (!needle || text.includes(needle));
    });
  }, [source.data, query, category]);

  return <div className="screen-stack">
    <ScreenTitle title="Marketplace" subtitle="Browse reviewed local businesses from the same Masinloc source used by the public website." />
    <SearchField value={query} onChange={setQuery} placeholder="Search businesses" />
    {source.status === 'ready' ? <div className="chip-row"><button type="button" className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>All</button>
      {(source.data?.categories || []).map((item) => <button type="button" className={category === item.id ? 'active' : ''} key={item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div> : null}
    <AsyncState state={source} label="Marketplace" />
    {source.status === 'ready' ? businesses.length ? <div className="listing-stack">{businesses.map((business) => {
      const logo = logos.data?.[business.slug];
      const logoUrl = logo ? `${WEBSITE_BASE}/assets/marketplace/${business.slug}-320.avif` : null;
      return <article className="listing-card" key={business.slug}>
        <div className="listing-mark">{logoUrl ? <img src={logoUrl} alt={logo.alt || `${business.name} logo`} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <Store size={24} />}</div>
        <div className="listing-copy"><span>{business.descriptor || 'Local business'}</span><h2>{business.name}</h2><p>{business.description}</p><small><MapPin size={13} /> {business.location}</small></div>
        {business.facebook ? <button type="button" className="text-action" onClick={() => window.open(business.facebook, '_blank', 'noopener,noreferrer')}>Public page <ExternalLink size={14} /></button> : null}
      </article>;
    })}</div> : <EmptyState icon={Search} title="No matching businesses" body="Try another keyword or category." /> : null}
    <section className="seller-strip"><div><strong>Are you a business owner?</strong><span>Marketplace discovery connects to Masinloc POS for seller operations.</span></div><button type="button" onClick={() => window.open(routes.pos, '_blank', 'noopener,noreferrer')}>For Sellers <ExternalLink size={14} /></button></section>
  </div>;
}
