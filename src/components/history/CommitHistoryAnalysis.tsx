import React, { useState, useMemo } from 'react';
import {
  Calendar,
  GitCommit,
  Users,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  BarChart2,
  Sliders,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import { CommitHistoryData, HistoryFlagItem } from '../../types/proofstack';
import { Button } from '../ui/Button';

interface CommitHistoryAnalysisProps {
  history: CommitHistoryData | null;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onSelectCommitSnapshot?: (sha: string, snapshotId: string) => void;
}

type RangeFilter = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const CommitHistoryAnalysis: React.FC<CommitHistoryAnalysisProps> = ({
  history,
  isLoading = false,
  onRefresh,
  onSelectCommitSnapshot,
}) => {
  const [range, setRange] = useState<RangeFilter>('ALL');
  const [expandedFlagIndex, setExpandedFlagIndex] = useState<number | null>(null);
  const [showThresholds, setShowThresholds] = useState<boolean>(false);

  // Filter timeline based on selected range
  const filteredTimeline = useMemo(() => {
    if (!history?.timeline || history.timeline.length === 0) return [];
    if (range === 'ALL') return history.timeline;

    const now = new Date();
    const daysMap: Record<RangeFilter, number> = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': 99999,
    };
    const cutoff = new Date(now.getTime() - daysMap[range] * 86400000);

    return history.timeline.filter((item) => new Date(item.week_start) >= cutoff);
  }, [history?.timeline, range]);

  // Max commits in filtered timeline for bar height scaling
  const maxWeeklyCommits = useMemo(() => {
    if (filteredTimeline.length === 0) return 1;
    return Math.max(...filteredTimeline.map((w) => w.commits_count), 1);
  }, [filteredTimeline]);

  if (!history && !isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[#131D32] border border-[#25324A] text-center space-y-3">
        <GitCommit className="w-9 h-9 text-cyan-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Commit History Analysis</h3>
        <p className="text-xs text-[#9AA3AE] font-mono max-w-md mx-auto">
          Detailed commit metrics, chronological contribution timelines, and deterministic review signals have not been synchronized yet.
        </p>
        {onRefresh && (
          <Button variant="solid_paper" size="sm" onClick={onRefresh} isLoading={isLoading}>
            Sync Commit History
          </Button>
        )}
      </div>
    );
  }

  const flags: HistoryFlagItem[] = history?.flags || [];
  const thresholds = history?.thresholds || {};

  return (
    <div className="space-y-6">
      {/* 1. Header Card with Summary Metrics & Disclaimer */}
      <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#25324A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <GitCommit className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Commit History Analysis</h2>
              {history?.cap_reached && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {history.cap_banner_message || `Limited to ${history.commit_cap} commits`}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9AA3AE] font-mono">
              Default branch ({history?.default_branch || 'main'}) • {history?.total_commits_analyzed || 0} commits analyzed with ETag caching and bounded concurrency
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowThresholds(!showThresholds)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1B263B] border border-[#2E3D59] text-[#9AA3AE] hover:text-white hover:border-cyan-500/40 transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thresholds</span>
              {showThresholds ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                isLoading={isLoading}
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              >
                Sync GitHub
              </Button>
            )}
          </div>
        </div>

        {/* Mandatory Visible Disclaimer Banner */}
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-cyan-200/90 leading-relaxed">
            <span className="font-semibold text-cyan-300">Signal Notice: </span>
            {history?.disclaimer || 'Commit dates and authors can be edited. These are signals, not proof.'}
            <span className="text-[#9AA3AE] block sm:inline sm:ml-1">
              Review signals assist reviewer transparency and have zero impact on candidate skill assessments.
            </span>
          </div>
        </div>

        {/* Configurable Thresholds Inspector (Collapsible) */}
        {showThresholds && (
          <div className="p-4 rounded-xl bg-[#0C1322] border border-[#25324A] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Active Deterministic Thresholds (backend/data/history_thresholds.json)
              </span>
              <span className="text-[10px] font-mono text-[#9AA3AE]">Version: history_rules@v1.0</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#131D32] border border-[#25324A]">
                <span className="text-[#9AA3AE] block text-[10px]">Bulk Import Threshold:</span>
                <span className="text-cyan-300 font-semibold">&gt; {thresholds.bulk_import_line_share_pct || 50}% lines added</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131D32] border border-[#25324A]">
                <span className="text-[#9AA3AE] block text-[10px]">Burst Activity Window:</span>
                <span className="text-cyan-300 font-semibold">&ge; {thresholds.burst_min_commits || 15} commits in {thresholds.burst_window_hours || 2}h</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131D32] border border-[#25324A]">
                <span className="text-[#9AA3AE] block text-[10px]">Large Add-Then-Delete:</span>
                <span className="text-cyan-300 font-semibold">&gt; {(Number(thresholds.large_add_delete_ratio || 0.70) * 100).toFixed(0)}% deleted in {thresholds.large_add_delete_window_hours || 48}h</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131D32] border border-[#25324A]">
                <span className="text-[#9AA3AE] block text-[10px]">Date Inconsistency Skew:</span>
                <span className="text-cyan-300 font-semibold">&gt; {thresholds.date_skew_hours || 48}h skew / future</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131D32] border border-[#25324A]">
                <span className="text-[#9AA3AE] block text-[10px]">Candidate Min Share:</span>
                <span className="text-cyan-300 font-semibold">&lt; {thresholds.candidate_skill_file_min_share_pct || 20}% commits</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131D32] border border-[#25324A]">
                <span className="text-[#9AA3AE] block text-[10px]">Generic Commit Messages:</span>
                <span className="text-cyan-300 font-semibold">&gt; {thresholds.generic_message_min_pct || 30}% shorthand words</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Review Signals Drawer (Deterministic Review Flags) */}
      <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${flags.length > 0 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
              {flags.length > 0 ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Review Signals ({flags.length})
              </h3>
              <p className="text-xs text-[#9AA3AE] font-mono">
                Pure signal flags for reviewer context. Always labeled as &quot;Signal for review&quot;.
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${flags.length > 0 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'}`}>
            {flags.length === 0 ? '0 Review Signals' : `${flags.length} Signal${flags.length > 1 ? 's' : ''} for Review`}
          </span>
        </div>

        {flags.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs font-mono text-emerald-200">
              Clean history cadence: No bulk imports, compressed bursts, add-then-deletes, timestamp skews, or generic message ratios triggered.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag, idx) => {
              const isExpanded = expandedFlagIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#0C1322] border border-[#25324A] hover:border-amber-500/40 transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFlagIndex(isExpanded ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        Signal for review
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">{flag.title}</h4>
                        <span className="text-[11px] font-mono text-[#9AA3AE] block mt-0.5">{flag.rule}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-cyan-400 hidden sm:inline">Details</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#9AA3AE]" /> : <ChevronDown className="w-4 h-4 text-[#9AA3AE]" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-[#25324A] bg-[#101827] space-y-3 animate-fadeIn text-xs font-mono">
                      {/* Observed JSON */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#9AA3AE] uppercase tracking-wider block font-bold">Observed Values</span>
                        <pre className="p-2.5 rounded-lg bg-[#080D1A] border border-[#1E293B] text-cyan-300 overflow-x-auto text-[11px]">
                          {JSON.stringify(flag.observed, null, 2)}
                        </pre>
                      </div>

                      {/* Innocent Explanation */}
                      <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-cyan-300 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          Why this can be normal / innocent:
                        </span>
                        <p className="text-[#E2E8F0] leading-relaxed text-[11px]">
                          {flag.innocent_note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Contribution Timeline (Weekly Commits Bar Chart with Range Selector) */}
      <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#25324A]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Weekly Contribution Timeline
            </h3>
            <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
              Commits grouped by ISO calendar week (Monday start)
            </p>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 bg-[#0C1322] p-1 rounded-lg border border-[#25324A]">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as RangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  range === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-[#9AA3AE] hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart Visualization */}
        {filteredTimeline.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9AA3AE] font-mono">
            No commits recorded in this time range.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-44 w-full flex items-end gap-1.5 pt-6 pb-2 px-1 overflow-x-auto">
              {filteredTimeline.map((item, idx) => {
                const heightPct = Math.max(Math.round((item.commits_count / maxWeeklyCommits) * 100), 8);
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[20px] max-w-[40px] flex flex-col items-center gap-1.5 group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="p-2 rounded-lg bg-[#080D1A] border border-cyan-500/40 shadow-xl text-[10px] font-mono whitespace-nowrap text-white space-y-0.5">
                        <div className="font-bold text-cyan-300">Week of {item.week_start}</div>
                        <div>{item.commits_count} commits</div>
                        <div className="text-emerald-400">+{item.additions} lines</div>
                        <div className="text-rose-400">-{item.deletions} lines</div>
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#080D1A] border-r border-b border-cyan-500/40 rotate-45 -mt-1" />
                    </div>

                    {/* Bar */}
                    <div className="w-full flex flex-col justify-end h-32 rounded-t bg-[#1B263B] group-hover:bg-[#253552] transition-colors relative overflow-hidden">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all group-hover:from-cyan-500 group-hover:to-cyan-300"
                      />
                    </div>

                    {/* X-axis date label */}
                    <span className="text-[9px] font-mono text-[#9AA3AE] truncate w-full text-center">
                      {item.week_start.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA3AE] pt-2 border-t border-[#25324A]">
              <span>Earliest: {filteredTimeline[0]?.week_start}</span>
              <span className="text-cyan-300">Peak Week: {maxWeeklyCommits} commits</span>
              <span>Latest: {filteredTimeline[filteredTimeline.length - 1]?.week_start}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Calendar Heatmap (Daily Activity Intensity) */}
      <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Calendar Heatmap of Commit Days
            </h3>
            <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
              Daily commit density across default branch history
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA3AE]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#1B2436]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#0E4429]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#006D32]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#26A641]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#39D353]" />
            <span>More</span>
          </div>
        </div>

        {(!history?.daily_contributions || history.daily_contributions.length === 0) ? (
          <div className="py-8 text-center text-xs text-[#9AA3AE] font-mono">
            No daily activity recorded.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#0C1322] border border-[#25324A] max-h-48 overflow-y-auto">
              {history.daily_contributions.map((d, i) => {
                const colorClasses = [
                  'bg-[#1B2436]',
                  'bg-[#0E4429] border border-emerald-800/40',
                  'bg-[#006D32] border border-emerald-700/50',
                  'bg-[#26A641] border border-emerald-500/60',
                  'bg-[#39D353] border border-emerald-400 shadow-sm shadow-emerald-500/30',
                ];
                const bg = colorClasses[d.level] || colorClasses[1];
                return (
                  <div
                    key={i}
                    title={`${d.date}: ${d.count} commit${d.count > 1 ? 's' : ''}`}
                    className={`w-4 h-4 rounded-sm ${bg} hover:scale-125 transition-transform cursor-pointer relative group`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA3AE]">
              <span>Active days: {history.daily_contributions.length}</span>
              <span>Total recorded: {history.daily_contributions.reduce((acc, d) => acc + d.count, 0)} commits</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Large Additions & Snapshot Scrubber Leaderboard */}
      <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Largest Code Additions Leaderboard
            </h3>
            <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
              Ranked commits by line additions and share of total repository lines
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-300">
            Top 10 Commits
          </span>
        </div>

        {(!history?.large_additions || history.large_additions.length === 0) ? (
          <div className="py-8 text-center text-xs text-[#9AA3AE] font-mono">
            No addition statistics available.
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.large_additions.map((item, idx) => (
              <div
                key={item.sha}
                className="p-3 rounded-xl bg-[#0C1322] border border-[#25324A] hover:border-cyan-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[#9AA3AE] text-center font-bold">#{idx + 1}</span>
                    <a
                      href={item.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-[#1B263B] text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1 font-bold"
                    >
                      <code>{item.short_sha}</code>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {item.verified && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Signed
                      </span>
                    )}
                    <span className="text-[#9AA3AE] truncate">by {item.author_login}</span>
                    {item.committed_at && (
                      <span className="text-[#9AA3AE] text-[10px] hidden sm:inline">
                        • {item.committed_at.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <p className="text-white truncate font-normal pl-7">
                    {item.message || '(no commit message)'}
                  </p>
                </div>

                <div className="flex items-center gap-4 pl-7 md:pl-0 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">+{item.additions.toLocaleString()} lines</span>
                    <span className="text-[#9AA3AE] text-[10px] block">({item.share_pct}% of total repo)</span>
                  </div>

                  {/* Snapshot scrubber button if snapshot exists */}
                  {item.snapshot && onSelectCommitSnapshot && (
                    <button
                      onClick={() => onSelectCommitSnapshot(item.sha, item.snapshot!.snapshot_id)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                      title="Inspect skill snapshot at this commit"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Score: {item.snapshot.coverage_score.toFixed(0)}%</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Authors Breakdown with Signed-in Candidate Highlighted */}
      <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Authors &amp; Candidate Contribution Breakdown
            </h3>
            <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
              Share of commits and net lines authored per contributor
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#9AA3AE]">
            {history?.authors.length || 0} Contributor{history?.authors.length !== 1 ? 's' : ''}
          </span>
        </div>

        {(!history?.authors || history.authors.length === 0) ? (
          <div className="py-8 text-center text-xs text-[#9AA3AE] font-mono">
            No author details recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.authors.map((author, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all text-xs font-mono space-y-3 ${
                  author.is_signed_in_user
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-[#0C1322] border-[#25324A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-white truncate">{author.name || author.login}</span>
                    {author.login && (
                      <span className="text-[#9AA3AE] text-[11px] truncate">@{author.login}</span>
                    )}
                  </div>
                  {author.is_signed_in_user && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex-shrink-0">
                      Signed-In Candidate
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#9AA3AE]">Commits:</span>
                    <span className="text-white font-semibold">
                      {author.commits_count} ({author.commits_share_pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#1B263B] rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(author.commits_share_pct, 100)}%` }}
                      className={`h-full rounded-full ${author.is_signed_in_user ? 'bg-cyan-400' : 'bg-slate-400'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#9AA3AE]">Lines Changed:</span>
                    <span className="text-white font-semibold">
                      +{(author.additions || 0).toLocaleString()} / -{(author.deletions || 0).toLocaleString()} ({author.lines_share_pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#1B263B] rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(author.lines_share_pct, 100)}%` }}
                      className={`h-full rounded-full ${author.is_signed_in_user ? 'bg-emerald-400' : 'bg-slate-500'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
