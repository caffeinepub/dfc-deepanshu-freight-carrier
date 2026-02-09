# Specification

## Summary
**Goal:** Improve shipment tracking and admin management so public tracking displays exact stored statuses, includes seeded example IDs on first run, and the admin panel is password-gated.

**Planned changes:**
- Update public “Track Your Shipment” lookup to normalize entered Tracking ID to uppercase before searching localStorage.
- Change public tracking result rendering to display the stored status string exactly as saved (no added “Status:” prefix), and show the exact invalid-ID message when no match is found.
- Seed localStorage key `shipments` with example IDs/statuses (DFC1001/DFC1002/DFC1003 with emojis) only when `shipments` is missing or empty, without overwriting existing data.
- Add a password gate to the Admin Tracking Panel so admin controls and the shipments table remain hidden until the correct password is entered; show an English error message on incorrect password; return to locked state on reload unless an unlocked flag is explicitly persisted (and if so, provide a visible lock/logout action).
- Update the admin shipment status input to allow saving full custom status text (including emojis and additional details) instead of a fixed dropdown.

**User-visible outcome:** Users can enter tracking IDs in any case (e.g., `dfc1001`) and see the exact saved status text (including emojis), or the exact invalid-ID message; on first use the app includes example tracking IDs; admins must enter a password to access shipment add/update/delete and can save detailed custom status messages.
