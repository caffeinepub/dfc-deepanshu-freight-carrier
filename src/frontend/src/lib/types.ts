import { Principal } from '@icp-sdk/core/principal';
import type { Shipment, Invoice, InvoiceStatus } from '../backend';

// Local type definitions for missing backend types
export interface UserProfile {
  companyName: string;
  gstNumber: string;
  address: string;
  mobile: string;
}

export interface Client {
  id: Principal;
  companyName: string;
  gstNumber: string;
  address: string;
  mobile: string;
}

export interface ClientAccountStatus {
  identifier: string;
  isFirstLogin: boolean;
  profile: UserProfile;
}

export interface LoginHistoryEntry {
  identifier: string;
  clientId: string;
  loginTime: bigint;
  ipAddress: string | null;
}

// Re-export backend types for convenience
export type { Shipment, Invoice, InvoiceStatus };
