# Masinloc Connect Mobile App

**Connecting Masinloqueños to the World.**

This repository contains the mobile action layer for the Masinloc digital ecosystem.

## Architecture at a glance

- Canonical public website: `https://www.masinloc-zambales.com/`
- Canonical public source repository: `masinlocandher-max/Masinloc-Website`
- Operational database/backend: Supabase
- This repository: mobile action and presentation layer

Public facts and approved public content belong to the Masinloc website/repository. Mutable user and operational state belongs in Supabase. The mobile app consumes both; it must not become a competing source of truth.

See [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md) for the binding architecture rules.

## Product principles

1. Browse first. Registration is requested only for account-based personalization, saves, tracking, applications, management or synchronization.
2. Device-only Sambal Tina favorites remain usable by guests.
3. Emergency reporting must remain usable without an account.
4. Masinloc photography must come from approved website/repository assets or explicitly approved supplied assets. No substitute stock imagery.
5. The website remains the canonical source for verified history, Sambal Tina records, places, Marketplace public content, Community Bulletin content and long-form material.
6. Supabase remains the operational system for authentication, profiles, saved state, verified job/provider records, career/resume data, emergency operations and connected review submissions.
7. The app must not fabricate orders, jobs, emergency statuses, business records, historical facts or language entries when an authoritative source is unavailable.
8. Marketplace currently provides reviewed business discovery plus a business-listing review workflow. Customer ordering and seller order management are not connected yet.
9. Masinloc POS is a separate product/repository. It must not appear as a working Masinloc Connect feature until a real production integration exists.
10. Sambal Tina pronunciation/audio must use a verified language-specific source. Generic Filipino device text-to-speech must not be presented as Tina Sambal pronunciation.
11. Device permissions are requested only when a connected feature genuinely needs them. Help Desk location is foreground-only and optional; push-notification permission is not requested until production push delivery exists.
12. Release builds must pass dependency audit, release-packaging checks, browser regression tests and native Android/iOS compilation.

## Primary navigation

- Home
- Notifications
- Profile
- Discover
- Saved

## Main destinations

- Home
- Community Bulletin
- Marketplace
- Jobs & Opportunities
- For Business Owners
- Discover Masinloc
- Profile / Account
- Sambal Tina
- About Masinloc Connect
- Masinloc History
- Privacy, Terms & Policies
- Help Desk
- Contact / Feedback

## Current Marketplace and business-owner boundary

Masinloc Connect does **not** currently expose customer ordering, seller order management or POS controls. Those functions should only be added when their separate systems are production-ready and connected to truthful backend state.

The business-owner flow currently supports:

- saving a listing draft on the current device;
- submitting business information to the Marketplace review queue;
- keeping the review reference and public listing snapshot on-device after successful submission;
- browsing approved Marketplace listings;
- reading business-listing guidelines.

Private owner-review fields may be retained while a draft is intentionally saved, but after a successful submission the saved submission snapshot keeps only public listing details and the review reference.

## Offline and install behavior

- The web build ships a local manifest and local install icon rather than depending on the public website for install metadata.
- A production service worker caches the app shell for installed-web startup.
- Canonical public data that the user has already opened can be retained in Cache Storage and used when both the website and canonical repository are unreachable.
- Live account sync, live jobs, emergency delivery/status refresh and other operational services still require connectivity.
- An offline banner communicates that distinction instead of implying that every feature works offline.

## Help Desk release rules

- PNP/MDRRMO reporting remains available without an account.
- GPS is optional; barangay or landmark can be entered instead.
- Native Android builds declare coarse/fine foreground location permission and iOS builds include a When-In-Use location purpose string.
- No background location permission is requested.
- Unsent report details stay on-device only as needed for retry.
- After confirmed delivery, persistent device data is minimized to tracking information and a minimal incident/location summary.
- A report interrupted while sending recovers as queued, never as falsely received.

## Notifications

The Notifications destination supports in-app updates. Masinloc Connect intentionally does **not** request device push permission until a real production push-delivery and device-token registration path is connected.

## Accessibility

Release UI includes keyboard focus visibility, a skip-to-content link, view-change focus management, reduced-motion support, status announcements and semantic labels for key controls and connectivity states.

## Build and validation

The application is React + Vite with Capacitor packaging for iOS and Android.

```bash
npm install
npm audit --audit-level=high
npm run build
npm run check:release
npm run test:e2e
```

`npm run build` generates the PWA resources from `assets/logo.svg` before the Vite production build. Native Android/iOS resource generation is exercised by the Native App Check workflow together with auth-scheme, Help Desk location-permission and platform compile checks.

The repository should use a committed `package-lock.json` and `npm ci` in CI once the dependency graph is finalized; do not intentionally return to floating release installs.
