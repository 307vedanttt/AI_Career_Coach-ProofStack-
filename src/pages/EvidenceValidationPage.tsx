import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  HelpCircle,
  Search,
  FileCode,
  GitCommit,
  User,
  ArrowRight,
  Sparkles,
  Info,
  Edit3,
  ShieldAlert,
} from 'lucide-react';
import { useProofStack } from '../context/ProofStackContext';
import { AppLayout } from '../components/layout/AppLayout';
import { SkillStatusBadge, HonestyBadge } from '../components/common/ProofBadges';
import { EvidenceItemModel } from '../types/proofstack';
import { Button } from '../components/ui/Button';

export const EvidenceValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    evidenceItems,
    selectedEvidenceId,
    setSelectedEvidenceId,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedSkillFilter,
    addReviewerNote,
    markEvidenceReviewed,
    setActiveContractId,
  } = useProofStack();

  const [searchQuery, setSearchQuery] = useState('');
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'list' | 'code' | 'reasoning'>('code');

  // Filter items
  const filteredEvidence = evidenceItems.filter((item) => {
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
      return false;
    }
    if (selectedSkillFilter && item.skillId !== selectedSkillFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchFile = item.filePath.toLowerCase().includes(q);
      const matchSkill = item.skillName.toLowerCase().includes(q);
      return matchTitle || matchFile || matchSkill;
    }
    return true;
  });

  const activeEvidence: EvidenceItemModel =
    evidenceItems.find((e) => e.id === selectedEvidenceId) ||
    filteredEvidence[0] ||
    evidenceItems[0];

  const handleSaveNote = () => {
    if (!reviewNoteInput.trim() || !activeEvidence) return;
    addReviewerNote(activeEvidence.id, reviewNoteInput.trim());
    setReviewNoteInput('');
  };

  const handleOpenContract = (contractId?: string) => {
    if (!contractId) return;
    setActiveContractId(contractId);
    navigate('/app/contracts');
  };

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto w-full pb-12">
        {/* TOP WORKSPACE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Evidence Validation Workspace</h1>
              <HonestyBadge label="Live Check" />
            </div>
            <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
              Multi-panel code inspection, AST verification signals, and 4-part explainable reasoning
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#131D32] border border-[#25324A] font-mono text-xs">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategoryFilter === 'all'
                  ? 'bg-violet-600 text-white font-bold'
                  : 'text-[#9AA3AE] hover:text-white'
              }`}
            >
              All ({evidenceItems.length})
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('accepted')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedCategoryFilter === 'accepted'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-[#9AA3AE] hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Accepted ({evidenceItems.filter((e) => e.category === 'accepted').length})</span>
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedCategoryFilter === 'rejected'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-[#9AA3AE] hover:text-rose-300'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Rejected ({evidenceItems.filter((e) => e.category === 'rejected').length})</span>
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('unclear')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedCategoryFilter === 'unclear'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-[#9AA3AE] hover:text-purple-300'
              }`}
            >
              <HelpCircle className="w-3 h-3" />
              <span>Unclear ({evidenceItems.filter((e) => e.category === 'unclear').length})</span>
            </button>
          </div>
        </div>

        {/* MOBILE WORKSPACE TAB SELECTOR */}
        <div className="lg:hidden flex items-center justify-around p-1 rounded-xl bg-[#131D32] border border-[#25324A] font-mono text-xs">
          <button
            onClick={() => setMobilePanel('list')}
            className={`flex-1 py-2 text-center rounded-lg ${
              mobilePanel === 'list' ? 'bg-violet-600 text-white font-bold' : 'text-[#9AA3AE]'
            }`}
          >
            Evidence List
          </button>
          <button
            onClick={() => setMobilePanel('code')}
            className={`flex-1 py-2 text-center rounded-lg ${
              mobilePanel === 'code' ? 'bg-violet-600 text-white font-bold' : 'text-[#9AA3AE]'
            }`}
          >
            Code Context
          </button>
          <button
            onClick={() => setMobilePanel('reasoning')}
            className={`flex-1 py-2 text-center rounded-lg ${
              mobilePanel === 'reasoning' ? 'bg-violet-600 text-white font-bold' : 'text-[#9AA3AE]'
            }`}
          >
            Reasoning & Notes
          </button>
        </div>

        {/* 3-PANEL WORKSPACE CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* PANEL 1: LEFT NAVIGATOR (3 cols on lg) */}
          <div
            className={`lg:col-span-3 space-y-3 ${
              mobilePanel !== 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file, title, skill..."
                className="w-full px-3 py-2 pl-8 rounded-xl bg-[#131D32] border border-[#25324A] text-xs font-mono text-white placeholder-[#9AA3AE]/40 focus:outline-none focus:border-violet-500"
              />
              <Search className="w-3.5 h-3.5 text-[#9AA3AE]/60 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* List of Evidence Items */}
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredEvidence.map((item) => {
                const isSelected = activeEvidence?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedEvidenceId(item.id);
                      setMobilePanel('code');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A2642] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                        : 'bg-[#131D32] border-[#25324A] hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-cyan-300 font-semibold truncate">
                        {item.skillName}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          item.category === 'accepted'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : item.category === 'rejected'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA3AE] pt-2 mt-2 border-t border-[#25324A]/60">
                      <span className="truncate max-w-[140px]">{item.filePath.split('/').pop()}</span>
                      <span className={item.reviewerStatus === 'reviewed' ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.reviewerStatus === 'reviewed' ? '✓ Reviewed' : '● Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANEL 2: CENTER CODE EXCERPT & CONTEXT (5 cols on lg) */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobilePanel !== 'code' ? 'hidden lg:block' : 'block'
            }`}
          >
            {activeEvidence ? (
              <div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
                {/* Title & Metadata Strip */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {activeEvidence.skillName}
                    </span>
                    <HonestyBadge label={activeEvidence.honestyLabel} />
                  </div>

                  <h2 className="text-base font-bold text-white tracking-tight">{activeEvidence.title}</h2>
                  <p className="text-xs text-[#9AA3AE] font-mono">{activeEvidence.shortExplanation}</p>
                </div>

                {/* File Header Bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0B1020] border border-[#25324A] text-xs font-mono">
                  <div className="flex items-center gap-2 text-white truncate">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-semibold">{activeEvidence.filePath}</span>
                  </div>
                  <span className="text-[#9AA3AE] shrink-0">
                    Lines {activeEvidence.lineRange[0]}–{activeEvidence.lineRange[1]}
                  </span>
                </div>

                {/* Syntax-Highlighted Code Excerpt */}
                <div className="rounded-xl bg-[#080B14] border border-[#25324A] overflow-hidden p-4 font-mono text-xs text-[#E2E8F0] shadow-inner leading-relaxed">
                  <pre className="overflow-x-auto">
                    <code>{activeEvidence.excerpt}</code>
                  </pre>
                </div>

                {/* Contribution Context Strip */}
                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#25324A] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-[#9AA3AE] font-bold">Contribution Provenance</span>
                    <span className="text-[10px] text-cyan-400">AST Node Verified</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[#9AA3AE]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-white font-medium">{activeEvidence.contributionContext.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                      <code className="text-white">{activeEvidence.contributionContext.commitHash}</code>
                      <span>({activeEvidence.contributionContext.timestamp.slice(0, 10)})</span>
                    </div>
                  </div>
                </div>

                {/* Known Limitation Box */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-200/90 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[10px]">
                    <Info className="w-3 h-3" />
                    <span>Known Analysis Limitation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{activeEvidence.knownLimitations}</p>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#131D32] border border-[#25324A] text-center text-[#9AA3AE] font-mono text-xs">
                No evidence selected. Pick an item from the left panel.
              </div>
            )}
          </div>

          {/* PANEL 3: RIGHT EXPLAINABLE REASONING & REVIEW ACTIONS (4 cols on lg) */}
          <div
            className={`lg:col-span-4 space-y-4 ${
              mobilePanel !== 'reasoning' ? 'hidden lg:block' : 'block'
            }`}
          >
            {activeEvidence && (
              <>
                {/* 4-Part Explainable Reasoning Card */}
                <div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#25324A] pb-3">
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>Why this decision?</span>
                    </h3>
                    <SkillStatusBadge status={activeEvidence.assessmentStatus} size="sm" />
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {/* 1. Observation */}
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#25324A] space-y-1">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                        1. Observation (What was found)
                      </span>
                      <p className="text-[#9AA3AE] leading-relaxed">{activeEvidence.whyDecision.observation}</p>
                    </div>

                    {/* 2. Interpretation */}
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#25324A] space-y-1">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                        2. Interpretation (Relevance)
                      </span>
                      <p className="text-[#9AA3AE] leading-relaxed">{activeEvidence.whyDecision.interpretation}</p>
                    </div>

                    {/* 3. Limitation */}
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#25324A] space-y-1">
                      <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                        3. Limitation (What cannot be inferred)
                      </span>
                      <p className="text-[#9AA3AE] leading-relaxed">{activeEvidence.whyDecision.limitation}</p>
                    </div>

                    {/* 4. Next Step */}
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#25324A] space-y-1">
                      <span className="text-[10px] text-violet-400 uppercase font-bold tracking-wider">
                        4. Next Step (How to strengthen)
                      </span>
                      <p className="text-[#9AA3AE] leading-relaxed">{activeEvidence.whyDecision.nextStep}</p>
                    </div>
                  </div>

                  {/* Commit Contract Trigger CTA */}
                  {activeEvidence.relatedContractId && (
                    <Button
                      variant="solid_paper"
                      size="sm"
                      onClick={() => handleOpenContract(activeEvidence.relatedContractId)}
                      icon={<ArrowRight className="w-3.5 h-3.5 text-[#14171A]" />}
                      className="w-full justify-center mt-2"
                    >
                      Resolve Gap in Commit Contract
                    </Button>
                  )}
                </div>

                {/* Reviewer Note & Approval Card */}
                <div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Reviewer Assessment Note</span>
                    </span>
                    <button
                      onClick={() => markEvidenceReviewed(activeEvidence.id)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        activeEvidence.reviewerStatus === 'reviewed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                      }`}
                    >
                      {activeEvidence.reviewerStatus === 'reviewed' ? '✓ Marked Reviewed' : 'Mark as Reviewed'}
                    </button>
                  </div>

                  {activeEvidence.reviewerNote && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                      <strong>Recorded Note: </strong>{activeEvidence.reviewerNote}
                    </div>
                  )}

                  <div className="space-y-2">
                    <textarea
                      value={reviewNoteInput}
                      onChange={(e) => setReviewNoteInput(e.target.value)}
                      placeholder="Add an engineering note or interviewer comment..."
                      rows={2}
                      className="w-full p-2.5 rounded-lg bg-[#0B1020] border border-[#25324A] text-white text-xs placeholder-[#9AA3AE]/40 focus:outline-none focus:border-violet-500"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={!reviewNoteInput.trim()}
                      className="w-full justify-center border border-[#25324A] text-white hover:bg-[#1A2642]"
                    >
                      Save Note to Audit Ledger
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
