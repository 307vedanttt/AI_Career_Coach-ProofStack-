import { StampStatus } from '../components/stamps/Stamp';

export interface Requirement {
  id: string;
  name: string;
  category: string;
  status: StampStatus;
  required: boolean;
  filesCount: number;
  evidenceCount: number;
  evidenceId: string;
  candidateId?: string;
  description: string;
}

export interface Assessment {
  id: string;
  requirementId: string;
  requirementName: string;
  status: StampStatus;
  confidence: number;
  summary: string;
  lastCommitHash: string;
  timestamp: string;
}

export interface Evidence {
  id: string;
  requirementId: string;
  title: string;
  sublabel: string;
  serial: string;
  timestamp: string;
  status: StampStatus;
  fileName: string;
  code: string;
  highlightLines: number[];
  highlightType: 'emerald' | 'red';
  chips: string[];
  auditTrail: {
    commitHash: string;
    committer: string;
    verifiedAssertions: number;
    merkleRoot: string;
  };
}

export interface RejectedCandidate {
  id: string;
  requirementId: string;
  title: string;
  serial: string;
  timestamp: string;
  reason: string;
  fileName: string;
  code: string;
  highlightLines: number[];
  status: 'hollow' | 'refused';
  missingInvariant: string;
}

export interface ContractChecklistItem {
  id: string;
  ruleId?: string;
  label: string;
  description?: string;
  file?: string;
  line?: number;
  satisfied: boolean;
  statusLabel?: string;
  reason?: string;
}

export interface Contract {
  id: string;
  repoId?: string;
  jobId?: string;
  requirementId?: string;
  title: string;
  description: string;
  requirementTarget: string;
  currentState?: string;
  predictedTargetState?: string;
  pointsDelta: number;
  diffEstimate: 'SMALL' | 'MEDIUM' | 'LARGE';
  timeEstimate: string;
  effortClass?: 'small' | 'medium' | 'large';
  checklist: ContractChecklistItem[];
  acceptanceChecks?: string[];
  mustNotMove?: string[];
  frozenScope: string;
  gitCommand: string;
  status: 'fulfilled' | 'partly' | 'not_fulfilled' | 'pending';
  targetStatus: StampStatus;
  ciStatus?: 'passed' | 'failed' | 'not_run' | 'pending';
  adjudication?: {
    verdict: string;
    summary: string;
    checks: ContractChecklistItem[];
    must_not_move_violations?: string[];
    ci_status?: string;
  };
  suggestedFilePath?: string;
  recommendationSkeleton?: string;
  gainArithmetic?: string;
  reason?: string;
}

export interface TreemapFileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  status: StampStatus;
  meta?: string;
  isPulsing?: boolean;
}

export interface Snapshot {
  id: string;
  job_id: string;
  commitHash: string;
  commitMessage: string;
  timestamp: string;
  author: string;
  assessedCount: number;
  totalCount: number;
  percentage: number;
  files: TreemapFileItem[];
}

export type EventType =
  | 'push'
  | 'analysis_start'
  | 'analysis_complete'
  | 'rate_limit'
  | 'error'
  | 'stamp_flip';

export interface ProofStackEvent {
  id: string;
  type: EventType;
  timestamp: string;
  message: string;
  commitHash?: string;
  affectedRequirementId?: string;
  affectedFileId?: string;
  newPercentage?: number;
  newStatus?: StampStatus;
  data?: any;
}

export interface SystemMetrics {
  hollowSignalsRefused: number;
  filesAnalyzed: number;
  llmCalls: number;
  pushToVerdictSeconds: number;
  health: {
    github: boolean;
    webhook: boolean;
    model: boolean;
    rateLimit: boolean;
  };
}

export interface CoachRecord {
  fulfilled: number;
  partly: number;
  missed: number;
}

export interface AttackVector {
  id: string;
  name: string;
  category: string;
  targetFile: string;
  payloadPreview: string;
  injectionType: string;
  status: 'refused' | 'attack';
  guardReason: string;
  timestamp: string;
  signatureHash: string;
  lines: number[];
}

export interface AdversarialSuiteData {
  attacksSent: number;
  upgradesGranted: number;
  guardReasonsLogged: number;
  vectors: AttackVector[];
  protocol: string;
  spec: string;
}

export interface ResumeAttestationData {
  candidate: {
    name: string;
    title: string;
    email: string;
    github: string;
    location: string;
    clearance: string;
    summary: string;
  };
  auditIdentifier: string;
  merkleRoot: string;
  commitHash: string;
  skills: {
    category: string;
    items: {
      name: string;
      status: 'proven' | 'basic' | 'not_shown';
      footnoteRef: number;
    }[];
  }[];
  experience: {
    role: string;
    company: string;
    period: string;
    bullets: {
      text: string;
      commitSha: string;
      isAttested: boolean;
    }[];
  }[];
}

export interface LedgerBlock {
  blockHeight: number;
  commitHash: string;
  previousHash: string;
  timestamp: string;
  invariantsProven: number;
  author: string;
  merkleRoot: string;
}

export interface RepoScanResult {
  targetUser: string;
  targetRepo: string;
  auditReceiptId: string;
  timestamp: string;
  coveragePct: number;
  assessedCount: number;
  totalCount: number;
  organization: string;
  breakdown: {
    proven: number;
    basic: number;
    notShown: number;
    unclear: number;
  };
  verifiedFiles: string[];
  isAttested: boolean;
}

export interface UserSession {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  publicRepos: number;
  scopes: string[];
  sessionStartedAt: string;
}

export interface ConnectedRepository {
  id: string;
  repo_url: string;
  owner: string;
  name: string;
  default_branch: string;
  last_commit_sha?: string;
  last_synced_at?: string;
  last_sync_trigger?: 'webhook' | 'poll' | 'check-now';
  created_at: string;
}

