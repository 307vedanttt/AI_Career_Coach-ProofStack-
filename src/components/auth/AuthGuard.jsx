import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export const AuthGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (<div className="min-h-screen bg-[#0A0C0F] text-[#F7F5F0] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3 p-4 rounded-[8px] bg-[#12161B] border border-white/10">
          <span className="w-2.5 h-2.5 border-2 border-[#34D399] border-t-transparent rounded-full animate-spin"/>
          <span className="text-[#9AA3AE]">Verifying session enclave...</span>
        </div>
      </div>);
    }
    // Check demo mode per Master Build Prompt Section 11
    const isDemo = new URLSearchParams(location.search).get('demo') === '1' ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('ps_demo_mode') === 'true') ||
        (typeof document !== 'undefined' && document.documentElement.classList.contains('demo-mode'));
    if (!user && !isDemo) {
        return <Navigate to="/login" replace state={{ from: location }}/>;
    }
    return <>{children}</>;
};
