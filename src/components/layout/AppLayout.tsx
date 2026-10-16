import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SystemMetrics } from '../../types/api';
import { HealthChip, CounterChip } from '../ui/Chips';
import { Button } from '../ui/Button';
import { SettingsModal } from '../settings/SettingsModal';

interface AppLayoutProps {
  children: React.ReactNode;
  metrics: SystemMetrics;
  onSimulatePush?: () => void;
  isLoading?: boolean;
  activeTab?: string;
  appState?: 'normal' | 'loading' | 'empty' | 'partial' | 'rate_limited' | 'error';
  onResetState?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  metrics,
  onSimulatePush,
  isLoading,
  appState = 'normal',
  onResetState,
}) => {
  const { user, logout, deleteMyData } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const navItems = [
    { to: '/app', label: 'Dash', icon: LayoutDashboard },
    { to: '/app/contracts', label: 'Contracts', icon: FileCheck2 },
    { to: '/breakme', label: 'Break', icon: Sword },
    { to: '/resume', label: 'Resume', icon: FileText },
    { to: '/verify', label: 'Verify', icon: ShieldCheck },
    { to: '/scan', label: 'Scan', icon: Terminal },
    { to: '/how-we-judge', label: 'Judge', icon: Scale },
    { to: '/styleguide', label: 'Tokens', icon: Palette },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0C0F] text-[#F4F2EC] flex flex-row selection:bg-emerald-500/30 selection:text-white desk-grid relative overflow-x-hidden">
      {/* Ambient Radial Vignette & Lights */}
      <div className="fixed inset-0 pointer-events-none desk-vignette z-0" aria-hidden="true" />
      <div
        className="fixed -top-40 left-1/3 w-[600px] h-[600px] bg-[#1F8A5B] opacity-[0.09] rounded-full blur-[140px] pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 right-0 w-[550px] h-[500px] bg-[#6D5BD0] opacity-[0.08] rounded-full blur-[150px] pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* LEFT ICON RAIL (64px wide, glass, full height) */}
      <aside
        className="fixed top-0 left-0 bottom-0 w-16 bg-[#0B0D10]/90 backdrop-blur-2xl border-r border-white/10 z-40 flex flex-col items-center py-4 justify-between shrink-0"
        aria-label="Application Rail Navigation"
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

        {/* User Avatar & Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-white shadow hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 overflow-hidden"
            title={user ? `${user.name || user.login} (@${user.login})` : 'Account menu'}
            aria-label="User account security menu"
            data-testid="user-menu-trigger"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.login} className="w-full h-full object-cover" />
            ) : (
              <span>{user ? user.login.slice(0, 2).toUpperCase() : 'RN'}</span>
            )}
          </button>

          {userMenuOpen && (
            <div
              data-testid="user-dropdown-menu"
              className="absolute left-12 bottom-0 w-60 rounded-[12px] bg-[#12161B] border border-white/15 shadow-2xl p-3 z-50 flex flex-col gap-2 font-mono text-xs backdrop-blur-xl"
            >
              <div className="pb-2 border-b border-white/10">
                <div className="text-[10px] text-[#9AA3AE] uppercase">Signed in as</div>
                <div className="text-white font-bold truncate">@{user?.login || 'guest'}</div>
              </div>

              <button
                type="button"
                data-testid="settings-menu-button"
                onClick={() => {
                  setUserMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-2 p-2 rounded hover:bg-white/5 text-[#9AA3AE] hover:text-white transition-colors text-left"
              >
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Keys & Engine</span>
              </button>

              <button
                type="button"
                data-testid="logout-button"
                onClick={async () => {
                  setUserMenuOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="flex items-center gap-2 p-2 rounded hover:bg-white/5 text-[#9AA3AE] hover:text-white transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Sign out</span>
              </button>

              <button
                type="button"
                data-testid="delete-my-data-button"
                onClick={async () => {
                  if (window.confirm('Eradicate all your data? This will record an immutable cryptographic tombstone on the ledger and permanently remove your user records.')) {
                    setUserMenuOpen(false);
                    await deleteMyData();
                    navigate('/login');
                  }
                }}
                className="flex items-center gap-2 p-2 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Eradicate all my data</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER (Offset by 64px rail) */}
      <div className="pl-16 w-full min-h-screen flex flex-col relative z-10">
        {/* TOP BAR (56px) */}
        <header className="h-14 px-6 lg:px-8 border-b border-white/10 bg-[#0A0C0F]/85 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="font-display text-base font-bold text-white">ProofStack</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[#9AA3AE] text-[10px]">v2.4</span>
            <span className="text-[#9AA3AE]/40">/</span>
            <div className="flex items-center gap-1.5 text-[#9AA3AE]">
              <span className="text-white font-semibold">rohan/shop-api</span>
              <span>·</span>
              <span>Northwind Labs</span>
            </div>
          </div>

          {/* Right Status Indicators, Counter & Trigger */}
          <div className="flex items-center space-x-4">
            {/* Live Health Chips */}
            <div className="hidden lg:flex items-center space-x-2">
              <HealthChip label="GitHub" isHealthy={metrics.health.github} />
              <HealthChip label="Webhook" isHealthy={metrics.health.webhook} />
              <HealthChip label="Model" isHealthy={metrics.health.model} />
              <HealthChip label="Rate limit" isHealthy={metrics.health.rateLimit} />
            </div>

            {/* Projector Demo Mode Toggle (?demo=1) */}
            <button
              onClick={() => {
                const isDemo = document.documentElement.classList.toggle('demo-mode');
                if (isDemo) {
                  document.documentElement.setAttribute('data-demo', 'true');
                  sessionStorage.setItem('ps_demo_mode', 'true');
                } else {
                  document.documentElement.removeAttribute('data-demo');
                  sessionStorage.removeItem('ps_demo_mode');
                }
                // Force state update by dispatching custom event
                window.dispatchEvent(new Event('demo-mode-changed'));
              }}
              title="Toggle Projector Presentation Mode (?demo=1)"
              aria-label="Toggle Projector Demo Mode"
              className="px-2.5 py-1 text-[11px] font-mono rounded border border-white/10 hover:border-emerald-500/40 bg-white/[0.03] text-[#9AA3AE] hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Projector</span>
            </button>

            {/* Grayscale Accessibility Inspection Toggle */}
            <button
              onClick={() => {
                document.documentElement.classList.toggle('grayscale-active');
              }}
              title="Toggle Grayscale Mode to verify colorblindness & non-color cues"
              aria-label="Toggle Grayscale Mode"
              className="px-2 py-1 text-[11px] font-mono rounded border border-white/10 hover:border-white/30 bg-white/[0.03] text-[#9AA3AE] hover:text-white transition-colors"
            >
              B&W
            </button>

            {/* API Keys & Engine Configuration Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Configure API Keys (Gemini, OpenAI, Claude, GitHub)"
              aria-label="Configure API Keys and Engine"
              data-testid="api-keys-header-button"
              className="px-2.5 py-1 text-[11px] font-mono rounded border border-white/10 hover:border-emerald-500/40 bg-white/[0.03] text-[#9AA3AE] hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>API Keys</span>
            </button>

            {/* Hollow Signals Refused Counter */}
            <CounterChip
              label="Hollow signals refused"
              count={metrics.hollowSignalsRefused}
              variant="attack"
            />

            {/* Quick Demo Script Button: Simulate Push */}
            {onSimulatePush && (
              <Button
                variant="solid_paper"
                size="sm"
                onClick={onSimulatePush}
                isLoading={isLoading}
                icon={<Zap className="w-3.5 h-3.5 text-[#14171A]" />}
                aria-label="Simulate Inbound Push Event"
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
                Reset State
              </Button>
            )}
          </div>
        </header>

        {/* BODY CONTAINER */}
        <main id="main-content" className="flex-1 p-6 lg:p-8 flex flex-col">{children}</main>
      </div>

      {/* API Keys & Engine Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
