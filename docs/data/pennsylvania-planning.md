# Pennsylvania planning source review

Reviewed 2026-10-29. This is a limited review of the three-stream planner and identified station errors, not verification of all 41 configured corridors. Personal trip dates are entered privately, never seeded in public source.

## Routing estimates

OSRM public table service, driving profile, using OpenStreetMap data. Snapshot inputs in longitude, latitude order: Hershey (-76.6502,40.2859), Lancaster (-76.3055,40.0379), Allenberry area (-77.1250,40.1480), Letort park area (-77.1850,40.2050), Fisherman's Paradise area (-77.7785,40.8712).

| Base → destination | Outbound seconds | Return seconds | One-way allowance, minutes |
| --- | ---: | ---: | ---: |
| Hershey → Yellow Breeches | 2934.5 | 2976.9 | 50 |
| Hershey → Letort | 2987.5 | 3091.8 | 55 |
| Hershey → Spring Creek | 8328.0 | 8440.6 | 145 |
| Lancaster → Yellow Breeches | 4623.6 | 4629.1 | 80 |
| Lancaster → Letort | 4476.2 | 4515.0 | 80 |
| Lancaster → Spring Creek | 10156.2 | 10109.5 | 170 |

Formula: `ceil(max(outbound, return) / 60 / 5) * 5`. The round trip uses twice that allowance. These are area estimates, not exact parking routes. No live traffic, holiday congestion, snow, or closures are included. Directions links let the user check actual lodging and adjust the allowance. A blank override uses the estimate; zero is a valid explicit override. Access buffers are user estimates, not measured walks.

Sources: [OSRM table API](https://project-osrm.org/docs/v5.24.0/api/#table-service), [OpenStreetMap attribution](https://www.openstreetmap.org/copyright). The snapshot adds no runtime routing dependency.

## Access and regulations

- **Yellow Breeches:** [Cumberland Valley visitor bureau](https://www.visitcumberlandvalley.com/blog/post/top-10-fishing-locations/) identifies fishing parking on the left of the entrance at 1559 Boiling Springs Road. Use that source for parking, not its older regulatory summary. [Pennsylvania Bulletin, August 8, 2026, document 26-1136](https://www.pacodeandbulletin.gov/Display/pabull?file=/secure/pabulletin/data/vol56/56-32/1136.html) removed Section 03 from catch-and-release/artificial-lures-only designation. The adjoining unnamed tributary/Run has a separate regulatory process; do not conflate them.
- **Letort:** [PFBC summary book](https://www.pa.gov/content/dam/copapwp-pagov/en/fishandboat/documents/fishing/regulations/summarybook.pdf) defines a 1.71-mile fly-fishing-only catch-and-release reach ending at the railroad bridge at the park's south edge. A park destination alone does not verify lawful entry into that reach. Parking capacity and walk duration are unknown.
- **Spring Creek:** The same PFBC book distinguishes most of the creek's catch-and-release/all-tackle designation from the separate Fisherman's Paradise fly-fishing-only reach. Check marked boundaries and posted wading restrictions. Capacity and walk duration are unknown.

Rules are section-specific and can change. Check [PFBC regulatory changes](https://www.pa.gov/agencies/fishandboat/about-us/meetings/regulatory-changes) and current signs near departure; a summary PDF can lag a published notice. License validity must cover each selected day, including trips crossing a calendar year. The app does not assert that two annual licenses are needed.

## Gauge identity and relevance

| Corridor | Station | Correction / relevance |
| --- | --- | --- |
| Spring Creek | [01546400](https://waterdata.usgs.gov/monitoring-location/USGS-01546400) | Houserville, upstream context for Fisherman's Paradise |
| Penns Creek | [01555000](https://waterdata.usgs.gov/monitoring-location/USGS-01555000) | Replaces Pine Creek station 01548500; downstream context for Coburn |
| Little Juniata | [01558000](https://waterdata.usgs.gov/monitoring-location/USGS-01558000) | Replaces Frankstown Branch station 01556000; Spruce Creek station |
| Yellow Breeches | [01571500](https://waterdata.usgs.gov/monitoring-location/USGS-01571500) | Camp Hill, downstream from Boiling Springs |
| Letort | [01569800](https://waterdata.usgs.gov/monitoring-location/USGS-01569800) | Continuous records end in 2009; historical link, no live polling |

Cross-reference: [USGS Pennsylvania station inventory](https://www.usgs.gov/centers/pennsylvania-water-science-center/updating-pennsylvania-streamgage-datums). Previously configured reference ranges for these five rivers lack station-specific supporting sources and are removed. Gauge readings cannot establish conditions at an access point or safe wading.

## Daylight and remaining gaps

[SunCalc 2.1.1](https://github.com/mourner/suncalc) computes sunrise/sunset at stream coordinates. Input is near local noon; output uses America/New_York, including DST. Reserve 30 minutes before sunset. Terrain, clouds, winter roads, and physical access can reduce usable time further. No date means no daylight constraint; current dashboards are not forecasts for distant trip dates.

Still unverified: exact parking coordinates/capacities and measured walks, legal entry along each full reach, other Pennsylvania access points and flow ranges, and the remainder of the multi-state data set. The new UI names these uncertainties instead of inheriting unsupported capacity counts.
