import fs from 'node:fs';

const androidManifest = 'android/app/src/main/AndroidManifest.xml';
const iosPlist = 'ios/App/App/Info.plist';

function replaceFile(path, transform) {
  if (!fs.existsSync(path)) throw new Error(`Missing generated native file: ${path}`);
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(path, after);
}

replaceFile(androidManifest, (source) => {
  let next = source;
  const permissions = [
    '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
    '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
    '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  ];
  for (const permission of permissions) {
    if (!next.includes(permission)) {
      next = next.replace(/(<manifest[^>]*>)/, `$1\n    ${permission}`);
    }
  }

  if (!next.includes('android:scheme="masinlocconnect"')) {
    const deepLink = `\n            <intent-filter>\n                <action android:name="android.intent.action.VIEW" />\n                <category android:name="android.intent.category.DEFAULT" />\n                <category android:name="android.intent.category.BROWSABLE" />\n                <data android:scheme="masinlocconnect" android:host="auth" android:pathPrefix="/callback" />\n            </intent-filter>`;
    next = next.replace(/(<activity[\s\S]*?android:name="\.MainActivity"[\s\S]*?)(<\/activity>)/, `$1${deepLink}\n        $2`);
  }
  return next;
});

replaceFile(iosPlist, (source) => {
  let next = source;
  const additions = [];
  if (!next.includes('<key>CFBundleURLTypes</key>')) {
    additions.push(`\t<key>CFBundleURLTypes</key>\n\t<array>\n\t\t<dict>\n\t\t\t<key>CFBundleURLName</key>\n\t\t\t<string>com.masinloc.connect.auth</string>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>masinlocconnect</string>\n\t\t\t</array>\n\t\t</dict>\n\t</array>`);
  }
  if (!next.includes('<key>NSLocationWhenInUseUsageDescription</key>')) {
    additions.push(`\t<key>NSLocationWhenInUseUsageDescription</key>\n\t<string>Masinloc Connect uses your location only when you choose to attach it to an incident report so responders can find the reported location.</string>`);
  }
  if (additions.length) {
    const lastDict = next.lastIndexOf('</dict>');
    next = `${next.slice(0, lastDict)}${additions.join('\n')}\n${next.slice(lastDict)}`;
  }
  return next;
});

console.log('Native deep-link and permission configuration applied.');
