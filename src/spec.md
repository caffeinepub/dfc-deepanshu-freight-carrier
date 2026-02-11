# Specification

## Summary
**Goal:** Fix “Service unavailable” failures by implementing missing Motoko backend APIs for admin login and client shipments/delivery history, and improve client UI error messaging to surface real errors when available.

**Planned changes:**
- Add/complete Motoko admin session endpoints used by the frontend (including `adminLogin(...)` and token validation paths such as `getAllClients(...)`) so Admin Login no longer fails due to missing methods.
- Add/complete Motoko shipment and delivery history endpoints used by the client dashboard (including `getClientShipmentsBySessionToken(sessionToken)` and any other shipment/history calls triggered after login), returning responses compatible with the frontend’s expected variant/unwrap handling.
- Update Client Shipments/Delivery History frontend error handling to display a user-friendly message derived from the actual React Query error when available, with a safe generic English fallback.

**User-visible outcome:** Admins can sign in without the “Service unavailable” alert, and authenticated clients can load shipments and delivery history; if loading fails, the UI shows a clearer, actionable English error message when possible.
