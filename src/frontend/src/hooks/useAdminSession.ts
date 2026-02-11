import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

// Type assertion helper
type ExtendedActor = any;

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
        // Try to call a protected method to validate the token
        await (actor as ExtendedActor).getAllClients(adminToken);
      } catch (error: any) {
        console.error('Token validation failed:', error);
        // Clear token if validation fails
        if (error?.message?.includes('Invalid') || error?.message?.includes('expired')) {
          clearAdminToken();
        }
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

    const token = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // Check if adminLogin method exists
      if (typeof (actor as ExtendedActor).adminLogin !== 'function') {
        throw new Error('Service unavailable. Please contact support.');
      }

      await (actor as ExtendedActor).adminLogin(password, token);
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      setAdminToken(token);
      return token;
    } catch (error: any) {
      console.error('Admin login failed:', error);
      
      // Convert backend errors to user-friendly messages
      const errorMessage = error?.message || String(error);
      
      // Method-missing / service-unavailable detection
      if (errorMessage.includes('not a function') || errorMessage.includes('has no method')) {
        throw new Error('Service unavailable. Please contact support.');
      }
      
      // Preserve already-English, user-actionable backend error messages
      // These are controlled error messages from the backend
      if (
        errorMessage.includes('Invalid password') ||
        errorMessage.includes('Incorrect password') ||
        errorMessage.includes('Invalid or expired') ||
        errorMessage.includes('session token') ||
        errorMessage.includes('Too many') ||
        errorMessage.includes('rate limit')
      ) {
        // Backend already provided a clear English message - use it directly
        throw new Error(errorMessage);
      }
      
      // Map technical/canister errors to service unavailable
      if (
        errorMessage.includes('canister') ||
        errorMessage.includes('service') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout')
      ) {
        throw new Error('Service unavailable. Please try again later.');
      }
      
      // If backend trapped with "Unauthorized", it's likely a password issue
      if (errorMessage.includes('Unauthorized')) {
        throw new Error('Invalid password. Please try again.');
      }
      
      // For any other backend error, preserve the original message if it looks user-friendly
      // (doesn't contain technical jargon)
      if (
        !errorMessage.includes('trap') &&
        !errorMessage.includes('reject') &&
        !errorMessage.includes('call') &&
        errorMessage.length < 200
      ) {
        throw new Error(errorMessage);
      }
      
      // Generic fallback only for truly unknown errors
      throw new Error('Login failed. Please check your password and try again.');
    }
  };

  const logout = async () => {
    if (!actor || !adminToken) return;

    try {
      // Try to call backend logout if available
      if (typeof (actor as ExtendedActor).adminLogout === 'function') {
        await (actor as ExtendedActor).adminLogout(adminToken);
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
