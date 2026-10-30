# ADR 0003: Server-Side External API Proxying & Error Handling

## Status
Accepted; updated 2026-10-29 to reflect the implemented providers.

## Decision
Next.js Route Handlers proxy USGS latest-continuous observations, Open-Meteo weather with an NWS hourly fallback, and Google Places reviews. Stocking history comes from a bundled CSV. Public IDs and coordinates are validated before external requests, and requests have bounded timeouts. Google search queries come from configured corridor IDs; its key remains server-only.

Missing measurements remain null. Forecast rain probability is not a precipitation amount, and missing NWS gusts, pressure, humidity, cloud cover and sunrise/sunset are not fabricated. Epoch timestamps are formatted in the destination's IANA timezone. The five-day outlook summarizes available hourly periods; today may be partial. Three-hour samples cover up to 120 hours. A total weather failure returns 503 and a USGS failure returns 502.

USGS readings are selected by parameter and measurement time, not response order. Missing or unrecognized values are unavailable. A newer unrelated parameter cannot refresh the flow timestamp.

## Consequences
- River requests await USGS v1 with `cache: no-store` and return `Cache-Control: no-store`. The former five-minute revalidation policy could return an expired reading first after idle. The browser still polls every five minutes; multiple clients are not coalesced. Weather is cached fifteen minutes, NWS grid metadata one day, and Places reviews one day.
- Browser polling and tab-return refresh update river and weather data while canceling obsolete requests. River has a manual refresh. Failed refreshes keep previous values and original timestamps with an explicit error. Successful `checkedAt` never replaces either measurement timestamp. Local age labels continue updating between requests.
- The browser still loads map tiles and boundaries directly. Proxying conditions does not make maps available offline.
- Provider availability, rate limits, and usage terms remain operational constraints. No fabricated fallback data is returned.

Contracts: [USGS](https://api.waterdata.usgs.gov/ogcapi/v1/collections/latest-continuous), [Open-Meteo](https://open-meteo.com/en/docs), [NWS](https://www.weather.gov/documentation/services-web-api).
