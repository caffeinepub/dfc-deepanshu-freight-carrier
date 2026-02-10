import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';
import { useClientSession } from './ClientSessionProvider';
import type { UserProfile, LoginHistoryEntry, ClientAccount } from '../backend';
import { toast } from 'sonner';

// Client Account Management Queries (New Backend)
export function useGetAllClientAccounts() {
  const { actor, isFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<ClientAccount[]>({
    queryKey: ['clientAccounts', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getAllClientAccounts(adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken,
  });
}

export function useDeleteClientAccount() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientCode: string) => {
      if (!actor || !adminToken) throw new Error('Not authenticated');
      const result = await actor.deleteClientAccount(clientCode, adminToken);
      if (!result) {
        throw new Error('Client not found');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientAccounts'] });
      toast.success('Client deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete client error:', error);
      toast.error(error.message || 'Failed to delete client');
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
      const clientCode = await actor.authenticateClient(identifier, password, null);
      console.log('[ClientLogin] Backend response received, clientCode:', clientCode ? 'present' : 'null');
      return clientCode;
    },
    onSuccess: (clientCode) => {
      if (!clientCode || !clientCode.trim()) {
        console.error('[ClientLogin] Backend returned empty/null client code');
        toast.error('Login failed: Invalid response received');
        return;
      }
      console.log('[ClientLogin] Setting client code as token in global state');
      // Use client code as session token for backward compatibility
      setClientToken(clientCode);
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

export function useClientSignup() {
  const { actor } = useActor();

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
      const clientCode = await actor.clientSignup(email, password, profile);
      console.log('[ClientSignup] Backend response received, clientCode:', clientCode ? 'present' : 'null');
      return clientCode;
    },
    onSuccess: (clientCode) => {
      if (!clientCode || !clientCode.trim()) {
        console.error('[ClientSignup] Backend returned empty/null client code');
        toast.error('Signup failed: Invalid response received');
        return;
      }
      console.log('[ClientSignup] Signup successful, client code:', clientCode);
      toast.success(`Account created successfully! Your client code is ${clientCode}`);
    },
    onError: (error: any) => {
      console.error('[ClientSignup] Signup error:', error);
      toast.error(error.message || 'Signup failed');
    },
  });
}

// Stub for OTP login (not implemented in backend)
export function useClientOtpLogin() {
  return useMutation({
    mutationFn: async (_args?: any) => {
      throw new Error('OTP login is not available');
    },
    onError: () => {
      toast.error('OTP login is not available. Please use password login.');
    },
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async (_phoneNumber?: any) => {
      throw new Error('OTP service is not available');
    },
    onError: () => {
      toast.error('OTP service is not available. Please use password login.');
    },
  });
}
