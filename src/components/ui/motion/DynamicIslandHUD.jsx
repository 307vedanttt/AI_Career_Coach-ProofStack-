import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  GitFork, 
  ShieldCheck, 
  Flame, 
  Brain, 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  ExternalLink 
} from 'lucide-react';

/**
 * Skiper UI & Dynamic Island HUD
 * Fluid spring-based expandable island floating at the bottom of the viewport.
 */
export const DynamicIslandHUD = ({
  repository = { fullName: '307vedanttt/MedNav-Ai', defaultBranch: 'main' },
  onRunAudit,
  isAuditing = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const islandRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (islandRef.current && !islandRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div 
      ref={islandRef} 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none"
    >
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 32,
          mass: 0.8
        }}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`relative overflow-hidden rounded-2xl bg-[#0B0D12]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-pointer transition-colors hover:border-white/[0.2] ${
          isExpanded ? 'w-[92vw] max-w-[500px] p-4' : 'w-auto px-4 py-2 flex items-center gap-3'
        }`}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* COLLAPSED ISLAND STATE */
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[160px] sm:max-w-[220px]">
                    {repository.fullName}
                  </span>
                </span>
              </div>

              <span className="text-white/20">|</span>

              <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline">
                AST Verified
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="p-1 rounded-md hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors"
                title="Expand Island HUD"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            /* EXPANDED ISLAND STATE */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-3 font-mono text-xs"
            >
              {/* Top Status Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white tracking-wide">
                    ProofStack Runtime Engine
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-1 rounded-md hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors"
                  title="Collapse HUD"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Live Telemetry Info */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-[#14161D] border border-white/[0.06] space-y-0.5">
                  <span className="text-neutral-500 uppercase tracking-wider text-[9px]">Active Target</span>
                  <div className="text-white font-semibold truncate">{repository.fullName}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#14161D] border border-white/[0.06] space-y-0.5">
                  <span className="text-neutral-500 uppercase tracking-wider text-[9px]">Merkle Lineage</span>
                  <div className="text-emerald-400 font-semibold">100% Invariant Backed</div>
                </div>
              </div>

              {/* Quick Navigation Action Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/resume');
                    setIsExpanded(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#14161D] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 hover:text-white transition-colors text-[11px]"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Truth Roast</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/app/audit');
                    setIsExpanded(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#14161D] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 hover:text-white transition-colors text-[11px]"
                >
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Cadence</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/app/proof-map');
                    setIsExpanded(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#14161D] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 hover:text-white transition-colors text-[11px]"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Proof Map</span>
                </button>
              </div>

              {/* Primary Action Button */}
              {onRunAudit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRunAudit();
                    setIsExpanded(false);
                  }}
                  disabled={isAuditing}
                  className="w-full mt-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090A0D] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAuditing ? 'Running AST Invariant Audit...' : 'Trigger Live Repository Audit'}</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
