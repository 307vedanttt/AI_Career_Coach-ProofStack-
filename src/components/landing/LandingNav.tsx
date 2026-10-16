import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HealthChip, CounterChip } from '../ui/Chips';
import { Button } from '../ui/Button';
import { ArrowRight, Terminal } from 'lucide-react';

export const LandingNav: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'h-14 bg-[#0A0C0F]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/60'
          : 'h-16 bg-transparent border-b border-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark & Version */}
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="flex items-center space-x-2.5 text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
            aria-label="ProofStack Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ProofStack
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#9AA3AE] tracking-normal uppercase">
                v2.4
              </span>
            </span>
          </Link>
        </div>

        {/* Center Nav Links (Hidden on small screens) */}
        <nav
          className="hidden md:flex items-center space-x-6 text-xs font-mono text-[#9AA3AE]"
          aria-label="Main Navigation"
        >
          <a
            href="#problem"
            className="hover:text-white transition-colors focus:outline-none focus:text-white"
          >
            The Problem
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors focus:outline-none focus:text-white"
          >
            How It Works
          </a>
          <a
            href="#capabilities"
            className="hover:text-white transition-colors focus:outline-none focus:text-white"
          >
            Capabilities
          </a>
          <a
            href="#metrics"
            className="hover:text-white transition-colors focus:outline-none focus:text-white"
          >
            Metrics
          </a>
          <Link
            to="/styleguide"
            className="hover:text-emerald-400 transition-colors focus:outline-none focus:text-emerald-400"
          >
            Styleguide
          </Link>
        </nav>

        {/* Right Status Indicators & CTA */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden lg:flex items-center space-x-2">
            <HealthChip label="GitHub" isHealthy={true} />
            <HealthChip label="Webhook" isHealthy={true} />
            <HealthChip label="Model" isHealthy={true} />
          </div>

          <div className="hidden sm:block">
            <CounterChip label="Hollow signals refused" count={14} variant="attack" />
          </div>

          <Button
            variant="solid_paper"
            size="sm"
            onClick={() => {
              const el = document.getElementById('cta-receipt');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Analyze my repository"
            icon={<ArrowRight className="w-3.5 h-3.5 text-[#14171A]" />}
          >
            Analyze Repo
          </Button>
        </div>
      </div>
    </header>
  );
};
