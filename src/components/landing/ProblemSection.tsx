import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stamp } from '../stamps/Stamp';
import { FileCode, AlertTriangle, FileText, Ban, ShieldAlert } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface GapFinding {
  id: number;
  claimTitle: string;
  claimQuote: string;
  stampStatus: 'not_shown' | 'refused' | 'unclear' | 'hollow';
  codeFile: string;
  gapLabel: string;
  gapDetail: string;
  icon: React.ReactNode;
  severityColor: string;
}

const AUDIT_FINDINGS: GapFinding[] = [
  {
    id: 1,
    claimTitle: '1. Advanced SQLite Persistence',
    claimQuote: '"Implemented resilient ACID storage schemas"',
    stampStatus: 'not_shown',
    codeFile: 'db/schema_migration.py',
    gapLabel: '0 call sites in scope',
    gapDetail: 'Schema file present in repo but never imported or invoked by any live route.',
    icon: <FileCode className="w-4 h-4 text-[#9AA3AE] shrink-0" />,
    severityColor: 'text-[#9AA3AE] border-white/10 bg-white/[0.03]',
  },
  {
    id: 2,
    claimTitle: '2. Automated Test Assertion Suite',
    claimQuote: '"Comprehensive integration test invariants"',
    stampStatus: 'refused',
    codeFile: 'tests/test_orders.py',
    gapLabel: 'Empty test (no assert)',
    gapDetail: 'Test method executes pass with zero assert statements. Decoy coverage pattern.',
    icon: <AlertTriangle className="w-4 h-4 text-[#FF5C4D] shrink-0" />,
    severityColor: 'text-[#FF5C4D] border-[#FF5C4D]/30 bg-[#FF5C4D]/10',
  },
  {
    id: 3,
    claimTitle: '3. JWT Authentication Protocol',
    claimQuote: '"Role-based session access enforcement"',
    stampStatus: 'unclear',
    codeFile: 'requirements.txt',
    gapLabel: 'Unused dependency',
    gapDetail: 'PyJWT package listed in requirements, but 0 references found in AST parser.',
    icon: <FileText className="w-4 h-4 text-[#F5A524] shrink-0" />,
    severityColor: 'text-[#F5A524] border-[#F5A524]/30 bg-[#F5A524]/10',
  },
  {
    id: 4,
    claimTitle: '4. Invariant Assertion Guard',
    claimQuote: '"100% production-tested invariant coverage"',
    stampStatus: 'hollow',
    codeFile: 'README.md',
    gapLabel: 'README claim only',
    gapDetail: 'Marketing bullet points in README without backing implementation in source tree.',
    icon: <Ban className="w-4 h-4 text-[#7C8CA8] shrink-0" />,
    severityColor: 'text-[#7C8CA8] border-[#7C8CA8]/30 bg-[#7C8CA8]/10',
  },
];

export const ProblemSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeGapIndex, setActiveGapIndex] = useState<number>(shouldReduceMotion ? 3 : 0);
  const [revealedGaps, setRevealedGaps] = useState<number[]>([0]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setRevealedGaps([0, 1, 2, 3]);
      setActiveGapIndex(3);
      return;
    }

    const ctx = gsap.context(() => {
      // Scrubbed ScrollTrigger syncing scroll depth to the active audit finding
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 80%',
        scrub: 0.4,
        onUpdate: (self) => {
          const index = Math.min(
            Math.floor(self.progress * AUDIT_FINDINGS.length),
            AUDIT_FINDINGS.length - 1
          );
          setActiveGapIndex(index);
          setRevealedGaps((prev) => {
            const next = Array.from(new Set([...prev, index]));
            return next.sort((a, b) => a - b);
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  const handleManualSelect = (idx: number) => {
    setActiveGapIndex(idx);
    setRevealedGaps((prev) => Array.from(new Set([...prev, idx])));
  };

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden border-t border-white/[0.06] bg-[#0A0C0F]"
      aria-label="The Problem: Keywords Are Not Evidence"
    >
      {/* Ambient Radial Vignette */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#9AA3AE] uppercase tracking-[0.2em]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF5C4D]" />
            <span>THE RESUME EVIDENCE CRISIS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight">
            Keywords are not evidence.
          </h2>
          <p className="text-base text-[#9AA3AE] max-w-xl leading-relaxed">
            Anyone can paste trendy framework keywords onto a resume bullet. ProofStack runs deterministic
            AST reachability checks before granting proof status.
          </p>

          {/* Interactive Live Audit Progress Pill */}
          <div className="flex items-center gap-2 pt-2">
            <span className="font-mono text-xs text-[#9AA3AE]">Interactive Audit Scrub:</span>
            <div className="flex items-center gap-1.5 bg-[#12161B] px-3 py-1 rounded-full border border-white/10 font-mono text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-[#FF5C4D] animate-pulse" />
              <span>
                Finding {activeGapIndex + 1} of {AUDIT_FINDINGS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Split Screen Comparison: Paper Resume Claim vs Code Reality */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Central VS Badge */}
          <div
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#12161B] border border-white/20 text-[#9AA3AE] font-mono text-xs font-bold items-center justify-center shadow-2xl"
            aria-hidden="true"
          >
            VS
          </div>

          {/* LEFT PANEL: Paper Resume Strip (The Claim) */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] bg-[#FAF8F3] text-[#14171A] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65)] border border-[#E6E1D6] relative">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D6] font-mono text-xs text-[#6B7280]">
                <span className="tracking-wider uppercase font-semibold">Self-Reported PDF Bullets</span>
                <span className="text-[11px] bg-[#F2EFE9] px-2 py-0.5 rounded border border-[#E6E1D6]">
                  UNVERIFIED CLAIMS
                </span>
              </div>

              {/* Four Claim Lines */}
              <div className="py-5 space-y-4">
                {AUDIT_FINDINGS.map((finding, idx) => {
                  const isRevealed = revealedGaps.includes(idx);
                  const isActive = activeGapIndex === idx;

                  return (
                    <div
                      key={finding.id}
                      onClick={() => handleManualSelect(idx)}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isActive
                          ? 'bg-[#EFECE4] border-[#C2362B]/50 shadow-md ring-2 ring-[#C2362B]/20'
                          : 'bg-[#F5F2EC] border-[#E6E1D6] hover:bg-[#EFECE4]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative flex-1">
                          <h3
                            className={`font-display text-base font-bold transition-colors ${
                              isRevealed ? 'text-[#14171A]/50 line-through decoration-[#C2362B] decoration-2' : 'text-[#14171A]'
                            }`}
                          >
                            {finding.claimTitle}
                          </h3>
                          <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                            {finding.claimQuote}
                          </p>
                        </div>

                        {/* Stamp Drop */}
                        <div className="shrink-0">
                          {isRevealed ? (
                            <motion.div
                              initial={
                                shouldReduceMotion
                                  ? { opacity: 1 }
                                  : { scale: 1.8, opacity: 0, rotate: -12 }
                              }
                              animate={{ scale: 1, opacity: 1, rotate: -4 }}
                              transition={{ duration: 0.35, ease: 'easeOut' }}
                            >
                              <Stamp status={finding.stampStatus} size="sm" animate={false} />
                            </motion.div>
                          ) : (
                            <span className="font-mono text-[10px] text-[#9AA3AE] border border-dashed border-[#D3CDBD] px-2 py-1 rounded">
                              Pending AST...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-4 flex items-center justify-between font-mono text-xs text-[#6B7280] border-t border-[#E6E1D6]">
                <span>CANDIDATE SELF-REPORT</span>
                <span className="text-[#C2362B] font-bold">4 CLAIMS FAILED SCRUTINY</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Glass Dark Code Inspection Card (The Proof Reality) */}
          <div className="w-full flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[540px] bg-[#12161B]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl border border-white/[0.08]">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] font-mono text-xs text-[#9AA3AE]">
                <span className="flex items-center gap-2 text-white font-bold">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>WORKSPACE // AST_REPO_SCAN</span>
                </span>
                <span className="text-emerald-400 font-mono">commit 0x4F8B72</span>
              </div>

              {/* Repo File Audit Findings with Synchronized Laser Scanner */}
              <div className="relative space-y-3.5 my-6">
                {AUDIT_FINDINGS.map((finding, idx) => {
                  const isActive = activeGapIndex === idx;

                  return (
                    <motion.div
                      key={finding.id}
                      onClick={() => handleManualSelect(idx)}
                      animate={
                        isActive
                          ? { scale: 1.02, x: 4 }
                          : { scale: 1, x: 0 }
                      }
                      transition={{ duration: 0.2 }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white/[0.06] border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/30'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          {finding.icon}
                          <span className="font-mono text-xs text-white truncate font-medium">
                            {finding.codeFile}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold uppercase shrink-0 border ${finding.severityColor}`}
                        >
                          {finding.gapLabel}
                        </span>
                      </div>

                      {/* Expanded detail when active */}
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] font-mono text-[#9AA3AE] mt-2 pt-2 border-t border-white/5 leading-relaxed"
                        >
                          <span className="text-emerald-400 font-bold">AST Diagnostic: </span>
                          {finding.gapDetail}
                        </motion.p>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Status Verdict */}
              <div className="pt-4 flex items-center justify-between font-mono text-xs border-t border-white/[0.08]">
                <span className="text-[#9AA3AE]">EVIDENCE COVERAGE VERDICT</span>
                <span className="text-[#FF5C4D] font-bold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5C4D]" />
                  <span>4 Gaps Flagged in AST</span>
                </span>
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
