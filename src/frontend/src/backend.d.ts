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
export type AdminLoginResult = {
    __kind__: "invalidPassword";
    invalidPassword: null;
} | {
    __kind__: "success";
    success: string;
};
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
    adminLogin(password: string): Promise<AdminLoginResult>;
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
    createClientAccount(identifier: string, password: string, email: string | null, mobile: string | null, companyName: string, gstNumber: string, address: string): Promise<string | null>;
    getAllClients(sessionToken: string): Promise<AllClientsResponse | null>;
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
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    provisionClientAccount(identifier: string, password: string): Promise<void>;
    repairMissingLinkedPrincipals(): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendOtp(phoneNumber: string): Promise<Variant_invalidPhone_success_rateLimited>;
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
