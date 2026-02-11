import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';
import { useClientSession } from './ClientSessionProvider';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import type { Shipment, Invoice, UserProfile } from '../backend';
import type { Client, ClientAccountStatus, LoginHistoryEntry } from '../lib/types';
import { getClientAuthErrorMessage } from '../utils/clientAuthErrors';

// Type assertion helper for backend actor with extended methods
type ExtendedActor = any;

// Helper to safely unwrap variant responses
function unwrapVariantResponse<T>(response: any, successKey: string = 'success'): T {
  if (!response) {
    throw new Error('No response from backend');
  }
  
  // Handle variant responses with __kind__
  if (typeof response === 'object' && '__kind__' in response) {
    if (response.__kind__ === successKey) {
      return response[successKey] as T;
    }
    
    if (response.__kind__ === 'noSessionToken') {
      throw new Error('Invalid or expired session token');
    }
    
    if (response.__kind__ === 'notLinked') {
      throw new Error('Client account has no linked principal');
    }
    
    throw new Error(`Unexpected response: ${response.__kind__}`);
  }
  
  // If it's already the expected type, return it
  return response as T;
}

// Admin Queries
export function useGetAllClients() {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      
      try {
        return (actor as ExtendedActor).getAllClients(adminToken);
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          throw new Error('Service unavailable. Please contact support.');
        }
        throw error;
      }
    },
    enabled: !!actor && !!adminToken && !actorFetching,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetAllShipmentsForMap(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Shipment[]>({
    queryKey: ['shipmentsForMap'],
    queryFn: async () => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      
      try {
        return (actor as ExtendedActor).getAllShipmentsForMap(adminToken);
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          throw new Error('Service unavailable. Please contact support.');
        }
        throw error;
      }
    },
    enabled: enabled && !!actor && !!adminToken && !actorFetching,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });
}

export function useGetRevenueData() {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Array<[bigint, bigint]>>({
    queryKey: ['revenueData'],
    queryFn: async () => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      
      try {
        return (actor as ExtendedActor).getRevenueData(adminToken);
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !!adminToken && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useGetLoginHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<LoginHistoryEntry[]>({
    queryKey: ['loginHistory'],
    queryFn: async () => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      
      try {
        return (actor as ExtendedActor).getLoginHistory(adminToken);
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !!adminToken && !actorFetching,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });
}

export function useGetShipmentsByClient(clientId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken } = useAdminSession();
  const { sessionToken } = useClientSession();

  return useQuery<Shipment[]>({
    queryKey: ['shipments', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) throw new Error('Actor or client not available');
      
      try {
        return (actor as ExtendedActor).getShipmentsByClient(clientId, adminToken || null, sessionToken || null);
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !!clientId && !actorFetching,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetInvoicesByClient(clientId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken } = useAdminSession();
  const { sessionToken } = useClientSession();

  return useQuery<Invoice[]>({
    queryKey: ['invoices', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) throw new Error('Actor or client not available');
      
      try {
        return (actor as ExtendedActor).getInvoicesByClient(clientId, adminToken || null, sessionToken || null);
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !!clientId && !actorFetching,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Client-focused queries using session token
export function useGetClientShipments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { sessionToken, isAuthenticated } = useClientSession();

  return useQuery<Shipment[]>({
    queryKey: ['clientShipments', sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) throw new Error('Authentication required');
      
      try {
        const response = await actor.getClientShipmentsBySessionToken(sessionToken);
        return unwrapVariantResponse<Shipment[]>(response, 'success');
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('not a function')) {
          throw new Error('Service unavailable. Please contact support.');
        }
        
        if (errorMessage.includes('no linked principal')) {
          throw new Error('Client account has no linked principal');
        }
        
        throw error;
      }
    },
    enabled: !!actor && !!sessionToken && isAuthenticated && !actorFetching,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
  });
}

export function useGetClientInvoices() {
  const { actor, isFetching: actorFetching } = useActor();
  const { sessionToken, isAuthenticated } = useClientSession();

  return useQuery<Invoice[]>({
    queryKey: ['clientInvoices', sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) throw new Error('Authentication required');
      
      try {
        const response = await actor.getClientInvoicesBySessionToken(sessionToken);
        return unwrapVariantResponse<Invoice[]>(response, 'success');
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('not a function')) {
          throw new Error('Service unavailable. Please contact support.');
        }
        
        if (errorMessage.includes('no linked principal')) {
          throw new Error('Client account has no linked principal');
        }
        
        throw error;
      }
    },
    enabled: !!actor && !!sessionToken && isAuthenticated && !actorFetching,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
  });
}

export function useIsMsg91ApiKeyStored() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['msg91ApiKeyStored'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        return (actor as ExtendedActor).isMsg91ApiKeyStored();
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useIsGoogleApiKeyConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['googleApiKeyConfigured'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        return (actor as ExtendedActor).isGoogleApiKeyConfigured();
      } catch (error: any) {
        if (error?.message?.includes('not a function')) {
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Client Session Queries
export function useGetClientAccountStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { sessionToken, isAuthenticated } = useClientSession();

  const query = useQuery<ClientAccountStatus | null>({
    queryKey: ['clientAccountStatus', sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return null;
      
      try {
        return await (actor as ExtendedActor).getClientAccountStatus(sessionToken);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        
        // Handle invalid/expired token gracefully
        if (errorMessage.includes('Invalid or expired') || errorMessage.includes('not a function')) {
          return null;
        }
        
        throw error;
      }
    },
    enabled: !!actor && !!sessionToken && isAuthenticated && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Mutations
export function useCreateShipment() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      trackingID: string;
      status: string;
      location: string;
      client: Principal;
      coordinates?: { latitude: number; longitude: number };
    }) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).createShipment(
        data.trackingID,
        data.status,
        data.location,
        data.client,
        data.coordinates ? [data.coordinates] : [],
        adminToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipmentsForMap'] });
      toast.success('Shipment created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to create shipment';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateShipment() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      trackingID: string;
      status: string;
      location: string;
      coordinates?: { latitude: number; longitude: number };
    }) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).updateShipment(
        data.trackingID,
        data.status,
        data.location,
        data.coordinates ? [data.coordinates] : [],
        adminToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipmentsForMap'] });
      queryClient.invalidateQueries({ queryKey: ['clientShipments'] });
      toast.success('Shipment updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update shipment';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteShipment() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackingID: string) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).deleteShipment(trackingID, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipmentsForMap'] });
      queryClient.invalidateQueries({ queryKey: ['clientShipments'] });
      toast.success('Shipment deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to delete shipment';
      toast.error(errorMessage);
    },
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      invoiceNo: bigint;
      amount: bigint;
      status: string;
      dueDate: bigint;
      client: Principal;
    }) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).createInvoice(
        data.invoiceNo,
        data.amount,
        data.status,
        data.dueDate,
        data.client,
        adminToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clientInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['revenueData'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to create invoice';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateInvoice() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      invoiceNo: bigint;
      amount: bigint;
      status: string;
      dueDate: bigint;
    }) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).updateInvoice(
        data.invoiceNo,
        data.amount,
        data.status,
        data.dueDate,
        adminToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clientInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['revenueData'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update invoice';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceNo: bigint) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).deleteInvoice(invoiceNo, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clientInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['revenueData'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to delete invoice';
      toast.error(errorMessage);
    },
  });
}

export function useExportAllInvoices() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).exportAllInvoices(adminToken);
    },
    onSuccess: () => {
      toast.success('Invoices exported successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to export invoices';
      toast.error(errorMessage);
    },
  });
}

export function useSetMsg91ApiKey() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).setMsg91ApiKey(apiKey, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['msg91ApiKeyStored'] });
      toast.success('MSG91 API key saved successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to save MSG91 API key';
      toast.error(errorMessage);
    },
  });
}

export function useVerifyMsg91Token() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).verifyMsg91Token(apiKey, adminToken);
    },
    onSuccess: () => {
      toast.success('MSG91 token verified successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to verify MSG91 token';
      toast.error(errorMessage);
    },
  });
}

export function useStoreGoogleApiKey() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor || !adminToken) throw new Error('Actor or token not available');
      return (actor as ExtendedActor).storeGoogleApiKey(apiKey, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['googleApiKeyConfigured'] });
      toast.success('Google API key saved successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to save Google API key';
      toast.error(errorMessage);
    },
  });
}

// Client Authentication Mutations
export function useClientLogin() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();

  return useMutation({
    mutationFn: async (data: { identifier: string; password: string; ipAddress?: string }) => {
      if (!actor) throw new Error('Service unavailable. Please try again later.');
      
      try {
        if (typeof (actor as ExtendedActor).authenticateClient !== 'function') {
          throw new Error('Login service is not available. Please contact support.');
        }
        
        const sessionToken = await (actor as ExtendedActor).authenticateClient(
          data.identifier,
          data.password,
          data.ipAddress ? [data.ipAddress] : []
        );
        
        setClientToken(sessionToken);
        return sessionToken;
      } catch (error: any) {
        // Preserve backend error messages for display
        throw error;
      }
    },
    onError: (error: any) => {
      // Use getClientAuthErrorMessage for consistent error display in toasts
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    },
  });
}

export function useClientSignup() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: {
      identifier: string;
      password: string;
      email?: string;
      mobile?: string;
      companyName: string;
      gstNumber: string;
      address: string;
    }) => {
      if (!actor) throw new Error('Service unavailable. Please try again later.');
      
      try {
        if (typeof (actor as ExtendedActor).clientSignup !== 'function') {
          throw new Error('Signup service is not available. Please contact support.');
        }
        
        return await (actor as ExtendedActor).clientSignup(
          data.identifier,
          data.password,
          data.email ? [data.email] : [],
          data.mobile ? [data.mobile] : [],
          data.companyName,
          data.gstNumber,
          data.address
        );
      } catch (error: any) {
        // Preserve backend error messages for display
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please log in.');
    },
    onError: (error: any) => {
      // Use getClientAuthErrorMessage for consistent error display in toasts
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    },
  });
}

export function useSendOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Service unavailable. Please try again later.');
      
      try {
        if (typeof (actor as ExtendedActor).sendOtp !== 'function') {
          throw new Error('OTP service is not available. Please use password login.');
        }
        
        return await (actor as ExtendedActor).sendOtp(phoneNumber);
      } catch (error: any) {
        // Preserve backend error messages for display
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('OTP sent successfully');
    },
    onError: (error: any) => {
      // Use getClientAuthErrorMessage for consistent error display in toasts
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();

  return useMutation({
    mutationFn: async (data: { phoneNumber: string; otp: string; ipAddress?: string }) => {
      if (!actor) throw new Error('Service unavailable. Please try again later.');
      
      try {
        if (typeof (actor as ExtendedActor).verifyOtpAndAuthenticate !== 'function') {
          throw new Error('OTP verification is not available. Please use password login.');
        }
        
        const sessionToken = await (actor as ExtendedActor).verifyOtpAndAuthenticate(
          data.phoneNumber,
          data.otp,
          data.ipAddress ? [data.ipAddress] : []
        );
        
        setClientToken(sessionToken);
        return sessionToken;
      } catch (error: any) {
        // Preserve backend error messages for display
        throw error;
      }
    },
    onError: (error: any) => {
      // Use getClientAuthErrorMessage for consistent error display in toasts
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    },
  });
}

export function useClientLogout() {
  const { actor } = useActor();
  const { sessionToken, clearClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !sessionToken) return;
      
      try {
        if (typeof (actor as ExtendedActor).clientLogout === 'function') {
          await (actor as ExtendedActor).clientLogout(sessionToken);
        }
      } catch (error) {
        console.error('Backend logout failed:', error);
        // Continue with local cleanup even if backend call fails
      }
    },
    onSuccess: () => {
      clearClientToken();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      // Still clear local state even if backend call fails
      clearClientToken();
      queryClient.clear();
      const errorMessage = error?.message || 'Logout failed';
      toast.error(errorMessage);
    },
  });
}

export function useChangeClientPassword() {
  const { actor } = useActor();
  const { sessionToken } = useClientSession();

  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      if (!actor || !sessionToken) throw new Error('Authentication required');
      
      try {
        if (typeof (actor as ExtendedActor).changeClientPassword !== 'function') {
          throw new Error('Password change is not available. Please contact support.');
        }
        
        return await (actor as ExtendedActor).changeClientPassword(
          sessionToken,
          data.currentPassword,
          data.newPassword
        );
      } catch (error: any) {
        // Preserve backend error messages for display
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      // Use getClientAuthErrorMessage for consistent error display in toasts
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    },
  });
}

export function useCreateClientAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      identifier: string;
      password: string;
      linkedPrincipal: Principal;
      email?: string;
      mobile?: string;
      companyName: string;
      gstNumber: string;
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createClientAccount(
        data.identifier,
        data.password,
        data.linkedPrincipal,
        data.email || null,
        data.mobile || null,
        data.companyName,
        data.gstNumber,
        data.address
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client account created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to create client account';
      toast.error(errorMessage);
    },
  });
}

export function useProvisionClientAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      identifier: string;
      password: string;
      linkedPrincipal: Principal;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.provisionClientAccount(
        data.identifier,
        data.password,
        data.linkedPrincipal
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client account provisioned successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to provision client account';
      toast.error(errorMessage);
    },
  });
}

// Admin client profile management (for AdminClientForm)
export function useAdminAddOrUpdateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      clientId: Principal;
      profile: UserProfile;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(data.profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client profile updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update client profile';
      toast.error(errorMessage);
    },
  });
}
