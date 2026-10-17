import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  FileText,
  ShieldCheck,
  Sword,
  Palette,
  Terminal,
  Zap,
  RotateCcw,
  Scale,
  LogOut,
  Trash2,
  Key,
  Bell,
  SunMoon,
  Eye,
  MoreHorizontal,
  X,
  User,
  Radio,
  Layers,
  GitFork,
  Github,
  FileUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProofStack } from '../../context/ProofStackContext';
import { SystemMetrics } from '../../types/api';
import { CounterChip } from '../ui/Chips';
import { Button } from '../ui/Button';
import { BackButton } from '../ui/BackButton';
import { initialMetrics, getDiagnostics, DiagnosticsResult, getRepoRejections } from '../../lib/api';
import { SettingsModal } from '../settings/SettingsModal';
import { ConnectGitHubModal } from '../common/ConnectGitHubModal';
import { RefusedSignalsDrawer } from '../drawer/RefusedSignalsDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
  metrics?: SystemMetrics;
  onSimulatePush?: () => void;
  isLoading?: boolean;
  activeTab?: string;
  appState?: 'normal' | 'loading' | 'empty' | 'partial' | 'rate_limited' | 'error';
  onResetState?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  metrics = initialMetrics,
  onSimulatePush,
  isLoading,
  appState = 'normal',
  onResetState,
}) => {
  const { user, logout, deleteMyData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [refusedDrawerOpen, setRefusedDrawerOpen] = useState(false);
  const [liveDiagnostics, setLiveDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [liveRefusedCount, setLiveRefusedCount] = useState<number | null>(null);

  const { repository, resetDemoData, connectedRepos, switchRepository } = useProofStack();

  useEffect(() => {
    let isMounted = true;
    const fetchRefusals = async () => {
      try {
        const repoId = repository?.id || 'default';
        const data = await getRepoRejections(repoId);
        if (isMounted && typeof data.total_refused_count === 'number') {
          setLiveRefusedCount(data.total_refused_count);
        }
      } catch {
        // fallback to metrics
      }
    };
    fetchRefusals();
    const interval = setInterval(fetchRefusals, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [repository?.id]);

  useEffect(() => {
    let isMounted = true;
    const checkLiveHealth = async () => {
      try {
        const diag = await getDiagnostics();
        if (isMounted) setLiveDiagnostics(diag);
      } catch {
        // Fallback to metrics prop
      }
    };
    checkLiveHealth();
    const interval = setInterval(checkLiveHealth, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMoreOpen) setMobileMoreOpen(false);
        if (userMenuOpen) setUserMenuOpen(false);
        if (notificationsOpen) setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMoreOpen, userMenuOpen, notificationsOpen]);

  // Dynamic Page Title & Breadcrumbs mapping
  const { pageTitle, breadcrumbs } = useMemo(() => {
    const path = location.pathname;
    if (path === '/app' || path === '/') {
      return {
        pageTitle: 'Overview Dossier',
        breadcrumbs: [{ label: 'Overview', to: '/app' }],
      };
    }
    if (path === '/app/audit' || path === '/audit') {
      return {
        pageTitle: 'Repository Audit & Lineage',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Repository Audit', to: '/app/audit' },
        ],
      };
    }
    if (path === '/app/evidence' || path === '/evidence') {
      return {
        pageTitle: 'Evidence Validation Workspace',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Evidence Validation', to: '/app/evidence' },
        ],
      };
    }
    if (path.startsWith('/app/contracts') || path.startsWith('/contracts')) {
      const parts = path.split('/').filter(Boolean);
      const isDetail = parts.length > 2;
      return {
        pageTitle: 'Commit Contracts Ledger',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Contracts', to: '/app/contracts' },
          ...(isDetail ? [{ label: `#${parts[2]}`, to: path }] : []),
        ],
      };
    }
    if (path === '/app/proof-map' || path === '/proof-map') {
      return {
        pageTitle: 'Interactive Proof Map',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Proof Map', to: '/app/proof-map' },
        ],
      };
    }
    if (path === '/resume' || path === '/app/resume') {
      return {
        pageTitle: 'Resume Attestation',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Resume', to: '/resume' },
        ],
      };
    }
    if (path === '/verify' || path === '/app/verify') {
      return {
        pageTitle: 'Verification Ledger',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Verify', to: '/verify' },
        ],
      };
    }
    if (path === '/breakme' || path === '/app/break-me') {
      return {
        pageTitle: 'Adversarial Test',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'BreakMe', to: '/breakme' },
        ],
      };
    }
    if (path === '/scan' || path === '/app/scanner') {
      return {
        pageTitle: 'Requirements Scanner',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Scanner', to: '/scan' },
        ],
      };
    }
    if (path === '/app/skill-tests' || path === '/skill-tests' || path === '/app/code-quality-tests') {
      return {
        pageTitle: 'Code-Quality Skill Tests',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Skill Tests', to: '/app/skill-tests' },
        ],
      };
    }
    if (path === '/how-we-judge') {
      return {
        pageTitle: 'How We Judge',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Judge Rubric', to: '/how-we-judge' },
        ],
      };
    }
    if (path === '/styleguide') {
      return {
        pageTitle: 'Design Tokens',
        breadcrumbs: [
          { label: 'Overview', to: '/app' },
          { label: 'Styleguide', to: '/styleguide' },
        ],
      };
    }
    return {
      pageTitle: 'Candidate Dossier',
      breadcrumbs: [
        { label: 'Overview', to: '/app' },
        { label: path.replace('/', ''), to: path },
      ],
    };
  }, [location.pathname]);

  // Desktop Left Rail navigation items (5 Primary Destinations)
  const navItems = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard },
    { to: '/app/audit', label: 'Audit', icon: ShieldCheck },
    { to: '/app/evidence', label: 'Evidence', icon: FileCheck2 },
    { to: '/app/contracts', label: 'Contracts', icon: FileText },
    { to: '/app/proof-map', label: 'ProofMap', icon: Layers },
    { to: '/resume', label: 'Resume', icon: FileUp },
    { to: '/app/skill-tests', label: 'Skill Tests', icon: Award },
  ];

  // Mobile 5-Tab Bar items (4 primary + More sheet)
  const mobileTabItems = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard },
    { to: '/app/audit', label: 'Audit', icon: ShieldCheck },
    { to: '/app/evidence', label: 'Evidence', icon: FileCheck2 },
    { to: '/app/contracts', label: 'Contracts', icon: FileText },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0C0F] text-[#F4F2EC] flex flex-row selection:bg-emerald-500/30 selection:text-white desk-grid relative overflow-x-hidden pb-16 lg:pb-0">
      {/* Ambient Radial Vignette & Atmospheric Lights */}
      <div className="fixed inset-0 pointer-events-none desk-vignette z-0" aria-hidden="true" />
      <div
        className="fixed -top-40 left-1/3 w-[600px] h-[600px] bg-[#1F8A5B] opacity-[0.09] rounded-full blur-[140px] pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 right-0 w-[550px] h-[500px] bg-[#6D5BD0] opacity-[0.08] rounded-full blur-[150px] pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* DESKTOP LEFT ICON RAIL (64px wide, glass, full height) */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-16 bg-[#0B0D10]/90 backdrop-blur-2xl border-r border-white/10 z-40 flex-col items-center py-4 justify-between shrink-0"
        aria-label="Desktop Rail Navigation"
      >
        {/* Brand Mark Top */}
        <Link
          to="/"
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center shadow-lg hover:border-emerald-500/50 transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-500"
          title="Return to ProofStack Landing"
        >
          <Terminal className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center space-y-3 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex flex-col items-center justify-center w-full py-1.5 transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-[#9AA3AE] hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-r shadow-[0_0_12px_#34D399]" />
                    )}
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] mt-0.5 font-mono font-medium tracking-tight">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Avatar Mini Trigger on Rail Bottom */}
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-white shadow">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.login} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span>{user ? user.login.slice(0, 2).toUpperCase() : 'PS'}</span>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER (Offset by 64px rail on desktop) */}
      <div className="w-full lg:pl-16 min-h-screen flex flex-col relative z-10">
        {/* PERSISTENT DEMO NOTICE & REPOSITORY CONTEXT BANNER */}
        <div className="w-full bg-[#131D32] border-b border-[#25324A] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono text-[#9AA3AE] gap-2 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            {repository.connectionState === 'live_connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-emerald-400 font-bold tracking-wider">[LIVE VERIFICATION ACTIVE]</span>
                <span className="hidden md:inline text-white/80">Real GitHub repository AST audit for {repository.fullName}.</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-amber-300 font-bold tracking-wider">[DEMO MODE — SAMPLE DATA]</span>
                <span className="hidden md:inline text-[#9AA3AE]/80">This is an evidence simulation, not a live GitHub audit.</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {connectedRepos && connectedRepos.length > 1 ? (
              <div className="flex items-center gap-1.5 bg-[#0B1020] border border-[#25324A] rounded px-2 py-0.5">
                <GitFork className="w-3 h-3 text-cyan-400 shrink-0" />
                <select
                  value={repository.id}
                  onChange={(e) => switchRepository(e.target.value)}
                  className="bg-transparent text-emerald-400 font-mono text-xs focus:outline-none cursor-pointer"
                  title="Switch active repository"
                >
                  {connectedRepos.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#0A0C0F] text-white">
                      {r.owner}/{r.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0B1020] border border-[#25324A] text-white truncate max-w-[150px] sm:max-w-none">
                <GitFork className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{repository.fullName}</span>
              </div>
            )}
            <button
              onClick={() => setConnectModalOpen(true)}
              className="hover:text-white text-cyan-300 underline flex items-center gap-1"
            >
              <Github className="w-3 h-3" /> Connect GitHub
            </button>
            <span className="text-[#25324A]">·</span>
            <button
              onClick={resetDemoData}
              className="flex items-center gap-1 hover:text-white text-rose-300 transition-colors"
              title="Reset all simulated contract changes to initial state"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>
        </div>

        {/* TOP BAR (Every page after landing page) */}
        <header className="min-h-16 h-auto py-2 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-[#0A0C0F]/90 backdrop-blur-xl flex flex-wrap sm:flex-nowrap items-center justify-between sticky top-7 z-30 gap-3">
          {/* LEFT: 44px Round Ink-White Back Button + Logo + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <BackButton />

            {/* Mobile Logo Mark */}
            <Link
              to="/"
              className="lg:hidden w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center"
              title="ProofStack Home"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
            </Link>

            {/* Dynamic Breadcrumbs */}
            <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs font-mono">
              <span className="font-display font-bold text-white hidden md:inline">ProofStack</span>
              <span className="text-[#9AA3AE]/40 hidden md:inline">/</span>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.to}>
                    {idx > 0 && <span className="text-[#9AA3AE]/40">/</span>}
                    {isLast ? (
                      <span className="text-white font-semibold truncate max-w-[140px] sm:max-w-none">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.to}
                        className="text-[#9AA3AE] hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* CENTER: Current Page Title */}
          <div className="order-3 sm:order-2 w-full sm:w-auto text-center font-display text-sm sm:text-base font-bold text-white/90 truncate tracking-tight">
            {pageTitle}
          </div>

          {/* RIGHT: Health Dots, Notifications, Theme Toggle, User Avatar Menu */}
          <div className="order-2 sm:order-3 flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Live Health Dots with Status Tooltip linking to Diagnostics */}
            <Link
              to="/diagnostics"
              className={`hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full font-mono text-[10px] transition-colors border ${
                liveDiagnostics?.status === 'degraded' || liveDiagnostics?.status === 'failing'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-white/[0.03] border-white/10 hover:border-emerald-500/40 text-[#9AA3AE]'
              }`}
              title={
                liveDiagnostics
                  ? `Cluster Diagnostics: ${liveDiagnostics.status.toUpperCase()} | GH: ${liveDiagnostics.checks.github.passed ? 'OK' : liveDiagnostics.checks.github.error || 'FAIL'} | DB: ${liveDiagnostics.checks.database.passed ? 'OK' : 'FAIL'} | LLM: ${liveDiagnostics.checks.llm.passed ? 'OK' : 'FAIL'}`
                  : 'View Live Cluster Diagnostics (/diagnostics)'
              }
              data-testid="health-strip-link"
            >
              {/* GitHub Health Pill */}
              <span className="flex items-center gap-1.5" title={liveDiagnostics?.checks.github.error || `GitHub: ${liveDiagnostics?.checks.github.rate_limit_remaining ?? 5000} req left`}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    liveDiagnostics
                      ? liveDiagnostics.checks.github.passed
                        ? 'bg-emerald-400 animate-pulse'
                        : liveDiagnostics.checks.github.rate_limit_remaining === 0
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                      : metrics.health.github
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-red-400'
                  }`}
                />
                <span>
                  GH
                  {liveDiagnostics?.checks.github.rate_limit_remaining !== undefined
                    ? ` ${liveDiagnostics.checks.github.rate_limit_remaining}`
                    : ''}
                </span>
              </span>

              <span className="text-white/20">·</span>

              {/* Webhook Health Pill */}
              <span className="flex items-center gap-1.5" title={liveDiagnostics?.checks.webhook.error || 'Webhook Pipeline: Active'}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    liveDiagnostics
                      ? liveDiagnostics.checks.webhook.passed
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-red-400'
                      : metrics.health.webhook
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-red-400'
                  }`}
                />
                <span>Hook</span>
              </span>

              <span className="text-white/20">·</span>

              {/* Database Read/Write Pill */}
              <span className="flex items-center gap-1.5" title={liveDiagnostics?.checks.database.error || `Database WAL: ${liveDiagnostics?.checks.database.latency_ms ?? 0.8}ms`}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    liveDiagnostics
                      ? liveDiagnostics.checks.database.passed
                        ? 'bg-emerald-400'
                        : 'bg-red-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  DB
                  {liveDiagnostics?.checks.database?.latency_ms !== undefined
                    ? ` ${liveDiagnostics.checks.database.latency_ms}ms`
                    : ''}
                </span>
              </span>

              <span className="text-white/20">·</span>

              {/* Engine Pill */}
              <span className="flex items-center gap-1.5" title={liveDiagnostics?.checks.llm.error || 'AST & LLM Verification Engine'}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    liveDiagnostics
                      ? liveDiagnostics.checks.llm.passed
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                      : metrics.health.model
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
                <span>
                  {liveDiagnostics?.checks.llm.provider === 'none'
                    ? 'AST'
                    : liveDiagnostics?.checks.llm.provider
                    ? liveDiagnostics.checks.llm.provider.toUpperCase().slice(0, 4)
                    : 'Engine'}
                </span>
              </span>
            </Link>

            {/* Notification Bell with Badge & Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/30 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="View notifications and real-time ledger alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-[#12161B] border border-white/15 shadow-2xl p-4 z-50 font-mono text-xs backdrop-blur-2xl"
                  data-testid="notifications-popover"
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Ledger Stream</span>
                    </span>
                    <span className="text-[10px] text-emerald-400">SSE LIVE</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded bg-white/[0.03] border border-white/5 text-center text-[#9AA3AE] text-[11px]">
                      Zero-trust event bus active. Pushed commits and webhook evaluations will stream here in real time.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme & Mode Toggles */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const isDemo = document.documentElement.classList.toggle('demo-mode');
                  if (isDemo) {
                    document.documentElement.setAttribute('data-demo', 'true');
                    sessionStorage.setItem('ps_demo_mode', 'true');
                  } else {
                    document.documentElement.removeAttribute('data-demo');
                    sessionStorage.removeItem('ps_demo_mode');
                  }
                  window.dispatchEvent(new Event('demo-mode-changed'));
                }}
                title="Projector Presentation Mode"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 hover:border-emerald-500/50 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <SunMoon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => document.documentElement.classList.toggle('grayscale-active')}
                title="Accessibility Grayscale Mode"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/30 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors focus:outline-none"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* User Avatar Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-white shadow hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 overflow-hidden"
                aria-label="User account and profile menu"
                data-testid="user-menu-trigger"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.login} className="w-full h-full object-cover" />
                ) : (
                  <span>{user ? user.login.slice(0, 2).toUpperCase() : 'PS'}</span>
                )}
              </button>

              {userMenuOpen && (
                <div
                  data-testid="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-[#12161B] border border-white/15 shadow-2xl p-3 z-50 flex flex-col gap-1.5 font-mono text-xs backdrop-blur-2xl"
                >
                  <div className="pb-2 px-2 border-b border-white/10">
                    <div className="text-[10px] text-[#9AA3AE] uppercase">Signed in as</div>
                    <div className="text-white font-bold truncate">@{user?.login || 'developer'}</div>
                  </div>

                  <Link
                    to="/app"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-white/5 text-[#9AA3AE] hover:text-white transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Profile & Dossier</span>
                  </Link>

                  <Link
                    to="/resume"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-white/5 text-[#9AA3AE] hover:text-white transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume Attestation</span>
                  </Link>

                  <Link
                    to="/alerts"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-white/5 text-[#9AA3AE] hover:text-white transition-colors text-left"
                  >
                    <Bell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Job Alerts & Matches</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-white/5 text-[#9AA3AE] hover:text-white transition-colors text-left"
                  >
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>API Keys & Engine</span>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
                    data-testid="logout-button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-white/5 text-[#9AA3AE] hover:text-white transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Sign out</span>
                  </button>

                  <button
                    type="button"
                    data-testid="delete-my-data-button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          'Eradicate all your data? This will record an immutable cryptographic tombstone on the ledger and permanently remove your user records.'
                        )
                      ) {
                        setUserMenuOpen(false);
                        await deleteMyData();
                        navigate('/login');
                      }
                    }}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Eradicate all my data</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hollow Signals Refused Counter */}
            <button
              type="button"
              onClick={() => setRefusedDrawerOpen(true)}
              className="hover:scale-105 active:scale-95 transition-transform cursor-pointer focus:outline-none"
              title="Click to view refused signals ledger"
            >
              <CounterChip
                label="Hollow signals refused"
                count={liveRefusedCount ?? metrics.hollowSignalsRefused}
                variant="attack"
              />
            </button>

            {/* Quick Demo Script Button: Simulate Push */}
            {onSimulatePush && (
              <Button
                variant="solid_paper"
                size="sm"
                onClick={onSimulatePush}
                isLoading={isLoading}
                icon={<Zap className="w-3.5 h-3.5 text-[#14171A]" />}
                aria-label="Simulate Inbound Push Event"
                className="hidden md:inline-flex"
              >
                Push Lands
              </Button>
            )}

            {/* State Reset if in test state */}
            {appState !== 'normal' && onResetState && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetState}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            )}
          </div>
        </header>

        {/* BODY CONTAINER */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR (Fixed with 5 icons) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B0D10]/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2"
        aria-label="Mobile Bottom Navigation"
      >
        {mobileTabItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#9AA3AE] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span className="text-[10px] mt-1 font-mono tracking-tight">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* 5th Icon: More (Triggers Mobile Sheet) */}
        <button
          type="button"
          onClick={() => setMobileMoreOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[#9AA3AE] hover:text-white transition-colors"
          aria-label="More navigation links"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-mono tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE MORE SHEET / DRAWER */}
      {mobileMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative w-full bg-[#12161B] border-t border-white/15 rounded-t-2xl p-6 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
            {/* Header with Back Arrow and Close X */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-1.5 text-xs font-mono text-[#9AA3AE] hover:text-white"
              >
                <BackButton showIconOnly className="min-w-[36px] min-h-[36px] h-[36px]" onClick={() => setMobileMoreOpen(false)} />
                <span>Return</span>
              </button>
              <span className="font-display font-bold text-white text-sm">More Views</span>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#9AA3AE] hover:text-white"
                aria-label="Close more menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Additional Views */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <Link
                to="/app/proof-map"
                onClick={() => setMobileMoreOpen(false)}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-white"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Proof Map</span>
              </Link>
              <Link
                to="/breakme"
                onClick={() => setMobileMoreOpen(false)}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-white"
              >
                <Sword className="w-4 h-4 text-emerald-400" />
                <span>BreakMe Test</span>
              </Link>
              <Link
                to="/verify"
                onClick={() => setMobileMoreOpen(false)}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-white"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Ledger</span>
              </Link>
              <Link
                to="/how-we-judge"
                onClick={() => setMobileMoreOpen(false)}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-white"
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Judge Rubric</span>
              </Link>
              <Link
                to="/styleguide"
                onClick={() => setMobileMoreOpen(false)}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-white"
              >
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>Style Tokens</span>
              </Link>
              <Link
                to="/alerts"
                onClick={() => setMobileMoreOpen(false)}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-white"
              >
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Job Alerts</span>
              </Link>
            </div>

            {/* Engine Settings button */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMoreOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-emerald-400" />
                <span>API Keys & Engine Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys & Engine Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Connect GitHub Prototype Modal */}
      <ConnectGitHubModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onExploreDemo={() => {
          setConnectModalOpen(false);
          resetDemoData();
          navigate('/app');
        }}
      />

      {/* Refused Signals Ledger Drawer */}
      <RefusedSignalsDrawer
        isOpen={refusedDrawerOpen}
        onClose={() => setRefusedDrawerOpen(false)}
        repoId={repository?.id || 'default'}
      />
    </div>
  );
};
