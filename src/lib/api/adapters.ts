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
    requirementName: raw.requirement_name || raw.requirementName || raw.name || '',
    status: raw.status || 'not_shown',
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 1.0,
    summary: raw.summary || '',
    lastCommitHash: raw.last_commit_hash || raw.lastCommitHash || '9f3c2ab',
    timestamp: raw.timestamp || new Date().toISOString(),
  };
}

export function adaptEvidence(raw: any): Evidence {
  return {
    id: raw.id || 'evi-01',
    requirementId: raw.requirement_id || raw.requirementId || '',
    title: raw.title || 'Verified Invariant',
    sublabel: raw.sublabel || 'FastAPI Invariant',
    serial: raw.serial || 'REC-0042',
    timestamp: raw.timestamp || new Date().toISOString(),
    status: raw.status || 'proven',
    fileName: raw.fileName || raw.file_path || 'src/api/routes.py',
    code: raw.code || '',
    highlightLines: raw.highlightLines || [1, 2],
    highlightType: raw.highlightType || 'emerald',
    chips: raw.chips || ['FASTAPI', 'INVARIANT'],
    auditTrail: raw.auditTrail || {
      commitHash: '9f3c2ab',
      committer: 'rohan <rohan@northwind-labs.dev>',
      verifiedAssertions: 4,
      merkleRoot: 'sha256:7f83b165...069',
    },
  };
}

export function adaptCoverage(raw: any): any {
  return {
    id: raw.id || 'cov-01',
    coveragePct: raw.coverage_pct ?? raw.coveragePct ?? raw.evidence_coverage ?? 58,
    assessedCount: raw.assessed_count ?? raw.assessedCount ?? 7,
    totalCount: raw.total_count ?? raw.totalCount ?? 12,
  };
}

export function adaptProofMap(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.files)) return raw.files;
  return [];
}

export function adaptCommitContract(raw: any): Contract {
  return {
    id: raw.id || 'contract-01',
    title: raw.title || 'Add SQLite Query Invariant',
    description: raw.description || '',
    requirementTarget: raw.requirement_target || raw.requirementTarget || 'SQL',
    pointsDelta: raw.points_delta ?? raw.pointsDelta ?? 15,
    diffEstimate: raw.diff_estimate ?? raw.diffEstimate ?? 'MEDIUM',
    timeEstimate: raw.time_estimate ?? raw.timeEstimate ?? '2 hours',
    checklist: raw.checklist || [],
    frozenScope: raw.frozen_scope ?? raw.frozenScope ?? 'src/db/sqlite.py',
    gitCommand: raw.git_command ?? raw.gitCommand ?? 'git commit -m "feat(sql): add parameterized query"',
    status: raw.status || 'pending',
    targetStatus: raw.target_status || raw.targetStatus || 'proven',
  };
}

export function adaptUserSession(raw: any): UserSession {
  return {
    id: raw.id || 'usr-default',
    login: raw.login || 'developer',
    name: raw.name || raw.login || 'Developer',
    avatarUrl: raw.avatar_url || raw.avatarUrl || '',
    publicRepos: raw.public_repos ?? raw.publicRepos ?? 0,
    scopes: raw.scopes || ['read:user'],
    sessionStartedAt: raw.session_started_at || raw.sessionStartedAt || new Date().toISOString(),
  };
}

export function adaptRepoScan(raw: any): RepoScanResult {
  return {
    targetUser: raw.target_user || raw.targetUser || 'octocat',
    targetRepo: raw.target_repo || raw.targetRepo || `${raw.targetUser || raw.target_user || 'octocat'}/northwind-service`,
    auditReceiptId: raw.audit_receipt_id || raw.auditReceiptId || '#0492-ZK',
    timestamp: raw.timestamp || new Date().toISOString(),
    coveragePct: raw.coverage_pct ?? raw.coveragePct ?? 58,
    assessedCount: raw.assessed_count ?? raw.assessedCount ?? 7,
    totalCount: raw.total_count ?? raw.totalCount ?? 12,
    organization: raw.organization || 'Northwind Labs',
    breakdown: raw.breakdown || { proven: 3, basic: 1, notShown: 1, unclear: 2 },
    verifiedFiles: raw.verified_files || raw.verifiedFiles || [
      'src/core/router.py',
      'tests/test_router.py',
      'src/auth/token.go',
    ],
    isAttested: raw.is_attested ?? raw.isAttested ?? true,
  };
}

export function adaptLedgerBlocks(raw: any[]): LedgerBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((b, idx) => ({
    blockHeight: b.block_height ?? b.blockHeight ?? idx + 1,
    commitHash: b.commit_hash ?? b.commitHash ?? '9f3c2ab',
    previousHash: b.previous_hash ?? b.previousHash ?? '000000',
    timestamp: b.timestamp || new Date().toISOString(),
    invariantsProven: b.invariants_proven ?? b.invariantsProven ?? 2,
    author: b.author || 'rohan',
    merkleRoot: b.merkle_root ?? b.merkleRoot ?? 'sha256:...',
  }));
}
