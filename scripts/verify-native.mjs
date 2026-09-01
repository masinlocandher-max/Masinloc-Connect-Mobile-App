import fs from 'node:fs';

const requiredFiles = [
  'android/app/src/main/AndroidManifest.xml',
  'android/app/build.gradle',
  'ios/App/App/Info.plist',
  'ios/App/App.xcodeproj/project.pbxproj',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Native release file missing: ${file}`);
}

const android = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const ios = fs.readFileSync('ios/App/App/Info.plist', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const capacitor = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));

const checks = [
  [capacitor.appId === 'com.masinloc.connect', 'Capacitor appId must remain com.masinloc.connect'],
  [capacitor.appName === 'Masinloc Connect', 'Capacitor appName must remain Masinloc Connect'],
  [android.includes('android:scheme="masinlocconnect"'), 'Android auth deep link is missing'],
  [android.includes('android.permission.ACCESS_FINE_LOCATION'), 'Android location permission is missing'],
  [ios.includes('<string>masinlocconnect</string>'), 'iOS auth URL scheme is missing'],
  [ios.includes('NSLocationWhenInUseUsageDescription'), 'iOS location privacy text is missing'],
  [Boolean(packageJson.dependencies?.['@capacitor/app']), '@capacitor/app is missing'],
  [Boolean(packageJson.dependencies?.['@capacitor/push-notifications']), '@capacitor/push-notifications is missing'],
];

for (const [ok, message] of checks) {
  if (!ok) throw new Error(message);
}

console.log('Native release contract verified.');
