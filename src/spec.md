# Specification

## Summary
**Goal:** Add admin live shipment tracking on Google Maps, an admin revenue chart based on real invoices, and a persistent WhatsApp support contact action in the client dashboard.

**Planned changes:**
- Add an Admin Dashboard “Live Tracking” tab/route that renders a Google Maps view with shipment markers, using a Google Maps JavaScript API key read from a frontend environment variable.
- Extend the shipment data model to store latitude/longitude per shipment and add an admin-authorized backend query to fetch all shipments for map rendering (including upgrade-safe migration only if needed).
- Implement the previously empty React admin tracking panel with loading, empty, and error states consistent with the existing admin UI theme.
- Add an Admin Dashboard “Revenue” view that shows a line chart computed from stored invoice records (e.g., totals grouped by month), with an empty state when no invoices exist.
- Add a persistent “Contact Support via WhatsApp” button/link in the client dashboard that opens a WhatsApp deep link to 9817783604 with a prefilled English message.

**User-visible outcome:** Admins can open a Live Tracking tab to see all shipments plotted on Google Maps and view a revenue line chart based on actual invoices; clients can quickly contact support via a WhatsApp button from the dashboard.
