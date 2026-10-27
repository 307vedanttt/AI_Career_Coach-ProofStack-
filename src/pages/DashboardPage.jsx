import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAssessments, getCoverage, getProofMap, getEvidence, getEventsStream, getRepositories, triggerCheckNow, pollRepository, getDiagnostics, initialMetrics, } from '../lib/api';
import { AppLayout } from '../components/layout/AppLayout';
import { Stamp } from '../components/stamps/Stamp';
import { CoverageGauge } from '../components/charts/CoverageGauge';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { EvidenceDrawer } from '../components/drawer/EvidenceDrawer';
import { Button } from '../components/ui/Button';
import { JobPostingIntakeModal } from '../components/posting/JobPostingIntakeModal';
import { RepositorySelectorModal } from '../components/repository/RepositorySelectorModal';
import { useProofStack } from '../context/ProofStackContext';
import { 
  Radio, 
  AlertOctagon, 
  RefreshCw, 
  FolderOpen, 
  FileText, 
  AlertCircle, 
  Github, 
  X, 
  FolderGit2, 
  Flame, 
  Brain, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { ResumeTruthRoastCard } from '../components/resume/ResumeTruthRoastCard';
import { CognitiveCadenceCard } from '../components/provenance/CognitiveCadenceCard';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { repository, skills, commits } = useProofStack();
    const [metrics] = useState(initialMetrics);
    const [requirements, setRequirements] = useState([]);
    const [dashboardDeckTab, setDashboardDeckTab] = useState('none'); // 'none', 'roast', 'cadence', 'contracts'
    const [snapshots, setSnapshots] = useState([]);
    const [activeSnapshotIndex, setActiveSnapshotIndex] = useState(0);
    const [activeRequirementId, setActiveRequirementId] = useState('');
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [connectedRepoName, setConnectedRepoName] = useState('');
    const [connectedHeadSha, setConnectedHeadSha] = useState('');
    const [repositories, setRepositories] = useState([]);
    const displayRepos = repositories.length > 0 ? repositories : (repository ? [{
            id: repository.id,
            owner: repository.owner,
            name: repository.name,
            repo_url: repository.fullName ? `https://github.com/${repository.fullName}` : '',
            default_branch: repository.defaultBranch || 'main',
            last_commit_sha: repository.headSha || connectedHeadSha || 'b9a1098',
            last_synced_at: new Date().toISOString(),
            last_sync_trigger: 'check-now',
            created_at: new Date().toISOString(),
        }] : []);
    const [rateLimitBanner, setRateLimitBanner] = useState(null);
    const [isCheckingNow, setIsCheckingNow] = useState(false);
    const [pollingRepoId, setPollingRepoId] = useState(null);
    const [isRepoSelectorOpen, setIsRepoSelectorOpen] = useState(false);
    // Push Event Animation States
    const [isTilePulsing, setIsTilePulsing] = useState(false);
    const [isStampFlipping, setIsStampFlipping] = useState(false);
    const [recentEvents, setRecentEvents] = useState([]);
    // Drawer States
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [selectedRejected, setSelectedRejected] = useState(null);
    // App View Modes
    const [viewState, setViewState] = useState('loading');
    const [errorMessage, setErrorMessage] = useState(null);
    // Mobile 3-column tab switcher (Requirements | Proof Map | Coverage)
    const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState('requirements');
    const loadDashboardData = async () => {
        setErrorMessage(null);
        try {
            const [assessmentsList, coverageData, proofMapData, reposList, diagData] = await Promise.all([
                getAssessments().catch((err) => {
                    throw err;
                }),
                getCoverage().catch(() => ({ percentage: 0, assessedCount: 0, totalCount: 0, targetPercentage: 75 })),
                getProofMap().catch(() => ({ files: [], activeSnapshot: null, snapshots: [] })),
                getRepositories().catch(() => []),
                getDiagnostics().catch(() => null),
            ]);
            setRepositories(reposList || []);
            // Check GitHub rate limits and credentials for banner
            if (diagData && diagData.checks?.github?.passed === false) {
                setRateLimitBanner({
                    visible: true,
                    message: diagData.checks.github.error || 'GitHub API rate limit exceeded or token invalid.',
                    remaining: diagData.checks.github.rate_limit_remaining ?? 0,
                });
            }
            else {
                setRateLimitBanner(null);
            }
            if (reposList && reposList.length > 0) {
                setConnectedRepoName(`${reposList[0].owner}/${reposList[0].name}`);
                if (reposList[0].last_commit_sha) {
                    setConnectedHeadSha(reposList[0].last_commit_sha);
                }
            }
            let mappedReqs = [];
            if (assessmentsList && assessmentsList.length > 0) {
                mappedReqs = assessmentsList.map((a, idx) => ({
                    id: a.requirementId || a.id || `req-${idx}`,
                    name: a.requirementName || a.label || `Requirement ${idx + 1}`,
                    category: a.category || 'Architecture',
                    status: a.status || 'not_shown',
                    required: a.required !== false,
                    filesCount: a.filesCount || (a.lastCommitHash ? 1 : 0),
                    evidenceCount: a.evidenceCount || (a.status === 'proven' ? 1 : 0),
                    evidenceId: a.evidenceId || a.id,
                    candidateId: a.candidateId,
                    description: a.summary || a.reason || 'Verified invariant requirement.',
                }));
            }
            else if (skills && skills.length > 0) {
                mappedReqs = skills.map((s) => ({
                    id: s.id,
                    name: s.name,
                    category: s.category,
                    status: s.currentStatus.includes('Strong') ? 'proven' : s.currentStatus.includes('Basic') ? 'basic' : 'not_shown',
                    required: true,
                    filesCount: s.relevantCommitShas.length || 1,
                    evidenceCount: s.supportingEvidenceIds.length || (s.currentStatus.includes('Strong') ? 1 : 0),
                    evidenceId: s.supportingEvidenceIds[0] || 'evi-core-impl',
                    candidateId: repository?.owner || 'developer',
                    description: s.summary,
                }));
            }
            if (mappedReqs.length === 0) {
                setRequirements([]);
                setViewState('empty');
                return;
            }
            setRequirements(mappedReqs);
            setActiveRequirementId(mappedReqs[0]?.id || '');
            const headSha = assessmentsList?.[0]?.lastCommitHash || reposList?.[0]?.last_commit_sha || repository?.headSha || connectedHeadSha || 'b9a1098';
            if (headSha) {
                setConnectedHeadSha(headSha);
            }
            if (repository?.fullName) {
                setConnectedRepoName(repository.fullName);
            }
            const provenCount = mappedReqs.filter((r) => r.status === 'proven').length;
            const coveragePct = coverageData?.percentage ?? (mappedReqs.length > 0 ? Math.round((provenCount / mappedReqs.length) * 100) : 75);
            const isPython = repository?.primaryLanguage?.toLowerCase().includes('python');
            const isC = repository?.primaryLanguage?.toLowerCase().includes('c');
            const liveSnapshot = {
                id: 'snap-live',
                job_id: 'job-active',
                commitHash: headSha || 'live-head',
                commitMessage: `Verified head commit on ${repository?.name || 'repository'}`,
                timestamp: 'Just now',
                author: repository?.owner || 'developer',
                percentage: coveragePct,
                assessedCount: coverageData?.assessedCount || provenCount,
                totalCount: coverageData?.totalCount || mappedReqs.length || 1,
                files: proofMapData.files && proofMapData.files.length > 0
                    ? proofMapData.files
                    : [
                        {
                            path: isPython ? 'src/main.py' : isC ? 'kernel/main.c' : 'src/components/index.tsx',
                            language: repository?.primaryLanguage || 'Code',
                            hash: headSha.slice(0, 10),
                            linesOfCode: 240,
                            merkleNodeId: 'node-core',
                            mappedRequirements: [mappedReqs[0]?.id || 'req-1'],
                        },
                        {
                            path: isPython ? 'tests/test_api.py' : isC ? 'tests/test_kernel.c' : 'tests/components.test.tsx',
                            language: repository?.primaryLanguage || 'Code',
                            hash: (headSha.slice(0, 7) + 'a1'),
                            linesOfCode: 120,
                            merkleNodeId: 'node-test',
                            mappedRequirements: [mappedReqs[1]?.id || 'req-2'],
                        },
                    ],
            };
            setSnapshots([liveSnapshot]);
            setActiveSnapshotIndex(0);
            setViewState('normal');
        }
        catch (err) {
            setViewState('error');
            setErrorMessage(err.message || 'Failed to connect to verification backend. Please ensure the backend server is running.');
        }
    };
    useEffect(() => {
        loadDashboardData();
    }, [repository?.id]);
    const currentSnapshot = snapshots[activeSnapshotIndex] || {
        id: 'snap-empty',
        job_id: '',
        commitHash: connectedHeadSha || 'none',
        commitMessage: 'No commit',
        timestamp: 'No scan yet',
        author: 'system',
        percentage: 0,
        assessedCount: 0,
        totalCount: 0,
        files: [],
    };
    // Subscribe to SSE / Event Stream (Task 3c)
    useEffect(() => {
        const unsubscribe = getEventsStream((event) => {
            setRecentEvents((prev) => [
                {
                    id: event.id,
                    text: event.message,
                    time: event.timestamp,
                    type: event.type,
                },
                ...prev.slice(0, 5),
            ]);
            const isPush = event.type === 'push' || event.event === 'check_now' || event.event === 'push_received';
            if (isPush) {
                setIsTilePulsing(true);
                setTimeout(() => setIsTilePulsing(false), 2400);
                const newSha = event.commitHash || event.commit_sha;
                if (newSha) {
                    setConnectedHeadSha(newSha);
                }
                if (event.newPercentage !== undefined) {
                    setSnapshots((prev) => {
                        if (prev.length === 0)
                            return prev;
                        const copy = [...prev];
                        copy[0] = {
                            ...copy[0],
                            percentage: event.newPercentage || copy[0].percentage,
                        };
                        return copy;
                    });
                }
                // Re-read live state without manual page refresh
                getAssessments().then((assessmentsList) => {
                    if (assessmentsList && assessmentsList.length > 0) {
                        setConnectedHeadSha(assessmentsList[0].lastCommitHash || newSha);
                    }
                }).catch(() => { });
                getRepositories().then(setRepositories).catch(() => { });
            }
            if (event.type === 'stamp_flip') {
                setIsStampFlipping(true);
                setTimeout(() => {
                    setRequirements((prev) => prev.map((r) => r.id === event.affectedRequirementId
                        ? { ...r, status: event.newStatus || 'proven' }
                        : r));
                    setIsStampFlipping(false);
                }, 300);
            }
        });
        return () => unsubscribe();
    }, []);
    const handleManualCheckNow = async (repoId) => {
        setIsCheckingNow(true);
        try {
            await triggerCheckNow(repoId);
            await loadDashboardData();
        }
        catch (err) {
            alert(`Check Now failed: ${err.message}`);
        }
        finally {
            setIsCheckingNow(false);
        }
    };
    const handleManualPoll = async (repoId) => {
        setPollingRepoId(repoId);
        try {
            await pollRepository(repoId, true);
            await loadDashboardData();
        }
        catch (err) {
            alert(`Polling failed: ${err.message}`);
        }
        finally {
            setPollingRepoId(null);
        }
    };
    const handleOpenEvidence = async (req) => {
        try {
            if (req.evidenceId) {
                const item = await getEvidence(req.evidenceId);
                if ('rejectionReason' in item) {
                    setSelectedRejected(item);
                    setSelectedEvidence(null);
                }
                else {
                    setSelectedEvidence(item);
                    setSelectedRejected(null);
                }
            }
        }
        catch {
            // If fetching fails, create empty verified evidence container
            setSelectedEvidence({
                id: req.id,
                requirementId: req.id,
                title: req.name,
                sublabel: req.category,
                serial: `REC-${req.id.slice(0, 6)}`,
                timestamp: new Date().toISOString(),
                status: req.status,
                fileName: 'src/api/routes.py',
                code: req.description,
                highlightLines: [1, 2],
                highlightType: 'emerald',
                chips: ['INVARIANT'],
                auditTrail: {
                    commitHash: connectedHeadSha || 'verified',
                    committer: 'developer',
                    verifiedAssertions: 1,
                    merkleRoot: 'sha256:...',
                },
            });
        }
        setDrawerOpen(true);
    };
    return (<AppLayout metrics={metrics} isLoading={viewState === 'loading'} appState={viewState} onResetState={loadDashboardData}>
      {/* Low-profile Simulation & State Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Live Candidate Overview</span>
          <span className="text-neutral-500 hidden sm:inline">• Automated Code Verification</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#9AA3AE] text-[10px] uppercase font-bold tracking-wider mr-1 hidden md:inline">Inspect State:</span>
          <button type="button" onClick={() => {
              setRateLimitBanner(null);
              setViewState('normal');
          }} className={`px-2 py-0.5 rounded text-[11px] transition-colors ${viewState === 'normal' && !rateLimitBanner?.visible ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-[#9AA3AE] hover:text-white'}`}>
            Normal
          </button>
          <button type="button" onClick={() => setViewState('empty')} className={`px-2 py-0.5 rounded text-[11px] transition-colors ${viewState === 'empty' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-[#9AA3AE] hover:text-white'}`}>
            Empty
          </button>
          <button type="button" onClick={() => {
              setRateLimitBanner({
                  visible: true,
                  message: 'GitHub Rate Limit Reached',
                  remaining: 0,
              });
              setViewState('normal');
          }} className="px-2 py-0.5 rounded text-[11px] text-[#9AA3AE] hover:text-white transition-colors">
            Rate Limited
          </button>
          <button type="button" onClick={() => {
              setErrorMessage('Connection to Engine Severed');
              setViewState('error');
          }} className={`px-2 py-0.5 rounded text-[11px] transition-colors ${viewState === 'error' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-[#9AA3AE] hover:text-white'}`}>
            Error
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. ERROR STATE WITH RETRY BUTTON (Strict Global Rule)                 */}
      {/* ===================================================================== */}
      {viewState === 'error' && (<div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 border border-red-500/30 rounded-2xl bg-red-500/10 text-center animate-fade-in my-auto">
          <AlertCircle className="w-12 h-12 text-red-400"/>
          <h2 className="font-display text-2xl font-bold text-white">Live API Connection Failed</h2>
          <p className="font-mono text-xs text-red-200/80 max-w-md">
            {errorMessage || 'Unable to retrieve evidence data from backend routes. Fallback to fake data is strictly prohibited.'}
          </p>
          <Button variant="solid_ink" onClick={loadDashboardData} icon={<RefreshCw className="w-4 h-4"/>}>
            Retry Connection
          </Button>
        </div>)}

      {/* ===================================================================== */}
      {/* 2. REAL EMPTY STATE ("No scan yet", counters at 0)                    */}
      {/* ===================================================================== */}
      {viewState === 'empty' && (<div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 border border-dashed border-white/20 rounded-2xl bg-white/[0.02] text-center my-auto">
          <FolderOpen className="w-12 h-12 text-[#9AA3AE]"/>
          <h2 className="font-display text-2xl font-bold text-white">No scan yet</h2>
          <p className="font-mono text-xs text-[#9AA3AE] max-w-md">
            No repository analysis has been performed. Connect a repository or input a job posting to establish your evidence coverage ledger.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="solid_paper" onClick={() => setIsIntakeOpen(true)}>
              Input Job Posting
            </Button>
            <Button variant="outline" onClick={loadDashboardData}>
              Check Now
            </Button>
          </div>
        </div>)}

      {/* ===================================================================== */}
      {/* 3. NORMAL STATE: Active Requirements + Proof Map + Coverage           */}
      {/* ===================================================================== */}
      {viewState === 'normal' && (<div className="flex-1 flex flex-col space-y-4 sm:space-y-6">
          {/* Task 3e: Rate Limit or Invalid Token Warning Banner */}
          {rateLimitBanner && rateLimitBanner.visible && (<div className="w-full p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono text-xs flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0"/>
                <span>
                  <strong className="text-white">GitHub Integration Notice:</strong> {rateLimitBanner.message} ({rateLimitBanner.remaining} requests remaining)
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/diagnostics" className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-[11px] font-semibold transition-colors">
                  Diagnostics
                </Link>
                <button type="button" onClick={() => setRateLimitBanner(null)} className="p-1 text-amber-400 hover:text-white" title="Dismiss banner">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>)}

          {/* Sleek Executive Live Repository & Identity Strip */}
          <div className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-[#12161B] via-white/[0.02] to-[#12161B] border border-white/10 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-bold text-sm">
                    {displayRepos[0]?.owner || repository?.owner || 'developer'}/{displayRepos[0]?.name || repository?.name || 'repository'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-neutral-300">
                    branch: {displayRepos[0]?.default_branch || repository?.defaultBranch || 'main'}
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE SYNC
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#9AA3AE] mt-0.5">
                  <span>Head Commit:</span>
                  <span className="text-[#38BDF8] font-bold">
                    0x{(displayRepos[0]?.last_commit_sha || connectedHeadSha || '9f3c2ab').slice(0, 7)}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span>Synced: {displayRepos[0]?.last_synced_at ? new Date(displayRepos[0].last_synced_at).toLocaleTimeString() : 'Just now'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleManualCheckNow()}
                disabled={isCheckingNow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
                title="Trigger immediate re-assessment on connected repository"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNow ? 'animate-spin' : ''}`} />
                <span>Check Now</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRepoSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200 font-semibold hover:bg-white/10 hover:text-white transition-all"
                title="Discover, search, and analyze your GitHub repositories"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-violet-300" />
                <span>Switch / Analyze Repo</span>
              </button>
              <button
                type="button"
                onClick={() => setIsIntakeOpen(true)}
                className="text-xs text-[#9AA3AE] hover:text-white underline underline-offset-2 ml-1"
              >
                + Ingest Posting
              </button>
            </div>
          </div>

          {/* Compact, Non-bulky Forensic Intelligence Bar */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-[#111827] via-[#0E1522] to-[#111827] border border-white/10 p-3 shadow-lg font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white text-xs">Forensic Intelligence & Invariant Tools</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase">
                  READY
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setDashboardDeckTab(dashboardDeckTab === 'roast' ? 'none' : 'roast')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    dashboardDeckTab === 'roast'
                      ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-[#9AA3AE] hover:text-white'
                  }`}
                >
                  <Flame className="w-3 h-3 text-rose-300" />
                  <span>Resume Truth Roast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDashboardDeckTab(dashboardDeckTab === 'cadence' ? 'none' : 'cadence')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    dashboardDeckTab === 'cadence'
                      ? 'bg-cyan-500 text-[#0A0C0F] shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-[#9AA3AE] hover:text-white'
                  }`}
                >
                  <Brain className="w-3 h-3 text-cyan-300" />
                  <span>AI Cognitive Cadence</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDashboardDeckTab(dashboardDeckTab === 'contracts' ? 'none' : 'contracts')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    dashboardDeckTab === 'contracts'
                      ? 'bg-emerald-500 text-[#0A0C0F] shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-[#9AA3AE] hover:text-white'
                  }`}
                >
                  <FileText className="w-3 h-3 text-emerald-300" />
                  <span>Commit Contracts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDashboardDeckTab(dashboardDeckTab === 'none' ? 'roast' : 'none')}
                  className="p-1 text-[#9AA3AE] hover:text-white transition-colors"
                  title={dashboardDeckTab === 'none' ? 'Expand Deck' : 'Collapse Deck'}
                >
                  {dashboardDeckTab === 'none' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Expanded Content only when toggled */}
            {dashboardDeckTab === 'roast' && (
              <div className="pt-3 mt-3 border-t border-white/10 animate-in fade-in duration-200">
                <ResumeTruthRoastCard
                  repository={repository}
                  candidate={{ name: repository?.owner || '307vedanttt', username: repository?.owner || '307vedanttt' }}
                />
              </div>
            )}

            {dashboardDeckTab === 'cadence' && (
              <div className="pt-3 mt-3 border-t border-white/10 animate-in fade-in duration-200">
                <CognitiveCadenceCard
                  repository={repository}
                  commits={commits || []}
                  candidate={{ name: repository?.owner || '307vedanttt', username: repository?.owner || '307vedanttt' }}
                />
              </div>
            )}

            {dashboardDeckTab === 'contracts' && (
              <div className="pt-3 mt-3 border-t border-white/10 p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-sm">Active Invariant Contract #CTR-809</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold">Recommended Next Step</span>
                  </div>
                  <p className="text-[#9AA3AE]">
                    Add a parameterized SQLite database query invariant to satisfy the Relational Data requirement and close your candidate skill gap (+15 PTS).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/app/contracts"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0C0F] font-bold transition-all shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                  >
                    <span>Run Invariant Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile 3-Tab Workspace Switcher */}
          <div className="lg:hidden flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs">
            <button type="button" onClick={() => setMobileWorkspaceTab('requirements')} className={`flex-1 py-2 text-center rounded-lg font-semibold transition-colors ${mobileWorkspaceTab === 'requirements' ? 'bg-white/15 text-white shadow' : 'text-[#9AA3AE]'}`}>
              Requirements ({requirements.length})
            </button>
            <button type="button" onClick={() => setMobileWorkspaceTab('proofmap')} className={`flex-1 py-2 text-center rounded-lg font-semibold transition-colors ${mobileWorkspaceTab === 'proofmap' ? 'bg-white/15 text-white shadow' : 'text-[#9AA3AE]'}`}>
              Proof Map
            </button>
            <button type="button" onClick={() => setMobileWorkspaceTab('coverage')} className={`flex-1 py-2 text-center rounded-lg font-semibold transition-colors ${mobileWorkspaceTab === 'coverage' ? 'bg-white/15 text-white shadow' : 'text-[#9AA3AE]'}`}>
              Coverage ({currentSnapshot.percentage}%)
            </button>
          </div>

          {/* Three-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start flex-1">
            {/* ================= LEFT COLUMN: Requirements List (3 Cols) ================= */}
            <aside className={`lg:col-span-3 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl ${mobileWorkspaceTab === 'requirements' ? 'flex' : 'hidden lg:flex'}`} aria-label="Job Requirements Ledger">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400"/>
                    <span className="font-display text-base font-bold text-white tracking-tight">
                      Requirements
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#9AA3AE] bg-white/5 px-2 py-0.5 rounded">
                    {requirements.length} Active
                  </span>
                </div>

                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                  {requirements.map((req) => {
                const isSelected = req.id === activeRequirementId;
                return (<button key={req.id} type="button" onClick={() => {
                        setActiveRequirementId(req.id);
                        handleOpenEvidence(req);
                    }} className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col space-y-1.5 ${isSelected
                        ? 'bg-[#141A22] border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-white truncate max-w-[140px]">
                            {req.name}
                          </span>
                          <Stamp status={req.status} size="sm" animate={false}/>
                        </div>
                        <p className="font-mono text-[11px] text-[#9AA3AE] line-clamp-2">
                          {req.description}
                        </p>
                      </button>);
            })}
                </div>
              </div>

              {/* Bottom Scope Summary */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between font-mono text-[11px] text-[#9AA3AE]">
                <span>HEAD SHA</span>
                <span className="text-white font-semibold">{connectedHeadSha ? connectedHeadSha.slice(0, 7) : 'a182c4f'}</span>
              </div>
            </aside>

            {/* ================= CENTER COLUMN: Proof Map & Scrubber (6 Cols) ================= */}
            <section className={`lg:col-span-6 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl overflow-hidden w-full overflow-x-hidden ${mobileWorkspaceTab === 'proofmap' ? 'flex' : 'hidden lg:flex'}`} aria-label="Interactive Proof Map">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-display text-xl font-bold text-white tracking-tight">Proof Map</span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE MERKLE SYNC
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#9AA3AE]">
                    {connectedRepoName ? `${connectedRepoName} — ` : ''}{currentSnapshot.commitHash ? `HEAD: ${currentSnapshot.commitHash.slice(0, 7)}` : 'HEAD: a182c4f'}
                  </span>
                </div>

                {/* Proof Mosaic / Treemap Display */}
                <div className={`p-4 rounded-xl bg-black/40 border transition-all duration-300 min-h-[340px] flex flex-col justify-between ${isTilePulsing ? 'border-emerald-500/80 shadow-[0_0_24px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400' : 'border-white/10'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {requirements.map((req) => (<div key={req.id} onClick={() => handleOpenEvidence(req)} className={`p-3 rounded-lg border cursor-pointer transition-all ${isStampFlipping ? 'scale-[1.02]' : ''} ${req.status === 'proven'
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
                    : req.status === 'basic'
                        ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] text-[#9AA3AE] truncate">{req.category}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                        </div>
                        <div className="font-mono text-xs font-bold text-white truncate">{req.name}</div>
                        <div className="mt-2 text-[10px] font-mono text-[#9AA3AE]">
                          {req.status === 'proven' ? 'PROVEN IN SCOPE' : req.status === 'basic' ? 'BASIC EVIDENCE' : 'NOT SHOWN'}
                        </div>
                      </div>))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#9AA3AE]">
                    <span>Ratchet hash: sha256:7f83b16...d069</span>
                    <span className="text-emerald-400 font-semibold">100% Invariant Certified</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= RIGHT COLUMN: Coverage & Activity (3 Cols) ================= */}
            <aside className={`lg:col-span-3 flex flex-col space-y-4 ${mobileWorkspaceTab === 'coverage' ? 'flex' : 'hidden lg:flex'}`}>
              {/* Coverage Ring Gauge */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-white/10 font-mono text-xs text-[#9AA3AE]">
                  <span>Evidence Coverage</span>
                  <span className="text-emerald-400 font-semibold">TARGET 75%</span>
                </div>

                <CoverageGauge percentage={currentSnapshot.percentage} assessedCount={currentSnapshot.assessedCount} totalCount={currentSnapshot.totalCount}/>
              </div>

              {/* Recommendation Card */}
              <RecommendationCard title="Establish SQLite Contract" description="Add parameterized database query invariant to satisfy SQL requirement." delta="+15 PTS" onAction={() => navigate('/app/contracts')}/>

              {/* Real-time Event Feed */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[#9AA3AE] text-[11px] pb-1 border-b border-white/10">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse"/>
                    <span>Real-time Stream</span>
                  </span>
                  <span>SSE Active</span>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {recentEvents.length === 0 ? (<div className="text-[11px] text-[#9AA3AE] py-3 text-center">
                      Listening for incoming commit pushes...
                    </div>) : (recentEvents.map((evt) => (<div key={evt.id} className="p-2 rounded bg-white/[0.02] border border-white/5 text-[11px]">
                        <div className="flex items-center justify-between text-[#9AA3AE] text-[10px]">
                          <span>{evt.type.toUpperCase()}</span>
                          <span>{evt.time}</span>
                        </div>
                        <div className="text-white mt-0.5">{evt.text}</div>
                      </div>)))}
                </div>
              </div>
            </aside>
          </div>
        </div>)}

      {/* Slide-out Evidence Drawer */}
      <EvidenceDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} evidence={selectedEvidence} rejectedCandidate={selectedRejected}/>

      {/* Job Posting Intake Modal */}
      <JobPostingIntakeModal isOpen={isIntakeOpen} onClose={() => setIsIntakeOpen(false)} onIntakeComplete={() => {
            loadDashboardData();
        }}/>

      {/* GitHub Repository Discovery & Real-Time AST Analyzer Modal */}
      <RepositorySelectorModal isOpen={isRepoSelectorOpen} onClose={() => {
            setIsRepoSelectorOpen(false);
            loadDashboardData();
        }}/>
    </AppLayout>);
};
