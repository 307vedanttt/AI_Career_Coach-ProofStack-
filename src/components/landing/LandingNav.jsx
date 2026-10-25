import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Menu, X, Flame, Sparkles, ExternalLink } from 'lucide-react';
import { ProofStackLogo } from '../common/ProofStackLogo';

export const LandingNav = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setIsScrolled(offset > 40);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMobileLinkClick = (targetId) => {
        setIsMobileMenuOpen(false);
        if (targetId && window.lenis) {
            const el = document.querySelector(targetId);
            if (el) {
                window.lenis.scrollTo(el, { offset: -70 });
            }
        }
    };

    return (<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isMobileMenuOpen
            ? 'bg-[#0A0C0F] border-b border-white/[0.12] shadow-2xl shadow-black'
            : isScrolled
              ? 'h-14 bg-[#0A0C0F]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/60'
              : 'h-16 bg-transparent border-b border-transparent'}`} role="banner">
      <div className="max-w-7xl mx-auto h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark & Version */}
        <div className="flex items-center space-x-3">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-0.5" aria-label="ProofStack Homepage">
            <ProofStackLogo size="sm" />
          </Link>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-5 text-xs font-mono text-[#9AA3AE]" aria-label="Main Navigation">
          <a href="#capabilities" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors focus:outline-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Feature Lab</span>
          </a>
          <Link to="/resume" className="hover:text-rose-400 transition-colors focus:outline-none flex items-center gap-1">
            <span>🔥 Truth Roast</span>
          </Link>
          <a href="#how-it-works" className="hover:text-white transition-colors focus:outline-none focus:text-white">
            How It Works
          </a>
          <Link to="/app" className="hover:text-white transition-colors focus:outline-none focus:text-white">
            Live App
          </Link>
          <Link to="/how-we-judge" className="hover:text-emerald-400 transition-colors focus:outline-none focus:text-emerald-400">
            Judge Rubric
          </Link>
        </nav>

        {/* Right Actions & CTA */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <a href="https://github.com/Omb2121/AI-CarrerCoach" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#C4C9D2] hover:text-white hover:bg-white/[0.08] transition-all" aria-label="GitHub Repository">
            <span className="w-2 h-2 rounded-full bg-emerald-400"/>
            <span>GitHub</span>
          </a>

          <Button variant="solid_paper" size="sm" onClick={() => {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('ps_demo_mode', 'true');
            }
            navigate('/app?demo=1');
        }} aria-label="Analyze my repository" icon={<ArrowRight className="w-3.5 h-3.5 text-[#14171A]"/>}>
            <span className="hidden xs:inline">Analyze Repo</span>
            <span className="xs:hidden">Audit</span>
          </Button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0A0C0F] border-t border-white/10 shadow-2xl px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-mono">
            <a 
              href="#capabilities" 
              onClick={() => handleMobileLinkClick('#capabilities')}
              className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Feature Laboratory
              </span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Live</span>
            </a>

            <Link 
              to="/resume" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold"
            >
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                Resume Truth Roast
              </span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Viral</span>
            </Link>

            <a 
              href="#how-it-works" 
              onClick={() => handleMobileLinkClick('#how-it-works')}
              className="p-2.5 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-white/5 transition-colors"
            >
              How It Works
            </a>

            <Link 
              to="/app" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-white/5 transition-colors"
            >
              Live App & Proof Docket
            </Link>

            <Link 
              to="/how-we-judge" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              Judge Rubric & Evaluation
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <a 
              href="https://github.com/Omb2121/AI-CarrerCoach" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-[#C4C9D2]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>GitHub Source</span>
              <ExternalLink className="w-3 h-3 text-[#9AA3AE]" />
            </a>

            <Button 
              variant="solid_paper" 
              size="sm" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.setItem('ps_demo_mode', 'true');
                }
                navigate('/app?demo=1');
              }}
              icon={<ArrowRight className="w-3.5 h-3.5 text-[#14171A]" />}
              className="flex-1 justify-center"
            >
              Analyze Repo
            </Button>
          </div>
        </div>
      )}
    </header>);
};
