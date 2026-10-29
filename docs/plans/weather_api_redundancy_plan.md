# Weather Provider Redundancy

Implemented by `src/app/api/weather/route.js`, `src/lib/weather.js`, and `WeatherPanel.js`.

1. Validate coordinates and try Open-Meteo, with an eight-second timeout.
2. On transport, HTTP, or normalization failure, request NWS point metadata and its hourly forecast. Both calls have eight-second timeouts. The returned forecast URL must belong to `https://api.weather.gov`.
3. If neither provider supplies a usable forecast, return 503. The interface offers retry and retains any previous forecast with an error message.

Optional measurements remain unavailable when the provider does not supply them. In particular, the NWS hourly forecast does not supply the same measurements as Open-Meteo; normalization must not invent them. Provider names and destination-local times remain visible.

`weather-api.test.js` covers primary success, fallback, malformed responses, coordinate validation, five-day coverage, DST, and unit semantics. `conditions-ui.test.js` covers missing values, local-time formatting, cancellation, polling, and failed refreshes. Production usage must follow provider terms and capacity limits; no availability guarantee is implied.
