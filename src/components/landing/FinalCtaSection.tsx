import React from 'react';
import { Link } from 'react-router-dom';
import { Stamp } from '../stamps/Stamp';
import { ArrowRight, Code2 } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  return (
    <section
      id="cta-receipt"
      className="relative py-28 lg:py-36 overflow-hidden flex flex-col items-center justify-center"
      aria-label="Call to Action: Analyze Repository"
    >
      {/* Concentrated Giant Emerald Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[640px] bg-emerald-500/15 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Physical Paper Card Object with Sawtooth Edge & Long Shadow */}
        <div className="relative w-full bg-[#FAF8F3] text-[#14171A] rounded-2xl p-8 sm:p-12 lg:p-16 flex flex-col justify-between shadow-[0_45px_90px_rgba(0,0,0,0.7)] transform lg:-rotate-1 transition-transform duration-300 hover:rotate-0 border border-[#E6E1D6]">
          {/* Sawtooth Jagged Perforation at Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-3 sawtooth-top bg-[#FAF8F3] -translate-y-2 pointer-events-none" />

          {/* Thermal Receipt Barcode & Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-[#E6E1D6] space-y-4 sm:space-y-0">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#14171A] tracking-widest uppercase">
                EVIDENCE DOCKET RECEIPT
              </span>
              <p className="font-mono text-[11px] text-[#6B7280]">
                REF: PS-2026-COMMIT-ZERO // LIVE_ENGINE
              </p>
            </div>

            {/* Simulated Monospace Barcode Pattern */}
            <div
              className="barcode-lines w-44 h-8 opacity-80 shrink-0"
              title="Signed Invariant Barcode"
              aria-hidden="true"
            />
          </div>

          {/* Giant Headline in Rich Ink */}
          <div className="my-8 sm:my-10">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#14171A] font-bold tracking-tight leading-[1.08] max-w-xl">
              Don’t claim it.
              <br />
              Commit it.
            </h2>
            <p className="text-base text-[#6B7280] max-w-lg mt-3 leading-relaxed">
              Connect your GitHub repository. In under 4 seconds, ProofStack compiles an immutable
              ledger of invariant proofs ready for technical review.
            </p>
          </div>

          {/* Action Controls */}
          <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 border-t border-[#E6E1D6]">
            {/* Primary Action Button */}
            <Link
              to="/styleguide"
              className="h-14 px-8 rounded-xl bg-[#14171A] text-[#FAF8F3] hover:bg-black font-display text-base font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-102 transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Launch interactive demo in styleguide"
            >
              <span>Analyze my repo</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>

            {/* Secondary Action */}
            <Link
              to="/styleguide"
              className="font-mono text-xs font-semibold text-[#14171A] hover:text-emerald-700 flex items-center gap-1.5 underline underline-offset-4 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span>Inspect all component archetypes →</span>
            </Link>
          </div>

          {/* Large PROVEN Rubber Stamp Hanging Off Edge */}
          <div
            className="absolute -bottom-5 -right-4 sm:-bottom-6 sm:-right-6 z-20 pointer-events-none select-none"
            aria-hidden="true"
          >
            <Stamp status="proven" size="lg" animate={false} />
          </div>
        </div>
      </div>
    </section>
  );
};
