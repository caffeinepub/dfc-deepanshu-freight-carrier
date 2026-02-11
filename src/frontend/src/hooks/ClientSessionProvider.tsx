import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const CLIENT_SESSION_KEY = 'dfc_client_session_token';

interface ClientSessionContextType {
  sessionToken: string | null;
  isAuthenticated: boolean;
  setClientToken: (token: string) => void;
  clearClientToken: () => void;
}

const ClientSessionContext = createContext<ClientSessionContextType | undefined>(undefined);

export function ClientSessionProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CLIENT_SESSION_KEY);
      const validToken = stored && stored.trim() ? stored.trim() : null;
      return validToken;
    }
    return null;
  });

  const setClientToken = (token: string) => {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
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

  return (
    <ClientSessionContext.Provider
      value={{
        sessionToken,
        isAuthenticated,
        setClientToken,
        clearClientToken,
      }}
    >
      {children}
    </ClientSessionContext.Provider>
  );
}

export function useClientSession() {
  const context = useContext(ClientSessionContext);
  if (context === undefined) {
    throw new Error('useClientSession must be used within a ClientSessionProvider');
  }
  return context;
}
