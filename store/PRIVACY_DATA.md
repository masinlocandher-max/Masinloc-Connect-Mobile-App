# Masinloc Connect — privacy and store data disclosure map

This file is the engineering source of truth for completing Apple App Privacy and Google Play Data Safety forms. Store-console wording changes over time, so map these facts to the current form rather than copying old questionnaire labels mechanically.

## Account model

- Account creation is optional.
- Public browsing does not require an account.
- Incident reporting does not require an account.
- Passwordless email sign-in is used for saved/personalized features.
- In-app and public-web account deletion are available.

## Data processed when the user chooses an account

### Email address

**Purpose:** authentication and account access.  
**Required for account:** yes.  
**Required to use public app/reporting:** no.  
**Shared/sold for advertising:** no.

### Display name and optional location/barangay

**Purpose:** profile personalization.  
**Required:** no.  
**Shared/sold for advertising:** no.

### Career and resume information

May include full name, preferred email, current location, target roles, skills, profile summary, availability and resume versions.

**Purpose:** Signature Resume and job tools.  
**Required:** only when the user chooses those features.  
**Shared with job providers automatically:** no. A user may leave the app to apply on a provider website.  
**Shared/sold for advertising:** no.

### Saved-content references and saved jobs

**Purpose:** allow a signed-in user to return to selected jobs, Marketplace entries, Mabayani chapters and Sambal Tina words.  
**Stored as:** references/keys to canonical content, not copies of the public content.  
**Shared/sold for advertising:** no.

## Incident-report data

An anonymous or signed-in incident report may contain, depending on what the reporter provides:

- target responder desk (PNP or MDRRMO)
- incident/report type
- free-text description
- optional reporter name
- optional reporter contact
- optional contact preference
- optional barangay
- optional nearby landmark
- precise latitude/longitude and accuracy only when the user chooses to capture/attach device location
- local device report identifier and secret used to retrieve report status/messages
- server receipt/status timestamps and responder messages

**Purpose:** incident intake, routing, status communication and responder operations.  
**Account required:** no.  
**Advertising use:** none.  
**Retention:** emergency reports, responder messages, status history and related operational records may be retained for safety, accountability, dispute resolution, security or lawful recordkeeping even after an optional account is deleted.

## Device location

**Permission:** location while using the app.  
**Use:** incident-report location only when the user chooses to capture a GPS fix.  
**Alternative:** barangay or landmark can be entered manually.  
**Background location:** not used.  
**Continuous tracking:** not used.

The Home weather card uses a fixed Masinloc town-center coordinate for public weather data and does not require the user's device location.

## External/public services

### Supabase

Used for passwordless authentication, database access, row-level access control and server functions.

### Open-Meteo

Used for public Masinloc weather data from the configured town-center coordinate.

### Trusted job-provider websites

The app may open an external provider application page. Data entered on the provider's page is processed by that provider, not by the Masinloc Connect app.

### Masinloc Connect website / GitHub-hosted fallback

The app reads public editorial/community data and approved media from the canonical website data source, with a read-only repository fallback for availability.

## Advertising / tracking

- No third-party behavioral advertising SDK is included in this release.
- The app does not sell personal information.
- The app does not use cross-app tracking for advertising.
- Do not mark data as used for advertising unless the release changes to introduce such behavior.

## Account deletion behavior

Deletion removes the active authentication identity and optional mobile personal data including profile information, saved content, saved jobs and career/resume data. Operational emergency records and required transaction/audit records can remain where safety or recordkeeping requires them without a usable active account.

## Push notifications

Capacitor push capability is packaged for future native activation, but push notifications are not advertised as an active feature in this release. Do not declare production notification data collection until APNs/FCM credentials, token storage, user permission flow and server delivery behavior are actually implemented and verified.
