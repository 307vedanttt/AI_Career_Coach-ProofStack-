import React from 'react';
import { ScrollVelocity } from '../ui/motion/ScrollVelocity';
export const EvidenceTicker = () => {
    return (<div className="relative py-3.5 border-y border-emerald-500/20 bg-[#07090D]/95 backdrop-blur-xl overflow-hidden select-none shadow-[0_0_30px_rgba(16,185,129,0.06)]" aria-label="Verified evidence stream ticker">
      {/* Laser Border Accents */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none"/>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none"/>

      {/* Edge gradient masks */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#07090D] via-[#07090D]/80 to-transparent z-10 pointer-events-none"/>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#07090D] via-[#07090D]/80 to-transparent z-10 pointer-events-none"/>

      <ScrollVelocity texts={[
            '✦ VERIFIED AST CODE REALITY ✦ 0x4F8B72 IMMUTABLE AUDIT ✦ PROOF DOCKET #0429 ✦ ZERO HOLLOW CLAIMS ✦ REAL TIME LEDGER SYNC ✦ 100% REVERSIBLE INVARIANTS',
            '✦ ALL 10 ADVERSARIAL COMMITS REFUSED ✦ DETERMINISTIC COMPILER GRAPH ✦ SCANNABLE REPOSITORY PERMALINKS ✦ STOP GUESSING ✦ CRYPTOGRAPHIC SIGNATURE',
        ]} velocity={1.6} itemClassName="font-mono text-xs uppercase tracking-[0.22em] text-emerald-300/80 font-semibold drop-shadow-[0_0_10px_rgba(52,211,153,0.35)]"/>
    </div>);
};
