import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import { AuthReceiptCard } from '../../components/auth/AuthReceiptCard';
import { BackButton } from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
export const LoginPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    useEffect(() => {
        if (!loading && user) {
            navigate('/app', { replace: true });
        }
    }, [user, loading, navigate]);
    return (<div className="min-h-screen w-full bg-[#0A0C0F] text-[#F4F2EC] flex flex-col justify-between desk-grid relative selection:bg-emerald-500/30 selection:text-white overflow-x-hidden">
      {/* Ambient Vignette & Deep Radial Lights */}
      <div className="fixed inset-0 pointer-events-none desk-vignette z-0" aria-hidden="true"/>
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#1F8A5B] opacity-[0.08] rounded-full blur-[160px] pointer-events-none z-0" aria-hidden="true"/>

      {/* Top Header with Prominent Back Button & Brand Logo */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallbackTo="/" label="Home"/>
          <Link to="/" className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors font-mono text-sm font-bold">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-emerald-400"/>
            </div>
            <span className="font-display font-black text-base tracking-tight">ProofStack</span>
          </Link>
        </div>

        <div className="font-mono text-xs text-[#9AA3AE] hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span>DETERMINISTIC VERIFICATION</span>
        </div>
      </header>

      {/* Main Centered Content: Auth Receipt Card with Glowing Ring */}
      <main id="main-content" className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
        <AuthReceiptCard />
      </main>

      {/* Minimal Bottom Footer */}
      <footer className="relative z-20 w-full py-4 text-center font-mono text-[11px] text-[#575D65] border-t border-white/[0.06]">
        <span>ProofStack · Zero-Knowledge Cryptographic Code Receipts · 2026</span>
      </footer>
    </div>);
};
export default LoginPage;
