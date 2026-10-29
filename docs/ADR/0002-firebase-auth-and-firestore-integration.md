# ADR 0002: Firebase Authentication & Firestore Persistence

## Status
Accepted

## Context
Anglers require personalized capabilities, such as saving favorite river corridors and accessing role-restricted administrative tools (Kanban management board).

## Decision
We implemented Firebase v12 SDK with React Context (`AuthContext`):
1. **Authentication**: Uses Firebase Web Auth SDK (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`).
2. **User Document Schema**: User preferences stored in Firestore under `users/{uid}` with a `favorites` array of corridor IDs and an `isAdmin` boolean flag.
3. **Route Security**: High-level pages inspect `AuthContext` user permissions before granting access (e.g. `/admin/kanban` redirects unauthorized non-admins).

## Consequences
### Positive
- Client-side auth state synchronizes seamlessly across all routes.
- Favorites persist reliably across sessions and devices.

### Negative
- Requires valid Firebase project credentials set in environment variables (`NEXT_PUBLIC_FIREBASE_*`).
