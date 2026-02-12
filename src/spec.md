# Specification

## Summary
**Goal:** Restore working Admin Panel login by fixing the frontend/backend `adminLogin` call mismatch, setting the correct admin password, and improving session persistence and error messaging.

**Planned changes:**
- Align the frontend `adminLogin` API call signature with the backend Motoko `adminLogin` method so correct credentials can authenticate without Candid/agent argument/type errors.
- Update the backend admin password to `JATINSHARMA2580`, and ensure incorrect passwords fail with a clear English error.
- Adjust frontend admin session persistence so on reload it validates `admin_session_token` via a dedicated backend session validation method (e.g., `validateAdminSession`), clearing the token and returning to Admin Login when invalid/expired.
- Improve Admin Login UI error messaging to distinguish between invalid password vs service/method/signature failures, and clear the error state on the next submit attempt.

**User-visible outcome:** Admin can sign in to the Admin Dashboard using password `JATINSHARMA2580`; after refresh the session stays logged in when valid (or logs out cleanly when expired), and login errors are accurate and actionable.
