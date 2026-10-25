import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { setMockSignedIn } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
export const RedirectingPage = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const headingRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    useEffect(() => {
        headingRef.current?.focus();
        // Simulate OAuth handshake completion in mock mode
        const timer = setTimeout(async () => {
            await setMockSignedIn(true);
            if (auth?.refreshUser) {
                await auth.refreshUser();
            }
            navigate('/app', { replace: true });
        }, 1200);
        return () => clearTimeout(timer);
    }, [navigate, auth]);
    return (<div className="min-h-screen bg-[#0A0C0F] text-[#F7F5F0] flex flex-col items-center justify-center p-6 relative select-none">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden="true"/>

      <div className="relative z-10 w-full max-w-md rounded-[18px] bg-[#12161B] border border-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        {/* Pulsing Connector Animation */}
        <div className="flex items-center justify-center gap-6 mb-8 py-4">
          {/* GitHub Icon Node */}
          <div className="w-14 h-14 rounded-[12px] bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </div>

          {/* Pulsing Connector Line */}
          <div className="relative w-24 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="absolute top-0 bottom-0 w-8 bg-[#34D399] rounded-full shadow-[0_0_12px_#34D399]" initial={shouldReduceMotion ? { left: '33%' } : { left: '-30%' }} animate={shouldReduceMotion
            ? { opacity: 1 }
            : { left: ['-30%', '100%'] }} transition={shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
            }}/>
          </div>

          {/* ProofStack Icon Node */}
          <div className="w-14 h-14 rounded-[12px] bg-[#1F8A5B]/20 border border-[#1F8A5B]/40 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7 text-[#34D399]"/>
          </div>
        </div>

        {/* Status text */}
        <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white mb-2 tracking-tight focus:outline-none">
          Redirecting to GitHub
        </h1>
        <p className="text-xs text-[#9AA3AE] leading-relaxed mb-6 font-mono">
          Verifying ephemeral handshake tokens and enclave credentials...
        </p>

        {/* Micro progress indicator */}
        <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#34D399] bg-[#1F8A5B]/15 px-3 py-1 rounded-full border border-[#1F8A5B]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"/>
          <span>Handshake in progress</span>
        </div>
      </div>
    </div>);
};
