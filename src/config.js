export const WEBSITE_BASE = 'https://www.masinloc-zambales.com';

export const SOURCE_ARCHITECTURE = Object.freeze({
  publicSource: Object.freeze({
    website: WEBSITE_BASE,
    repository: 'masinlocandher-max/Masinloc-Website',
    rawDataBase: 'https://raw.githubusercontent.com/masinlocandher-max/Masinloc-Website/main/data',
    role: 'canonical-public-source',
  }),
  operationalBackend: Object.freeze({
    provider: 'Supabase',
    role: 'operational-database-and-backend',
  }),
  mobileApp: Object.freeze({
    repository: 'masinlocandher-max/Masinloc-Connect-Mobile-App',
    role: 'mobile-action-and-presentation-layer',
  }),
});

export const routes = {
  website: `${WEBSITE_BASE}/`,
  discover: `${WEBSITE_BASE}/discover/`,
  marketplace: `${WEBSITE_BASE}/marketplace.html`,
  mabayani: `${WEBSITE_BASE}/verified-history.html`,
  dictionary: `${WEBSITE_BASE}/sambal-tina.html`,
  helpDesk: `${WEBSITE_BASE}/emergency/`,
  connect: `${WEBSITE_BASE}/connect.html`,
  pos: `${WEBSITE_BASE}/posmasinloqueno/`,
};

export const assets = {
  logo: `${WEBSITE_BASE}/assets/masinloc-logo.webp`,
  hero: `${WEBSITE_BASE}/assets/hero/landing-hero-1280.avif`,
  marketplaceCafe: `${WEBSITE_BASE}/assets/marketplace/1418-cafe-640.avif`,
  mabayaniHistory: `${WEBSITE_BASE}/assets/mabayani/mabayani-history-1120.avif`,
};

// GeoNames town center for Masinloc, Zambales. Used only for the public weather
// summary when the user has not granted device location permission.
export const MASINLOC_CENTER = {
  latitude: 15.5363,
  longitude: 119.9502,
};

export const WEATHER_ENDPOINT = ({ latitude, longitude }) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=Asia%2FManila`;
