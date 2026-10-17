import {
  Assessment,
  Evidence,
  Contract,
  UserSession,
  RepoScanResult,
  LedgerBlock,
} from '../../types/api';

export function adaptAssessmentItem(raw: any): Assessment {
  return {
    id: raw.id || `req-${Math.random().toString(36).substring(2, 7)}`,
    requirementId: raw.requirement_id || raw.requirementId || raw.id || '',
    requirementName: raw.requirement_name || raw.requirementName || raw.label || raw.name || '',
    status: raw.status || 'not_shown',
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 1.0,
    summary: raw.summary || raw.reason || '',
    lastCommitHash: raw.last_commit_hash || raw.lastCommitHash || raw.commit_sha || '',
    timestamp: raw.timestamp || raw.analyzed_at || new Date().toISOString(),
  };
}

export function adaptEvidence(raw: any): Evidence {
  return {
    id: raw.id || '',
    requirementId: raw.requirement_id || raw.requirementId || '',
    title: raw.title || 'Verified Invariant',
    sublabel: raw.sublabel || (raw.detector_name ? `${raw.detector_name} Invariant` : 'Codebase Invariant'),
    serial: raw.serial || (raw.id ? `REC-${String(raw.id).slice(0, 8)}` : 'REC-LIVE'),
    timestamp: raw.timestamp || raw.created_at || new Date().toISOString(),
    status: raw.status || 'proven',
    fileName: raw.fileName || raw.file_path || '',
    code: raw.code || raw.code_snippet || '',
    highlightLines: raw.highlightLines || (raw.start_line && raw.end_line ? [raw.start_line, raw.end_line] : [1, 1]),
    highlightType: raw.highlightType || 'emerald',
    chips: raw.chips || (raw.signal_type ? [String(raw.signal_type).toUpperCase(), 'INVARIANT'] : ['INVARIANT']),
    auditTrail: raw.auditTrail || {
      commitHash: raw.commit_sha || raw.commitHash || '',
      committer: raw.committer || raw.author || '',
      verifiedAssertions: raw.verifiedAssertions ?? (raw.llm_verified ? 1 : 0),
      merkleRoot: raw.merkleRoot || raw.merkle_root || '',
    },
  };
}

export function adaptCoverage(raw: any): any {
  return {
    id: raw.id || 'cov-live',
    coveragePct: raw.coverage_pct ?? raw.coveragePct ?? raw.evidence_coverage ?? (raw.coverage ? raw.coverage.evidence_coverage : 0) ?? 0,
    assessedCount: raw.assessed_count ?? raw.assessedCount ?? (raw.coverage ? raw.coverage.assessed_count : 0) ?? 0,
    totalCount: raw.total_count ?? raw.totalCount ?? (raw.coverage ? raw.coverage.required_count : 0) ?? 0,
  };
}

export function adaptProofMap(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.files)) return raw.files;
  return [];
}

export function adaptCommitContract(raw: any): Contract {
  return {
    id: raw.id || '',
    title: raw.title || 'Commit Contract',
    description: raw.description || '',
    requirementTarget: raw.requirement_target || raw.requirementTarget || '',
    pointsDelta: raw.points_delta ?? raw.pointsDelta ?? 0,
    diffEstimate: raw.diff_estimate ?? raw.diffEstimate ?? 'SMALL',
    timeEstimate: raw.time_estimate ?? raw.timeEstimate ?? '1 hour',
    checklist: raw.checklist || [],
    frozenScope: raw.frozen_scope ?? raw.frozenScope ?? '',
    gitCommand: raw.git_command ?? raw.gitCommand ?? '',
    status: raw.status || 'pending',
    targetStatus: raw.target_status || raw.targetStatus || 'proven',
  };
}

export function adaptUserSession(raw: any): UserSession {
  return {
    id: raw.id || '',
    login: raw.login || raw.username || 'user',
    name: raw.name || raw.username || raw.login || 'User',
    avatarUrl: raw.avatar_url || raw.avatarUrl || '',
    publicRepos: raw.public_repos ?? raw.publicRepos ?? 0,
    scopes: raw.scopes || ['read:user'],
    sessionStartedAt: raw.session_started_at || raw.sessionStartedAt || new Date().toISOString(),
  };
}

export function adaptRepoScan(raw: any): RepoScanResult {
  return {
    targetUser: raw.target_user || raw.targetUser || '',
    targetRepo: raw.target_repo || raw.targetRepo || '',
    auditReceiptId: raw.audit_receipt_id || raw.auditReceiptId || '',
    timestamp: raw.timestamp || new Date().toISOString(),
    coveragePct: raw.coverage_pct ?? raw.coveragePct ?? 0,
    assessedCount: raw.assessed_count ?? raw.assessedCount ?? 0,
    totalCount: raw.total_count ?? raw.totalCount ?? 0,
    organization: raw.organization || '',
    breakdown: raw.breakdown || { proven: 0, basic: 0, notShown: 0, unclear: 0 },
    verifiedFiles: raw.verified_files || raw.verifiedFiles || [],
    isAttested: raw.is_attested ?? raw.isAttested ?? false,
  };
}

export function adaptLedgerBlocks(raw: any[]): LedgerBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((b, idx) => ({
    blockHeight: b.block_height ?? b.blockHeight ?? idx + 1,
    commitHash: b.commit_hash ?? b.commitHash ?? '',
    previousHash: b.previous_hash ?? b.previousHash ?? '',
    timestamp: b.timestamp || new Date().toISOString(),
    invariantsProven: b.invariants_proven ?? b.invariantsProven ?? 0,
    author: b.author || '',
    merkleRoot: b.merkle_root ?? b.merkleRoot ?? '',
  }));
}
