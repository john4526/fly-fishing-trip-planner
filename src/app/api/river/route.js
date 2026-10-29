import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId query parameter" }, { status: 400 });
  }

  try {
    const usgsUrl = `https://api.waterdata.usgs.gov/ogcapi/v0/collections/latest-continuous/items?monitoring_location_id=USGS-${siteId}`;
    const response = await fetch(usgsUrl, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error("USGS API failed with status:", response.status, "for siteId:", siteId);
      return NextResponse.json({ error: `USGS API returned status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    
    // We expect a FeatureCollection
    if (!data || !data.features) {
      return NextResponse.json({ error: "Invalid response from USGS API" }, { status: 502 });
    }

    let flow = null;
    let flowUnit = "cfs";
    let height = null;
    let heightUnit = "ft";
    let timestamp = null;
    let latitude = null;
    let longitude = null;

    data.features.forEach((feature) => {
      // Extract coordinates if available
      if (feature.geometry && feature.geometry.type === 'Point' && feature.geometry.coordinates) {
        longitude = feature.geometry.coordinates[0];
        latitude = feature.geometry.coordinates[1];
      }

      const props = feature.properties;
      if (!props) return;

      // Capture timestamp (use the most recent if multiple)
      if (props.time) {
        const itemTime = new Date(props.time);
        if (!timestamp || itemTime > new Date(timestamp)) {
          timestamp = props.time;
        }
      }

      if (props.parameter_code === "00060") {
        flow = parseFloat(props.value);
        flowUnit = props.unit_of_measure || "cfs";
      } else if (props.parameter_code === "00065") {
        height = parseFloat(props.value);
        heightUnit = props.unit_of_measure || "ft";
      }
    });

    return NextResponse.json({
      siteId,
      flow,
      flowUnit,
      height,
      heightUnit,
      timestamp,
      latitude,
      longitude
    });

  } catch (error) {
    console.error("Error in USGS API proxy:", error);
    return NextResponse.json({ error: "Internal Server Error fetching river data" }, { status: 500 });
  }
}
