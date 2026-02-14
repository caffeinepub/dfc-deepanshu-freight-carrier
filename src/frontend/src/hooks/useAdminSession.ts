import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import type { AdminLoginResult } from '@/backend';

const ADMIN_TOKEN_KEY = 'admin_session_token';

export function useAdminSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
  });
  const [isValidating, setIsValidating] = useState(false);

  // Validate token on mount and actor change
  useEffect(() => {
    if (!actor || !adminToken) return;

    const validateToken = async () => {
      setIsValidating(true);
      try {
        const result = await actor.validateAdminSession(adminToken);
        if (!result) {
          clearAdminToken();
        }
      } catch (error: any) {
        console.error('Token validation failed:', error);
        clearAdminToken();
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [actor, adminToken]);

  const login = async (password: string) => {
    if (!actor) {
      throw new Error('Service unavailable. Please try again later.');
    }

    try {
      // Check if adminLogin method exists
      if (typeof actor.adminLogin !== 'function') {
        throw new Error('Service unavailable. Please contact support.');
      }

      // Call backend adminLogin - returns AdminLoginResult variant
      const result: AdminLoginResult = await actor.adminLogin(password);
      
      // Handle the variant result
      if (result.__kind__ === 'invalidPassword') {
        throw new Error('Invalid password. Please try again.');
      }
      
      if (result.__kind__ === 'success') {
        const token = result.success;
        
        if (!token || token.trim() === '') {
          throw new Error('Service unavailable. Please contact support.');
        }
        
        // Store the token returned from backend
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        setAdminToken(token);
        return token;
      }
      
      // Unexpected result format
      throw new Error('Service unavailable. Please contact support.');
    } catch (error: any) {
      console.error('Admin login failed:', error);
      
      // If error is already thrown from variant handling above, preserve it
      if (error?.message === 'Invalid password. Please try again.') {
        throw error;
      }
      
      // Convert backend errors to user-friendly messages
      const errorMessage = error?.message || String(error);
      
      // Method-missing / service-unavailable detection
      if (errorMessage.includes('not a function') || errorMessage.includes('has no method')) {
        throw new Error('Service unavailable. Please contact support.');
      }
      
      // Map technical/canister errors to service unavailable
      if (
        errorMessage.includes('canister') ||
        errorMessage.includes('service') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('Candid') ||
        errorMessage.includes('argument') ||
        errorMessage.includes('decode') ||
        errorMessage.includes('encode') ||
        errorMessage.includes('unavailable') ||
        errorMessage.includes('unreachable') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('connection')
      ) {
        throw new Error('Service unavailable. Please try again later.');
      }
      
      // Generic fallback for unknown errors - use service unavailable instead of invalid password
      throw new Error('Service unavailable. Please try again later.');
    }
  };

  const logout = async () => {
    if (!actor || !adminToken) return;

    try {
      // Try to call backend logout if available
      if (typeof (actor as any).adminLogout === 'function') {
        await (actor as any).adminLogout(adminToken);
      }
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Continue with local cleanup even if backend call fails
    } finally {
      clearAdminToken();
      queryClient.clear();
    }
  };

  const clearAdminToken = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
  };

  return {
    adminToken,
    isAuthenticated: !!adminToken,
    isValidating,
    login,
    logout,
    clearAdminToken,
  };
}
