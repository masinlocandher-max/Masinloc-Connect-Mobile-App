import { useState } from 'react';
import { ChevronRight, ClipboardList, ExternalLink, PackageCheck, Save, Store, WalletCards } from 'lucide-react';
import { routes } from '../config.js';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

const SELLER_DRAFT_KEY = 'masinloc-connect-seller-draft-v1';

export default function SellerHub({ navigate }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SELLER_DRAFT_KEY) || 'null'); } catch { return null; }
  });
  const [form, setForm] = useState(saved || { name:'', category:'', location:'', description:'', contact:'' });

  const saveDraft = (event) => {
    event.preventDefault();
    const next = { ...form, updated_at:new Date().toISOString() };
    localStorage.setItem(SELLER_DRAFT_KEY, JSON.stringify(next));
    setSaved(next); setEditing(false);
  };

  if (editing) return <div className="screen-stack mobile-native-stack"><ScreenTitle title={saved ? 'Manage My Business' : 'Add My Business'} subtitle="Prepare your Marketplace listing from the mobile app." /><div className="native-callout"><Store size={22}/><div><strong>Listing draft</strong><span>This build saves your listing on this device. Publication begins only after the Marketplace seller backend is connected and reviewed.</span></div></div><form className="native-form-card" onSubmit={saveDraft}><label>Business name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label><label>Category<input required value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} placeholder="Food, retail, services…" /></label><label>Location<input value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} placeholder="Barangay / landmark" /></label><label>Description<textarea rows="5" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></label><label>Public contact<input value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})} placeholder="Phone, Messenger or email" /></label><button className="primary-button full" type="submit"><Save size={17}/>Save Business Draft</button><button className="secondary-button full" type="button" onClick={()=>setEditing(false)}>Cancel</button></form></div>;

  return <div className="screen-stack mobile-native-stack seller-mobile-hub">
    <ScreenTitle title="For Sellers" subtitle="List your business and access Masinloc POS." />
    <section className="seller-mobile-hero"><span><Store size={27}/></span><div><h2>Sell locally. Manage simply.</h2><p>Marketplace discovery for customers, POS tools for your daily operations.</p></div></section>
    <div className="native-action-list seller-actions">
      <button type="button" onClick={()=>setEditing(true)}><Store size={21}/><div><strong>{saved ? 'Manage My Business / Listing' : 'Add My Business to Marketplace'}</strong><span>{saved ? saved.name : 'Create a seller listing draft'}</span></div><ChevronRight size={18}/></button>
      <button type="button" onClick={()=>window.open(routes.pos,'_blank','noopener,noreferrer')}><WalletCards size={21}/><div><strong>Access Masinloc POS</strong><span>Open the seller operations system</span></div><ExternalLink size={18}/></button>
      <button type="button" onClick={()=>navigate('orders')}><PackageCheck size={21}/><div><strong>Marketplace Orders</strong><span>Order history and status when sync is connected</span></div><ChevronRight size={18}/></button>
      <button type="button" onClick={()=>navigate('seller-guidelines')}><ClipboardList size={21}/><div><strong>Seller Information / Guidelines</strong><span>How Marketplace and POS work together</span></div><ChevronRight size={18}/></button>
    </div>
  </div>;
}

export function SellerGuidelinesScreen() {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Seller Guidelines" subtitle="How seller tools are designed to work inside Masinloc Connect." /><div className="policy-list native-policy-list"><article><Store size={22}/><div><h2>Marketplace listing</h2><p>Your public business information should be reviewed before it is published to customers.</p></div></article><article><WalletCards size={22}/><div><h2>Masinloc POS</h2><p>The POS is a separate seller operations tool. You can use it even while the Marketplace ordering layer is still being completed.</p></div></article><article><PackageCheck size={22}/><div><h2>Order synchronization</h2><p>Order status should only appear inside Masinloc Connect when the Marketplace and POS systems are actually calibrated. The app does not invent order records.</p></div></article></div></div>;
}
