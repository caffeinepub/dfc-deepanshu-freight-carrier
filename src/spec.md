# Specification

## Summary
**Goal:** Fix Admin Login by updating the backend admin password to exactly `JATINSHARMA2580` and ensure it remains correct after canister upgrades.

**Planned changes:**
- Update the backend admin password validation so `adminLogin("JATINSHARMA2580")` authenticates successfully and returns a non-null session token.
- Ensure non-matching passwords continue to fail with an "Invalid admin password" error message in the UI.
- Ensure the updated admin password persists across upgrades for already-deployed canisters (no upgrade logic reverting/resetting to the old password).

**User-visible outcome:** Admin users can log in from the existing Admin Login screen using password `JATINSHARMA2580` and reach the admin dashboard; any other password is rejected as invalid, including after upgrades.
