import React, { Suspense, lazy } from 'react';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { LandingFooter } from '../components/landing/LandingFooter';

// Lazy load below-the-fold sections per performance rule: "lazy-load below the fold"
const ProblemSection = lazy(() =>
  import('../components/landing/ProblemSection').then((m) => ({ default: m.ProblemSection }))
);
const HowItWorksStory = lazy(() =>
  import('../components/landing/HowItWorksStory').then((m) => ({ default: m.HowItWorksStory }))
);
const SignatureFeaturesSection = lazy(() =>
  import('../components/landing/SignatureFeaturesSection').then((m) => ({
    default: m.SignatureFeaturesSection,
  }))
);
const TrustStripSection = lazy(() =>
  import('../components/landing/TrustStripSection').then((m) => ({ default: m.TrustStripSection }))
);
const FinalCtaSection = lazy(() =>
  import('../components/landing/FinalCtaSection').then((m) => ({ default: m.FinalCtaSection }))
);

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0C0F] text-[#F4F2EC] desk-grid relative selection:bg-emerald-500/30 selection:text-white overflow-x-hidden">
      {/* Ambient Radial Vignette & Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none desk-vignette z-0" aria-hidden="true" />
      <div
        className="fixed -top-40 -left-40 w-[750px] h-[750px] bg-[#1F8A5B] opacity-[0.10] rounded-full blur-[140px] pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-[#6D5BD0] opacity-[0.08] rounded-full blur-[160px] pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Sticky Navigation */}
      <LandingNav />

      {/* Main Content Sections */}
      <main id="main-content" className="relative z-10 flex flex-col">
        {/* 1. Hero Section (Immediate load above fold) */}
        <HeroSection />

        {/* Below-the-fold sections with suspense fallback */}
        <Suspense
          fallback={
            <div className="h-64 flex items-center justify-center font-mono text-xs text-[#9AA3AE]">
              Loading verified ledger modules...
            </div>
          }
        >
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
    </div>
  );
};
