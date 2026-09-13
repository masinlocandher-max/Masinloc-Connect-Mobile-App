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

## Build

The application is built as a React + Vite mobile-first product, with Capacitor-ready structure for iOS and Android packaging.
