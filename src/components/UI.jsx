import {
  AlertTriangle, ArrowLeft, ChevronRight, Home, LoaderCircle, RefreshCw, Search, X,
} from 'lucide-react';
import { bottomNav } from '../navigation.js';

export function BrandHeader() {
  return <header className="brand-header"><img className="connect-logo" src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect — Connecting Masinloqueños to the World" /></header>;
}

export function ScreenTopBar({ onBack, onHome }) {
  return <header className="screen-topbar">
    <button className="topbar-button" type="button" onClick={onBack} aria-label="Back"><ArrowLeft size={21} /></button>
    <button className="topbar-brand" type="button" onClick={onHome} aria-label="Masinloc Connect home"><img src="/assets/masinloc-connect-logo.webp" alt="Masinloc Connect" /></button>
    <button className="topbar-button" type="button" onClick={onHome} aria-label="Home"><Home size={20} /></button>
  </header>;
}

export function BottomNav({ active, onNavigate }) {
  return <nav className="bottom-nav bottom-nav-v2" aria-label="Primary navigation">{bottomNav.map(({ id, label, icon: Icon, brand }) =>
    <button key={id} type="button" className={`${active === id ? 'active' : ''}${brand ? ' brand-tab' : ''}`} aria-current={active === id ? 'page' : undefined} onClick={() => onNavigate(id)}>
      {brand ? <span className="bottom-brand-mark"><img src="/assets/masinloc-connect-logo.webp" alt="" /></span> : <Icon size={23} strokeWidth={active === id ? 2.45 : 1.9} />}
      <span>{label}</span>
    </button>)}</nav>;
}

export function MenuCard({ item, onClick, compact = false }) {
  const Icon = item.icon;
  return <button className={compact ? 'menu-card compact' : 'menu-card'} type="button" onClick={onClick}>
    <span className={`menu-icon tone-${item.tone}`}><Icon size={compact ? 21 : 25} strokeWidth={2.1} /></span>
    <span className="menu-label">{item.label}</span><ChevronRight className="menu-chevron" size={20} />
  </button>;
}

export function ScreenTitle({ title, subtitle }) {
  return <header className="screen-title"><h1>{title}</h1><p>{subtitle}</p></header>;
}

export function SearchField({ value, onChange, placeholder }) {
  return <label className="search-field"><Search size={19} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    {value ? <button type="button" onClick={() => onChange('')} aria-label="Clear search"><X size={16} /></button> : null}</label>;
}

export function AsyncState({ state, label }) {
  if (state.status === 'loading') return <div className="async-state"><LoaderCircle className="spin" size={22} /><strong>Loading {label}</strong></div>;
  if (state.status === 'error') return <div className="async-state error"><AlertTriangle size={22} /><div><strong>{label} could not load</strong><span>Check your connection and try again.</span></div><button type="button" onClick={state.reload}><RefreshCw size={16} /> Retry</button></div>;
  return null;
}

export function EmptyState({ icon: Icon, title, body }) {
  return <div className="empty-panel"><span className="empty-icon"><Icon size={30} /></span><h2>{title}</h2><p>{body}</p></div>;
}

export function Callout({ icon: Icon, title, body, action, onAction }) {
  return <section className="callout-card"><span><Icon size={25} /></span><div><h2>{title}</h2><p>{body}</p></div>
    <button type="button" className="secondary-button full" onClick={onAction}>{action} <ChevronRight size={16} /></button></section>;
}

export function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
