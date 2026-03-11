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
export interface LoginHistoryEntry {
    loginTime: Time;
    clientId: string;
    identifier: string;
    ipAddress?: string;
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
export enum Variant_invalidPhone_success_rateLimited {
    invalidPhone = "invalidPhone",
    success = "success",
    rateLimited = "rateLimited"
}
export interface backendInterface {
    adminLogin(password: string): Promise<{
        __kind__: "serverError";
        serverError: null;
    } | {
        __kind__: "invalidPassword";
        invalidPassword: null;
    } | {
        __kind__: "success";
        success: string;
    }>;
    adminLogout(token: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clientPasswordLogin(identifier: string, password: string): Promise<{
        __kind__: "success";
        success: {
            clientId: string;
            sessionToken: string;
        };
    } | {
        __kind__: "rateLimited";
        rateLimited: null;
    } | {
        __kind__: "invalidCredentials";
        invalidCredentials: null;
    }>;
    clientSignup(email: string | null, mobile: string | null, password: string, companyName: string, gstNumber: string, address: string): Promise<{
        __kind__: "invalidInput";
        invalidInput: string;
    } | {
        __kind__: "mobileExists";
        mobileExists: null;
    } | {
        __kind__: "emailExists";
        emailExists: null;
    } | {
        __kind__: "success";
        success: string;
    }>;
    createClientAccount(sessionToken: string, identifier: string, password: string, email: string | null, mobile: string | null, companyName: string, gstNumber: string, address: string): Promise<string | null>;
    createInvoice(sessionToken: string, invoiceNo: bigint, amount: bigint, status: string, dueDate: Time, client: Principal): Promise<void>;
    createShipment(sessionToken: string, trackingID: string, status: string, location: string, client: Principal, coordinates: Coordinates | null): Promise<void>;
    deleteInvoice(sessionToken: string, invoiceNo: bigint): Promise<void>;
    deleteShipment(sessionToken: string, trackingID: string): Promise<void>;
    getAllClients(sessionToken: string): Promise<AllClientsResponse | null>;
    getAllShipmentsForMap(sessionToken: string): Promise<Array<Shipment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientAccountStatus(sessionToken: string): Promise<{
        __kind__: "unauthenticated";
        unauthenticated: null;
    } | {
        __kind__: "authenticated";
        authenticated: {
            clientId: string;
            isFirstLogin: boolean;
            profile: UserProfile;
        };
    }>;
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
    getInvoicesByClient(sessionToken: string): Promise<Array<Invoice>>;
    getLoginHistory(sessionToken: string): Promise<Array<LoginHistoryEntry>>;
    getRevenueData(sessionToken: string): Promise<Array<{
        date: string;
        amount: bigint;
    }>>;
    getShipmentsByClient(sessionToken: string): Promise<Array<Shipment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    provisionClientAccount(sessionToken: string, identifier: string, password: string): Promise<void>;
    repairMissingLinkedPrincipals(sessionToken: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendOtp(phoneNumber: string): Promise<Variant_invalidPhone_success_rateLimited>;
    updateInvoice(sessionToken: string, invoiceNo: bigint, amount: bigint, status: string, dueDate: Time): Promise<void>;
    updateShipment(sessionToken: string, trackingID: string, status: string, location: string, coordinates: Coordinates | null): Promise<void>;
    validateAdminSession(sessionToken: string): Promise<boolean>;
    verifyOtp(phoneNumber: string, otp: string): Promise<{
        __kind__: "expired";
        expired: null;
    } | {
        __kind__: "invalidOtp";
        invalidOtp: null;
    } | {
        __kind__: "notFound";
        notFound: null;
    } | {
        __kind__: "success";
        success: {
            clientId: string;
            sessionToken: string;
        };
    }>;
}
