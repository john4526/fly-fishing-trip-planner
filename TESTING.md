# Central Testing & Regression Conditions

This document catalogs all test conditions for the Fly Fishing Trip Planner. As required by our AI Agent rules, any new feature must have its test conditions documented here.

## 1. Authentication & User Sessions
- **Sign Up**: Verify that a user can sign up with a valid email and password.
- **Log In**: Verify that an existing user can log in with valid credentials.
- **Log Out**: Verify that clicking "Sign Out" removes the user session and updates the UI.
- **Persistence**: Verify that refreshing the page maintains the logged-in state.
- **Error Handling**: Verify that invalid credentials, existing emails, or weak passwords show appropriate inline error messages.

## 2. Favorites Management
- **Require Auth**: Verify that clicking the "Save to Favorites" star while logged out prompts the user to sign in.
- **Toggle Favorite**: Verify that an authenticated user can toggle a river as a favorite.
- **Visual Indication**: Verify that favorited rivers show a filled yellow star in the corridor header.

## 3. USGS Live Streamflow
- **Data Fetching**: Verify that streamflow data correctly fetches from the USGS gauge API for the active river.
- **Progress Bar**: Verify the visual progress bar accurately places the current flow relative to the reference min/max limits.
- **Flow comparisons**: Verify below/within/above reference-range text for recent flow. Delayed flow has no comparison, and secondary gauges without their own range are not classified.
- **Error Handling**: Verify that if the USGS API fails, an error message and the "Refresh readings" button remain available.

## 4. Weather Forecast
- **Current Conditions**: Verify that current temperature, description, wind speed/direction, and humidity load correctly for the river's coordinates.
- **Forecast Strip**: Verify that the 3-hour / 5-day horizontal forecast strip displays destination date/time, conditions, and temperature correctly.
- **Error Handling**: Verify that weather API failures show an error state with a "Retry" button.

## 5. Fish Stocking History
- **Display Stocking**: Verify that stocking records (if available) are fetched and displayed in the "Stream Profile & Access Info" card.
- **Empty State**: Verify that rivers without stocking records show the correct placeholder message.
- **Map Integration**: Verify the "Stocking: ON/OFF" toggle updates the state and sends the `update_stocking` postMessage to the map iframe.

## 6. Angler Reports & Reviews
- **Review Fetching**: Verify that Google Places reviews are successfully fetched and displayed for the active river.
- **Rating Summary**: Verify the average rating and total review count are accurate.
- **Star Rendering**: Verify that the 5-star visual render properly matches the rating value.
- **Empty State**: Verify that rivers without reviews show an explicit no-reviews or unavailable state.

## 7. River Navigation
- **Selection**: Verify that choosing a corridor from its state page loads the correct USGS gauge, weather coordinates, reviews, and map access points. Navigating between corridors must not retain the previous selection or let late responses overwrite the new data.

## 8. Interactive Maps & Access Spots
- **Tab Switching**: Verify that switching between "Conditions & Reports" and "Access & Maps" works correctly.
- **Spot Selection**: Verify that selecting an access point updates the map iframe (via postMessage) with the new coordinates and marker.
- **Directions Link**: Verify that the "Get Driving Directions" link generates the correct Google Maps URL for the active access point.

## 9. Admin Kanban Board
- **Access Control**: Verify that only users with the `admin: true` Firebase ID-token claim can see the "Admin Dashboard" link and access the Kanban board.
- **Task Management**: Verify that admins can change task status and acceptance criteria, and changes persist in the same browser. There is currently no create/delete interface.

## 10. State-Based Site Architecture (New Layout)
- **Landing Page (`/`)**: Verify that visiting `/` greets the user with 7 state cards (Ohio, Michigan, Pennsylvania, West Virginia, Tennessee, North Carolina, Montana) showing state abbreviation, description, and corridor counts.
- **State Overview (`/states/[stateId]`)**: Verify that clicking any state card navigates to `/states/[stateId]` and renders a two-column layout with the Leaflet map and corridor list, stacking to one column on narrow screens.
- **State Vector Map**: Verify that hovering over river path segments on the vector map highlights the line and displays a floating tooltip with name, location, and click instruction.
- **Corridor Dashboard (`/states/[stateId]/corridors/[corridorId]`)**: Verify that clicking a river corridor (either on the map or in the cards list) navigates to the detailed corridor dashboard `/states/[stateId]/corridors/[corridorId]`.
- **Navigation Flow**: Verify that the "Back to States" button on `/states/[stateId]` and the "Back to [State] Map" button on the corridor details sidebar return the user to the correct parent views.

## 11. Automated Vertical Slice Jest Suites
The following automated suites cover selected conditions; the remaining conditions require manual or additional automated verification:
- **`src/__tests__/river-corridors.test.js`**: Validates 7-state configuration integrity, flow status thresholds (below, within, or above the reference range), and coordinate bounds.
- **`src/__tests__/weather-api.test.js`**: Validates `/api/weather` query validation (400 response on missing coordinates) and weather data transformation.
- **`src/__tests__/auth-favorites.test.js`**: Validates `AuthContext` state logic, trusted admin claims, and favorites array toggling.



## 12. Security and truthful review data
- **Unavailable accounts:** With Firebase configuration absent or incomplete, account forms are not shown and sign-in/signup cannot create local demo accounts. Existing `mock_users` and `mock_user` storage is removed without reading passwords.
- **Admin authorization:** An ordinary authenticated account, including an address formerly hard-coded as admin, receives no admin access. Only the trusted Firebase ID-token `admin: true` claim enables the admin UI; a changed token updates the role.
- **Account races:** A favorites read completing after sign-out must not restore the old account or its favorites.
- **Favorite persistence:** Successful writes update the current user's document; failed writes preserve the previous UI state and show a retryable error. Repeated clicks while saving do not produce overlapping writes.
- **Firestore rules (deployment prerequisite):** In the Firebase emulator or a dedicated test project, verify unauthenticated and cross-user reads/writes fail, owners can update favorites, and owners cannot write role fields. The committed rules are not automatically deployed by a Next.js build.
- **Map HTML:** URL names, access-point names, gauge names, and stocking text containing HTML must display literally and never create executable elements.
- **Map messages:** Reject unknown origins, unexpected source windows, malformed coordinates, and navigation to corridors not in the current state.
- **Map readiness:** On the first load and on tab changes, the selected access point, gauges, and stocking visibility synchronize after the iframe is ready.
- **Map failure:** Block the basemap request and verify a readable unavailable message appears while the independent corridor list remains usable.
- **Reviews without configuration:** Missing Places configuration shows an unavailable state with no made-up names, dates, ratings, or review counts. Unknown river IDs and arbitrary search requests are rejected before calling Google.

Automated coverage for this phase: `auth-favorites.test.js` exercises the provider, `map-security.test.js` exercises iframe navigation and the access-map script, and `reviews-api.test.js` exercises the route. API tests run in Node; browser-component tests explicitly select jsdom. Firestore rules require separate emulator validation before deployment.

## 13. Reliable conditions, responsiveness, and delivery
- **USGS ordering:** Provide out-of-order flow, height, and unrelated parameters. Only the newest matching-site instantaneous observation for each parameter is used; their timestamps remain independent.
- **USGS no-data:** Null, empty, nonnumeric, sentinel, and unsupported-unit values show unavailable, never zero or a newly dated older value. A true zero remains zero. Invalid site IDs return 400 without upstream requests; failures return 502.
- **Staleness:** Flow over one hour old, with no valid time, or dated in the future must not receive a current reference-range badge. The actual date/time remains visible.
- **Weather semantics:** Open-Meteo requests Fahrenheit, mph, inches, and epoch time. NWS probability stays a percentage and its unknown amount, pressure, cloud cover, feels-like temperature, sun times and gusts remain null. True zero humidity is preserved.
- **Forecast coverage:** Return five local dates and up to forty 3-hour forecast entries over 120 hours. Never promise five complete days when fewer are supplied. Show that today's temperature range may cover only remaining hours.
- **Timezones:** Test Eastern and Mountain destinations, local midnight, and the repeated hour during fall DST. Formatting must use the destination timezone, not server/browser timezone.
- **Provider fallback:** Timeout or malformed primary responses attempt NWS; non-NWS forecast URLs are rejected. Both providers failing produces 503 and a usable retry state.
- **Request lifecycle:** Change corridor while a request is pending. Abort obsolete work and ignore any late resolution. Poll river data every five minutes and weather every fifteen minutes; stop on unmount. A failed refresh preserves last data with an error, and retry replaces it on success.
- **Mobile:** At 390px width, state map and corridor list stack; headers, account area, species, weather, gauge selection, and map controls fit without horizontal clipping. Access-point selection must work with keyboard as well as touch; controls expose names and pressed state.
- **Kanban storage:** Corrupt JSON or invalid saved shapes must not crash or be overwritten on load. Show defaults with an error. Saved changes update the UI and survive remount; storage failures display an error without claiming success.
- **Delivery:** CI must pass `npm run lint`, `npm test -- --runInBand`, and `npm run build` without production secrets. Keep SSH keys, environment files, and private access notes out of commits.

Automated additions: `river-api.test.js`, `conditions-ui.test.js`, and `kanban-storage.test.js`. The existing corridor suite now calls the production flow classifier; `weather-api.test.js` exercises both real normalizers. Phone-width and map-tile rendering are visual checks, not claims of automated browser coverage. Firestore rule deployment remains a separate prerequisite.

## 14. Firebase deployment and private hosting

Run `npm run test:rules` with Java 21. `scripts/check-firestore-rules.mjs` exercises the actual `firestore.rules` in the loopback emulator:

- An owner can create and read their document, atomically add/remove favorites, and delete the document.
- Unauthenticated clients and another account cannot read, create, update, or delete someone else's document.
- Client writes cannot create or modify `admin` or `role` fields, including replacing a complete document. Server-managed fields remain intact during favorites updates.
- Favorites must be a list; 100 entries are allowed, 101 entries, missing values, null, strings, and maps are denied.
- Other collections and nested documents remain inaccessible, including to a client with an admin token, except the explicitly owner-scoped plan documented below.
- The test entry point refuses to run without `127.0.0.1:8180`; the runner always selects `demo-fishing-planner`, never a live project.

Release checks requiring the deployed environment:

- Confirm Email/Password is enabled in the intended Firebase project and the tailnet hostname is authorized. Verify signup, sign-in, sign-out, refresh persistence, and favorites with test accounts; remove test accounts and documents afterwards.
- Deploy the tested rules explicitly before account use. Repeat owner access and cross-user denial checks against the new project.
- Test the exact Linux release on a separate loopback port with its build-time Firebase configuration. Verify landing, state, corridor, API validation, current conditions, maps, and account form availability.
- Verify HTTPS using normal certificate validation from a tailnet client; confirm Serve has no Funnel exposure and Next.js listens only on loopback.
- Verify only the fishing app changes during cutover, the previous release remains available, the final process is saved for reboot, and unrelated apps still respond. Record the release commit, smoke results, and rollback commands in private operations notes.

## 15. Two-outing Pennsylvania planner

- **Navigation and layout:** Home, Pennsylvania overview, and Pennsylvania corridors link to `/plan`. Verify two separately labeled outings at desktop and 390px widths, visible keyboard focus, readable source links, no horizontal clipping, and a working `/planning-sources` link.
- **Dates:** Leave dates blank and save an unscheduled draft. Set a trip crossing a calendar year and choose two different dates within it. Reject duplicate dates, impossible dates, an outing outside the trip, a missing trip endpoint, reversed dates, and windows longer than 31 days. Personal travel dates must not be embedded in public source.
- **Budget:** For 4, 5, and 6 hours, subtract twice the one-way drive and the total access buffer. Verify zero-minute overrides remain zero, blank overrides use the base estimate, and changing a base or stream clears its old override. Primary and backup must differ. A backup is calculated independently from the same base, not chained to the primary.
- **Long drives:** Spring Creek from Lancaster leaves no fishing time in a six-hour window with the current 170-minute allowance and 30-minute access buffer. Hershey's 145-minute allowance leaves 40 minutes. Show no-time or short-outing warnings; never manufacture more fishing time to make the choice fit.
- **Daylight:** Use actual SunCalc output for winter and both sides of the Eastern DST transition. Early starts cannot fish before sunrise; late starts stop 30 minutes before sunset. Time removed by daylight remains visible. An undated plan clearly lacks daylight limits. Forecast copy distinguishes past dates, the five-day window, and seasonal planning beyond it.
- **Storage:** Save a guest plan, reload, and verify it restores. Invalid JSON/shapes and storage quota errors must show a recoverable error, preserve the saved copy, and never claim success. Starting a replacement guest draft requires an explicit action; only Save overwrites it.
- **Accounts:** Sign-in selects only that account's plan, with no implicit guest import. A failed cloud read blocks editing and offers retry. Sign out or switch accounts during a pending read; late data must not appear in the new session. Save failures retain edits. Pending writes disable edits and duplicate saves. In a second signed-in browser, reload to observe a saved plan; concurrent writes use last-write-wins.
- **Firestore rules:** Owners can create/read/replace/delete `users/{uid}/plans/outings`, including undated drafts. Unauthenticated users, other users, and other users with admin claims cannot read or mutate it. Unknown document IDs/fields, missing fields, wrong versions/types, extra outings, unsupported streams/bases, invalid numeric bounds, duplicate fishing dates, and dates outside the trip are denied. Existing favorites permissions still pass. Client calendar validation is stricter than the rules' date-shape checks.
- **Source corrections:** Penns Creek uses USGS 01555000; Little Juniata uses 01558000. Corrected gauges have no inherited unverified flow ranges. Letort's historical station is labeled and never polled for live readings. Yellow Breeches no longer displays the superseded Section 03 designation. Notes make unknown parking capacities/walk times and reach boundaries explicit.
- **Release prerequisite:** Deploy reviewed rules to the explicit Firebase project before shipping account plan saves. Application rollback does not remove saved plans. Verify a real signed-in save/load after deployment; emulator tests alone do not prove production rule activation.

Automated coverage: `outing-plan.test.js`, `plan-storage.test.js`, `trip-planner.test.js`, and added plan cases in `scripts/check-firestore-rules.mjs`. Actual small-screen layout and live account synchronization require the manual checks above.

## 16. Gauge freshness and station identity
- **No stale app cache:** Consecutive river requests receive the latest respective mocked responses. Upstream URL uses OGC v1 with flow/height filters, `cache: no-store`, and an eight-second timeout; the route returns `Cache-Control: no-store`. `checkedAt` is a successful request time, never a substitute for measurement time. Errors return 502 without fabricated data.
- **Independent age:** Exactly one hour remains recent; over one hour is delayed; 24 hours or more is old. Invalid/missing or more than five minutes future times cannot imply current conditions. A fresh height does not freshen historical flow, and delayed height does not hide a recent flow. Zero remains a measurement.
- **Historical display:** Clear Fork's 2020 flow appears as “No recent reading” with the old value in secondary text and the year visible; current height remains usable. Historic 1993 dates include 1993. Old/delayed/invalid flow has no reference comparison. No-value observations say unavailable.
- **Clock and refresh:** Age labels advance every 30 seconds without network responses. Manual refresh disables the button while pending. Focus/visible-tab return refresh polling resources; failed refresh retains measurement and check times. Unmount removes listeners/timers; disabled/historical gauges make no request on mount, focus, retry, or poll.
- **Station identity:** Show official station names for primary and extra gauges. Clark Fork uses 12340500, Blackfoot uses 12340000, neither inherits the previous gauge's range. South Holston has no unrelated gauge, no null-ID API request/link, and links to TVA releases. Au Sable/Letort explain historical status. Additional stations remain selectable even after a load failure; show the selected station's own notes.
- **Browser check:** At desktop and 390px, verify old-flow/current-height, delayed flow, empty station, and manual refresh states fit. Check historical/unconfigured corridors do not request USGS. A real-network Yellow Breeches response should have no app-cache header and an observation time separate from check time; do not assert that USGS always has observations newer than one hour.

Automated coverage: `river-freshness.test.js`, `river-freshness-ui.test.js`, and extensions to `river-api.test.js` / `conditions-ui.test.js`. Fixture browser checks exercise display states; live upstream timestamps are observations, not a deterministic test contract.
