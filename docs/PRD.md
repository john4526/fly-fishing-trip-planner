# Product Requirements Document (PRD) - Fly Fishing Trip Planner

## 1. Executive Summary
The **Fly Fishing Trip Planner** is a modern web application designed for anglers to discover premier fly fishing river corridors, evaluate real-time water conditions (streamflow rate and gauge height), check 5-day weather forecasts, access ODNR fish stocking history, view community reviews, and save favorite fishing spots.

## 2. Success Criteria & Key Performance Indicators (KPIs)
- **Data Availability**: > 99% success rate fetching live USGS streamflow and weather data.
- **Performance**: Sub-2 second load time on state overview and corridor dashboards.
- **User Engagement**: Capability for anglers to log in, save favorite rivers, and view access maps cleanly across desktop and mobile devices.
- **CORS & Key Security**: Zero front-end API key exposure; all external fetches routed through Next.js server-side proxy route handlers.

## 3. User Personas
- **Weekend Angler**: Needs quick state-level vector map navigation to see which local rivers have optimal flow rates today.
- **Traveling Fly Fisher**: Plans multi-day trips requiring detailed 5-day weather forecasts, USGS streamflow progress bars, stocking history, and Google driving directions to access points.
- **System Administrator**: Uses private admin tools to manage features and content cards.

## 4. Core Functional Requirements
1. **State-Based Exploration & Map Nav**:
   - Interactive landing page showcasing 7 premier states (Ohio, Michigan, Pennsylvania, West Virginia, Tennessee, North Carolina, Montana).
   - State overview page (`/states/[stateId]`) featuring an interactive vector SVG map linked to corridor detail cards.
2. **Real-Time River Conditions**:
   - USGS Water Services API integration calculating streamflow (cfs) and gauge height.
   - Flow status badges (Optimal Flow, Low Flow, High/Unsafe Flow) computed against configured upper/lower bounds.
3. **Weather Forecast Strip**:
   - OpenWeatherMap API integration providing current conditions and a 3-hour / 5-day forecast strip.
4. **ODNR Fish Stocking Data**:
   - Local CSV parsing of stocking history for species, date, location, and quantity.
5. **Community Reviews**:
   - Google Places API integration displaying ratings, review counts, and recent angler feedback.
6. **User Authentication & Favorites**:
   - Firebase Auth email/password authentication.
   - Firestore integration for persisting user favorited rivers.
7. **Admin Kanban Management**:
   - Role-gated Kanban board (`/admin/kanban`) accessible only to `isAdmin` users.

## 5. Non-Functional Requirements
- **Framework**: Next.js 16 (App Router) with React 19.
- **Styling**: Vanilla CSS with modern Glassmorphism theme tokens (`globals.css`, CSS Modules).
- **Testing**: Jest vertical slice integration tests covering state navigation, weather/river APIs, and authentication.
