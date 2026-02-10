import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

const ADMIN_TOKEN_KEY = 'dfc_admin_token';

// Generate a random session token
function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function useAdminSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // Validate stored token on mount and actor change
  useEffect(() => {
    async function validateToken() {
      if (!actor || !adminToken) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        // Try to use the token with a simple admin query
        await actor.getAllClients(adminToken);
        setIsValid(true);
      } catch (error) {
        // Token is invalid, clear it
        setIsValid(false);
        setAdminToken(null);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [actor, adminToken]);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!actor) {
      return { success: false, error: 'Service not available' };
    }

    try {
      const token = generateToken();
      await actor.adminLogin(password, token);
      
      // Store token
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      setAdminToken(token);
      setIsValid(true);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('Invalid password')) {
        return { success: false, error: 'Wrong password' };
      } else if (errorMessage.includes('Too many login attempts')) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }
      
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    if (actor && adminToken) {
      try {
        await actor.adminLogout(adminToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local state
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setIsValid(false);
    
    // Clear all cached queries
    queryClient.clear();
  };

  return {
    adminToken,
    isAuthenticated: isValid,
    isValidating,
    login,
    logout,
  };
}
