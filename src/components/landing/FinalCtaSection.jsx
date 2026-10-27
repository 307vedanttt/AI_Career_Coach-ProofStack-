import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stamp } from '../stamps/Stamp';
import { ArrowRight, Code2 } from 'lucide-react';
import { TiltCard } from '../ui/motion/TiltCard';
gsap.registerPlugin(ScrollTrigger);
export const FinalCtaSection = () => {
    const shouldReduceMotion = useReducedMotion();
    const sectionRef = useRef(null);
    const cardWrapperRef = useRef(null);
    const stampRef = useRef(null);
    useEffect(() => {
        if (shouldReduceMotion)
            return;
        const ctx = gsap.context(() => {
            // 1. Scrubbed 3D paper docket entry
            if (cardWrapperRef.current) {
                gsap.fromTo(cardWrapperRef.current, { y: 80, rotateX: 14, opacity: 0.3, scale: 0.94 }, {
                    y: 0,
                    rotateX: 0,
                    opacity: 1,
                    scale: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                        end: 'center 50%',
                        scrub: 0.8,
                    },
                });
            }
            // 2. Rubber stamp slam bound to scroll
            if (stampRef.current) {
                gsap.fromTo(stampRef.current, { scale: 2.2, opacity: 0, rotate: -25 }, {
                    scale: 1,
                    opacity: 1,
                    rotate: -4,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                        end: 'center 45%',
                        scrub: 0.6,
                    },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, [shouldReduceMotion]);
    return (<section id="cta-receipt" ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden flex flex-col items-center justify-center bg-[#0B0D11]" aria-label="Call to Action: Analyze Repository">
      <div ref={cardWrapperRef} className="relative max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 will-change-transform" style={{ perspective: '1200px' }}>
        {/* Dynamic Ambient Holographic Glow */}
        <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-emerald-500/10 rounded-3xl blur-3xl opacity-60 pointer-events-none -z-10"/>

        {/* Physical Paper Card Object with Sawtooth Edge & Long Shadow */}
        <TiltCard maxTilt={3} glareOpacity={0.05} className="relative w-full bg-[#F8FAFC] text-[#0F172A] rounded-2xl p-8 sm:p-12 lg:p-16 flex flex-col justify-between shadow-[0_35px_80px_rgba(0,0,0,0.6)] border border-[#CBD5E1]">
          {/* Sawtooth Jagged Perforation at Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-3 sawtooth-top bg-[#F8FAFC] -translate-y-2 pointer-events-none"/>

          {/* Thermal Receipt Barcode & Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-[#E2E8F0] space-y-4 sm:space-y-0">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#0F172A] tracking-wider uppercase">
                EVIDENCE DOCKET RECEIPT
              </span>
              <p className="font-mono text-[11px] text-[#475569]">
                REF: PS-2026-LIVE • IMMUTABLE MERKLE TREE
              </p>
            </div>

            {/* Simulated Monospace Barcode Pattern with Active Laser Scanline */}
            <div className="relative overflow-hidden rounded">
              <div className="barcode-lines w-44 h-8 opacity-80 shrink-0" title="Signed Invariant Barcode" aria-hidden="true"/>
              <div className="absolute inset-y-0 w-[2px] bg-[#F43F5E] shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse left-1/3"/>
            </div>
          </div>

          {/* Headline in Crisp Ink */}
          <div className="my-8 sm:my-10">
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-[#0F172A] font-bold tracking-tight leading-[1.1] max-w-xl">
              Turn your commits into irrefutable career proof.
            </h2>
            <p className="text-base text-[#475569] max-w-lg mt-3 leading-relaxed font-sans">
              Connect your GitHub repository. ProofStack compiles an immutable proof docket with AST reachability and invariant assertions ready for technical review.
            </p>
          </div>

          {/* Action Controls */}
          <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 border-t border-[#E2E8F0]">
            {/* Primary Action Button */}
            <Link to={typeof window !== 'undefined' && localStorage.getItem('ps_github_username') ? '/app' : '/login'} className="h-12 px-7 rounded-xl bg-[#0F172A] text-[#F8FAFC] hover:bg-black font-sans text-sm font-semibold flex items-center justify-center gap-2 shadow-xl hover:scale-102 transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:ring-2 hover:ring-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]" aria-label="Launch interactive demo in styleguide">
              <span>Analyze My Repository</span>
              <ArrowRight className="w-4 h-4 text-emerald-400"/>
            </Link>

            {/* Secondary Action */}
            <Link to="/styleguide" className="font-mono text-xs font-semibold text-[#0F172A] hover:text-emerald-700 flex items-center gap-1.5 underline underline-offset-4 transition-colors">
              <Code2 className="w-4 h-4"/>
              <span>Inspect all component archetypes →</span>
            </Link>
          </div>

          {/* Large PROVEN Rubber Stamp Hanging Off Edge */}
          <div ref={stampRef} className="absolute -bottom-5 -right-4 sm:-bottom-6 sm:-right-6 z-20 pointer-events-none select-none will-change-transform" aria-hidden="true">
            <Stamp status="proven" size="lg" animate={false}/>
          </div>
        </TiltCard>
      </div>
    </section>);
};
