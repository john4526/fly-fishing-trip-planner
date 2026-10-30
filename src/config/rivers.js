import { PLANNING_STREAMS } from './pa-planning';

export const STATES = {
  ohio: {
    id: "ohio",
    name: "Ohio",
    abbr: "OH",
    description: "Diverse warmwater and coldwater streams, from spring-fed trout waters to northern Steelhead corridors.",
    corridors: [
      {
        id: "mad-river",
        name: "Mad River",
        location: "Urbana",
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
        location: "Bellville",
        gaugeId: "03131982",
        gaugeNote: "Bellville reports gauge height, but its available continuous streamflow record ends in 2020. Height and flow have separate observation times.",
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
        name: "Chagrin River",
        location: "Willoughby",
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
        name: "Little Miami River",
        location: "Milford",
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
      },
      {
        id: "conneaut-creek",
        name: "Conneaut Creek",
        location: "Conneaut",
        gaugeId: "04213000",
        latitude: 41.9333,
        longitude: -80.5667,
        flowRange: { min: 100, max: 400 },
        species: ["Steelhead"],
        description: "A premier steelhead tributary in 'Steelhead Alley', offering excellent runs of Lake Erie steelhead from fall through spring.",
        googlePlaceQuery: "Conneaut Creek Ohio fly fishing access",
        accessPoints: [
          {
            id: "woodworth-road",
            name: "Woodworth Road Access",
            latitude: 41.9250,
            longitude: -80.5500,
            type: "access",
            parkingCapacity: "10 cars",
            regulations: "Standard Ohio steelhead regulations apply.",
            notes: "Popular wading area with deep runs holding resting steelhead."
          }
        ]
      },
      {
        id: "rocky-river",
        name: "Rocky River",
        location: "Cleveland",
        gaugeId: "04201500",
        latitude: 41.4833,
        longitude: -81.8333,
        flowRange: { min: 80, max: 350 },
        species: ["Steelhead"],
        description: "Urban steelhead fishing at its finest. Running through the Cleveland Metroparks, this river offers easy access and great fish.",
        googlePlaceQuery: "Rocky River Nature Center fly fishing",
        accessPoints: [
          {
            id: "nature-center",
            name: "Rocky River Nature Center",
            latitude: 41.4111,
            longitude: -81.8841,
            type: "access",
            parkingCapacity: "Large paved lot",
            regulations: "Cleveland Metroparks regulations apply.",
            notes: "Very accessible, can get crowded during peak runs. Excellent shale bottom runs."
          }
        ]
      },
      {
        id: "vermilion-river",
        name: "Vermilion River",
        location: "Vermilion",
        gaugeId: "04199500",
        latitude: 41.4000,
        longitude: -82.3500,
        flowRange: { min: 100, max: 400 },
        species: ["Steelhead"],
        description: "Known for its beautiful shale cliffs and excellent steelhead fishing.",
        googlePlaceQuery: "Vermilion River Ohio fly fishing access",
        accessPoints: [
          {
            id: "mill-hollow",
            name: "Mill Hollow Bacon Woods Park",
            latitude: 41.3800,
            longitude: -82.3400,
            type: "access",
            parkingCapacity: "Large paved lot",
            regulations: "Standard Ohio steelhead regulations.",
            notes: "Excellent access through the Lorain County Metro Parks."
          }
        ]
      },
      {
        id: "grand-river",
        name: "Grand River",
        location: "Painesville",
        gaugeId: "04212100",
        latitude: 41.7300,
        longitude: -81.2500,
        flowRange: { min: 200, max: 800 },
        species: ["Steelhead"],
        description: "A wide, powerful river that receives large runs of steelhead. Often muddy after rain but clears beautifully.",
        googlePlaceQuery: "Grand River Ohio fly fishing access",
        accessPoints: [
          {
            id: "hidden-valley",
            name: "Hidden Valley Park",
            latitude: 41.7100,
            longitude: -81.1800,
            type: "access",
            parkingCapacity: "30 cars",
            regulations: "Standard Ohio steelhead regulations.",
            notes: "Classic long runs and sweeping bends."
          }
        ]
      },
      {
        id: "ashtabula-river",
        name: "Ashtabula River",
        location: "Ashtabula",
        gaugeId: "04212500",
        latitude: 41.8700,
        longitude: -80.7800,
        flowRange: { min: 150, max: 500 },
        species: ["Steelhead"],
        description: "Rugged and scenic gorge fishing for Lake Erie steelhead.",
        googlePlaceQuery: "Ashtabula River fly fishing access",
        accessPoints: [
          {
            id: "indian-trails",
            name: "Indian Trails Park",
            latitude: 41.8500,
            longitude: -80.7800,
            type: "access",
            parkingCapacity: "20 cars",
            regulations: "Standard Ohio steelhead regulations.",
            notes: "Excellent access but involves some hiking."
          }
        ]
      },
      {
        id: "mohican-river",
        name: "Mohican River (Clear Fork)",
        location: "Loudonville",
        gaugeId: "03136000",
        latitude: 40.6300,
        longitude: -82.2300,
        flowRange: { min: 100, max: 400 },
        species: ["Brown Trout"],
        description: "The Mohican State Park area offers excellent trout fishing in a gorgeous forested setting.",
        googlePlaceQuery: "Mohican State Park fly fishing",
        accessPoints: [
          {
            id: "mohican-state-park",
            name: "Mohican State Park",
            latitude: 40.6100,
            longitude: -82.2500,
            type: "access",
            parkingCapacity: "50+ cars",
            regulations: "Check local state park regulations.",
            notes: "Heavily stocked with brown trout."
          }
        ]
      },
      {
        id: "scioto-river",
        name: "Scioto River",
        location: "Columbus",
        gaugeId: "03227500",
        additionalGauges: [
          { id: "03231500", name: "Scioto River at Chillicothe" },
          { id: "03221000", name: "Below O'Shaughnessy Dam nr Dublin" }
        ],
        latitude: 39.9600,
        longitude: -83.0000,
        flowRange: { min: 200, max: 1500 },
        species: ["Smallmouth Bass", "Carp"],
        description: "A major waterway running through central Ohio, known for excellent smallmouth bass and carp on the fly.",
        googlePlaceQuery: "Scioto River Columbus fly fishing",
        accessPoints: [
          {
            id: "scioto-audubon",
            name: "Scioto Audubon Metro Park",
            latitude: 39.9400,
            longitude: -83.0100,
            type: "access",
            parkingCapacity: "Large lots",
            regulations: "Standard OH regulations.",
            notes: "Great access near downtown Columbus."
          },
          {
            id: "griggs-dam",
            name: "Griggs Reservoir Park",
            latitude: 40.0100,
            longitude: -83.0900,
            type: "access",
            parkingCapacity: "Large lots",
            regulations: "Standard OH regulations.",
            notes: "Access above and below the dam."
          }
        ]
      },
      {
        id: "clear-creek",
        name: "Clear Creek",
        location: "Rockbridge",
        gaugeId: "03157000",
        additionalGauges: [
          { id: "03271700", name: "Clear Creek at Franklin" }
        ],
        latitude: 39.5800,
        longitude: -82.6000,
        flowRange: { min: 20, max: 150 },
        species: ["Brown Trout"],
        description: "One of Ohio's few stocked trout streams in a beautiful, rugged metro park setting.",
        googlePlaceQuery: "Clear Creek Metro Park fishing",
        accessPoints: [
          {
            id: "clear-creek-metro",
            name: "Clear Creek Metro Park",
            latitude: 39.5900,
            longitude: -82.5900,
            type: "access",
            parkingCapacity: "Several small lots",
            regulations: "Check local metro park rules.",
            notes: "Heavily wooded, technical casting."
          },
          {
            id: "mathias-log-cabin",
            name: "Mathias Log Cabin Access",
            latitude: 39.5700,
            longitude: -82.6100,
            type: "access",
            parkingCapacity: "10 cars",
            regulations: "Check local metro park rules.",
            notes: "Good starting point for hiking upstream."
          }
        ]
      },
      {
        id: "tuscarawas-river",
        name: "Tuscarawas River",
        location: "Massillon",
        gaugeId: "03117000",
        additionalGauges: [
          { id: "03124800", name: "Tuscarawas River at New Philadelphia" },
          { id: "03116000", name: "Tuscarawas River at Clinton" }
        ],
        latitude: 40.8000,
        longitude: -81.5200,
        flowRange: { min: 300, max: 1200 },
        species: ["Smallmouth Bass", "Pike"],
        description: "A wide, recovering river offering surprisingly good smallmouth bass and northern pike action.",
        googlePlaceQuery: "Tuscarawas River Massillon fishing",
        accessPoints: [
          {
            id: "ernies-bicycle",
            name: "Towpath Trail Access (Ernie's)",
            latitude: 40.7800,
            longitude: -81.5300,
            type: "access",
            parkingCapacity: "30 cars",
            regulations: "Standard OH regulations.",
            notes: "Access via the Ohio & Erie Canal Towpath."
          },
          {
            id: "craig-pittman",
            name: "Craig Pittman Memorial Park",
            latitude: 40.7500,
            longitude: -81.5200,
            type: "access",
            parkingCapacity: "20 cars",
            regulations: "Standard OH regulations.",
            notes: "Good wading when water is low."
          }
        ]
      },
      {
        id: "big-darby-creek",
        name: "Big Darby Creek",
        location: "Darbyville",
        gaugeId: "03230500",
        additionalGauges: [
          { id: "03230200", name: "Big Darby Creek at Plain City" }
        ],
        latitude: 39.7500,
        longitude: -83.1800,
        flowRange: { min: 100, max: 500 },
        species: ["Smallmouth Bass"],
        description: "A National Scenic River known for exceptional water quality and great smallmouth bass fishing.",
        googlePlaceQuery: "Big Darby Creek Battelle Darby Creek Metro Park",
        accessPoints: [
          {
            id: "battelle-darby",
            name: "Battelle Darby Creek Metro Park",
            latitude: 39.8800,
            longitude: -83.2200,
            type: "access",
            parkingCapacity: "Large lots",
            regulations: "Standard OH regulations.",
            notes: "Extensive access through the metro park system."
          },
          {
            id: "prairie-oaks",
            name: "Prairie Oaks Metro Park",
            latitude: 40.0100,
            longitude: -83.2500,
            type: "access",
            parkingCapacity: "Large lots",
            regulations: "Standard OH regulations.",
            notes: "Good wading spots and canoe launches."
          }
        ]
      },
      {
        id: "olentangy-river",
        name: "Olentangy River",
        location: "Delaware",
        gaugeId: "03225500",
        additionalGauges: [
          { id: "03226800", name: "Olentangy River near Worthington" }
        ],
        latitude: 40.3000,
        longitude: -83.0600,
        flowRange: { min: 150, max: 600 },
        species: ["Smallmouth Bass"],
        description: "Flowing through Columbus and the OSU campus, a popular urban fishery for smallmouth.",
        googlePlaceQuery: "Olentangy River fishing access",
        accessPoints: [
          {
            id: "highbanks",
            name: "Highbanks Metro Park",
            latitude: 40.1400,
            longitude: -83.0300,
            type: "access",
            parkingCapacity: "Large lots",
            regulations: "Standard OH regulations.",
            notes: "Scenic shale bluffs and good wading."
          },
          {
            id: "whetstone",
            name: "Whetstone Park",
            latitude: 40.0300,
            longitude: -83.0200,
            type: "access",
            parkingCapacity: "Large lots",
            regulations: "Standard OH regulations.",
            notes: "Urban fishing access via the Olentangy Trail."
          }
        ]
      }
    ]
  },
  michigan: {
    id: "michigan",
    name: "Michigan",
    abbr: "MI",
    description: "Classic spring-fed sand-bottom rivers with rich history and pristine trout fisheries.",
    corridors: [
      {
        id: "au-sable",
        name: "Au Sable River",
        location: "Grayling",
        gaugeId: "04135500",
        gaugeHistorical: true,
        gaugeNote: "Historical Grayling station: its continuous streamflow record ends in 1993. No verified current gauge is configured for this reach.",
        latitude: 44.6614,
        longitude: -84.7147,
        flowRange: { min: 200, max: 500 },
        species: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
        description: "The legendary birthplace of Trout Unlimited. The Holy Waters stretch is a flies-only, catch-and-release paradise with incredibly stable flows and excellent hatches of Hex and Mayflies in June.",
        googlePlaceQuery: "Au Sable River Grayling MI fly fishing access",
        accessPoints: [
          {
            id: "grayling-city-park",
            name: "Grayling City Park Access",
            latitude: 44.6614,
            longitude: -84.7147,
            type: "access",
            parkingCapacity: "40 cars (Paved)",
            regulations: "Standard MI trout regulations.",
            notes: "Great place to start, shallow wader entry. Family friendly."
          },
          {
            id: "stephan-bridge",
            name: "Stephan Bridge Access",
            latitude: 44.6852,
            longitude: -84.5912,
            type: "access",
            parkingCapacity: "25 cars (Gravel)",
            regulations: "Flies-only. Catch & Release.",
            notes: "Beginning of the famous 'Holy Waters' stretch. Flat sand and gravel wading."
          }
        ]
      },
      {
        id: "manistee-river",
        name: "Manistee River",
        location: "CCC Bridge",
        gaugeId: "04123500",
        latitude: 44.5218,
        longitude: -84.9542,
        flowRange: { min: 200, max: 500 },
        species: ["Brown Trout", "Brook Trout"],
        description: "A beautiful, sandy coldwater river winding through state forest lands. The upper Manistee offers outstanding wading and quiet dry fly fishing for brook and brown trout. Stable spring flows.",
        googlePlaceQuery: "Manistee River CCC Bridge MI fly fishing access",
        accessPoints: [
          {
            id: "ccc-bridge",
            name: "CCC Bridge Campground",
            latitude: 44.5218,
            longitude: -84.9542,
            type: "access",
            parkingCapacity: "30 cars (Gravel lot)",
            regulations: "Standard MI trout rules. Hand-launch canoe.",
            notes: "Popular campground and canoe launch. Excellent wading flats downstream."
          },
          {
            id: "yellow-trees",
            name: "Yellow Trees Landing Access",
            latitude: 44.6415,
            longitude: -84.8115,
            type: "parking",
            parkingCapacity: "10 cars (Dirt lot)",
            regulations: "Standard MI trout regulations.",
            notes: "Remote access point, low pressure. Deep sweep bends hold nice brown trout."
          }
        ]
      },
      {
        id: "pere-marquette",
        name: "Pere Marquette River",
        location: "Baldwin",
        gaugeId: "04122500",
        latitude: 43.9000,
        longitude: -85.8500,
        flowRange: { min: 400, max: 800 },
        species: ["Brown Trout", "Steelhead", "Salmon"],
        description: "A legendary National Scenic River known for its resident brown trout, steelhead runs, and historic 'Flies Only' section.",
        googlePlaceQuery: "Pere Marquette Flies Only fly fishing access",
        accessPoints: [
          {
            id: "m-37-bridge",
            name: "M-37 Bridge Access",
            latitude: 43.8900,
            longitude: -85.8450,
            type: "access",
            parkingCapacity: "20 cars (Paved)",
            regulations: "Flies Only, Catch and Release.",
            notes: "The classic start to the 'Flies Only' water. High quality trout habitat."
          }
        ]
      },
      {
        id: "boardman-river",
        name: "Boardman River",
        location: "Traverse City",
        gaugeId: "04127200",
        latitude: 44.7500,
        longitude: -85.6000,
        flowRange: { min: 150, max: 300 },
        species: ["Brook Trout", "Brown Trout"],
        description: "A fast-flowing, clear river near Traverse City that is actively recovering from dam removals, revealing excellent new trout water.",
        googlePlaceQuery: "Boardman River Traverse City fly fishing access",
        accessPoints: [
          {
            id: "brown-bridge",
            name: "Brown Bridge Quiet Area",
            latitude: 44.6650,
            longitude: -85.5350,
            type: "access",
            parkingCapacity: "15 cars (Dirt)",
            regulations: "Standard MI trout regulations.",
            notes: "Former impoundment now flowing freely. Great dry fly water."
          }
        ]
      },
      {
        id: "muskegon-river",
        name: "Muskegon River",
        location: "Newaygo",
        gaugeId: "04121970",
        latitude: 43.4200,
        longitude: -85.8000,
        flowRange: { min: 1200, max: 2500 },
        species: ["Steelhead", "Brown Trout"],
        description: "A large tailwater fishery famous for its massive spring steelhead run and excellent trout fishing.",
        googlePlaceQuery: "Muskegon River Newaygo fly fishing",
        accessPoints: [
          {
            id: "croton-dam",
            name: "Croton Dam Access",
            latitude: 43.4350,
            longitude: -85.6600,
            type: "access",
            parkingCapacity: "Large lot",
            regulations: "Standard MI regulations.",
            notes: "Prime water just below the dam."
          }
        ]
      },
      {
        id: "white-river",
        name: "White River",
        location: "Whitehall",
        gaugeId: "04122200",
        latitude: 43.4000,
        longitude: -86.3000,
        flowRange: { min: 300, max: 700 },
        species: ["Steelhead", "Brown Trout"],
        description: "A beautiful, lesser-known river with strong runs of steelhead and resident trout.",
        googlePlaceQuery: "White River MI fly fishing access",
        accessPoints: [
          {
            id: "hesperia-dam",
            name: "Hesperia Dam",
            latitude: 43.5400,
            longitude: -86.0400,
            type: "access",
            parkingCapacity: "20 cars",
            regulations: "Standard MI regulations.",
            notes: "Popular fishing spot during runs."
          }
        ]
      },
      {
        id: "huron-river",
        name: "Huron River",
        location: "Ann Arbor",
        gaugeId: "04174500",
        latitude: 42.2800,
        longitude: -83.7400,
        flowRange: { min: 200, max: 600 },
        species: ["Smallmouth Bass"],
        description: "A fantastic warmwater fishery right in Ann Arbor, famous for smallmouth bass.",
        googlePlaceQuery: "Huron River Ann Arbor fly fishing",
        accessPoints: [
          {
            id: "dexter-huron",
            name: "Dexter-Huron Metropark",
            latitude: 42.3400,
            longitude: -83.8500,
            type: "access",
            parkingCapacity: "Large paved lots",
            regulations: "Catch & Release bass.",
            notes: "Easy wading and kayak access."
          }
        ]
      }
    ]
  },
  pennsylvania: {
    id: "pennsylvania",
    name: "Pennsylvania",
    abbr: "PA",
    description: "Famous limestone trout streams with heavy hatches and educated wild trout populations.",
    corridors: [
      {
        id: "spring-creek",
        name: "Spring Creek",
        location: "Bellefonte",
        gaugeId: "01546400",
        gaugeName: "Spring Creek at Houserville",
        gaugeNote: PLANNING_STREAMS['spring-creek'].gaugeNote,
        latitude: 40.9115,
        longitude: -77.7785,
        flowRange: null,
        species: ["Wild Brown Trout"],
        description: "A limestone stream with wild brown trout. Regulations and wading restrictions vary by reach; Fisherman's Paradise has a separate fly-fishing-only section.",
        googlePlaceQuery: "Spring Creek Bellefonte PA fly fishing access",
        accessPoints: [
          {
            id: "fishermans-paradise",
            name: "Fisherman's Paradise Access",
            latitude: 40.8712,
            longitude: -77.7785,
            type: "access",
            parkingCapacity: "Capacity not verified",
            regulations: PLANNING_STREAMS['spring-creek'].regulations,
            notes: PLANNING_STREAMS['spring-creek'].access
          },
          {
            id: "milesburg-gap",
            name: "Milesburg Gap Access",
            latitude: 40.9412,
            longitude: -77.7915,
            type: "parking",
            parkingCapacity: "10 cars (Dirt roadside)",
            regulations: "Standard PA wild trout rules.",
            notes: "Good pocket water wading, holds nice trout in deep seams."
          },
          {
            id: "houserville",
            name: "Houserville Road Access",
            latitude: 40.8356,
            longitude: -77.7889,
            type: "access",
            parkingCapacity: "12 cars (Gravel lot)",
            regulations: "Standard PA wild trout rules.",
            notes: "Shallow riffles and gravel flats. Perfect for dry fly fishing."
          }
        ]
      },
      {
        id: "penns-creek",
        name: "Penns Creek",
        location: "Coburn",
        gaugeId: "01555000",
        gaugeName: "Penns Creek at Penns Creek",
        gaugeNote: "Downstream regional context for Coburn, not a measurement at the access point. Reference range not verified for this station.",
        latitude: 40.8678,
        longitude: -77.4589,
        flowRange: null,
        species: ["Wild Brown Trout", "Rainbow Trout"],
        description: "A large, challenging limestone stream famous for its legendary Green Drake hatch in late May. Wading can be difficult due to slick, bowling-ball-sized rocks. High flow rates can make it dangerous.",
        googlePlaceQuery: "Penns Creek Coburn PA fly fishing access",
        accessPoints: [
          {
            id: "coburn-access",
            name: "Coburn Access Point",
            latitude: 40.8678,
            longitude: -77.4589,
            type: "access",
            parkingCapacity: "15 cars (Dirt roadside)",
            regulations: "Catch & Release only (specific sections).",
            notes: "Confluence of Elk Creek and Penns Creek. Excellent dry fly pools."
          },
          {
            id: "poe-paddy",
            name: "Poe Paddy State Park Access",
            latitude: 40.8361,
            longitude: -77.4215,
            type: "access",
            parkingCapacity: "50 cars (Paved)",
            regulations: "Trophy Trout Area. Artificial lures/flies only.",
            notes: "Access near the famous Poe Paddy train tunnel. Excellent wading runs upstream."
          }
        ]
      },
      {
        id: "little-juniata",
        name: "Little Juniata River",
        location: "Spruce Creek",
        gaugeId: "01558000",
        gaugeName: "Little Juniata River at Spruce Creek",
        gaugeNote: "Spruce Creek station. Reference range not verified for this station; a reading does not establish safe wading.",
        latitude: 40.6000,
        longitude: -78.1333,
        flowRange: null,
        species: ["Brown Trout"],
        description: "A premier limestone-influenced freestone river, recovering remarkably from past pollution to become a top brown trout fishery.",
        googlePlaceQuery: "Little Juniata River Spruce Creek fly fishing",
        accessPoints: [
          {
            id: "spruce-creek-confluence",
            name: "Spruce Creek Confluence",
            latitude: 40.6111,
            longitude: -78.1411,
            type: "access",
            parkingCapacity: "8 cars (Gravel)",
            regulations: "Catch & Release All Tackle.",
            notes: "Productive water right below the confluence with Spruce Creek."
          }
        ]
      },
      {
        id: "yellow-breeches",
        name: "Yellow Breeches Creek",
        location: "Boiling Springs",
        gaugeId: "01571500",
        gaugeName: "Yellow Breeches Creek near Camp Hill",
        gaugeNote: PLANNING_STREAMS['yellow-breeches'].gaugeNote,
        latitude: 40.1500,
        longitude: -77.1333,
        flowRange: null,
        species: ["Brown Trout", "Rainbow Trout"],
        description: "Limestone-influenced water near Boiling Springs. Section 03 regulations changed in August 2026; review current rules and marked boundaries before fishing.",
        googlePlaceQuery: "Yellow Breeches Boiling Springs fly fishing",
        accessPoints: [
          {
            id: "allenberry-run",
            name: "Allenberry Resort Run",
            latitude: 40.1480,
            longitude: -77.1250,
            type: "access",
            parkingCapacity: "Capacity not verified",
            regulations: PLANNING_STREAMS['yellow-breeches'].regulations,
            notes: PLANNING_STREAMS['yellow-breeches'].access
          }
        ]
      },
      {
        id: "pine-creek",
        name: "Pine Creek",
        location: "Cedar Run",
        gaugeId: "01548500",
        latitude: 41.5200,
        longitude: -77.4500,
        flowRange: { min: 150, max: 600 },
        species: ["Brown Trout", "Brook Trout"],
        description: "The 'Grand Canyon of Pennsylvania' offers incredible scenery and classic freestone trout fishing.",
        googlePlaceQuery: "Pine Creek Cedar Run fly fishing",
        accessPoints: [
          {
            id: "slate-run",
            name: "Slate Run Access",
            latitude: 41.4700,
            longitude: -77.5000,
            type: "access",
            parkingCapacity: "15 cars",
            regulations: "Trophy Trout Area.",
            notes: "Beautiful plunge pools and long runs."
          }
        ]
      },
      {
        id: "letort-spring-run",
        name: "Letort Spring Run",
        location: "Carlisle",
        gaugeId: "01569800",
        gaugeName: "Letort Spring Run near Carlisle (historical)",
        gaugeHistorical: true,
        gaugeNote: PLANNING_STREAMS['letort-spring-run'].gaugeNote,
        latitude: 40.2000,
        longitude: -77.1800,
        flowRange: null,
        species: ["Brown Trout"],
        description: "One of the most famous limestone spring creeks in the world. Extremely technical fishing for wild browns.",
        googlePlaceQuery: "Letort Spring Run fly fishing",
        accessPoints: [
          {
            id: "letort-park",
            name: "Letort Park",
            latitude: 40.2050,
            longitude: -77.1850,
            type: "access",
            parkingCapacity: "Capacity not verified",
            regulations: PLANNING_STREAMS['letort-spring-run'].regulations,
            notes: PLANNING_STREAMS['letort-spring-run'].access
          }
        ]
      },
      {
        id: "brodhead-creek",
        name: "Brodhead Creek",
        location: "Stroudsburg",
        gaugeId: "01440400",
        latitude: 41.0200,
        longitude: -75.1800,
        flowRange: { min: 100, max: 350 },
        species: ["Brown Trout", "Rainbow Trout"],
        description: "The birthplace of American fly fishing. Rich history and excellent freestone water in the Poconos.",
        googlePlaceQuery: "Brodhead Creek fly fishing access",
        accessPoints: [
          {
            id: "analomink",
            name: "Analomink Access",
            latitude: 41.0400,
            longitude: -75.2100,
            type: "access",
            parkingCapacity: "10 cars",
            regulations: "Standard PA trout regulations.",
            notes: "Classic pocket water and deep pools."
          }
        ]
      }
    ]
  },
  "west-virginia": {
    id: "west-virginia",
    name: "West Virginia",
    abbr: "WV",
    description: "Rugged freestone rivers running through deep mountain gorges.",
    corridors: [
      {
        id: "elk-river",
        name: "Elk River",
        location: "Webster Springs",
        gaugeId: "03197000",
        latitude: 38.4807,
        longitude: -80.4079,
        flowRange: { min: 100, max: 400 },
        species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
        description: "A renowned West Virginia trout stream with a dedicated catch-and-release section. Cold water flows support excellent fly fishing year-round.",
        googlePlaceQuery: "Elk River Webster Springs WV fly fishing access",
        accessPoints: [
          {
            id: "webster-springs-park",
            name: "Webster Springs Town Park",
            latitude: 38.4807,
            longitude: -80.4079,
            type: "access",
            parkingCapacity: "20 cars (Paved)",
            regulations: "Standard WV trout limits apply.",
            notes: "Convenient access points with town amenities nearby."
          }
        ]
      }
    ]
  },
  tennessee: {
    id: "tennessee",
    name: "Tennessee",
    abbr: "TN",
    description: "Superb tailwater trout rivers with massive insect hatches and trophy-sized trout.",
    corridors: [
      {
        id: "south-holston",
        name: "South Holston River",
        location: "Bristol",
        gaugeId: null,
        gaugeNote: "No verified live USGS gauge is configured for this tailwater. The previous station measured Little River at Townsend, a different river. Select South Holston in TVA's lake information for releases; schedules can change.",
        gaugeSource: { label: 'TVA lake levels and releases', url: 'https://www.tva.com/environment/lake-levels' },
        latitude: 36.5273,
        longitude: -82.1021,
        flowRange: null,
        species: ["Brown Trout", "Rainbow Trout"],
        description: "One of the top tailwater fisheries in the eastern United States, famous for its sulfur hatches and massive population of wild brown trout.",
        googlePlaceQuery: "South Holston River Bristol TN fly fishing access",
        accessPoints: [
          {
            id: "weir-dam",
            name: "South Holston Weir Dam Access",
            latitude: 36.5273,
            longitude: -82.1021,
            type: "access",
            parkingCapacity: "25 cars (Paved)",
            regulations: "Special regulation wild trout area.",
            notes: "Easy access at the weir dam. Great wading opportunities when water release schedules allow."
          }
        ]
      }
    ]
  },
  "north-carolina": {
    id: "north-carolina",
    name: "North Carolina",
    abbr: "NC",
    description: "Scenic mountain freestone streams and designated heritage trout waters.",
    corridors: [
      {
        id: "davidson-river",
        name: "Davidson River",
        location: "Brevard",
        gaugeId: "03441000",
        latitude: 35.2754,
        longitude: -82.7118,
        flowRange: { min: 50, max: 200 },
        species: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
        description: "A highly regarded trout stream flowing through the Pisgah National Forest. Offers technical catch-and-release fly fishing for educated wild trout.",
        googlePlaceQuery: "Davidson River Brevard NC fly fishing access",
        accessPoints: [
          {
            id: "forest-hatchery",
            name: "Pisgah Forest Hatchery Access",
            latitude: 35.2754,
            longitude: -82.7118,
            type: "access",
            parkingCapacity: "15 cars (Gravel lot)",
            regulations: "Catch and Release, Artificial Lures Only year-round.",
            notes: "Located near the fish hatchery. Big wild trout run these waters, requiring long leaders and fine tippets."
          }
        ]
      }
    ]
  },
  montana: {
    id: "montana",
    name: "Montana",
    abbr: "MT",
    description: "World-class blue-ribbon trout rivers winding through wild mountain valleys.",
    corridors: [
      {
        id: "madison-river",
        name: "Madison River",
        location: "West Yellowstone",
        gaugeId: "06037500",
        latitude: 44.8211,
        longitude: -111.1961,
        flowRange: { min: 300, max: 1000 },
        species: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
        description: "The Madison is a legendary blue-ribbon trout river. From high-mountain meadow stretches in Yellowstone to the roaring riffles of the lower valley, it is a bucket-list destination.",
        googlePlaceQuery: "Madison River West Yellowstone MT fly fishing access",
        accessPoints: [
          {
            id: "valley-view",
            name: "Valley View Access",
            latitude: 44.8211,
            longitude: -111.1961,
            type: "access",
            parkingCapacity: "30 cars (Gravel)",
            regulations: "Standard Montana fishing regulations apply.",
            notes: "Beautiful views, fast pocket water. Great dry fly fishing during the summer hatch periods."
          }
        ]
      },
      {
        id: "missouri-river",
        name: "Missouri River",
        location: "Craig",
        gaugeId: "06066500",
        latitude: 47.0736,
        longitude: -111.9625,
        flowRange: { min: 3000, max: 8000 },
        species: ["Rainbow Trout", "Brown Trout"],
        description: "One of the most productive tailwater trout fisheries in the world, boasting huge insect hatches and high fish counts.",
        googlePlaceQuery: "Missouri River Craig MT fly fishing access",
        accessPoints: [
          {
            id: "craig-access",
            name: "Craig Fishing Access Site",
            latitude: 47.0736,
            longitude: -111.9625,
            type: "access",
            parkingCapacity: "40 cars (Paved)",
            regulations: "Standard Montana regulations apply.",
            notes: "Primary boat launch and wade entry in the heart of Craig."
          }
        ]
      },
      {
        id: "yellowstone-river",
        name: "Yellowstone River",
        location: "Livingston",
        gaugeId: "06192500",
        latitude: 45.6586,
        longitude: -110.5608,
        flowRange: { min: 1500, max: 5000 },
        species: ["Brown Trout", "Rainbow Trout", "Yellowstone Cutthroat"],
        description: "The longest undammed river in the lower 48 states, offering exceptional dry fly fishing through Paradise Valley.",
        googlePlaceQuery: "Yellowstone River Livingston MT fly fishing access",
        accessPoints: [
          {
            id: "carters-bridge",
            name: "Carter's Bridge Access Site",
            latitude: 45.6586,
            longitude: -110.5608,
            type: "access",
            parkingCapacity: "20 cars (Gravel)",
            regulations: "Standard Montana trout rules.",
            notes: "Excellent float launch site located just south of Livingston."
          }
        ]
      },
      {
        id: "gallatin-river",
        name: "Gallatin River",
        location: "Bozeman",
        gaugeId: "06043500",
        latitude: 45.4985,
        longitude: -111.2683,
        flowRange: { min: 400, max: 1500 },
        species: ["Rainbow Trout", "Brown Trout", "Mountain Whitefish"],
        description: "A scenic mountain river running through the Gallatin Canyon, famous as the primary filming location for 'A River Runs Through It'.",
        googlePlaceQuery: "Gallatin River Bozeman MT fly fishing access",
        accessPoints: [
          {
            id: "house-rock",
            name: "House Rock Access Site",
            latitude: 45.4985,
            longitude: -111.2683,
            type: "access",
            parkingCapacity: "15 cars (Gravel)",
            regulations: "Catch & Release only for trout in designated sections.",
            notes: "Popular wading spot located in the gorgeous canyon stretch."
          }
        ]
      },
      {
        id: "bighorn-river",
        name: "Bighorn River",
        location: "Fort Smith",
        gaugeId: "06287000",
        latitude: 45.3263,
        longitude: -107.9406,
        flowRange: { min: 1000, max: 4000 },
        species: ["Brown Trout", "Rainbow Trout"],
        description: "A legendary tailwater fishery below Yellowtail Dam, offering incredibly consistent water temperatures and prolific hatches.",
        googlePlaceQuery: "Bighorn River Fort Smith MT fly fishing access",
        accessPoints: [
          {
            id: "three-mile",
            name: "3-Mile Access Site",
            latitude: 45.3263,
            longitude: -107.9406,
            type: "access",
            parkingCapacity: "35 cars (Gravel)",
            regulations: "Artificial lures and flies only.",
            notes: "Perfect take-out or launch point for the upper tailwater float."
          }
        ]
      },
      {
        id: "bitterroot-river",
        name: "Bitterroot River",
        location: "Hamilton",
        gaugeId: "12344000",
        latitude: 45.9983,
        longitude: -114.1583,
        flowRange: { min: 300, max: 1200 },
        species: ["Rainbow Trout", "Brown Trout", "Westslope Cutthroat"],
        description: "A classic western freestone river running between the Bitterroot and Sapphire mountains, famous for spring Skwala stonefly hatches.",
        googlePlaceQuery: "Bitterroot River Darby MT fly fishing access",
        accessPoints: [
          {
            id: "hannon-memorial",
            name: "Hannon Memorial Access Site",
            latitude: 45.9983,
            longitude: -114.1583,
            type: "access",
            parkingCapacity: "12 cars (Dirt lot)",
            regulations: "Standard fly fishing bag limits apply.",
            notes: "Peaceful wade-fishing location with great bank structure."
          }
        ]
      },
      {
        id: "clark-fork-river",
        name: "Clark Fork River",
        location: "Missoula",
        gaugeId: "12340500",
        gaugeNote: "Clark Fork above Missoula. This replaces a station on the Missouri River; readings describe the gauge location, not every access point.",
        latitude: 46.8711,
        longitude: -113.9928,
        flowRange: null,
        species: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
        description: "A large, diverse river offering fantastic dry-fly banks and structure, flowing right through the heart of Missoula.",
        googlePlaceQuery: "Clark Fork Missoula MT fly fishing access",
        accessPoints: [
          {
            id: "east-missoula-access",
            name: "East Missoula Access Site",
            latitude: 46.8711,
            longitude: -113.9928,
            type: "access",
            parkingCapacity: "18 cars (Gravel)",
            regulations: "Standard MT trout rules.",
            notes: "Convenient river launch point for Missoula locals."
          }
        ]
      },
      {
        id: "blackfoot-river",
        name: "Blackfoot River",
        location: "Ovando",
        gaugeId: "12340000",
        gaugeNote: "Blackfoot River near Bonner. This replaces a station on the Gallatin River; readings describe the gauge location, not every access point.",
        latitude: 46.8986,
        longitude: -113.8647,
        flowRange: null,
        species: ["Westslope Cutthroat", "Rainbow Trout", "Bull Trout"],
        description: "A rugged, classic freestone river featuring deep canyons, large boulders, and exceptional terrestrial fishing in late summer.",
        googlePlaceQuery: "Blackfoot River Bonner MT fly fishing access",
        accessPoints: [
          {
            id: "harry-morgan",
            name: "Harry Morgan Access Site",
            latitude: 46.8986,
            longitude: -113.8647,
            type: "access",
            parkingCapacity: "25 cars (Gravel)",
            regulations: "Catch & Release only for native cutthroat trout.",
            notes: "Beautiful canyon access with deep pools and fast riffles."
          }
        ]
      },
      {
        id: "smith-river",
        name: "Smith River",
        location: "White Sulphur Springs",
        gaugeId: "06077500",
        latitude: 47.1994,
        longitude: -111.4117,
        flowRange: { min: 200, max: 800 },
        species: ["Brown Trout", "Rainbow Trout"],
        description: "Famous for its spectacular 59-mile permitted float canyon, offering remote limestone cliffs and exceptional trout habitat.",
        googlePlaceQuery: "Smith River Eden MT fly fishing access",
        accessPoints: [
          {
            id: "camp-baker",
            name: "Camp Baker Launch Site",
            latitude: 47.1994,
            longitude: -111.4117,
            type: "access",
            parkingCapacity: "50 cars (Large lot)",
            regulations: "Strict permit system for multi-day floating.",
            notes: "The primary entry launch site for the legendary Smith River canyon float."
          }
        ]
      }
    ]
  }
};

// Backwards compatibility list representation
export const RIVERS = [
  ...STATES.ohio.corridors.map(c => ({ ...c, state: "OH" })),
  ...STATES.michigan.corridors.map(c => ({ ...c, state: "MI" })),
  ...STATES.pennsylvania.corridors.map(c => ({ ...c, state: "PA" })),
  ...STATES["west-virginia"].corridors.map(c => ({ ...c, state: "WV" })),
  ...STATES.tennessee.corridors.map(c => ({ ...c, state: "TN" })),
  ...STATES["north-carolina"].corridors.map(c => ({ ...c, state: "NC" })),
  ...STATES.montana.corridors.map(c => ({ ...c, state: "MT" }))
];
