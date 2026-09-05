# Masinloc Connect Mobile App Flow

Masinloc Connect is the mobile action layer. It may consume verified public data from the Masinloc website, but its navigation, presentation and interactions are intentionally mobile-native and distinct from the website.

## First run

1. Welcome / Join Masinloc Connect
2. Continue with Email or Explore as guest
3. Secure passwordless email link
4. Check-email state
5. Signed-in success state
6. Home

Public browsing remains available without an account. Account prompts are reserved for personalized, saved, tracked or synchronized activity.

## Main mobile destinations

- Home
- Notifications
- Profile
- Discover Masinloc
- Saved
- Sambal Tina
- Masinloc History
- Jobs & Opportunities
- Marketplace
- For Sellers
- More Services
- Help Desk

## Jobs flow

Jobs & Opportunities supports search, category filters, location/work filters, live Supabase opportunity data, trusted-provider attribution, saved jobs, Signature Resume, My Applications and external application links. Opening an external opportunity can be recorded locally as `Opened externally`; the app never marks an application as submitted unless a real provider or application backend confirms it.

## Marketplace and seller flow

The Marketplace currently uses reviewed public business records. It does not fabricate products or order records. Seller tools include a mobile listing draft, Masinloc POS access, Marketplace Orders and Seller Guidelines. Business drafts remain on-device until a seller-publication backend is connected.

## Community contribution flow

More Services contains Submit Masinloc History, Submit a Sambal Tina Word, My Submissions and Suggest a Correction / Update. In the current frontend-only flow, contributions are saved on-device and explicitly labeled as such. They are not represented as reviewed, received or published until a submission backend is connected.

## Help Desk

PNP / MDRRMO reporting remains available without an account. Reports are persisted on-device first, can capture GPS, support offline queueing and are shown as received only after the emergency service confirms delivery.

## Data integrity rules

- Do not invent job listings, applications, products, orders, emergency delivery, moderation status or publication status.
- Reuse verified public data where appropriate without copying the website experience.
- Website = public source / long-form layer.
- Mobile app = action / utility layer.
