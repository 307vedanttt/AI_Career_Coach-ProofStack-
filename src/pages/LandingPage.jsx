import React, { Suspense, lazy, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { EvidenceTicker } from '../components/landing/EvidenceTicker';
import { CreativeParticleWave } from '../components/ui/motion/CreativeParticleWave';
gsap.registerPlugin(ScrollTrigger);
// Lazy load below-the-fold sections per performance rule: "lazy-load below the fold"
const ProblemSection = lazy(() => import('../components/landing/ProblemSection').then((m) => ({ default: m.ProblemSection })));
const HowItWorksStory = lazy(() => import('../components/landing/HowItWorksStory').then((m) => ({ default: m.HowItWorksStory })));
const SignatureFeaturesSection = lazy(() => import('../components/landing/SignatureFeaturesSection').then((m) => ({
    default: m.SignatureFeaturesSection,
})));
const TrustStripSection = lazy(() => import('../components/landing/TrustStripSection').then((m) => ({ default: m.TrustStripSection })));
const FinalCtaSection = lazy(() => import('../components/landing/FinalCtaSection').then((m) => ({ default: m.FinalCtaSection })));
export const LandingPage = () => {
    const shouldReduceMotion = useReducedMotion();
    // High-performance native 60+ FPS compositor scrolling synchronized with GSAP ScrollTrigger
    useEffect(() => {
        // Native scrollTo helper providing full backward-compatibility for in-page anchors
        const nativeScrollHelper = {
            scrollTo: (target, options = {}) => {
                const offset = options.offset || 0;
                if (typeof target === 'string') {
                    const el = document.querySelector(target);
                    if (el) {
                        const top = el.getBoundingClientRect().top + window.pageYOffset + offset;
                        window.scrollTo({ top, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
                    }
                } else if (typeof target === 'number') {
                    window.scrollTo({ top: target, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
                } else if (target instanceof HTMLElement) {
                    const top = target.getBoundingClientRect().top + window.pageYOffset + offset;
                    window.scrollTo({ top, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
                }
            },
        };
        window.lenis = nativeScrollHelper;

        // Ensure GSAP ScrollTrigger calculates exact document dimensions
        ScrollTrigger.refresh();

        // Delegated click handler for in-page anchor links with smooth scroll
        const handleAnchorClick = (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor) {
                const href = anchor.getAttribute('href');
                if (href && href.length > 1) {
                    const targetEl = document.querySelector(href);
                    if (targetEl) {
                        e.preventDefault();
                        nativeScrollHelper.scrollTo(targetEl, { offset: -70 });
                    }
                }
            }
        };
        document.addEventListener('click', handleAnchorClick);

        return () => {
            document.removeEventListener('click', handleAnchorClick);
            delete window.lenis;
        };
    }, [shouldReduceMotion]);
    return (<div className="min-h-screen bg-[#07090E] text-[#EDEDED] desk-grid relative selection:bg-emerald-500/30 selection:text-white overflow-x-hidden">
      {/* Premier ThreeUI-caliber Interactive 3D Particle Wave Field */}
      <CreativeParticleWave className="fixed inset-0 pointer-events-none z-0" opacity={0.88} />

      {/* Atmospheric Directional Workstation Lighting */}
      <div className="fixed inset-0 pointer-events-none desk-vignette z-0" aria-hidden="true"/>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-emerald-500/[0.06] via-cyan-500/[0.03] to-transparent rounded-full blur-[140px] pointer-events-none z-0" aria-hidden="true"/>

      {/* Sticky Navigation */}
      <LandingNav />

      {/* Main Content Sections */}
      <main id="main-content" className="relative z-10 flex flex-col">
        {/* 1. Hero Section (Immediate load above fold) */}
        <HeroSection />

        {/* Dynamic Scroll-Velocity Evidence Stream Ticker */}
        <EvidenceTicker />

        {/* Below-the-fold sections with suspense fallback */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center font-mono text-xs text-[#9AA3AE]">
              
            </div>}>
          {/* 2. The Problem: Keywords Are Not Evidence */}
          <ProblemSection />

          {/* 3. How It Works: Scroll-Driven Pinned Product Tour */}
          <HowItWorksStory />

          {/* 4. Core Capabilities: Four Ways It Proves It */}
          <SignatureFeaturesSection />

          {/* 5. Trust Strip: Monumental Animated Numbers */}
          <TrustStripSection />

          {/* 6. Final CTA Docket Receipt Card */}
          <FinalCtaSection />
        </Suspense>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>);
};
