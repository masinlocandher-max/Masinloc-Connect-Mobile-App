import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, ChevronRight, HelpCircle, LocateFixed, RefreshCw, Shield, ShieldAlert, WifiOff } from 'lucide-react';
import { getEmergencyStatus, randomReportSecret, submitEmergencyReport } from '../lib/platform.js';
import { ScreenTitle } from '../components/UI.jsx';
import { incidentTypes, reportStatusCopy as statusCopy, reportStorageKey as storageKey } from '../emergencyData.js';

export default function HelpDeskScreen() {
  const [agency, setAgency] = useState('');
  const [mode, setMode] = useState('emergency');
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(() => { try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; } });
  const [form, setForm] = useState({ incident_type:'', description:'', barangay:'', landmark:'', reporter_name:'', reporter_contact:'', contact_preference:'chat' });
  const persist = useCallback((report) => { setActive(report); localStorage.setItem(storageKey, JSON.stringify(report)); }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) return setMessage('GPS is not available. Enter your barangay or nearest landmark instead.');
    setLocating(true); setMessage('');
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({ latitude:position.coords.latitude, longitude:position.coords.longitude, accuracy_m:position.coords.accuracy, location_captured_at:new Date(position.timestamp || Date.now()).toISOString() });
      setLocating(false);
    }, () => { setLocation(null); setLocating(false); setMessage('GPS could not be captured. Enter your barangay or nearest landmark.'); }, { enableHighAccuracy:true, timeout:12000, maximumAge:0 });
  }, []);

  const deliver = useCallback(async (report) => {
    if (!navigator.onLine) return report;
    const pending = { ...report, sync_state:'sending', status:'sending', updated_local_at:new Date().toISOString() }; persist(pending);
    try {
      const data = await submitEmergencyReport(pending);
      const delivered = { ...pending, sync_state:'delivered', status:data.status || 'received', reference:data.reference || pending.reference, received_at:data.received_at || pending.received_at, last_error:null, updated_local_at:new Date().toISOString() };
      persist(delivered); return delivered;
    } catch (error) {
      const queued = { ...report, sync_state:'queued', status:'saved_offline', last_error:error.message, updated_local_at:new Date().toISOString() }; persist(queued); return queued;
    }
  }, [persist]);

  useEffect(() => {
    const retry = () => { if (active?.sync_state === 'queued') deliver(active); };
    window.addEventListener('online', retry); return () => window.removeEventListener('online', retry);
  }, [active, deliver]);

  const submit = async (event) => {
    event.preventDefault(); setMessage('');
    if (!agency) return setMessage('Choose PNP or MDRRMO.');
    if (!form.incident_type) return setMessage('Choose an incident type.');
    if (form.description.trim().length < 3) return setMessage('Describe what is happening.');
    if (!location && !form.barangay.trim() && !form.landmark.trim()) return setMessage('Share GPS or enter a barangay / nearest landmark.');
    setSending(true);
    const report = {
      client_report_id:crypto.randomUUID(), report_secret:randomReportSecret(), target_agency:agency, report_mode:mode,
      incident_type:form.incident_type, description:form.description.trim(), reporter_name:form.reporter_name.trim() || null,
      reporter_contact:form.reporter_contact.trim() || null, contact_preference:form.contact_preference,
      latitude:location?.latitude ?? null, longitude:location?.longitude ?? null, accuracy_m:location?.accuracy_m ?? null,
      location_captured_at:location?.location_captured_at ?? null, barangay:form.barangay.trim() || null, landmark:form.landmark.trim() || null,
      source_created_at:new Date().toISOString(), sync_state:'queued', status:'saved_offline', reference:null, received_at:null, updated_local_at:new Date().toISOString(),
    };
    persist(report); await deliver(report); setSending(false);
  };

  const refresh = async () => {
    if (!active || active.sync_state !== 'delivered') return;
    setSending(true); setMessage('');
    try {
      const data = await getEmergencyStatus(active.client_report_id, active.report_secret); const incident = data.incident || {};
      persist({ ...active, status:incident.status || active.status, reference:incident.public_reference || active.reference, received_at:incident.received_at || active.received_at, acknowledged_at:incident.acknowledged_at || null, assigned_unit:incident.assigned_unit || null, resolved_at:incident.resolved_at || null, messages:data.messages || [], updated_local_at:new Date().toISOString() });
    } catch (error) { setMessage(error.message || 'Could not refresh report status.'); } finally { setSending(false); }
  };

  if (active) {
    const copy = statusCopy[active.status] || [active.status || 'Report saved', 'Status updated.'];
    return <div className="screen-stack"><ScreenTitle title="Your Help Desk Report" subtitle="This report stays on this device even when you are not signed in." />
      <section className={active.sync_state === 'delivered' ? 'report-status-card delivered' : 'report-status-card offline'}>{active.sync_state === 'delivered' ? <Check size={25} /> : <WifiOff size={25} />}<div><span>{active.reference || 'Pending delivery'}</span><h2>{copy[0]}</h2><p>{copy[1]}</p></div></section>
      <div className="report-facts"><div><span>Agency</span><strong>{active.target_agency?.toUpperCase()}</strong></div><div><span>Incident</span><strong>{active.incident_type?.replaceAll('_',' ')}</strong></div><div><span>Location</span><strong>{active.barangay || active.landmark || (active.latitude ? 'GPS captured' : 'Not available')}</strong></div></div>
      {active.assigned_unit ? <p className="report-assignment"><strong>Assigned unit:</strong> {active.assigned_unit}</p> : null}
      {active.messages?.length ? <div className="responder-messages"><h2>Responder messages</h2>{active.messages.map((item,index) => <p key={item.id || index}>{item.message || item.body || String(item)}</p>)}</div> : null}
      {message ? <div className="form-message"><AlertTriangle size={18} />{message}</div> : null}
      <div className="button-column">{active.sync_state === 'queued' ? <button className="primary-button danger full" type="button" disabled={!navigator.onLine || sending} onClick={() => deliver(active)}>{sending ? 'Sending…' : 'Retry sending'}</button> : null}
        {active.sync_state === 'delivered' ? <button className="primary-button full" type="button" disabled={sending} onClick={refresh}><RefreshCw size={17} />{sending ? 'Refreshing…' : 'Refresh status'}</button> : null}
        <button className="secondary-button full" type="button" onClick={() => { localStorage.removeItem(storageKey); setActive(null); setMessage(''); }}>Start another report</button></div>
    </div>;
  }

  return <div className="screen-stack"><ScreenTitle title="Help Desk" subtitle="Contact PNP or MDRRMO. An account is never required to report an incident." />
    <a className="emergency-call" href="tel:911"><ShieldAlert size={24} /><div><strong>Life-threatening emergency?</strong><span>Call 911 when you are able.</span></div><ChevronRight size={18} /></a>
    <form className="form-card" onSubmit={submit}><fieldset><legend>Who do you need?</legend><div className="agency-grid">
      <button type="button" className={agency === 'pnp' ? 'selected' : ''} onClick={() => { setAgency('pnp'); setForm((f) => ({...f,incident_type:''})); }}><Shield size={23} /><strong>PNP</strong><span>Police and public safety</span></button>
      <button type="button" className={agency === 'mdrrmo' ? 'selected' : ''} onClick={() => { setAgency('mdrrmo'); setForm((f) => ({...f,incident_type:''})); }}><HelpCircle size={23} /><strong>MDRRMO</strong><span>Rescue and disaster response</span></button></div></fieldset>
      {agency ? <><fieldset><legend>How urgent is this?</legend><div className="urgency-toggle"><button className={mode === 'emergency' ? 'active' : ''} type="button" onClick={() => setMode('emergency')}>Emergency</button><button className={mode === 'assistance' ? 'active' : ''} type="button" onClick={() => setMode('assistance')}>Assistance</button></div></fieldset>
        <label>Incident type<select value={form.incident_type} onChange={(e) => setForm({...form,incident_type:e.target.value})}><option value="">Choose incident type</option>{incidentTypes[agency].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>What is happening?<textarea rows="4" value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} placeholder="Describe what responders need to know." /></label>
        <div className={location ? 'location-card captured' : 'location-card'}><LocateFixed size={22} /><div><strong>{location ? 'Location captured' : 'Share location'}</strong><span>{location ? `GPS accuracy ±${Math.round(location.accuracy_m)}m` : 'GPS helps responders locate you.'}</span></div><button type="button" onClick={locate} disabled={locating}>{locating ? 'Locating…' : location ? 'Refresh' : 'Use GPS'}</button></div>
        <label>Barangay<input value={form.barangay} onChange={(e) => setForm({...form,barangay:e.target.value})} placeholder="Barangay" /></label><label>Nearest landmark<input value={form.landmark} onChange={(e) => setForm({...form,landmark:e.target.value})} placeholder="Nearest landmark" /></label>
        <details><summary>Optional contact details</summary><div className="detail-fields"><label>Name<input value={form.reporter_name} onChange={(e) => setForm({...form,reporter_name:e.target.value})} /></label><label>Phone or email<input value={form.reporter_contact} onChange={(e) => setForm({...form,reporter_contact:e.target.value})} /></label><label>Preferred contact<select value={form.contact_preference} onChange={(e) => setForm({...form,contact_preference:e.target.value})}><option value="chat">In-app / report chat</option><option value="call">Call</option><option value="sms">SMS</option></select></label></div></details>
        {message ? <div className="form-message"><AlertTriangle size={18} />{message}</div> : null}<button className="primary-button danger full" type="submit" disabled={sending}>{sending ? 'Saving report…' : navigator.onLine ? 'Send report' : 'Save report offline'}</button><p className="report-privacy-note">Your report is stored on this device first. “Received” appears only after the emergency service confirms delivery.</p></> : null}
    </form>
  </div>;
}
