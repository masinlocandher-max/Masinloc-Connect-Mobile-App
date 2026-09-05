import { Bell, Bookmark, BriefcaseBusiness, BookOpen, ShoppingCart } from 'lucide-react';
import { EmptyState, ScreenTitle } from '../components/UI.jsx';

export function NotificationsScreen({ user }) {
  return <div className="screen-stack">
    <ScreenTitle title="Notifications" subtitle="Important Masinloc Connect updates will appear here." />
    <EmptyState icon={Bell} title="No notifications yet" body={user ? 'You are all caught up. New account, order and service updates will appear here when available.' : 'Browse Masinloc Connect freely. Sign in only when you want account-based notifications and saved activity.'} />
  </div>;
}

export function SavedScreen({ user, navigate, requireAccount }) {
  if (!user) return <div className="screen-stack"><ScreenTitle title="Saved" subtitle="Keep useful Masinloc Connect items together." /><EmptyState icon={Bookmark} title="Sign in to see saved items" body="Saved jobs and personalized content are tied to your account so they can stay with you across devices." /><button className="primary-button full" type="button" onClick={() => requireAccount('view your saved jobs and content', 'saved')}>Continue with Email</button></div>;
  return <div className="screen-stack">
    <ScreenTitle title="Saved" subtitle="Return to the things you want to keep." />
    <div className="saved-shortcuts">
      <button type="button" onClick={() => navigate('jobs')}><BriefcaseBusiness size={22} /><div><strong>Saved Jobs</strong><span>Open jobs and your saved opportunities.</span></div></button>
      <button type="button" onClick={() => navigate('marketplace')}><ShoppingCart size={22} /><div><strong>Marketplace</strong><span>Return to local businesses and listings.</span></div></button>
      <button type="button" onClick={() => navigate('dictionary')}><BookOpen size={22} /><div><strong>Sambal Tina</strong><span>Continue learning and revisit saved words.</span></div></button>
    </div>
  </div>;
}
