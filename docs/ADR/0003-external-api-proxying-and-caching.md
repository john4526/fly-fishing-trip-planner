# ADR 0003: Server-Side External API Proxying & Error Handling

## Status
Accepted

## Context
The application fetches data from three external APIs: USGS Water Services (streamflow), OpenWeatherMap (forecasts), and Google Places (angler reviews). Calling these endpoints directly from the browser introduces CORS constraints and exposes secret API keys.

## Decision
We implemented Next.js Route Handlers as backend proxy endpoints:
- `/api/river`: Queries USGS Instantaneous Values REST API.
- `/api/weather`: Proxies OpenWeatherMap 5-day / 3-hour forecast API with fallback mock data generation when API keys are absent.
- `/api/reviews`: Proxies Google Places API for venue ratings and angler feedback.
- `/api/stocking`: Reads and parses local CSV stocking records (`stocking_history.csv`).

## Consequences
### Positive
- API keys (`OPENWEATHER_API_KEY`, `GOOGLE_PLACES_API_KEY`) remain strictly server-side.
- Zero browser CORS errors.
- Robust error bubbling allows client components to render standard fallback states with retry options.
