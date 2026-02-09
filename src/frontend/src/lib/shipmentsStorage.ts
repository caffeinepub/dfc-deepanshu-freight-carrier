// localStorage wrapper for shipments data
const STORAGE_KEY = 'shipments';

export interface ShipmentsData {
  [trackingId: string]: string;
}

const SEED_DATA: ShipmentsData = {
  'DFC1001': '✅ Load Confirmed - Truck Loaded from Kalamboli',
  'DFC1002': '🚛 In Transit - Reached Gujarat Border',
  'DFC1003': '📦 Arrived at Destination - Ready for Unloading'
};

export const shipmentsStorage = {
  // Get all shipments from localStorage
  getAll(): ShipmentsData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return {};
      }
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Error reading shipments from localStorage:', error);
      return {};
    }
  },

  // Get a single shipment by tracking ID (uppercased)
  get(trackingId: string): string | null {
    const shipments = this.getAll();
    const id = trackingId.toUpperCase();
    return shipments[id] || null;
  },

  // Save or update a shipment (tracking ID will be uppercased)
  upsert(trackingId: string, status: string): void {
    try {
      const shipments = this.getAll();
      const id = trackingId.toUpperCase();
      shipments[id] = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    } catch (error) {
      console.error('Error saving shipment to localStorage:', error);
    }
  },

  // Delete a shipment by tracking ID
  delete(trackingId: string): void {
    try {
      const shipments = this.getAll();
      const id = trackingId.toUpperCase();
      delete shipments[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    } catch (error) {
      console.error('Error deleting shipment from localStorage:', error);
    }
  },

  // Initialize storage with seed data if empty or missing
  initialize(): void {
    const existing = this.getAll();
    const hasData = Object.keys(existing).length > 0;
    
    // Only seed if storage is empty or missing
    if (!hasData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      } catch (error) {
        console.error('Error initializing shipments storage:', error);
      }
    }
  }
};
