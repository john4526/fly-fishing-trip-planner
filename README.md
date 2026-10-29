# Fly Fishing Trip Planner

A Next.js 16 / React 19 application for browsing fishing corridors, USGS gauge readings, forecasts, access maps, and saved favorites. Seven states and 41 corridors are configured in `src/config/rivers.js`. Access descriptions, regulations, stocking records, and flow reference ranges are curated data, not live verification of access rights or safe conditions.

## Run locally

Use Node.js 20.9 or later and npm with the committed lockfile:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To check a production build:

```sh
npm run lint
npm test -- --runInBand
npm run build
npm start
```

## Optional services

Create an untracked `.env.local` for your own project. Never commit service-account credentials, private keys, or server access notes.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web configuration |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web application |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Optional web configuration |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Optional web configuration |
| `GOOGLE_PLACES_API_KEY` | Server-only Places API key for reviews |

Without the four required Firebase values, accounts and favorites are disabled; browsing still works. There is no mock-account fallback. Configure Email/Password authentication and authorized domains in your Firebase project. Validate and deploy `firestore.rules` to that project before enabling production accounts; deploying Next.js does not deploy Firebase rules. Privileged admin UI access requires an `admin: true` custom claim provisioned using trusted Firebase administration. The Kanban board stores tasks only in the current browser.

`NEXT_PUBLIC_` values are embedded at build time and are public web configuration. Access control comes from Firebase authentication and Firestore rules. Keep the Google Places key server-only. Without it, the application explicitly reports that reviews are unavailable.

## Data and maps

- USGS flow and height are selected independently by measurement time; stale flow readings are labeled after one hour. Browser refresh: five minutes.
- Open-Meteo supplies modeled current conditions and forecasts. NWS hourly forecasts are the fallback. Missing measurements stay unavailable. Forecast timestamps use the destination timezone, including DST; the five-day outlook summarizes available hourly data, so today can be partial. Browser refresh: fifteen minutes.
- Stocking records come from the bundled CSV, not a live agency feed.
- Leaflet maps use OpenStreetMap state tiles and Esri/USGS access-map layers. They require network access. Map geometry is approximate; the corridor list remains usable if map tiles fail.

## Development and review

Work locally on `codex/` branches and open focused pull requests. Run lint, tests, and build before requesting review. Server deployment and Firebase rule deployment are separate operational steps.

See [ARCHITECTURE.md](ARCHITECTURE.md) for data boundaries and [TESTING.md](TESTING.md) for regression conditions and manual checks. API tests run in Node; component tests use jsdom. Tests mock external services and do not require production credentials.
