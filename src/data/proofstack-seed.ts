import {
  RepositoryIdentity,
  ContributorMetric,
  CommitAuditItem,
  ProvenanceCheckItem,
  EvidenceItemModel,
  SkillAssessmentModel,
  CommitContractModel,
  AssessmentActivityRecord,
} from '../types/proofstack';

const activeUser = typeof window !== 'undefined' ? (localStorage.getItem('ps_github_username') || '307vedanttt') : '307vedanttt';

export const initialRepository: RepositoryIdentity = {
  id: `repo-${activeUser}-mednav-ai`,
  name: 'MedNav-Ai',
  owner: activeUser,
  fullName: `${activeUser}/MedNav-Ai`,
  description: 'Intelligent clinical navigation and automated triaging system with live AST code verification & git provenance audit',
  defaultBranch: 'main',
  primaryLanguage: 'JavaScript / TypeScript',
  createdAt: '2026-05-12T09:15:00Z',
  lastActivityAt: '2026-10-17T18:42:10Z',
  forkStatus: {
    isFork: false,
  },
  inspectedCommitsCount: 64,
  contributorsCount: 2,
  headSha: 'b9a10981a6ade11295e619d57ec6c16f8e82cfc3',
  license: 'MIT',
  starsCount: 18,
  connectionState: 'live_connected',
  lastAssessmentTimestamp: '2026-10-17 14:30 UTC',
};

export const initialContributors: ContributorMetric[] = [
  {
    id: `contrib-${activeUser}`,
    name: activeUser,
    username: activeUser,
    email: `${activeUser}@users.noreply.github.com`,
    avatarUrl: `https://github.com/${activeUser}.png`,
    role: 'candidate',
    commitsCount: 42,
    percentageOfCommits: 65.6,
    filesChangedCount: 48,
    linesAdded: 5820,
    linesDeleted: 1440,
  },
  {
    id: 'contrib-ai-reviewer',
    name: 'ProofStack Reviewer',
    username: 'proofstack-audit',
    email: 'reviewer@proofstack.dev',
    avatarUrl: 'https://github.com/github.png',
    role: 'maintainer',
    commitsCount: 22,
    percentageOfCommits: 34.4,
    filesChangedCount: 31,
    linesAdded: 3240,
    linesDeleted: 920,
  },
  {
    id: 'contrib-bot',
    name: 'dependabot[bot]',
    username: 'dependabot',
    email: 'support@github.com',
    role: 'bot',
    commitsCount: 3,
    percentageOfCommits: 6.3,
    filesChangedCount: 4,
    linesAdded: 180,
    linesDeleted: 140,
  },
];

export const initialProvenanceChecks: ProvenanceCheckItem[] = [
  {
    id: 'prov-origin',
    name: 'Repository Origin & Lineage',
    category: 'origin',
    resultState: 'attention',
    observedValue: 'Fork detected · Upstream identified (upstream-org/core-taskflow)',
    explanation:
      'Repository was initialized as a fork of upstream-org/core-taskflow. Assessment engine explicitly isolates candidate commits from upstream commits.',
    inspectionScope: 'Git upstream remote metadata, root commit SHA, and divergence point (commit 3a91bf)',
    limitations:
      'A fork indicator does not imply plagiarism. Developers frequently fork open-source frameworks or company templates for active development.',
    supportingDetails:
      'Candidate committed 34 new commits on branch `main` after diverging from upstream at commit 3a91bf on 2026-06-01.',
    honestyLabel: 'Live Check',
  },
  {
    id: 'prov-history',
    name: 'Contribution History Completeness',
    category: 'history',
    resultState: 'verified',
    observedValue: 'Complete 4-month timeline · 48 commits inspected',
    explanation:
      'Full Git commit tree and reachable DAG are present. Commit timestamps show a continuous progression of work from June 2026 through October 2026.',
    inspectionScope: 'Full repository DAG traversal (git log --topo-order --reverse)',
    limitations:
      'Git commit dates can be rewritten or squashed locally before pushing. Timeline coherence is a supporting signal, not mathematical proof of elapsed time.',
    supportingDetails:
      'Median interval between candidate commits is 2.3 days. No anomalous retro-dated timestamps detected.',
    honestyLabel: 'Derived Signal',
  },
  {
    id: 'prov-signatures',
    name: 'Cryptographic Commit Signatures',
    category: 'signatures',
    resultState: 'attention',
    observedValue: 'Mixed signatures · 28 of 48 signed with GPG key 0x9B4C28',
    explanation:
      `28 commits by ${activeUser} are cryptographically signed with GPG Key ID 0x9B4C28 (GitHub Verified). 20 older commits are unsigned.`,
    inspectionScope: 'Commit headers (gpgsig) evaluated against GitHub OpenPGP web-of-trust store',
    limitations:
      'Unsigned commits are standard in many local development configurations. Unsigned status does not indicate fraudulent attribution.',
    supportingDetails:
      'Candidate signed all recent commits from August 2026 onward. Earliest prototyping commits were unsigned.',
    honestyLabel: 'Live Check',
  },
  {
    id: 'prov-contributors',
    name: 'Contributor Attribution & Context',
    category: 'contributors',
    resultState: 'verified',
    observedValue: 'Candidate authored 70.8% of commits (34 of 48)',
    explanation:
      `${activeUser} is the primary code contributor to the core engine, API routes, and test suite. Co-contributor Vedant contributed upstream foundation files.`,
    inspectionScope: 'Author/committer mailmap normalization across git-shortlog',
    limitations:
      'Git author names and emails can be modified in local gitconfig. Author identity is corroborated by signed GPG key and pull request approvals.',
    supportingDetails:
      `Commit mailmap matches primary candidate profile (${activeUser}@users.noreply.github.com) with 0 unresolved author aliases.`,
    honestyLabel: 'Derived Signal',
  },
  {
    id: 'prov-initial-pattern',
    name: 'Initial Upload & Codebase Evolution',
    category: 'initial_pattern',
    resultState: 'review_recommended',
    observedValue: 'Review Recommended · Initial commit imported 14,200 LOC',
    explanation:
      'Commit c8f12a (2026-06-01) imported a pre-existing boilerplate/starter codebase of 14,200 lines. Subsequent feature commits are iterative and modular.',
    inspectionScope: 'Diff delta histogram of root commit vs incremental feature branches',
    limitations:
      'Starter kits, create-react-app templates, and SDK vendoring routinely introduce large initial imports. This is not evidence of plagiarism.',
    supportingDetails:
      'Evidence engine filtered out all unedited vendor files in `vendor/` and focused evaluations solely on candidate-authored code in `src/`.',
    honestyLabel: 'Derived Signal',
  },
];

export const initialCommits: CommitAuditItem[] = [
  {
    hash: 'c8f12a9e4d5b6c7f8a9b0c1d2e3f4a5b6c7d8e9f',
    shortHash: 'c8f12a9',
    timestamp: '2026-10-16 18:42:10 UTC',
    author: {
      name: activeUser,
      email: `${activeUser}@users.noreply.github.com`,
      username: activeUser,
      isCandidate: true,
    },
    message: 'feat(api): implement idempotent task execution pipeline with schema guards',
    changedFilesCount: 4,
    filesChanged: ['src/api/tasks.ts', 'src/services/taskRunner.ts', 'src/middleware/validator.ts', 'src/types/task.ts'],
    linesAdded: 312,
    linesDeleted: 45,
    relatedSkills: ['REST API Development', 'TypeScript', 'Error Handling'],
    signatureStatus: 'verified',
    signatureDetails: 'GPG Key ID: 0x9B4C28 (GitHub Verified)',
    reviewAnnotation: {
      flag: 'normal',
      label: 'Feature Commit',
      reason: 'Modular commit with typed payload validation and error boundaries.',
      guidance: 'Verified against AST endpoint detector.',
    },
  },
  {
    hash: 'b4a81f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a',
    shortHash: 'b4a81f3',
    timestamp: '2026-10-14 11:20:05 UTC',
    author: {
      name: activeUser,
      email: `${activeUser}@users.noreply.github.com`,
      username: activeUser,
      isCandidate: true,
    },
    message: 'test: add basic task route test suite with client fixtures',
    changedFilesCount: 2,
    filesChanged: ['tests/tasks.test.ts', 'tests/fixtures/mockPayloads.ts'],
    linesAdded: 145,
    linesDeleted: 12,
    relatedSkills: ['Automated Testing', 'TypeScript'],
    signatureStatus: 'verified',
    signatureDetails: 'GPG Key ID: 0x9B4C28 (GitHub Verified)',
    reviewAnnotation: {
      flag: 'review_recommended',
      label: 'Review Recommended: Assertion Quality',
      reason: 'Test suite covers happy path HTTP 200, but lacks assertions for authorization failure or malformed payload rejections.',
      guidance: 'Targeted in Commit Contract: Implement Meaningful API Integration Tests.',
    },
  },
  {
    hash: '9f3c2ab71e4d5b6c7f8a9b0c1d2e3f4a5b6c7d8e',
    shortHash: '9f3c2ab',
    timestamp: '2026-10-11 16:04:32 UTC',
    author: {
      name: activeUser,
      email: `${activeUser}@users.noreply.github.com`,
      username: activeUser,
      isCandidate: true,
    },
    message: 'feat(auth): add constant-time HMAC webhook signature verifier',
    changedFilesCount: 2,
    filesChanged: ['src/auth/hmac.ts', 'src/middleware/authGuard.ts'],
    linesAdded: 98,
    linesDeleted: 14,
    relatedSkills: ['Authentication', 'Node.js'],
    signatureStatus: 'verified',
    signatureDetails: 'GPG Key ID: 0x9B4C28 (GitHub Verified)',
  },
  {
    hash: '7a12b9c5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9',
    shortHash: '7a12b9c',
    timestamp: '2026-10-06 09:12:44 UTC',
    author: {
      name: activeUser,
      email: `${activeUser}@users.noreply.github.com`,
      username: activeUser,
      isCandidate: true,
    },
    message: 'refactor: isolate database connection pooling and schema types',
    changedFilesCount: 3,
    filesChanged: ['src/db/connection.ts', 'src/db/types.ts', 'src/config/dbConfig.ts'],
    linesAdded: 164,
    linesDeleted: 82,
    relatedSkills: ['Database Design', 'TypeScript'],
    signatureStatus: 'verified',
    signatureDetails: 'GPG Key ID: 0x9B4C28 (GitHub Verified)',
  },
  {
    hash: '5d81e0c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8',
    shortHash: '5d81e0c',
    timestamp: '2026-09-28 14:33:18 UTC',
    author: {
      name: 'Sarah Lin',
      email: 'sarah.lin@upstream-org.net',
      username: 'slin-eng',
      isCandidate: false,
    },
    message: 'chore(deps): update core telemetry logger package to v3.2',
    changedFilesCount: 2,
    filesChanged: ['package.json', 'package-lock.json'],
    linesAdded: 45,
    linesDeleted: 42,
    relatedSkills: ['Git Collaboration'],
    signatureStatus: 'unsigned',
    reviewAnnotation: {
      flag: 'normal',
      label: 'Maintainer Upstream Sync',
      reason: 'Committed by repository co-maintainer Sarah Lin.',
      guidance: 'Separated from candidate attribution score.',
    },
  },
  {
    hash: '3a91bf2c1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b',
    shortHash: '3a91bf2',
    timestamp: '2026-06-01 10:00:00 UTC',
    author: {
      name: activeUser,
      email: `${activeUser}@users.noreply.github.com`,
      username: activeUser,
      isCandidate: true,
    },
    message: 'initial: import foundational taskflow architecture skeleton',
    changedFilesCount: 28,
    filesChanged: ['src/*', 'tsconfig.json', 'package.json', 'README.md'],
    linesAdded: 14200,
    linesDeleted: 0,
    relatedSkills: ['JavaScript', 'TypeScript'],
    signatureStatus: 'unsigned',
    reviewAnnotation: {
      flag: 'large_initial_upload',
      label: 'Review Recommended: Large Initial Upload',
      reason: '14,200 LOC imported in single commit. Baseline template import.',
      guidance: 'Only edits made in subsequent commits are treated as verified candidate artifacts.',
    },
  },
];

export const initialSkills: SkillAssessmentModel[] = [
  {
    id: 'skill-ts',
    name: 'TypeScript',
    category: 'Language',
    claimedProficiency: 'Senior / Production',
    currentStatus: 'Demonstrated — Strong',
    confidence: 0.96,
    summary: 'Extensive strict typing, discriminated unions, generic type constraints, and zod/io-ts schema validation.',
    supportingEvidenceIds: ['evi-ts-types', 'evi-api-route'],
    rejectedEvidenceIds: [],
    unclearEvidenceIds: [],
    relevantCommitShas: ['c8f12a9', '7a12b9c', 'b4a81f3'],
    contractIds: [],
    connections: ['skill-js', 'skill-rest', 'skill-react', 'skill-node'],
  },
  {
    id: 'skill-js',
    name: 'JavaScript',
    category: 'Language',
    claimedProficiency: 'Advanced',
    currentStatus: 'Demonstrated — Strong',
    confidence: 0.94,
    summary: 'Modern ES2023+ syntax, async/await pipelines, closure containment, and event loop concurrency models.',
    supportingEvidenceIds: ['evi-ts-types', 'evi-node-event'],
    rejectedEvidenceIds: [],
    unclearEvidenceIds: [],
    relevantCommitShas: ['c8f12a9', '3a91bf2'],
    contractIds: [],
    connections: ['skill-ts', 'skill-node'],
  },
  {
    id: 'skill-react',
    name: 'React',
    category: 'Frontend',
    claimedProficiency: 'Advanced UI',
    currentStatus: 'Demonstrated — Strong',
    confidence: 0.92,
    summary: 'Custom reactive hooks, suspense boundaries, memory-optimized memoization, and accessible ARIA widgets.',
    supportingEvidenceIds: ['evi-react-hook'],
    rejectedEvidenceIds: [],
    unclearEvidenceIds: [],
    relevantCommitShas: ['c8f12a9'],
    contractIds: [],
    connections: ['skill-ts', 'skill-error'],
  },
  {
    id: 'skill-node',
    name: 'Node.js',
    category: 'Backend',
    claimedProficiency: 'Senior Backend',
    currentStatus: 'Demonstrated — Strong',
    confidence: 0.95,
    summary: 'Non-blocking I/O stream processing, worker thread distribution, and resilient cluster lifecycle management.',
    supportingEvidenceIds: ['evi-node-event', 'evi-api-route'],
    rejectedEvidenceIds: ['evi-rej-proto'],
    unclearEvidenceIds: [],
    relevantCommitShas: ['c8f12a9', '9f3c2ab'],
    contractIds: [],
    connections: ['skill-js', 'skill-rest', 'skill-auth'],
  },
  {
    id: 'skill-rest',
    name: 'REST API Development',
    category: 'Backend',
    claimedProficiency: 'Senior API Architect',
    currentStatus: 'Demonstrated — Strong',
    confidence: 0.98,
    summary: 'Clean RESTful routing, status code semantics, RFC 7807 Problem Details, and OpenAPI spec schemas.',
    supportingEvidenceIds: ['evi-api-route'],
    rejectedEvidenceIds: [],
    unclearEvidenceIds: [],
    relevantCommitShas: ['c8f12a9', 'b4a81f3'],
    contractIds: [],
    connections: ['skill-ts', 'skill-node', 'skill-error', 'skill-testing'],
  },
  {
    id: 'skill-db',
    name: 'Database Design',
    category: 'Data & Persistence',
    claimedProficiency: 'Intermediate / Senior',
    currentStatus: 'Demonstrated — Basic',
    confidence: 0.72,
    summary: 'Relational connection pool configuration present; however, migration versioning and index optimization lack explicit test verification.',
    supportingEvidenceIds: ['evi-db-pool'],
    rejectedEvidenceIds: ['evi-rej-db-stub'],
    unclearEvidenceIds: [],
    relevantCommitShas: ['7a12b9c'],
    contractIds: ['contract-db-persistence'],
    connections: ['skill-rest', 'skill-testing'],
  },
  {
    id: 'skill-auth',
    name: 'Authentication & Security',
    category: 'Security & Auth',
    claimedProficiency: 'Zero-Trust Security',
    currentStatus: 'Demonstrated — Basic',
    confidence: 0.78,
    summary: 'Constant-time HMAC signature verification implemented; replay prevention mechanism and nonce cache not fully demonstrated in inspected scope.',
    supportingEvidenceIds: ['evi-auth-hmac'],
    rejectedEvidenceIds: [],
    unclearEvidenceIds: ['evi-unc-rate-limit'],
    relevantCommitShas: ['9f3c2ab'],
    contractIds: ['contract-auth-replay'],
    connections: ['skill-node', 'skill-rest', 'skill-testing'],
  },
  {
    id: 'skill-testing',
    name: 'Automated Testing',
    category: 'Testing & Quality',
    claimedProficiency: 'TDD / Test Engineering',
    currentStatus: 'Demonstrated — Basic',
    confidence: 0.65,
    summary: 'Unit test suite exists with basic status code checks, but assertion density is low and critical failure cases are not verified.',
    supportingEvidenceIds: ['evi-test-basic'],
    rejectedEvidenceIds: ['evi-rej-hollow-test'],
    unclearEvidenceIds: ['evi-unc-rate-limit'],
    relevantCommitShas: ['b4a81f3'],
    contractIds: ['contract-api-testing'],
    connections: ['skill-rest', 'skill-auth', 'skill-error'],
  },
  {
    id: 'skill-error',
    name: 'Error Handling & Resilience',
    category: 'Testing & Quality',
    claimedProficiency: 'Production Systems',
    currentStatus: 'Demonstrated — Basic',
    confidence: 0.74,
    summary: 'Centralized exception filter is mounted, but timeout circuit breakers and graceful shutdown handling are not yet demonstrated in scope.',
    supportingEvidenceIds: ['evi-error-middleware'],
    rejectedEvidenceIds: [],
    unclearEvidenceIds: [],
    relevantCommitShas: ['c8f12a9'],
    contractIds: [],
    connections: ['skill-rest', 'skill-testing', 'skill-node'],
  },
  {
    id: 'skill-git',
    name: 'Git Collaboration',
    category: 'DevOps & Collaboration',
    claimedProficiency: 'Senior Contributor',
    currentStatus: 'Unclear',
    confidence: 0.52,
    summary: 'Candidate demonstrates strong solo branch hygiene, but upstream fork synchronization and multi-contributor merge conflicts remain unclear.',
    supportingEvidenceIds: [],
    rejectedEvidenceIds: [],
    unclearEvidenceIds: ['evi-unc-git-merge'],
    relevantCommitShas: ['5d81e0c', '3a91bf2'],
    contractIds: [],
    connections: ['skill-ts'],
  },
];

export const initialEvidenceItems: EvidenceItemModel[] = [
  {
    id: 'evi-api-route',
    skillId: 'skill-rest',
    skillName: 'REST API Development',
    title: 'Idempotent Task Dispatch Controller with Schema Validation',
    filePath: 'src/api/tasks.ts',
    lineRange: [42, 68],
    category: 'accepted',
    validationMethod: 'AST ASTFunctionDeclaration Inspection + Schema Resolver',
    assessmentStatus: 'Demonstrated — Strong',
    shortExplanation: 'Typed Express/FastAPI router endpoint with Zod schema validation, explicit HTTP 201 response, and correlation ID injection.',
    excerpt: `export const taskRouter = Router();

taskRouter.post(
  '/v1/tasks/dispatch',
  validatePayload(DispatchTaskSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();
      const result = await taskRunner.execute({
        ...req.body,
        correlationId,
        dispatchedAt: new Date(),
      });
      res.status(201).json({
        success: true,
        data: result,
        correlationId,
      });
    } catch (err) {
      next(err);
    }
  }
);`,
    highlightLines: [4, 5, 8, 9, 10, 11, 14, 15, 16],
    contributionContext: {
      author: `${activeUser} <${activeUser}@users.noreply.github.com>`,
      commitHash: 'c8f12a9',
      timestamp: '2026-10-16 18:42:10 UTC',
      isCandidate: true,
    },
    knownLimitations: 'Runtime relies on in-memory mock dispatcher if REDIS_URL environment variable is unset.',
    whyDecision: {
      observation: 'Found `taskRouter.post` mounted at `/v1/tasks/dispatch` with `validatePayload(DispatchTaskSchema)` middleware.',
      interpretation: 'Demonstrates understanding of RESTful status codes, typed request parsing, and error-forwarding semantics.',
      limitation: 'Static AST inspection confirms routing code exists; live throughput load capacity cannot be determined from code alone.',
      nextStep: 'Ensure end-to-end integration tests verify that schema violations emit standard RFC 7807 problem details.',
    },
    reviewerStatus: 'reviewed',
    reviewerNote: 'Solid production pattern with middleware separation and UUID correlation IDs.',
    honestyLabel: 'Live Check',
  },
  {
    id: 'evi-auth-hmac',
    skillId: 'skill-auth',
    skillName: 'Authentication & Security',
    title: 'Constant-Time HMAC-SHA256 Signature Verification',
    filePath: 'src/auth/hmac.ts',
    lineRange: [18, 36],
    category: 'accepted',
    validationMethod: 'Crypto API Symbol Call Graph + AST Timing Resistance Check',
    assessmentStatus: 'Demonstrated — Basic',
    shortExplanation: 'Crypto HMAC-SHA256 verification using crypto.timingSafeEqual to prevent side-channel timing attacks.',
    excerpt: `import crypto from 'node:crypto';

export function verifyWebhookSignature(
  rawPayload: Buffer,
  signatureHeader: string,
  secretKey: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const providedSignature = Buffer.from(signatureHeader.replace('sha256=', ''), 'hex');
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(rawPayload);
  const calculatedSignature = hmac.digest();

  if (providedSignature.length !== calculatedSignature.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedSignature, calculatedSignature);
}`,
    highlightLines: [8, 9, 13, 14, 17, 18, 20],
    contributionContext: {
      author: `${activeUser} <${activeUser}@users.noreply.github.com>`,
      commitHash: '9f3c2ab',
      timestamp: '2026-10-11 16:04:32 UTC',
      isCandidate: true,
    },
    knownLimitations: 'Lacks timestamp expiry tolerance check (drift window), leaving webhooks vulnerable to replay within TTL.',
    whyDecision: {
      observation: 'Implementation utilizes `crypto.timingSafeEqual` and validates buffer byte lengths before comparing.',
      interpretation: 'Demonstrates deep awareness of cryptographic side-channel timing vulnerabilities.',
      limitation: 'Does not implement replay attack deduplication (e.g. tracking seen delivery UUIDs or timestamp limits).',
      nextStep: 'Implement a Redis or SQLite sliding-window delivery cache to reject replayed webhook payloads.',
    },
    reviewerStatus: 'pending',
    relatedContractId: 'contract-auth-replay',
    honestyLabel: 'Live Check',
  },
  {
    id: 'evi-test-basic',
    skillId: 'skill-testing',
    skillName: 'Automated Testing',
    title: 'HTTP 200 Happy Path Task Dispatch Test',
    filePath: 'tests/tasks.test.ts',
    lineRange: [12, 28],
    category: 'accepted',
    validationMethod: 'Test Runner AST Parser & Assertion Extractor',
    assessmentStatus: 'Demonstrated — Basic',
    shortExplanation: 'Vitest test case verifying successful response status and payload presence for valid task dispatch.',
    excerpt: `describe('POST /v1/tasks/dispatch', () => {
  it('should accept valid task dispatch payload and return HTTP 201', async () => {
    const payload = {
      taskType: 'sync-inventory',
      priority: 'high',
      payload: { warehouseId: 'wh-90210' },
    };
    const response = await supertest(app)
      .post('/v1/tasks/dispatch')
      .set('x-api-key', 'test-key-demo')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.taskId).toBeDefined();
  });
});`,
    highlightLines: [11, 12, 13],
    contributionContext: {
      author: `${activeUser} <${activeUser}@users.noreply.github.com>`,
      commitHash: 'b4a81f3',
      timestamp: '2026-10-14 11:20:05 UTC',
      isCandidate: true,
    },
    knownLimitations: 'Does not test 401 Unauthorized, 422 Invalid Schema, or 500 downstream runner failures.',
    whyDecision: {
      observation: 'Test exercises the endpoint using supertest and asserts status 201 and data presence.',
      interpretation: 'Supports Demonstrated — Basic for testing; establishes that test tooling is set up and functional.',
      limitation: 'Assertion surface is narrow (only 3 shallow assertions). Invariant boundaries and negative scenarios are untested.',
      nextStep: 'Complete Commit Contract `ctr-api-testing` to add tests for invalid payloads, missing headers, and error states.',
    },
    reviewerStatus: 'pending',
    relatedContractId: 'contract-api-testing',
    honestyLabel: 'Live Check',
  },
  {
    id: 'evi-rej-hollow-test',
    skillId: 'skill-testing',
    skillName: 'Automated Testing',
    title: 'Hollow Assertion in Task Health Check Test',
    filePath: 'tests/health.test.ts',
    lineRange: [14, 22],
    category: 'rejected',
    validationMethod: 'Hollow-Assertion Guard Heuristic & Dead Code Detection',
    assessmentStatus: 'Demonstrated — Basic',
    shortExplanation: 'Test contains trivial tautological assertion (`expect(true).toBe(true)`) without invoking runtime code.',
    excerpt: `describe('Service Healthcheck Verification', () => {
  it('validates healthcheck invariants', () => {
    // TODO: wire up live probe
    const isReady = true;
    expect(isReady).toBe(true);
  });
});`,
    highlightLines: [4, 5],
    contributionContext: {
      author: `${activeUser} <${activeUser}@users.noreply.github.com>`,
      commitHash: 'b4a81f3',
      timestamp: '2026-10-14 11:20:05 UTC',
      isCandidate: true,
    },
    knownLimitations: 'Contains zero invocations of application code.',
    whyDecision: {
      observation: 'Test function declares a local variable `isReady = true` and asserts it equals true.',
      interpretation: 'Provides zero verification of application behavior or server health. Flagged as hollow assertion.',
      limitation: 'Rejection does not mean the author is dishonest; it is frequently left as a scaffolding placeholder.',
      nextStep: 'Replace placeholder with an actual HTTP GET /health request asserting database readiness and memory metrics.',
    },
    reviewerStatus: 'reviewed',
    reviewerNote: 'Refused from evidence score per hollow-assertion rule.',
    honestyLabel: 'Derived Signal',
  },
  {
    id: 'evi-rej-db-stub',
    skillId: 'skill-db',
    skillName: 'Database Design',
    title: 'Unwired Migration Stub with Static Mock Return',
    filePath: 'src/db/migrations/001_tasks.ts',
    lineRange: [8, 18],
    category: 'rejected',
    validationMethod: 'Call Graph Reachability & Static Return Pattern Detection',
    assessmentStatus: 'Demonstrated — Basic',
    shortExplanation: 'Migration file returns mock status string without executing DDL schema statements or creating tables.',
    excerpt: `export async function up(connection: any): Promise<{ applied: boolean }> {
  // Database schema migration
  // connection.query('CREATE TABLE tasks (...)')
  return { applied: true };
}`,
    highlightLines: [2, 3],
    contributionContext: {
      author: `${activeUser} <${activeUser}@users.noreply.github.com>`,
      commitHash: '7a12b9c',
      timestamp: '2026-10-06 09:12:44 UTC',
      isCandidate: true,
    },
    knownLimitations: 'Commented-out DDL query. No table schema creation occurs at runtime.',
    whyDecision: {
      observation: 'The migration function contains commented-out DDL code and returns a hardcoded `{ applied: true }`.',
      interpretation: 'Cannot count as evidence of database schema design or relational table modeling.',
      limitation: 'Does not imply candidate lacks SQL knowledge; only that this repository does not demonstrate it.',
      nextStep: 'Complete Commit Contract `ctr-db-persistence` to write executable SQLite/Postgres table creation DDL.',
    },
    reviewerStatus: 'reviewed',
    reviewerNote: 'Excluded from Database Design evidence tally.',
    honestyLabel: 'Derived Signal',
  },
  {
    id: 'evi-unc-rate-limit',
    skillId: 'skill-auth',
    skillName: 'Authentication & Security',
    title: 'Rate Limiter Middleware without Distributed Store',
    filePath: 'src/middleware/rateLimiter.ts',
    lineRange: [10, 26],
    category: 'unclear',
    validationMethod: 'Concurrency & Multi-Instance Architectural Review',
    assessmentStatus: 'Unclear',
    shortExplanation: 'In-memory Map used for rate limiting. Behavior in multi-replica deployment cannot be established.',
    excerpt: `const ipHits = new Map<string, number>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || '127.0.0.1';
  const count = (ipHits.get(ip) || 0) + 1;
  ipHits.set(ip, count);
  if (count > 100) {
    res.status(429).json({ error: 'Too Many Requests' });
    return;
  }
  next();
}`,
    highlightLines: [1, 5, 6, 7, 8],
    contributionContext: {
      author: `${activeUser} <${activeUser}@users.noreply.github.com>`,
      commitHash: 'c8f12a9',
      timestamp: '2026-10-16 18:42:10 UTC',
      isCandidate: true,
    },
    knownLimitations: 'Resets on process restart; does not synchronize state across horizontal container pods.',
    whyDecision: {
      observation: 'Uses a local `new Map()` instance variable without TTL eviction or distributed storage adapter.',
      interpretation: 'Sufficient for single-node development, but insufficient to establish production rate-limiting capability.',
      limitation: 'The inspected codebase does not include docker-compose or Kubernetes replica topology.',
      nextStep: 'Review with candidate during technical deep dive or expand implementation with Redis token bucket.',
    },
    reviewerStatus: 'pending',
    honestyLabel: 'Derived Signal',
  },
  {
    id: 'evi-unc-git-merge',
    skillId: 'skill-git',
    skillName: 'Git Collaboration',
    title: 'Upstream Merge Commit with Divergent Signature Metadata',
    filePath: '.git/refs/heads/main',
    lineRange: [1, 1],
    category: 'unclear',
    validationMethod: 'Git DAG Parentage & Contributor Mailmap Cross-Verification',
    assessmentStatus: 'Unclear',
    shortExplanation: 'Merge commit incorporates upstream-org changes with mixed committer metadata.',
    excerpt: `Merge branch 'upstream/main' into main
Conflicts resolved in src/services/taskRunner.ts
Committer: Sarah Lin <slin-eng@upstream-org.net>
Author: ${activeUser} <${activeUser}@users.noreply.github.com>`,
    highlightLines: [1, 2, 3, 4],
    contributionContext: {
      author: `${activeUser} <${activeUser}@users.noreply.github.com>`,
      commitHash: '5d81e0c',
      timestamp: '2026-09-28 14:33:18 UTC',
      isCandidate: true,
    },
    knownLimitations: 'Cannot determine whether conflict resolution was automated or manually reviewed.',
    whyDecision: {
      observation: `Commit message records author as ${activeUser} and committer as upstream maintainer.`,
      interpretation: 'Shows collaborative branch integration occurred between candidate and upstream maintainer.',
      limitation: 'Git metadata alone does not indicate whether pull request code review discussions took place.',
      nextStep: 'Cross-reference with GitHub Pull Request #14 review comment thread.',
    },
    reviewerStatus: 'pending',
    honestyLabel: 'Derived Signal',
  },
];

export const initialContracts: CommitContractModel[] = [
  {
    id: 'contract-api-testing',
    title: 'Implement Meaningful API Integration Tests',
    targetSkillId: 'skill-testing',
    targetSkillName: 'Automated Testing',
    currentSkillState: 'Demonstrated — Basic',
    targetSkillState: 'Demonstrated — Strong',
    reasonGenerated:
      'The repository contains tests for the task dispatch API, but the available evidence does not establish that invalid input, authorization failures, and error responses are meaningfully verified.',
    existingContext:
      'tests/tasks.test.ts currently verifies only a single 201 response. Tests for missing tokens, malformed priority fields, and server exceptions are completely missing.',
    requiredWork: [
      'Write integration test for HTTP 400/422 when DispatchTaskSchema validation fails',
      'Write integration test for HTTP 401 when x-api-key header is absent or invalid',
      'Verify response body contains structured RFC 7807 problem details with error code and traceId',
      'Simulate runner exception and assert graceful HTTP 500 response handling',
      'Ensure test suite executes cleanly with zero skipped tests',
    ],
    acceptanceCriteria: [
      {
        id: 'crit-api-1',
        label: 'Tests run against actual API router endpoints without external mocking bypass',
        satisfied: false,
        checkType: 'test',
        detail: 'AST verifies invocation of supertest(app).post(\'/v1/tasks/dispatch\')',
      },
      {
        id: 'crit-api-2',
        label: 'Negative test case asserts HTTP 422 Unprocessable Entity on missing required fields',
        satisfied: false,
        checkType: 'ast',
        detail: 'Expect response.status == 422 and response.body.errors array populated',
      },
      {
        id: 'crit-api-3',
        label: 'Security test case asserts HTTP 401 Unauthorized when invalid API key is provided',
        satisfied: false,
        checkType: 'test',
        detail: 'Expect response.status == 401 with standard unauthorized message',
      },
      {
        id: 'crit-api-4',
        label: 'All required test assertions execute and pass in Vitest runner with 0 failures',
        satisfied: false,
        checkType: 'coverage',
        detail: 'Simulated runner output: 4 passed in tests/tasks.test.ts',
      },
    ],
    expectedTests: [
      'POST /v1/tasks/dispatch rejects invalid task priority with 422',
      'POST /v1/tasks/dispatch rejects missing auth header with 401',
      'POST /v1/tasks/dispatch returns correlation ID in error payload',
    ],
    observableBehavior:
      'Developers calling the API with malformed parameters receive transparent error feedback rather than opaque failures.',
    relevantFiles: ['tests/tasks.test.ts', 'src/api/tasks.ts', 'src/middleware/validator.ts'],
    status: 'In Progress',
    estimatedEffort: '35 minutes',
    diffPreview: {
      file: 'tests/tasks.test.ts',
      diffSnippet: `+ describe('Negative Invariants & Security Boundaries', () => {
+   it('should reject malformed dispatch payload with HTTP 422', async () => {
+     const res = await supertest(app)
+       .post('/v1/tasks/dispatch')
+       .set('x-api-key', 'valid-test-key')
+       .send({ priority: 'INVALID_ENUM' });
+     expect(res.status).toBe(422);
+     expect(res.body.errors[0].field).toBe('taskType');
+   });
+
+   it('should reject unauthorized requests with HTTP 401', async () => {
+     const res = await supertest(app)
+       .post('/v1/tasks/dispatch')
+       .send({ taskType: 'sync' });
+     expect(res.status).toBe(401);
+     expect(res.body.error).toBe('Missing required x-api-key');
+   });
+ });`,
    },
    reviewOutcome: {
      acceptedEvidenceId: 'evi-new-testing-suite',
      criteriaSatisfiedCount: 4,
      totalCriteriaCount: 4,
      previousState: 'Demonstrated — Basic',
      updatedState: 'Demonstrated — Strong',
      explanation:
        'Submitted integration tests comprehensively exercise both happy path and critical boundary cases (invalid schema enum, unauthorized header, structured error payload). The criteria are satisfied.',
      remainingGaps: ['Fuzz testing with unexpected multibyte inputs could be added in a future contract.'],
    },
  },
  {
    id: 'contract-db-persistence',
    title: 'Implement Parameterized Database Repository & Migration Invariant',
    targetSkillId: 'skill-db',
    targetSkillName: 'Database Design',
    currentSkillState: 'Demonstrated — Basic',
    targetSkillState: 'Demonstrated — Strong',
    reasonGenerated:
      'Existing migration file 001_tasks.ts is an unexecuted stub with a hardcoded return. No relational persistence or parameterized queries are validated in tests.',
    existingContext:
      'src/db/migrations/001_tasks.ts returns { applied: true } without running schema DDL.',
    requiredWork: [
      'Write SQLite/PostgreSQL DDL table schema for task records with indexing on status and created_at',
      'Implement repository query method using parameterized variables (? or $1) to prevent SQL injection',
      'Write transactional rollback test under simulated failure',
    ],
    acceptanceCriteria: [
      {
        id: 'crit-db-1',
        label: 'Migration script creates tasks table with primary key UUID and composite index',
        satisfied: false,
        checkType: 'ast',
        detail: 'CREATE TABLE tasks (id TEXT PRIMARY KEY, status TEXT, created_at TIMESTAMP)',
      },
      {
        id: 'crit-db-2',
        label: 'Repository utilizes parameterized queries without string concatenation',
        satisfied: false,
        checkType: 'ast',
        detail: 'AST check confirms zero SQL string interpolation vulnerabilities',
      },
    ],
    expectedTests: ['Database migration applies idempotently', 'SQL injection attack string handled as literal text'],
    observableBehavior: 'Tasks persist across server restarts with durable ACID guarantees.',
    relevantFiles: ['src/db/migrations/001_tasks.ts', 'src/db/taskRepository.ts', 'tests/db.test.ts'],
    status: 'Not Started',
    estimatedEffort: '45 minutes',
  },
  {
    id: 'contract-auth-replay',
    title: 'Implement Webhook Replay Attack Prevention Window',
    targetSkillId: 'skill-auth',
    targetSkillName: 'Authentication & Security',
    currentSkillState: 'Demonstrated — Basic',
    targetSkillState: 'Demonstrated — Strong',
    reasonGenerated:
      'HMAC constant-time verification is implemented, but delivery timestamp tolerance and duplicate nonce deduplication are absent.',
    existingContext: 'src/auth/hmac.ts verifies hash but allows identical payloads to be submitted repeatedly.',
    requiredWork: [
      'Add timestamp header verification rejecting payloads older than 300 seconds',
      'Store delivery UUID in atomic cache and return HTTP 409 Conflict on repeated submissions',
    ],
    acceptanceCriteria: [
      {
        id: 'crit-auth-1',
        label: 'Expired timestamp triggers HTTP 400 Request Expired',
        satisfied: false,
        checkType: 'test',
        detail: 'Timestamp tolerance window capped at +/- 300s',
      },
      {
        id: 'crit-auth-2',
        label: 'Duplicate webhook delivery ID returns HTTP 409 Conflict',
        satisfied: false,
        checkType: 'test',
        detail: 'Replay prevention confirmed in integration test',
      },
    ],
    expectedTests: ['Replay test with duplicate UUID returns 409', 'Old timestamp header returns 400'],
    observableBehavior: 'Prevents adversarial replay of historical webhook signatures.',
    relevantFiles: ['src/auth/hmac.ts', 'src/middleware/authGuard.ts', 'tests/auth.test.ts'],
    status: 'Not Started',
    estimatedEffort: '25 minutes',
  },
];

export const initialActivities: AssessmentActivityRecord[] = [
  {
    id: 'act-001',
    timestamp: '2026-10-17 07:10 UTC',
    actionType: 'audit',
    title: 'Evidence Audit Completed',
    summary: 'Traversed 48 commits and evaluated 10 skill categories against AST detectors.',
    badgeText: 'Audit Run',
  },
  {
    id: 'act-002',
    timestamp: '2026-10-16 19:15 UTC',
    actionType: 'review',
    title: 'Hollow Assertion Refused',
    summary: 'Refused tests/health.test.ts (expect(true).toBe(true)) from testing evidence tally.',
    badgeText: 'Shield Guard',
  },
  {
    id: 'act-003',
    timestamp: '2026-10-16 18:50 UTC',
    actionType: 'review',
    title: 'Evidence Item Accepted',
    summary: 'Accepted Idempotent Task Dispatch Controller (src/api/tasks.ts) for REST API Development.',
    badgeText: 'Evidence Accepted',
  },
  {
    id: 'act-004',
    timestamp: '2026-10-15 14:22 UTC',
    actionType: 'contract_started',
    title: 'Commit Contract Started',
    summary: 'Candidate opened contract `Implement Meaningful API Integration Tests`.',
    badgeText: 'Contract Active',
  },
];
