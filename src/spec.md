# Specification

## Summary
**Goal:** Track successful client logins in persistent backend storage and provide an admin-only view to review recent login activity.

**Planned changes:**
- Backend: Add a persistent `LoginHistoryEntry` record type and canister-state storage for login history (identifier entered, resolved client_id, server login_time, optional ip_address).
- Backend: Append a login history entry on each successful client login (password and OTP flows, if both exist); do not record failed logins.
- Backend: Add an admin-only query to fetch login history entries ordered newest-first, requiring a valid admin session token.
- Frontend: Add an Admin Dashboard tab labeled “Login History” that displays a table of Client Email/Identifier, Login Time, and IP Address (English-only text), including loading and empty states.
- Frontend: Add React Query hook/wiring to fetch login history using the current `adminToken`, disabled when no actor or no token is available.

**User-visible outcome:** Admins can open a “Login History” tab in the dashboard to see a newest-first table of successful client logins (identifier, time, and best-effort IP address).
