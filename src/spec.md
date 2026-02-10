# Specification

## Summary
**Goal:** Configure the Google Maps JavaScript API key so the Admin Dashboard “Live Tracking” tab loads Google Maps and displays shipment markers.

**Planned changes:**
- Set up the frontend to read `VITE_GOOGLE_MAPS_API_KEY` and use it to load the Google Maps JS script via the existing dynamic loader in `AdminTrackingPanel` with `callback=initMap`.
- Ensure the Live Tracking view shows the existing English warning message when the API key is missing (instead of showing a blank/white map).
- Verify map rendering behavior: for shipments with coordinates, render one marker per shipment and show an info window with shipment details on marker click.

**User-visible outcome:** Admin users can open Admin Dashboard → Live Tracking and see Google Maps load successfully, with markers for shipments that have coordinates; if the API key is not configured, they see a clear warning message.
