import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AllClientsResponse {
    clientAccounts: Array<ClientAccount>;
    state: string;
    invoices: Array<Invoice>;
    shipments: Array<Shipment>;
}
export type Time = bigint;
export interface ClientAccount {
    password: string;
    createdAt: Time;
    role: ClientRole;
    email?: string;
    isFirstLogin: boolean;
    activeSessionToken?: string;
    mobile?: string;
    identifier: string;
    linkedPrincipal?: Principal;
    profile: UserProfile;
}
export interface Shipment {
    status: string;
    client: Principal;
    trackingID: string;
    location: string;
    coordinates?: Coordinates;
}
export interface Coordinates {
    latitude: number;
    longitude: number;
}
export interface Invoice {
    status: InvoiceStatus;
    client: Principal;
    dueDate: Time;
    invoiceNo: bigint;
    amount: bigint;
}
export interface UserProfile {
    gstNumber: string;
    address: string;
    companyName: string;
    mobile: string;
}
export enum ClientRole {
    client = "client",
    admin = "admin"
}
export enum InvoiceStatus {
    pending = "pending",
    paid = "paid",
    overdue = "overdue"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminLogin(password: string): Promise<string | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClientAccount(identifier: string, password: string, linkedPrincipal: Principal, email: string | null, mobile: string | null, companyName: string, gstNumber: string, address: string): Promise<string | null>;
    getAllClients(sessionToken: string): Promise<AllClientsResponse | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientInvoicesBySessionToken(sessionToken: string): Promise<{
        __kind__: "noSessionToken";
        noSessionToken: null;
    } | {
        __kind__: "notLinked";
        notLinked: string;
    } | {
        __kind__: "success";
        success: Array<Invoice>;
    }>;
    getClientShipmentsBySessionToken(sessionToken: string): Promise<{
        __kind__: "noSessionToken";
        noSessionToken: null;
    } | {
        __kind__: "notLinked";
        notLinked: string;
    } | {
        __kind__: "success";
        success: Array<Shipment>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    provisionClientAccount(identifier: string, password: string, linkedPrincipal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    validateAdminSession(sessionToken: string): Promise<string | null>;
}
