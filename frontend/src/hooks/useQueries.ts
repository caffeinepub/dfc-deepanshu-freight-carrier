import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';
import { useClientSession } from './ClientSessionProvider';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import type {
  Shipment,
  Invoice,
  UserProfile,
  ClientAccount,
  AllClientsResponse,
  Variant_invalidPhone_success_rateLimited,
} from '../backend';

// ============================================================================
// Client Authentication Hooks
// ============================================================================

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
      if (!actor) throw new Error('Backend service is not available');

      const result = await actor.clientSignup(
        data.email || null,
        data.mobile || null,
        data.password,
        data.companyName,
        data.gstNumber,
        data.address
      );

      if ('success' in result && result.__kind__ === 'success') {
        return result.success;
      }

      if ('emailExists' in result && result.__kind__ === 'emailExists') {
        throw new Error('An account with this email already exists');
      }

      if ('mobileExists' in result && result.__kind__ === 'mobileExists') {
        throw new Error('An account with this mobile number already exists');
      }

      if ('invalidInput' in result && result.__kind__ === 'invalidInput') {
        throw new Error(result.invalidInput || 'Invalid input provided');
      }

      throw new Error('Signup failed. Please try again.');
    },
  });
}

export function useClientLogin() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { identifier: string; password: string }) => {
      if (!actor) throw new Error('Backend service is not available');

      const result = await actor.clientPasswordLogin(
        credentials.identifier,
        credentials.password
      );

      if ('success' in result && result.__kind__ === 'success') {
        return result.success;
      }

      if ('invalidCredentials' in result && result.__kind__ === 'invalidCredentials') {
        throw new Error('Invalid email/mobile or password');
      }

      if ('rateLimited' in result && result.__kind__ === 'rateLimited') {
        throw new Error('Too many login attempts. Please try again later.');
      }

      throw new Error('Login failed. Please try again.');
    },
    onSuccess: (data) => {
      setClientToken(data.sessionToken);
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      queryClient.invalidateQueries({ queryKey: ['clientShipments'] });
      queryClient.invalidateQueries({ queryKey: ['clientInvoices'] });
    },
  });
}

export function useSendOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Backend service is not available');

      const result = await actor.sendOtp(phoneNumber);

      if (result === 'success') {
        return { success: true };
      }

      if (result === 'rateLimited') {
        throw new Error('Too many OTP requests. Please try again later.');
      }

      if (result === 'invalidPhone') {
        throw new Error('Invalid phone number');
      }

      throw new Error('Failed to send OTP. Please try again.');
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();
  const { setClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { phoneNumber: string; otp: string }) => {
      if (!actor) throw new Error('Backend service is not available');

      const result = await actor.verifyOtp(data.phoneNumber, data.otp);

      if ('success' in result && result.__kind__ === 'success') {
        return result.success;
      }

      if ('invalidOtp' in result && result.__kind__ === 'invalidOtp') {
        throw new Error('Invalid OTP. Please check and try again.');
      }

      if ('expired' in result && result.__kind__ === 'expired') {
        throw new Error('OTP has expired. Please request a new one.');
      }

      if ('notFound' in result && result.__kind__ === 'notFound') {
        throw new Error('No account found with this phone number');
      }

      throw new Error('OTP verification failed. Please try again.');
    },
    onSuccess: (data) => {
      setClientToken(data.sessionToken);
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      queryClient.invalidateQueries({ queryKey: ['clientShipments'] });
      queryClient.invalidateQueries({ queryKey: ['clientInvoices'] });
    },
  });
}

export function useGetClientAccountStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { sessionToken, isAuthenticated } = useClientSession();

  const query = useQuery({
    queryKey: ['clientAccountStatus', sessionToken],
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      if (!sessionToken) return null;

      const result = await actor.getClientAccountStatus(sessionToken);

      if ('authenticated' in result && result.__kind__ === 'authenticated') {
        return {
          clientId: result.authenticated.clientId,
          profile: result.authenticated.profile,
          isFirstLogin: result.authenticated.isFirstLogin,
        };
      }

      if ('unauthenticated' in result && result.__kind__ === 'unauthenticated') {
        return null;
      }

      return null;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !!sessionToken,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// ============================================================================
// Client Portal Data Access Hooks
// ============================================================================

export function useGetClientShipments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { sessionToken, isAuthenticated } = useClientSession();

  return useQuery<Shipment[]>({
    queryKey: ['clientShipments', sessionToken],
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      if (!sessionToken) throw new Error('No session token available');

      const result = await actor.getClientShipmentsBySessionToken(sessionToken);

      if ('success' in result && result.__kind__ === 'success') {
        return result.success;
      }

      if ('noSessionToken' in result && result.__kind__ === 'noSessionToken') {
        throw new Error('Session expired. Please log in again.');
      }

      if ('notLinked' in result && result.__kind__ === 'notLinked') {
        throw new Error('Your account is not linked to a client profile. Please contact the administrator.');
      }

      throw new Error('Failed to load shipments');
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !!sessionToken,
  });
}

export function useGetClientInvoices() {
  const { actor, isFetching: actorFetching } = useActor();
  const { sessionToken, isAuthenticated } = useClientSession();

  return useQuery<Invoice[]>({
    queryKey: ['clientInvoices', sessionToken],
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      if (!sessionToken) throw new Error('No session token available');

      const result = await actor.getClientInvoicesBySessionToken(sessionToken);

      if ('success' in result && result.__kind__ === 'success') {
        return result.success;
      }

      if ('noSessionToken' in result && result.__kind__ === 'noSessionToken') {
        throw new Error('Session expired. Please log in again.');
      }

      if ('notLinked' in result && result.__kind__ === 'notLinked') {
        throw new Error('Your account is not linked to a client profile. Please contact the administrator.');
      }

      throw new Error('Failed to load invoices');
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !!sessionToken,
  });
}

export function useClientLogout() {
  const { clearClientToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearClientToken();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useChangeClientPassword() {
  const { actor } = useActor();
  const { sessionToken } = useClientSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!sessionToken) throw new Error('No session token available');

      try {
        await (actor as any).clientChangePassword(
          sessionToken,
          data.currentPassword,
          data.newPassword
        );
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Password change feature is not available yet. Please contact support.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientAccountStatus'] });
      toast.success('Password changed successfully');
    },
  });
}

// ============================================================================
// Admin Session Hooks
// ============================================================================

export function useAdminLogin() {
  const { login } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const token = await login(password);
      return token;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
    },
  });
}

export function useValidateAdminSession() {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken, isAuthenticated } = useAdminSession();

  return useQuery({
    queryKey: ['validateAdminSession', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return null;
      const validToken = await actor.validateAdminSession(adminToken);
      return validToken;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !!adminToken,
    retry: false,
  });
}

// ============================================================================
// Admin Data Access Hooks
// ============================================================================

export function useGetAllClients() {
  const { actor, isFetching: actorFetching } = useActor();
  const { adminToken, isAuthenticated } = useAdminSession();

  return useQuery<AllClientsResponse | null>({
    queryKey: ['allClients', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return null;
      const data = await actor.getAllClients(adminToken);
      return data;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !!adminToken,
  });
}

export function useRepairUnlinkedClients() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      const count = await actor.repairMissingLinkedPrincipals();
      return Number(count);
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      if (count > 0) {
        toast.success(`Successfully repaired ${count} unlinked client account${count !== 1 ? 's' : ''}`);
      } else {
        toast.info('No unlinked accounts found');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to repair client accounts');
    },
  });
}

export function useAdminAddOrUpdateClient() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      principalId: string;
      companyName: string;
      gstNumber: string;
      address: string;
      mobile: string;
    }) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      const principal = Principal.fromText(data.principalId);
      const profile: UserProfile = {
        companyName: data.companyName,
        gstNumber: data.gstNumber,
        address: data.address,
        mobile: data.mobile,
      };

      try {
        await (actor as any).adminUpdateClientProfile(adminToken, principal, profile);
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available. Please contact support.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      toast.success('Client profile updated successfully');
    },
  });
}

export function useCreateClientAccount() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      identifier: string;
      password: string;
      linkedPrincipal: string;
      email?: string;
      mobile?: string;
      companyName: string;
      gstNumber: string;
      address: string;
    }) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      const result = await actor.createClientAccount(
        data.identifier,
        data.password,
        data.email || null,
        data.mobile || null,
        data.companyName,
        data.gstNumber,
        data.address
      );

      if (!result) {
        throw new Error('Failed to create client account');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
    },
  });
}

export function useProvisionClientAccount() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      identifier: string;
      password: string;
      linkedPrincipal: string;
    }) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      await actor.provisionClientAccount(
        data.identifier,
        data.password
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
    },
  });
}

// ============================================================================
// Admin Shipment Management Hooks
// ============================================================================

export function useGetShipmentsByClient() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Shipment[]>({
    queryKey: ['shipmentsByClient', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      try {
        const result = await (actor as any).getShipmentsByClient(adminToken);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
        return [];
      }
    },
    enabled: !!actor && !!adminToken,
  });
}

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
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      try {
        await (actor as any).createShipment(
          adminToken,
          data.trackingID,
          data.status,
          data.location,
          data.client,
          data.coordinates || undefined
        );
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipmentsByClient'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      toast.success('Shipment created successfully');
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
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      try {
        await (actor as any).updateShipment(
          adminToken,
          data.trackingID,
          data.status,
          data.location,
          data.coordinates || undefined
        );
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipmentsByClient'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      toast.success('Shipment updated successfully');
    },
  });
}

export function useDeleteShipment() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackingID: string) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      try {
        await (actor as any).deleteShipment(adminToken, trackingID);
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipmentsByClient'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      toast.success('Shipment deleted successfully');
    },
  });
}

// ============================================================================
// Admin Invoice Management Hooks
// ============================================================================

export function useGetInvoicesByClient() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Invoice[]>({
    queryKey: ['invoicesByClient', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      try {
        const result = await (actor as any).getInvoicesByClient(adminToken);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
        return [];
      }
    },
    enabled: !!actor && !!adminToken,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      invoiceNo: number;
      amount: number;
      status: string;
      dueDate: bigint;
      client: Principal;
    }) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      try {
        await (actor as any).createInvoice(
          adminToken,
          BigInt(data.invoiceNo),
          BigInt(data.amount),
          data.status,
          data.dueDate,
          data.client
        );
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoicesByClient'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      toast.success('Invoice created successfully');
    },
  });
}

export function useUpdateInvoice() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      invoiceNo: number;
      amount: number;
      status: string;
      dueDate: bigint;
    }) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      try {
        await (actor as any).updateInvoice(
          adminToken,
          BigInt(data.invoiceNo),
          BigInt(data.amount),
          data.status,
          data.dueDate
        );
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoicesByClient'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      toast.success('Invoice updated successfully');
    },
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceNo: number) => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      try {
        await (actor as any).deleteInvoice(adminToken, BigInt(invoiceNo));
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoicesByClient'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      toast.success('Invoice deleted successfully');
    },
  });
}

export function useExportAllInvoices() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      if (!adminToken) throw new Error('Admin session required');

      try {
        const result = await (actor as any).exportAllInvoices(adminToken);
        return result as string[];
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('has no method')) {
          throw new Error('Feature not available');
        }
        throw error;
      }
    },
  });
}

// ============================================================================
// Admin Analytics Hooks
// ============================================================================

export function useGetRevenueData() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Array<{ date: string; amount: number }>>({
    queryKey: ['revenueData', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      try {
        const result = await (actor as any).getRevenueData(adminToken);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
        return [];
      }
    },
    enabled: !!actor && !!adminToken,
  });
}

export function useGetLoginHistory() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Array<{ identifier: string; clientId: string; loginTime: bigint; ipAddress: string | null }>>({
    queryKey: ['loginHistory', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      try {
        const result = await (actor as any).getLoginHistory(adminToken);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch login history:', error);
        return [];
      }
    },
    enabled: !!actor && !!adminToken,
  });
}

// ============================================================================
// Admin Configuration Hooks (Stub implementations)
// ============================================================================

export function useSetMsg91ApiKey() {
  return useMutation({
    mutationFn: async (_apiKey: string) => {
      throw new Error('MSG91 API key configuration has been removed from the backend');
    },
  });
}

export function useIsMsg91ApiKeyStored() {
  return useQuery({
    queryKey: ['msg91ApiKeyStored'],
    queryFn: async () => false,
    enabled: false,
  });
}

export function useVerifyMsg91Token() {
  return useMutation({
    mutationFn: async (_apiKey: string) => {
      throw new Error('MSG91 token verification has been removed from the backend');
    },
  });
}

export function useIsGoogleApiKeyConfigured() {
  return useQuery({
    queryKey: ['googleApiKeyConfigured'],
    queryFn: async () => false,
    enabled: false,
  });
}

export function useStoreGoogleApiKey() {
  return useMutation({
    mutationFn: async (_apiKey: string) => {
      throw new Error('Google API key storage has been removed from the backend');
    },
  });
}

export function useGetAllShipmentsForMap() {
  const { actor } = useActor();
  const { adminToken } = useAdminSession();

  return useQuery<Shipment[]>({
    queryKey: ['allShipmentsForMap', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      try {
        const result = await (actor as any).getAllShipmentsForMap(adminToken);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch shipments for map:', error);
        return [];
      }
    },
    enabled: !!actor && !!adminToken,
  });
}
