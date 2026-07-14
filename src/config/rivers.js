export const RIVERS = [
  {
    id: "mad-river",
    name: "Mad River (Urbana)",
    gaugeId: "03267000",
    latitude: 40.1062,
    longitude: -83.7974,
    flowRange: { min: 50, max: 150 },
    species: ["Brown Trout", "Brook Trout"],
    description: "Ohio's premier spring-fed trout stream. Cold water all year allows year-round fly fishing, though trout are most active in fall, winter, and spring. Extremely clear water requires a stealthy approach.",
    googlePlaceQuery: "Mad River Urbana Ohio fly fishing access",
    accessPoints: [
      {
        id: "pimtown-road",
        name: "Pimtown Road Access",
        latitude: 40.1425,
        longitude: -83.7842,
        type: "access",
        parkingCapacity: "10 cars (Gravel)",
        regulations: "Catch & Release only. Artificial lures/flies only.",
        notes: "Easy bank access. A popular wading pool starts 100 yards downstream. Excellent gravel runs."
      },
      {
        id: "st-paris-pike",
        name: "St. Paris Pike Bridge",
        latitude: 40.1062,
        longitude: -83.7974,
        type: "parking",
        parkingCapacity: "8 cars (Dirt roadside)",
        regulations: "Artificial lures/flies only. Wading only.",
        notes: "Direct access under the bridge. A long deep pool directly under the bridge holds nice trout."
      },
      {
        id: "west-liberty",
        name: "West Liberty Lion's Park",
        latitude: 40.2483,
        longitude: -83.7589,
        type: "access",
        parkingCapacity: "30 cars (Paved)",
        regulations: "Standard Ohio Trout limits apply.",
        notes: "Great family spot. Stocked heavily in the spring. Shallow water, good wading."
      }
    ]
  },
  {
    id: "clear-fork",
    name: "Clear Fork Mohican River",
    gaugeId: "03131982",
    latitude: 40.6214,
    longitude: -82.5127,
    flowRange: { min: 75, max: 175 },
    species: ["Brown Trout", "Rainbow Trout"],
    description: "A partially regulated brown trout fishery downstream of the Clear Fork Reservoir. Watch out for sudden reservoir releases. Offers excellent early-season hatches.",
    googlePlaceQuery: "Clear Fork Mohican River Bellville Ohio fly fishing",
    accessPoints: [
      {
        id: "bellville-bike-path",
        name: "Bellville Bike Path Access",
        latitude: 40.6214,
        longitude: -82.5127,
        type: "access",
        parkingCapacity: "15 cars (Paved)",
        regulations: "Catch & Release starts 1/2 mile downstream.",
        notes: "Easy wader entry. Runs alongside the bike path. Perfect for dry fly fishing."
      },
      {
        id: "gatton-rocks",
        name: "Gatton Rocks Bridge Access",
        latitude: 40.6133,
        longitude: -82.4735,
        type: "parking",
        parkingCapacity: "6 cars (Gravel turnout)",
        regulations: "Catch & Release only. Artificial lures/flies only.",
        notes: "Scenic limestone cliffs. Deep pool under the rocks. High wader caution during release periods."
      }
    ]
  },
  {
    id: "chagrin-river",
    name: "Chagrin River (Willoughby)",
    gaugeId: "04209000",
    latitude: 41.6425,
    longitude: -81.4068,
    flowRange: { min: 150, max: 350 },
    species: ["Steelhead Trout"],
    description: "Located in northern Ohio's 'Steelhead Alley'. Famous for massive runs of lake-run rainbow trout (steelhead) from late October through April. Can get blown out quickly but clears in 2-3 days.",
    googlePlaceQuery: "Chagrin River Willoughby Ohio fishing access",
    accessPoints: [
      {
        id: "daniels-park",
        name: "Daniels Park Access (Willoughby)",
        latitude: 41.6425,
        longitude: -81.4068,
        type: "access",
        parkingCapacity: "50 cars (Paved)",
        regulations: "Standard Ohio steelhead regulations.",
        notes: "Major staging pool for steelhead. Very popular access point, gets crowded on weekends."
      },
      {
        id: "rogers-road",
        name: "Rogers Road Metro Park",
        latitude: 41.6152,
        longitude: -81.4211,
        type: "access",
        parkingCapacity: "20 cars (Gravel)",
        regulations: "Standard bag limits. Cleveland MetroParks rules apply.",
        notes: "High shale banks, beautiful scenery. Steeper path down to the water, but less crowded."
      }
    ]
  },
  {
    id: "little-miami",
    name: "Little Miami River (Milford)",
    gaugeId: "03245500",
    latitude: 39.1748,
    longitude: -84.2961,
    flowRange: { min: 100, max: 300 },
    species: ["Smallmouth Bass", "Panfish"],
    description: "A designated National Wild and Scenic River. Offers outstanding warmwater fly fishing for smallmouth bass and panfish from May through September. Wading can be tricky during high flows.",
    googlePlaceQuery: "Little Miami River Milford Ohio access",
    accessPoints: [
      {
        id: "milford-trailhead",
        name: "Milford Trailhead Parking",
        latitude: 39.1748,
        longitude: -84.2961,
        type: "parking",
        parkingCapacity: "40 cars (Paved)",
        regulations: "Standard warmwater regulations. Canoe/Kayak launch.",
        notes: "Popular launch point. Wide gravel bars. Excellent smallmouth wading upstream."
      },
      {
        id: "terrell-park",
        name: "Jim Terrell Park Access",
        latitude: 39.1685,
        longitude: -84.2895,
        type: "access",
        parkingCapacity: "15 cars (Dirt lot)",
        regulations: "Standard bag limits. Hand-launch only.",
        notes: "Provides access to shallow riffles. Great place to swing wooly buggers for smallies."
      }
    ]
  }
];
