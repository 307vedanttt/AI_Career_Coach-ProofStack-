import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';
export const LandingFooter = () => {
    return (<footer className="w-full bg-[#07090C] border-t border-white/[0.08] py-16 px-4 sm:px-6 lg:px-8 relative z-20" role="contentinfo">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Left: Wordmark & Purpose */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-3.5 h-3.5" aria-hidden="true"/>
            </div>
            <span className="font-sans text-base font-bold text-white tracking-tight">ProofStack</span>
            <span className="font-mono text-[10px] text-[#9AA3AE] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase">
              v2.4
            </span>
          </div>
          <p className="font-mono text-xs text-[#9AA3AE] max-w-sm leading-relaxed">
            Crafted for engineers and recruiters who value verified code over resume buzzwords.
          </p>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center md:justify-center space-x-6 font-mono text-xs text-[#9AA3AE]" aria-label="Footer Navigation">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#capabilities" className="hover:text-white transition-colors">
            Capabilities
          </a>
          <Link to="/styleguide" className="hover:text-emerald-400 transition-colors">
            Styleguide
          </Link>
        </nav>

        {/* Right: Honest Notice */}
        <div className="md:text-right">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] font-mono text-[11px] text-[#9AA3AE]">
            Evidence of use, not a ranking of people.
          </span>
        </div>
      </div>
    </footer>);
};
