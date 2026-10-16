import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Contract,
  CoachRecord,
  SystemMetrics,
} from '../types/api';
import {
  mockContracts,
  mockCoachRecord,
  mockSystemMetrics,
  postDryRun,
} from '../lib/api';
import { AppLayout } from '../components/layout/AppLayout';
import { Stamp, StampStatus } from '../components/stamps/Stamp';
import { Button } from '../components/ui/Button';
import {
  Check,
  Lock,
  Copy,
  Terminal,
  Clock,
  Sparkles,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const [contracts] = useState<Contract[]>(mockContracts);
  const [activeContractIndex, setActiveContractIndex] = useState<number>(0);
  const [coachRecord] = useState<CoachRecord>(mockCoachRecord);
  const [metrics] = useState<SystemMetrics>(mockSystemMetrics);

  const activeContract = contracts[activeContractIndex] || contracts[0];

  // Dry Run States
  const [isDryRunning, setIsDryRunning] = useState<boolean>(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({
    c1: true,
    c2: false,
    c3: false,
  });
  const [finalStamp, setFinalStamp] = useState<StampStatus | null>(null);
  const [previewPercentage, setPreviewPercentage] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  const handleDryRun = async () => {
    setIsDryRunning(true);
    setFinalStamp(null);

    // Call typed dry-run endpoint
    const result = await postDryRun(activeContract.id);

    // Checklist ticks live with a check-draw animation sequentially
    setTimeout(() => {
      setChecklistState((prev) => ({ ...prev, c2: true }));
    }, 300);

    setTimeout(() => {
      setChecklistState((prev) => ({ ...prev, c3: true }));
      setPreviewPercentage(result.afterPercentage);
      setIsDryRunning(false);

      // Final stamp slams in (FULFILLED green, PARTLY amber, NOT FULFILLED slate with no shake)
      setFinalStamp(result.status);
    }, 700);
  };

  const handleCopyGit = () => {
    navigator.clipboard.writeText(activeContract.gitCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <AppLayout metrics={metrics}>
      <div className="flex-1 flex flex-col space-y-6">
        {/* Page Top Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMIT CONTRACT PREDICTION</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">
              Predictive Invariant Acceptance
            </h1>
            <p className="font-mono text-xs text-[#9AA3AE] mt-1">
              Verify code invariant fulfillment before merging upstream pull requests.
            </p>
          </div>

          {/* Coach Record Pill */}
          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-3 font-mono text-xs text-[#9AA3AE] border border-white/10 shrink-0">
            <span className="font-bold text-white">Coach record:</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{coachRecord.fulfilled} fulfilled</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{coachRecord.partly} partly</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-[#7C8CA8]">
              <span className="w-2 h-2 rounded-full bg-[#7C8CA8]" />
              <span>{coachRecord.missed} missed</span>
            </span>
          </div>
        </div>

        {/* Main Grid: Left Contract Receipt Card & Right Ranked Contracts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT: PHYSICAL ACCEPTANCE RECEIPT (8 Cols) ================= */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative bg-[#FAF8F3] text-[#14171A] rounded-2xl p-8 sm:p-10 shadow-[0_35px_80px_rgba(0,0,0,0.7)] border border-[#E6E1D6]">
              {/* Sawtooth Perforated Top Edge */}
              <div className="absolute top-0 left-0 right-0 h-3 sawtooth-top bg-[#FAF8F3] -translate-y-2 pointer-events-none" />

              {/* Receipt Docket Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#E6E1D6] space-y-3 sm:space-y-0">
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-[#14171A] tracking-widest uppercase">
                    COMMIT CONTRACT // ACCEPTANCE SPECIFICATION
                  </span>
                  <p className="font-mono text-[11px] text-[#6B7280]">
                    SPEC ID: {activeContract.id} // TARGET: {activeContract.requirementTarget}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="barcode-lines w-32 h-6 opacity-75" aria-hidden="true" />
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-800 font-mono text-xs font-bold">
                    +{activeContract.pointsDelta} PTS
                  </span>
                </div>
              </div>

              {/* Keynote Instrument Serif Requirement Headline */}
              <div className="my-6">
                <h2 className="font-serif-inst text-3xl sm:text-4xl text-[#14171A] font-bold tracking-tight leading-[1.15]">
                  If your next commit adds{' '}
                  <span className="underline decoration-emerald-500 decoration-2 underline-offset-4 italic">
                    one query
                  </span>{' '}
                  and{' '}
                  <span className="underline decoration-emerald-500 decoration-2 underline-offset-4 italic">
                    one test
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#555A64] mt-2 leading-relaxed">
                  {activeContract.description}
                </p>
              </div>

              {/* Acceptance Checklist with Check-Draw Animation */}
              <div className="space-y-3 my-6 bg-white/70 p-4 sm:p-5 rounded-xl border border-[#E4DFD5]">
                <div className="flex items-center justify-between font-mono text-[11px] text-[#6B7280] pb-2 border-b border-[#ECE7DC]">
                  <span className="uppercase font-bold tracking-wider">Formal Invariant Conditions</span>
                  <span>
                    {Object.values(checklistState).filter(Boolean).length} of{' '}
                    {activeContract.checklist.length} Satisfied
                  </span>
                </div>

                {activeContract.checklist.map((item) => {
                  const isChecked = checklistState[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 p-2 rounded-lg hover:bg-[#F2ECE1] transition-colors"
                    >
                      {/* Animated Check Circle with check-draw */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-100 border-2 border-emerald-500 shadow-[0_0_10px_rgba(31,138,91,0.3)]'
                            : 'border-2 border-[#9DA3AF] bg-transparent'
                        }`}
                      >
                        {isChecked ? (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                          </motion.div>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                        )}
                      </div>

                      {/* Item Description & Status */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-medium text-[#1E232A]">
                          {item.label}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold uppercase shrink-0 ${
                            isChecked ? 'text-emerald-700' : 'text-[#8C93A0]'
                          }`}
                        >
                          {isChecked ? 'VERIFIED' : item.statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Frozen Scope Notice */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#EFECE4] border border-[#DDD7C9] my-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#30353F]">
                  <Lock className="w-4 h-4 text-[#555C68] shrink-0" />
                  <span className="font-bold">Will not change:</span>
                  <span className="text-[#555C68] truncate">{activeContract.frozenScope}</span>
                </div>
                <span className="text-[10px] uppercase text-[#737A87] font-bold tracking-wider shrink-0">
                  FROZEN SCOPE
                </span>
              </div>

              {/* Action Controls & Live Dry-Run Previews */}
              <div className="pt-6 border-t-2 border-dashed border-[#D3CDBD] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="solid_ink"
                    size="md"
                    onClick={handleDryRun}
                    isLoading={isDryRunning}
                    icon={<Terminal className="w-4 h-4 text-emerald-400" />}
                    aria-label="Execute Dry Run on Contract"
                  >
                    Dry run contract
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleCopyGit}
                    icon={<Copy className="w-3.5 h-3.5 text-[#14171A]" />}
                  >
                    {copiedCmd ? 'Copied!' : 'Copy git command'}
                  </Button>
                </div>

                {/* Git Checkout Command Pill */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E5E0D5] text-[#1E2329] font-mono text-xs border border-[#D5CFBF]">
                  <span className="text-[#7C8CA8]">$</span>
                  <span className="font-semibold">{activeContract.gitCommand}</span>
                </div>
              </div>

              {/* Before/After Percentage Preview Banner */}
              {previewPercentage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between font-mono text-xs text-[#14171A]"
                >
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <TrendingUp className="w-4 h-4" />
                    <span>PREDICTED COVERAGE BOOST:</span>
                    <span className="text-base text-emerald-900 font-extrabold">58% → {previewPercentage}%</span>
                  </div>
                  <span className="text-emerald-700 font-semibold">Invariant verified in dry-run stage</span>
                </motion.div>
              )}

              {/* Slam Stamp Landing (FULFILLED green, PARTLY amber, NOT FULFILLED slate with no shake) */}
              <AnimatePresence>
                {finalStamp && (
                  <motion.div
                    initial={{ scale: 2.2, opacity: 0, rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: -4 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute -bottom-4 -right-4 z-30 pointer-events-none select-none"
                  >
                    <Stamp status={finalStamp} size="lg" animate={false} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ================= RIGHT: RANKED CONTRACTS SIDEBAR (4 Cols) ================= */}
          <aside className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display text-lg font-bold">Ranked Contracts</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  {contracts.length} AVAILABLE
                </span>
              </div>
              <p className="font-mono text-xs text-[#9AA3AE] mt-1">
                Ordered by evidence impact vs code diff footprint.
              </p>
            </div>

            {/* List of 4 Ranked Contracts */}
            <div className="space-y-3">
              {contracts.map((ctr, idx) => {
                const isSelected = idx === activeContractIndex;
                return (
                  <button
                    key={ctr.id}
                    type="button"
                    onClick={() => {
                      setActiveContractIndex(idx);
                      setFinalStamp(null);
                      setPreviewPercentage(null);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-[0_0_20px_rgba(31,138,91,0.2)]'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-display text-sm font-bold text-white truncate">
                        {ctr.title}
                      </h4>
                      {isSelected && (
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-[#0A0C0F] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 my-2 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                        +{ctr.pointsDelta} PTS
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[#9AA3AE]">
                        DIFF: {ctr.diffEstimate}
                      </span>
                      <span className="text-[#6B7280] ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>EST: {ctr.timeEstimate}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#9AA3AE] line-clamp-2">{ctr.description}</p>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};
