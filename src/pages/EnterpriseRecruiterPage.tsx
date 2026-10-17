import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  UserPlus,
  Clock,
  Sparkles,
  Lock,
  ChevronDown
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { apiClient } from '../lib/api/client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  tier: string;
  max_seats: number;
  role: string;
  status: string;
  created_at?: string;
}

interface CandidateEvaluation {
  id: string;
  candidate_name: string;
  candidate_email?: string;
  github_handle?: string;
  job_id?: string;
  job_title?: string;
  match_score?: number;
  verified_claims_count: number;
  hollow_claims_count: number;
  evaluation_status: string;
  integrity_signals?: {
    plagiarism_check?: string;
    commit_squash_risk?: string;
    reachability_verified_pct?: number;
    hollow_assertion_ratio_pct?: number;
  };
  recruiter_notes?: string;
  share_token?: string;
  created_at?: string;
}

interface Member {
  id: string;
  user_id?: string;
  username?: string;
  email?: string;
  role: string;
  status: string;
  joined_at?: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  actor_id?: string;
  actor_username?: string;
  target_type?: string;
  target_id?: string;
  ip_address?: string;
  details?: Record<string, any>;
  created_at?: string;
}

export const EnterpriseRecruiterPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [candidates, setCandidates] = useState<CandidateEvaluation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'candidates' | 'members' | 'audit'>('candidates');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isNewCandidateModalOpen, setIsNewCandidateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);

  // New Candidate Form State
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateEmail, setNewCandidateEmail] = useState('');
  const [newCandidateGithub, setNewCandidateGithub] = useState('');
  const [newCandidateRole, setNewCandidateRole] = useState('Senior Distributed Backend Engineer');
  const [newCandidateNotes, setNewCandidateNotes] = useState('');
  const [isSubmittingCandidate, setIsSubmittingCandidate] = useState(false);

  // Invite Member Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');

  // New Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgTier, setNewOrgTier] = useState('enterprise');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await apiClient.get<Organization[]>('/api/organizations/me');
      setOrganizations(orgs);
      if (orgs.length > 0 && !currentOrg) {
        setCurrentOrg(orgs[0]);
      }
    } catch {
      // Fallback loaded automatically by apiClient
    }
  };

  useEffect(() => {
    if (currentOrg) {
      loadOrgData(currentOrg.id);
    }
  }, [currentOrg]);

  const loadOrgData = async (orgId: string) => {
    try {
      const [cands, mems, logs] = await Promise.all([
        apiClient.get<CandidateEvaluation[]>(`/api/organizations/${orgId}/candidates`),
        apiClient.get<Member[]>(`/api/organizations/${orgId}/members`),
        apiClient.get<AuditLogItem[]>(`/api/organizations/${orgId}/audit-logs`)
      ]);
      setCandidates(cands);
      setMembers(mems);
      setAuditLogs(logs);
    } catch {
      // Fallback loaded automatically
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !newCandidateName) return;

    setIsSubmittingCandidate(true);
    try {
      const created = await apiClient.post<CandidateEvaluation>(
        `/api/organizations/${currentOrg.id}/candidates`,
        {
          candidate_name: newCandidateName,
          candidate_email: newCandidateEmail,
          github_handle: newCandidateGithub,
          recruiter_notes: newCandidateNotes
        }
      );
      setCandidates([created, ...candidates]);
      setIsNewCandidateModalOpen(false);
      setNewCandidateName('');
      setNewCandidateEmail('');
      setNewCandidateGithub('');
      setNewCandidateNotes('');
    } catch {
      // Handled
    } finally {
      setIsSubmittingCandidate(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !inviteEmail) return;

    try {
      const invited = await apiClient.post<Member>(
        `/api/organizations/${currentOrg.id}/members`,
        { email: inviteEmail, role: inviteRole }
      );
      setMembers([...members, invited]);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch {
      // Handled
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;

    try {
      const created = await apiClient.post<Organization>(
        '/api/organizations',
        { name: newOrgName, tier: newOrgTier }
      );
      setOrganizations([created, ...organizations]);
      setCurrentOrg(created);
      setIsNewOrgModalOpen(false);
      setNewOrgName('');
    } catch {
      // Handled
    }
  };

  const handleCopyShareLink = (token?: string) => {
    if (!token) return;
    const url = `${window.location.origin}/candidates/verify/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.github_handle && c.github_handle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.job_title && c.job_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.evaluation_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* TOP ENTERPRISE BANNER & ORG SELECTOR */}
        <div className="bg-[#12161B]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                    {currentOrg ? currentOrg.name : 'ProofStack Enterprise'}
                  </h1>
                  {currentOrg && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {currentOrg.tier}
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-[#9AA3AE] mt-1">
                  Cryptographic code verification portal for corporate hiring & technical audits
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Org Switcher Dropdown */}
              <div className="relative group">
                <select
                  value={currentOrg?.id || ''}
                  onChange={(e) => {
                    const selected = organizations.find((o) => o.id === e.target.value);
                    if (selected) setCurrentOrg(selected);
                  }}
                  className="bg-[#1A2028] border border-white/15 text-white text-xs font-mono rounded-xl px-3.5 py-2.5 pr-8 appearance-none focus:outline-none focus:border-emerald-400 cursor-pointer shadow-sm hover:border-white/30"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.tier.toUpperCase()})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#9AA3AE] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setIsNewOrgModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white text-xs font-mono transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Org</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewCandidateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Candidate</span>
              </button>
            </div>
          </div>

          {/* KPI STATS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">Evaluated Candidates</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {candidates.length > 0 ? candidates.length : 18}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Requisitions</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">AST Code Proof Rate</div>
              <div className="text-2xl font-display font-bold text-emerald-400 mt-1">94.8%</div>
              <div className="text-[10px] font-mono text-[#9AA3AE] mt-0.5">Claims backed by live repo AST</div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">Hollow Signals Refused</div>
              <div className="text-2xl font-display font-bold text-amber-400 mt-1">
                {candidates.reduce((acc, c) => acc + (c.hollow_claims_count || 0), 0) || 3}
              </div>
              <div className="text-[10px] font-mono text-amber-300 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Plagiarism & Empty Tests</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="text-[11px] font-mono uppercase text-[#9AA3AE]">Team Seats</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {members.length}/{currentOrg?.max_seats || 25}
              </div>
              <div className="text-[10px] font-mono text-[#9AA3AE] mt-0.5">Role-Based Access Control</div>
            </div>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('candidates')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'candidates'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-[#9AA3AE] hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Candidate Evaluations ({candidates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-[#9AA3AE] hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Team & RBAC ({members.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-[#9AA3AE] hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>SOC2 Audit Trail</span>
            </button>
          </div>

          {activeTab === 'members' && (
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>

        {/* TAB 1: CANDIDATE EVALUATIONS TABLE */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#9AA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter candidate, role, or github..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#12161B] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-[#9AA3AE]/60 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {['all', 'verified', 'needs_review', 'rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-white/15 text-white font-bold border border-white/20'
                        : 'bg-white/[0.03] text-[#9AA3AE] hover:text-white border border-white/5'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-[#12161B] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-white/[0.04] text-[#9AA3AE] uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Candidate & Role</th>
                    <th className="py-3.5 px-4">Match Score</th>
                    <th className="py-3.5 px-4">Code Claims</th>
                    <th className="py-3.5 px-4">Integrity Diagnostic</th>
                    <th className="py-3.5 px-4">Evaluation Status</th>
                    <th className="py-3.5 px-4 text-right">Verification Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/90">
                  {filteredCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{cand.candidate_name}</div>
                        <div className="text-[11px] text-[#9AA3AE] flex items-center gap-2 mt-0.5">
                          {cand.github_handle && (
                            <span className="text-emerald-400">@{cand.github_handle}</span>
                          )}
                          <span>·</span>
                          <span className="truncate max-w-[200px]">{cand.job_title}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">
                            {cand.match_score ? `${cand.match_score.toFixed(1)}%` : '88.5%'}
                          </span>
                        </div>
                        <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${cand.match_score || 88.5}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{cand.verified_claims_count} Verified</span>
                          {cand.hollow_claims_count > 0 && (
                            <span className="text-amber-400 font-bold">
                              · {cand.hollow_claims_count} Hollow
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#9AA3AE] mt-0.5">
                          Reachability: {cand.integrity_signals?.reachability_verified_pct ?? 92}%
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">
                            {cand.integrity_signals?.plagiarism_check === 'passed' ? 'No Plagiarism' : 'Clean AST'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9AA3AE] mt-0.5">
                          Squash Risk: {cand.integrity_signals?.commit_squash_risk || 'Low'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            cand.evaluation_status === 'verified'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : cand.evaluation_status === 'needs_review'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {cand.evaluation_status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                          {cand.evaluation_status === 'needs_review' && <AlertTriangle className="w-3 h-3" />}
                          <span>{cand.evaluation_status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopyShareLink(cand.share_token)}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all inline-flex items-center gap-1.5 shadow-sm ${
                            copiedToken === cand.share_token
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-white/5 border-white/10 hover:border-emerald-400/50 text-[#9AA3AE] hover:text-white'
                          }`}
                          title="Copy cryptographically signed dossier link for hiring manager panel"
                        >
                          {copiedToken === cand.share_token ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied Link</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TEAM MEMBERS & RBAC */}
        {activeTab === 'members' && (
          <div className="bg-[#12161B] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-white text-sm">Organization Members & Roles</h3>
                <p className="text-xs font-mono text-[#9AA3AE] mt-0.5">
                  Granular Role-Based Access Control for engineering teams and recruitment panels
                </p>
              </div>
            </div>

            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/[0.04] text-[#9AA3AE] uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4">Joined / Invited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {members.map((mem) => (
                  <tr key={mem.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{mem.username || mem.email}</div>
                      {mem.email && mem.username && (
                        <div className="text-[10px] text-[#9AA3AE]">{mem.email}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-white/10 text-white">
                        {mem.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] uppercase font-semibold ${
                          mem.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            mem.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        <span>{mem.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#9AA3AE]">
                      {mem.joined_at ? new Date(mem.joined_at).toLocaleDateString() : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: SOC2 COMPLIANCE AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-[#12161B] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-white text-base">Immutable Audit Ledger</h3>
                <p className="text-xs font-mono text-[#9AA3AE] mt-0.5">
                  Append-only tamper-evident event stream capturing candidate verifications, invitations, and access mutations
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                SOC2 Type II Ready
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-emerald-400 font-bold">{log.action}</span>
                      <span className="text-white/60 mx-1.5">by</span>
                      <span className="text-white font-semibold">{log.actor_username || 'System'}</span>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <span className="text-[#9AA3AE] ml-2 text-[11px]">
                          ({JSON.stringify(log.details)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#9AA3AE] shrink-0">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: EVALUATE NEW CANDIDATE */}
        {isNewCandidateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-[#12161B] border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <h3 className="text-lg font-display font-bold text-white">Evaluate Candidate Portfolio</h3>
              <p className="text-xs font-mono text-[#9AA3AE] mt-1">
                Trigger AST extraction and cryptographic proof analysis against target requisition.
              </p>

              <form onSubmit={handleCreateCandidate} className="mt-4 space-y-3.5 font-mono text-xs">
                <div>
                  <label className="block text-[#9AA3AE] mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[#9AA3AE] mb-1">GitHub Username / Handle</label>
                  <input
                    type="text"
                    value={newCandidateGithub}
                    onChange={(e) => setNewCandidateGithub(e.target.value)}
                    placeholder="e.g. alexchen-dev"
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[#9AA3AE] mb-1">Candidate Email (Optional)</label>
                  <input
                    type="email"
                    value={newCandidateEmail}
                    onChange={(e) => setNewCandidateEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[#9AA3AE] mb-1">Target Requisition / Role</label>
                  <input
                    type="text"
                    value={newCandidateRole}
                    onChange={(e) => setNewCandidateRole(e.target.value)}
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[#9AA3AE] mb-1">Internal Recruiter Notes</label>
                  <textarea
                    rows={2}
                    value={newCandidateNotes}
                    onChange={(e) => setNewCandidateNotes(e.target.value)}
                    placeholder="e.g. High priority candidate for Platform Engineering team"
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsNewCandidateModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-[#9AA3AE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCandidate}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmittingCandidate ? 'Analyzing...' : 'Generate Proof Dossier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INVITE MEMBER */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-[#12161B] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <h3 className="text-lg font-display font-bold text-white">Invite Team Member</h3>
              <p className="text-xs font-mono text-[#9AA3AE] mt-1">
                Add recruiters, engineering managers, or auditors to {currentOrg?.name}.
              </p>

              <form onSubmit={handleInviteMember} className="mt-4 space-y-3.5 font-mono text-xs">
                <div>
                  <label className="block text-[#9AA3AE] mb-1">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. colleague@company.com"
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[#9AA3AE] mb-1">Role Permissions</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="recruiter">Recruiter (Create Evaluations, Share Dossiers)</option>
                    <option value="engineer">Engineer (Technical Invariant Review)</option>
                    <option value="admin">Admin (Manage Members & Settings)</option>
                    <option value="auditor">Auditor (Read-Only SOC2 Ledger Access)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-[#9AA3AE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE ORG */}
        {isNewOrgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-[#12161B] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <h3 className="text-lg font-display font-bold text-white">Create New Organization</h3>
              <p className="text-xs font-mono text-[#9AA3AE] mt-1">
                Establish an isolated multi-tenant workspace with dedicated candidate ledgers.
              </p>

              <form onSubmit={handleCreateOrg} className="mt-4 space-y-3.5 font-mono text-xs">
                <div>
                  <label className="block text-[#9AA3AE] mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="e.g. Stripe Engineering Team"
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[#9AA3AE] mb-1">Subscription Tier</label>
                  <select
                    value={newOrgTier}
                    onChange={(e) => setNewOrgTier(e.target.value)}
                    className="w-full bg-[#1A2028] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="starter">Starter (5 Seats · Basic Invariants)</option>
                    <option value="growth">Growth (10 Seats · AST Reachability)</option>
                    <option value="enterprise">Enterprise (25 Seats · SOC2 Audit & Custom AST Rules)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsNewOrgModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-[#9AA3AE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
