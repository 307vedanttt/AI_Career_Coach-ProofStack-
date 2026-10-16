import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

export interface AuthSplitLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  headline: React.ReactNode;
  tagline?: string;
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  leftContent,
  rightContent,
  headline,
  tagline = 'CRYPTOGRAPHIC DOSSIER ENGINE',
}) => {
  return (
    <div className="min-h-screen bg-[#0A0C0F] text-[#F7F5F0] flex flex-col relative overflow-x-hidden selection:bg-[#34D399]/30 selection:text-white">
      {/* Background Dot Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" 
        aria-hidden="true" 
      />

      {/* Ambient Vignette & Corner Glows */}
      <div 
        className="fixed inset-0 pointer-events-none shadow-[inset_0_0_180px_rgba(0,0,0,0.85)]" 
        aria-hidden="true" 
      />
      <div 
        className="fixed -top-40 -left-40 w-96 h-96 bg-[#1F8A5B]/10 rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#6D5BD0]/10 rounded-full blur-[160px] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Top Terminal Header */}
      <header className="relative z-20 w-full border-b border-white/[0.08] bg-[#0A0C0F]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] rounded px-1"
          >
            <div className="w-6 h-6 rounded bg-[#1F8A5B]/20 border border-[#1F8A5B]/40 flex items-center justify-center group-hover:border-[#34D399] transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-white group-hover:text-[#34D399] transition-colors">
              PROOFSTACK
            </span>
          </Link>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-wider text-[#9AA3AE] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
            VERIFICATION TERMINAL
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-[#34D399]">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="font-semibold tracking-wider">ENGINE ONLINE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[#6B7280]">
            <Lock className="w-3.5 h-3.5" />
            <span>TLS SHA-256 [0X9F41C]</span>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main id="main-content" className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8 lg:py-12 items-center">
        {/* Mobile Peeking Header (below 1024px) */}
        <div className="lg:hidden w-full max-w-[460px] mb-6">
          <div className="bg-[#FAF8F3] text-[#14171A] rounded-b-[6px] p-3 text-center sawtooth-top paper-grain shadow-md border-x border-b border-[#E6E1D6]">
            <span className="font-mono text-[11px] font-bold text-[#14171A]">
              PROOFSTACK EVIDENCE LEDGER // AUTH
            </span>
          </div>
        </div>

        {/* Left Side: Proof Side (55% on desktop >= 1024px) */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center px-2 sm:px-6 lg:pr-12 mb-10 lg:mb-0">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#34D399] tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span>{tagline}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              {headline}
            </h1>
          </div>

          <div className="w-full">
            {leftContent}
          </div>
        </div>

        {/* Right Side: Auth Panel (45% on desktop >= 1024px) */}
        <div className="w-full lg:w-[45%] flex items-center justify-center px-2 sm:px-6">
          {rightContent}
        </div>
      </main>

      {/* Bottom Legal / Spec Footer */}
      <footer className="relative z-10 w-full py-4 text-center font-mono text-xs text-[#575D65] border-t border-white/[0.04]">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link to="/how-we-judge" className="hover:text-white transition-colors">
            How we judge
          </Link>
          <span>·</span>
          <span className="hover:text-white transition-colors cursor-default">
            Limits
          </span>
          <span>·</span>
          <Link to="/verify" className="hover:text-white transition-colors">
            SOC2 Type II Attestation
          </Link>
        </div>
      </footer>
    </div>
  );
};
