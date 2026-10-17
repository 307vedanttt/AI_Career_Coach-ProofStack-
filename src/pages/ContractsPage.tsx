import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Contract,
  CoachRecord,
} from '../types/api';
import {
  getContracts,
  getCoverage,
  postDryRun,
  initialCoachRecord,
} from '../lib/api';
import { AppLayout } from '../components/layout/AppLayout';
import { Stamp, StampStatus } from '../components/stamps/Stamp';
import { Button } from '../components/ui/Button';
import {
  Check,
  Lock,
  Copy,
  Terminal,
  Sparkles,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContractIndex, setActiveContractIndex] = useState<number>(0);
  const [coachRecord, setCoachRecord] = useState<CoachRecord>(initialCoachRecord);
  const [currentCoveragePct, setCurrentCoveragePct] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dry Run States
  const [isDryRunning, setIsDryRunning] = useState<boolean>(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({
    c1: true,
    c2: false,
    c3: false,
  });
  const [finalStamp, setFinalStamp] = useState<StampStatus | null>(null);
  const [beforePercentage, setBeforePercentage] = useState<number>(0);
  const [previewPercentage, setPreviewPercentage] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  const loadContracts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [contractsList, coverageData] = await Promise.all([
        getContracts(),
        getCoverage().catch(() => ({ percentage: 0, assessedCount: 0, totalCount: 0, targetPercentage: 75 })),
      ]);
      setContracts(contractsList);
      setCurrentCoveragePct(coverageData.percentage);
      setBeforePercentage(coverageData.percentage);
      setCoachRecord({
        fulfilled: contractsList.filter((c) => c.status === 'fulfilled').length,
        partly: contractsList.filter((c) => c.status === 'partly').length,
        missed: contractsList.filter((c) => c.status === 'not_fulfilled').length,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch commit contracts from backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const activeContract = contracts[activeContractIndex] || contracts[0];

  const handleDryRun = async () => {
    if (!activeContract) return;
    setIsDryRunning(true);
    setFinalStamp(null);

    try {
      const result = await postDryRun(activeContract.id);
      setBeforePercentage(result.beforePercentage || currentCoveragePct);
      setPreviewPercentage(result.afterPercentage);

      setTimeout(() => {
        setChecklistState((prev) => ({ ...prev, c2: true }));
      }, 300);

      setTimeout(() => {
        setChecklistState((prev) => ({ ...prev, c3: true }));
        setIsDryRunning(false);
        setFinalStamp(result.status);
      }, 700);
    } catch (err: any) {
      setIsDryRunning(false);
      setErrorMessage(err.message || 'Dry run simulation failed.');
    }
  };

  const handleCopyGit = () => {
    if (activeContract?.gitCommand) {
      navigator.clipboard.writeText(activeContract.gitCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  return (
    <AppLayout>
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
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>{coachRecord.missed} pending</span>
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button variant="solid_ink" size="sm" onClick={loadContracts} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="glass-panel p-16 rounded-2xl border border-white/10 text-center font-mono text-xs text-[#9AA3AE]">
            Loading commit contracts from verified ledger...
          </div>
        ) : contracts.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl border border-white/10 text-center space-y-3">
            <FileCheck2 className="w-12 h-12 text-[#9AA3AE] mx-auto opacity-50" />
            <h3 className="font-display text-xl font-bold text-white">No Commit Contracts Active</h3>
            <p className="font-mono text-xs text-[#9AA3AE] max-w-md mx-auto">
              Scan a repository and link a job posting to generate automated commit contracts that predict your coverage boost.
            </p>
          </div>
        ) : (
          /* Main Layout: Left Contracts List (4 Cols) + Right Active Contract Detail (8 Cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Contract Selector Cards */}
            <div className="lg:col-span-4 flex flex-col space-y-3">
              <div className="font-mono text-xs uppercase tracking-wider text-[#9AA3AE] px-1">
                Available Contracts ({contracts.length})
              </div>

              {contracts.map((contract, index) => {
                const isSelected = index === activeContractIndex;
                return (
                  <button
                    key={contract.id}
                    type="button"
                    onClick={() => {
                      setActiveContractIndex(index);
                      setFinalStamp(null);
                      setPreviewPercentage(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col space-y-2 relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#12161B] border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/20'
                        : 'glass-panel border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                        +{contract.pointsDelta} pts boost
                      </span>
                      <span className="font-mono text-[10px] text-[#9AA3AE]">
                        {contract.diffEstimate} diff · {contract.timeEstimate}
                      </span>
                    </div>

                    <div className="font-display text-base font-bold text-white tracking-tight">
                      {contract.title}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-xs text-[#9AA3AE]">
                        Target: <span className="text-white font-semibold">{contract.requirementTarget}</span>
                      </span>
                      <Stamp status={contract.status} size="sm" animate={false} />
                    </div>

                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Active Contract Action Desk */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
              {/* Main Contract Ticket Receipt */}
              <div className="rounded-2xl p-6 sm:p-8 bg-[#F4F2EC] text-[#14171A] shadow-2xl relative border-t-8 border-emerald-500 overflow-hidden select-text">
                {/* Stamp Landing Area Top Right */}
                <div className="absolute top-6 right-6 flex items-center space-x-2">
                  <Stamp status={activeContract.status} size="md" animate={false} />
                </div>

                <div className="max-w-md">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#575D65] font-bold">
                    PREDICTIVE INVARIANT CONTRACT · ID: {activeContract.id}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14171A] mt-1">
                    {activeContract.title}
                  </h2>
                  <p className="font-sans text-xs text-[#575D65] mt-2 leading-relaxed">
                    {activeContract.description}
                  </p>
                </div>

                {/* Acceptance Criteria Checklist */}
                <div className="mt-8 pt-6 border-t border-[#D3CDBD] space-y-3">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#14171A] flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" />
                    <span>Acceptance Criteria Checklist</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {activeContract.checklist.map((item, idx) => {
                      const isChecked = checklistState[`c${idx + 1}`];
                      return (
                        <div
                          key={item.id}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-white/60 border border-[#D3CDBD]"
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-emerald-600 text-white'
                                : 'border border-[#575D65] text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className={isChecked ? 'line-through text-[#575D65]' : 'text-[#14171A] font-medium'}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Frozen Scope Boundary & Copy Command */}
                <div className="mt-6 pt-6 border-t border-[#D3CDBD] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-white/70 border border-[#D3CDBD] space-y-1">
                    <div className="flex items-center space-x-1.5 font-mono text-[10px] uppercase text-[#575D65] font-bold">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Frozen Scope Boundary</span>
                    </div>
                    <div className="font-mono text-xs text-[#14171A] font-semibold truncate">
                      {activeContract.frozenScope}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#14171A] text-white flex items-center justify-between">
                    <div className="space-y-0.5 overflow-hidden pr-2">
                      <div className="font-mono text-[10px] text-[#9AA3AE] uppercase">Terminal Command</div>
                      <div className="font-mono text-xs text-emerald-300 truncate">
                        {activeContract.gitCommand}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyGit}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                      title="Copy Git Command"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </button>
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
                      <span className="text-base text-emerald-900 font-extrabold">{beforePercentage}% → {previewPercentage}%</span>
                    </div>
                    <span className="text-emerald-700 font-semibold">Invariant verified in dry-run stage</span>
                  </motion.div>
                )}

                {/* Slam Stamp Landing */}
                <AnimatePresence>
                  {finalStamp && (
                    <motion.div
                      initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: -5 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="mt-6 flex justify-center pointer-events-none"
                    >
                      <Stamp status={finalStamp} size="lg" animate={true} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action CTA: Dry Run Test Invariant */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#D3CDBD]">
                  <div className="font-mono text-xs text-[#575D65]">
                    {copiedCmd ? '✓ Command copied to clipboard!' : 'Execute against the live invariant testbed.'}
                  </div>

                  <Button
                    variant="solid_ink"
                    size="lg"
                    disabled={isDryRunning}
                    onClick={handleDryRun}
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      <span>{isDryRunning ? 'Simulating AST Reachability...' : 'Run Contract Dry-Run'}</span>
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
