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

## Native navigation behavior

Android hardware Back participates in Masinloc Connect navigation rather than blindly closing the WebView. If an account sheet is open, Back closes that sheet first. From a secondary screen it returns through the app's view history. Only when the user is already at Home does the native Back action exit the app.

## Jobs flow

Jobs & Opportunities supports search, category filters, location/work filters, live Supabase opportunity data, provider attribution, saved jobs, Signature Resume, My Applications and external application links.

The mobile client does not hard-code a competing interpretation of backend publication states. Public job and provider visibility is defined by Supabase grants and Row Level Security. The current backend exposes only rows that satisfy the public job/provider policies, including live, current opportunity conditions. This keeps the client aligned with the operational source of truth if publication-state names change later.

An external opportunity is recorded as `Opened externally` only when a real application URL exists and the user actually opens it. The app never marks an application as submitted unless the user explicitly confirms it or a real provider/application backend confirms it.

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

PNP / MDRRMO reporting remains available without an account. A report can capture GPS, work offline and retry when connectivity returns. While an unsent report is queued, the incident payload remains on the current device because the app needs it to complete delivery.

A network request marked `sending` is never trusted across an app restart. The persistent device copy is stored/recovered as `queued` until the emergency service explicitly confirms receipt, so a terminated app cannot strand a report in a false in-flight state. The user is given a Retry action when connectivity is available.

Once the emergency service confirms delivery, persistent device storage is minimized automatically. Description, GPS coordinates, reporter name, reporter contact details and precise location fields are removed. The device retains only the report identifier/secret required for status lookup, public reference, delivery/status timestamps, agency, incident type and a minimal location summary. Responder messages are fetched for the current session and are not retained in persistent device storage.

A report is never shown as `received` until the emergency service confirms delivery.

## Performance and loading

Home and first-run UI remain in the initial bundle. Secondary product screens are lazy-loaded on demand so opening Masinloc Connect does not download every feature before the user needs it.

## Data integrity rules

- Do not invent job listings, applications, products, orders, emergency delivery, moderation status or publication status.
- Do not expose POS/order UI merely because a separate repository or future backend exists.
- Let Supabase RLS define public operational job/provider visibility rather than duplicating mutable status rules in the client.
- Recover interrupted emergency sends as queued, never received or permanently sending.
- Reuse verified public data where appropriate without copying the website experience.
- Do not present generic text-to-speech as verified Tina Sambal pronunciation.
- Website = public source / long-form layer.
- Mobile app = action / utility layer.
