import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, deleteMyData as apiDeleteMyData, loginWithApiKey as apiLoginWithApiKey, } from '../lib/api';
export const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refreshUser = useCallback(async () => {
        try {
            setLoading(true);
            const session = await getCurrentUser();
            setUser(session);
            setError(null);
            return session;
        }
        catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            setUser(null);
            return null;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const loginWithApiKey = useCallback(async (apiKey, username) => {
        try {
            setLoading(true);
            const session = await apiLoginWithApiKey(apiKey, username);
            setUser(session);
            setError(null);
            return session;
        }
        catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            return null;
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);
    const logout = useCallback(async () => {
        try {
            await logoutUser();
        }
        finally {
            setUser(null);
        }
    }, []);
    const deleteMyData = useCallback(async () => {
        try {
            await apiDeleteMyData();
        }
        finally {
            setUser(null);
        }
    }, []);
    return (<AuthContext.Provider value={{
            user,
            loading,
            error,
            refreshUser,
            loginWithApiKey,
            logout,
            deleteMyData,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            user: null,
            loading: false,
            error: null,
            refreshUser: async () => null,
            loginWithApiKey: async () => null,
            logout: async () => { },
            deleteMyData: async () => { },
        };
    }
    return context;
};
