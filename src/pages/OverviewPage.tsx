import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Cpu,
  ArrowRight,
  GitCommit,
  GitFork,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MinusCircle,
  HelpCircle,
  User,
  Layers,
} from 'lucide-react';
import { useProofStack } from '../context/ProofStackContext';
import { AppLayout } from '../components/layout/AppLayout';
import { SkillStatusBadge, HonestyBadge } from '../components/common/ProofBadges';
import { Button } from '../components/ui/Button';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    repository,
    contributors,
    commits,
    skills,
    evidenceItems,
    contracts,
    activities,
    metrics,
    runAudit,
    isAuditing,
    setSelectedStatusFilter,
    setSelectedCategoryFilter,
    setSelectedEvidenceId,
    setActiveContractId,
  } = useProofStack();

  const candidate = contributors.find((c) => c.role === 'candidate') || contributors[0];
  const recommendedContract = contracts.find((c) => c.id === 'contract-api-testing') || contracts[0];

  const handleMetricClick = (type: 'total' | 'strong' | 'basic' | 'not_demonstrated' | 'unclear' | 'review') => {
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

  const handleStartChallenge = (contractId: string) => {
    setActiveContractId(contractId);
    navigate('/app/contracts');
  };

  const handleInspectEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    navigate('/app/evidence');
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
        {/* TOP CANDIDATE & REPOSITORY IDENTITY HEADER */}
        <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Candidate Info Strip */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-[#25324A] p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                  {candidate.avatarUrl ? (
                    <img src={candidate.avatarUrl} alt={candidate.name} className="w-full h-full object-cover rounded-[10px]" />
                  ) : (
                    <User className="w-6 h-6 text-violet-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight">{candidate.name}</h1>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Primary Candidate
                    </span>
                    <HonestyBadge label="Live Check" />
                  </div>
                  <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
                    {candidate.email} · {candidate.commitsCount} Candidate Commits ({candidate.percentageOfCommits}% of Repo History)
                  </p>
                </div>
              </div>

              {/* Repository Target Context */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1020] border border-[#25324A] text-xs font-mono">
                  <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white font-semibold">{repository.fullName}</span>
                  <span className="text-[#9AA3AE]">({repository.defaultBranch})</span>
                </div>

                {repository.forkStatus.isFork && (
                  <span className="text-xs text-[#9AA3AE] font-mono">
                    Forked from{' '}
                    <span className="text-cyan-300 font-semibold">{repository.forkStatus.upstreamRepo}</span>
                  </span>
                )}

                <span className="text-[#25324A] hidden sm:inline">|</span>

                <span className="text-xs text-[#9AA3AE] font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9AA3AE]" />
                  <span>Last Audit: <strong className="text-white">{repository.lastAssessmentTimestamp}</strong></span>
                </span>
              </div>

              <p className="text-xs text-[#9AA3AE] max-w-2xl leading-relaxed">
                {repository.description}
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex sm:flex-col gap-2.5 shrink-0">
              <Button
                variant="solid_paper"
                size="md"
                onClick={runAudit}
                isLoading={isAuditing}
                icon={<ShieldCheck className="w-4 h-4 text-[#14171A]" />}
                className="w-full justify-center"
              >
                Run Evidence Audit
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => navigate('/app/proof-map')}
                icon={<Layers className="w-4 h-4 text-cyan-400" />}
                className="w-full justify-center border border-[#25324A] hover:bg-[#1A2642] text-white"
              >
                View Proof Map
              </Button>
            </div>
          </div>
        </div>

        {/* 6 STANDALONE ASSESSMENT METRICS (NO FABRICATED TRUST SCORE) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#9AA3AE] font-semibold flex items-center gap-2">
              <span>Observable Technical Coverage</span>
              <span className="text-[10px] lowercase text-[#9AA3AE]/60">(click tile to filter evidence)</span>
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero Fabricated Scores · 100% Invariant Backed</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Tile 1: Total Assessed */}
            <button
              onClick={() => handleMetricClick('total')}
              className="p-4 rounded-xl bg-[#131D32] hover:bg-[#1A2642] border border-[#25324A] hover:border-violet-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-[#9AA3AE] mb-1">
                <span className="text-[11px] font-mono">Assessed Skills</span>
                <Cpu className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">{metrics.totalSkills}</div>
              <div className="text-[10px] text-[#9AA3AE] mt-1 font-mono">10 engineering vectors</div>
            </button>

            {/* Tile 2: Demonstrated Strong */}
            <button
              onClick={() => handleMetricClick('strong')}
              className="p-4 rounded-xl bg-[#131D32] hover:bg-[#1A2642] border border-[#25324A] hover:border-emerald-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[11px] font-mono">Demonstrated Strong</span>
                <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">{metrics.demonstratedStrong}</div>
              <div className="text-[10px] text-emerald-500/80 mt-1 font-mono">Multiple verified artifacts</div>
            </button>

            {/* Tile 3: Demonstrated Basic */}
            <button
              onClick={() => handleMetricClick('basic')}
              className="p-4 rounded-xl bg-[#131D32] hover:bg-[#1A2642] border border-[#25324A] hover:border-amber-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[11px] font-mono">Demonstrated Basic</span>
                <Clock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">{metrics.demonstratedBasic}</div>
              <div className="text-[10px] text-amber-500/80 mt-1 font-mono">Partial scope / depth</div>
            </button>

            {/* Tile 4: Not Demonstrated */}
            <button
              onClick={() => handleMetricClick('not_demonstrated')}
              className="p-4 rounded-xl bg-[#131D32] hover:bg-[#1A2642] border border-[#25324A] hover:border-slate-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-mono">Not in Scope</span>
                <MinusCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-300 tracking-tight">{metrics.notDemonstrated}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">No evidence in repo</div>
            </button>

            {/* Tile 5: Unclear */}
            <button
              onClick={() => handleMetricClick('unclear')}
              className="p-4 rounded-xl bg-[#131D32] hover:bg-[#1A2642] border border-[#25324A] hover:border-purple-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-purple-400 mb-1">
                <span className="text-[11px] font-mono">Unclear Evidence</span>
                <HelpCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-300 tracking-tight">{metrics.unclear}</div>
              <div className="text-[10px] text-purple-400/80 mt-1 font-mono">Ambiguous attribution</div>
            </button>

            {/* Tile 6: Requiring Review */}
            <button
              onClick={() => handleMetricClick('review')}
              className="p-4 rounded-xl bg-[#131D32] hover:bg-[#1A2642] border border-[#25324A] hover:border-cyan-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-[11px] font-mono">Requires Attention</span>
                <AlertTriangle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-300 tracking-tight">{metrics.evidenceRequiringReview}</div>
              <div className="text-[10px] text-cyan-400/80 mt-1 font-mono">Findings awaiting review</div>
            </button>
          </div>
        </div>

        {/* TWO-COLUMN CORE SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Skill Coverage Breakdown + Recent Repository Activity (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Skill Coverage Overview */}
            <div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Standardized Assessment State Distribution</h3>
                  <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">Distribution across the 4 strict verification states</p>
                </div>
                <Link to="/app/proof-map" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <span>Explore Map</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="h-3.5 w-full bg-[#0B1020] rounded-full overflow-hidden flex p-0.5 border border-[#25324A]">
                <div
                  style={{ width: `${(metrics.demonstratedStrong / metrics.totalSkills) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-l-full"
                  title={`Demonstrated Strong: ${metrics.demonstratedStrong}`}
                />
                <div
                  style={{ width: `${(metrics.demonstratedBasic / metrics.totalSkills) * 100}%` }}
                  className="h-full bg-amber-500"
                  title={`Demonstrated Basic: ${metrics.demonstratedBasic}`}
                />
                <div
                  style={{ width: `${(metrics.notDemonstrated / metrics.totalSkills) * 100}%` }}
                  className="h-full bg-slate-600"
                  title={`Not Demonstrated: ${metrics.notDemonstrated}`}
                />
                <div
                  style={{ width: `${(metrics.unclear / metrics.totalSkills) * 100}%` }}
                  className="h-full bg-purple-500 rounded-r-full"
                  title={`Unclear: ${metrics.unclear}`}
                />
              </div>

              {/* State Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-white font-medium">{metrics.demonstratedStrong} Strong</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-white font-medium">{metrics.demonstratedBasic} Basic</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                  <span className="text-white font-medium">{metrics.notDemonstrated} Not in Scope</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-white font-medium">{metrics.unclear} Unclear</span>
                </div>
              </div>

              {/* Skill Preview Chips */}
              <div className="pt-2 border-t border-[#25324A] flex flex-wrap gap-2">
                {skills.slice(0, 6).map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setSelectedStatusFilter(skill.currentStatus);
                      navigate('/app/proof-map');
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0B1020] border border-[#25324A] hover:border-violet-500/50 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-white">{skill.name}</span>
                    <SkillStatusBadge status={skill.currentStatus} size="sm" showIcon={false} />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Repository Activity Timeline */}
            <div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Recent Repository Activity</h3>
                  <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">Verified Git timeline inspected by Provenance Shield</p>
                </div>
                <Link to="/app/audit" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <span>Full Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {commits.slice(0, 4).map((commit) => (
                  <div
                    key={commit.hash}
                    className="p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A] hover:border-violet-500/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <GitCommit className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <code className="text-[11px] font-mono text-cyan-300 font-bold">{commit.shortHash}</code>
                        <span className="text-xs text-white font-medium truncate max-w-sm">{commit.message}</span>
                      </div>
                      <span className="text-[10px] text-[#9AA3AE] font-mono shrink-0">{commit.timestamp.slice(0, 10)}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#9AA3AE]">
                      <div className="flex items-center gap-2">
                        <span>By: <strong className="text-white">{commit.author.name}</strong></span>
                        {commit.author.isCandidate && (
                          <span className="px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 text-[9px]">Candidate</span>
                        )}
                        <span>· {commit.changedFilesCount} files (+{commit.linesAdded} / -{commit.linesDeleted})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {commit.signatureStatus === 'verified' ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Verified GPG
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Unsigned</span>
                        )}
                        {commit.reviewAnnotation && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-500/30">
                            {commit.reviewAnnotation.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Recommended Challenge & Unresolved Attention (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recommended Next Challenge (Featured Commit Contract) */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#16223B] to-[#131D32] border border-violet-500/30 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300 font-bold">
                      Recommended Commit Contract
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">{recommendedContract.title}</h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {recommendedContract.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1020]/80 border border-[#25324A] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9AA3AE]">Target Skill:</span>
                  <span className="font-bold text-white">{recommendedContract.targetSkillName}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9AA3AE]">Current Assessment:</span>
                  <SkillStatusBadge status={recommendedContract.currentSkillState} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9AA3AE]">Expected State After Tests:</span>
                  <SkillStatusBadge status={recommendedContract.targetSkillState} size="sm" />
                </div>
              </div>

              <div className="text-xs text-[#9AA3AE] leading-relaxed">
                <strong className="text-white">Why generated: </strong>
                {recommendedContract.reasonGenerated}
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono font-semibold text-white/90">Required Deliverables:</span>
                <ul className="text-xs font-mono text-[#9AA3AE] space-y-1 list-disc list-inside">
                  {recommendedContract.requiredWork.slice(0, 3).map((work, idx) => (
                    <li key={idx} className="truncate">{work}</li>
                  ))}
                </ul>
              </div>

              <Button
                variant="solid_paper"
                size="md"
                onClick={() => handleStartChallenge(recommendedContract.id)}
                icon={<ArrowRight className="w-4 h-4 text-[#14171A]" />}
                className="w-full justify-center"
              >
                Inspect & Solve Challenge
              </Button>
            </div>

            {/* Evidence Requiring Attention */}
            <div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Evidence Requiring Attention</h3>
                  <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">Unresolved findings or rejected stubs</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {metrics.evidenceRequiringReview} Pending
                </span>
              </div>

              <div className="space-y-2.5">
                {evidenceItems
                  .filter((e) => e.category === 'unclear' || e.category === 'rejected')
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleInspectEvidence(item.id)}
                      className="p-3 rounded-xl bg-[#0B1020] border border-[#25324A] hover:border-cyan-500/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            item.category === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}
                        >
                          {item.category === 'rejected' ? 'Rejected Stub' : 'Unclear'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9AA3AE] line-clamp-2">
                        {item.whyDecision.observation}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA3AE] pt-2 mt-2 border-t border-[#25324A]/60">
                        <code>{item.filePath}</code>
                        <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Review <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Assessment Activity Stream */}
            <div className="p-5 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-3">
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Audit Ledger Activity</h3>
              <div className="space-y-2">
                {activities.slice(0, 3).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{act.title}</span>
                        <span className="text-[10px] text-[#9AA3AE]">{act.timestamp.slice(11, 16)} UTC</span>
                      </div>
                      <p className="text-[#9AA3AE] text-[11px]">{act.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
