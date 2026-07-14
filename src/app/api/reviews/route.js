import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const riverId = searchParams.get("riverId"); // Useful for selecting the right mock data

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY is not defined. Returning mock reviews.");
    return NextResponse.json(getMockReviews(riverId || "mad-river"));
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

function getMockReviews(riverId) {
  const mockReviewsData = {
    "mad-river": {
      rating: 4.6,
      userRatingCount: 42,
      reviews: [
        {
          author: "Jake Thompson (DryFlyJake)",
          rating: 5,
          text: "Excellent morning on the Mad. The water was running crystal clear at 80 CFS. Managed to land three beautiful wild browns using a size 18 BWO pattern. Stealth is key here, they spook very easily!",
          time: "3 days ago"
        },
        {
          author: "Sarah Jenkins",
          rating: 4,
          text: "One of the best trout streams in the region. Always cold enough for the fish, even in July. Wading is generally easy but watch out for some of the deeper pools.",
          time: "1 week ago"
        },
        {
          author: "Mike R.",
          rating: 5,
          text: "Caught a gorgeous 16-inch brown trout near the St. Paris Pike access. The hatches were moderate. A fantastic resource for Ohio anglers.",
          time: "2 weeks ago"
        }
      ]
    },
    "clear-fork": {
      rating: 4.4,
      userRatingCount: 29,
      reviews: [
        {
          author: "Brian Miller",
          rating: 4,
          text: "Clear Fork is looking good. Caught a couple of stocked rainbows and one wild brown. Streamflow was perfect around 90 CFS. Be sure to check reservoir releases before going.",
          time: "5 days ago"
        },
        {
          author: "TroutBum99",
          rating: 5,
          text: "Beautiful stretch of water near Bellville. Waded upstream from the bike path and had great luck with rubber-legged nymphs. Very scenic and peaceful.",
          time: "2 weeks ago"
        }
      ]
    },
    "chagrin-river": {
      rating: 4.8,
      userRatingCount: 67,
      reviews: [
        {
          author: "Dave 'Steelie' Kovach",
          rating: 5,
          text: "The fall run is on! Landed a massive 28-inch hen steelhead near Willoughby. River was running around 220 CFS, clear green. Best steelhead river in Ohio by far.",
          time: "Yesterday"
        },
        {
          author: "Emily Watson",
          rating: 5,
          text: "Waded near Daniels Park. Water was cold and clear. Landed two steelies on egg loops. It gets crowded on weekends but it's totally worth it.",
          time: "4 days ago"
        },
        {
          author: "Christopher L.",
          rating: 4,
          text: "Great flow today. A bit off-color but perfect for swinging streamers. Chagrin is always a fun challenge.",
          time: "1 week ago"
        }
      ]
    },
    "little-miami": {
      rating: 4.5,
      userRatingCount: 88,
      reviews: [
        {
          author: "SmallieHunter",
          rating: 5,
          text: "Landed over a dozen smallmouth bass today! Most were on topwater poppers in the slower runs. Little Miami at 180 CFS is perfect for wading. Best bass stream in the state.",
          time: "2 days ago"
        },
        {
          author: "Laura Davis",
          rating: 4,
          text: "Kayaked and fished from Milford down. Beautiful scenery and saw lots of wildlife. Caught several nice smallies and a few green sunfish. Great summer trip.",
          time: "1 week ago"
        }
      ]
    }
  };

  return mockReviewsData[riverId] || mockReviewsData["mad-river"];
}
