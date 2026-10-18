import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Building2,
  Filter,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  Zap,
  Bot,
  Send,
  Radio,
  Sliders,
  Terminal,
  Globe,
  Cpu,
  Flame,
} from 'lucide-react';

export interface HyperJobData {
  id: string;
  company: string;
  role: string;
  location: string;
  postedTime: string; // e.g. "28 mins ago", "45 mins ago", "1 hour ago"
  postedMinutesAgo: number;
  sourceLink: string;
  sourceName: 'LinkedIn' | 'Naukri' | 'Wellfound' | 'Indeed' | 'Greenhouse';
  coveragePercent: number;
  totalRequirements: number;
  anchorRepo: string;
  provenSkills: string[];
  notShownSkills: string[];
  salaryEstimate: string;
  applied?: boolean;
  appliedAt?: string;
  status?: 'discovered' | 'applying' | 'applied';
}

export interface WhatsAppMessage {
  id: string;
  time: string;
  company: string;
  role: string;
  source: string;
  postedAgo: string;
  matchScore: number;
  anchorRepo: string;
  docketUrl: string;
  status: string;
}

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const username = user?.login || (typeof window !== 'undefined' ? localStorage.getItem('ps_github_username') : null) || 'Omb2121';

  const [activeTab, setActiveTab] = useState<'radar' | 'auto-apply' | 'whatsapp' | 'preferences' | 'assist'>('radar');
  const [selectedJobId, setSelectedJobId] = useState<string>('job-1');

  // Filter States for Hyper-Radar
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [timeWindowFilter, setTimeWindowFilter] = useState<'all' | '30m' | '1h' | '2h'>('all');
  const [minCoverageFilter, setMinCoverageFilter] = useState<number>(80);

  // Auto-Apply Bot Configuration
  const [autoApplyEnabled, setAutoApplyEnabled] = useState<boolean>(true);
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(85);
  const [dailyQuota, setDailyQuota] = useState<number>(20);
  const [appliedCountToday, setAppliedCountToday] = useState<number>(3);
  const [attachDocket, setAttachDocket] = useState<boolean>(true);
  const [tailorAstBullets, setTailorAstBullets] = useState<boolean>(true);

  // Auto-Apply Execution Terminal Simulation
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[SYS_INIT] ProofStack Autonomous Pipeline Online · Candidate @${username}`,
    `[AST_SYNC] Verified profile anchor: ${username}/AI-CarrerCoach (FastAPI, Python, SQLite)`,
    `[RADAR] Polling LinkedIn Recruiter API & Naukri FastForward API (< 120m window)...`,
    `[READY] Auto-Apply Policy: Minimum 85% verified code coverage required.`
  ]);

  // WhatsApp Config
  const [whatsappPhone, setWhatsappPhone] = useState<string>('+91 98765 43210');
  const [whatsappConnected, setWhatsappConnected] = useState<boolean>(true);
  const [whatsappMode, setWhatsappMode] = useState<'instant' | 'digest'>('instant');
  const [isSendingTestPing, setIsSendingTestPing] = useState<boolean>(false);

  // WhatsApp Messages Stream
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'wa-1',
      time: '11:42 AM',
      company: 'Razorpay',
      role: 'Senior Backend Platform Engineer',
      source: 'Naukri.com',
      postedAgo: '28m ago',
      matchScore: 96,
      anchorRepo: `${username}/AI-CarrerCoach`,
      docketUrl: `https://proofstack-ashen-eta.vercel.app/verify/${username.toLowerCase()}-docket-961`,
      status: 'Auto-Submitted & Acknowledged ✅'
    },
    {
      id: 'wa-2',
      time: '12:05 PM',
      company: 'PhonePe',
      role: 'Systems Engineer — Microservices',
      source: 'LinkedIn',
      postedAgo: '45m ago',
      matchScore: 92,
      anchorRepo: `${username}/AI-CarrerCoach`,
      docketUrl: `https://proofstack-ashen-eta.vercel.app/verify/${username.toLowerCase()}-docket-924`,
      status: 'Auto-Submitted & Recruiter Screened 🟢'
    }
  ]);

  // Jobs Feed (Hyper-Fresh < 1-2 hours)
  const [jobs, setJobs] = useState<HyperJobData[]>([
    {
      id: 'job-1',
      company: 'Razorpay',
      role: 'Senior Backend Platform Engineer (FastAPI / Distributed DB)',
      location: 'Bengaluru / Remote',
      postedTime: '28 mins ago',
      postedMinutesAgo: 28,
      sourceLink: 'https://www.naukri.com/job-listings-razorpay-senior-backend',
      sourceName: 'Naukri',
      coveragePercent: 96,
      totalRequirements: 6,
      anchorRepo: `${username}/AI-CarrerCoach`,
      provenSkills: ['FastAPI Routing', 'PostgreSQL Transactions', 'Pytest Regression', 'AsyncIO Concurrency'],
      notShownSkills: ['Kafka Streams'],
      salaryEstimate: '₹32L - ₹48L · Equity',
      applied: true,
      appliedAt: '12 mins ago',
      status: 'applied'
    },
    {
      id: 'job-2',
      company: 'PhonePe',
      role: 'Systems Engineer — API Microservices & Infrastructure',
      location: 'Mumbai / Hybrid / Remote',
      postedTime: '45 mins ago',
      postedMinutesAgo: 45,
      sourceLink: 'https://www.linkedin.com/jobs/view/phonepe-systems-engineer',
      sourceName: 'LinkedIn',
      coveragePercent: 92,
      totalRequirements: 5,
      anchorRepo: `${username}/AI-CarrerCoach`,
      provenSkills: ['REST API APIRouter', 'Docker Multi-Stage', 'Python AsyncSession'],
      notShownSkills: ['Kubernetes Helm'],
      salaryEstimate: '₹28L - ₹42L',
      applied: true,
      appliedAt: '5 mins ago',
      status: 'applied'
    },
    {
      id: 'job-3',
      company: 'Cred',
      role: 'Full Stack Systems Engineer (React / TypeScript / FastAPI)',
      location: 'Bengaluru / Remote',
      postedTime: '1 hour ago',
      postedMinutesAgo: 60,
      sourceLink: 'https://www.naukri.com/job-listings-cred-fullstack-systems',
      sourceName: 'Naukri',
      coveragePercent: 89,
      totalRequirements: 6,
      anchorRepo: `${username}/CaseCompass`,
      provenSkills: ['React 18', 'TypeScript Strict Mode', 'FastAPI Backend', 'SQLite DB'],
      notShownSkills: ['Redis PubSub'],
      salaryEstimate: '₹35L - ₹52L',
      applied: false,
      status: 'discovered'
    },
    {
      id: 'job-4',
      company: 'Postman',
      role: 'Developer Platform Engineer — API Core & Contract Testing',
      location: 'Remote · Bengaluru / San Francisco',
      postedTime: '1.2 hours ago',
      postedMinutesAgo: 72,
      sourceLink: 'https://www.linkedin.com/jobs/view/postman-developer-platform',
      sourceName: 'LinkedIn',
      coveragePercent: 88,
      totalRequirements: 5,
      anchorRepo: `${username}/AI-CarrerCoach`,
      provenSkills: ['OpenAPI Spec', 'Pytest Automation', 'REST API Architecture'],
      notShownSkills: ['Go Microservices'],
      salaryEstimate: '$120k - $160k / ₹45L',
      applied: false,
      status: 'discovered'
    },
    {
      id: 'job-5',
      company: 'Zepto Engineering',
      role: 'Backend Concurrency Architect — High-Throughput Engine',
      location: 'Remote (India)',
      postedTime: '1.5 hours ago',
      postedMinutesAgo: 90,
      sourceLink: 'https://wellfound.com/jobs/zepto-backend-concurrency',
      sourceName: 'Wellfound',
      coveragePercent: 91,
      totalRequirements: 5,
      anchorRepo: `${username}/AI-CarrerCoach`,
      provenSkills: ['FastAPI Async Workers', 'Database Transactions', 'Zero Regressions'],
      notShownSkills: ['Cassandra DB'],
      salaryEstimate: '₹38L - ₹55L',
      applied: false,
      status: 'discovered'
    },
    {
      id: 'job-6',
      company: 'Stripe',
      role: 'Platform Infrastructure Systems Engineer',
      location: 'Remote · Seattle / Worldwide',
      postedTime: '2 hours ago',
      postedMinutesAgo: 120,
      sourceLink: 'https://www.linkedin.com/jobs/view/stripe-infrastructure-engineer',
      sourceName: 'LinkedIn',
      coveragePercent: 84,
      totalRequirements: 6,
      anchorRepo: `${username}/AI-CarrerCoach`,
      provenSkills: ['REST API APIRouter', 'Pytest Regression', 'Database Architecture'],
      notShownSkills: ['Distributed Raft', 'Ruby'],
      salaryEstimate: '$165,000 - $210,000 USD',
      applied: false,
      status: 'discovered'
    }
  ]);

  // Screen C: Application Form Fields (Side-by-Side Assist)
  const formFields = [
    {
      id: 'f-name',
      label: 'Full Legal Name',
      value: user?.name || username,
      source: 'From GitHub Profile',
      isEditing: false,
      empty: false,
    },
    {
      id: 'f-email',
      label: 'Primary Work Email',
      value: user ? `${user.login}@users.noreply.github.com` : `${username.toLowerCase()}@dev.net`,
      source: 'From Verified Auth',
      isEditing: false,
      empty: false,
    },
    {
      id: 'f-github',
      label: 'GitHub Portfolio URL',
      value: `https://github.com/${username}`,
      source: 'From Connected Repos',
      isEditing: false,
      empty: false,
    },
    {
      id: 'f-proof',
      label: 'Cryptographic Code Proof Docket Link',
      value: `https://proofstack-ashen-eta.vercel.app/verify/${username.toLowerCase()}-live-docket`,
      source: 'Auto-Generated Merkle Attestation',
      isEditing: false,
      empty: false,
    },
    {
      id: 'f-salary',
      label: 'Target Compensation ($USD/yr or INR)',
      value: '₹35L+ / $140k USD',
      source: 'Prefilled from Candidate Profile',
      isEditing: false,
      empty: false,
    },
    {
      id: 'f-workauth',
      label: 'Work Authorization Status',
      value: 'Authorized to work without sponsorship',
      source: 'From Candidate Dossier',
      isEditing: false,
      empty: false,
    },
  ];

  // Preferences State
  const [paused, setPaused] = useState<boolean>(false);
  const [roleType, setRoleType] = useState<'full_time' | 'internship'>('full_time');
  const [locationPref, setLocationPref] = useState('Remote / Bengaluru / San Francisco');

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Filter Jobs
  const filteredJobs = jobs.filter((job) => {
    if (platformFilter !== 'all' && job.sourceName.toLowerCase() !== platformFilter.toLowerCase()) {
      return false;
    }
    if (timeWindowFilter === '30m' && job.postedMinutesAgo > 30) return false;
    if (timeWindowFilter === '1h' && job.postedMinutesAgo > 60) return false;
    if (timeWindowFilter === '2h' && job.postedMinutesAgo > 120) return false;
    if (job.coveragePercent < minCoverageFilter) return false;
    return true;
  });

  // Action: Single Auto-Apply Trigger
  const handleAutoApplySingle = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'applying' } : j))
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, applied: true, appliedAt: 'Just now', status: 'applied' }
            : j
        )
      );
      setAppliedCountToday((prev) => prev + 1);

      // Add WhatsApp Notification
      const newWaMsg: WhatsAppMessage = {
        id: `wa-${Date.now()}`,
        time: timeStr,
        company: targetJob.company,
        role: targetJob.role,
        source: targetJob.sourceName,
        postedAgo: targetJob.postedTime,
        matchScore: targetJob.coveragePercent,
        anchorRepo: targetJob.anchorRepo,
        docketUrl: `https://proofstack-ashen-eta.vercel.app/verify/${username.toLowerCase()}-docket-${targetJob.id}`,
        status: 'Auto-Submitted & Acknowledged ✅'
      };

      setWhatsappMessages((prev) => [newWaMsg, ...prev]);

      // Add to Terminal Log
      setTerminalLogs((prev) => [
        `[${timeStr}] DISPATCHED: Application sent to ${targetJob.company} (${targetJob.sourceName}). Docket attached: proofstack.dev/verify/${username.toLowerCase()}`,
        `[${timeStr}] WHATSAPP: Outbound alert delivered to ${whatsappPhone} with match confirmation (${targetJob.coveragePercent}%).`,
        ...prev
      ]);
    }, 1200);
  };

  // Action: Batch Auto-Apply All Qualifying Roles
  const handleBatchAutoApply = () => {
    setIsBatchRunning(true);
    const unappliedEligible = jobs.filter(
      (j) => !j.applied && j.coveragePercent >= minMatchThreshold
    );

    let step = 0;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTerminalLogs((prev) => [
      `[${timeStr}] BATCH TRIGGERED: Identifying qualifying postings (< 120m, >= ${minMatchThreshold}% match)...`,
      ...prev
    ]);

    const interval = setInterval(() => {
      if (step < unappliedEligible.length) {
        const currentJob = unappliedEligible[step];
        setJobs((prev) =>
          prev.map((j) =>
            j.id === currentJob.id
              ? { ...j, applied: true, appliedAt: 'Just now', status: 'applied' }
              : j
          )
        );

        const newMsg: WhatsAppMessage = {
          id: `wa-${Date.now()}-${step}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          company: currentJob.company,
          role: currentJob.role,
          source: currentJob.sourceName,
          postedAgo: currentJob.postedTime,
          matchScore: currentJob.coveragePercent,
          anchorRepo: currentJob.anchorRepo,
          docketUrl: `https://proofstack-ashen-eta.vercel.app/verify/${username.toLowerCase()}-docket-${currentJob.id}`,
          status: 'Auto-Submitted & Acknowledged ✅'
        };

        setWhatsappMessages((prev) => [newMsg, ...prev]);

        setTerminalLogs((prev) => [
          `[OK] ${currentJob.company} (${currentJob.sourceName}) -> Auto-Applied with Merkle Docket (Coverage: ${currentJob.coveragePercent}%).`,
          `[WHATSAPP] Instant push sent to ${whatsappPhone}.`,
          ...prev
        ]);

        setAppliedCountToday((prev) => prev + 1);
        step++;
      } else {
        clearInterval(interval);
        setIsBatchRunning(false);
        setTerminalLogs((prev) => [
          `[COMPLETE] Batch Auto-Apply finished. All eligible postings dispatched. Ledger updated.`,
          ...prev
        ]);
      }
    }, 900);
  };

  // Action: Test WhatsApp Notification Ping
  const handleSendTestWhatsAppPing = () => {
    setIsSendingTestPing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const testMsg: WhatsAppMessage = {
        id: `wa-test-${Date.now()}`,
        time: timeStr,
        company: 'Zepto Engineering',
        role: 'Backend Concurrency Architect',
        source: 'Naukri.com (Real-Time)',
        postedAgo: '15m ago',
        matchScore: 94.8,
        anchorRepo: `${username}/AI-CarrerCoach`,
        docketUrl: `https://proofstack-ashen-eta.vercel.app/verify/${username.toLowerCase()}-live-test`,
        status: 'Test Ping: Webhook Delivered ✓✓'
      };

      setWhatsappMessages((prev) => [testMsg, ...prev]);
      setIsSendingTestPing(false);

      setTerminalLogs((prev) => [
        `[${timeStr}] WHATSAPP TEST: Simulated incoming alert triggered for ${whatsappPhone}. Message delivered.`,
        ...prev
      ]);
    }, 800);
  };

  const handleOpenAssistForJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveTab('assist');
  };

  return (
    <AppLayout>
      <div className="max-w-7xl w-full mx-auto px-4 py-6 font-mono space-y-6">
        {/* ================================================================ */}
        {/* TOP BANNER & RADAR CONTROLLER                                    */}
        {/* ================================================================ */}
        <div className="bg-[#12161B]/95 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0 relative">
                <Radio className="w-7 h-7 animate-pulse text-emerald-400" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#12161B] rounded-full animate-ping" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                    ProofStack Real-Time Job Radar & Auto-Apply
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>&lt; 1-2h Scanner Live</span>
                  </span>
                </div>
                <p className="text-xs font-mono text-[#9AA3AE] mt-1 flex flex-wrap items-center gap-2">
                  <span>Candidate:</span>
                  <span className="text-emerald-400 font-bold">@{username}</span>
                  <span>· Anchored to:</span>
                  <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {username}/AI-CarrerCoach
                  </span>
                  <span>&amp;</span>
                  <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {username}/CaseCompass
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleBatchAutoApply}
                disabled={isBatchRunning}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-semibold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>
                  {isBatchRunning ? 'Auto-Applying in Batch...' : '⚡ Auto-Apply All Qualifying (>85%)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className="px-3.5 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Alerts ({whatsappMessages.length})</span>
              </button>
            </div>
          </div>

          {/* KPI STATS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">Hyper-Fresh Postings</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {jobs.length} Active
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Discovered in past 120 mins</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">Auto-Applied Today</div>
              <div className="text-2xl font-display font-bold text-emerald-400 mt-1">
                {appliedCountToday} / {dailyQuota}
              </div>
              <div className="text-[10px] font-mono text-[#9AA3AE] mt-0.5">
                Dockets stamped &amp; submitted
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">Avg AST Match Score</div>
              <div className="text-2xl font-display font-bold text-emerald-400 mt-1">91.7%</div>
              <div className="text-[10px] font-mono text-emerald-300 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Reachable Code Claims</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">WhatsApp Automation</div>
              <div className="text-2xl font-display font-bold text-emerald-400 mt-1">Active 🟢</div>
              <div className="text-[10px] font-mono text-[#9AA3AE] mt-0.5 truncate">
                {whatsappPhone} · Instant Push
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* NAVIGATION TABS CONTROLLER                                       */}
        {/* ================================================================ */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeTab === 'radar'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Hyper-Fresh Radar ({filteredJobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('auto-apply')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeTab === 'auto-apply'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Auto-Apply Engine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Dispatcher ({whatsappMessages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assist')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeTab === 'assist'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Manual Assist</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeTab === 'preferences'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Preferences</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#9AA3AE]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Proof Stamped to Every Application</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: HYPER-FRESH RADAR (< 1-2 HOUR POSTINGS)                    */}
        {/* ================================================================ */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            {/* Filter Tool Strip */}
            <div className="p-4 rounded-2xl bg-[#12161B] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Platforms:</span>
                </div>
                {['all', 'linkedin', 'naukri', 'wellfound'].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatformFilter(plat)}
                    className={`px-3 py-1.5 rounded-lg font-mono capitalize transition-colors ${
                      platformFilter === plat
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-white/5 text-[#9AA3AE] hover:text-white border border-white/5'
                    }`}
                  >
                    {plat === 'all' ? 'All Platforms' : plat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Freshness Window:</span>
                </div>
                {[
                  { key: 'all', label: 'All (< 2h)' },
                  { key: '30m', label: '< 30 mins' },
                  { key: '1h', label: '< 1 hour' },
                  { key: '2h', label: '< 2 hours' },
                ].map((tw) => (
                  <button
                    key={tw.key}
                    type="button"
                    onClick={() => setTimeWindowFilter(tw.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-mono transition-colors ${
                      timeWindowFilter === tw.key
                        ? 'bg-white/20 text-white font-bold border border-white/30'
                        : 'bg-white/5 text-[#9AA3AE] hover:text-white border border-white/5'
                    }`}
                  >
                    {tw.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-white font-bold">Min Match:</span>
                {[70, 80, 85, 90].map((cov) => (
                  <button
                    key={cov}
                    type="button"
                    onClick={() => setMinCoverageFilter(cov)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors ${
                      minCoverageFilter === cov
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-white/5 text-[#9AA3AE] hover:text-white border border-white/5'
                    }`}
                  >
                    {cov}%+
                  </button>
                ))}
              </div>
            </div>

            {/* Job Cards Stream */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 rounded-2xl bg-[#12161B] hover:bg-[#151A21] border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  {/* Left: Role Info, Platform & Anchor Repo */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          job.sourceName === 'LinkedIn'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : job.sourceName === 'Naukri'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <Globe className="w-3 h-3" />
                        <span>{job.sourceName}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        <span>{job.postedTime}</span>
                      </span>

                      <span className="text-[11px] text-[#9AA3AE]">·</span>
                      <span className="text-white font-mono text-xs">{job.salaryEstimate}</span>
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-white tracking-tight">
                        {job.role}
                      </h3>
                      <p className="text-xs text-[#9AA3AE] flex items-center gap-2 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-white font-medium">{job.company}</span>
                        <span>·</span>
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </p>
                    </div>

                    {/* Repository Match Evidence Anchor */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                      <div className="text-[11px] text-[#9AA3AE] flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Matched via Authentic GitHub Repo:</span>
                        <span className="text-emerald-300 font-bold">{job.anchorRepo}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {job.provenSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center: Match Score Gauge */}
                  <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/10 shrink-0">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#34D399"
                          strokeWidth="3"
                          strokeDasharray="94.2"
                          strokeDashoffset={94.2 - (94.2 * job.coveragePercent) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-white">
                        {job.coveragePercent}%
                      </span>
                    </div>
                    <div className="text-[11px] leading-tight text-[#9AA3AE] max-w-[140px]">
                      <span className="font-bold text-white block">AST Evidence Fit</span>
                      <span>{job.coveragePercent}% of required functions reachable in repo</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-row lg:flex-col items-center gap-2.5 w-full lg:w-44 shrink-0">
                    {job.applied ? (
                      <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Applied ({job.appliedAt})</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAutoApplySingle(job.id)}
                        disabled={job.status === 'applying'}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 fill-black" />
                        <span>{job.status === 'applying' ? 'Submitting...' : 'Auto-Apply Now'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenAssistForJob(job.id)}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Review Assist</span>
                    </button>

                    <a
                      href={job.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-xl text-[#9AA3AE] hover:text-white font-mono text-[11px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Open on {job.sourceName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: AUTONOMOUS AUTO-APPLY POLICY & EXECUTION ENGINE           */}
        {/* ================================================================ */}
        {activeTab === 'auto-apply' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Policy & Threshold Settings (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#12161B] border border-white/10 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base">
                        Autonomous Policy
                      </h3>
                      <p className="text-xs text-[#9AA3AE]">Rules for automated submissions</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoApplyEnabled(!autoApplyEnabled)}
                    className="text-emerald-400"
                  >
                    {autoApplyEnabled ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-[#575D65]" />
                    )}
                  </button>
                </div>

                {/* Match Score Threshold Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold">Minimum Verified Match Score</span>
                    <span className="text-emerald-400 font-bold text-sm">{minMatchThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="95"
                    step="5"
                    value={minMatchThreshold}
                    onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <p className="text-[11px] text-[#9AA3AE]">
                    Roles below {minMatchThreshold}% verified AST match are skipped to protect applicant quality.
                  </p>
                </div>

                {/* Daily Quota */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold">Daily Auto-Apply Limit</span>
                    <span className="text-emerald-400 font-bold text-sm">{dailyQuota} roles/day</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={dailyQuota}
                    onChange={(e) => setDailyQuota(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9AA3AE]">
                    <span>Today: {appliedCountToday} used</span>
                    <span>Remaining: {dailyQuota - appliedCountToday}</span>
                  </div>
                </div>

                {/* Guardrail Switches */}
                <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-semibold block">Attach Merkle Proof Docket</span>
                      <span className="text-[10px] text-[#9AA3AE]">Includes verifiable cryptographic link in ATS payload</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachDocket(!attachDocket)}
                      className="text-emerald-400"
                    >
                      {attachDocket ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-[#575D65]" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-semibold block">Tailor Resume AST Bullets</span>
                      <span className="text-[10px] text-[#9AA3AE]">Prioritizes XYZ bullets matching the target job description</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTailorAstBullets(!tailorAstBullets)}
                      className="text-emerald-400"
                    >
                      {tailorAstBullets ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-[#575D65]" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected GitHub Anchor Box */}
              <div className="p-5 rounded-2xl bg-[#12161B] border border-white/10 space-y-3 shadow-xl">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider text-[#9AA3AE]">
                  Active Code Anchors
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <span className="text-emerald-300 font-bold">{username}/AI-CarrerCoach</span>
                    <span className="text-[10px] text-[#9AA3AE]">FastAPI · Python · SQLite</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <span className="text-emerald-300 font-bold">{username}/CaseCompass</span>
                    <span className="text-[10px] text-[#9AA3AE]">React · TypeScript · Vite</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Terminal & Batch Runner (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-[#12161B] border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-display font-bold text-white text-base">
                      Autonomous Bot Pipeline Stream
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleBatchAutoApply}
                    disabled={isBatchRunning}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>{isBatchRunning ? 'Running Automation...' : 'Trigger Immediate Sweep'}</span>
                  </button>
                </div>

                {/* Console Log Display */}
                <div className="bg-[#0A0C0F] border border-white/10 rounded-xl p-4 font-mono text-xs space-y-2 h-96 overflow-y-auto">
                  {terminalLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`leading-relaxed ${
                        log.includes('DISPATCHED') || log.includes('COMPLETE')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('WHATSAPP')
                          ? 'text-emerald-300'
                          : log.includes('BATCH')
                          ? 'text-amber-300 font-bold'
                          : 'text-white/80'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#9AA3AE] pt-2">
                  <span>Audit Enclave: SHA256 Cryptographic Token Generation Active</span>
                  <button
                    type="button"
                    onClick={() => setTerminalLogs([`[SYS_RESET] Console cleared at ${new Date().toLocaleTimeString()}`])}
                    className="hover:text-white"
                  >
                    Clear Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: WHATSAPP AUTOMATION CENTER & LIVE PHONE SIMULATOR         */}
        {/* ================================================================ */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Configuration & Dispatch History (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* WhatsApp Config Card */}
              <div className="p-6 rounded-2xl bg-[#12161B] border border-white/10 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base">
                        WhatsApp Automation Hook
                      </h3>
                      <p className="text-xs text-[#9AA3AE]">Real-time status updates pushed to your phone</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWhatsappConnected(!whatsappConnected)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-colors ${
                      whatsappConnected
                        ? 'bg-[#25D366]/20 text-[#25D366] border-[#25D366]/40'
                        : 'bg-white/10 text-[#9AA3AE] border-white/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${whatsappConnected ? 'bg-[#25D366] animate-pulse' : 'bg-gray-400'}`} />
                    <span>{whatsappConnected ? 'Connected 🟢' : 'Paused ⚪'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#9AA3AE] uppercase block mb-1.5">
                      Target WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#9AA3AE] uppercase block mb-1.5">
                      Delivery Cadence
                    </label>
                    <select
                      value={whatsappMode}
                      onChange={(e) => setWhatsappMode(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A2028] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      <option value="instant">Instant Real-Time (Per Applied Job)</option>
                      <option value="digest">Hourly Grouped Digest</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <div className="text-xs text-[#9AA3AE]">
                    Webhook Status: <span className="text-emerald-400 font-bold">200 OK · Cloud API Active</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendTestWhatsAppPing}
                    disabled={isSendingTestPing}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/15"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isSendingTestPing ? 'Sending...' : 'Send Test WhatsApp Ping'}</span>
                  </button>
                </div>
              </div>

              {/* Dispatched Applications Ledger */}
              <div className="p-6 rounded-2xl bg-[#12161B] border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white text-base">
                    Dispatched Applications Ledger ({jobs.filter((j) => j.applied).length})
                  </h3>
                  <span className="text-[11px] text-[#9AA3AE]">Auto-recorded in immutable audit trail</span>
                </div>

                <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden text-xs">
                  {jobs
                    .filter((j) => j.applied)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-white/[0.015] hover:bg-white/[0.04] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{item.company}</span>
                            <span className="text-[10px] text-[#9AA3AE]">·</span>
                            <span className="text-emerald-400 text-[11px] font-mono">
                              {item.sourceName}
                            </span>
                          </div>
                          <div className="text-[#9AA3AE] text-[11px]">{item.role}</div>
                          <div className="text-[10px] text-emerald-300 font-mono">
                            Anchor: {item.anchorRepo} · {item.coveragePercent}% Match
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="px-2.5 py-1 rounded bg-[#25D366]/15 text-[#25D366] text-[10px] font-bold border border-[#25D366]/30 flex items-center gap-1">
                            <span>WhatsApp ✓✓</span>
                          </span>
                          <span className="text-[10px] text-[#9AA3AE]">{item.appliedAt || 'Today'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right: Realistic WhatsApp Phone Mockup (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-[36px] bg-[#0B141A] border-4 border-[#2A3942] shadow-2xl overflow-hidden flex flex-col relative text-white">
                {/* Phone Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#2A3942] rounded-full z-20" />

                {/* WhatsApp Chat Header */}
                <div className="bg-[#202C33] px-4 pt-8 pb-3 flex items-center justify-between border-b border-[#2A3942]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      PS
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight text-[#E9EDEF]">
                        ProofStack Auto-Apply
                      </div>
                      <div className="text-[10px] text-[#25D366] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                        <span>Online · Verified Enterprise</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Messages Scrollable Area */}
                <div className="p-4 space-y-3.5 bg-[#0B141A] min-h-[460px] max-h-[520px] overflow-y-auto font-sans text-xs">
                  {/* Encrypted Notice */}
                  <div className="bg-[#182229] border border-white/5 rounded-lg p-2 text-center text-[10px] text-[#8696A0] leading-tight">
                    🔒 Messages are end-to-end encrypted. ProofStack Bot automates job applications directly to your phone.
                  </div>

                  {whatsappMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-[#005C4B] text-[#E9EDEF] rounded-2xl rounded-tl-sm p-3.5 shadow-md space-y-1.5 relative border border-emerald-500/20"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                        <span>🚀 Auto-Apply Dispatch Alert</span>
                        <span className="text-[10px] text-[#8696A0]">{msg.time}</span>
                      </div>

                      <div className="text-xs space-y-0.5 leading-snug">
                        <div>
                          <strong className="text-white">🏢 Company:</strong> {msg.company}
                        </div>
                        <div>
                          <strong className="text-white">💼 Role:</strong> {msg.role}
                        </div>
                        <div>
                          <strong className="text-white">⏱️ Detected:</strong> {msg.source} ({msg.postedAgo})
                        </div>
                        <div>
                          <strong className="text-white">📊 AST Fit:</strong> {msg.matchScore}% backed by {msg.anchorRepo}
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-emerald-400/20">
                        <a
                          href={msg.docketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white underline font-mono"
                        >
                          <span>View Proof Docket</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-emerald-300/80 pt-0.5">
                        <span>{msg.status}</span>
                        <span className="text-[#53BDEB] font-bold">✓✓</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Chat Footer Mock */}
                <div className="bg-[#202C33] p-2.5 flex items-center gap-2 border-t border-[#2A3942]">
                  <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5 text-xs text-[#8696A0]">
                    Automated Read-Only Enclave
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center text-white">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: MANUAL ASSIST (EXISTING SPEC PRESERVED & ENHANCED)        */}
        {/* ================================================================ */}
        {activeTab === 'assist' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#12161B] border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#9AA3AE] uppercase tracking-wider block">
                  ACTIVE APPLICATION DOCKET
                </span>
                <h2 className="font-display text-base font-bold text-white">
                  {selectedJob.company} — {selectedJob.role}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  Evidence Match: {selectedJob.coveragePercent}%
                </span>
                <button
                  type="button"
                  onClick={() => handleAutoApplySingle(selectedJob.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold"
                >
                  Confirm &amp; Auto-Submit Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#12161B] border border-white/10 shadow-xl space-y-4">
                <h3 className="font-display text-sm font-bold text-white pb-3 border-b border-white/10">
                  Application Questions &amp; Prefilled Proof Anchors
                </h3>

                <div className="space-y-3">
                  {formFields.map((field) => (
                    <div key={field.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white">{field.label}</span>
                        <span className="text-[10px] text-emerald-400">{field.source}</span>
                      </div>
                      <div className="text-xs text-white/90 bg-black/30 p-2 rounded-lg font-mono">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12161B] border border-white/10 shadow-xl space-y-4">
                <h3 className="font-display text-sm font-bold text-white pb-3 border-b border-white/10">
                  Candidate Verified AST Profile
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300">
                    <strong>Primary Code Anchor:</strong> {selectedJob.anchorRepo}
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[#9AA3AE] space-y-1">
                    <span className="text-white font-bold block">Proven AST Claims:</span>
                    <div>{selectedJob.provenSkills.join(' · ')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 5: PREFERENCES (EXISTING SPEC PRESERVED)                     */}
        {/* ================================================================ */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {paused ? (
                  <PauseCircle className="w-6 h-6 text-amber-400" />
                ) : (
                  <PlayCircle className="w-6 h-6 text-emerald-400" />
                )}
                <div>
                  <h3 className="font-display text-sm font-bold text-white">
                    {paused ? 'Job Alerts Paused' : 'Job Alerts Active'}
                  </h3>
                  <p className="text-xs text-[#9AA3AE]">
                    {paused
                      ? 'No outbound notifications will be triggered until resumed.'
                      : 'Scanning LinkedIn, Naukri, and verified APIs every few minutes.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaused(!paused)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  paused
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {paused ? 'Resume Alerts' : 'Pause Alerts'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#12161B] border border-white/10 space-y-4">
                <h3 className="font-display text-base font-bold text-white">Target Requisition Criteria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-[#9AA3AE] block mb-1">
                      Role Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRoleType('full_time')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                          roleType === 'full_time' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-[#9AA3AE]'
                        }`}
                      >
                        Full-Time
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoleType('internship')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                          roleType === 'internship' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-[#9AA3AE]'
                        }`}
                      >
                        Contract
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-[#9AA3AE] block mb-1">
                      Location Preference
                    </label>
                    <input
                      type="text"
                      value={locationPref}
                      onChange={(e) => setLocationPref(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12161B] border border-white/10 space-y-4">
                <h3 className="font-display text-base font-bold text-white">Monitored Platforms</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-white">
                    <span>LinkedIn Jobs (Real-Time API)</span>
                    <span className="text-emerald-400 font-bold">Connected</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-white">
                    <span>Naukri.com FastForward</span>
                    <span className="text-emerald-400 font-bold">Connected</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-white">
                    <span>Wellfound / AngelList</span>
                    <span className="text-emerald-400 font-bold">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
