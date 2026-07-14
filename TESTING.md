# Central Testing & Regression Conditions

This document catalogs all test conditions for the Fly Fishing Trip Planner. As required by our AI Agent rules, any new feature must have its test conditions documented here.

## 1. Authentication & User Sessions
- **Sign Up**: Verify that a user can sign up with a valid email and password.
- **Log In**: Verify that an existing user can log in with valid credentials.
- **Log Out**: Verify that clicking "Sign Out" removes the user session and updates the UI.
- **Persistence**: Verify that refreshing the page maintains the logged-in state.
- **Error Handling**: Verify that invalid credentials, existing emails, or weak passwords show appropriate inline error messages.

## 2. Favorites Management
- **Require Auth**: Verify that clicking the "Save to Favorites" star while logged out prompts the user to sign in.
- **Toggle Favorite**: Verify that an authenticated user can toggle a river as a favorite.
- **Visual Indication**: Verify that favorited rivers show a filled yellow star in the sidebar and header.

## 3. USGS Live Streamflow
- **Data Fetching**: Verify that streamflow data correctly fetches from the USGS gauge API for the active river.
- **Progress Bar**: Verify the visual progress bar accurately places the current flow relative to the optimal min/max limits.
- **Flow Badges**: Verify the correct badge (Optimal Flow, Too Low, Unsafe / High, etc.) is displayed based on current flow vs optimal ranges.
- **Error Handling**: Verify that if the USGS API fails, an error message with a "Retry" button appears.

## 4. Weather Forecast
- **Current Conditions**: Verify that current temperature, description, wind speed/direction, and humidity load correctly for the river's coordinates.
- **Forecast Strip**: Verify that the 3-hour / 5-day horizontal forecast strip displays time, icon, and temperature correctly.
- **Error Handling**: Verify that weather API failures show an error state with a "Retry" button.

## 5. Fish Stocking History
- **Display Stocking**: Verify that stocking records (if available) are fetched and displayed in the "Stream Profile & Access Info" card.
- **Empty State**: Verify that rivers without stocking records (e.g., wild populations) show the correct placeholder message.
- **Map Integration**: Verify the "Stocking: ON/OFF" toggle updates the state and sends the `update_stocking` postMessage to the map iframe.

## 6. Angler Reports & Reviews
- **Review Fetching**: Verify that Google Places reviews are successfully fetched and displayed for the active river.
- **Rating Summary**: Verify the average rating and total review count are accurate.
- **Star Rendering**: Verify that the 5-star visual render properly matches the rating value.
- **Empty State**: Verify that rivers without reviews show a prompt to "Be the first to add one!".

## 7. River Navigation & Sidebar
- **Selection**: Verify that clicking a river in the sidebar updates the active river state across the entire dashboard (USGS, Weather, Reviews, Maps).
- **Sidebar Flows**: Verify the sidebar eagerly fetches and displays a small `[number] cfs` label for each river.

## 8. Interactive Maps & Access Spots
- **Tab Switching**: Verify that switching between "Conditions & Reports" and "Access & Maps" works correctly.
- **Spot Selection**: Verify that selecting an access point updates the map iframe (via postMessage) with the new coordinates and marker.
- **Directions Link**: Verify that the "Get Driving Directions" link generates the correct Google Maps URL for the active access point.

## 9. Admin Kanban Board
- **Access Control**: Verify that only users with the `isAdmin` flag in Firestore can see the "Admin Dashboard" link and access the Kanban board.
- **Task Management**: Verify that admins can create, move, and delete kanban cards.
