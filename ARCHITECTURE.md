# Architecture Overview

This document outlines the high-level architecture of the Fly Fishing Trip Planner. 

## System Context Diagram

The application is built using Next.js (App Router) and uses Firebase for authentication and database services. It aggregates data from several external APIs.

```mermaid
graph TD
    %% Styling
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef server fill:#eef2ff,stroke:#6366f1,stroke-width:2px;
    classDef external fill:#fdf4ff,stroke:#d946ef,stroke-width:2px;
    classDef firebase fill:#fffbeb,stroke:#f59e0b,stroke-width:2px;
    classDef static fill:#ecfdf5,stroke:#10b981,stroke-width:2px;

    User([User / Angler])

    subgraph "Next.js Frontend (Client)"
        Dashboard[Dashboard Client Component]:::client
        Auth[Auth Context]:::client
        Map[Leaflet Map Iframe]:::client
        Admin[Kanban Admin Board]:::client
    end

    subgraph "Next.js Backend (API Routes)"
        WeatherAPI[/api/weather/]:::server
        RiverAPI[/api/river/]:::server
        ReviewsAPI[/api/reviews/]:::server
        StockingAPI[/api/stocking/]:::server
    end

    subgraph "Data & Configuration"
        StaticConfig[(Rivers & Config JS)]:::static
        StockingCSV[(Stocking CSV)]:::static
        EnvConfig[env.js Validation]:::static
    end

    subgraph "Firebase Services"
        FirebaseAuth((Firebase Auth)):::firebase
        Firestore((Firestore DB)):::firebase
    end

    subgraph "External APIs"
        USGS[USGS Water Services API]:::external
        OpenWeather[OpenWeatherMap API]:::external
        GooglePlaces[Google Places API]:::external
    end

    %% User Interactions
    User -->|Views Conditions| Dashboard
    User -->|Logs In| Auth
    User -->|Manages Tasks| Admin

    %% Frontend to Backend
    Dashboard -->|Fetches| WeatherAPI
    Dashboard -->|Fetches| RiverAPI
    Dashboard -->|Fetches| ReviewsAPI
    Dashboard -->|Fetches| StockingAPI
    Dashboard -->|Reads| StaticConfig

    %% Auth & DB
    Auth <--> FirebaseAuth
    Dashboard <-->|Saves Favorites| Firestore
    Admin <-->|Reads/Writes Tasks| Firestore

    %% Backend to External APIs
    WeatherAPI -->|Fetches Forecast| OpenWeather
    RiverAPI -->|Fetches Flow Data| USGS
    ReviewsAPI -->|Fetches Place Info| GooglePlaces
    StockingAPI -->|Parses| StockingCSV

    %% Context Flow
    Auth -.->|Provides User State| Dashboard
    Auth -.->|Secures| Admin
```

## Component Details

### 1. Frontend (Next.js App Router)
- **Dashboard Component**: The core view aggregating all the data. Contains sub-panels for stream flow progress bars, weather forecasts, angler reports, and maps.
- **Context API (`AuthContext`)**: Handles authentication state using Firebase Auth and syncs favorite rivers to Firestore.
- **Admin Kanban**: A private route accessible only to users with the `isAdmin` flag in Firestore, allowing task tracking.
- **Maps**: Embeds a Leaflet map via an iframe or native React wrapper, communicating via `postMessage`.

### 2. Backend (Next.js Route Handlers)
To avoid CORS issues and secure API keys, all external data fetches happen server-side:
- `/api/river`: Proxies requests to the **USGS Water Services API** for streamflow (cfs) and gage height.
- `/api/weather`: Proxies requests to **OpenWeatherMap** (or returns mock data if keys are missing).
- `/api/reviews`: Proxies requests to **Google Places API** for star ratings and reviews.
- `/api/stocking`: Parses the local `stocking_history.csv` to return ODNR fish stocking history.

### 3. Config & State Management
- `src/config/env.js`: Uses Zod to parse and validate environment variables (Firebase config, API keys) early to prevent runtime crashes.
- `src/config/rivers.js`: A static array containing the master list of rivers, flow ranges, species, and access points.
