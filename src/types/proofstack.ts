export type StandardSkillState =
  | 'Demonstrated — Strong'
  | 'Demonstrated — Basic'
  | 'Not demonstrated in this scope'
  | 'Unclear';

export type ImplementationHonestyLabel =
  | 'Live Check'
  | 'Derived Signal'
  | 'Simulated Demo';

export interface RepositoryIdentity {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  primaryLanguage: string;
  createdAt: string;
  lastActivityAt: string;
  forkStatus: {
    isFork: boolean;
    upstreamRepo?: string;
    upstreamUrl?: string;
  };
  inspectedCommitsCount: number;
  contributorsCount: number;
  headSha: string;
  license: string;
  starsCount: number;
  connectionState: 'demo_active' | 'live_connected' | 'unconnected';
  lastAssessmentTimestamp: string;
}

export interface ContributorMetric {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: 'candidate' | 'maintainer' | 'bot' | 'contributor';
  commitsCount: number;
  percentageOfCommits: number;
  filesChangedCount: number;
  linesAdded: number;
  linesDeleted: number;
}

export interface CommitAuditItem {
  hash: string;
  shortHash: string;
  timestamp: string;
  author: {
    name: string;
    email: string;
    username: string;
    isCandidate: boolean;
  };
  committer?: {
    name: string;
    email: string;
  };
  message: string;
  changedFilesCount: number;
  filesChanged: string[];
  linesAdded: number;
  linesDeleted: number;
  relatedSkills: string[];
  signatureStatus: 'verified' | 'unverified' | 'unsigned' | 'unavailable';
  signatureDetails?: string;
  reviewAnnotation?: {
    flag: 'review_recommended' | 'normal' | 'large_initial_upload';
    label: string;
    reason: string;
    guidance: string;
  };
}

export interface ProvenanceCheckItem {
  id: string;
  name: string;
  category: 'origin' | 'history' | 'signatures' | 'contributors' | 'initial_pattern';
  resultState: 'verified' | 'attention' | 'review_recommended' | 'informational';
  observedValue: string;
  explanation: string;
  inspectionScope: string;
  limitations: string;
  supportingDetails: string;
  honestyLabel: ImplementationHonestyLabel;
}

export interface ExplainableReasoning {
  observation: string;
  interpretation: string;
  limitation: string;
  nextStep: string;
}

export interface EvidenceItemModel {
  id: string;
  skillId: string;
  skillName: string;
  title: string;
  filePath: string;
  lineRange: [number, number];
  category: 'accepted' | 'rejected' | 'unclear';
  validationMethod: string;
  assessmentStatus: StandardSkillState;
  shortExplanation: string;
  excerpt: string;
  highlightedLines?: number[];
  highlightLines?: number[];
  contributionContext: {
    author: string;
    commitHash: string;
    timestamp: string;
    isCandidate: boolean;
  };
  knownLimitations: string;
  whyDecision: ExplainableReasoning;
  reviewerStatus: 'pending' | 'reviewed';
  reviewerNote?: string;
  relatedContractId?: string;
  honestyLabel: ImplementationHonestyLabel;
}

export interface SkillAssessmentModel {
  id: string;
  name: string;
  category: 'Language' | 'Frontend' | 'Backend' | 'Data & Persistence' | 'Security & Auth' | 'Testing & Quality' | 'DevOps & Collaboration';
  claimedProficiency: string;
  currentStatus: StandardSkillState;
  confidence: number;
  summary: string;
  supportingEvidenceIds: string[];
  rejectedEvidenceIds: string[];
  unclearEvidenceIds: string[];
  relevantCommitShas: string[];
  contractIds: string[];
  lastReviewedAt?: string;
  updatedViaContract?: boolean;
  connections: string[];
}

export type ChallengeLifecycleStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Reviewed';

export interface AcceptanceCriterion {
  id: string;
  label: string;
  satisfied: boolean;
  checkType: 'test' | 'ast' | 'coverage' | 'git';
  detail: string;
}

export interface CommitContractModel {
  id: string;
  title: string;
  targetSkillId: string;
  targetSkillName: string;
  currentSkillState: StandardSkillState;
  targetSkillState: StandardSkillState;
  reasonGenerated: string;
  existingContext: string;
  requiredWork: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  expectedTests: string[];
  observableBehavior: string;
  relevantFiles: string[];
  status: ChallengeLifecycleStatus;
  estimatedEffort: string;
  diffPreview?: {
    file: string;
    diffSnippet: string;
  };
  reviewOutcome?: {
    acceptedEvidenceId: string;
    criteriaSatisfiedCount: number;
    totalCriteriaCount: number;
    previousState: StandardSkillState;
    updatedState: StandardSkillState;
    explanation: string;
    remainingGaps: string[];
  };
}

export interface AssessmentActivityRecord {
  id: string;
  timestamp: string;
  actionType: 'audit' | 'review' | 'contract_started' | 'contract_submitted' | 'contract_accepted';
  title: string;
  summary: string;
  badgeText: string;
}

// --- Pure Signal Provenance Types ---
export interface ProvenanceFlag {
  code: string;
  severity: 'info' | 'review';
  title: string;
  observed_values: Record<string, any>;
  why_it_can_be_innocent: string;
  permalink?: string;
}

export interface ProvenanceSignals {
  age?: {
    created_at: string;
    pushed_at: string;
    first_commit_date: string;
    repo_age_days: number;
    default_branch: string;
  };
  analysis_limits?: {
    analyzed_commits_count: number;
    commit_cap: number;
    cap_hit: boolean;
    banner_text?: string | null;
  };
  fork_and_upstream?: {
    is_fork: boolean;
    upstream_status: string;
    parent_full_name?: string | null;
    parent_url?: string | null;
    source_full_name?: string | null;
    source_url?: string | null;
    ahead_by: number;
    behind_by: number;
    user_commits_ahead: number;
  };
  contributions?: {
    total_analyzed_commits: number;
    candidate_username: string;
    candidate_commit_count: number;
    candidate_commit_share: number;
    distinct_contributors_count: number;
    authors_by_login?: Record<string, number>;
    authors_by_email?: Record<string, number>;
    co_authors?: Array<{ name: string; email: string }>;
  };
  signed_commits?: {
    verified_count: number;
    unverified_count: number;
    unsigned_count: number;
    percentage_signed: number;
  };
  evidence_files_provenance?: Record<string, {
    file_path: string;
    local_sha?: string;
    file_candidate_commits: number;
    file_total_commits: number;
    file_candidate_share: number;
    upstream_status: 'unchanged from upstream' | 'modified from upstream' | 'added in this repo' | 'standalone';
    reason?: string;
  }>;
  history_rewrite_hints?: Array<{
    event: string;
    timestamp?: string;
    details: string;
  }>;
}

export interface RepoProvenanceRecord {
  id: string;
  repo_id: string;
  snapshot_version?: string;
  detector_version: string;
  signals: ProvenanceSignals;
  flags: ProvenanceFlag[];
  created_at: string;
}

// --- Commit History Analysis Types ---
export interface TimelineItem {
  week_start: string;
  commits_count: number;
  additions: number;
  deletions: number;
}

export interface DailyHeatmapItem {
  date: string;
  count: number;
  level: number;
}

export interface LargeAdditionItem {
  sha: string;
  short_sha: string;
  message: string;
  author_login: string;
  committed_at?: string | null;
  additions: number;
  deletions: number;
  files_changed: number;
  share_pct: number;
  verified: boolean;
  permalink: string;
  snapshot?: {
    snapshot_id: string;
    coverage_score: number;
  } | null;
}

export interface AuthorBreakdownItem {
  login: string;
  name: string;
  email?: string | null;
  is_signed_in_user: boolean;
  commits_count: number;
  commits_share_pct: number;
  additions: number;
  deletions: number;
  lines_share_pct: number;
}

export interface HistoryFlagItem {
  id?: string;
  code: string;
  severity: 'review' | 'info';
  title: string;
  rule: string;
  observed: Record<string, any>;
  innocent_note: string;
  created_at?: string | null;
}

export interface CommitHistoryData {
  repo_id: string;
  repo_full_name: string;
  default_branch: string;
  commit_cap: number;
  total_commits_analyzed: number;
  cap_reached: boolean;
  cap_banner_message?: string | null;
  disclaimer: string;
  timeline: TimelineItem[];
  daily_contributions: DailyHeatmapItem[];
  large_additions: LargeAdditionItem[];
  authors: AuthorBreakdownItem[];
  flags_count: number;
  flags: HistoryFlagItem[];
  thresholds: Record<string, any>;
}

export interface HistoryFlagsData {
  repo_id: string;
  flags: HistoryFlagItem[];
  thresholds: Record<string, any>;
  disclaimer: string;
}


