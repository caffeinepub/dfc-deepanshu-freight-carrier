# Specification

## Summary
**Goal:** Fix the admin panel “Service unavailable” login issue by restoring working password-based admin authentication and session validation end-to-end.

**Planned changes:**
- Update backend `adminLogin(password)` to accept the exact admin password `JATINSHARMA2580` (trimming leading/trailing whitespace), return a non-empty session token on success, and return an explicit invalid-password result on failure.
- Ensure backend session APIs match the frontend contract: implement/align `adminLogin(password)` token issuance and `validateAdminSession(token)` validation, including last-seen refresh and expiration behavior.
- Adjust backend upgrade/migration handling so the admin password persists correctly across canister upgrades and is set to `JATINSHARMA2580` after upgrade without wiping other stored state.
- Verify the existing UI flow (`AdminLoginCard` + `useAdminSession`) correctly handles success (stores `admin_session_token` and enters admin dashboard), invalid password (shows exactly “Invalid password. Please try again.”), and backend/method failures (shows “Service unavailable. Please try again later.”).

**User-visible outcome:** Admins can log in with the correct password and access the admin dashboard; wrong passwords show the specified invalid-password message; backend/service issues show the specified service-unavailable message, and admin login keeps working after upgrades.
