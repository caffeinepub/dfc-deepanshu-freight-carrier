import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';
import { useClientSession } from './ClientSessionProvider';
import { Principal } from '@dfinity/principal';
import type { Client, Invoice, Shipment, UserProfile, LoginHistoryEntry } from '../backend';
import { toast } from 'sonner';

// Admin Bootstrap Queries
export function useIsAdminBootstrapped() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdminBootstrapped'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdminBootstrapped();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBootstrapFirstAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrapFirstAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdminBootstrapped'] });
      toast.success('Admin access granted successfully');
    },
    onError: (error: any) => {
      console.error('Bootstrap error:', error);
      toast.error(error.message || 'Failed to bootstrap admin');
    },
  });
}

// Client Management Queries
export function useGetAllClients() {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Client[]>({
    queryKey: ['clients', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getAllClients(adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken,
  });
}

export function useGetClient(clientId: string | null) {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Client | null>({
    queryKey: ['client', clientId, adminToken],
    queryFn: async () => {
      if (!actor || !adminToken || !clientId) return null;
      const principal = Principal.fromText(clientId);
      return actor.getClient(principal, adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken && !!clientId,
  });
}

export function useAdminAddOrUpdateClient() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      profile,
    }: {
      clientId: string;
      profile: UserProfile;
    }) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      const principal = Principal.fromText(clientId);
      return actor.adminAddOrUpdateClient(principal, profile, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      toast.success('Client profile updated successfully');
    },
    onError: (error: any) => {
      console.error('Update client error:', error);
      toast.error(error.message || 'Failed to update client');
    },
  });
}

// Shipment Queries
export function useGetShipmentsByClient(clientId: string | null) {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();
  const { sessionToken: clientToken } = useClientSession();

  return useQuery<Shipment[]>({
    queryKey: ['shipments', clientId, adminToken, clientToken],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      const principal = Principal.fromText(clientId);
      return actor.getShipmentsByClient(
        principal,
        adminToken || null,
        clientToken || null
      );
    },
    enabled: !!actor && !isFetching && !!clientId && (!!adminToken || !!clientToken),
  });
}

export function useGetAllShipmentsForMap() {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Shipment[]>({
    queryKey: ['shipmentsForMap', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getAllShipmentsForMap(adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken,
  });
}

export function useCreateShipment() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trackingID,
      status,
      location,
      coordinates,
      client,
    }: {
      trackingID: string;
      status: string;
      location: string;
      coordinates?: { latitude: number; longitude: number } | null;
      client: string;
    }) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      const principal = Principal.fromText(client);
      return actor.createShipment(
        trackingID,
        status,
        location,
        coordinates || null,
        principal,
        adminToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipmentsForMap'] });
      toast.success('Shipment created successfully');
    },
    onError: (error: any) => {
      console.error('Create shipment error:', error);
      toast.error(error.message || 'Failed to create shipment');
    },
  });
}

// Invoice Queries
export function useGetInvoicesByClient(clientId: string | null) {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();
  const { sessionToken: clientToken } = useClientSession();

  return useQuery<Invoice[]>({
    queryKey: ['invoices', clientId, adminToken, clientToken],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      const principal = Principal.fromText(clientId);
      return actor.getInvoicesByClient(
        principal,
        adminToken || null,
        clientToken || null
      );
    },
    enabled: !!actor && !isFetching && !!clientId && (!!adminToken || !!clientToken),
  });
}

export function useGetRevenueData() {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Array<[bigint, bigint]>>({
    queryKey: ['revenueData', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getRevenueData(adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceNo,
      amount,
      dueDate,
      client,
    }: {
      invoiceNo: number;
      amount: number;
      dueDate: bigint;
      client: string;
    }) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      const principal = Principal.fromText(client);
      return actor.createInvoice(
        BigInt(invoiceNo),
        BigInt(amount),
        dueDate,
        principal,
        adminToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['revenueData'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      console.error('Create invoice error:', error);
      toast.error(error.message || 'Failed to create invoice');
    },
  });
}

export function useExportInvoices() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.exportInvoices(adminToken);
    },
    onSuccess: () => {
      toast.success('Invoices exported successfully');
    },
    onError: (error: any) => {
      console.error('Export invoices error:', error);
      toast.error(error.message || 'Failed to export invoices');
    },
  });
}

// MSG91 Queries
export function useIsMsg91ApiKeyStored() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isMsg91ApiKeyStored'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isMsg91ApiKeyStored();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStoreMsg91ApiKey() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.storeMsg91ApiKey(apiKey, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isMsg91ApiKeyStored'] });
      toast.success('MSG91 API key saved successfully');
    },
    onError: (error: any) => {
      console.error('Store MSG91 API key error:', error);
      toast.error(error.message || 'Failed to save MSG91 API key');
    },
  });
}

export function useVerifyMsg91AccessToken() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useMutation({
    mutationFn: async (jwtToken: string) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.verifyMsg91AccessToken(jwtToken, adminToken);
    },
    onError: (error: any) => {
      console.error('Verify MSG91 access token error:', error);
      toast.error(error.message || 'Failed to verify MSG91 access token');
    },
  });
}

// Google Geocoding API Queries
export function useIsGoogleApiKeyConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isGoogleApiKeyConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isGoogleApiKeyConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetGoogleApiKey() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.setGoogleApiKey(apiKey, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isGoogleApiKeyConfigured'] });
      toast.success('Google Geocoding API key saved successfully');
    },
    onError: (error: any) => {
      console.error('Store Google API key error:', error);
      toast.error(error.message || 'Failed to save Google API key');
    },
  });
}

// Login History Query
export function useGetLoginHistory() {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<LoginHistoryEntry[]>({
    queryKey: ['loginHistory', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getLoginHistory(adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken,
  });
}

// Client Authentication Queries
export function useClientLogin() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[ClientLogin] Attempting login...');
      const token = await actor.authenticateClient(identifier, password, null);
      console.log('[ClientLogin] Backend response received, token:', token ? 'present' : 'null');
      return token;
    },
    onSuccess: (token) => {
      if (!token || !token.trim()) {
        console.error('[ClientLogin] Backend returned empty/null token');
        toast.error('Login failed: Invalid session token received');
        return;
      }
      console.log('[ClientLogin] Setting token in global state');
      setClientToken(token);
      // Invalidate and refetch account status immediately
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      queryClient.invalidateQueries({ queryKey: ['loginHistory'] });
      console.log('[ClientLogin] Token set, queries invalidated');
      toast.success('Login successful');
    },
    onError: (error: any) => {
      console.error('[ClientLogin] Login error:', error);
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useClientOtpLogin() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phoneNumber,
      otp,
    }: {
      phoneNumber: string;
      otp: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[ClientOtpLogin] Attempting OTP login...');
      const token = await actor.verifyOtpAndAuthenticate(phoneNumber, otp, null);
      console.log('[ClientOtpLogin] Backend response received, token:', token ? 'present' : 'null');
      return token;
    },
    onSuccess: (token) => {
      if (!token || !token.trim()) {
        console.error('[ClientOtpLogin] Backend returned empty/null token');
        toast.error('OTP verification failed: Invalid session token received');
        return;
      }
      console.log('[ClientOtpLogin] Setting token in global state');
      setClientToken(token);
      // Invalidate and refetch account status immediately
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      queryClient.invalidateQueries({ queryKey: ['loginHistory'] });
      console.log('[ClientOtpLogin] Token set, queries invalidated');
      toast.success('Login successful');
    },
    onError: (error: any) => {
      console.error('[ClientOtpLogin] OTP login error:', error);
      toast.error(error.message || 'OTP verification failed');
    },
  });
}

export function useClientSignup() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      profile,
    }: {
      email: string;
      password: string;
      profile: UserProfile;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[ClientSignup] Attempting signup...');
      const token = await actor.clientSignup(email, password, profile);
      console.log('[ClientSignup] Backend response received, token:', token ? 'present' : 'null');
      return token;
    },
    onSuccess: (token) => {
      if (!token || !token.trim()) {
        console.error('[ClientSignup] Backend returned empty/null token');
        toast.error('Signup failed: Invalid session token received');
        return;
      }
      console.log('[ClientSignup] Setting token in global state');
      setClientToken(token);
      // Invalidate and refetch account status immediately
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      console.log('[ClientSignup] Token set, queries invalidated');
      toast.success('Account created successfully');
    },
    onError: (error: any) => {
      console.error('[ClientSignup] Signup error:', error);
      toast.error(error.message || 'Signup failed');
    },
  });
}

export function useClientLogout() {
  const { actor } = useActor();
  const { sessionToken, clearClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !sessionToken) throw new Error('Not authenticated');
      return actor.clientLogout(sessionToken);
    },
    onSuccess: () => {
      clearClientToken();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      clearClientToken();
      queryClient.clear();
      toast.error('Logged out (with errors)');
    },
  });
}

export function useGetClientAccountStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { sessionToken, clearClientToken } = useClientSession();

  const query = useQuery<{ isFirstLogin: boolean; role: string; clientId: string } | null>({
    queryKey: ['clientAccountStatus', sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return null;
      try {
        const status = await actor.getClientAccountStatus(sessionToken);
        const clientId = sessionToken.split('_session_')[1] || sessionToken.split('_otp_session_')[1] || sessionToken.split('_signup_session_')[1] || '';
        return {
          isFirstLogin: status.isFirstLogin,
          role: status.role,
          clientId,
        };
      } catch (error: any) {
        console.error('[ClientAccountStatus] Error fetching status:', error);
        if (error.message?.includes('Invalid or expired')) {
          clearClientToken();
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!sessionToken,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useChangeClientPassword() {
  const { actor } = useActor();
  const { sessionToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      if (!actor || !sessionToken) throw new Error('Not authenticated');
      return actor.changeClientPassword(sessionToken, currentPassword, newPassword);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      toast.error(error.message || 'Failed to change password');
    },
  });
}

export function useSendOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendOtp(phoneNumber);
    },
    onSuccess: () => {
      toast.success('OTP sent successfully');
    },
    onError: (error: any) => {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyOtp(phoneNumber, otp);
    },
    onError: (error: any) => {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Failed to verify OTP');
    },
  });
}

export function useCreateClientAccount() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      mobile,
      temporaryPassword,
      profile,
    }: {
      email: string | null;
      mobile: string | null;
      temporaryPassword: string;
      profile: UserProfile;
    }) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.createClientAccount(email, mobile, temporaryPassword, profile, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client account created successfully');
    },
    onError: (error: any) => {
      console.error('Create client account error:', error);
      toast.error(error.message || 'Failed to create client account');
    },
  });
}
