import { useState, useEffect, useRef } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

const ADMIN_TOKEN_KEY = 'admin_session_token';

export function useAdminSession() {
  const { actor, isFetching: isActorFetching } = useActor();
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
  });
  const [isValidating, setIsValidating] = useState(false);
  const validationDoneRef = useRef(false);

  // Validate token on mount and actor change
  useEffect(() => {
    if (!actor || !adminToken || validationDoneRef.current) return;

    const validateToken = async () => {
      setIsValidating(true);
      try {
        const result = await actor.validateAdminSession(adminToken);
        if (!result) {
          clearAdminToken();
        } else {
          validationDoneRef.current = true;
        }
      } catch {
        clearAdminToken();
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [actor]);

  const login = async (password: string): Promise<string> => {
    if (!actor) {
      throw new Error(
        isActorFetching
          ? 'Service is initializing. Please wait a moment and try again.'
          : 'Service unavailable. Please refresh the page and try again.'
      );
    }

    let result;
    try {
      result = await actor.adminLogin(password);
    } catch (networkError: any) {
      const msg: string = networkError?.message ?? String(networkError);
      if (
        msg.includes('canister') ||
        msg.includes('network') ||
        msg.includes('timeout') ||
        msg.includes('fetch') ||
        msg.includes('unavailable')
      ) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw new Error('Service error. Please try again later.');
    }

    if (result.__kind__ === 'success') {
      const token = result.success;
      if (!token || token.trim() === '') {
        throw new Error('Received empty session token. Please try again.');
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      setAdminToken(token);
      validationDoneRef.current = true;
      return token;
    }

    if (result.__kind__ === 'invalidPassword') {
      throw new Error('Incorrect password. Please try again.');
    }

    if (result.__kind__ === 'serverError') {
      throw new Error('Server error. Please try again later.');
    }

    throw new Error('Unexpected response from server. Please try again.');
  };

  const logout = async () => {
    if (!actor || !adminToken) return;

    try {
      await actor.adminLogout(adminToken);
    } catch {
      // Ignore logout errors
    } finally {
      clearAdminToken();
      queryClient.clear();
      validationDoneRef.current = false;
    }
  };

  const clearAdminToken = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    validationDoneRef.current = false;
  };

  return {
    adminToken,
    isAuthenticated: !!adminToken,
    isValidating,
    isActorFetching,
    login,
    logout,
    clearAdminToken,
  };
}
