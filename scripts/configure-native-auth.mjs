import fs from 'node:fs';

const scheme = 'com.masinloc.connect';
const host = 'auth';
const locationUsage = 'Masinloc Connect uses your location only when you choose Use GPS in Help Desk so responders can locate the incident.';

function patchAndroid() {
  const path = 'android/app/src/main/AndroidManifest.xml';
  if (!fs.existsSync(path)) return;
  let xml = fs.readFileSync(path, 'utf8');

  const permissionMarker = '<application';
  const permissions = [
    '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
    '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
  ];
  for (const permission of permissions) {
    if (!xml.includes(permission)) {
      if (!xml.includes(permissionMarker)) throw new Error('Android application marker not found.');
      xml = xml.replace(permissionMarker, `    ${permission}\n    ${permissionMarker}`);
    }
  }

  if (!xml.includes(`android:scheme="${scheme}"`)) {
    const marker = '</activity>';
    const intentFilter = `\n            <intent-filter>\n                <action android:name="android.intent.action.VIEW" />\n                <category android:name="android.intent.category.DEFAULT" />\n                <category android:name="android.intent.category.BROWSABLE" />\n                <data android:scheme="${scheme}" android:host="${host}" />\n            </intent-filter>\n`;
    if (!xml.includes(marker)) throw new Error('Android MainActivity marker not found.');
    xml = xml.replace(marker, `${intentFilter}        ${marker}`);
  }

  fs.writeFileSync(path, xml);
  console.log('Configured Android auth deep link and Help Desk location permissions.');
}

function patchIos() {
  const path = 'ios/App/App/Info.plist';
  if (!fs.existsSync(path)) return;
  let plist = fs.readFileSync(path, 'utf8');
  const marker = '</dict>';
  if (!plist.includes(marker)) throw new Error('iOS Info.plist marker not found.');

  if (!plist.includes('<key>NSLocationWhenInUseUsageDescription</key>')) {
    const locationEntry = `\n\t<key>NSLocationWhenInUseUsageDescription</key>\n\t<string>${locationUsage}</string>\n`;
    plist = plist.replace(marker, `${locationEntry}${marker}`);
  }

  if (!plist.includes(`<string>${scheme}</string>`)) {
    const urlTypes = `\n\t<key>CFBundleURLTypes</key>\n\t<array>\n\t\t<dict>\n\t\t\t<key>CFBundleTypeRole</key>\n\t\t\t<string>Editor</string>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>${scheme}</string>\n\t\t\t</array>\n\t\t</dict>\n\t</array>\n`;
    plist = plist.replace(marker, `${urlTypes}${marker}`);
  }

  fs.writeFileSync(path, plist);
  console.log('Configured iOS auth deep link and Help Desk location permission copy.');
}

patchAndroid();
patchIos();
