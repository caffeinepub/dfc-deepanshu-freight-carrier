# Specification

## Summary
**Goal:** Fix client signup failures caused by the backend trapping with "blob too long for principal", and ensure the signup UI submits a normalized identifier and shows friendly errors.

**Planned changes:**
- Update backend signup and account auto-repair flows (clientSignup, autoRepairClientAccount, repairMissingLinkedPrincipals) to generate linkedPrincipal for email/mobile identifiers without trapping on long values.
- Update signup UI to use the validated/normalized identifier returned by validateClientIdentifier when choosing email vs mobile flow and when submitting the signup payload.
- Map backend errors containing "blob too long for principal" to a user-friendly English message during signup, without exposing raw trap text; keep other error mappings unchanged.

**User-visible outcome:** Users can sign up successfully with a typical email or a 10-digit mobile number (even if entered with spaces/dashes or extra whitespace), and if the server encounters the specific principal-length error, the UI shows a clear English message instead of the raw trap text.
