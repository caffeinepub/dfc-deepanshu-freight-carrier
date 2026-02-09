# Specification

## Summary
**Goal:** Fix client password-login failures by validating email/mobile identifiers on the frontend, aligning backend client lookup with provisioning, and issuing a consistent, persistent client session token for authorized queries.

**Planned changes:**
- Add frontend validation on the Client Portal password-login identifier field (email must include `@`; mobile must be exactly 10 digits) and block the backend call when invalid, showing clear English guidance.
- Keep the existing OTP login tab behavior unchanged.
- Update backend client-account lookup/normalization so accounts created via `createClientAccount(...)` can be authenticated via `authenticateClient(emailOrMobile, password)` using either stored email or stored mobile.
- Ensure successful client authentication creates and persists a non-empty `ClientSession` token that works for subsequent client-authorized queries (e.g., account status, shipments, invoices) until timeout.
- Improve frontend error messaging so it distinguishes: invalid input format (frontend), account not found, and wrong password, using consistent English messages via `getClientAuthErrorMessage(...)`.

**User-visible outcome:** Client users can log in with a valid email or 10-digit mobile + password; invalid identifiers are explained before any backend call, and login errors clearly indicate “Account not found” vs “Invalid email/mobile or password.” Successful login yields a working session for client portal data pages.
