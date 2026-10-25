import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stamp } from '../stamps/Stamp';
import { FileCode, AlertTriangle, FileText, Ban, ShieldAlert } from 'lucide-react';
import { LaserConnector } from '../ui/motion/LaserConnector';
import { DecryptedText } from '../ui/motion/DecryptedText';
import { BorderBeam } from '../ui/motion/BorderBeam';
import { SpotlightCard } from '../ui/motion/SpotlightCard';
import { ShinyText } from '../ui/motion/ShinyText';
import { BlurText } from '../ui/motion/BlurText';
gsap.registerPlugin(ScrollTrigger);
const AUDIT_FINDINGS = [
    {
        id: 1,
        claimTitle: '1. Advanced SQLite Persistence',
        claimQuote: '"Implemented resilient ACID storage schemas"',
        stampStatus: 'not_shown',
        codeFile: 'db/schema_migration.py',
        gapLabel: '0 call sites in scope',
        gapDetail: 'Schema file present in repo but never imported or invoked by any live route.',
        icon: <FileCode className="w-4 h-4 text-slate-400 shrink-0"/>,
        severityColor: 'text-slate-300 border-slate-700/60 bg-slate-800/40',
    },
    {
        id: 2,
        claimTitle: '2. Automated Test Assertion Suite',
        claimQuote: '"Comprehensive integration test invariants"',
        stampStatus: 'refused',
        codeFile: 'tests/test_orders.py',
        gapLabel: 'Empty test (no assert)',
        gapDetail: 'Test method executes pass with zero assert statements. Decoy coverage pattern.',
        icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0"/>,
        severityColor: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
    },
    {
        id: 3,
        claimTitle: '3. JWT Authentication Protocol',
        claimQuote: '"Role-based session access enforcement"',
        stampStatus: 'unclear',
        codeFile: 'requirements.txt',
        gapLabel: 'Unused dependency',
        gapDetail: 'PyJWT package listed in requirements, but 0 references found in AST parser.',
        icon: <FileText className="w-4 h-4 text-amber-400 shrink-0"/>,
        severityColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    },
    {
        id: 4,
        claimTitle: '4. Invariant Assertion Guard',
        claimQuote: '"100% production-tested invariant coverage"',
        stampStatus: 'hollow',
        codeFile: 'README.md',
        gapLabel: 'README claim only',
        gapDetail: 'Marketing bullet points in README without backing implementation in source tree.',
        icon: <Ban className="w-4 h-4 text-slate-400 shrink-0"/>,
        severityColor: 'text-slate-300 border-slate-600/40 bg-slate-800/40',
    },
];
export const ProblemSection = () => {
    const shouldReduceMotion = useReducedMotion();
    const sectionRef = useRef(null);
    const leftCardRef = useRef(null);
    const rightCardRef = useRef(null);
    const [activeGapIndex, setActiveGapIndex] = useState(0);

    // Natural scroll trigger that updates active gap smoothly as user scrolls past
    useEffect(() => {
        if (shouldReduceMotion) return;

        let lastIndex = -1;
        const scrollTrigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'bottom 40%',
            onUpdate: (self) => {
                const index = Math.min(Math.floor(self.progress * AUDIT_FINDINGS.length), AUDIT_FINDINGS.length - 1);
                if (index !== lastIndex) {
                    lastIndex = index;
                    setActiveGapIndex(index);
                }
            },
        });

        // 3D perspective approach animation for the two cards on enter
        const ctx = gsap.context(() => {
            if (leftCardRef.current && rightCardRef.current) {
                gsap.fromTo(leftCardRef.current, { x: -40, opacity: 0.3 }, {
                    x: 0,
                    opacity: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'top 45%',
                        scrub: 0.5,
                    },
                });
                gsap.fromTo(rightCardRef.current, { x: 40, opacity: 0.3 }, {
                    x: 0,
                    opacity: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'top 45%',
                        scrub: 0.5,
                    },
                });
            }
        }, sectionRef);

        return () => {
            scrollTrigger.kill();
            ctx.revert();
        };
    }, [shouldReduceMotion]);

    // Instant, reliable click handler without scroll conflicts or lag
    const handleManualSelect = (idx) => {
        setActiveGapIndex(idx);
    };

    return (<section id="problem" ref={sectionRef} className="relative scroll-mt-16 overflow-hidden border-t border-white/[0.06] bg-[#0A0C0F] py-20 lg:py-28" aria-label="The Problem: Keywords Are Not Evidence">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center space-y-4 mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400"/>
              <ShinyText text="THE RESUME REALITY CHECK" speed={3.5}/>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight">
              <BlurText text="Keywords get you past ATS." as="span" className="justify-center block"/>
              <ShinyText text="Proof gets you the offer." speed={4} color="emerald"/>
            </h2>
            <p className="text-base text-[#9AA3AE] max-w-xl leading-relaxed font-sans">
              Everyone is a senior architect on paper. ProofStack scans actual git history, commit diffs,
              and test reachability to separate copy-pasted buzzwords from genuine craft.
            </p>

            {/* Interactive Live Audit Progress Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-2">
              <span className="font-mono text-xs text-[#9AA3AE]">Interactive Audit Inspection:</span>
              <div className="flex flex-wrap items-center gap-2 bg-[#12161B] px-3 sm:px-3.5 py-1.5 rounded-full border border-white/10 font-mono text-xs text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#F43F5E]"/>
                <span className="font-semibold text-white">
                  Inspecting Gap {activeGapIndex + 1} of {AUDIT_FINDINGS.length}
                </span>
                <div className="flex items-center gap-1.5 ml-2" aria-label="Audit scrub progress bars">
                  {AUDIT_FINDINGS.map((_, i) => (<button key={i} onClick={() => handleManualSelect(i)} className={`w-3.5 h-1.5 rounded-sm transition-all duration-200 cursor-pointer ${i === activeGapIndex
                ? 'bg-[#F43F5E] shadow-[0_0_8px_#F43F5E] scale-110'
                : 'bg-white/20 hover:bg-white/40'}`} title={`Jump to gap ${i + 1}`}/>))}
                </div>
              </div>
            </div>
          </div>

          {/* Split Screen Comparison: Paper Resume Claim vs Code Reality */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start" style={{ perspective: '1200px' }}>
          {/* Animated Laser Connector Beam */}
          <LaserConnector activeIndex={activeGapIndex} totalItems={AUDIT_FINDINGS.length} isFlagged={true}/>

          {/* Central VS Badge */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#12161B] border border-white/20 text-[#9AA3AE] font-mono text-xs font-bold items-center justify-center shadow-2xl" aria-hidden="true">
            VS
          </div>

          {/* LEFT PANEL: Paper Resume Strip (The Claim) - Rock-solid, zero fluctuation */}
          <div ref={leftCardRef} className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] bg-[#F8FAFC] text-[#0F172A] rounded-2xl p-4 sm:p-8 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65)] border border-[#E2E8F0] relative">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] font-mono text-xs text-[#475569]">
                <span className="tracking-wider uppercase font-semibold">Self-Reported PDF Bullets</span>
                <span className="text-[11px] bg-[#FFF1F2] px-2 py-0.5 rounded border border-[#FECDD3] text-[#E11D48] font-bold">
                  CLICK TO INSPECT
                </span>
              </div>

              {/* Four Claim Lines */}
              <div className="py-5 space-y-3.5">
                {AUDIT_FINDINGS.map((finding, idx) => {
            const isActive = activeGapIndex === idx;
            return (<div key={finding.id} onClick={() => handleManualSelect(idx)} className={`relative p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none ${isActive
                    ? 'bg-white border-rose-500/80 shadow-[0_4px_24px_rgba(244,63,94,0.18)] ring-2 ring-rose-500/30'
                    : 'bg-[#F1F5F9] border-[#E2E8F0] hover:bg-white hover:border-slate-300'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative flex-1">
                          <h3 className={`font-sans text-base font-bold transition-colors ${isActive ? 'text-[#0F172A]' : 'text-[#0F172A]/70'} line-through decoration-[#E11D48] decoration-2`}>
                            {finding.claimTitle}
                          </h3>
                          <p className="text-xs font-mono text-[#475569] mt-0.5">
                            {finding.claimQuote}
                          </p>
                        </div>

                        {/* Debunk Stamp Verdict */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <Stamp status={finding.stampStatus} size="md" animate={false}/>
                        </div>
                      </div>
                    </div>);
        })}
              </div>

              {/* Footer */}
              <div className="pt-4 flex items-center justify-between font-mono text-xs text-[#475569] border-t border-[#E2E8F0]">
                <span className="font-bold tracking-wider uppercase">CANDIDATE SELF-REPORT</span>
                <span className="text-[#E11D48] font-bold bg-[#FFF1F2] px-2 py-0.5 rounded border border-[#FECDD3]">
                  4 CLAIMS FAILED SCRUTINY
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Glass Dark Code Inspection Card (The Proof Reality) with Spotlight & BorderBeam */}
          <div className="w-full flex justify-center lg:justify-start">
            <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.15)" borderColor="rgba(244, 63, 94, 0.45)" className="relative w-full max-w-[540px] bg-[#10141A]/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-8 flex flex-col justify-between shadow-[0_0_60px_rgba(244,63,94,0.15)] border border-white/15">
              <BorderBeam size={280} duration={6} colorFrom="#F43F5E" colorTo="#10B981"/>

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.1] font-mono text-xs text-[#9AA3AE]">
                <span className="flex items-center gap-2 text-white font-bold">
                  <FileCode className="w-4 h-4 text-emerald-400"/>
                  <span>WORKSPACE // AST_REPO_SCAN</span>
                </span>
                <DecryptedText text="commit 0x4F8B72" speed={26} maxIterations={8} animateOnHover={true} className="text-emerald-400 font-mono font-bold" encryptedClassName="text-amber-400 font-mono"/>
              </div>

              {/* Repo File Audit Findings with Synchronized Laser Scanner */}
              <div className="relative space-y-3.5 my-6">
                {AUDIT_FINDINGS.map((finding, idx) => {
            const isActive = activeGapIndex === idx;
            return (<motion.div key={finding.id} onClick={() => handleManualSelect(idx)} animate={isActive
                    ? { scale: 1.025, x: 6 }
                    : { scale: 1, x: 0 }} transition={{ duration: 0.2 }} className={`relative overflow-hidden p-4 rounded-xl border transition-all cursor-pointer ${isActive
                    ? 'bg-white/[0.08] border-emerald-400/60 shadow-[0_0_25px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400/40'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'}`}>
                      {/* Active Laser Scanline sweep */}
                      {isActive && (<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"/>)}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          {finding.icon}
                          <span className="font-mono text-xs text-white truncate font-semibold">
                            {finding.codeFile}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold uppercase shrink-0 border ${finding.severityColor}`}>
                          {finding.gapLabel}
                        </span>
                      </div>

                      {/* Expanded detail when active */}
                      {isActive && (<motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs font-mono text-[#D1D5DB] mt-2.5 pt-2 border-t border-white/[0.08] leading-relaxed">
                          {finding.gapDetail}
                        </motion.p>)}
                    </motion.div>);
        })}
              </div>

              {/* Status Verdict */}
              <div className="pt-4 flex items-center justify-between font-mono text-xs border-t border-white/[0.08]">
                <span className="text-[#9AA3AE]">EVIDENCE COVERAGE VERDICT</span>
                <span className="text-[#FF5C4D] font-bold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5C4D]"/>
                  <span>4 Gaps Flagged in AST</span>
                </span>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Punchline */}
        <div className="mt-16 text-center">
          <p className="font-sans text-xl sm:text-2xl text-white font-semibold tracking-tight">
            Claims are cheap. <span className="text-emerald-400 font-editorial italic text-2xl sm:text-3xl font-normal">Code doesn't lie.</span>
          </p>
          <p className="font-mono text-xs text-[#9AA3AE] mt-2">
            Click any flagged item above to inspect the exact AST call-site or missing assertion.
          </p>
        </div>
      </div>
    </section>);
};
