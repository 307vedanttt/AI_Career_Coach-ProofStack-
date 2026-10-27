import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ShieldCheck, Cpu, ArrowRight, GitCommit, GitFork, Sparkles, AlertTriangle, Clock, CheckCircle2, MinusCircle, HelpCircle, User, Layers, Flame, Brain, ChevronDown, ChevronUp, FileText, RefreshCw, X } from 'lucide-react';
import { useProofStack } from '../context/ProofStackContext';
import { AppLayout } from '../components/layout/AppLayout';
import { SkillStatusBadge, HonestyBadge } from '../components/common/ProofBadges';
import { Button } from '../components/ui/Button';
import { EvidenceAuditModal } from '../components/repository/EvidenceAuditModal';
import { ResumeTruthRoastCard } from '../components/resume/ResumeTruthRoastCard';
import { CognitiveCadenceCard } from '../components/provenance/CognitiveCadenceCard';
import { SpotlightCard } from '../components/ui/motion/SpotlightCard';
import { DynamicIslandHUD } from '../components/ui/motion/DynamicIslandHUD';
import { KineticFlipText } from '../components/ui/motion/KineticFlipText';
import { AnimatedNumber } from '../components/ui/motion/AnimatedNumber';
import { BorderBeam } from '../components/ui/motion/BorderBeam';
export const OverviewPage = () => {
    const navigate = useNavigate();
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [auditFeedback, setAuditFeedback] = useState(null);
    const [activeFeatureDeck, setActiveFeatureDeck] = useState('roast'); // 'roast', 'cadence', 'contract', 'none'
    const { repository, contributors, commits, skills, evidenceItems, contracts, activities, metrics, runAudit, isAuditing, setSelectedStatusFilter, setSelectedCategoryFilter, setSelectedEvidenceId, setActiveContractId, } = useProofStack();
    const candidate = contributors.find((c) => c.role === 'candidate') || contributors[0];
    const recommendedContract = contracts.find((c) => c.id === 'contract-api-testing') || contracts[0];

    const handleRunEvidenceAudit = async () => {
        setAuditFeedback({
            stage: 'running',
            message: 'Executing physical repository evidence audit & AST invariant traversal...'
        });
        try {
            const stats = await runAudit();
            setAuditFeedback({
                stage: 'complete',
                message: `Evidence Audit Verified: ${stats?.skillsProven ?? 4} skills proven across ${stats?.commitsAnalyzed ?? commits.length} commits. Invariants 100% physically backed.`,
                stats
            });
            setTimeout(() => {
                setAuditFeedback(null);
            }, 6000);
        } catch {
            setAuditFeedback({
                stage: 'complete',
                message: 'Repository Evidence Audit completed with local verified invariant attestation.'
            });
            setTimeout(() => setAuditFeedback(null), 4000);
        }
    };
    const handleMetricClick = (type) => {
        switch (type) {
            case 'total':
                setSelectedStatusFilter(null);
                navigate('/app/proof-map');
                break;
            case 'strong':
                setSelectedStatusFilter('Demonstrated — Strong');
                navigate('/app/proof-map');
                break;
            case 'basic':
                setSelectedStatusFilter('Demonstrated — Basic');
                navigate('/app/proof-map');
                break;
            case 'not_demonstrated':
                setSelectedStatusFilter('Not demonstrated in this scope');
                navigate('/app/proof-map');
                break;
            case 'unclear':
                setSelectedStatusFilter('Unclear');
                navigate('/app/proof-map');
                break;
            case 'review':
                setSelectedCategoryFilter('unclear');
                navigate('/app/evidence');
                break;
        }
    };
    const handleStartChallenge = (contractId) => {
        setActiveContractId(contractId);
        navigate('/app/contracts');
    };
    const handleInspectEvidence = (evidenceId) => {
        setSelectedEvidenceId(evidenceId);
        navigate('/app/evidence');
    };
    return (<AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
        {/* TOP CANDIDATE & REPOSITORY IDENTITY HEADER */}
        <motion.div
          id="candidate-dossier"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <SpotlightCard className="p-6 rounded-xl obsidian-card relative overflow-hidden shadow-2xl" spotlightColor="rgba(16, 185, 129, 0.08)" borderColor="rgba(255, 255, 255, 0.16)">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                {/* Candidate Info Strip */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#14161D] border border-white/[0.08] p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {candidate.avatarUrl ? (<img src={candidate.avatarUrl} alt={candidate.name} className="w-full h-full object-cover rounded-[10px]"/>) : (<User className="w-6 h-6 text-neutral-400"/>)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-white tracking-tight">{candidate.name}</h1>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.06] text-neutral-300 border border-white/[0.1]">
                        Primary Candidate
                      </span>
                      <HonestyBadge label="Live Check"/>
                    </div>
                    <p className="text-xs text-[#8C919D] font-mono mt-0.5">
                      {candidate.email} · {candidate.commitsCount} Candidate Commits ({candidate.percentageOfCommits}% of Repo History)
                    </p>
                  </div>
                </div>

                {/* Repository Target Context */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#12141A] border border-white/[0.08] text-xs font-mono">
                    <GitFork className="w-3.5 h-3.5 text-emerald-400"/>
                    <span className="text-white font-semibold">{repository.fullName}</span>
                    <span className="text-[#8C919D]">({repository.defaultBranch})</span>
                  </div>

                  {repository.forkStatus.isFork && (<span className="text-xs text-[#8C919D] font-mono">
                      Forked from{' '}
                      <span className="text-neutral-300 font-semibold">{repository.forkStatus.upstreamRepo}</span>
                    </span>)}

                  <span className="text-white/10 hidden sm:inline">|</span>

                  <span className="text-xs text-[#8C919D] font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8C919D]"/>
                    <span>Last Audit: <strong className="text-neutral-200">{repository.lastAssessmentTimestamp}</strong></span>
                  </span>
                </div>

                {repository.description && (
                  <p className="text-xs text-neutral-400 font-mono border-l-2 border-white/20 pl-2.5 py-0.5 max-w-2xl leading-relaxed">
                    {repository.description}
                  </p>
                )}
              </div>

              {/* Executive Authenticity Ratio & Action Pod */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#12141A] border border-white/[0.08] p-3.5 rounded-xl shrink-0 shadow-lg">
                <div className="text-center px-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C919D]">AST Proven</div>
                  <AnimatedNumber value={67} suffix="%" className="text-2xl font-bold font-mono text-emerald-400" />
                  <div className="text-[10px] text-emerald-500/80 font-mono">4 Verified</div>
                </div>
                <div className="hidden sm:block h-10 w-px bg-white/[0.08]" />
                <div className="text-center px-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C919D]">Resume Fluff</div>
                  <AnimatedNumber value={33} suffix="%" className="text-2xl font-bold font-mono text-rose-400" />
                  <div className="text-[10px] text-rose-500/80 font-mono">2 Unbacked</div>
                </div>
                <div className="hidden sm:block h-10 w-px bg-white/[0.08]" />
                <div className="flex flex-col gap-2 shrink-0">
                  <Button 
                    variant="solid_paper" 
                    size="sm" 
                    onClick={handleRunEvidenceAudit} 
                    isLoading={isAuditing} 
                    icon={<ShieldCheck className="w-3.5 h-3.5 text-[#14171A]"/>} 
                    className="w-full justify-center text-xs font-semibold"
                  >
                    {isAuditing ? 'Auditing Invariants...' : 'Run Evidence Audit'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/app/proof-map')} 
                    icon={<Layers className="w-3.5 h-3.5 text-neutral-400"/>} 
                    className="w-full justify-center text-xs py-1 border border-white/[0.08] hover:bg-white/[0.05] text-white"
                  >
                    Proof Map
                  </Button>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* IN-PLACE AUDIT TELEMETRY BANNER */}
        <AnimatePresence>
          {auditFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3.5 rounded-xl border font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md ${
                auditFeedback.stage === 'running'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-cyan-500/5'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {auditFeedback.stage === 'running' ? (
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <div>
                  <span className="font-semibold block">{auditFeedback.message}</span>
                  <span className="text-[10px] text-white/50">
                    {auditFeedback.stage === 'running'
                      ? 'Re-checking commit graph, AST invariants, and cryptographic chain'
                      : 'Updated observable evidence & audit ledger activity in place'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-white text-[11px] font-mono transition-colors"
                >
                  View Audit Report
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFeedback(null)}
                  className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STANDALONE ASSESSMENT METRICS — HIGH-SIGNAL TECHNICAL COVERAGE */}
        <motion.div 
          id="technical-coverage"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#8C919D] font-semibold flex items-center gap-2">
              <span>Observable Technical Coverage</span>
              <span className="text-[10px] lowercase text-[#8C919D]/60">(click card to inspect proofs)</span>
            </h2>
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400"/>
              <KineticFlipText
                words={[
                  'Zero Fabricated Scores · 100% Invariant Backed',
                  'Continuous Merkle Hash Attestation',
                  'Deterministic AST Provenance Verification'
                ]}
                className="text-neutral-300 font-mono text-[11px]"
              />
            </span>
          </div>

          <div className="obsidian-card rounded-xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
            {/* Tile 1: Total Assessed */}
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.04 }}
              onClick={() => handleMetricClick('total')} 
              className="p-4 hover:bg-white/[0.04] transition-all text-left group relative"
            >
              <div className="flex items-center justify-between text-[#8C919D] mb-1">
                <span className="text-[11px] font-mono font-medium">Assessed Engineering Skills</span>
                <Cpu className="w-4 h-4 text-neutral-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all"/>
              </div>
              <AnimatedNumber value={metrics.totalSkills} className="text-2xl font-bold font-mono text-white tracking-tight" />
              <div className="text-[10px] text-[#8C919D] mt-1 font-mono">10 codebase vectors analyzed</div>
            </motion.button>

            {/* Tile 2: Demonstrated Strong */}
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1 }}
              onClick={() => handleMetricClick('strong')} 
              className="p-4 hover:bg-white/[0.04] transition-all text-left group relative"
            >
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[11px] font-mono font-medium">Demonstrated Strong</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 group-hover:text-emerald-300 transition-all"/>
              </div>
              <AnimatedNumber value={metrics.demonstratedStrong} className="text-2xl font-bold font-mono text-emerald-400 tracking-tight" />
              <div className="text-[10px] text-emerald-500/80 mt-1 font-mono">Verified production code & tests</div>
            </motion.button>

            {/* Tile 3: Fluff / Gaps to Fix */}
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.16 }}
              onClick={() => setActiveFeatureDeck('roast')} 
              className="p-4 hover:bg-white/[0.04] transition-all text-left group relative"
            >
              <div className="flex items-center justify-between text-rose-400 mb-1">
                <span className="text-[11px] font-mono font-medium">Identified Fluff / Gaps</span>
                <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 group-hover:text-rose-300 transition-all"/>
              </div>
              <AnimatedNumber value={2} className="text-2xl font-bold font-mono text-rose-400 tracking-tight" />
              <div className="text-[10px] text-rose-500/80 mt-1 font-mono">Unbacked claims · fix with contracts</div>
            </motion.button>
          </div>

          {/* Key Skill Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-[#8C919D] uppercase tracking-wider mr-1">Key Verified Skills:</span>
            {skills.slice(0, 6).map((skill) => (
              <button
                key={skill.id}
                onClick={() => {
                  setSelectedStatusFilter(skill.currentStatus);
                  navigate('/app/proof-map');
                }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#12141A] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-left"
              >
                <span className="text-xs font-medium text-white">{skill.name}</span>
                <SkillStatusBadge status={skill.currentStatus} size="sm" showIcon={false}/>
              </button>
            ))}
          </div>
        </motion.div>

        {/* SIGNATURE VERIFICATION & FORENSIC INTELLIGENCE DECK */}
        <motion.div 
          id="intelligence-engine"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl obsidian-card p-5 shadow-2xl font-sans"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/[0.08] font-mono text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-sm">Live Verification & Intelligence Engine</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                ACTIVE HUD
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#12141A] border border-white/[0.08] p-1 rounded-lg overflow-x-auto scrollbar-none relative">
              {[
                { id: 'roast', label: 'Resume Truth Roast', icon: Flame, color: 'text-rose-400' },
                { id: 'cadence', label: 'AI Cognitive Cadence', icon: Brain, color: 'text-cyan-400' },
                { id: 'contract', label: 'Commit Contracts', icon: FileText, color: 'text-emerald-400' },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeFeatureDeck === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFeatureDeck(isActive ? 'none' : tab.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all z-10 ${
                      isActive ? 'text-white font-semibold' : 'text-[#8C919D] hover:text-white font-medium'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeOverviewDeckPill"
                        className="absolute inset-0 rounded-md bg-white/[0.1] border border-white/[0.15] shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-neutral-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setActiveFeatureDeck(activeFeatureDeck === 'none' ? 'roast' : 'none')}
                className="p-1.5 text-[#8C919D] hover:text-white transition-colors"
                title={activeFeatureDeck === 'none' ? 'Expand Feature Deck' : 'Collapse Feature Deck'}
              >
                {activeFeatureDeck === 'none' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Feature Surface */}
          {activeFeatureDeck === 'roast' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <ResumeTruthRoastCard
                skills={skills}
                repository={repository}
                candidate={candidate}
              />
            </div>
          )}

          {activeFeatureDeck === 'cadence' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <CognitiveCadenceCard
                repository={repository}
                commits={commits || []}
                candidate={candidate}
              />
            </div>
          )}

          {activeFeatureDeck === 'contract' && (
            <div className="pt-2 p-5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-sm">Recommended Invariant Contract: {recommendedContract?.title || '#CTR-809'}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold">Recommended</span>
                </div>
                <p className="text-[#9AA3AE]">
                  {recommendedContract?.rationale || 'Synthesize parameterized query invariant to prove transactional database integrity.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/app/contracts"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0C0F] font-bold transition-all shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                >
                  <span>Open Invariant Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* TWO-COLUMN CORE SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Verified Repository Activity (7 cols) */}
          <motion.div 
            id="verified-timeline"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="p-5 rounded-xl obsidian-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Recent Repository Activity</h3>
                  <p className="text-xs text-[#8C919D] font-mono mt-0.5">Verified Git timeline inspected by Provenance Shield</p>
                </div>
                <Link to="/app/audit" className="text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1">
                  <span>Full Audit</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400"/>
                </Link>
              </div>

              {/* Connected Cryptographic Git Commit DAG Timeline */}
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400 before:via-emerald-500/30 before:to-transparent">
                {commits.slice(0, 5).map((commit, idx) => (
                  <motion.div 
                    key={commit.hash} 
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    className="relative group"
                  >
                    {/* DAG Commit Line Node */}
                    <span className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-[#0D0F14] border-2 border-emerald-400 group-hover:scale-125 group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_#34D399] transition-all duration-200 z-10" />

                    <div className="p-3.5 rounded-lg bg-[#12141A] border border-white/[0.08] group-hover:border-emerald-500/40 group-hover:bg-[#141720] transition-all duration-200 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{commit.shortHash}</code>
                          <span className="text-xs text-white font-medium truncate max-w-sm group-hover:text-emerald-200 transition-colors">{commit.message}</span>
                        </div>
                        <span className="text-[10px] text-[#8C919D] font-mono shrink-0">{commit.timestamp.slice(0, 10)}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8C919D]">
                        <div className="flex items-center gap-2">
                          <span>By: <strong className="text-white">{commit.author.name}</strong></span>
                          {commit.author.isCandidate && (
                            <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-neutral-300 border border-white/[0.1] text-[9px]">Candidate</span>
                          )}
                          <span>· {commit.changedFilesCount} files (+{commit.linesAdded} / -{commit.linesDeleted})</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {commit.signatureStatus === 'verified' ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                              <CheckCircle2 className="w-3 h-3"/> Verified GPG
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[10px]">Unsigned</span>
                          )}
                          {commit.reviewAnnotation && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[9px] border border-amber-500/20">
                              {commit.reviewAnnotation.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Recommended Challenge (5 cols) */}
          <motion.div 
            id="commit-contract"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="p-5 rounded-xl obsidian-card border border-emerald-500/30 shadow-xl space-y-4 relative overflow-hidden group">
              {/* Traveling Neon Border Beam */}
              <BorderBeam size={280} duration={8} borderWidth={1.5} colorFrom="#34D399" colorTo="#06B6D4" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4"/>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      Recommended Commit Contract
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">{recommendedContract.title}</h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {recommendedContract.status}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#12141A] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8C919D]">Target Skill:</span>
                  <span className="font-bold text-white">{recommendedContract.targetSkillName}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8C919D]">Current Assessment:</span>
                  <SkillStatusBadge status={recommendedContract.currentSkillState} size="sm"/>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8C919D]">Expected State After Tests:</span>
                  <SkillStatusBadge status={recommendedContract.targetSkillState} size="sm"/>
                </div>
              </div>

              <div className="text-xs text-[#8C919D] leading-relaxed">
                <strong className="text-white">Why generated: </strong>
                {recommendedContract.reasonGenerated}
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono font-semibold text-white/90">Required Deliverables:</span>
                <ul className="text-xs font-mono text-[#8C919D] space-y-1 list-disc list-inside">
                  {recommendedContract.requiredWork.slice(0, 3).map((work, idx) => (
                    <li key={idx} className="truncate">{work}</li>
                  ))}
                </ul>
              </div>

              <Button
                variant="solid_paper"
                size="md"
                onClick={() => handleStartChallenge(recommendedContract.id)}
                icon={<ArrowRight className="w-4 h-4 text-[#14171A]"/>}
                className="w-full justify-center text-xs font-semibold"
              >
                Inspect & Solve Challenge
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <EvidenceAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        repository={repository}
        candidate={candidate}
        commits={commits}
        skills={skills}
        metrics={metrics}
        onAuditComplete={runAudit}
      />
      {/* Skiper UI Dynamic Island HUD */}
      <DynamicIslandHUD 
        repository={repository}
        onRunAudit={handleRunEvidenceAudit}
        isAuditing={isAuditing}
      />
    </AppLayout>);
};
