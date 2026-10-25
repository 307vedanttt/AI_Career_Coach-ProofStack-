import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SpotlightCard } from '../ui/motion/SpotlightCard';
gsap.registerPlugin(ScrollTrigger);
export const TrustStripSection = () => {
    const shouldReduceMotion = useReducedMotion();
    const sectionRef = useRef(null);
    const cardsRef = useRef(null);
    // Initial states for animated count up
    const [val1, setVal1] = useState(shouldReduceMotion ? 14 : 0);
    const [val2, setVal2] = useState(shouldReduceMotion ? '3.4s' : '0.0s');
    const [val3, setVal3] = useState(shouldReduceMotion ? 22 : 0);
    const [val4, setVal4] = useState(0);
    useEffect(() => {
        if (shouldReduceMotion)
            return;
        const ctx = gsap.context(() => {
            // 1. Bidirectional odometer counter rolling bound to scroll scrub with state change guards
            let lastV1 = -1;
            let lastV2 = '';
            let lastV3 = -1;
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top 85%',
                end: 'center 45%',
                scrub: 0.3,
                onUpdate: (self) => {
                    const p = self.progress;
                    const n1 = Math.round(p * 14);
                    const n2 = `${(p * 3.4).toFixed(1)}s`;
                    const n3 = Math.round(p * 22);
                    if (n1 !== lastV1) {
                        lastV1 = n1;
                        setVal1(n1);
                    }
                    if (n2 !== lastV2) {
                        lastV2 = n2;
                        setVal2(n2);
                    }
                    if (n3 !== lastV3) {
                        lastV3 = n3;
                        setVal3(n3);
                    }
                },
            });
            // 2. 3D card tilt & elevation scrub
            if (cardsRef.current) {
                gsap.fromTo(cardsRef.current.children, { y: 40, rotateX: 12, opacity: 0.35, scale: 0.94 }, {
                    y: 0,
                    rotateX: 0,
                    opacity: 1,
                    scale: 1,
                    stagger: 0.08,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                        end: 'center 50%',
                        scrub: 0.8,
                    },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, [shouldReduceMotion]);
    return (<section id="metrics" ref={sectionRef} className="relative py-20 lg:py-28 bg-[#0B0D11] border-t border-b border-white/[0.06] overflow-hidden" aria-label="Verification Metrics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Four Monumental Stats as Interactive Spotlight Cards with 3D perspective */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch will-change-transform" style={{ perspective: '1200px' }}>
          {/* Stat 1: 14 */}
          <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.15)" borderColor="rgba(244, 63, 94, 0.35)" className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#10141B]/90 border border-white/[0.08] shadow-[0_0_35px_rgba(244,63,94,0.08)] hover:shadow-[0_0_50px_rgba(244,63,94,0.2)] space-y-3 transition-all hover:scale-[1.02]">
            <div className="font-sans text-6xl sm:text-7xl font-bold bg-gradient-to-br from-rose-100 via-[#F43F5E] to-rose-400 bg-clip-text text-transparent tracking-tight tabular-nums leading-none drop-shadow-[0_0_25px_rgba(244,63,94,0.4)]">
              {val1}
            </div>
            <span className="font-sans text-sm text-[#94A3B8] font-medium">
              hollow claims caught
            </span>
          </SpotlightCard>

          {/* Stat 2: 3.4s */}
          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.15)" borderColor="rgba(16, 185, 129, 0.35)" className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#10141B]/90 border border-white/[0.08] shadow-[0_0_35px_rgba(16,185,129,0.08)] hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] space-y-3 transition-all hover:scale-[1.02]">
            <div className="font-sans text-6xl sm:text-7xl font-bold bg-gradient-to-br from-emerald-100 via-[#10B981] to-teal-300 bg-clip-text text-transparent tracking-tight tabular-nums leading-none drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              {val2}
            </div>
            <span className="font-sans text-sm text-[#94A3B8] font-medium">
              push-to-verdict latency
            </span>
          </SpotlightCard>

          {/* Stat 3: 22 of 22 */}
          <SpotlightCard spotlightColor="rgba(56, 189, 248, 0.15)" borderColor="rgba(56, 189, 248, 0.35)" className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#10141B]/90 border border-white/[0.08] shadow-[0_0_35px_rgba(56,189,248,0.08)] hover:shadow-[0_0_50px_rgba(56,189,248,0.2)] space-y-3 transition-all hover:scale-[1.02]">
            <div className="font-sans text-5xl sm:text-6xl font-bold bg-gradient-to-br from-sky-100 via-[#38BDF8] to-indigo-400 bg-clip-text text-transparent tracking-tight whitespace-nowrap tabular-nums leading-none pt-2 drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]">
              {val3} of 22
            </div>
            <span className="font-sans text-sm text-[#94A3B8] font-medium">
              tamper exploits blocked
            </span>
          </SpotlightCard>

          {/* Stat 4: 0 */}
          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.2)" borderColor="rgba(16, 185, 129, 0.45)" className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-[#10141B]/90 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.12)] hover:shadow-[0_0_60px_rgba(16,185,129,0.28)] space-y-3 transition-all hover:scale-[1.02]">
            <div className="font-sans text-7xl sm:text-8xl font-black bg-gradient-to-br from-white via-emerald-300 to-[#10B981] bg-clip-text text-transparent tracking-tight leading-none drop-shadow-[0_0_35px_rgba(16,185,129,0.6)]">
              {val4}
            </div>
            <span className="font-sans text-sm text-emerald-400 font-semibold drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
              unverified passes granted
            </span>
          </SpotlightCard>
        </div>

        {/* Footnote */}
        <div className="mt-16 text-center">
          <p className="font-mono text-xs text-[#6B7280] tracking-wider uppercase">
            Evidence of use, not a ranking of people. Sample verified invariants.
          </p>
        </div>
      </div>
    </section>);
};
