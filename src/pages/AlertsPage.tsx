import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Building2,
  Edit2,
  Check,
  Filter,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Mail,
  Smartphone,
  PauseCircle,
  PlayCircle,
  ArrowRight,
} from 'lucide-react';

interface JobCardData {
  id: string;
  company: string;
  role: string;
  location: string;
  postedTime: string;
  sourceLink: string;
  sourceName: string;
  coveragePercent: number;
  totalRequirements: number;
  provenSkills: string[];
  notShownSkills: string[];
}

export const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'feed' | 'assist'>('feed');
  const [selectedJobId, setSelectedJobId] = useState<string>('job-1');

  // Screen A: Preferences State
  const [roleType, setRoleType] = useState<'full_time' | 'internship'>('full_time');
  const [locationPref, setLocationPref] = useState('San Francisco, CA / Remote');
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [paused, setPaused] = useState(false);

  // Skills pulled from verified repos & resume
  const [skills] = useState([
    'PostgreSQL Transactions',
    'REST API APIRouter',
    'Pytest Regression Testing',
    'Docker Multi-Stage',
    'FastAPI Routing',
  ]);

  // Sources with plain toggles
  const [sources, setSources] = useState({
    careerPages: true,
    jobApis: true,
    alertEmails: false,
  });

  // Channels with toggles and test states
  const [channels, setChannels] = useState({
    whatsapp: { enabled: false, tested: false },
    email: { enabled: true, tested: false },
    inApp: { enabled: true, tested: false },
  });

  // Screen B: Job Cards Feed
  const { user } = useAuth();
  const [filterRemote, setFilterRemote] = useState<string>('all');
  const [jobs] = useState<JobCardData[]>([
    {
      id: 'job-1',
      company: 'Platform Labs',
      role: 'Staff Backend Engineer',
      location: 'Remote · San Francisco, CA',
      postedTime: '2 hours ago',
      sourceLink: 'https://careers.platformlabs.dev/staff-backend',
      sourceName: 'Company Career Page',
      coveragePercent: 64,
      totalRequirements: 6,
      provenSkills: ['REST API', 'Testing'],
      notShownSkills: ['SQL'],
    },
    {
      id: 'job-2',
      company: 'Stripe Infrastructure',
      role: 'Senior Systems Platform Engineer',
      location: 'Remote · Seattle, WA',
      postedTime: '4 hours ago',
      sourceLink: 'https://stripe.com/jobs/platform-eng',
      sourceName: 'Greenhouse API',
      coveragePercent: 83,
      totalRequirements: 6,
      provenSkills: ['REST API', 'Docker', 'Testing'],
      notShownSkills: ['Kafka Streams'],
    },
    {
      id: 'job-3',
      company: 'Supabase Cloud',
      role: 'Database Kernel Engineer',
      location: 'Remote · Worldwide',
      postedTime: '1 day ago',
      sourceLink: 'https://supabase.com/careers/db-kernel',
      sourceName: 'Lever API',
      coveragePercent: 75,
      totalRequirements: 4,
      provenSkills: ['PostgreSQL', 'Transactions'],
      notShownSkills: ['Rust FFI'],
    },
  ]);

  // Screen C: Application Form Fields (Side-by-Side Assist)
  const [formFields, setFormFields] = useState([
    {
      id: 'f-name',
      label: 'Full Legal Name',
      value: user?.name || '',
      source: 'From GitHub Profile',
      isEditing: false,
      empty: !user?.name,
    },
    {
      id: 'f-email',
      label: 'Primary Work Email',
      value: user ? `${user.login}@users.noreply.github.com` : '',
      source: 'From Verified Auth',
      isEditing: false,
      empty: !user,
    },
    {
      id: 'f-github',
      label: 'GitHub Repository Portfolio URL',
      value: user?.login ? `https://github.com/${user.login}` : '',
      source: 'From Connected Repo',
      isEditing: false,
      empty: !user?.login,
    },
    {
      id: 'f-proof',
      label: 'Cryptographic Code Proof Docket Link',
      value: user?.id ? `https://proofstack.dev/verify/${user.id.slice(0, 8)}` : '',
      source: 'Auto-Generated Merkle Attestation',
      isEditing: false,
      empty: !user?.id,
    },
    {
      id: 'f-salary',
      label: 'Desired Target Compensation ($USD/yr)',
      value: '',
      source: 'Unfilled Required Field',
      isEditing: true,
      empty: true,
    },
    {
      id: 'f-workauth',
      label: 'Work Authorization Status',
      value: 'Authorized to work in US without sponsorship',
      source: 'From Candidate Dossier',
      isEditing: false,
      empty: false,
    },
  ]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleTestChannel = (channelKey: 'whatsapp' | 'email' | 'inApp') => {
    setChannels((prev) => ({
      ...prev,
      [channelKey]: { ...prev[channelKey], tested: true },
    }));
    setTimeout(() => {
      setChannels((prev) => ({
        ...prev,
        [channelKey]: { ...prev[channelKey], tested: false },
      }));
    }, 2500);
  };

  const handleOpenAssistForJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveTab('assist');
  };

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto px-4 py-6 font-mono">
        {/* ================================================================ */}
        {/* TOP TAB CONTROLLER (ALERTS PREFERENCES | ROLES FEED | APPLY ASSIST) */}
        {/* ================================================================ */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'feed'
                  ? 'bg-emerald-500 text-[#0A0C0F] shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>New Roles for You ({jobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'preferences'
                  ? 'bg-emerald-500 text-[#0A0C0F] shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alert Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'assist'
                  ? 'bg-emerald-500 text-[#0A0C0F] shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-white/5 text-[#9AA3AE] hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply Assist</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#9AA3AE]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compliant Matching · Zero Auto-Submit</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SCREEN A: "ALERTS" PREFERENCES                                   */}
        {/* ================================================================ */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Master Pause Banner */}
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
                      ? 'No outbound emails or notifications will be triggered until resumed.'
                      : 'Scanning company pages and APIs every 4 hours for verified matches.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaused(!paused)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  paused
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {paused ? 'Resume Alerts' : 'Pause Alerts'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Skills & Role Preferences (7 cols) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#12161B] border border-white/15 space-y-6 shadow-xl">
                <div>
                  <h3 className="font-display text-base font-bold text-white mb-1">
                    Skills pulled from Resume & Verified Repos
                  </h3>
                  <p className="text-xs text-[#9AA3AE] mb-3">
                    Roles are filtered to match requirements where your code contains proof.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="text-xs uppercase font-bold text-[#9AA3AE] block mb-2">
                      Role Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRoleType('full_time')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          roleType === 'full_time'
                            ? 'bg-emerald-500 text-[#0A0C0F]'
                            : 'bg-white/5 text-[#9AA3AE] border border-white/10'
                        }`}
                      >
                        Full-time
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoleType('internship')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          roleType === 'internship'
                            ? 'bg-emerald-500 text-[#0A0C0F]'
                            : 'bg-white/5 text-[#9AA3AE] border border-white/10'
                        }`}
                      >
                        Internship
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-[#9AA3AE] block mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={locationPref}
                      onChange={(e) => setLocationPref(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <span className="text-white text-xs font-bold block">Remote Only Toggle</span>
                    <span className="text-[11px] text-[#9AA3AE]">
                      Restrict matches strictly to 100% remote positions.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoteOnly(!remoteOnly)}
                    className="text-emerald-400 focus:outline-none"
                  >
                    {remoteOnly ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-[#575D65]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Sources & Channels (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Sources with Plain Labels & Toggles */}
                <div className="p-6 rounded-2xl bg-[#12161B] border border-white/15 shadow-xl">
                  <h3 className="font-display text-sm font-bold text-white mb-1">
                    Monitored Sources
                  </h3>
                  <p className="text-xs text-[#9AA3AE] mb-4">
                    Transparent origin streams scanned for new postings.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs text-white">Company career pages</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSources((s) => ({ ...s, careerPages: !s.careerPages }))
                        }
                        className="text-emerald-400"
                      >
                        {sources.careerPages ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-[#575D65]" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs text-white">Job APIs (Greenhouse, Lever)</span>
                      <button
                        type="button"
                        onClick={() => setSources((s) => ({ ...s, jobApis: !s.jobApis }))}
                        className="text-emerald-400"
                      >
                        {sources.jobApis ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-[#575D65]" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs text-white">My alert emails</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSources((s) => ({ ...s, alertEmails: !s.alertEmails }))
                        }
                        className="text-emerald-400"
                      >
                        {sources.alertEmails ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-[#575D65]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Communication Channels with Test Buttons */}
                <div className="p-6 rounded-2xl bg-[#12161B] border border-white/15 shadow-xl">
                  <h3 className="font-display text-sm font-bold text-white mb-1">
                    Notification Channels
                  </h3>
                  <p className="text-xs text-[#9AA3AE] mb-4">
                    Send test alerts to verify delivery before going live.
                  </p>
                  <div className="space-y-3">
                    {/* WhatsApp */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white">WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('whatsapp')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white"
                        >
                          {channels.whatsapp.tested ? 'Sent ✓' : 'Send test'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChannels((c) => ({
                              ...c,
                              whatsapp: { ...c.whatsapp, enabled: !c.whatsapp.enabled },
                            }))
                          }
                          className="text-emerald-400"
                        >
                          {channels.whatsapp.enabled ? (
                            <ToggleRight className="w-6 h-6" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-[#575D65]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-violet-400" />
                        <span className="text-xs text-white">Email Digest</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('email')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white"
                        >
                          {channels.email.tested ? 'Sent ✓' : 'Send test'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChannels((c) => ({
                              ...c,
                              email: { ...c.email, enabled: !c.email.enabled },
                            }))
                          }
                          className="text-emerald-400"
                        >
                          {channels.email.enabled ? (
                            <ToggleRight className="w-6 h-6" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-[#575D65]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* In-app */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white">In-App Banner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('inApp')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white"
                        >
                          {channels.inApp.tested ? 'Sent ✓' : 'Send test'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChannels((c) => ({
                              ...c,
                              inApp: { ...c.inApp, enabled: !c.inApp.enabled },
                            }))
                          }
                          className="text-emerald-400"
                        >
                          {channels.inApp.enabled ? (
                            <ToggleRight className="w-6 h-6" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-[#575D65]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SCREEN B: "NEW ROLES FOR YOU" (JOB CARDS FEED)                   */}
        {/* ================================================================ */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Top Filter Bar */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white">Filter Roles:</span>
                <select
                  value={filterRemote}
                  onChange={(e) => setFilterRemote(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none"
                >
                  <option value="all">All Locations</option>
                  <option value="remote">Remote Only</option>
                  <option value="high_coverage">Coverage &gt; 70%</option>
                </select>
              </div>

              <span className="text-[11px] text-[#9AA3AE]">
                Showing {jobs.length} roles matching code evidence
              </span>
            </div>

            {/* Empty State Variant (Demonstrated when no jobs match) */}
            {jobs.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#12161B] border border-white/15 text-center flex flex-col items-center">
                <Clock className="w-8 h-8 text-emerald-400 mb-3 animate-pulse" />
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  No new roles yet.
                </h3>
                <p className="text-xs text-[#9AA3AE]">
                  We check every few hours against company career pages and verified APIs.
                </p>
              </div>
            ) : (
              /* Feed of Job Cards */
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl bg-[#12161B] hover:bg-[#151A21] border border-white/15 transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    {/* Left: Role Info & Source Link */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/80">
                          {job.sourceName}
                        </span>
                        <span className="text-[10px] text-[#575D65]">·</span>
                        <span className="text-[10px] text-[#9AA3AE]">{job.postedTime}</span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-white tracking-tight">
                          {job.role}
                        </h3>
                        <p className="text-xs text-[#9AA3AE] flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-white font-medium">{job.company}</span>
                          <span>·</span>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{job.location}</span>
                        </p>
                      </div>

                      {/* Chips: You show vs Not shown in scope */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-[10px] text-[#9AA3AE]">EVIDENCE:</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                          You show: {job.provenSkills.join(', ')}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/20 text-[#9AA3AE] text-[11px]">
                          Not shown in scope: {job.notShownSkills.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Center: Small Evidence Coverage Ring (About posting, never about person) */}
                    <div className="flex items-center gap-3 bg-white/[0.02] p-3.5 rounded-xl border border-white/10 shrink-0">
                      {/* SVG Mini Ring */}
                      <div className="relative w-12 h-12 flex items-center justify-center">
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
                        <span className="absolute text-[11px] font-bold text-white">
                          {job.coveragePercent}%
                        </span>
                      </div>
                      <div className="text-[10px] leading-tight text-[#9AA3AE] max-w-[140px]">
                        <span className="font-bold text-white block">Posting Evidence</span>
                        <span>{job.coveragePercent}% of {job.totalRequirements} assessed requirements</span>
                      </div>
                    </div>

                    {/* Right: Actions: Open Posting & Apply Assist */}
                    <div className="flex sm:flex-col items-center gap-2 w-full md:w-auto shrink-0">
                      <a
                        href={job.sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:w-36 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
                      >
                        <span>Open posting</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#9AA3AE]" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenAssistForJob(job.id)}
                        className="flex-1 md:w-36 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#0A0C0F] font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply assist</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* SCREEN C: "APPLY ASSIST" (SIDE-BY-SIDE HUMAN-IN-THE-LOOP ASSIST) */}
        {/* ================================================================ */}
        {activeTab === 'assist' && (
          <div className="space-y-6">
            {/* Header Docket Strip for Selected Job */}
            <div className="p-4 rounded-2xl bg-[#12161B] border border-white/15 flex flex-wrap items-center justify-between gap-3">
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
              </div>
            </div>

            {/* Side-by-Side Assistant Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Application Questions Form (7 cols) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#12161B] border border-white/15 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-display text-sm font-bold text-white">
                    Company Application Questions
                  </h3>
                  <span className="text-[10px] text-[#9AA3AE]">
                    Prefilled from Verified Profile
                  </span>
                </div>

                <div className="space-y-4">
                  {formFields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        field.empty
                          ? 'bg-amber-500/5 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-white/[0.025] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-white">
                          {field.label}
                        </label>
                        <div className="flex items-center gap-2">
                          {field.empty ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>You need to fill this</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                              {field.source}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setFormFields((fs) =>
                                fs.map((f) =>
                                  f.id === field.id ? { ...f, isEditing: !f.isEditing } : f
                                )
                              )
                            }
                            className="p-1 rounded text-[#9AA3AE] hover:text-white hover:bg-white/10"
                            aria-label={`Edit ${field.label}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {field.isEditing ? (
                        <input
                          type="text"
                          value={field.value}
                          placeholder={field.empty ? 'Please enter this required response...' : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormFields((fs) =>
                              fs.map((f) =>
                                f.id === field.id
                                  ? { ...f, value: val, empty: !val.trim() }
                                  : f
                              )
                            );
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-emerald-400 text-white text-xs focus:outline-none"
                        />
                      ) : (
                        <div className="text-xs text-[#CBD5E1] font-mono pt-0.5">
                          {field.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Checklist & Submission Disclosure (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-[#12161B] border border-white/15 shadow-2xl space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-display text-sm font-bold text-white">
                      Review Everything
                    </h3>
                  </div>

                  {/* Checklist */}
                  <ul className="space-y-3 text-xs text-[#9AA3AE]">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Contact and identity records matched</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cryptographic code proofs attached</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Repository commit history signed</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full border border-amber-400 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0">
                        !
                      </span>
                      <span className="text-white font-medium">1 manual required field to check</span>
                    </li>
                  </ul>

                  {/* Primary Action Button */}
                  <a
                    href={selectedJob.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#0A0C0F] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all min-h-[44px]"
                  >
                    <span>Open the form and fill it</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {/* Mandatory Anti-Bot Compliance Disclosure */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center font-mono text-[11px] text-[#9AA3AE] leading-relaxed">
                    <span className="text-white font-bold block mb-0.5">
                      Zero Auto-Submit Guarantee
                    </span>
                    <span>
                      You press Submit yourself on the company&apos;s site. No automated bot submissions.
                    </span>
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

export default AlertsPage;
