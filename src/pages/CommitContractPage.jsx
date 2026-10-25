import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Code, Check, Play, Layers, } from 'lucide-react';
import { useProofStack } from '../context/ProofStackContext';
import { AppLayout } from '../components/layout/AppLayout';
import { SkillStatusBadge, HonestyBadge } from '../components/common/ProofBadges';
import { Button } from '../components/ui/Button';
export const CommitContractPage = () => {
    const navigate = useNavigate();
    const { contracts, activeContractId, setActiveContractId, updateContractStatus, submitContract, acceptContractEvidence, } = useProofStack();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const activeContract = contracts.find((c) => c.id === activeContractId) || contracts[0];
    const handleStart = () => {
        updateContractStatus(activeContract.id, 'In Progress');
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        await submitContract(activeContract.id);
        setIsSubmitting(false);
    };
    const handleAccept = () => {
        acceptContractEvidence(activeContract.id);
    };
    return (<AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Dynamic Commit Contracts</h1>
              <HonestyBadge label="Derived Signal"/>
            </div>
            <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
              Closed-loop engineering challenges generated directly from verified repository evidence gaps
            </p>
          </div>

          <Link to="/app/proof-map" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131D32] border border-[#25324A] text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors shrink-0">
            <Layers className="w-3.5 h-3.5"/>
            <span>Return to Proof Map</span>
          </Link>
        </div>

        {/* CONTRACT SELECTION TABS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {contracts.map((c) => {
            const isSelected = activeContract.id === c.id;
            return (<div key={c.id} onClick={() => setActiveContractId(c.id)} className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                    ? 'bg-[#1A2642] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                    : 'bg-[#131D32] border-[#25324A] hover:border-violet-500/40'}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-cyan-300 font-semibold">{c.targetSkillName}</span>
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${c.status === 'Reviewed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : c.status === 'Under Review'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : c.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/40'}`}>
                    {c.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white line-clamp-1">{c.title}</h3>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA3AE] pt-2 mt-2 border-t border-[#25324A]/60">
                  <span>Effort: {c.estimatedEffort}</span>
                  <span className="text-emerald-400">Target: Strong</span>
                </div>
              </div>);
        })}
        </div>

        {/* ACTIVE CONTRACT DETAIL VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: CONTRACT SPECIFICATION & ACCEPTANCE CRITERIA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-5">
              {/* Header Strip */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Target Skill: {activeContract.targetSkillName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#9AA3AE]">Lifecycle:</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {activeContract.status}
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight">{activeContract.title}</h2>
              </div>

              {/* Assessment State Transition Strip */}
              <div className="p-4 rounded-xl bg-[#0B1020] border border-[#25324A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#9AA3AE] uppercase block mb-1">Current Evidence State</span>
                  <SkillStatusBadge status={activeContract.currentSkillState} size="sm"/>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 hidden sm:block shrink-0"/>
                <div>
                  <span className="text-[10px] text-[#9AA3AE] uppercase block mb-1">Target Verification State</span>
                  <SkillStatusBadge status={activeContract.targetSkillState} size="sm"/>
                </div>
              </div>

              {/* Reason Generated */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase text-violet-400 font-bold tracking-wider">
                  Reason Generated from Repository Audit:
                </span>
                <p className="text-[#9AA3AE] leading-relaxed p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A]">
                  {activeContract.reasonGenerated}
                </p>
              </div>

              {/* Required Work Deliverables */}
              <div className="space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">
                  Required Engineering Deliverables:
                </span>
                <div className="space-y-1.5">
                  {activeContract.requiredWork.map((work, idx) => (<div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#0B1020] border border-[#25324A] text-[#E2E8F0]">
                      <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-cyan-400 text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{work}</span>
                    </div>))}
                </div>
              </div>

              {/* Acceptance Criteria Checklist */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                    Acceptance Criteria Checklist:
                  </span>
                  <span className="text-[10px] text-[#9AA3AE]">
                    {activeContract.acceptanceCriteria.filter((c) => c.satisfied).length} of {activeContract.acceptanceCriteria.length} Satisfied
                  </span>
                </div>

                <div className="space-y-2">
                  {activeContract.acceptanceCriteria.map((crit) => (<div key={crit.id} className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${crit.satisfied
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-[#0B1020] border-[#25324A] text-[#9AA3AE]'}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${crit.satisfied
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-white/5 border border-white/10 text-transparent'}`}>
                          <Check className="w-3.5 h-3.5"/>
                        </div>
                        <div>
                          <p className={`font-medium ${crit.satisfied ? 'text-white' : 'text-[#9AA3AE]'}`}>
                            {crit.label}
                          </p>
                          <span className="text-[10px] text-[#9AA3AE]/70 block pt-0.5">{crit.detail}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border shrink-0 ${crit.satisfied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 text-[#9AA3AE] border-white/10'}`}>
                        {crit.satisfied ? 'PASSED' : 'PENDING'}
                      </span>
                    </div>))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SUBMISSION, CODE DIFF & IMPACT REVIEW */}
          <div className="lg:col-span-5 space-y-6">
            {/* Interactive Challenge Action Card */}
            <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400"/>
                <span>Challenge Execution Lifecycle</span>
              </h3>

              <p className="text-[#9AA3AE] leading-relaxed">
                Work through the engineering challenge in isolated branch scope. Submitting triggers criterion-based AST review without opaque AI guessing.
              </p>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2">
                {activeContract.status === 'Not Started' && (<Button variant="solid_paper" size="md" onClick={handleStart} className="w-full justify-center">
                    Start Commit Contract
                  </Button>)}

                {activeContract.status === 'In Progress' && (<Button variant="solid_paper" size="md" onClick={handleSubmit} isLoading={isSubmitting} icon={<Play className="w-4 h-4 text-[#14171A]"/>} className="w-full justify-center">
                    Submit Code Changes for Review
                  </Button>)}

                {activeContract.status === 'Under Review' && (<div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs">
                      <div className="font-bold text-white mb-1">Simulated Criteria Review Completed</div>
                      All 4 acceptance criteria satisfied. The diff verified against AST invariants. Ready to accept evidence.
                    </div>
                    <Button variant="solid_paper" size="md" onClick={handleAccept} icon={<CheckCircle2 className="w-4 h-4 text-[#14171A]"/>} className="w-full justify-center">
                      Accept Evidence & Upgrade Skill
                    </Button>
                  </div>)}

                {activeContract.status === 'Reviewed' && (<div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs">
                      <div className="font-bold text-white mb-1">Contract Fulfilled & Evidence Locked</div>
                      Skill <strong>{activeContract.targetSkillName}</strong> is now{' '}
                      <strong>{activeContract.targetSkillState}</strong>.
                    </div>
                    <Button variant="ghost" size="md" onClick={() => navigate('/app/proof-map')} icon={<Layers className="w-4 h-4 text-cyan-400"/>} className="w-full justify-center border border-[#25324A] text-white hover:bg-[#1A2642]">
                      View Updated Proof Map
                    </Button>
                  </div>)}
              </div>
            </div>

            {/* Simulated Code Diff Preview */}
            {activeContract.diffPreview && (<div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Code className="w-3.5 h-3.5 text-cyan-400"/>
                    <span>Submission Diff Preview</span>
                  </div>
                  <code className="text-[#9AA3AE]">{activeContract.diffPreview.file}</code>
                </div>

                <div className="p-3 rounded-xl bg-[#080B14] border border-[#25324A] font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed max-h-60">
                  <pre>
                    <code>{activeContract.diffPreview.diffSnippet}</code>
                  </pre>
                </div>
              </div>)}

            {/* Impact Outcome Summary */}
            {activeContract.reviewOutcome && (<div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>Challenge Impact Report</span>
                  <HonestyBadge label="Derived Signal"/>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1020] space-y-2 text-[#9AA3AE]">
                  <div className="flex items-center justify-between">
                    <span>Criteria Satisfied:</span>
                    <strong className="text-white">
                      {activeContract.reviewOutcome.criteriaSatisfiedCount} / {activeContract.reviewOutcome.totalCriteriaCount}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Previous State:</span>
                    <span className="text-amber-400">{activeContract.reviewOutcome.previousState}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Updated State:</span>
                    <span className="text-emerald-400 font-bold">{activeContract.reviewOutcome.updatedState}</span>
                  </div>
                  <p className="text-[11px] text-[#9AA3AE] pt-1 leading-relaxed border-t border-[#25324A]/60 mt-1">
                    {activeContract.reviewOutcome.explanation}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </AppLayout>);
};
