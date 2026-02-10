import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

const ADMIN_TOKEN_KEY = 'dfc_admin_token';

export function useAdminSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      
      if (!storedToken || !actor) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      try {
        // Simple validation - just check if we can make a call with the token
        // Since there's no dedicated validation endpoint, we'll assume the token is valid
        // and let individual API calls handle authentication errors
        setAdminToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [actor]);

  const login = async (password: string) => {
    if (!actor) throw new Error('Actor not available');
    
    // Generate a random token for the session
    const token = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    try {
      await actor.adminLogin(password, token);
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      setAdminToken(token);
      setIsAuthenticated(true);
      return token;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!actor || !adminToken) return;
    
    try {
      await actor.adminLogout(adminToken);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setAdminToken(null);
      setIsAuthenticated(false);
      queryClient.clear();
    }
  };

  return {
    adminToken,
    isAuthenticated,
    isValidating,
    login,
    logout,
  };
}
