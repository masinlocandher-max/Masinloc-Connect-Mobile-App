# Masinloc Connect — native release checklist

## Automated and source-controlled

- [x] Shared Masinloc Connect website/Supabase platform
- [x] Native Capacitor iOS project generated
- [x] Native Capacitor Android project generated
- [x] Bundle/package identifier `com.masinloc.connect`
- [x] Masinloc app icon source and generated native assets
- [x] Branded native splash screen
- [x] Native external-browser handling
- [x] Native passwordless email callback code
- [x] Android `masinlocconnect://auth/callback` intent filter
- [x] iOS `masinlocconnect` URL scheme
- [x] Android location permissions
- [x] iOS location privacy usage text
- [x] Android unsigned debug compile gate
- [x] iOS Simulator unsigned compile gate
- [x] In-app account deletion
- [x] Authenticated server-side account deletion function
- [x] Public privacy-policy page prepared
- [x] Public web account-deletion page prepared
- [x] App Store metadata prepared
- [x] Play Store metadata prepared
- [x] Privacy/data-disclosure map prepared

## Must be completed with account-owner access before signing/submission

### Supabase Auth

Add these exact redirect URLs to the production Auth URL allowlist:

- `masinlocconnect://auth/callback`
- `https://www.masinloc-zambales.com/account-deletion/`

Then test passwordless email sign-in on a real iPhone and a real Android device.

### Apple

- Select the Apple Developer Team for `com.masinloc.connect`.
- Create/confirm the App ID and signing capability in the Apple Developer account.
- Create the App Store Connect app record.
- Set version/build numbers for the submission build.
- Create an Archive signed for App Store distribution.
- Upload through Xcode/Transporter.
- Complete App Privacy and age-rating questionnaires.
- Upload final screenshots from the release screenshot set.
- Confirm the public privacy and account-deletion URLs are live before review.

### Google Play

- Create/confirm package `com.masinloc.connect` in Play Console.
- Complete Play App Signing setup.
- Generate a signed production Android App Bundle (`.aab`).
- Upload first to an internal/closed test track.
- Complete Data Safety and content-rating forms.
- Upload final screenshots and feature graphic.
- Confirm the public privacy and account-deletion URLs are live before review.

### Push notifications

Do not expose push notifications as a working feature until all of these exist and have been tested:

- Apple Push Notification / APNs credentials
- Firebase Cloud Messaging configuration for Android
- user permission flow
- device-token registration/storage
- server delivery function
- opt-out behavior
- real-device delivery tests

The native push plugin is packaged so this can be added without restructuring the app, but it is not an active product promise in this release.

## Release decision

A green web build is not enough. Merge/release only after the final branch head passes both Mobile App CI and Native Release CI, and after the privacy/deletion support pages pass the website's integrity/security/browser gates.
