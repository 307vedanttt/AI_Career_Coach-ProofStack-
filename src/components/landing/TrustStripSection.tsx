import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TrustStripSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Initial states for animated count up
  const [val1, setVal1] = useState<number>(shouldReduceMotion ? 14 : 0);
  const [val2, setVal2] = useState<string>(shouldReduceMotion ? '3.4s' : '0.0s');
  const [val3, setVal3] = useState<number>(shouldReduceMotion ? 22 : 0);
  const [val4, setVal4] = useState<number>(0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const ctx = gsap.context(() => {
      const stats = {
        hollow: 0,
        seconds: 0,
        attacks: 0,
      };

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(stats, {
            hollow: 14,
            seconds: 3.4,
            attacks: 22,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: () => {
              setVal1(Math.round(stats.hollow));
              setVal2(`${stats.seconds.toFixed(1)}s`);
              setVal3(Math.round(stats.attacks));
              setVal4(0);
            },
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      id="metrics"
      ref={sectionRef}
      className="relative py-28 lg:py-36 bg-[#0B0D10]/95 backdrop-blur-2xl border-t border-b border-white/[0.06] overflow-hidden"
      aria-label="Monumental Verification Metrics"
    >
      {/* Ambient Section Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[340px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Four Monumental Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 items-center">
          {/* Stat 1: 14 */}
          <div className="flex flex-col items-center text-center px-4 space-y-3">
            <div className="font-display text-7xl sm:text-8xl lg:text-9xl font-bold bg-gradient-to-b from-white via-white/90 to-emerald-400 bg-clip-text text-transparent tracking-tighter tabular-nums leading-none">
              {val1}
            </div>
            <span className="font-display text-lg sm:text-xl text-[#9AA3AE] font-medium">
              hollow signals refused
            </span>
          </div>

          {/* Stat 2: 3.4s */}
          <div className="flex flex-col items-center text-center px-4 space-y-3">
            <div className="font-display text-7xl sm:text-8xl lg:text-9xl font-bold text-white tracking-tighter tabular-nums leading-none">
              {val2}
            </div>
            <span className="font-display text-lg sm:text-xl text-[#9AA3AE] font-medium">
              push to verdict
            </span>
          </div>

          {/* Stat 3: 22 of 22 */}
          <div className="flex flex-col items-center text-center px-4 space-y-3">
            <div className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tighter whitespace-nowrap tabular-nums leading-none pt-2">
              {val3} of 22
            </div>
            <span className="font-display text-lg sm:text-xl text-[#9AA3AE] font-medium">
              attacks refused
            </span>
          </div>

          {/* Stat 4: 0 (Largest & Brightest Emerald Glow) */}
          <div className="flex flex-col items-center text-center px-4 space-y-3">
            <div className="font-display text-8xl sm:text-9xl lg:text-[140px] font-black text-emerald-400 drop-shadow-[0_0_40px_rgba(31,138,91,0.6)] tracking-tighter leading-none">
              {val4}
            </div>
            <span className="font-display text-lg sm:text-xl text-emerald-400 font-semibold">
              upgrades granted
            </span>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-16 text-center">
          <p className="font-mono text-xs text-[#6B7280] tracking-wider uppercase">
            Evidence of use, not a ranking of people. Sample verified invariants.
          </p>
        </div>
      </div>
    </section>
  );
};
