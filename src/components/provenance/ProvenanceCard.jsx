import React, { useState } from 'react';
import { Calendar, GitFork, Users, ShieldCheck, History, AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink, RefreshCw, } from 'lucide-react';
import { Button } from '../ui/Button';
export const ProvenanceCard = ({ provenance, isLoading = false, onRefresh, }) => {
    const [expandedRow, setExpandedRow] = useState(null);
    if (!provenance && !isLoading) {
        return (<div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto"/>
        <h3 className="text-sm font-bold text-white">Repository Provenance Engine</h3>
        <p className="text-xs text-[#9AA3AE] font-mono max-w-md mx-auto">
          Cryptographic lineage and pure signals have not been calculated yet for this repository.
        </p>
        {onRefresh && (<Button variant="solid_paper" size="sm" onClick={onRefresh} isLoading={isLoading}>
            Run Provenance Analysis
          </Button>)}
      </div>);
    }
    const signals = provenance?.signals;
    const flags = provenance?.flags || [];
    const age = signals?.age;
    const limits = signals?.analysis_limits;
    const fork = signals?.fork_and_upstream;
    const contrib = signals?.contributions;
    const signed = signals?.signed_commits;
    const rewriteHints = signals?.history_rewrite_hints || [];
    // Helper to find flags for a section
    const getSectionFlags = (category) => {
        switch (category) {
            case 'age':
                return flags.filter((f) => f.code.includes('REPO_CREATION') || f.code.includes('AGE'));
            case 'fork':
                return flags.filter((f) => f.code.includes('FORK') || f.code.includes('UPSTREAM'));
            case 'contrib':
                return flags.filter((f) => f.code.includes('CONTRIB') || f.code.includes('AUTHOR'));
            case 'signed':
                return flags.filter((f) => f.code.includes('SIGNED'));
            case 'history':
                return flags.filter((f) => f.code.includes('HISTORY') || f.code.includes('BRANCH') || f.code.includes('RATE_LIMIT'));
            default:
                return [];
        }
    };
    const hasReviewFlag = (category) => {
        return getSectionFlags(category).some((f) => f.severity === 'review');
    };
    const renderBadge = (category) => {
        const isReview = hasReviewFlag(category);
        if (isReview) {
            return (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-400"/>
          For review
        </span>);
        }
        return (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
        <Info className="w-3 h-3 text-cyan-400"/>
        Info
      </span>);
    };
    const toggleRow = (rowId) => {
        setExpandedRow((prev) => (prev === rowId ? null : rowId));
    };
    return (<div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] relative overflow-hidden shadow-xl space-y-6">
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400"/>
            <h2 className="text-base font-bold text-white tracking-tight">Repository Provenance Signals</h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Pure-Signal Module
            </span>
          </div>
          <p className="text-xs text-[#9AA3AE] font-mono">
            Deterministic cryptographic audit: origin lineage, commit attribution, signatures, and rewrite telemetry
          </p>
        </div>

        {onRefresh && (<Button variant="ghost" size="sm" onClick={onRefresh} isLoading={isLoading} icon={<RefreshCw className="w-3.5 h-3.5 text-cyan-400"/>} className="border border-[#25324A] text-xs font-mono text-white hover:bg-[#1A2642] self-start sm:self-auto">
            Re-scan Signals
          </Button>)}
      </div>

      {/* COMMIT CAP / RATE LIMIT BANNER (WHEN CAP HIT) */}
      {limits?.cap_hit && (<div className="flex items-center gap-2.5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0"/>
          <div className="flex-1">
            <strong className="text-white">Analysis limited to {limits.commit_cap} commits. </strong>
            <span>Repository contains deeper history; latest {limits.analyzed_commits_count} commits analyzed to respect GitHub rate limits.</span>
          </div>
        </div>)}

      {/* 5 CLEARLY LABELED ROWS */}
      <div className="divide-y divide-[#25324A]/70 border-t border-b border-[#25324A]">
        {/* ROW 1: AGE */}
        <div className="py-4 space-y-2">
          <button onClick={() => toggleRow('age')} className="w-full flex items-center justify-between text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0B1020] border border-[#25324A] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-cyan-400"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    1. Age
                  </span>
                  {renderBadge('age')}
                </div>
                <div className="text-xs font-mono text-[#9AA3AE] mt-0.5">
                  {age ? (<>
                      <strong className="text-white">{age.repo_age_days} days old</strong> · Created{' '}
                      <span className="text-slate-300">{age.created_at.slice(0, 10)}</span> · First commit{' '}
                      <span className="text-slate-300">{age.first_commit_date.slice(0, 10)}</span>
                    </>) : ('Pending inspection')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#9AA3AE] hidden md:inline">
                Pushed {age?.pushed_at ? age.pushed_at.slice(0, 10) : 'N/A'}
              </span>
              {expandedRow === 'age' ? (<ChevronUp className="w-4 h-4 text-[#9AA3AE]"/>) : (<ChevronDown className="w-4 h-4 text-[#9AA3AE]"/>)}
            </div>
          </button>

          {expandedRow === 'age' && (<div className="mt-3 p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A] font-mono text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[#9AA3AE]">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Created Timestamp:</span>
                  <p className="text-white">{age?.created_at}</p>
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">First Commit Date:</span>
                  <p className="text-white">{age?.first_commit_date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Last Pushed Date:</span>
                  <p className="text-white">{age?.pushed_at}</p>
                </div>
              </div>
              {getSectionFlags('age').map((flag) => (<div key={flag.code} className="pt-2 border-t border-[#25324A] space-y-1">
                  <div className="text-amber-300 font-semibold">{flag.title}</div>
                  <div className="text-[#9AA3AE] text-[11px]">
                    <strong className="text-slate-200">Why it can be innocent: </strong>
                    {flag.why_it_can_be_innocent}
                  </div>
                </div>))}
            </div>)}
        </div>

        {/* ROW 2: FORK AND UPSTREAM */}
        <div className="py-4 space-y-2">
          <button onClick={() => toggleRow('fork')} className="w-full flex items-center justify-between text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0B1020] border border-[#25324A] flex items-center justify-center shrink-0">
                <GitFork className="w-4 h-4 text-violet-400"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    2. Fork and upstream
                  </span>
                  {renderBadge('fork')}
                </div>
                <div className="text-xs font-mono text-[#9AA3AE] mt-0.5">
                  {fork?.is_fork ? (<>
                      Forked from{' '}
                      <span className="text-cyan-300 font-semibold">{fork.parent_full_name}</span> ·{' '}
                      <strong className="text-white">+{fork.ahead_by} ahead</strong> / -{fork.behind_by} behind ·{' '}
                      Candidate commits ahead: <strong className="text-emerald-400">{fork.user_commits_ahead}</strong>
                    </>) : (<span className="text-slate-300">Standalone repository (not a fork)</span>)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#9AA3AE] hidden md:inline">
                {fork?.is_fork ? (fork.user_commits_ahead > 0 ? 'Diverged' : 'No own commits ahead') : 'Root origin'}
              </span>
              {expandedRow === 'fork' ? (<ChevronUp className="w-4 h-4 text-[#9AA3AE]"/>) : (<ChevronDown className="w-4 h-4 text-[#9AA3AE]"/>)}
            </div>
          </button>

          {expandedRow === 'fork' && (<div className="mt-3 p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A] font-mono text-xs space-y-3">
              {fork?.is_fork ? (<div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[#9AA3AE]">
                    <div>
                      <span>Upstream Remote: </span>
                      {fork.parent_url ? (<a href={fork.parent_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                          {fork.parent_full_name} <ExternalLink className="w-3 h-3"/>
                        </a>) : (<span className="text-white">{fork.parent_full_name}</span>)}
                    </div>
                    <div>Status: <strong className="text-white">{fork.upstream_status}</strong></div>
                  </div>
                  {getSectionFlags('fork').map((flag) => (<div key={flag.code} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <div className="text-amber-300 font-bold">{flag.title}</div>
                      <p className="text-slate-300 text-[11px]">{flag.why_it_can_be_innocent}</p>
                    </div>))}
                </div>) : (<p className="text-[#9AA3AE]">
                  This repository has no upstream parent and originated as a root standalone repository.
                </p>)}
            </div>)}
        </div>

        {/* ROW 3: CONTRIBUTORS (WITH SMALL COMMIT-SHARE BAR) */}
        <div className="py-4 space-y-3">
          <button onClick={() => toggleRow('contrib')} className="w-full flex items-center justify-between text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0B1020] border border-[#25324A] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-emerald-400"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    3. Contributors
                  </span>
                  {renderBadge('contrib')}
                </div>
                <div className="text-xs font-mono text-[#9AA3AE] mt-0.5">
                  Candidate share:{' '}
                  <strong className="text-cyan-300">{contrib?.candidate_commit_share ?? 0}%</strong> ({contrib?.candidate_commit_count ?? 0} of{' '}
                  {contrib?.total_analyzed_commits ?? 0} commits) ·{' '}
                  <strong className="text-white">{contrib?.distinct_contributors_count ?? 1}</strong> distinct contributor(s)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {contrib?.co_authors && contrib.co_authors.length > 0 && (<span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 hidden md:inline">
                  {contrib.co_authors.length} co-author(s)
                </span>)}
              {expandedRow === 'contrib' ? (<ChevronUp className="w-4 h-4 text-[#9AA3AE]"/>) : (<ChevronDown className="w-4 h-4 text-[#9AA3AE]"/>)}
            </div>
          </button>

          {/* SMALL COMMIT-SHARE BAR */}
          <div className="space-y-1.5 pl-11">
            <div className="w-full h-2 rounded-full bg-[#0B1020] overflow-hidden flex border border-[#25324A]">
              <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, contrib?.candidate_commit_share ?? 0))}%` }} title={`Candidate Commits: ${contrib?.candidate_commit_share ?? 0}%`}/>
              <div className="h-full bg-[#3B82F6]/60 transition-all duration-500" style={{ width: `${Math.max(0, 100 - (contrib?.candidate_commit_share ?? 0))}%` }} title="Other Contributors & Maintainers"/>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA3AE]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"/>
                Candidate: <strong className="text-white">{contrib?.candidate_username || 'Signed-in user'} ({contrib?.candidate_commit_share ?? 0}%)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]/60"/>
                Team & Maintainers ({Math.max(0, Math.round(100 - (contrib?.candidate_commit_share ?? 0)))}%)
              </span>
            </div>
          </div>

          {expandedRow === 'contrib' && (<div className="mt-3 p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A] font-mono text-xs space-y-3">
              {contrib?.co_authors && contrib.co_authors.length > 0 && (<div className="space-y-1">
                  <span className="text-[10px] text-violet-400 uppercase font-bold tracking-wider">
                    Co-Authors Discovered (from Co-authored-by Trailers):
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {contrib.co_authors.map((ca, idx) => (<span key={idx} className="px-2.5 py-1 rounded bg-[#131D32] border border-[#25324A] text-white text-[11px]">
                        {ca.name} <span className="text-[#9AA3AE]">({ca.email})</span>
                      </span>))}
                  </div>
                </div>)}

              {contrib?.authors_by_login && Object.keys(contrib.authors_by_login).length > 0 && (<div className="space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                    Commit Authors Breakdown:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    {Object.entries(contrib.authors_by_login).map(([login, count]) => (<div key={login} className="p-2 rounded bg-[#131D32] border border-[#25324A] flex justify-between">
                        <span className="text-white truncate">{login}</span>
                        <span className="text-[#9AA3AE]">{count}</span>
                      </div>))}
                  </div>
                </div>)}
            </div>)}
        </div>

        {/* ROW 4: SIGNED COMMITS */}
        <div className="py-4 space-y-2">
          <button onClick={() => toggleRow('signed')} className="w-full flex items-center justify-between text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0B1020] border border-[#25324A] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-400"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    4. Signed commits
                  </span>
                  {renderBadge('signed')}
                </div>
                <div className="text-xs font-mono text-[#9AA3AE] mt-0.5">
                  <strong className="text-white">{signed?.percentage_signed ?? 0}% cryptographically signed</strong> ·{' '}
                  <span className="text-emerald-300">{signed?.verified_count ?? 0} verified</span> ·{' '}
                  <span className="text-slate-300">{signed?.unsigned_count ?? 0} unsigned</span> ·{' '}
                  <span>{signed?.unverified_count ?? 0} unverified</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#9AA3AE] hidden md:inline">
                Standard Git practice
              </span>
              {expandedRow === 'signed' ? (<ChevronUp className="w-4 h-4 text-[#9AA3AE]"/>) : (<ChevronDown className="w-4 h-4 text-[#9AA3AE]"/>)}
            </div>
          </button>

          {expandedRow === 'signed' && (<div className="mt-3 p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A] font-mono text-xs space-y-2">
              <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[#9AA3AE] text-[11px] leading-relaxed">
                <strong className="text-cyan-300">Informational Note: </strong>
                Unsigned commits are normal across open source and enterprise software. They reflect standard Git configuration without local GPG signing keys and are never treated as negative evidence.
              </div>
            </div>)}
        </div>

        {/* ROW 5: HISTORY */}
        <div className="py-4 space-y-2">
          <button onClick={() => toggleRow('history')} className="w-full flex items-center justify-between text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0B1020] border border-[#25324A] flex items-center justify-center shrink-0">
                <History className="w-4 h-4 text-cyan-400"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    5. History
                  </span>
                  {renderBadge('history')}
                </div>
                <div className="text-xs font-mono text-[#9AA3AE] mt-0.5">
                  {rewriteHints.length > 0 ? (<span className="text-amber-300 font-semibold">{rewriteHints.length} history rewrite hint(s) recorded</span>) : (<span className="text-slate-300">Linear Git DAG · No force-push events detected</span>)}
                  {age?.default_branch && (<span> · Default branch: <strong className="text-white">{age.default_branch}</strong></span>)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#9AA3AE] hidden md:inline">
                {limits?.analyzed_commits_count ?? 0} commits analyzed
              </span>
              {expandedRow === 'history' ? (<ChevronUp className="w-4 h-4 text-[#9AA3AE]"/>) : (<ChevronDown className="w-4 h-4 text-[#9AA3AE]"/>)}
            </div>
          </button>

          {expandedRow === 'history' && (<div className="mt-3 p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A] font-mono text-xs space-y-2">
              {rewriteHints.length > 0 ? (rewriteHints.map((hint, idx) => (<div key={idx} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="text-amber-300 font-bold">{hint.event}</div>
                    <p className="text-[#9AA3AE] text-[11px] mt-0.5">{hint.details}</p>
                  </div>))) : (<p className="text-[#9AA3AE]">
                  No destructive force-push events or unexpected branch renames have been detected in repository webhook telemetry.
                </p>)}
            </div>)}
        </div>
      </div>

      {/* MANDATORY FOOTER DISCLAIMER */}
      <div className="pt-3 border-t border-[#25324A] text-xs font-mono text-[#9AA3AE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span>Signals for review. Commit metadata can be edited and is not proof of authorship.</span>
        <span className="text-[10px] text-cyan-400 font-bold">
          {provenance?.detector_version || 'provenance_detector@v1.0'}
        </span>
      </div>
    </div>);
};
