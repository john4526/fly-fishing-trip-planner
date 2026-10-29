# Architecture Overview

StreamPlanner uses Next.js 16 App Router and React 19. Server-rendered state and corridor pages read a static seven-state configuration. Client components load public conditions and optionally use Firebase accounts.

## Data flow

```mermaid
flowchart TD
    Browser[Tailnet-connected browser] --> TLS[Tailscale Serve HTTPS]
    TLS --> Next[Loopback Next.js process]
    Next --> Landing
    Config[States and corridors config] --> Landing[Landing page]
    Config --> State[State overview]
    Config --> Corridor[Corridor dashboard]
    Landing --> State --> Corridor
    Landing --> Planner[Two-outing planner /plan]
    State --> Planner
    Planner --> Budget[Travel and daylight calculation]
    Planning[PA source notes and routing snapshot] --> Budget
    SunCalc[Bundled SunCalc] --> Budget
    Planner --> Auth
    Planner <--> Device[Guest plan in localStorage]
    Planner <--> Rules
    Rules <--> Plans[users/uid/plans/outings]
    Corridor --> Resource[Abortable requests and timed refresh]
    Resource --> River[/api/river]
    Resource --> Weather[/api/weather]
    Resource --> Reviews[/api/reviews]
    Resource --> Stocking[/api/stocking]
    River --> USGS[USGS latest continuous observations]
    Weather --> OM[Open-Meteo primary]
    Weather --> NWS[NWS hourly fallback]
    Reviews --> Google[Google Places]
    Stocking --> CSV[Bundled stocking CSV]
    State --> StateMap[Leaflet state-map iframe]
    Corridor --> AccessMap[Leaflet access-map iframe]
    StateMap --> OSM[OpenStreetMap tiles]
    AccessMap --> Tiles[Esri satellite and USGS topo tiles]
    Corridor --> Auth[AuthContext]
    Auth <--> Firebase[Firebase Auth and trusted token claims]
    Auth <--> Rules[Owner-only Firestore rules]
    Rules <--> Favorites[users/uid favorites]
    Auth -. admin claim .-> Kanban[Admin Kanban UI]
    Kanban <--> Local[Browser localStorage]
```

## Components and state

- `/` lists states. `/states/[stateId]` shows a Leaflet geographic map and corridor links; the columns stack on narrow screens. Unknown state and corridor IDs return not found.
- `/states/[stateId]/corridors/[corridorId]` renders `CorridorDetails`, keyed by corridor ID so navigation resets selections. `WeatherPanel` handles optional measurements and destination-local dates.
- `useResource` aborts requests on navigation/unmount and ignores late responses. Recursive timers refresh river data every five minutes and weather every fifteen minutes, with no overlapping polls. A failed refresh preserves the last response and displays an error. Reviews and stocking load once per corridor with retry.
- `src/lib/river.js` owns observation selection, staleness, and reference-range comparison. Additional gauges only receive a comparison badge if they have their own configured range. A reference range is not a safety determination.
- `AuthContext` uses Firebase Auth and atomic Firestore favorite updates. It only changes local favorites after the write succeeds, and discards reads belonging to an old session.
- Admin Kanban changes task status and checklist completion in localStorage. It has no backend administrative API, task creation/deletion UI, or cross-device synchronization. Invalid saved data is reported without overwriting it on load.

## Server routes and external contracts

### Two-outing planning

`/plan` provides exactly two 4–6 hour outings from Hershey or Lancaster. `outing-plan.js` validates the versioned shape, trip window, distinct fishing dates, bounded allowances, and different primary/backup streams. Blank dates are valid drafts. Travel is counted twice; the access buffer is split equally around fishing. SunCalc computes daylight locally for the selected date and stream, formatted in America/New_York; fishing stops 30 minutes before sunset. No routing or daylight API is added.

`pa-planning.js` owns the three-stream shortlist, dated source links, and editable drive estimates from a one-time OSRM/OpenStreetMap snapshot. `/planning-sources` explains the assumptions. The corridor configuration reuses selected access and rule notes, corrects Penns Creek/Little Juniata station IDs, removes unverified reference ranges for the reviewed gauges, and stops live polling of the discontinued Letort station. This is not a full audit of all corridor data; see [source review](docs/data/pennsylvania-planning.md).

`plan-storage.js` explicitly saves guest drafts in `streamplanner:outings:v1:guest`, or a signed-in plan at `users/{uid}/plans/outings`. Account plans are authoritative and never implicitly import a guest draft. The editor remounts on identity changes and discards late loads. Read failures block cloud editing; corrupt device data requires an explicit new draft and is not overwritten until Save. Failed writes retain edits, and pending writes lock controls. Plans are private and are not an offline cloud-sync queue. Same-account concurrent saves use last-write-wins; one browser does not live-update another already-open editor.

The fixed `plans/outings` rules permit owner CRUD with a bounded shape, exactly two outings, allowed bases/streams, numerical bounds, distinct dates, and date-window ordering. Rules enforce date syntax; real calendar dates and the 31-day maximum window are additionally validated by the client on load/save. Other nested paths remain denied. Deploy these rules separately before shipping account plan saves.

### Existing conditions APIs

| Route | Source | Cache / timeout | Behavior |
| --- | --- | --- | --- |
| `/api/river?siteId=…` | USGS OGC `latest-continuous` | 5 minutes / 8 seconds | Numeric 8–15 digit IDs; latest flow and height selected separately by timestamp. Missing values, no-data markers and unsupported units remain unavailable. Returns both measurement times. |
| `/api/weather?lat=…&lon=…` | Open-Meteo, then NWS points and hourly forecast | 15 minutes; NWS points 24 hours / 8 seconds per request | Bounded coordinates, imperial units, epoch timestamps, IANA timezone. Five-day outlook derived from available hourly data, plus a 3-hour series over 120 hours. Missing fields stay null; precipitation probability is distinct from amount. Both providers failing returns 503. |
| `/api/reviews?riverId=…` | Google Places | 24 hours / 8 seconds | Only configured corridors may be searched. The Places key stays server-side. Missing configuration produces an explicit unavailable response with no fabricated reviews. |
| `/api/stocking?riverId=…` | Local CSV | Bundled file | Returns recorded history, not a live stocking feed. Absence of a record implies nothing about wild populations. |

Flow older than one hour is labeled stale; a newer temperature or height reading cannot make it appear fresh. The UI displays each measurement time. Open-Meteo current conditions are model data; NWS fallback values are hourly forecasts. Pressure tendency is only computed when current and earlier pressure values exist. NWS gaps are not inferred from forecast descriptions. All forecast and sun times use the destination timezone, including daylight saving changes.

## Security and configuration

- Without the Firebase API key, auth domain, project ID, and app ID, the site stays browseable and account operations are disabled. There is no local-password or demo-account fallback. Legacy mock-account storage is removed.
- `onIdTokenChanged` supplies the trusted `admin: true` claim. Email addresses and client-written profile fields do not grant roles. The admin page is a client UI gate; any future privileged server operation must independently verify authorization.
- `firestore.rules` restricts user-document reads to the owner and client writes to favorites. Rules must be emulator-tested and explicitly deployed to the intended project before production account use. A Next.js deployment does not deploy Firebase rules.
- Map popups use text nodes. Messages validate origin, source window, type, coordinates, and corridor membership for navigation. The access iframe uses a readiness handshake. Map tiles and county boundaries are fetched directly by the browser, independently of the server API routes. County-boundary failure does not remove corridor paths.
- State tiles use the [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/): attribution, ordinary browser caching, and no offline prefetching. Access maps use attributed Esri and USGS layers. Tile failures show a status message.
- Environment values are documented in [README.md](README.md). `src/config/env.js` parses optional Firebase strings; `src/lib/firebase.js` checks required values before initializing the SDK. Firebase web configuration is public, while the Places key is server-only. Private operational notes and SSH material stay outside public commits.

## Delivery and verification

Local Git branches are reviewed through pull requests. CI uses Node.js 24 and runs npm install from the lockfile, lint, Jest, the Firestore rules emulator suite with Java 21, and a production build without production credentials. The emulator uses a fixed loopback address and a `demo-` project; its test entry point refuses to run without that emulator.

The private server deployment terminates HTTPS at Tailscale Serve and proxies to Next.js on loopback. It does not use Tailscale Funnel. A separate HTTPS port keeps other hosted applications' routes independent. Tailnet access controls determine who can reach the website; Firebase's public cloud endpoints still enforce ID-token authentication and per-user Firestore rules.

Application deployment and Firebase rule deployment are separate steps. Test and deploy rules to the explicit project before enabling accounts. Build a versioned release on the target OS with its public Firebase configuration and a server-only Places key, run it on a temporary loopback port for smoke checks, and switch only the fishing app's process after review. Keep the previous build and process configuration for rollback. Private hostnames, process paths, credentials, and release results belong in local operations notes, outside the public repository.

See [TESTING.md](TESTING.md), [ADR 0001](docs/ADR/0001-nextjs-app-router-architecture.md), [ADR 0002](docs/ADR/0002-firebase-auth-and-firestore-integration.md), and [ADR 0003](docs/ADR/0003-external-api-proxying-and-caching.md).
