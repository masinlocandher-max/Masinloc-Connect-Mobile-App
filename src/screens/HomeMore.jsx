import { mainMenuItems, moreItems } from '../navigation.js';
import { MenuCard, ScreenTitle } from '../components/UI.jsx';

export function HomeHub({ navigate }) {
  return <div className="hub-screen">
    <div className="section-label">MAIN MENU</div>
    <section className="main-menu-grid" aria-label="Masinloc Connect main menu">
      {mainMenuItems.map((item) => <MenuCard key={`${item.id}-${item.label}`} item={item} onClick={() => navigate(item.id)} />)}
    </section>
  </div>;
}

export function MoreScreen({ navigate }) {
  return <div className="screen-stack">
    <ScreenTitle title="More" subtitle="Discover, learn, manage orders and access your Masinloc Connect account." />
    <section className="more-menu-grid" aria-label="More menu">
      {moreItems.map((item) => <MenuCard compact key={`${item.id}-${item.label}`} item={item} onClick={() => navigate(item.id)} />)}
    </section>
  </div>;
}
