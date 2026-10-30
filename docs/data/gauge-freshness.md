# Gauge freshness audit — October 29, 2026

## Why readings appeared stale

The production audit queried 47 unique configured live stations. It found two independent problems:

1. Next.js `revalidate: 300` could serve an expired cached response while refreshing in the background. Yellow Breeches first returned a 19:45 UTC observation and then 20:45; Penns Creek similarly advanced from 20:00 to 21:00 on the next request. This delayed the first view after idle.
2. USGS itself returned old or absent observations at several stations. Clear Fork flow was dated October 1, 2020; Au Sable at Grayling was dated October 1, 1993. The old display omitted the year and gave the historical value the same prominence as current flow. Some otherwise active stations were 72–102 minutes behind; refreshing cannot make the station transmit.

The route now awaits an uncached USGS v1 request. It filters to discharge (00060) and gauge height (00065), selects each parameter independently, and reports a separate successful check time. The browser polls every five minutes, refreshes on return, and offers manual refresh. Age labels tick locally every 30 seconds. More than one hour is labeled delayed; at 24 hours the value becomes secondary historical context. These are display thresholds, not judgments about safe fishing or official USGS status.

Both v0 and v1 returned matching timestamps in comparison samples. Moving to v1 follows the current API contract; changing the version alone does not solve telemetry delay. The route uses no app cache; USGS infrastructure may still cache its own responses. Traffic from different clients is not coalesced, so usage/rate limits should be revisited before widening access.

## Station corrections and known gaps

| Corridor / station | Finding | Treatment |
| --- | --- | --- |
| Clear Fork at Bellville, 03131982 | Flow record ends in 2020, but current height exists | Continue polling; age flow and height independently |
| Au Sable at Grayling, 04135500 | Available continuous flow ends in 1993 | Historical station notice; stop live polling, retain source link |
| Clark Fork | Previous 06054500 is Missouri River at Toston | Use 12340500, Clark Fork above Missoula; current flow/height verified |
| Blackfoot | Previous 06052500 is Gallatin River at Logan | Use 12340000, Blackfoot River near Bonner; current flow/height verified |
| South Holston | Previous 03497300 is Little River above Townsend | Remove unrelated gauge; no verified live USGS tailwater gauge configured. Link TVA lake/release information and ask reader to select South Holston |
| Boardman, 04127200 | Latest returned flow/height observations April 15, 2026 | Keep configured station, show old observations honestly; permanent closure not inferred |
| Ashtabula 04212500; Mohican at Greer 03136000; Big Darby at Plain City 03230200; Clear Creek at Franklin 03271700 | No latest flow/height features returned in this audit | Show unavailable; do not fabricate readings or silently substitute distant gauges |
| Letort, 01569800 | Already reviewed as historical in the Pennsylvania planning release | Keep historical notice and no live polling |

The corrected Montana gauges do not inherit the old stations' reference ranges. Official names for all retained configured stations are recorded in `src/config/gauges.js`, so users can see exactly where a reading comes from. A station can be on the same river yet far from a fishing access point; this audit does not validate every corridor's geography, every reference range, or future data availability.

## Sources and reproduction

- [USGS v1 release and migration](https://waterdata.usgs.gov/blog/api-v1-release/)
- [Latest continuous collection](https://api.waterdata.usgs.gov/ogcapi/v1/collections/latest-continuous)
- [Monitoring-location metadata](https://api.waterdata.usgs.gov/ogcapi/v1/collections/monitoring-locations)
- [Time-series metadata](https://api.waterdata.usgs.gov/ogcapi/v1/collections/time-series-metadata)
- [USGS instantaneous-value telemetry background](https://waterservices.usgs.gov/docs/instantaneous-values/) — measurement frequency and transmission frequency differ, often 15-minute measurements and hourly transmission.
- [TVA lake levels and releases](https://www.tva.com/environment/lake-levels) — select South Holston; release schedules may change.

Repeat a specific station query with `latest-continuous/items?monitoring_location_id=USGS-03131982&parameter_code=00060,00065&f=json&limit=1000` under the v1 root. Compare `properties.time` for each parameter, not `last_modified` or the HTTP request time. Station-name queries use `monitoring-locations/items?id=USGS-03131982&f=json`; historical coverage comes from `time-series-metadata/items?monitoring_location_id=USGS-03131982&parameter_code=00060,00065&computation_identifier=Instantaneous&f=json`.

This is a dated audit, not a promise that observations will remain available. No replacement is inferred solely from geographic proximity.
