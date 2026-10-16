import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Requirement,
  Evidence,
  RejectedCandidate,
  Snapshot,
  SystemMetrics,
  ProofStackEvent,
  TreemapFileItem,
} from '../types/api';
import {
  mockSystemMetrics,
  mockRequirements,
  mockEvidenceItems,
  mockRejectedCandidates,
  mockSnapshots,
  getEventsStream,
  triggerScriptedPush,
} from '../lib/api';
import { AppLayout } from '../components/layout/AppLayout';
import { Stamp } from '../components/stamps/Stamp';
import { CoverageGauge } from '../components/charts/CoverageGauge';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { EvidenceDrawer } from '../components/drawer/EvidenceDrawer';
import { Button } from '../components/ui/Button';
import { JobPostingIntakeModal } from '../components/posting/JobPostingIntakeModal';
import {
  ChevronLeft,
  ChevronRight,
  GitCommit,
  Radio,
  Clock,
  AlertOctagon,
  RefreshCw,
  FolderOpen,
  FileText,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Application Data States
  const [metrics] = useState<SystemMetrics>(mockSystemMetrics);
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(mockSnapshots);
  const [activeSnapshotIndex, setActiveSnapshotIndex] = useState<number>(2); // Snapshot 3 (current)
  const [activeRequirementId, setActiveRequirementId] = useState<string>('req-sql');
  const [isIntakeOpen, setIsIntakeOpen] = useState<boolean>(false);

  // Push Event Animation States
  const [isTilePulsing, setIsTilePulsing] = useState<boolean>(false);
  const [isStampFlipping, setIsStampFlipping] = useState<boolean>(false);
  const [recentEvents, setRecentEvents] = useState<Array<{ id: string; text: string; time: string; type: string }>>([
    { id: 'ev-1', text: 'Commit 9f3c2ab processed', time: '12s ago', type: 'commit' },
    { id: 'ev-2', text: '2 invariant tests verified in api/routes/orders.py', time: '14s ago', type: 'test' },
    { id: 'ev-3', text: 'Hollow test rejected in tests/test_orders.py', time: '2m ago', type: 'alert' },
  ]);

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(mockEvidenceItems['evi-rest']);
  const [selectedRejected, setSelectedRejected] = useState<RejectedCandidate | null>(mockRejectedCandidates['cand-sql']);

  // App View Modes (to satisfy: loading, empty, partial-analysis, rate-limited, error states)
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'partial' | 'rate_limited' | 'error'>('normal');

  const currentSnapshot = snapshots[activeSnapshotIndex] || snapshots[0];

  // Subscribe to SSE / Event Stream
  useEffect(() => {
    const unsubscribe = getEventsStream((event: ProofStackEvent) => {
      // 1. New feed item slides in from the top
      setRecentEvents((prev) => [
        {
          id: event.id,
          text: event.message,
          time: event.timestamp,
          type: event.type,
        },
        ...prev.slice(0, 5),
      ]);

      // 2. Push event reaction
      if (event.type === 'push') {
        setIsTilePulsing(true);
        setTimeout(() => setIsTilePulsing(false), 2400);

        // Update snapshot percentage
        if (event.newPercentage) {
          setSnapshots((prev) => {
            const copy = [...prev];
            copy[2] = {
              ...copy[2],
              percentage: event.newPercentage || 72,
              assessedCount: 5,
            };
            return copy;
          });
        }
      }

      // 3. Stamp 3D rotate flip
      if (event.type === 'stamp_flip') {
        setIsStampFlipping(true);
        setTimeout(() => {
          setRequirements((prev) =>
            prev.map((r) =>
              r.id === event.affectedRequirementId
                ? { ...r, status: event.newStatus || 'proven' }
                : r
            )
          );
          setIsStampFlipping(false);
        }, 300);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDrawer = (req: Requirement) => {
    setActiveRequirementId(req.id);
    const evi = mockEvidenceItems[req.evidenceId] || mockEvidenceItems['evi-rest'];
    const cand = req.candidateId ? mockRejectedCandidates[req.candidateId] : null;
    setSelectedEvidence(evi);
    setSelectedRejected(cand);
    setDrawerOpen(true);
  };

  const handleTileClick = (tile: TreemapFileItem) => {
    if (tile.name.includes('order')) {
      handleOpenDrawer(requirements[1]); // REST API
    } else if (tile.name.includes('jwt')) {
      handleOpenDrawer(requirements[2]); // Auth
    } else {
      handleOpenDrawer(requirements[0]); // SQL
    }
  };

  return (
    <AppLayout
      metrics={metrics}
      onSimulatePush={triggerScriptedPush}
      appState={viewState}
      onResetState={() => setViewState('normal')}
    >
      {/* State Switcher for Judge Demonstration */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#9AA3AE]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-white">Interactive States:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            type="button"
            onClick={() => setViewState('normal')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              viewState === 'normal' ? 'bg-emerald-500 text-[#0A0C0F]' : 'bg-white/5 text-[#9AA3AE] hover:text-white'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => setViewState('loading')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              viewState === 'loading' ? 'bg-emerald-500 text-[#0A0C0F]' : 'bg-white/5 text-[#9AA3AE] hover:text-white'
            }`}
          >
            Loading
          </button>
          <button
            type="button"
            onClick={() => setViewState('empty')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              viewState === 'empty' ? 'bg-emerald-500 text-[#0A0C0F]' : 'bg-white/5 text-[#9AA3AE] hover:text-white'
            }`}
          >
            Empty
          </button>
          <button
            type="button"
            onClick={() => setViewState('partial')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              viewState === 'partial' ? 'bg-emerald-500 text-[#0A0C0F]' : 'bg-white/5 text-[#9AA3AE] hover:text-white'
            }`}
          >
            Partial Analysis
          </button>
          <button
            type="button"
            onClick={() => setViewState('rate_limited')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              viewState === 'rate_limited' ? 'bg-amber-500 text-[#0A0C0F]' : 'bg-white/5 text-[#9AA3AE] hover:text-white'
            }`}
          >
            Rate Limited (429)
          </button>
          <button
            type="button"
            onClick={() => setViewState('error')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              viewState === 'error' ? 'bg-red-500 text-white' : 'bg-white/5 text-[#9AA3AE] hover:text-white'
            }`}
          >
            Error
          </button>

          {/* Intake Job Posting Quick Trigger */}
          <button
            type="button"
            onClick={() => setIsIntakeOpen(true)}
            className="ml-2 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-[#0A0C0F] transition-colors flex items-center gap-1.5"
            title="Paste Job Posting (Beat 2)"
            aria-label="Intake Job Posting"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Intake Posting</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. LOADING STATE                                                      */}
      {/* ===================================================================== */}
      {viewState === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <h2 className="font-display text-2xl font-bold text-white">Analyzing Repository Invariants...</h2>
          <p className="font-mono text-xs text-[#9AA3AE] max-w-sm text-center">
            Fetching static commit signatures, assessing test assertion contracts, and constructing deterministic ledger.
          </p>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. EMPTY STATE                                                        */}
      {/* ===================================================================== */}
      {viewState === 'empty' && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 border border-dashed border-white/20 rounded-2xl bg-white/[0.02]">
          <FolderOpen className="w-12 h-12 text-[#9AA3AE]" />
          <h2 className="font-display text-2xl font-bold text-white">No active repository connected</h2>
          <p className="font-mono text-xs text-[#9AA3AE] max-w-md text-center">
            Connect a GitHub repository to begin deterministic evidence tracking. ProofStack establishes contracts upon your first commit.
          </p>
          <Button variant="solid_paper" onClick={() => setViewState('normal')}>
            Connect rohan/shop-api
          </Button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. RATE LIMITED STATE (429)                                           */}
      {/* ===================================================================== */}
      {viewState === 'rate_limited' && (
        <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-mono text-xs font-bold text-amber-400 uppercase">
                GitHub Rate Limit Reached (HTTP 429)
              </div>
              <p className="text-xs text-[#9AA3AE] mt-0.5">
                Verification queue paused. 3 inbound webhooks buffered safely in memory. Automatic resume in 42s.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setViewState('normal')}>
            Resume Queue
          </Button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. ERROR STATE                                                        */}
      {/* ===================================================================== */}
      {viewState === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <AlertOctagon className="w-12 h-12 text-red-400" />
          <h2 className="font-display text-2xl font-bold text-white">Connection to Engine Severed</h2>
          <p className="font-mono text-xs text-[#9AA3AE] max-w-sm text-center">
            Failed to establish SSE event stream with the verification ledger. Server returned 503 Service Unavailable.
          </p>
          <Button variant="solid_paper" onClick={() => setViewState('normal')} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. NORMAL & PARTIAL ANALYSIS STATES                                    */}
      {/* ===================================================================== */}
      {(viewState === 'normal' || viewState === 'partial') && (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Partial Analysis Notification Banner */}
          {viewState === 'partial' && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>PARTIAL ANALYSIS IN PROGRESS: 2 of 7 requirements assessed</span>
              </div>
              <span className="text-[#9AA3AE]">Worker #1 actively indexing</span>
            </div>
          )}

          {/* TOP HEALTH STRIP (106px tall, 4 Monumental Stat Cards) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="System Metrics Strip">
            {/* Stat 1: Hollow Refused */}
            <div className="glass-panel relative flex flex-col justify-center px-6 py-4 rounded-2xl border-t-2 border-t-[#FF5C4D] overflow-hidden">
              <div className="flex items-baseline space-x-3">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
                  {metrics.hollowSignalsRefused}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C4D] shadow-[0_0_10px_#FF5C4D]" />
              </div>
              <span className="font-mono text-xs font-medium text-[#9AA3AE] mt-2">
                Hollow signals refused
              </span>
            </div>

            {/* Stat 2: Files Analyzed */}
            <div className="glass-panel relative flex flex-col justify-center px-6 py-4 rounded-2xl border-t-2 border-t-[#7C8CA8] overflow-hidden">
              <span className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none font-mono">
                {metrics.filesAnalyzed}
              </span>
              <span className="font-mono text-xs font-medium text-[#9AA3AE] mt-2">
                Files analyzed
              </span>
            </div>

            {/* Stat 3: LLM Calls */}
            <div className="glass-panel relative flex flex-col justify-center px-6 py-4 rounded-2xl border-t-2 border-t-[#8B7CFF] overflow-hidden">
              <span className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none font-mono">
                {metrics.llmCalls}
              </span>
              <span className="font-mono text-xs font-medium text-[#9AA3AE] mt-2">
                LLM calls
              </span>
            </div>

            {/* Stat 4: Push to verdict */}
            <div className="glass-panel relative flex flex-col justify-center px-6 py-4 rounded-2xl border-t-2 border-t-[#1F8A5B] overflow-hidden">
              <div className="flex items-baseline space-x-1.5">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none font-mono">
                  {metrics.pushToVerdictSeconds}
                </span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">s</span>
              </div>
              <span className="font-mono text-xs font-medium text-[#9AA3AE] mt-2">
                Push to verdict
              </span>
            </div>
          </section>

          {/* MAIN THREE-COLUMN WORKSPACE: Requirements (Left), Proof Map (Center), Gauge & Feed (Right) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* ================= LEFT COLUMN: Requirements List (3 Cols) ================= */}
            <aside className="lg:col-span-3 glass-panel rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="font-display text-base font-bold text-white tracking-tight">Requirements</h2>
                  <span className="text-[11px] font-mono text-[#9AA3AE] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {requirements.length} SCOPED
                  </span>
                </div>

                {/* Requirements Pill Stack */}
                <div className="space-y-2">
                  {requirements.map((req) => {
                    const isActive = req.id === activeRequirementId;
                    const isFlipping = isStampFlipping && req.id === 'req-sql';

                    return (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => handleOpenDrawer(req)}
                        className={`w-full h-12 rounded-xl px-3 flex items-center justify-between text-left transition-all ${
                          isActive
                            ? 'bg-white/[0.08] border-l-[3.5px] border-l-emerald-400 border-y border-r border-white/15 shadow-[0_0_20px_rgba(31,138,91,0.15)]'
                            : 'bg-white/[0.025] hover:bg-white/[0.05] border border-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-display text-sm font-semibold text-white tracking-tight truncate">
                            {req.name}
                          </span>
                          {req.required && (
                            <span className="text-[9px] font-mono font-bold text-white/90 px-1 py-0.5 rounded border border-white/25">
                              REQUIRED
                            </span>
                          )}
                        </div>

                        {/* Stamp with optional 3D flip animation */}
                        <motion.div
                          animate={isFlipping ? { rotateX: [0, 90, 0] } : {}}
                          transition={{ duration: 0.3 }}
                          className="shrink-0"
                        >
                          <Stamp status={req.status} size="sm" animate={false} />
                        </motion.div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Scope Summary */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between font-mono text-[11px] text-[#9AA3AE]">
                <span>TARGET REPO</span>
                <span className="text-white font-semibold">rohan/shop-api</span>
              </div>
            </aside>

            {/* ================= CENTER COLUMN: Proof Map & Scrubber (6 Cols) ================= */}
            <section className="lg:col-span-6 glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-xl overflow-hidden" aria-label="Interactive Proof Map">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-display text-xl font-bold text-white tracking-tight">Proof Map</span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE MERKLE SYNC
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#9AA3AE] italic">
                    Rectangle size = file size only
                  </span>
                </div>

                {/* Treemap Mosaic Tiles */}
                <div className="grid grid-cols-3 gap-3">
                  {currentSnapshot.files.map((file) => {
                    const isChangedTile = file.id === 'f3' && isTilePulsing;

                    return (
                      <motion.button
                        key={file.id}
                        type="button"
                        onClick={() => handleTileClick(file)}
                        animate={
                          isChangedTile
                            ? { scale: [1, 1.06, 1], filter: 'drop-shadow(0 0 16px #34D399)' }
                            : {}
                        }
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                        className={`h-24 rounded-xl p-3 flex flex-col justify-between text-left transition-all hover:scale-102 ${
                          file.status === 'proven'
                            ? 'bg-gradient-to-br from-emerald-600/90 to-emerald-800/90 text-white border border-emerald-400/50 shadow-[0_0_15px_rgba(31,138,91,0.25)]'
                            : file.status === 'basic'
                            ? 'bg-gradient-to-br from-amber-600/90 to-amber-800/90 text-white border border-amber-400/50 shadow-[0_0_15px_rgba(183,121,31,0.25)]'
                            : file.status === 'unclear'
                            ? 'bg-gradient-to-br from-[#6D5BD0]/90 to-violet-800/90 text-white border border-violet-400/50'
                            : 'bg-gradient-to-br from-slate-700/80 to-slate-900/80 text-slate-200 border border-slate-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-80">
                            {file.size} SLOC
                          </span>
                          {file.isPulsing && (
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold truncate">{file.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Snapshot Scrubber at Bottom */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2 text-white">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Snapshot {activeSnapshotIndex + 1} of {snapshots.length}: commit{' '}
                      <code className="text-emerald-400">{currentSnapshot.commitHash}</code>
                    </span>
                  </div>
                  <span className="text-[#9AA3AE]">{currentSnapshot.timestamp}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    disabled={activeSnapshotIndex === 0}
                    onClick={() => setActiveSnapshotIndex((prev) => Math.max(0, prev - 1))}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Previous Commit Snapshot"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>

                  <input
                    type="range"
                    min="0"
                    max={snapshots.length - 1}
                    value={activeSnapshotIndex}
                    onChange={(e) => setActiveSnapshotIndex(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    aria-label="Commit timeline snapshot slider"
                  />

                  <button
                    type="button"
                    disabled={activeSnapshotIndex === snapshots.length - 1}
                    onClick={() => setActiveSnapshotIndex((prev) => Math.min(snapshots.length - 1, prev + 1))}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Next Commit Snapshot"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </section>

            {/* ================= RIGHT COLUMN: Gauge, Contract & Feed (3 Cols) ================= */}
            <aside className="lg:col-span-3 flex flex-col space-y-4 justify-between">
              {/* Coverage Gauge Card */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center shadow-xl">
                <CoverageGauge
                  percentage={currentSnapshot.percentage}
                  assessedCount={currentSnapshot.assessedCount}
                  totalCount={currentSnapshot.totalCount}
                  target={78}
                />
              </div>

              {/* Recommendation Contract Card */}
              <RecommendationCard
                title="Add one query + one test"
                description="Establish SQLite schema migration in db/queries.py to prove persistence invariant."
                delta="+14 PTS"
                targetRequirement="SQL"
                buttonLabel="Open Contract"
                onAction={() => window.location.assign('/app/contracts')}
              />

              {/* Live Feed with Slide-in Notification Animation */}
              <div className="glass-panel rounded-2xl p-4 shadow-xl flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-white">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>LIVE EVENT STREAM</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">CONNECTED</span>
                </div>

                <div className="py-2 space-y-2 overflow-y-auto max-h-[140px]">
                  <AnimatePresence initial={false}>
                    {recentEvents.map((ev) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-start space-x-2 font-mono text-[11px]"
                      >
                        <GitCommit className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate">{ev.text}</p>
                          <span className="text-[#6B7280] text-[10px]">{ev.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Slide-in Evidence Drawer */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        evidence={selectedEvidence}
        rejectedCandidate={selectedRejected}
      />

      {/* Job Posting Intake Modal (Beat 2) */}
      <JobPostingIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onIntakeComplete={(jobTitle) => {
          setRecentEvents((prev) => [
            {
              id: `intake-${Date.now()}`,
              text: `Intake complete for ${jobTitle}: 5 invariants extracted & verified`,
              time: 'Just now',
              type: 'test',
            },
            ...prev,
          ]);
        }}
      />
    </AppLayout>
  );
};
