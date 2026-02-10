import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface LoginHistoryEntry {
    loginTime: Time;
    clientId: string;
    identifier: string;
    ipAddress?: string;
}
export interface ClientAccount {
    clientCode: string;
    password: string;
    createdAt: Time;
    role: ClientRole;
    email?: string;
    isFirstLogin: boolean;
    activeSessionToken?: string;
    isLocked: boolean;
    mobile?: string;
    failedAttempts: bigint;
    identifier: string;
    profile: UserProfile;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminLogin(password: string, token: string): Promise<string>;
    adminLogout(token: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateClient(emailOrMobile: string, password: string, ipAddress: string | null): Promise<string | null>;
    changeAdminPassword(token: string, oldPassword: string, newPassword: string): Promise<void>;
    clientSignup(email: string, password: string, profile: UserProfile): Promise<string>;
    deleteClientAccount(clientCode: string, adminToken: string): Promise<boolean>;
    getAllClientAccounts(adminToken: string): Promise<Array<ClientAccount>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientAccountByCode(clientCode: string, adminToken: string): Promise<ClientAccount | null>;
    getLoginHistory(adminToken: string): Promise<Array<LoginHistoryEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    healthCheck(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    isMsg91ApiKeyStored(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: {
    }): Promise<{
    }>;
}
