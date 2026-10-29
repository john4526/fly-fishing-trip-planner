# Redundant Weather API Architecture

This plan outlines the removal of mock weather data in favor of a robust, redundant API architecture. If our primary weather provider fails (or we hit a rate limit), the backend will automatically "waterfall" down to a secondary provider to ensure the dashboard always has live data.

## Open Questions

> [!NOTE]
> All Open Questions have been resolved! We are moving forward with Open-Meteo as the primary and NWS as the fallback. Both are 100% free and require zero API keys.

## Weather API Selection

1. **Primary: Open-Meteo**
   - **Why Primary?**: Open-Meteo is incredibly fast, offers a massive global edge cache, and returns data in a very developer-friendly JSON format in a single request. It is perfect for fast dashboard loading.
2. **Secondary (Fallback): National Weather Service (NWS) API**
   - **Why Secondary?**: The NWS API is the ultimate source of truth for US weather and is highly reliable. However, it requires a two-step API call (fetching a "grid point" first based on lat/lon, then fetching the forecast), making it slightly slower than Open-Meteo. It serves as the perfect bulletproof fallback.

## Expanded Data Requirements (Fishing Specific)

Since this app is tailored for fly fishing, we will pull more than just temperature and conditions. The normalizer functions will ensure both APIs return the following expanded dataset:

1. **Barometric Pressure**: Crucial for fishing. We will track current pressure (hPa or inHg) and ideally the *pressure tendency* (rising, falling, or steady), as falling pressure often triggers feeding.
2. **Cloud Cover (%)**: Overcast days are often significantly better for fly fishing than bright bluebird skies.
3. **Wind Gusts**: Standard wind speed is helpful, but knowing the max gusts is critical for casting a fly rod safely.
4. **Precipitation Amount**: Knowing exactly how much rain fell or will fall helps predict river blowouts (muddy/unfishable water).
5. **Sunrise / Sunset Times**: Dawn and dusk are prime feeding times; we will pull these to highlight the "golden hours" on the dashboard.

## Proposed Changes

### 1. The "Waterfall" Strategy
We will rewrite `src/app/api/weather/route.js` to use a try/catch waterfall approach:
1. **Attempt 1 (Open-Meteo)**: Fetch current weather and forecast from Open-Meteo's `/v1/forecast` endpoint.
2. **Attempt 2 (NWS API)**: If Open-Meteo fails or times out, immediately fall back to the NWS API. We will fetch the gridpoint using `/points/{lat},{lon}`, and then fetch the forecast data.
3. **Failure**: If both providers are down (extremely unlikely), return a 503 Service Unavailable error to the frontend instead of mock data.

### 2. Data Normalization
Because Open-Meteo and NWS return data in completely different shapes, we will write two normalizer functions (`normalizeOpenMeteoData` and `normalizeNwsData`). This ensures that regardless of which API successfully returns the data, the frontend Dashboard always receives the exact same JSON structure it expects (temps, humidity, wind, description, etc.).

### 3. Frontend Updates
- **[MODIFY]** `src/app/components/Dashboard.js` and `src/app/components/CorridorDetails.js`: Update the weather widgets to gracefully handle a 503 error state. If weather data fails to load, the widget will show a subtle "Weather data temporarily unavailable" message instead of breaking the entire page or showing mock data.

## Verification Plan
1. **Test Primary**: Verify the dashboard correctly loads real weather data from Open-Meteo.
2. **Test Fallback**: Temporarily break the Open-Meteo URL to force a failure, and verify the NWS API successfully catches the request and populates the dashboard without the user noticing.
3. **Test Total Failure**: Temporarily break both URLs and verify the frontend correctly handles the "Complete Failure" state without crashing.
