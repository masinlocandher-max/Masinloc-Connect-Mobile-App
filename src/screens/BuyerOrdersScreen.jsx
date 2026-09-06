import { useEffect, useMemo, useState } from 'react';
import { PackageCheck, RefreshCw } from 'lucide-react';
import { getBuyerOrders } from '../lib/mobileBackend.js';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(amount);
}

export default function BuyerOrdersScreen({ mode, user }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const load = () => {
    if (!user?.id) { setItems([]); setStatus('ready'); return; }
    setStatus('loading'); setMessage('');
    getBuyerOrders(user.id)
      .then((rows) => { setItems(rows); setStatus('ready'); })
      .catch(() => { setItems([]); setStatus('error'); setMessage('Your synced orders could not be loaded right now.'); });
  };

  useEffect(() => { load(); }, [user?.id]);

  const visible = useMemo(() => mode === 'tracking' ? items.filter((item) => !['completed','cancelled'].includes(String(item.status || '').toLowerCase())) : items, [items, mode]);
  const title = mode === 'tracking' ? 'Order Status / Tracking' : 'My Orders';
  const subtitle = mode === 'tracking' ? 'Current Marketplace orders linked to your account.' : 'Marketplace orders linked to your Masinloc Connect account.';

  return <div className="screen-stack mobile-native-stack">
    <ScreenTitle title={title} subtitle={subtitle} />
    {status === 'loading' ? <div className="async-state">Loading your orders…</div> : null}
    {message ? <div className="native-message error"><span>{message}</span><button type="button" onClick={load}><RefreshCw size={15}/>Retry</button></div> : null}
    {status === 'ready' && visible.length ? <div className="native-list order-live-list">{visible.map((item) => <article key={item.id}>
      <span className="native-list-icon"><PackageCheck size={20}/></span>
      <div><strong>Order #{item.order_number}</strong><small>{item.fulfillment || 'Order'} · {new Date(item.created_at).toLocaleString('en-PH')}</small></div>
      <div className="order-live-status"><strong>{String(item.status || 'pending').replaceAll('_',' ')}</strong><span>{money(item.total)}</span></div>
    </article>)}</div> : status === 'ready' ? <EmptyState icon={PackageCheck} title="No synced orders yet" body="Orders placed through participating Marketplace storefronts will appear here when they are linked to this account." /> : null}
  </div>;
}
