import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Shipment {
    status: string;
    client: Principal;
    trackingID: string;
    location: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Invoice {
    status: InvoiceStatus;
    client: Principal;
    dueDate: Time;
    invoiceNo: bigint;
    amount: bigint;
}
export interface Client {
    id: Principal;
    gstNumber: string;
    address: string;
    companyName: string;
    mobile: string;
}
export interface UserProfile {
    gstNumber: string;
    address: string;
    companyName: string;
    mobile: string;
}
export interface http_header {
    value: string;
    name: string;
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
    addClient(companyName: string, gstNumber: string, address: string, mobile: string): Promise<boolean>;
    adminAddOrUpdateClient(clientId: Principal, profile: UserProfile, adminToken: string): Promise<void>;
    adminLogin(password: string, token: string): Promise<string>;
    adminLogout(token: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateClient(emailOrMobile: string, password: string): Promise<string | null>;
    bootstrapFirstAdmin(): Promise<void>;
    changeAdminPassword(token: string, oldPassword: string, newPassword: string): Promise<void>;
    changeClientPassword(sessionToken: string, currentPassword: string, newPassword: string): Promise<boolean>;
    createClientAccount(email: string | null, mobile: string | null, temporaryPassword: string, profile: UserProfile, adminToken: string): Promise<string>;
    createInvoice(invoiceNo: bigint, amount: bigint, dueDate: Time, client: Principal, adminToken: string): Promise<boolean>;
    createShipment(trackingID: string, status: string, location: string, client: Principal, adminToken: string): Promise<boolean>;
    exportInvoices(adminToken: string): Promise<Array<string>>;
    getAllClients(adminToken: string): Promise<Array<Client>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(id: Principal, adminToken: string | null): Promise<Client | null>;
    getClientAccountStatus(sessionToken: string): Promise<{
        isFirstLogin: boolean;
    }>;
    getInvoice(invoiceNo: bigint, adminToken: string | null, clientSessionToken: string | null): Promise<Invoice | null>;
    getInvoicesByClient(client: Principal, adminToken: string | null, clientSessionToken: string | null): Promise<Array<Invoice>>;
    getShipment(trackingID: string): Promise<Shipment | null>;
    getShipmentsByClient(client: Principal, adminToken: string | null, clientSessionToken: string | null): Promise<Array<Shipment>>;
    getUserProfile(user: Principal, adminToken: string | null): Promise<UserProfile | null>;
    grantAdmin(targetPrincipal: Principal, adminToken: string): Promise<void>;
    hasAdminRole(target: Principal, adminToken: string | null): Promise<boolean>;
    healthCheck(): Promise<string>;
    isAdminBootstrapped(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isMsg91ApiKeyStored(): Promise<boolean>;
    pay(arg0: {
        invoiceNo: bigint;
    }): Promise<boolean>;
    revokeAdmin(targetPrincipal: Principal, adminToken: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendOtp(phoneNumber: string): Promise<[boolean, string, bigint]>;
    storeMsg91ApiKey(apiKey: string): Promise<void>;
    trackShipment(trackingID: string): Promise<Shipment | null>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    verifyMsg91AccessToken(jwtToken: string): Promise<[boolean, string, bigint]>;
    verifyOtp(phoneNumber: string, otp: string): Promise<[boolean, string, bigint]>;
    verifyOtpAndAuthenticate(phoneNumber: string, otp: string): Promise<string | null>;
}
