import { useState } from 'react';
import { Check, ChevronRight, ClipboardList, Clock3, Save, Send, Store, Wrench } from 'lucide-react';
import { submitMobileContribution } from '../lib/mobileBackend.js';
import { ScreenTitle } from '../components/UI.jsx';

const SELLER_DRAFT_KEY = 'masinloc-connect-seller-draft-v2';
function loadDraft() { try { return JSON.parse(localStorage.getItem(SELLER_DRAFT_KEY) || 'null'); } catch { return null; } }
const blank = { brandName:'', storeLocations:'', ownerName:'', ownerEmail:'', ownerPhone:'', contactNumber:'', facebookPage:'', shortDescription:'' };

function publicListingSnapshot(form) {
  return {
    brandName: form.brandName,
    storeLocations: form.storeLocations,
    contactNumber: form.contactNumber,
    facebookPage: form.facebookPage,
    shortDescription: form.shortDescription,
  };
}

export default function SellerHub({ navigate }) {
  const initial = loadDraft();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState({ ...blank, ...(initial?.form || {}) });
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const hasDraft = Boolean(saved?.form && !saved?.reference_code);
  const submitted = Boolean(saved?.reference_code);

  const saveDraft = () => {
    const next = { form, updated_at:new Date().toISOString(), reference_code:saved?.reference_code || null, status:saved?.status || 'draft' };
    localStorage.setItem(SELLER_DRAFT_KEY, JSON.stringify(next)); setSaved(next); setMessage('Draft saved on this device.'); setState('saved');
  };

  const submit = async (event) => {
    event.preventDefault(); setState('sending'); setMessage('');
    try {
      const result = await submitMobileContribution('business', form);
      const next = {
        form: publicListingSnapshot(form),
        updated_at:new Date().toISOString(),
        submitted_at:new Date().toISOString(),
        reference_code:result.reference_code || null,
        status:result.status || 'pending',
      };
      localStorage.setItem(SELLER_DRAFT_KEY, JSON.stringify(next)); setSaved(next); setState('sent');
      setMessage(result.reference_code ? `Submitted for review. Reference: ${result.reference_code}` : 'Submitted for Marketplace review.');
    } catch (error) { setState('error'); setMessage(error.message || 'Could not submit your business right now. Your form remains on this device.'); }
  };

  if (editing) return <div className="screen-stack mobile-native-stack">
    <ScreenTitle title={submitted ? 'Business Listing' : hasDraft ? 'Continue Business Listing' : 'Add Your Business'} subtitle="Submit accurate business information for Marketplace review." />
    <div className="native-callout"><Store size={22}/><div><strong>Reviewed before publication</strong><span>Submitting does not publish your business automatically. Masinloc Connect reviews listing information first.</span></div></div>
    <form className="native-form-card" onSubmit={submit}>
      <label>Business name<input required autoComplete="organization" value={form.brandName} onChange={(e)=>setForm({...form,brandName:e.target.value})} /></label>
      <label>Business location(s)<textarea required rows="3" value={form.storeLocations} onChange={(e)=>setForm({...form,storeLocations:e.target.value})} placeholder="Barangay, street or nearest landmark" /></label>
      <label>Owner / authorized representative<input required autoComplete="name" value={form.ownerName} onChange={(e)=>setForm({...form,ownerName:e.target.value})} /></label>
      <label>Private review email<input required type="email" inputMode="email" autoComplete="email" value={form.ownerEmail} onChange={(e)=>setForm({...form,ownerEmail:e.target.value})} /><small>Used for listing review and follow-up. Not automatically shown publicly.</small></label>
      <label>Private review phone<input required type="tel" inputMode="tel" autoComplete="tel" value={form.ownerPhone} onChange={(e)=>setForm({...form,ownerPhone:e.target.value})} /><small>Used if the listing team needs to verify information.</small></label>
      <label>Public business contact number<input required type="tel" inputMode="tel" value={form.contactNumber} onChange={(e)=>setForm({...form,contactNumber:e.target.value})} /></label>
      <label>Facebook page<input required type="url" inputMode="url" value={form.facebookPage} onChange={(e)=>setForm({...form,facebookPage:e.target.value})} placeholder="https://facebook.com/..." /></label>
      <label>Business description<textarea required minLength="20" rows="5" value={form.shortDescription} onChange={(e)=>setForm({...form,shortDescription:e.target.value})} placeholder="What do you offer, and what should customers know?" /></label>
      {message ? <div className={`native-message ${state === 'error' ? 'error' : ''}`}>{state === 'sent' || state === 'saved' ? <Check size={18}/> : null}<span>{message}</span></div> : null}
      <button className="secondary-button full" type="button" onClick={saveDraft}><Save size={17}/>Save Draft</button>
      <button className="primary-button full" type="submit" disabled={state === 'sending'}><Send size={17}/>{state === 'sending' ? 'Submitting…' : submitted ? 'Submit Updated Information' : 'Submit for Review'}</button>
      <button className="text-button centered" type="button" onClick={()=>{ saveDraft(); setEditing(false); }}>Back to Business Owner Tools</button>
    </form>
  </div>;

  return <div className="screen-stack mobile-native-stack seller-mobile-hub">
    <ScreenTitle title="For Business Owners" subtitle="Get your business represented accurately in Masinloc Marketplace." />
    <section className="seller-mobile-hero"><span><Store size={27}/></span><div><h2>Be easier to discover locally.</h2><p>Create or update your business listing for review before it appears in Marketplace.</p></div></section>
    {submitted ? <div className="native-message"><Clock3 size={18}/><span>Submission {saved.reference_code} is in the review queue. This device keeps the reference and public listing details only.</span></div> : hasDraft ? <div className="native-message"><Save size={18}/><span>You have a business listing draft saved on this device.</span></div> : null}
    <div className="native-action-list seller-actions">
      <button type="button" onClick={()=>setEditing(true)}><Store size={21}/><div><strong>{submitted ? 'Review / Update Submitted Information' : hasDraft ? 'Continue My Business Listing' : 'Add My Business to Marketplace'}</strong><span>{saved?.form?.brandName || 'Prepare your business information for review'}</span></div><ChevronRight size={18}/></button>
      <button type="button" onClick={()=>navigate('marketplace')}><Store size={21}/><div><strong>Browse Marketplace</strong><span>See how approved local businesses currently appear</span></div><ChevronRight size={18}/></button>
      <button type="button" onClick={()=>navigate('seller-guidelines')}><ClipboardList size={21}/><div><strong>Listing Guidelines</strong><span>What gets reviewed and how Marketplace works</span></div><ChevronRight size={18}/></button>
    </div>
    <section className="native-callout"><Wrench size={22}/><div><strong>Masinloc POS is a separate product</strong><span>POS tools and seller order operations are not enabled in this app yet. They will only be linked here after the separate POS system is production-ready.</span></div></section>
  </div>;
}

export function SellerGuidelinesScreen() {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="Business Listing Guidelines" subtitle="How business listings work inside Masinloc Connect." /><div className="policy-list native-policy-list"><article><Store size={22}/><div><h2>Marketplace listing</h2><p>Business information enters a review queue. Submission does not mean approval or automatic publication.</p></div></article><article><Check size={22}/><div><h2>Keep information accurate</h2><p>Use a real business name, usable location, current contact information and a working business page. Reviewers may need to verify details before publication.</p></div></article><article><Check size={22}/><div><h2>Private review details</h2><p>Owner name, private review email and private review phone are sent for review but are not retained in the saved submission snapshot after a successful submission.</p></div></article><article><Wrench size={22}/><div><h2>POS and order operations</h2><p>Masinloc POS is maintained separately and is still being completed. Masinloc Connect does not present unfinished POS or seller-order features as available.</p></div></article></div></div>;
}
