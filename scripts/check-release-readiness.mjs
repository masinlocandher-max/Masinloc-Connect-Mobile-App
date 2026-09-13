import fs from 'node:fs';

function requireFile(path) {
  if (!fs.existsSync(path)) throw new Error(`Missing release file: ${path}`);
}

requireFile('dist/index.html');
requireFile('dist/manifest.webmanifest');
requireFile('dist/sw.js');
requireFile('dist/assets/masinloc-connect-logo.webp');
requireFile('assets/logo.svg');

const manifest = JSON.parse(fs.readFileSync('dist/manifest.webmanifest', 'utf8'));
if (manifest.name !== 'Masinloc Connect') throw new Error('Manifest app name is incorrect.');
if (manifest.start_url !== '/' || manifest.scope !== '/') throw new Error('Manifest start_url/scope must be root.');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 1) throw new Error('Manifest must define install icons.');
if (manifest.icons.some((icon) => /^https?:\/\//i.test(icon.src))) throw new Error('Manifest icons must be local release assets.');

const index = fs.readFileSync('dist/index.html', 'utf8');
if (/rel="icon"[^>]+https?:\/\//i.test(index)) throw new Error('Release favicon must not depend on an external site.');
if (!index.includes('manifest.webmanifest')) throw new Error('Manifest link is missing from release HTML.');

const sw = fs.readFileSync('dist/sw.js', 'utf8');
if (!sw.includes('masinloc-connect-shell-')) throw new Error('Offline app-shell service worker is not the expected release worker.');

const nativeConfig = fs.readFileSync('scripts/configure-native-auth.mjs', 'utf8');
if (!nativeConfig.includes('ACCESS_FINE_LOCATION') || !nativeConfig.includes('NSLocationWhenInUseUsageDescription')) {
  throw new Error('Native Help Desk location permissions are not configured.');
}

const policies = fs.readFileSync('src/screens/UtilityScreens.jsx', 'utf8');
if (policies.includes('Final legal text must remain synchronized')) throw new Error('Placeholder policy copy is still present.');

console.log('Release readiness checks passed.');
