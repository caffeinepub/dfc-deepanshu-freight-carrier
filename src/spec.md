# Specification

## Summary
**Goal:** Re-enable Client Portal login and signup by removing hard-disabled frontend UI states and implementing/wiring the missing backend client authentication APIs so clients can authenticate and access the intended portal experience.

**Planned changes:**
- Remove hard-coded disabled/unavailable UX from Client Portal Password login UI in `frontend/src/components/client/ClientPortalLoginCard.tsx` so inputs and submit behave based on validation and pending state.
- Remove hard-coded disabled/unavailable UX from Client Portal OTP login UI in `frontend/src/components/client/ClientPortalLoginCard.tsx` so Send OTP / Verify OTP flows work and only disable during pending states.
- Ensure Client Portal Signup UI in `frontend/src/components/client/ClientSignupCard.tsx` is fully editable, submit disables only while pending, and backend failures show clear English error messaging in the existing alert area.
- Add required client auth methods to `backend/main.mo`: client signup, password login, send OTP, verify OTP, and client account status retrieval for the current session.
- Wire frontend client auth mutations/queries to the new backend methods so successful login/signup persists a client session via `frontend/src/hooks/ClientSessionProvider.tsx` and the authenticated Client Portal flow in `frontend/src/App.tsx` proceeds as designed.

**User-visible outcome:** Clients can sign up and log in (password or OTP) from the Client Portal without “Unavailable” blocks; after successful authentication, the session is saved and the portal loads the first-login/password-change screen or the client dashboard as appropriate.
