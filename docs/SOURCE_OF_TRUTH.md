# Masinloc Connect Source of Truth

This document is an architectural contract for the Masinloc Connect ecosystem.

## 1. Canonical public source

The canonical public source of truth is:

- Website: `https://www.masinloc-zambales.com/`
- Repository: `masinlocandher-max/Masinloc-Website`

The website repository owns approved public and editorial source data, including verified history, Sambal Tina records, Discover Masinloc content, Marketplace directory content, Community Bulletin content, approved public imagery, and other long-form/public reference material.

The mobile app must not silently create a competing copy of canonical Masinloc facts. When public source data exists in `Masinloc-Website`, the app should consume it rather than fork it.

## 2. Operational database and backend

Supabase is the shared operational database/backend for mutable application data.

It is used for data that changes through user or operational activity, including authentication, member profiles, saved items, jobs/provider records, career/resume data, emergency reporting/status, and other future transactional services such as Marketplace ordering when they are connected.

GitHub and the website repository are not a replacement for a transactional database.

## 3. Mobile app role

`masinlocandher-max/Masinloc-Connect-Mobile-App` is the mobile action layer.

Its job is to combine canonical public data from the Masinloc website with operational data/services from Supabase to let people browse, save, apply, buy, report, learn, manage, and participate.

The mobile app may transform presentation and interaction for mobile UX, but it must not rewrite canonical public facts or invent transactional records.

## 4. Authority order

When sources conflict, use this order:

1. Explicit approved source data in `Masinloc-Website` for public facts/content.
2. Supabase for current operational/user/transactional state.
3. Mobile-app local state only for temporary UI state, offline queues, drafts, or device-local resilience.

A local mobile value must never override an authoritative canonical or operational value merely because it is cached.

## 5. Current canonical public datasets

The mobile platform client currently consumes these website datasets when available:

- `data/marketplace.json`
- `data/marketplace-logos.json`
- `data/mabayani.json`
- `data/sambal-tina.json`
- `data/discover.json`
- `data/bulletin.json`

The preferred request path is the deployed Masinloc website. The raw `Masinloc-Website/main/data` GitHub path is a fallback, not a second source of truth.

## 6. Non-negotiable rules

- Do not duplicate canonical Masinloc content into this repo unless it is a deliberate build/cache artifact.
- Do not invent business listings, historical facts, Sambal Tina entries, jobs, orders, emergency statuses, or user records.
- Approved Masinloc photography and brand assets should come from approved repository/website assets or explicitly supplied approved assets.
- Emergency reporting must remain available without account registration.
- Orders and tracking must remain truthful: if the shared ordering backend is not connected, show an empty/not-connected state instead of fabricated order data.
- Any future backend migration must update this document and the architecture constants in `src/config.js` in the same change.

## 7. Architecture summary

`Masinloc-Website / masinloc-zambales.com` → canonical public source

`Supabase` → shared operational database/backend

`Masinloc-Connect-Mobile-App` → mobile action and presentation layer
