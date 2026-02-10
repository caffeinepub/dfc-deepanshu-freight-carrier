# Specification

## Summary
**Goal:** Add persistent client account signup/login in the Motoko backend with generated client codes, secure password verification, login history recording, and admin client list/delete, while keeping existing session token compatibility.

**Planned changes:**
- Implement backend client signup that persists accounts in canister state, enforces unique email, generates unique client codes in the format DFC##### (5 digits), hashes passwords, and stores profile fields plus createdAt.
- Implement backend client login that verifies hashed passwords, handles failed-attempt counters and locked accounts, resets counters on success, and returns the existing frontend-expected session token format.
- Persist login history on each successful client login (identifier used, client principal text, timestamp, and nullable IP if provided).
- Add/extend admin backend APIs to (1) list all client accounts (clientCode, companyName/name, email, createdAt) and (2) delete a client by clientCode, requiring a valid admin session token.
- Update frontend data flow to use the new/updated backend signup/login and admin client list/delete behaviors, ensuring user-facing messages remain in English and existing session token handling/admin login history panel remain compatible.
- Add a conditional Motoko upgrade migration to preserve existing persisted data and initialize new account fields (failedAttempts, accountLocked, clientCode when missing) with safe defaults.

**User-visible outcome:** Clients can sign up and log in with persistent accounts and consistent session tokens; admins can view all clients (including generated DFC codes), delete clients by code, and continue seeing login history entries recorded after successful logins.
