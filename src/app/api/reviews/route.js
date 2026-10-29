import { NextResponse } from "next/server";
import { STATES } from "@/config/rivers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const riverId = searchParams.get("riverId");
  const corridor = Object.values(STATES).flatMap(state => state.corridors).find(item => item.id === riverId);
  const query = corridor?.googlePlaceQuery;

  if (!query) {
    return NextResponse.json({ error: "Unknown riverId" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ available: false, rating: null, userRatingCount: 0, reviews: [],
      message: "Google reviews are currently unavailable." });
  }

  try {
    const url = "https://places.googleapis.com/v1/places:searchText";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.reviews,places.userRatingCount"
      },
      body: JSON.stringify({ textQuery: query }),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 } // Cache for 24 hours (reviews change slowly)
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Google Places API returned status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const place = data.places?.[0];

    if (!place) {
      return NextResponse.json({ rating: null, userRatingCount: 0, reviews: [] });
    }

    return NextResponse.json({
      available: true,
      source: "Google Places",
      rating: place.rating || null,
      userRatingCount: place.userRatingCount || 0,
      reviews: place.reviews?.map(r => ({
        author: r.authorAttribution?.displayName || "Anonymous Angler",
        rating: r.rating,
        text: r.text?.text || r.originalText?.text || "",
        time: r.publishTime ? new Date(r.publishTime).toLocaleDateString() : "Recently"
      })) || []
    });

  } catch (error) {
    console.error("Error in Google Places API proxy:", error);
    return NextResponse.json({ error: "Internal Server Error fetching reviews" }, { status: 500 });
  }
}
