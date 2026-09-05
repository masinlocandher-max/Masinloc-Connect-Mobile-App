# Masinloc Connect Mobile App

**Connecting Masinloqueños to the World.**

This repository contains the mobile action layer for the Masinloc digital ecosystem.

## Architecture at a glance

- Canonical public website: `https://www.masinloc-zambales.com/`
- Canonical public source repository: `masinlocandher-max/Masinloc-Website`
- Operational database/backend: Supabase
- This repository: mobile action and presentation layer

Public facts and approved public content belong to the Masinloc website/repository. Mutable user, operational and transactional state belongs in Supabase. The mobile app consumes both; it must not become a competing source of truth.

See [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md) for the binding architecture rules.

## Product principles

1. Browse first. Registration is requested only when a user wants to save, personalize, track, apply, manage, or sync activity.
2. Emergency reporting must remain usable without an account.
3. Masinloc photography must come from approved website/repository assets or explicitly approved supplied assets. No substitute stock imagery.
4. Masinloc POS is discovered through Marketplace for business owners; it is not a primary resident navigation item.
5. The website remains the canonical source for verified history, Sambal Tina records, places, Marketplace public content, Community Bulletin content and long-form material.
6. Supabase remains the operational system for authentication, profiles, saved state, live job/provider records, career/resume data, emergency operations and future transactional services.
7. The app must not fabricate orders, jobs, emergency statuses, business records, historical facts or language entries when the authoritative source is unavailable.

## Primary navigation

- Home
- Marketplace
- Jobs
- Help Desk
- More

## Main menu

- Home
- Community Bulletin
- Marketplace
- My Orders
- Jobs & Opportunities
- For Sellers
- Discover Masinloc
- Profile / Account
- Sambal Tina
- About Masinloc Connect
- Masinloc History
- Privacy, Terms & Policies
- Help Desk
- Contact / Feedback

## Build

The application is being built as a React + Vite mobile-first product, with Capacitor-ready structure for eventual iOS and Android packaging.
