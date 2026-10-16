import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileText,
  Receipt,
  CircleDot,
  Sparkles,
  GitCommit,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const LifecycleSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const nodes = [
    {
      num: 1,
      title: 'Posting',
      sub: 'Requirement intake',
      icon: <FileText className="w-5 h-5 text-[#9AA3AE]" />,
    },
    {
      num: 2,
      title: 'Evidence',
      sub: 'Coverage baseline',
      icon: <Receipt className="w-5 h-5 text-emerald-400" />,
    },
    {
      num: 3,
      title: 'Gaps',
      sub: 'Not shown in scope',
      icon: <CircleDot className="w-5 h-5 text-[#9AA3AE]" />,
    },
    {
      num: 4,
      title: 'Contract',
      sub: 'Predicts next step',
      isHero: true,
      tag: 'RECOMMENDATION',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    },
    {
      num: 5,
      title: 'Commit',
      sub: 'Git head advance',
      icon: <GitCommit className="w-5 h-5 text-white" />,
    },
    {
      num: 6,
      title: 'Auto Update',
      sub: 'Ledger recompute',
      icon: <RefreshCw className="w-5 h-5 text-emerald-400" />,
    },
    {
      num: 7,
      title: 'Verdict',
      sub: 'Irrefutable stamp',
      tag: 'PROVEN',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    },
  ];

  // Connecting SVG line draws itself (stroke-dashoffset tied to scroll)
  useEffect(() => {
    if (shouldReduceMotion || !pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    // Set initial dasharray and offset
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 75%',
      end: 'bottom 85%',
      scrub: 0.8,
      onUpdate: (self) => {
        const offset = length * (1 - self.progress);
        gsap.to(path, {
          strokeDashoffset: offset,
          duration: 0.1,
          overwrite: 'auto',
        });
      },
    });

    return () => trigger.kill();
  }, [shouldReduceMotion]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden border-t border-white/[0.06]"
      aria-label="Deterministic Verification Lifecycle"
    >
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[840px] h-[520px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-20 max-w-3xl mx-auto">
          <span className="font-mono text-xs font-semibold text-[#9AA3AE] tracking-[0.25em] uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10">
            Verification Lifecycle
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight">
            Every commit closes the loop.
          </h2>
          <p className="text-base text-[#9AA3AE] max-w-xl">
            A continuous verification pipeline that analyzes your repo commits against explicit
            requirements and predicts your next incremental proof.
          </p>
        </div>

        {/* 7-Step Interactive Pipeline Stage */}
        <div className="relative py-8">
          {/* Connecting SVG Track */}
          <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 1200 240"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="pipelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1F8A5B" />
                  <stop offset="50%" stopColor="#6D5BD0" />
                  <stop offset="100%" stopColor="#1F8A5B" />
                </linearGradient>
              </defs>

              {/* Background Guide Track */}
              <path
                d="M 60 120 C 260 70, 420 170, 600 120 C 780 70, 940 170, 1140 120"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Self-drawing dynamic SVG line */}
              <path
                ref={pathRef}
                d="M 60 120 C 260 70, 420 170, 600 120 C 780 70, 940 170, 1140 120"
                stroke="url(#pipelineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                style={shouldReduceMotion ? { strokeDashoffset: 0 } : undefined}
              />

              {/* Dashed Return Loop Arc */}
              <path
                d="M 1140 140 C 1140 230, 60 230, 60 140"
                stroke="#1F8A5B"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeOpacity="0.4"
              />
            </svg>
          </div>

          {/* 7 Node Cards Grid */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 lg:gap-3 items-start">
            {nodes.map((node) => {
              const isHero = node.isHero;
              return (
                <div
                  key={node.num}
                  className="flex flex-col items-center text-center space-y-3 group"
                >
                  {/* Circular Node Glass Element */}
                  <div
                    className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                      isHero
                        ? 'bg-emerald-500/15 border-2 border-emerald-400 shadow-[0_0_28px_rgba(31,138,91,0.4)]'
                        : 'bg-[#12161B]/90 border border-white/10 shadow-xl'
                    }`}
                  >
                    {/* Floating Hero Tag */}
                    {node.tag && (
                      <span
                        className={`absolute -top-3 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase ${
                          node.tag === 'RECOMMENDATION'
                            ? 'bg-emerald-500 text-[#0A0C0F]'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {node.tag}
                      </span>
                    )}

                    <div className="mb-0.5">{node.icon}</div>
                    <span className="font-display text-sm font-bold text-white">
                      {node.num}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-0.5">
                    <h3 className="font-display text-base font-bold text-white tracking-tight">
                      {node.title}
                    </h3>
                    <p className="font-mono text-[11px] text-[#9AA3AE]">
                      {node.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Return Arc Badge */}
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 font-mono text-xs text-emerald-400 shadow-lg">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>REPEAT WITH NEW INCREMENTAL INVARIANTS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
