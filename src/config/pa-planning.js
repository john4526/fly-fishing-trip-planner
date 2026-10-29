// Source notes and routing methodology: docs/data/pennsylvania-planning.md.
export const CHECKED_ON = '2026-10-29';
export const PA_RULES = 'https://www.pa.gov/content/dam/copapwp-pagov/en/fishandboat/documents/fishing/regulations/summarybook.pdf';
export const YELLOW_NOTICE = 'https://www.pacodeandbulletin.gov/Display/pabull?file=/secure/pabulletin/data/vol56/56-32/1136.html';
export const BASES = {
  hershey: { name: 'Hershey', latitude: 40.2859, longitude: -76.6502 },
  lancaster: { name: 'Lancaster', latitude: 40.0379, longitude: -76.3055 },
};

export const PLANNING_STREAMS = {
  'yellow-breeches': {
    name: 'Yellow Breeches Creek', area: 'Boiling Springs', latitude: 40.148, longitude: -77.125,
    driveMinutes: { hershey: 50, lancaster: 80 },
    accessName: 'Allenberry fishing access', destination: '1559 Boiling Springs Rd, Boiling Springs, PA',
    access: 'The visitor bureau identifies a fishing parking area on the left of the entrance drive. Confirm current signs and permission; parking capacity and walk time are not verified.',
    accessSource: 'https://www.visitcumberlandvalley.com/blog/post/top-10-fishing-locations/',
    regulations: 'Section 03 left the catch-and-release/artificial-lures program in August 2026. Check current inland-water rules and the exact section; the adjoining Run has a separate regulatory history.',
    regulationSource: YELLOW_NOTICE,
    gauge: '01571500', gaugeNote: 'Camp Hill gauge, downstream of Boiling Springs. It does not measure conditions at the access point.',
    character: 'A familiar starting option, with a shorter drive from either base.',
  },
  'letort-spring-run': {
    name: 'Letort Spring Run', area: 'Carlisle', latitude: 40.205, longitude: -77.185,
    driveMinutes: { hershey: 55, lancaster: 80 },
    accessName: 'Letort Spring Park area', destination: 'Letort Spring Park, Carlisle, PA',
    access: 'The special-regulation reach ends at the railroad bridge along the south edge of the park. Confirm a lawful entry upstream; a park destination does not establish access along the entire stream. Walk time and parking capacity remain unverified.',
    accessSource: PA_RULES,
    regulations: 'A defined 1.71-mile reach is catch-and-release, fly-fishing only. The park is at its downstream boundary; do not apply that designation to the entire stream.',
    regulationSource: PA_RULES,
    gauge: '01569800', gaugeNote: 'Historical station: continuous records end in 2009. No current flow reading is promised.',
    character: 'A local alternative that needs an access check before committing to the outing.',
  },
  'spring-creek': {
    name: 'Spring Creek', area: 'Fisherman’s Paradise / State College area', latitude: 40.8712, longitude: -77.7785,
    driveMinutes: { hershey: 145, lancaster: 170 },
    accessName: 'Fisherman’s Paradise', destination: 'Fishermans Paradise, Bellefonte, PA',
    access: 'Use the designated access area and check posted wading restrictions. Parking capacity and walk time are unverified; budget extra time for finding a suitable bank position.',
    accessSource: PA_RULES,
    regulations: 'Fisherman’s Paradise has a separate fly-fishing-only reach. Most of Spring Creek is catch-and-release, all tackle; check the marked boundaries and posted wading restrictions.',
    regulationSource: PA_RULES,
    gauge: '01546400', gaugeNote: 'Houserville gauge, upstream of Fisherman’s Paradise. Treat it as regional context.',
    character: 'A longer outing. Compare the travel allowance carefully before giving it one of your two days.',
  },
};
