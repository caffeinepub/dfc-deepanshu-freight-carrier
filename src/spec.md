# Specification

## Summary
**Goal:** Add email/password client account authentication (signup, login, logout) with unique email enforcement and keep the client dashboard protected behind a valid session.

**Planned changes:**
- Backend (Motoko): add email/password account storage with unique email constraint, hashed password storage, role field (default `client`), and account creation timestamp.
- Backend (Motoko): implement signup (reject duplicate email), login (verify password hash, issue session token with expiry), logout (invalidate token), and an auth-status endpoint to validate the current session token.
- Frontend (React): add a “Create account” (signup) screen linked from the client login flow, with email + password validation and clear English success/error messages.
- Frontend (React): enforce protected client dashboard routing/rendering based on session token presence and backend validity; clear token and return to login on invalid/expired sessions and on logout.
- Data compatibility: apply safe defaults for any newly-added backend fields so existing persisted data remains readable.

**User-visible outcome:** Users can create a client account with email/password, log in to receive a session, access the client dashboard only while authenticated, and log out to immediately lose dashboard access; duplicate emails and invalid credentials show clear English errors.
