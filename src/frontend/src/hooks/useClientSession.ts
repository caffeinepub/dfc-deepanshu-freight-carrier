import { useState, useEffect } from 'react';

const CLIENT_SESSION_KEY = 'dfc_client_session_token';

export function useClientSession() {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CLIENT_SESSION_KEY);
      // Only return non-empty, trimmed tokens
      return stored && stored.trim() ? stored.trim() : null;
    }
    return null;
  });

  const setClientToken = (token: string) => {
    // Only store non-empty, trimmed tokens
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      console.error('Attempted to store empty session token');
      return;
    }
    localStorage.setItem(CLIENT_SESSION_KEY, trimmedToken);
    setSessionToken(trimmedToken);
  };

  const clearClientToken = () => {
    localStorage.removeItem(CLIENT_SESSION_KEY);
    setSessionToken(null);
  };

  const isAuthenticated = !!sessionToken && sessionToken.trim().length > 0;

  return {
    sessionToken,
    isAuthenticated,
    setClientToken,
    clearClientToken,
  };
}
