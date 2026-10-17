import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, ShieldAlert, QrCode } from 'lucide-react';
import { Stamp } from '../stamps/Stamp';

gsap.registerPlugin(ScrollTrigger);

export const SignatureFeaturesSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const treemapGridRef = useRef<HTMLDivElement>(null);
  const [upgradesCount, setUpgradesCount] = useState<number>(shouldReduceMotion ? 0 : 10);
  const [treemapRecolored, setTreemapRecolored] = useState<boolean>(shouldReduceMotion ? true : false);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const ctx = gsap.context(() => {
      // 1. Panels rise with a subtle stagger (progressive enhancement: visible by default)
      if (panelsRef.current) {
        gsap.fromTo(
          panelsRef.current.children,
          { y: 20, opacity: 0.9 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // 2. Mini Treemap recolors on scroll
      if (treemapGridRef.current) {
        ScrollTrigger.create({
          trigger: treemapGridRef.current,
          start: 'top 75%',
          onEnter: () => setTreemapRecolored(true),
          onLeaveBack: () => setTreemapRecolored(false),
        });
      }

      // 3. "Upgrades granted" counter rolls from 10 to 0 on scroll
      const counterObj = { value: 10 };
      gsap.to(counterObj, {
        value: 0,
        roundProps: 'value',
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'center 45%',
          scrub: 0.5,
        },
        onUpdate: () => {
          setUpgradesCount(Math.round(counterObj.value));
        },
      });
    }, sectionRef);

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      className="relative py-12 lg:py-16 overflow-hidden border-t border-white/[0.06]"
      aria-label="Core Capabilities Bento Grid"
    >
      {/* Ambient Section Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] h-[580px] bg-[#B7791F]/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8 sm:mb-10 max-w-3xl mx-auto">
          <span className="font-mono text-xs font-semibold text-[#9AA3AE] tracking-[0.25em] uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10">
            Core Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight">
            Four ways it proves it.
          </h2>
          <p className="text-base text-[#9AA3AE] max-w-xl">
            From automated commit prediction to adversarial red-team simulations and verifiable resume
            permalinks.
          </p>
        </div>

        {/* Bento Grid */}
        <div ref={panelsRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* CARD A: COMMIT CONTRACT (7 Cols) */}
          <div className="lg:col-span-7 bg-[#12161B]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col justify-between group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[11px] font-bold tracking-wider uppercase mb-2">
                  RECOMMENDATION
                </span>
                <h3 className="font-display text-2xl text-white font-bold tracking-tight">
                  Commit Contract
                </h3>
                <p className="text-sm text-[#9AA3AE] mt-1">
                  Predicts what your next commit proves before you push code.
                </p>
              </div>
              <span className="font-mono text-xs text-[#6B7280]">SPEC // CTR-809</span>
            </div>

            {/* Inner Paper Receipt Card with State Transition */}
            <div className="bg-[#FAF8F3] text-[#14171A] rounded-xl p-6 shadow-xl my-4 space-y-4 border border-[#E6E1D6]">
              <div className="flex items-center justify-between">
                <Stamp status="not_shown" size="sm" animate={false} />
                <div className="flex items-center space-x-1 text-emerald-600 font-mono text-xs font-bold">
                  <span>----</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <Stamp status="proven" size="sm" animate={false} />
              </div>

              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="flex items-center space-x-2 text-[#14171A]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Query reachable from route /orders</span>
                </div>
                <div className="flex items-center space-x-2 text-[#14171A]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Test asserts status_code == 201</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between font-mono text-xs text-[#9AA3AE]">
              <span>ZERO GUESSWORK</span>
              <span className="text-emerald-400 font-bold">AUTOMATED VERDICT GUARANTEE</span>
            </div>
          </div>

          {/* CARD B: PROOF MAP (5 Cols) with Required Legend & Recoloring */}
          <div className="lg:col-span-5 bg-[#12161B]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-display text-2xl text-white font-bold tracking-tight">
                Proof Map
              </h3>
              <p className="text-sm text-[#9AA3AE] mt-1">
                Your repository files colored by verifiable evidence status.
              </p>
            </div>

            {/* Mini Treemap Grid that recolors on scroll */}
            <div
              ref={treemapGridRef}
              className="grid grid-cols-3 gap-2.5 my-3 p-3 bg-black/40 rounded-xl border border-white/5"
            >
              <div
                className={`h-16 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold transition-all duration-700 ${
                  treemapRecolored
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(31,138,91,0.5)]'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                auth.py
              </div>
              <div
                className={`h-16 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold transition-all duration-700 ${
                  treemapRecolored
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(31,138,91,0.5)]'
                    : 'bg-amber-700 text-amber-200'
                }`}
              >
                routes.py
              </div>
              <div className="h-16 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold bg-[#6D5BD0] text-white">
                cache.py
              </div>

              <div
                className={`h-20 rounded-lg p-2 flex flex-col justify-between font-mono text-[11px] font-bold transition-all duration-700 ${
                  treemapRecolored
                    ? 'bg-emerald-500 text-[#0A0C0F] animate-pulse ring-2 ring-white/40'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white shadow" />
                <span>parser.py</span>
              </div>
              <div
                className={`h-20 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold transition-all duration-700 ${
                  treemapRecolored
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(31,138,91,0.5)]'
                    : 'bg-slate-600 text-slate-200'
                }`}
              >
                storage.py
              </div>
              <div
                className={`h-20 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold transition-all duration-700 ${
                  treemapRecolored
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(31,138,91,0.5)]'
                    : 'bg-amber-700 text-amber-200'
                }`}
              >
                queue.py
              </div>

              <div className="h-14 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold bg-[#6D5BD0] text-white">
                gateway.py
              </div>
              <div
                className={`h-14 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold transition-all duration-700 ${
                  treemapRecolored
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(31,138,91,0.5)]'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                ledger.py
              </div>
              <div className="h-14 rounded-lg p-2 flex items-end font-mono text-[11px] font-bold bg-slate-700 text-slate-300">
                hooks.py
              </div>
            </div>

            {/* Prompt Required Legend */}
            <div className="pt-3 flex items-center justify-between font-mono text-xs text-[#9AA3AE] border-t border-white/[0.08]">
              <span className="italic text-emerald-400">Rectangle size = file size only</span>
              <span>9 MODULES AUDITED</span>
            </div>
          </div>

          {/* CARD C: BREAK-ME (5 Cols) with Counter Rolling from 10 to 0 */}
          <div className="lg:col-span-5 bg-[#12161B]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col justify-between">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#FF5C4D] mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span className="font-mono text-xs font-bold tracking-wider uppercase">
                  Adversarial Suite
                </span>
              </div>
              <h3 className="font-display text-2xl text-white font-bold tracking-tight">
                Break-Me
              </h3>
              <p className="text-sm text-[#9AA3AE] mt-1">
                Fool it. Watch the guard refuse every fake or hollow commit.
              </p>
            </div>

            {/* Stat Counters: Attacks 10 / Upgrades rolling to 0 */}
            <div className="grid grid-cols-2 gap-4 my-2 py-3 bg-black/40 rounded-xl p-4 border border-white/5">
              <div>
                <span className="font-mono text-xs text-[#9AA3AE] uppercase">Attacks simulated</span>
                <div className="font-display text-5xl sm:text-6xl text-white font-bold mt-1">
                  10
                </div>
              </div>
              <div>
                <span className="font-mono text-xs text-emerald-400 uppercase font-semibold">
                  Upgrades granted
                </span>
                <div className="font-display text-5xl sm:text-6xl text-emerald-400 font-bold mt-1 tabular-nums">
                  {upgradesCount}
                </div>
              </div>
            </div>

            {/* 10 Red Refusal Dots */}
            <div className="space-y-2 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between font-mono text-xs text-[#FF5C4D] font-bold">
                <span>ALL 10 ADVERSARIAL COMMITS REFUSED</span>
                <span>0 BYPASSED</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap" aria-label="10 Refusal Dots">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-[#FF5C4D]/25 border border-[#FF5C4D] shadow-[0_0_6px_rgba(255,92,77,0.7)]"
                    title={`Adversarial test #${i + 1} refused`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CARD D: PROOF-LINKED RESUME (7 Cols) */}
          <div className="lg:col-span-7 bg-[#12161B]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded bg-violet-500/15 text-violet-400 font-mono text-[11px] font-bold tracking-wider uppercase mb-2">
                  VERIFIABLE ARTIFACT
                </span>
                <h3 className="font-display text-2xl text-white font-bold tracking-tight">
                  Proof-linked Resume
                </h3>
                <p className="text-sm text-[#9AA3AE] mt-1">
                  Every skill bullet links directly to its verified repository commit permalink.
                </p>
              </div>
              <span className="font-mono text-xs text-emerald-400">LIVE_LEDGER_SYNC</span>
            </div>

            {/* Paper Mini Resume Card */}
            <div className="bg-[#FAF8F3] text-[#14171A] rounded-xl p-6 shadow-xl my-2 flex items-center justify-between border border-[#E6E1D6]">
              <div className="space-y-3 flex-1 pr-6 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold">Distributed Invariant Consensus</span>
                  <sup className="text-emerald-700 font-bold">[PROOF #01]</sup>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold">Stream Event Ingestion</span>
                  <sup className="text-amber-700 font-bold">[PROOF #02]</sup>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                  <span className="font-bold">Zero-Downtime SQLite Migration</span>
                  <sup className="text-violet-700 font-bold">[PROOF #03]</sup>
                </div>
              </div>

              {/* Scannable Verification QR Code Simulation */}
              <div className="w-16 h-16 bg-white p-2 rounded-lg border border-[#E6E1D6] flex items-center justify-center text-[#14171A] shadow-sm shrink-0">
                <QrCode className="w-full h-full" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between font-mono text-xs text-[#9AA3AE]">
              <span>UNFORGEABLE FOOTNOTES</span>
              <span className="text-emerald-400 font-bold">SCANNABLE TRUST</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
