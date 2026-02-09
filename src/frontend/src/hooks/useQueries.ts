import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';
import { useClientSession } from './useClientSession';
import { Principal } from '@dfinity/principal';
import type { UserProfile, Shipment, Invoice, Client } from '../backend';
import { toast } from 'sonner';

// Admin Session Validation
export function useValidateAdminSession() {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery({
    queryKey: ['adminSessionValid', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return false;
      try {
        await actor.getAllClients(adminToken);
        return true;
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !!adminToken && !isFetching,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// Client Management
export function useGetAllClients() {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getAllClients(adminToken);
    },
    enabled: !!actor && !!adminToken && !isFetching,
  });
}

export function useAdminAddOrUpdateClient() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, profile }: { clientId: Principal; profile: UserProfile }) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.adminAddOrUpdateClient(clientId, profile, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Shipments
export function useCreateShipment() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trackingID,
      status,
      location,
      client,
    }: {
      trackingID: string;
      status: string;
      location: string;
      client: Principal;
    }) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.createShipment(trackingID, status, location, client, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useGetShipmentsByClient(client: Principal | undefined) {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();
  const { sessionToken: clientSessionToken } = useClientSession();

  return useQuery<Shipment[]>({
    queryKey: ['shipments', client?.toString()],
    queryFn: async () => {
      if (!actor || !client) return [];
      return actor.getShipmentsByClient(
        client,
        adminToken || null,
        clientSessionToken || null
      );
    },
    enabled: !!actor && !!client && !isFetching,
  });
}

// Invoices
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
      invoiceNo: bigint;
      amount: bigint;
      dueDate: bigint;
      client: Principal;
    }) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.createInvoice(invoiceNo, amount, dueDate, client, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useGetInvoicesByClient(client: Principal | undefined) {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();
  const { sessionToken: clientSessionToken } = useClientSession();

  return useQuery<Invoice[]>({
    queryKey: ['invoices', client?.toString()],
    queryFn: async () => {
      if (!actor || !client) return [];
      return actor.getInvoicesByClient(
        client,
        adminToken || null,
        clientSessionToken || null
      );
    },
    enabled: !!actor && !!client && !isFetching,
  });
}

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(user: Principal | undefined) {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user, adminToken || null);
    },
    enabled: !!actor && !!user && !isFetching,
  });
}

// Export Invoices
export function useExportInvoices() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useMutation({
    mutationFn: async (): Promise<string[]> => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.exportInvoices(adminToken);
    },
  });
}

// MSG91 Configuration
export function useStoreMsg91ApiKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.storeMsg91ApiKey(apiKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['msg91KeyStored'] });
    },
  });
}

export function useIsMsg91ApiKeyStored() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['msg91KeyStored'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isMsg91ApiKeyStored();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyMsg91AccessToken() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (jwtToken: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyMsg91AccessToken(jwtToken);
    },
  });
}

// MSG91 OTP
export function useSendOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendOtp(phoneNumber);
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
  });
}

// Client Authentication
export function useAuthenticateClient() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailOrMobile, password }: { emailOrMobile: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      const sessionToken = await actor.authenticateClient(emailOrMobile, password);
      
      // Backend returns null for invalid credentials
      if (!sessionToken || sessionToken.trim() === '') {
        console.error('Authentication failed: empty or null token received');
        throw new Error('Invalid credentials');
      }
      
      return sessionToken;
    },
    onSuccess: (sessionToken) => {
      // Only set token if it's non-empty
      if (sessionToken && sessionToken.trim()) {
        setClientToken(sessionToken);
        // Invalidate and refetch client account status
        queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      } else {
        console.error('Received empty session token on success');
      }
    },
    onError: (error) => {
      console.error('Client authentication error:', error);
    },
  });
}

export function useVerifyOtpAndAuthenticate() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      const sessionToken = await actor.verifyOtpAndAuthenticate(phoneNumber, otp);
      
      // Backend returns null for invalid OTP or account not found
      if (!sessionToken || sessionToken.trim() === '') {
        console.error('OTP authentication failed: empty or null token received');
        throw new Error('OTP verification failed or account not found');
      }
      
      return sessionToken;
    },
    onSuccess: (sessionToken) => {
      // Only set token if it's non-empty
      if (sessionToken && sessionToken.trim()) {
        setClientToken(sessionToken);
        // Invalidate and refetch client account status
        queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      } else {
        console.error('Received empty session token on success');
      }
    },
    onError: (error) => {
      console.error('OTP authentication error:', error);
    },
  });
}

export function useGetClientAccountStatus() {
  const { actor, isFetching } = useActor();
  const { sessionToken, clearClientToken } = useClientSession();

  return useQuery<{ isFirstLogin: boolean } | null>({
    queryKey: ['clientAccountStatus', sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return null;
      
      try {
        return await actor.getClientAccountStatus(sessionToken);
      } catch (error) {
        console.error('Failed to get client account status:', error);
        // If session is invalid, clear it
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Invalid or expired')) {
          clearClientToken();
        }
        throw error;
      }
    },
    enabled: !!actor && !!sessionToken && !isFetching,
    retry: false,
  });
}

export function useChangeClientPassword() {
  const { actor } = useActor();
  const { sessionToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      if (!actor || !sessionToken) throw new Error('Not authenticated');
      return actor.changeClientPassword(sessionToken, currentPassword, newPassword);
    },
    onSuccess: () => {
      // Invalidate and refetch to get updated isFirstLogin status
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      console.error('Password change error:', error);
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
    },
  });
}

// Admin Role Management
export function useGrantAdmin() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: Principal) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.grantAdmin(targetPrincipal, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
    },
  });
}

export function useRevokeAdmin() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: Principal) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      return actor.revokeAdmin(targetPrincipal, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
    },
  });
}
