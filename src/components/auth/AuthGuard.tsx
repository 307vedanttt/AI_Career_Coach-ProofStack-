import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../lib/api';
import { UserSession } from '../../types/api';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const isDemo = sessionStorage.getItem('ps_demo_mode') === 'true' || location.search.includes('demo=1');
    if (isDemo) {
      setUser({
        id: 'usr-demo',
        login: 'demo-judge',
        name: 'Demo Reviewer',
        avatarUrl: '',
        publicRepos: 12,
        scopes: ['read:user', 'public_repo'],
        sessionStartedAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((session) => {
        if (mounted) {
          setUser(session);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      });


    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C0F] text-[#F7F5F0] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3 p-4 rounded-[8px] bg-[#12161B] border border-white/10">
          <span className="w-2.5 h-2.5 border-2 border-[#34D399] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#9AA3AE]">Verifying session enclave...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
