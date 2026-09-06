import { useState } from 'react';
import { Check, ChevronRight, ClipboardList, ExternalLink, PackageCheck, Save, Send, Store, WalletCards } from 'lucide-react';
import { routes } from '../config.js';
import { submitMobileContribution } from '../lib/mobileBackend.js';
import { ScreenTitle } from '../components/UI.jsx';

const SELLER_DRAFT_KEY = 'masinloc-connect-seller-draft-v2';

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(SELLER_DRAFT_KEY) || 'null'); } catch { return null; }
}

const blank = { brandName:'', storeLocations:'', ownerName:'', ownerEmail:'', ownerPhone:'', contactNumber:'', facebookPage:'', shortDescription:'' };

export default function SellerHub({ navigate }) {
  const initial = loadDraft();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial?.form || blank);
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const saveDraft = () => {
    const next = { form, updated_at:new Date().toISOString(), reference_code:saved?.reference_code || null };
    localStorage.setItem(SELLER_DRAFT_KEY, JSON.stringify(next));
    setSaved(next);
  };

  const submit = async (event) => {
    event.preventDefault();
    setState('sending'); setMessage('');
    try {
      const result = await submitMobileContribution('business', form);
      const next = { form, updated_at:new Date().toISOString(), submitted_at:new Date().toISOString(), reference_code:result.reference_code || null, status:result.status || 'pending' };
      localStorage.setItem(SELLER_DRAFT_KEY, JSON.stringify(next));
      setSaved(next); setState('sent'); setMessage(result.reference_code ? `Submitted for Marketplace review. Reference: ${result.reference_code}` : 'Submitted for Marketplace review.');
    } catch (error) { setState('error'); setMessage(error.message || 'Could not submit your business right now.'); }
  };

  if (editing) return <div className="screen-stack mobile-native-stack">
    <ScreenTitle title={saved?.reference_code ? 'Manage My Business' : 'Add My Business'} subtitle="Prepare and submit your Marketplace listing for review." />
    <div className="native-callout"><Store size={22}/><div><strong>Marketplace review</strong><span>Your listing is not public until it is reviewed and approved. You can save a draft before submitting.</span></div></div>
    <form className="native-form-card" onSubmit={submit}>
      <label>Business name<input required value={form.brandName} onChange={(e)=>setForm({...form,brandName:e.target.value})} /></label>
      <label>Store location(s)<textarea rows="3" value={form.storeLocations} onChange={(e)=>setForm({...form,storeLocations:e.target.value})} placeholder="Barangay, street or landmark" /></label>
      <label>Owner name<input required value={form.ownerName} onChange={(e)=>setForm({...form,ownerName:e.target.value})} /></label>
      <label>Owner email<input required type="email" inputMode="email" value={form.ownerEmail} onChange={(e)=>setForm({...form,ownerEmail:e.target.value})} /></label>
      <label>Owner phone<input required value={form.ownerPhone} onChange={(e)=>setForm({...form,ownerPhone:e.target.value})} /></label>
      <label>Public contact number<input required value={form.contactNumber} onChange={(e)=>setForm({...form,contactNumber:e.target.value})} /></label>
      <label>Facebook page<input required type="url" inputMode="url" value={form.facebookPage} onChange={(e)=>setForm({...form,facebookPage:e.target.value})} placeholder="https://facebook.com/..." /></label>
      <label>Short business description<textarea required rows="5" value={form.shortDescription} onChange={(e)=>setForm({...form,shortDescription:e.target.value})} /></label>
      {message ? <div className={`native-message ${state === 'error' ? 'error' : ''}`}>{state === 'sent' ? <Check size={18}/> : null}<span>{message}</span></div> : null}
      <button className="secondary-button full" type="button" onClick={saveDraft}><Save size={17}/>Save Draft</button>
      <button className="primary-button full" type="submit" disabled={state === 'sending'}><Send size={17}/>{state === 'sending' ? 'Submitting…' : 'Submit for Marketplace Review'}</button>
      <button className="text-button centered" type="button" onClick={()=>{ saveDraft(); setEditing(false); }}>Back to Seller Tools</button>
    </form>
  </div>;

  return <div className="screen-stack mobile-native-stack seller-mobile-hub">
    <ScreenTitle title="For Sellers" subtitle="List your business and access Masinloc POS." />
    <section className="seller-mobile-hero"><span><Store size={27}/></span><div><h2>Sell locally. Manage simply.</h2><p>Marketplace discovery for customers, POS tools for daily operations.</p></div></section>
    {saved?.reference_code ? <div className="native-message"><Check size={18}/><span>Marketplace submission {saved.reference_code} is in the review queue.</span></div> : null}
    <div className="native-action-list seller-actions">
      <button type="button" onClick={()=>setEditing(true)}><Store size={21}/><div><strong>{saved ? 'Manage My Business / Listing' : 'Add My Business to Marketplace'}</strong><span>{saved?.form?.brandName || 'Prepare a listing for review'}</span></div><ChevronRight size={18}/></button>
      <button type="button" onClick={()=>window.open(routes.pos,'_blank','noopener,noreferrer')}><WalletCards size={21}/><div><strong>Access Masinloc POS</strong><span>Open the seller operations system</span></div><ExternalLink size={18}/></button>
      <button type="button" onClick={()=>navigate('orders')}><PackageCheck size={21}/><div><strong>Marketplace Orders</strong><span>Orders linked to your signed-in account</span></div><ChevronRight size={18}/></button>
      <button type="button" onClick={()=>navigate('seller-guidelines')}><ClipboardList size={21}/><div><strong>Seller Information / Guidelines</strong><span>How Marketplace and POS work together</span></div><ChevronRight size={18}/></button>
    </div>
  </div>;
}

export function SellerGuidelinesScreen() {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Seller Guidelines" subtitle="How seller tools work inside Masinloc Connect." /><div className="policy-list native-policy-list"><article><Store size={22}/><div><h2>Marketplace listing</h2><p>Business information is submitted to a review queue. It is never published automatically from the mobile app.</p></div></article><article><WalletCards size={22}/><div><h2>Masinloc POS</h2><p>POS remains the separate seller operations system for products, inventory, payments and day-to-day store management.</p></div></article><article><PackageCheck size={22}/><div><h2>Order synchronization</h2><p>Only real orders linked to a signed-in buyer account appear in Masinloc Connect. The app does not create placeholder order records.</p></div></article></div></div>;
}
