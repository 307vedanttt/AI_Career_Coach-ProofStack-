import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stamp } from '../stamps/Stamp';
import { FileCode, AlertTriangle, FileText, Ban } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ProblemSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stamp1Ref = useRef<HTMLDivElement>(null);
  const stamp2Ref = useRef<HTMLDivElement>(null);
  const stamp3Ref = useRef<HTMLDivElement>(null);
  const stamp4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const ctx = gsap.context(() => {
      const stamps = [
        stamp1Ref.current,
        stamp2Ref.current,
        stamp3Ref.current,
        stamp4Ref.current,
      ].filter(Boolean);

      // Four stamps land one by one on the resume lines, scrubbed by scroll
      stamps.forEach((stamp, index) => {
        gsap.fromTo(
          stamp,
          {
            scale: 2.2,
            opacity: 0,
            rotation: -14,
          },
          {
            scale: 1,
            opacity: 1,
            rotation: -4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${index * 120 + 80} center`,
              end: `top+=${index * 120 + 200} center`,
              scrub: 0.6,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden border-t border-white/[0.06]"
      aria-label="The Problem: Keywords Are Not Evidence"
    >
      {/* Ambient Radial Vignette */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[540px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-20 max-w-3xl mx-auto">
          <span className="font-mono text-xs font-semibold text-[#9AA3AE] tracking-[0.25em] uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10">
            The Problem
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight">
            Keywords are not evidence.
          </h2>
          <p className="text-base text-[#9AA3AE] max-w-xl">
            Anyone can paste trendy framework keywords onto a resume bullet. ProofStack requires
            verifiable repository commits before granting proof status.
          </p>
        </div>

        {/* Split Screen Comparison: Paper Resume Claim vs Dark Code Reality */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Central VS Badge */}
          <div
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#12161B] border border-white/20 text-[#9AA3AE] font-mono text-xs font-bold items-center justify-center shadow-2xl"
            aria-hidden="true"
          >
            VS
          </div>

          {/* LEFT PANEL: Paper Resume Strip (The Claim) */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] bg-[#FAF8F3] text-[#14171A] rounded-xl p-8 sm:p-10 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65)] transform lg:-rotate-2 transition-transform duration-300 hover:rotate-0 border border-[#E6E1D6]">
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#E6E1D6] font-mono text-xs text-[#6B7280]">
                <span className="tracking-wider uppercase font-semibold">Self-Reported Claim</span>
                <span>PDF_REV_04.DOC</span>
              </div>

              {/* Four Claim Lines with Overlaid Stamps */}
              <div className="py-6 space-y-6">
                {/* Line 1: Skilled in SQL */}
                <div className="relative p-3 rounded bg-[#F2EFE9] border border-[#E6E1D6]/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#14171A]">
                      1. Advanced SQLite Persistence
                    </h3>
                    <p className="text-xs font-mono text-[#6B7280]">
                      &quot;Implemented resilient ACID storage schemas&quot;
                    </p>
                  </div>
                  <div ref={stamp1Ref} className="shrink-0 select-none">
                    <Stamp status="not_shown" size="sm" animate={false} />
                  </div>
                </div>

                {/* Line 2: FastAPI architecture */}
                <div className="relative p-3 rounded bg-[#F2EFE9] border border-[#E6E1D6]/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#14171A]">
                      2. Automated Test Assertion Suite
                    </h3>
                    <p className="text-xs font-mono text-[#6B7280]">
                      &quot;Comprehensive integration test invariants&quot;
                    </p>
                  </div>
                  <div ref={stamp2Ref} className="shrink-0 select-none">
                    <Stamp status="refused" size="sm" animate={false} />
                  </div>
                </div>

                {/* Line 3: Production deployment */}
                <div className="relative p-3 rounded bg-[#F2EFE9] border border-[#E6E1D6]/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#14171A]">
                      3. JWT Authentication Protocol
                    </h3>
                    <p className="text-xs font-mono text-[#6B7280]">
                      &quot;Role-based session access enforcement&quot;
                    </p>
                  </div>
                  <div ref={stamp3Ref} className="shrink-0 select-none">
                    <Stamp status="unclear" size="sm" animate={false} />
                  </div>
                </div>

                {/* Line 4: Distributed systems */}
                <div className="relative p-3 rounded bg-[#F2EFE9] border border-[#E6E1D6]/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#14171A]">
                      4. Invariant Assertion Guard
                    </h3>
                    <p className="text-xs font-mono text-[#6B7280]">
                      &quot;100% production-tested invariant coverage&quot;
                    </p>
                  </div>
                  <div ref={stamp4Ref} className="shrink-0 select-none">
                    <Stamp status="hollow" size="sm" animate={false} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 flex items-center justify-between font-mono text-xs text-[#6B7280] border-t border-[#E6E1D6]">
                <span>SELF-REPORTED BULLETS</span>
                <span className="text-[#C2362B] font-bold">UNVERIFIED WITHOUT CODE</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Glass Dark Code Inspection Card (The Proof Reality) */}
          <div className="w-full flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[540px] bg-[#12161B]/80 backdrop-blur-2xl rounded-xl p-8 flex flex-col justify-between shadow-2xl border border-white/[0.08] transform lg:rotate-1 transition-transform duration-300 hover:rotate-0">
              {/* Monospace Inspector Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] font-mono text-xs text-[#9AA3AE]">
                <span className="flex items-center gap-2 text-white">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>WORKSPACE // REPO_AUDIT</span>
                </span>
                <span className="text-emerald-400">commit 0x4F8B72</span>
              </div>

              {/* Repo File Audit Findings */}
              <div className="space-y-3.5 my-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center space-x-3 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-[#FF5C4D] shrink-0" />
                    <span className="font-mono text-xs text-white truncate">tests/test_orders.py</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#FF5C4D]/15 text-[#FF5C4D] font-mono text-[11px] font-bold uppercase">
                    Empty test (no assert)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center space-x-3 min-w-0">
                    <FileText className="w-4 h-4 text-[#F5A524] shrink-0" />
                    <span className="font-mono text-xs text-white truncate">requirements.txt</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#F5A524]/15 text-[#F5A524] font-mono text-[11px] font-bold uppercase">
                    Unused dependency
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Ban className="w-4 h-4 text-[#7C8CA8] shrink-0" />
                    <span className="font-mono text-xs text-white truncate">README.md</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#7C8CA8]/15 text-[#7C8CA8] font-mono text-[11px] font-bold uppercase">
                    README claim only
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center space-x-3 min-w-0">
                    <FileCode className="w-4 h-4 text-[#9AA3AE] shrink-0" />
                    <span className="font-mono text-xs text-[#9AA3AE] truncate">db/schema_migration.py</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    0 call sites in scope
                  </span>
                </div>
              </div>

              {/* Status Verdict */}
              <div className="pt-4 flex items-center justify-between font-mono text-xs border-t border-white/[0.08]">
                <span className="text-[#9AA3AE]">EVIDENCE COVERAGE VERDICT</span>
                <span className="text-[#FF5C4D] font-bold uppercase">4 Gaps Identified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Punchline */}
        <div className="mt-16 text-center">
          <p className="font-display text-2xl text-white font-medium tracking-tight">
            Claims are cheap. Code is not.
          </p>
        </div>
      </div>
    </section>
  );
};
