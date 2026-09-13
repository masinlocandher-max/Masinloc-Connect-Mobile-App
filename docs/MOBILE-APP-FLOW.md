# Masinloc Connect Mobile App Flow

Masinloc Connect is the mobile action layer. It may consume verified public data from the Masinloc website, but its navigation, presentation and interactions are intentionally mobile-native and distinct from the website.

## First run

1. Welcome / Join Masinloc Connect
2. Continue with Email or Explore as guest
3. Secure passwordless email link
4. Check-email state
5. Signed-in success state
6. Home

Public browsing remains available without an account. Account prompts are reserved for account-based personalized, saved, tracked or synchronized activity. Device-only Sambal Tina favorites remain accessible to guests.

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
- For Business Owners
- More Services
- Help Desk

## Jobs flow

Jobs & Opportunities supports search, category filters, location/work filters, live Supabase opportunity data, active-provider attribution, saved jobs, Signature Resume, My Applications and external application links.

Only opportunities with `verification_status = verified` are surfaced by the mobile client. An external opportunity is recorded as `Opened externally` only when a real application URL exists and the user actually opens it. The app never marks an application as submitted unless the user explicitly confirms it or a real provider/application backend confirms it.

## Marketplace and business-owner flow

Marketplace currently functions as a reviewed public business-discovery directory. It does not represent itself as an in-app ordering system and does not fabricate products, carts, order records or delivery state.

Business-owner tools currently support:

1. Create or continue a business listing draft on the current device.
2. Submit business details to the Marketplace review queue.
3. Keep the returned review reference and public listing snapshot on-device after a successful submission.
4. Browse the current approved Marketplace directory.
5. Read business-listing guidelines.

Private owner-review fields such as owner name, private review email and private review phone may exist in an intentionally saved draft. After successful submission, those private fields are not retained in the saved submission snapshot.

Masinloc POS, customer ordering and seller order management are separate systems and are not yet connected to this mobile app. Their controls must remain hidden until a truthful production integration exists.

## Sambal Tina

The app consumes the canonical Sambal Tina dataset and supports search, alphabetical filtering and device-only favorites. Pronunciation/audio must not be generated from generic Filipino device text-to-speech because that can misrepresent Tina Sambal pronunciation. Audio should only be exposed when a verified language-specific pronunciation source exists.

## Community contribution flow

More Services contains Submit Masinloc History, Submit a Sambal Tina Word, My Submissions and Suggest a Correction / Update. Contributions are sent to the connected review endpoint and a returned reference may be retained on the current device. Nothing is represented as reviewed or published merely because it was submitted.

## Help Desk

PNP / MDRRMO reporting remains available without an account. Reports are persisted on-device first, can capture GPS, support offline queueing and are shown as received only after the emergency service confirms delivery.

## Data integrity rules

- Do not invent job listings, applications, products, orders, emergency delivery, moderation status or publication status.
- Do not expose POS/order UI merely because a separate repository or future backend exists.
- Reuse verified public data where appropriate without copying the website experience.
- Do not present generic text-to-speech as verified Tina Sambal pronunciation.
- Website = public source / long-form layer.
- Mobile app = action / utility layer.
