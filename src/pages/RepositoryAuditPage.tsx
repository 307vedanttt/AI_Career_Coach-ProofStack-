import React, { useState } from 'react';
import {
  ShieldCheck,
  GitCommit,
  GitFork,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  ExternalLink,
  User,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import { useProofStack } from '../context/ProofStackContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ProvenanceStateBadge, HonestyBadge } from '../components/common/ProofBadges';
import { CommitAuditItem } from '../types/proofstack';
import { Button } from '../components/ui/Button';

export const RepositoryAuditPage: React.FC = () => {
  const { repository, contributors, provenanceChecks, commits } = useProofStack();

  const [expandedCheckId, setExpandedCheckId] = useState<string | null>('prov-origin');
  const [selectedCommit, setSelectedCommit] = useState<CommitAuditItem | null>(null);
  const [filterCandidateOnly, setFilterCandidateOnly] = useState<boolean>(false);

  const candidate = contributors.find((c) => c.role === 'candidate') || contributors[0];

  const displayedCommits = filterCandidateOnly
    ? commits.filter((c) => c.author.isCandidate)
    : commits;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Repository Audit & Provenance Shield</h1>
              <HonestyBadge label="Live Check" />
            </div>
            <p className="text-xs text-[#9AA3AE] font-mono mt-1">
              Cryptographic integrity, contribution provenance, upstream lineage, and historical signal analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#9AA3AE]">
              Inspected Commits: <strong className="text-white">{repository.inspectedCommitsCount}</strong>
            </span>
            <span className="text-[#25324A]">·</span>
            <span className="text-xs font-mono text-[#9AA3AE]">
              Contributors: <strong className="text-white">{repository.contributorsCount}</strong>
            </span>
          </div>
        </div>

        {/* 1. REPOSITORY IDENTITY CARD */}
        <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Core Identity */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9AA3AE] font-bold">
                Repository Target
              </span>
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-base font-bold text-white font-mono">{repository.fullName}</span>
              </div>
              <p className="text-xs text-[#9AA3AE] leading-relaxed line-clamp-2">
                {repository.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#9AA3AE] pt-1">
                <span>Default Branch: <strong className="text-white">{repository.defaultBranch}</strong></span>
                <span>·</span>
                <span>Language: <strong className="text-cyan-300">{repository.primaryLanguage}</strong></span>
              </div>
            </div>

            {/* Box 2: Lineage & Fork Status */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-[#25324A] md:pl-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9AA3AE] font-bold">
                Origin & Upstream
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {repository.forkStatus.isFork ? 'FORKED REPOSITORY' : 'STANDALONE REPO'}
                </span>
              </div>
              {repository.forkStatus.isFork && (
                <div className="space-y-1 text-xs font-mono">
                  <div className="text-[#9AA3AE]">Upstream Root:</div>
                  <a
                    href={repository.forkStatus.upstreamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>{repository.forkStatus.upstreamRepo}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-[11px] text-[#9AA3AE]/80 pt-1">
                    Candidate contributions evaluated post-divergence from commit <code className="text-white">3a91bf</code>.
                  </p>
                </div>
              )}
            </div>

            {/* Box 3: Historical Timeline */}
            <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-[#25324A] lg:pl-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9AA3AE] font-bold">
                Timeline Invariants
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#9AA3AE]">Created:</span>
                  <span className="text-white font-medium">{repository.createdAt.slice(0, 10)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9AA3AE]">Last Activity:</span>
                  <span className="text-white font-medium">{repository.lastActivityAt.slice(0, 10)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9AA3AE]">Active History:</span>
                  <span className="text-white font-medium">4.2 Months (Continuous)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9AA3AE]">Head Commit:</span>
                  <code className="text-cyan-300">{repository.headSha.slice(0, 7)}</code>
                </div>
              </div>
            </div>

            {/* Box 4: Candidate Scope Isolation */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-[#25324A] md:pl-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9AA3AE] font-bold">
                Candidate Scope Isolation
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-400">{candidate.percentageOfCommits}%</span>
                <span className="text-xs text-[#9AA3AE] font-mono">of all commits authored by {candidate.name}</span>
              </div>
              <p className="text-[11px] text-[#9AA3AE] font-mono leading-relaxed">
                Repository contains commits by 3 contributors. Evidence engine strictly ignores upstream maintainer and automated bot commits when scoring skills.
              </p>
            </div>
          </div>
        </div>

        {/* 2. PROVENANCE CHECKLIST (EXPANDABLE VERTICAL AUDIT PANEL) */}
        <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Provenance & Authenticity Shield Checklist</h2>
              <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
                5-dimensional inspection: Origin, History, Signatures, Contributor Context, and Evolution Pattern
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Never collapsed to a single score</span>
            </span>
          </div>

          <div className="space-y-3">
            {provenanceChecks.map((check) => {
              const isExpanded = expandedCheckId === check.id;
              return (
                <div
                  key={check.id}
                  className="rounded-xl bg-[#0B1020] border border-[#25324A] overflow-hidden transition-colors"
                >
                  {/* Summary Bar */}
                  <button
                    onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <ProvenanceStateBadge state={check.resultState} />
                      <span className="text-sm font-semibold text-white tracking-tight">{check.name}</span>
                      <HonestyBadge label={check.honestyLabel} />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#9AA3AE] hidden md:inline truncate max-w-md">
                        {check.observedValue}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#9AA3AE]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#9AA3AE]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#25324A] space-y-4 font-mono text-xs">
                      {/* Observed Value & Explanation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-lg bg-[#131D32] border border-[#25324A] space-y-1">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                            Observed Value
                          </span>
                          <p className="text-white font-medium">{check.observedValue}</p>
                          <p className="text-[#9AA3AE] text-[11px] pt-1">{check.explanation}</p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-[#131D32] border border-[#25324A] space-y-1">
                          <span className="text-[10px] text-violet-400 uppercase font-bold tracking-wider">
                            Supporting Details & Scope
                          </span>
                          <p className="text-[#9AA3AE] leading-relaxed">{check.supportingDetails}</p>
                          <div className="text-[10px] text-[#9AA3AE]/70 pt-1">
                            <strong>Inspection Scope: </strong>{check.inspectionScope}
                          </div>
                        </div>
                      </div>

                      {/* Known Limitation Warning */}
                      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Known Analysis Limitations: </strong>
                          {check.limitations}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CONTRIBUTOR COMPARISON (WITH EFFORT DISCLAIMER) */}
        <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Contributor Comparison & Attribution Scope</h2>
              <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
                Normalized representation of all commit authors in inspected history
              </p>
            </div>
            <div className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
              Disclaimer: Lines changed do NOT equate to engineering effort or skill.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#25324A] text-[#9AA3AE]">
                  <th className="py-2.5 px-3">Contributor</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Commits</th>
                  <th className="py-2.5 px-3 text-right">Commit %</th>
                  <th className="py-2.5 px-3 text-right">Files Changed</th>
                  <th className="py-2.5 px-3 text-right">Lines Added</th>
                  <th className="py-2.5 px-3 text-right">Lines Deleted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25324A]/60">
                {contributors.map((contrib) => {
                  const isCandidate = contrib.role === 'candidate';
                  return (
                    <tr
                      key={contrib.id}
                      className={isCandidate ? 'bg-violet-500/10 text-white' : 'text-[#9AA3AE]'}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {contrib.avatarUrl ? (
                            <img src={contrib.avatarUrl} alt={contrib.name} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                          <div>
                            <span className="font-bold text-white">{contrib.name}</span>
                            <span className="text-[10px] text-[#9AA3AE] block">@{contrib.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCandidate
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : contrib.role === 'maintainer'
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {contrib.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">{contrib.commitsCount}</td>
                      <td className="py-3 px-3 text-right font-bold">{contrib.percentageOfCommits}%</td>
                      <td className="py-3 px-3 text-right">{contrib.filesChangedCount}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-medium">+{contrib.linesAdded}</td>
                      <td className="py-3 px-3 text-right text-rose-400 font-medium">-{contrib.linesDeleted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. COMMIT TIMELINE WITH REVIEW ANNOTATIONS & DETAIL MODAL */}
        <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Chronological Commit Timeline</h2>
              <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
                Click any commit to inspect associated files, signature cryptography, and evidence links
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-[#9AA3AE] flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterCandidateOnly}
                  onChange={(e) => setFilterCandidateOnly(e.target.checked)}
                  className="rounded bg-[#0B1020] border-[#25324A] text-violet-500 focus:ring-0"
                />
                <span>Candidate Commits Only ({commits.filter((c) => c.author.isCandidate).length})</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            {displayedCommits.map((commit) => (
              <div
                key={commit.hash}
                onClick={() => setSelectedCommit(commit)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedCommit?.hash === commit.hash
                    ? 'bg-[#1A2642] border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                    : 'bg-[#0B1020] border-[#25324A] hover:border-violet-500/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 shrink-0">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-cyan-300 font-bold">{commit.shortHash}</code>
                        <span className="text-xs font-semibold text-white">{commit.message}</span>
                      </div>
                      <span className="text-[11px] text-[#9AA3AE] font-mono mt-0.5 block">
                        Authored by <strong className="text-white">{commit.author.name}</strong> on {commit.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {commit.signatureStatus === 'verified' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Signed (GPG)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-slate-500/30 flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Unsigned
                      </span>
                    )}

                    {commit.reviewAnnotation && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          commit.reviewAnnotation.flag === 'large_initial_upload'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {commit.reviewAnnotation.label}
                      </span>
                    )}
                  </div>
                </div>

                {commit.reviewAnnotation && (
                  <div className="mt-3 p-3 rounded-lg bg-[#131D32] border border-[#25324A] text-[11px] font-mono text-[#9AA3AE] flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">{commit.reviewAnnotation.reason} </strong>
                      <span>{commit.reviewAnnotation.guidance}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* COMMIT DETAIL MODAL / DRAWER */}
        {selectedCommit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-[#0E1528] border border-[#25324A] rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#25324A]">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-cyan-400" />
                  <span className="text-base font-bold text-white">Commit Detail: {selectedCommit.shortHash}</span>
                </div>
                <button
                  onClick={() => setSelectedCommit(null)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9AA3AE] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#131D32] space-y-1">
                  <div className="text-[10px] text-[#9AA3AE] uppercase">Commit Message:</div>
                  <div className="text-white font-semibold text-sm">{selectedCommit.message}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[#9AA3AE]">
                  <div>
                    <span className="block text-[10px] text-[#9AA3AE] uppercase">Author:</span>
                    <span className="text-white font-bold">{selectedCommit.author.name}</span>
                    <span className="block text-[10px]">{selectedCommit.author.email}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#9AA3AE] uppercase">Timestamp:</span>
                    <span className="text-white">{selectedCommit.timestamp}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#9AA3AE] uppercase">Full SHA-1:</span>
                    <code className="text-cyan-300 text-[11px] select-all">{selectedCommit.hash}</code>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#9AA3AE] uppercase">Cryptography:</span>
                    <span className="text-white">{selectedCommit.signatureDetails || 'No GPG signature header'}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-[#9AA3AE] uppercase mb-1.5">Changed Files ({selectedCommit.changedFilesCount}):</span>
                  <div className="space-y-1">
                    {selectedCommit.filesChanged.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#0B1020] border border-[#25324A]">
                        <span className="text-white">{f}</span>
                        <span className="text-emerald-400 text-[10px] font-bold">Modified</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="solid_paper" size="sm" onClick={() => setSelectedCommit(null)}>
                    Close Detail
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
