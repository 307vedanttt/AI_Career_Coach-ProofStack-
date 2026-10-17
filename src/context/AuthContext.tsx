import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession } from '../types/api';
import {
  getCurrentUser,
  logoutUser,
  deleteMyData as apiDeleteMyData,
  loginWithApiKey as apiLoginWithApiKey,
} from '../lib/api';

export interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<UserSession | null>;
  loginWithApiKey: (apiKey?: string, username?: string) => Promise<UserSession | null>;
  logout: () => Promise<void>;
  deleteMyData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshUser = useCallback(async (): Promise<UserSession | null> => {
    try {
      setLoading(true);
      const session = await getCurrentUser();
      setUser(session);
      setError(null);
      return session;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithApiKey = useCallback(async (apiKey?: string, username?: string): Promise<UserSession | null> => {
    try {
      setLoading(true);
      const session = await apiLoginWithApiKey(apiKey, username);
      setUser(session);
      setError(null);
      return session;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const deleteMyData = useCallback(async () => {
    try {
      await apiDeleteMyData();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        refreshUser,
        loginWithApiKey,
        logout,
        deleteMyData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      error: null,
      refreshUser: async () => null,
      loginWithApiKey: async () => null,
      logout: async () => {},
      deleteMyData: async () => {},
    };
  }
  return context;
};
