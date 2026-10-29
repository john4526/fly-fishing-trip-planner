# ADR 0002: Firebase Authentication & Firestore Persistence

## Status
Accepted

## Context
Anglers require personalized capabilities, such as saving favorite river corridors and accessing role-restricted administrative tools (Kanban management board).

## Decision
We implemented Firebase v12 SDK with React Context (`AuthContext`):
1. **Authentication**: Uses Firebase Web Auth SDK (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`).
2. **User Document Schema**: User preferences stored in Firestore under `users/{uid}` with a `favorites` array of corridor IDs. Admin authority comes from a trusted Firebase ID-token `admin: true` claim, never a client-writable profile field.
3. **Route Security**: The client UI inspects `AuthContext` user permissions before showing administrative controls (e.g. `/admin/kanban` redirects unauthorized non-admins).

## Consequences
### Positive
- Client-side auth state synchronizes seamlessly across all routes.
- Favorites persist reliably across sessions and devices.

### Negative
- Requires valid Firebase project credentials set in environment variables (`NEXT_PUBLIC_FIREBASE_*`).

## Deployment prerequisite
Validate and deploy `firestore.rules` to the intended project before production account use. Kanban task data remains browser-local. Any future privileged backend must verify the Firebase ID token and role server-side.
