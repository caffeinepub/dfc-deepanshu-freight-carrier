# Specification

## Summary
**Goal:** Fix admin authentication so correct admin password is accepted, sessions validate reliably, and the UI shows the correct error message based on backend results.

**Planned changes:**
- Update backend admin password verification to accept `JATINSHARMA2580`, ignore leading/trailing whitespace, return a success result with a non-empty session token on correct password, and return an explicit invalid-password result on incorrect password (no traps).
- Ensure backend exposes and implements the expected admin session APIs: `adminLogin(password)` to issue tokens and `validateAdminSession(token)` to validate them, including session timeout behavior and last-seen refresh on validation.
- Persist admin password correctly across canister upgrades so the stored admin password is set to `JATINSHARMA2580` after upgrade without wiping other preserved state.
- Adjust frontend admin login error handling to show exactly "Invalid password. Please try again." only when backend returns invalid-password; otherwise show an English service-unavailable style message for backend/candid/method issues.

**User-visible outcome:** Admins can sign in using the password `JATINSHARMA2580` (even if they accidentally add spaces), stay signed in while the session is valid, and see accurate login error messages when the password is wrong or the service is unavailable.
