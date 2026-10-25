import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
export const CandidateIntegrityMatrix = ({ candidates, selectedCandidateId, onSelectCandidate, className = '', }) => {
    const [hoveredCandidate, setHoveredCandidate] = useState(null);
    // Normalization boundaries
    const maxClaims = 24;
    const minScore = 50;
    const maxScore = 100;
    return (<div className={`relative w-full h-[360px] bg-[#0B0D11] rounded-2xl border border-white/10 p-6 flex flex-col justify-between overflow-hidden shadow-2xl select-none ${className}`} aria-label="Candidate Code Integrity Matrix">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"/>

      {/* Quadrant Dividers */}
      <div className="absolute left-1/2 top-10 bottom-12 w-[1px] bg-white/[0.06] pointer-events-none"/>
      <div className="absolute top-1/2 left-14 right-10 h-[1px] bg-white/[0.06] pointer-events-none"/>

      {/* Quadrant Labels */}
      <div className="absolute top-4 right-6 font-mono text-[10px] text-emerald-400/80 tracking-wider uppercase font-semibold flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
        <span>High Claims · High Match (Ideal)</span>
      </div>
      <div className="absolute bottom-12 left-16 font-mono text-[10px] text-[#FF5C4D]/80 tracking-wider uppercase font-semibold flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C4D]"/>
        <span>Gaps / Hollow Assertions Flagged</span>
      </div>

      {/* Axis Labels */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center font-mono text-[10px] text-[#9AA3AE] tracking-widest uppercase">
        Match Score (50% → 100%)
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[#9AA3AE] tracking-widest uppercase">
        Verified AST Code Claims (0 → 24)
      </div>

      {/* Interactive Candidate Nodes Canvas Area */}
      <div className="relative w-full h-full my-auto ml-8 mr-4">
        {candidates.map((cand) => {
            // Normalize coordinates (padding 8% from edges)
            const normX = Math.min(Math.max((cand.verifiedClaims / maxClaims) * 84 + 8, 8), 92);
            const normY = Math.min(Math.max(((cand.matchScore - minScore) / (maxScore - minScore)) * 84 + 8, 8), 92);
            const isSelected = selectedCandidateId === cand.id;
            const isHovered = hoveredCandidate?.id === cand.id;
            const colorClasses = cand.status === 'verified'
                ? 'bg-emerald-400 text-[#0A0C0F] border-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.6)]'
                : cand.status === 'needs_review'
                    ? 'bg-amber-400 text-[#0A0C0F] border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.6)]'
                    : 'bg-[#FF5C4D] text-white border-red-400 shadow-[0_0_18px_rgba(255,92,77,0.6)]';
            const initials = cand.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);
            return (<div key={cand.id} className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-200" style={{
                    left: `${normX}%`,
                    bottom: `${normY}%`,
                }} onMouseEnter={() => setHoveredCandidate(cand)} onMouseLeave={() => setHoveredCandidate(null)} onClick={() => onSelectCandidate?.(cand)}>
              {/* Outer pulsing ring for selected candidate */}
              {isSelected && (<span className="absolute -inset-2 rounded-full border border-emerald-400 animate-ping opacity-75 pointer-events-none"/>)}

              {/* Node Badge */}
              <motion.div whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all ${colorClasses} ${isSelected ? 'ring-4 ring-white/30 scale-110' : ''}`} title={`${cand.name} (${cand.matchScore}% match)`}>
                {initials}
              </motion.div>

              {/* Candidate Quick Tag Label */}
              <div className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur-md transition-opacity pointer-events-none ${isSelected || isHovered
                    ? 'opacity-100 bg-[#12161B]/95 text-white border border-white/20'
                    : 'opacity-70 bg-black/60 text-[#9AA3AE]'}`}>
                {cand.name.split(' ')[0]} · {cand.matchScore.toFixed(0)}%
              </div>
            </div>);
        })}

        {/* Hover / Inspection Card Popover */}
        <AnimatePresence>
          {hoveredCandidate && (<motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute top-2 right-2 w-64 bg-[#14171E]/95 border border-white/20 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl z-30 pointer-events-none text-left">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="font-bold text-white text-xs truncate max-w-[150px]">
                  {hoveredCandidate.name}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${hoveredCandidate.status === 'verified'
                ? 'bg-emerald-500/20 text-emerald-300'
                : hoveredCandidate.status === 'needs_review'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-red-500/20 text-red-300'}`}>
                  {hoveredCandidate.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#9AA3AE] space-y-1">
                <div className="flex justify-between">
                  <span>Match Score:</span>
                  <span className="text-white font-bold">{hoveredCandidate.matchScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified Claims:</span>
                  <span className="text-emerald-400 font-bold">
                    {hoveredCandidate.verifiedClaims} AST functions
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hollow Flags:</span>
                  <span className={hoveredCandidate.hollowClaims > 0 ? 'text-[#FF5C4D] font-bold' : 'text-[#9AA3AE]'}>
                    {hoveredCandidate.hollowClaims} flagged
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#34D399]">
                <span>Click node to inspect</span>
                <ArrowUpRight className="w-3 h-3"/>
              </div>
            </motion.div>)}
        </AnimatePresence>
      </div>
    </div>);
};
