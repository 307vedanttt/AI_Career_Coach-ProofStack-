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
