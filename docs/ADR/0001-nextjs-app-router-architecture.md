# ADR 0001: Next.js App Router State-Based Architecture

## Status
Accepted

## Context
The application originally relied on a single monolithic `Dashboard.js` component to handle all state and river corridor views. As state options expanded to 7 states and dozens of corridors, a flat single-page structure led to high bundle sizes, prop-drilling, and poor deep-linking capabilities.

## Decision
We adopted Next.js App Router state-based routing:
- `/`: Landing page displaying state selector cards.
- `/states/[stateId]`: Split view with an interactive SVG state vector map and corridor card list.
- `/states/[stateId]/corridors/[corridorId]`: Dedicated corridor dashboard component (`CorridorDetails.js`).

## Consequences
### Positive
- Improved page-load performance and automatic route segment splitting.
- Support for direct bookmarking and deep linking to specific river corridors.
- Elimination of monolithic component dependencies.

### Negative / Tech Debt Resolved
- Required removing legacy `Dashboard.js` to eliminate architectural bloat.
