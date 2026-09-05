import { useMemo, useState } from 'react';
import { ChevronRight, ExternalLink, MapPin, Search, Store } from 'lucide-react';
import { WEBSITE_BASE } from '../config.js';
import useCanonicalData from '../hooks/useCanonicalData.js';
import { AsyncState, EmptyState, ScreenTitle } from '../components/UI.jsx';

export default function MarketplaceScreen({ navigate }) {
  const source = useCanonicalData('marketplace');
  const logos = useCanonicalData('marketplaceLogos');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [openSlug, setOpenSlug] = useState(null);
  const businesses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (source.data?.businesses || []).filter((business) => {
      const categoryMatch = category === 'all' || business.category === category;
      const text = `${business.name} ${business.descriptor || ''} ${business.location || ''} ${business.description || ''}`.toLowerCase();
      return categoryMatch && (!needle || text.includes(needle));
    });
  }, [source.data, query, category]);

  return <div className="screen-stack mobile-native-stack marketplace-mobile">
    <ScreenTitle title="Marketplace" subtitle="Discover local businesses, products and services in Masinloc." />
    <label className="native-search"><Search size={20}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search businesses or services" /></label>
    {source.status === 'ready' ? <div className="showcase-chip-row marketplace-chips"><button type="button" className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>All</button>{(source.data?.categories || []).map((item) => <button type="button" className={category === item.id ? 'active' : ''} key={item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div> : null}
    <AsyncState state={source} label="Marketplace" />
    {source.status === 'ready' ? businesses.length ? <div className="marketplace-mobile-list">{businesses.map((business) => {
      const logo = logos.data?.[business.slug];
      const logoUrl = logo ? `${WEBSITE_BASE}/assets/marketplace/${business.slug}-320.avif` : null;
      const expanded = openSlug === business.slug;
      return <article className={`marketplace-business-card${expanded ? ' expanded' : ''}`} key={business.slug}>
        <button className="marketplace-business-main" type="button" onClick={()=>setOpenSlug(expanded ? null : business.slug)}>
          <span className="marketplace-business-logo">{logoUrl ? <img src={logoUrl} alt={logo.alt || `${business.name} logo`} onError={(e)=>{e.currentTarget.style.display='none';}} /> : <Store size={24}/>}</span>
          <span className="marketplace-business-copy"><small>{business.descriptor || 'Local business'}</small><strong>{business.name}</strong><span><MapPin size={13}/>{business.location}</span></span>
          <ChevronRight size={19}/>
        </button>
        {expanded ? <div className="marketplace-business-details"><p>{business.description}</p>{business.facebook ? <button type="button" onClick={()=>window.open(business.facebook,'_blank','noopener,noreferrer')}>Open business page <ExternalLink size={14}/></button> : null}</div> : null}
      </article>;
    })}</div> : <EmptyState icon={Search} title="No matching businesses" body="Try another keyword or category." /> : null}
    <section className="seller-mobile-cta"><span className="native-action-icon"><Store size={22}/></span><div><strong>Are you a business owner?</strong><span>List your business and access Masinloc POS.</span></div><button type="button" onClick={()=>navigate('sellers')}>For Sellers <ChevronRight size={15}/></button></section>
  </div>;
}
