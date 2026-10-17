import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Contract,
  CoachRecord,
  ContractChecklistItem,
} from '../types/api';
import {
  getContracts,
  getCoverage,
  postDryRun,
  generateContracts,
  initialCoachRecord,
} from '../lib/api';
import { useProofStack } from '../context/ProofStackContext';
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
  PlusCircle,
  ArrowRight,
  Calculator,
  GitBranch,
} from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const { repository } = useProofStack();
  const repoId = repository?.id;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContractIndex, setActiveContractIndex] = useState<number>(0);
  const [coachRecord, setCoachRecord] = useState<CoachRecord>(initialCoachRecord);
  const [currentCoveragePct, setCurrentCoveragePct] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dry Run States
  const [isDryRunning, setIsDryRunning] = useState<boolean>(false);
  const [checklistResults, setChecklistResults] = useState<Record<string, boolean>>({});
  const [finalStamp, setFinalStamp] = useState<StampStatus | null>(null);
  const [beforePercentage, setBeforePercentage] = useState<number>(0);
  const [previewPercentage, setPreviewPercentage] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [copiedSkeleton, setCopiedSkeleton] = useState<boolean>(false);

  const loadContracts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [contractsList, coverageData] = await Promise.all([
        getContracts(repoId),
        getCoverage(repoId).catch(() => ({ percentage: 0, assessedCount: 0, totalCount: 0, targetPercentage: 75 })),
      ]);
      setContracts(contractsList);
      setCurrentCoveragePct(coverageData.percentage);
      setBeforePercentage(coverageData.percentage);

      // Coach Record strictly loaded from stored contracts
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
  }, [repoId]);

  const activeContract: Contract | undefined = contracts[activeContractIndex] || contracts[0];

  const handleGenerateChallenges = async () => {
    if (!repoId) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      await generateContracts(repoId);
      await loadContracts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate targeted challenges.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDryRun = async () => {
    if (!activeContract) return;
    setIsDryRunning(true);
    setFinalStamp(null);

    try {
      // Simulate providing skeleton or candidate file
      const simFiles: Record<string, string> = {};
      if (activeContract.suggestedFilePath && activeContract.recommendationSkeleton) {
        simFiles[activeContract.suggestedFilePath] = activeContract.recommendationSkeleton;
      }

      const result = await postDryRun(activeContract.id, simFiles);
      setBeforePercentage(result.beforePercentage || currentCoveragePct);
      setPreviewPercentage(result.afterPercentage);
      setChecklistResults(result.checklistResults || {});

      setTimeout(() => {
        setIsDryRunning(false);
        const stampStatus: StampStatus =
          result.status === 'fulfilled' ? 'fulfilled' : (result.status === 'partly' ? 'partly' : 'not_fulfilled');
        setFinalStamp(stampStatus);
      }, 600);
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

  const handleCopySkeleton = () => {
    if (activeContract?.recommendationSkeleton) {
      navigator.clipboard.writeText(activeContract.recommendationSkeleton);
      setCopiedSkeleton(true);
      setTimeout(() => setCopiedSkeleton(false), 2000);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col space-y-6">
        {/* Top Header & Coach Record */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ZERO-EXECUTION COMMIT CHALLENGES</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">
              Targeted Skill Challenges
            </h1>
            <p className="font-mono text-xs text-[#9AA3AE] mt-1">
              Verifiable commit contracts generated for missing skills and adjudicated without executing any user code.
            </p>
          </div>

          {/* Coach Record & Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="solid_ink"
              size="sm"
              onClick={handleGenerateChallenges}
              isLoading={isGenerating}
              icon={<PlusCircle className="w-4 h-4 text-emerald-400" />}
            >
              Generate Missing Skill Challenges
            </Button>

            {/* Coach Record Counter Pill */}
            <div
              className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-3 font-mono text-xs text-[#9AA3AE] border border-white/10 shrink-0"
              data-testid="coach-record-counters"
            >
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
                <span>{coachRecord.missed} missed</span>
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-300 text-xs font-mono">
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
            Scanning open contracts and zero-execution invariant checks...
          </div>
        ) : contracts.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl border border-white/10 text-center space-y-4">
            <FileCheck2 className="w-12 h-12 text-[#9AA3AE] mx-auto opacity-50" />
            <h3 className="font-display text-xl font-bold text-white">No Commit Contracts Active</h3>
            <p className="font-mono text-xs text-[#9AA3AE] max-w-md mx-auto leading-relaxed">
              Every requirement in the current snapshot is either verified or no contracts have been formulated yet.
            </p>
            <Button
              variant="solid_paper"
              size="md"
              onClick={handleGenerateChallenges}
              isLoading={isGenerating}
              icon={<PlusCircle className="w-4 h-4 text-[#14171A]" />}
            >
              Generate Targeted Challenges
            </Button>
          </div>
        ) : (
          /* Main Layout: Left Selector + Right Active Card */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Challenges List */}
            <div className="lg:col-span-4 flex flex-col space-y-3">
              <div className="font-mono text-xs uppercase tracking-wider text-[#9AA3AE] px-1 flex items-center justify-between">
                <span>Active Challenges ({contracts.length})</span>
                <span className="text-[10px] text-emerald-400">Ranked by gain / effort</span>
              </div>

              {contracts.map((contract, index) => {
                const isSelected = index === activeContractIndex;
                const effort = contract.effortClass || 'small';
                return (
                  <button
                    key={contract.id}
                    type="button"
                    onClick={() => {
                      setActiveContractIndex(index);
                      setFinalStamp(null);
                      setPreviewPercentage(null);
                      setChecklistResults({});
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
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase text-[#9AA3AE]">
                        {effort} effort
                      </span>
                    </div>

                    <div className="font-display text-base font-bold text-white tracking-tight">
                      {contract.requirementTarget}
                    </div>

                    {contract.gainArithmetic && (
                      <div className="font-mono text-[10px] text-cyan-300 truncate">
                        {contract.gainArithmetic}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 font-mono text-xs">
                      <span className="text-[#9AA3AE] text-[11px]">
                        Target: <span className="text-white font-medium">{contract.predictedTargetState || 'Demonstrated'}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          contract.status === 'fulfilled'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : contract.status === 'partly'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : contract.status === 'not_fulfilled'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                        }`}
                      >
                        {contract.status.replace('_', ' ')}
                      </span>
                    </div>

                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Challenge Card Desk */}
            {activeContract && (
              <div className="lg:col-span-8 flex flex-col space-y-6">
                <div className="rounded-2xl p-6 sm:p-8 bg-[#F4F2EC] text-[#14171A] shadow-2xl relative border-t-8 border-emerald-500 overflow-hidden select-text">
                  {/* Stamp & Status Tag */}
                  <div className="absolute top-6 right-6 flex items-center space-x-2">
                    <Stamp status={activeContract.status} size="md" animate={false} />
                  </div>

                  <div className="max-w-lg space-y-2">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#575D65] font-bold flex items-center gap-2">
                      <span>COMMIT CONTRACT CHALLENGE</span>
                      <span>·</span>
                      <span>ID: {activeContract.id.slice(0, 8)}</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14171A]">
                      {activeContract.title}
                    </h2>
                    <div className="flex items-center gap-2 font-mono text-xs pt-1">
                      <span className="px-2 py-0.5 rounded bg-black/10 text-[#14171A] font-semibold">
                        Current: {activeContract.currentState}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#575D65]" />
                      <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-800 font-bold border border-emerald-600/30">
                        Predicted: {activeContract.predictedTargetState}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#575D65] mt-2 leading-relaxed">
                      {activeContract.description}
                    </p>
                  </div>

                  {/* Suggested File Layout & Gain Arithmetic */}
                  <div className="mt-6 pt-4 border-t border-[#D3CDBD] grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-white/70 border border-[#D3CDBD] space-y-1">
                      <span className="text-[10px] text-[#575D65] uppercase font-bold">Suggested File Path:</span>
                      <div className="font-semibold text-[#14171A] truncate">{activeContract.suggestedFilePath || 'tests/test_feature.py'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 border border-[#D3CDBD] space-y-1">
                      <span className="text-[10px] text-[#575D65] uppercase font-bold flex items-center gap-1">
                        <Calculator className="w-3 h-3 text-emerald-700" />
                        <span>Coverage Gain Per Effort:</span>
                      </span>
                      <div className="font-semibold text-emerald-800 truncate">
                        {activeContract.gainArithmetic || `+12.5% coverage / ${activeContract.effortClass || 'small'}`}
                      </div>
                    </div>
                  </div>

                  {/* Real Acceptance Checks Checklist */}
                  <div className="mt-6 pt-6 border-t border-[#D3CDBD] space-y-3">
                    <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#14171A] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-700" />
                        <span>Allow-Listed Acceptance Checks ({activeContract.checklist.length})</span>
                      </div>
                      <span className="text-[10px] text-[#575D65]">Evaluated statically via AST</span>
                    </div>

                    <div className="space-y-2.5 font-mono text-xs">
                      {activeContract.checklist.map((item: ContractChecklistItem, idx: number) => {
                        const isSatisfied = checklistResults[item.ruleId || ''] ?? item.satisfied;
                        return (
                          <div
                            key={item.id || idx}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isSatisfied
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900'
                                : 'bg-white/70 border-[#D3CDBD] text-[#14171A]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <div
                                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                                    isSatisfied
                                      ? 'bg-emerald-600 text-white'
                                      : 'border border-[#575D65] text-transparent'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="font-bold flex items-center gap-2">
                                    <span>{item.label}</span>
                                    {item.ruleId && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 font-normal text-[#575D65]">
                                        {item.ruleId}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#575D65] font-sans leading-relaxed">
                                    {item.description}
                                  </p>
                                  {item.reason && (
                                    <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                                      Reason: {item.reason} {item.file ? `(${item.file}${item.line ? `:${item.line}` : ''})` : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase ${
                                  isSatisfied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-black/10 text-[#575D65]'
                                }`}
                              >
                                {isSatisfied ? 'PASSED' : 'PENDING'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Must-Not-Move Lock Row */}
                  <div className="mt-6 pt-5 border-t border-[#D3CDBD] space-y-2">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[#575D65] font-bold">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Must-Not-Move Lock Row (Negative Prediction Safeguard)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeContract.mustNotMove && activeContract.mustNotMove.length > 0 ? (
                        activeContract.mustNotMove.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-[#D3CDBD] text-[11px] font-mono text-[#14171A]"
                          >
                            <Lock className="w-2.5 h-2.5 text-emerald-700" />
                            <span>{skill}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] font-mono text-[#575D65]">
                          Zero demonstrated skills locked — first skill milestone.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CI Test Results Line (Read-Only) */}
                  <div className="mt-4 p-3 rounded-xl bg-white/80 border border-[#D3CDBD] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-[#575D65]" />
                      <span className="font-semibold text-[#14171A]">Tests run by your CI:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          activeContract.ciStatus === 'passed'
                            ? 'bg-emerald-600 text-white'
                            : activeContract.ciStatus === 'failed'
                            ? 'bg-red-600 text-white'
                            : 'bg-black/10 text-[#575D65]'
                        }`}
                      >
                        {activeContract.ciStatus || 'not run'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#575D65] hidden sm:inline">
                      Read-only Checks API · zero server execution
                    </span>
                  </div>

                  {/* Recommendation Skeleton (Dashed Box - Never Counted as Evidence) */}
                  {activeContract.recommendationSkeleton && (
                    <div className="mt-6 pt-5 border-t border-[#D3CDBD] space-y-2">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-[#575D65]">
                        <span className="text-amber-800">
                          Recommendation only — template code is never counted as evidence
                        </span>
                        <button
                          type="button"
                          onClick={handleCopySkeleton}
                          className="flex items-center gap-1 text-emerald-800 hover:text-emerald-900 font-semibold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedSkeleton ? 'Copied!' : 'Copy Template'}</span>
                        </button>
                      </div>
                      <pre className="p-3.5 rounded-xl border-2 border-dashed border-[#B8B09F] bg-white/60 font-mono text-xs text-[#14171A] overflow-x-auto leading-relaxed">
                        <code>{activeContract.recommendationSkeleton}</code>
                      </pre>
                    </div>
                  )}

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
                        <span className="text-base text-emerald-900 font-extrabold">
                          {beforePercentage}% → {previewPercentage}%
                        </span>
                      </div>
                      <span className="text-emerald-700 font-semibold">Dry-run AST evaluation passed</span>
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

                  {/* Action CTA: Dry Run & Terminal Command */}
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#D3CDBD]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyGit}
                        className="p-2.5 rounded-lg bg-[#14171A] text-white hover:bg-black transition-colors flex items-center gap-2 font-mono text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCmd ? 'Copied Git Command!' : 'Copy Git Push Hook'}</span>
                      </button>
                    </div>

                    <Button
                      variant="solid_ink"
                      size="lg"
                      disabled={isDryRunning}
                      onClick={handleDryRun}
                    >
                      <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        <span>{isDryRunning ? 'Evaluating Static AST...' : 'Run Contract Dry-Run'}</span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
