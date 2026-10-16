import {
  Requirement,
  Assessment,
  Evidence,
  RejectedCandidate,
  Contract,
  Snapshot,
  ProofStackEvent,
  SystemMetrics,
  CoachRecord,
  AttackVector,
  AdversarialSuiteData,
  ResumeAttestationData,
  LedgerBlock,
  RepoScanResult,
} from '../types/api';

// Check if mocks are enabled (defaults to true if unset or not 'false')
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ============================================================================
// REALISTIC SEED DATA (Never hardcoded in UI components)
// ============================================================================

export const mockSystemMetrics: SystemMetrics = {
  hollowSignalsRefused: 14,
  filesAnalyzed: 128,
  llmCalls: 1,
  pushToVerdictSeconds: 3.4,
  health: {
    github: true,
    webhook: true,
    model: true,
    rateLimit: true,
  },
};

export const mockCoachRecord: CoachRecord = {
  fulfilled: 3,
  partly: 1,
  missed: 1,
};

export const mockRequirements: Requirement[] = [
  {
    id: 'req-sql',
    name: 'SQL',
    category: 'Persistence',
    status: 'not_shown',
    required: true,
    filesCount: 1,
    evidenceCount: 0,
    evidenceId: 'evi-sql',
    candidateId: 'cand-sql',
    description: 'Relational SQLite ACID schema migrations and parameterized query access.',
  },
  {
    id: 'req-rest',
    name: 'REST API',
    category: 'Architecture',
    status: 'proven',
    required: true,
    filesCount: 3,
    evidenceCount: 2,
    evidenceId: 'evi-rest',
    description: 'FastAPI routing with typed request validation and response models.',
  },
  {
    id: 'req-auth',
    name: 'Authentication',
    category: 'Security',
    status: 'proven',
    required: true,
    filesCount: 2,
    evidenceCount: 1,
    evidenceId: 'evi-auth',
    description: 'HMAC signature verification and scoped bearer token sessions.',
  },
  {
    id: 'req-test',
    name: 'Testing',
    category: 'Verification',
    status: 'basic',
    required: false,
    filesCount: 2,
    evidenceCount: 1,
    evidenceId: 'evi-test',
    candidateId: 'cand-test',
    description: 'Pytest test fixtures and assertions validating invariant contracts.',
  },
  {
    id: 'req-docker',
    name: 'Docker',
    category: 'Infra',
    status: 'basic',
    required: false,
    filesCount: 1,
    evidenceCount: 1,
    evidenceId: 'evi-docker',
    description: 'Multi-stage rootless container build with alpine minimal base.',
  },
  {
    id: 'req-async',
    name: 'Async I/O',
    category: 'Architecture',
    status: 'unclear',
    required: false,
    filesCount: 2,
    evidenceCount: 0,
    evidenceId: 'evi-async',
    description: 'Event loop concurrency and non-blocking IO operations.',
  },
  {
    id: 'req-cache',
    name: 'Caching',
    category: 'Persistence',
    status: 'not_shown',
    required: false,
    filesCount: 1,
    evidenceCount: 0,
    evidenceId: 'evi-cache',
    description: 'In-memory Redis TTL caching with stamped eviction.',
  },
];

export const mockAssessments: Assessment[] = mockRequirements.map((req) => ({
  id: `asmt-${req.id}`,
  requirementId: req.id,
  requirementName: req.name,
  status: req.status,
  confidence: req.status === 'proven' ? 0.98 : req.status === 'basic' ? 0.65 : 0.2,
  summary: `Requirement ${req.name} verified against repository commits.`,
  lastCommitHash: '9f3c2ab',
  timestamp: '2026-10-16 14:02:18 UTC',
}));

export const mockEvidenceItems: Record<string, Evidence> = {
  'evi-rest': {
    id: 'evi-rest',
    requirementId: 'req-rest',
    title: 'REST API',
    sublabel: 'Requirement 2 of 7 · Mandatory core skill',
    serial: 'REC-0042',
    timestamp: '2026-10-16 14:02:18 UTC',
    status: 'proven',
    fileName: 'api/routes/orders.py',
    code: `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
router = APIRouter(prefix="/orders", tags=["orders"])
# Deterministic order creation pipeline
@router.post("/", status_code=201, response_model=OrderReceipt)
async def create_order(payload: OrderPayload, db: Session = Depends()):
    validated = await validator.verify_items(payload.items)
    if not validated.is_ok:
        raise HTTPException(status_code=400, detail="Invalid SKU")
    receipt = await orderService.process_transaction(payload)
    return receipt`,
    highlightLines: [5, 6],
    highlightType: 'emerald',
    chips: ['Mounted route', 'Returns values', 'Tested in suite'],
    auditTrail: {
      commitHash: '9f3c2ab',
      committer: 'Rohan',
      verifiedAssertions: 4,
      merkleRoot: '0x981A7b91c04f981023d8...4f02',
    },
  },
  'evi-auth': {
    id: 'evi-auth',
    requirementId: 'req-auth',
    title: 'Authentication',
    sublabel: 'Requirement 3 of 7 · Security enforcement',
    serial: 'REC-0043',
    timestamp: '2026-10-16 14:02:18 UTC',
    status: 'proven',
    fileName: 'security/jwt.py',
    code: `import hmac
import hashlib
from fastapi import Header, HTTPException

def verify_bearer_signature(token: str, secret: bytes) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Malformed JWT")
    expected = hmac.new(secret, parts[0].encode() + b"." + parts[1].encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, parts[2]):
        raise HTTPException(status_code=403, detail="Signature invalid")
    return {"sub": "verified_session"}`,
    highlightLines: [9, 10],
    highlightType: 'emerald',
    chips: ['HMAC verified', 'Timing safe compare', '403 on tampering'],
    auditTrail: {
      commitHash: '9f3c2ab',
      committer: 'Rohan',
      verifiedAssertions: 3,
      merkleRoot: '0x4A110fa981b2...7712',
    },
  },
  'evi-sql': {
    id: 'evi-sql',
    requirementId: 'req-sql',
    title: 'SQL Persistence',
    sublabel: 'Requirement 1 of 7 · Persistence layer',
    serial: 'REC-0044',
    timestamp: '2026-10-16 14:02:18 UTC',
    status: 'not_shown',
    fileName: 'db/queries.py',
    code: `# Awaiting schema migration commit
# Target: CREATE TABLE orders (id TEXT PRIMARY KEY, amount REAL);
# Target: SELECT * FROM orders WHERE id = :order_id;`,
    highlightLines: [2],
    highlightType: 'red',
    chips: ['Awaiting migration', 'Zero call sites'],
    auditTrail: {
      commitHash: '9f3c2ab',
      committer: 'Rohan',
      verifiedAssertions: 0,
      merkleRoot: '0x00000000...0000',
    },
  },
};

export const mockRejectedCandidates: Record<string, RejectedCandidate> = {
  'cand-sql': {
    id: 'cand-sql',
    requirementId: 'req-sql',
    title: 'Automated Testing Invariant',
    serial: 'AUDIT-REJECT-0091',
    timestamp: '2026-10-16 14:02:18 UTC',
    reason: 'Test function contains no assertions. Refused from coverage count.',
    fileName: 'tests/test_orders.py',
    code: `def test_orders_endpoint_status():
    response = client.get("/orders")
    # Missing assertion! Code claims test coverage but verifies no invariants
    pass`,
    highlightLines: [3, 4],
    status: 'refused',
    missingInvariant: 'assert response.status_code == 200',
  },
};

export const mockSnapshots: Snapshot[] = [
  {
    id: 'snap-1',
    job_id: 'job-001',
    commitHash: 'e4a110f',
    commitMessage: 'Initial repo scaffold',
    timestamp: '3 hours ago',
    author: 'Rohan',
    assessedCount: 2,
    totalCount: 7,
    percentage: 28,
    files: [
      { id: 'f1', name: 'main.py', path: 'main.py', size: 120, status: 'proven' },
      { id: 'f2', name: 'routes.py', path: 'api/routes.py', size: 210, status: 'basic' },
      { id: 'f3', name: 'db.py', path: 'db/schema.py', size: 80, status: 'not_shown' },
    ],
  },
  {
    id: 'snap-2',
    job_id: 'job-002',
    commitHash: '7c8ca81',
    commitMessage: 'Add auth bearer verification',
    timestamp: '1 hour ago',
    author: 'Rohan',
    assessedCount: 3,
    totalCount: 7,
    percentage: 42,
    files: [
      { id: 'f1', name: 'main.py', path: 'main.py', size: 140, status: 'proven' },
      { id: 'f2', name: 'orders.py', path: 'api/routes/orders.py', size: 380, status: 'proven' },
      { id: 'f3', name: 'jwt.py', path: 'security/jwt.py', size: 240, status: 'proven' },
      { id: 'f4', name: 'test_orders.py', path: 'tests/test_orders.py', size: 90, status: 'basic' },
    ],
  },
  {
    id: 'snap-3',
    job_id: 'job-003',
    commitHash: '9f3c2ab',
    commitMessage: 'Orders route and schema migration stubs',
    timestamp: '12 seconds ago',
    author: 'Rohan',
    assessedCount: 4,
    totalCount: 7,
    percentage: 58,
    files: [
      { id: 'f1', name: 'orders.py', path: 'api/routes/orders.py', size: 420, status: 'proven', isPulsing: true },
      { id: 'f2', name: 'auth/jwt.py', path: 'security/jwt.py', size: 280, status: 'proven' },
      { id: 'f3', name: 'db/queries.py', path: 'db/queries.py', size: 190, status: 'not_shown' },
      { id: 'f4', name: 'cache.py', path: 'lib/cache.py', size: 160, status: 'unclear' },
      { id: 'f5', name: 'parser.py', path: 'lib/parser.py', size: 260, status: 'proven' },
      { id: 'f6', name: 'storage.py', path: 'storage/fs.py', size: 310, status: 'not_shown' },
      { id: 'f7', name: 'queue.py', path: 'workers/queue.py', size: 180, status: 'basic' },
      { id: 'f8', name: 'ledger.py', path: 'audit/ledger.py', size: 340, status: 'proven' },
      { id: 'f9', name: 'hooks.py', path: 'events/hooks.py', size: 110, status: 'not_shown' },
    ],
  },
  {
    id: 'snap-4',
    job_id: 'job-004',
    commitHash: '3d81b4f',
    commitMessage: 'feat(sql): add SQLite query and non-empty assertion test',
    timestamp: 'Just now',
    author: 'Rohan',
    assessedCount: 5,
    totalCount: 7,
    percentage: 72,
    files: [
      { id: 'f1', name: 'orders.py', path: 'api/routes/orders.py', size: 450, status: 'proven' },
      { id: 'f2', name: 'auth/jwt.py', path: 'security/jwt.py', size: 280, status: 'proven' },
      { id: 'f3', name: 'db/queries.py', path: 'db/queries.py', size: 290, status: 'proven', isPulsing: true },
      { id: 'f4', name: 'cache.py', path: 'lib/cache.py', size: 160, status: 'unclear' },
      { id: 'f5', name: 'parser.py', path: 'lib/parser.py', size: 260, status: 'proven' },
      { id: 'f6', name: 'storage.py', path: 'storage/fs.py', size: 310, status: 'not_shown' },
      { id: 'f7', name: 'queue.py', path: 'workers/queue.py', size: 180, status: 'proven' },
      { id: 'f8', name: 'ledger.py', path: 'audit/ledger.py', size: 340, status: 'proven' },
      { id: 'f9', name: 'hooks.py', path: 'events/hooks.py', size: 110, status: 'proven' },
    ],
  },
];

export const mockContracts: Contract[] = [
  {
    id: 'ctr-001',
    title: 'Add SQLite query and assertion test',
    description: 'Establish SQLite persistence in db/queries.py with route linkage and assertion verification.',
    requirementTarget: 'SQL',
    pointsDelta: 14,
    diffEstimate: 'SMALL',
    timeEstimate: '25m',
    targetStatus: 'proven',
    status: 'pending',
    frozenScope: 'Testing harness (pytest v8.2), API boundary contracts',
    gitCommand: 'git checkout -b feat/sql-persistence',
    checklist: [
      {
        id: 'c1',
        label: 'SQLite schema migration written in db/queries.py',
        file: 'db/queries.py',
        satisfied: true,
        statusLabel: 'VERIFIED IN STAGE',
      },
      {
        id: 'c2',
        label: 'Query function called from active route in api/routes/orders.py',
        file: 'api/routes/orders.py',
        satisfied: false,
        statusLabel: 'AWAITING DIFF',
      },
      {
        id: 'c3',
        label: 'Test asserts non-empty query result in tests/test_orders.py',
        file: 'tests/test_orders.py',
        satisfied: false,
        statusLabel: 'AWAITING DIFF',
      },
    ],
  },
  {
    id: 'ctr-002',
    title: 'Cache TTL eviction invariant',
    description: 'Ensure cache entries expire within 300s window with deterministic clock fixture.',
    requirementTarget: 'Caching',
    pointsDelta: 8,
    diffEstimate: 'SMALL',
    timeEstimate: '20m',
    targetStatus: 'proven',
    status: 'pending',
    frozenScope: 'Redis client pool, retry strategy',
    gitCommand: 'git checkout -b feat/cache-invariants',
    checklist: [
      {
        id: 'c2-1',
        label: 'Redis client calls setex with integer TTL',
        file: 'lib/cache.py',
        satisfied: true,
        statusLabel: 'VERIFIED IN STAGE',
      },
      {
        id: 'c2-2',
        label: 'Test simulates clock jump beyond TTL',
        file: 'tests/test_cache.py',
        satisfied: false,
        statusLabel: 'AWAITING DIFF',
      },
    ],
  },
  {
    id: 'ctr-003',
    title: 'Multi-stage Docker hardening',
    description: 'Upgrades Docker requirement from Basic to Proven with non-root user and minimal image.',
    requirementTarget: 'Docker',
    pointsDelta: 6,
    diffEstimate: 'MEDIUM',
    timeEstimate: '40m',
    targetStatus: 'proven',
    status: 'pending',
    frozenScope: 'Base python:3.11-slim image',
    gitCommand: 'git checkout -b feat/docker-hardening',
    checklist: [
      {
        id: 'c3-1',
        label: 'USER appuser declared in Dockerfile',
        file: 'Dockerfile',
        satisfied: true,
        statusLabel: 'VERIFIED IN STAGE',
      },
      {
        id: 'c3-2',
        label: 'Container lint tool passes with zero warnings',
        file: 'hadolint.yaml',
        satisfied: false,
        statusLabel: 'AWAITING RUN',
      },
    ],
  },
  {
    id: 'ctr-004',
    title: 'CI Test Matrix on Pull Request',
    description: 'Validates automated GitHub actions runner parity across Python 3.10 and 3.11.',
    requirementTarget: 'Testing',
    pointsDelta: 4,
    diffEstimate: 'SMALL',
    timeEstimate: '15m',
    targetStatus: 'proven',
    status: 'pending',
    frozenScope: 'actions/checkout@v4',
    gitCommand: 'git checkout -b feat/ci-matrix',
    checklist: [
      {
        id: 'c4-1',
        label: 'matrix strategy includes [3.10, 3.11]',
        file: '.github/workflows/test.yml',
        satisfied: true,
        statusLabel: 'VERIFIED IN STAGE',
      },
    ],
  },
];

// In-memory event stream subscribers
type EventCallback = (event: ProofStackEvent) => void;
const eventSubscribers = new Set<EventCallback>();

export function emitEvent(event: ProofStackEvent) {
  eventSubscribers.forEach((cb) => cb(event));
}

// Scripted Push Sequence Trigger (useful for demo & live tests)
export function triggerScriptedPush() {
  // Emit push event
  emitEvent({
    id: `evt-${Date.now()}`,
    type: 'push',
    timestamp: 'Just now',
    message: 'Commit 3d81b4f pushed by Rohan: feat(sql) Add SQLite query & test assertion',
    commitHash: '3d81b4f',
    affectedRequirementId: 'req-sql',
    affectedFileId: 'f3',
    newPercentage: 72,
    newStatus: 'proven',
  });

  // Short delay followed by stamp flip
  setTimeout(() => {
    emitEvent({
      id: `evt-flip-${Date.now()}`,
      type: 'stamp_flip',
      timestamp: 'Just now',
      message: 'Requirement SQL flipped from NOT SHOWN IN SCOPE to PROVEN (+14 PTS)',
      affectedRequirementId: 'req-sql',
      newStatus: 'proven',
      newPercentage: 72,
    });
  }, 600);
}

// ============================================================================
// TYPED API FUNCTIONS
// ============================================================================

export async function getAssessments(): Promise<Assessment[]> {
  if (USE_MOCKS) {
    return Promise.resolve([...mockAssessments]);
  }
  const res = await fetch(`${API_BASE_URL}/assessments`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch assessments`);
  return res.json();
}

export async function getEvidence(id: string): Promise<Evidence | RejectedCandidate> {
  if (USE_MOCKS) {
    if (mockEvidenceItems[id]) return Promise.resolve(mockEvidenceItems[id]);
    if (mockRejectedCandidates[id]) return Promise.resolve(mockRejectedCandidates[id]);
    // Fallback to first evidence item
    return Promise.resolve(mockEvidenceItems['evi-rest']);
  }
  const res = await fetch(`${API_BASE_URL}/evidence/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch evidence ${id}`);
  return res.json();
}

export async function getCoverage(jobId?: string): Promise<{
  percentage: number;
  assessedCount: number;
  totalCount: number;
  targetPercentage: number;
}> {
  if (USE_MOCKS) {
    const snap = mockSnapshots.find((s) => s.job_id === jobId) || mockSnapshots[2];
    return Promise.resolve({
      percentage: snap.percentage,
      assessedCount: snap.assessedCount,
      totalCount: snap.totalCount,
      targetPercentage: 78,
    });
  }
  const res = await fetch(`${API_BASE_URL}/coverage/${jobId || 'latest'}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch coverage`);
  return res.json();
}

export async function getContracts(): Promise<Contract[]> {
  if (USE_MOCKS) {
    return Promise.resolve([...mockContracts]);
  }
  const res = await fetch(`${API_BASE_URL}/contracts`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch contracts`);
  return res.json();
}

export async function postDryRun(contractId: string): Promise<{
  beforePercentage: number;
  afterPercentage: number;
  checklistResults: Record<string, boolean>;
  status: 'fulfilled' | 'partly' | 'not_fulfilled';
}> {
  if (USE_MOCKS) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          beforePercentage: 58,
          afterPercentage: 72,
          checklistResults: {
            c1: true,
            c2: true,
            c3: true,
          },
          status: 'fulfilled',
        });
      }, 400);
    });
  }
  const res = await fetch(`${API_BASE_URL}/dry-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Dry run failed`);
  return res.json();
}

export async function getProofMap(jobId?: string): Promise<{
  files: any[];
  activeSnapshot: Snapshot;
  snapshots: Snapshot[];
}> {
  if (USE_MOCKS) {
    const active = mockSnapshots.find((s) => s.job_id === jobId) || mockSnapshots[2];
    return Promise.resolve({
      files: active.files,
      activeSnapshot: active,
      snapshots: mockSnapshots,
    });
  }
  const res = await fetch(`${API_BASE_URL}/proofmap/${jobId || 'latest'}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch proofmap`);
  return res.json();
}

export function getEventsStream(onEvent: (event: ProofStackEvent) => void): () => void {
  if (USE_MOCKS) {
    eventSubscribers.add(onEvent);
    return () => {
      eventSubscribers.delete(onEvent);
    };
  }

  // Real EventSource fallback
  const eventSource = new EventSource(`${API_BASE_URL}/events/stream`);
  eventSource.onmessage = (e) => {
    try {
      const parsed = JSON.parse(e.data);
      onEvent(parsed);
    } catch (err) {
      console.error('Failed to parse SSE event data', err);
    }
  };
  return () => {
    eventSource.close();
  };
}

export async function postCheckNow(): Promise<{ status: string; jobId: string }> {
  if (USE_MOCKS) {
    return Promise.resolve({ status: 'queued', jobId: 'job-004' });
  }
  const res = await fetch(`${API_BASE_URL}/check-now`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: check-now failed`);
  return res.json();
}

export async function postCorrections(correction: {
  requirementId: string;
  feedback: string;
}): Promise<{ success: boolean }> {
  if (USE_MOCKS) {
    return Promise.resolve({ success: true });
  }
  const res = await fetch(`${API_BASE_URL}/corrections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(correction),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to post corrections`);
  return res.json();
}

// ---------------------------------------------------------------------------
// ADVERSARIAL SUITE & PROTOCOL BREAK-ME
// ---------------------------------------------------------------------------

export const mockAttackVectors: AttackVector[] = [
  {
    id: 'vec-1',
    name: 'Empty Test Assertion Bypass',
    category: 'Test Invariant',
    targetFile: 'tests/test_auth_stub.py',
    payloadPreview: 'def test_auth_token_bypass():\n    # Test passes with zero assertions\n    pass',
    injectionType: 'ZERO_ASSERTION',
    status: 'refused',
    guardReason: 'Contains no test assertions; execution passes unconditionally. Refused by signature guard.',
    timestamp: '2025-05-18T10:14:02Z',
    signatureHash: 'sig:0x49a2...7c19',
    lines: [1, 2, 3],
  },
  {
    id: 'vec-2',
    name: 'Docstring Capability Stuffing',
    category: 'Interface Spoofing',
    targetFile: 'src/core/router.py',
    payloadPreview: 'class DistributedRouter:\n    """Implements raft-consensus distributed failover with sub-millisecond lease."""\n    def route(self): return None',
    injectionType: 'DOCSTRING_STUFFING',
    status: 'refused',
    guardReason: 'Docstring declares capability without executable verification or test suite backing.',
    timestamp: '2025-05-18T10:14:08Z',
    signatureHash: 'sig:0x7b11...fa02',
    lines: [1, 2, 3],
  },
  {
    id: 'vec-3',
    name: 'Mismatched Method Signature',
    category: 'Type Interface',
    targetFile: 'src/auth/token.go',
    payloadPreview: 'func ValidateToken(raw string) bool {\n    return true // signature altered from interface\n}',
    injectionType: 'SIGNATURE_MUTATION',
    status: 'refused',
    guardReason: 'Method signature hash differs from declared interface contract spec.',
    timestamp: '2025-05-18T10:14:15Z',
    signatureHash: 'sig:0x33e8...bb89',
    lines: [1, 2, 3],
  },
  {
    id: 'vec-4',
    name: 'Shadow Commit Timestamp Forgery',
    category: 'Provenance Tamper',
    targetFile: 'commits/9f3c2ab',
    payloadPreview: 'GIT_AUTHOR_DATE="2022-01-01T00:00:00Z"\nGIT_COMMITTER_DATE="2022-01-01T00:00:00Z"',
    injectionType: 'TIMESTAMP_BACKDATE',
    status: 'refused',
    guardReason: 'Commit timestamp retroactively altered; violates monotonic linear ratchet.',
    timestamp: '2025-05-18T10:14:22Z',
    signatureHash: 'sig:0x89dd...cc14',
    lines: [1, 2],
  },
  {
    id: 'vec-5',
    name: 'Circular Dependency Injection',
    category: 'Architecture Invariant',
    targetFile: 'src/middleware/chain.ts',
    payloadPreview: 'import { verifyAuth } from "./verifier";\nexport const chain = [verifyAuth];',
    injectionType: 'CIRCULAR_IMPORT',
    status: 'refused',
    guardReason: 'Dependency cycle detected in module execution graph.',
    timestamp: '2025-05-18T10:14:29Z',
    signatureHash: 'sig:0x12c4...e890',
    lines: [1, 2],
  },
  {
    id: 'vec-6',
    name: 'Mock Pass-Through Stub',
    category: 'Test Invariant',
    targetFile: 'tests/test_db_mock.py',
    payloadPreview: 'class MockConnectionPool:\n    def acquire(self): return "MOCK_OK"',
    injectionType: 'TRIVIAL_STUB',
    status: 'refused',
    guardReason: 'Mock returns hardcoded constant without state mutation or connection lifecycle validation.',
    timestamp: '2025-05-18T10:14:36Z',
    signatureHash: 'sig:0x66fa...003a',
    lines: [1, 2],
  },
  {
    id: 'vec-7',
    name: 'Silent Exception Suppression',
    category: 'Reliability Invariant',
    targetFile: 'src/net/transport.py',
    payloadPreview: 'try:\n    socket.send(payload)\nexcept Exception:\n    pass # silent catch',
    injectionType: 'BARE_EXCEPT',
    status: 'refused',
    guardReason: 'Bare exception block suppresses transport disconnect invariant and hides packet loss.',
    timestamp: '2025-05-18T10:14:41Z',
    signatureHash: 'sig:0x90ea...2311',
    lines: [1, 2, 3, 4],
  },
  {
    id: 'vec-8',
    name: 'Trivial Assert True Injection',
    category: 'Test Invariant',
    targetFile: 'tests/test_token_assert.py',
    payloadPreview: 'def test_session_lifecycle():\n    assert True, "Always valid"',
    injectionType: 'LITERAL_ASSERTION',
    status: 'refused',
    guardReason: 'Assert statement verifies boolean literal true rather than runtime execution state.',
    timestamp: '2025-05-18T10:14:49Z',
    signatureHash: 'sig:0x41ab...7892',
    lines: [1, 2],
  },
  {
    id: 'vec-9',
    name: 'Stale Binary Artifact Injection',
    category: 'Provenance Tamper',
    targetFile: 'bin/dist_cache.so',
    payloadPreview: 'BINARY_PAYLOAD_UNVERIFIED_HASH=0xdeadbeef...',
    injectionType: 'BINARY_MISMATCH',
    status: 'refused',
    guardReason: 'Binary checksum does not reproduce from audited source tree revision.',
    timestamp: '2025-05-18T10:14:55Z',
    signatureHash: 'sig:0xbeef...dead',
    lines: [1],
  },
  {
    id: 'vec-10',
    name: 'Environment Variable Secret Spoof',
    category: 'Security Invariant',
    targetFile: 'config/env.production',
    payloadPreview: 'SIGNING_SECRET="dummy_secret_for_tests"',
    injectionType: 'INSECURE_SECRET_STUB',
    status: 'refused',
    guardReason: 'Secret placeholder loaded into test runtime without proof of key derivation.',
    timestamp: '2025-05-18T10:15:02Z',
    signatureHash: 'sig:0x1111...9999',
    lines: [1],
  },
];

export async function getAdversarialSuite(): Promise<AdversarialSuiteData> {
  if (USE_MOCKS) {
    return Promise.resolve({
      attacksSent: 10,
      upgradesGranted: 0,
      guardReasonsLogged: 10,
      vectors: mockAttackVectors,
      protocol: 'BREAK-ME',
      spec: 'ISO-27001-ZKP',
    });
  }
  const res = await fetch(`${API_BASE_URL}/adversarial`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch adversarial suite`);
  return res.json();
}

export async function runAdversarialAttacks(): Promise<{
  results: AttackVector[];
  upgradesGranted: number;
  guardReasonsLogged: number;
}> {
  if (USE_MOCKS) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          results: mockAttackVectors,
          upgradesGranted: 0,
          guardReasonsLogged: 10,
        });
      }, 600);
    });
  }
  const res = await fetch(`${API_BASE_URL}/adversarial/run`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run adversarial attacks`);
  return res.json();
}

// ---------------------------------------------------------------------------
// RESUME ATTESTATION & MERKLE LEDGER
// ---------------------------------------------------------------------------

export const mockResumeAttestation: ResumeAttestationData = {
  candidate: {
    name: 'ROHAN VERMA',
    title: 'Backend & Distributed Systems Engineer',
    email: 'rohan@northwind-labs.dev',
    github: 'github.com/rohan',
    location: 'San Francisco, CA',
    clearance: 'Level-0 Codebase Verified',
    summary:
      'Performance-focused distributed systems engineer specializing in high-throughput RPC interfaces, automated formal testing invariants, and zero-trust schema pipelines. Backed by verified signed commits proving concurrency constraints and fault-tolerant transaction delivery.',
  },
  auditIdentifier: '#9f3c2ab',
  merkleRoot: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  commitHash: '9f3c2ab',
  skills: [
    {
      category: '01. Core Languages',
      items: [
        { name: 'Python', status: 'proven', footnoteRef: 1 },
        { name: 'Go / Golang', status: 'proven', footnoteRef: 4 },
      ],
    },
    {
      category: '02. Backend & APIs',
      items: [
        { name: 'REST API Architecture', status: 'proven', footnoteRef: 1 },
        { name: 'Automated Regression Testing', status: 'proven', footnoteRef: 2 },
      ],
    },
    {
      category: '03. Systems & Infra',
      items: [
        { name: 'Docker Containerization', status: 'basic', footnoteRef: 3 },
      ],
    },
  ],
  experience: [
    {
      role: 'Backend Engineering Intern',
      company: 'Northwind Labs',
      period: 'Jan 2025 — Present',
      bullets: [
        {
          text: 'Architected high-throughput transaction router handling 24,000 req/sec with monotonic state guarantees.',
          commitSha: '9f3c2ab',
          isAttested: true,
        },
        {
          text: 'Implemented zero-downtime token bucket rate limiter validated across concurrent test runs.',
          commitSha: '8e41c0d',
          isAttested: true,
        },
        {
          text: 'Containerized microservice cluster with minimal alpine images and static binary builds.',
          commitSha: '7a12b9c',
          isAttested: true,
        },
      ],
    },
  ],
};

export async function getResumeAttestation(): Promise<ResumeAttestationData> {
  if (USE_MOCKS) {
    return Promise.resolve(mockResumeAttestation);
  }
  const res = await fetch(`${API_BASE_URL}/resume/attestation`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch resume attestation`);
  return res.json();
}

// ---------------------------------------------------------------------------
// LEDGER VERIFICATION CHAIN BLOCKS
// ---------------------------------------------------------------------------

export const mockLedgerBlocks: LedgerBlock[] = [
  {
    blockHeight: 1,
    commitHash: '7a12b9c',
    previousHash: '0000000000000000000000000000000000000000',
    timestamp: '2025-05-14T09:12:00Z',
    invariantsProven: 2,
    author: 'rohan <rohan@northwind-labs.dev>',
    merkleRoot: 'sha256:1a82bc...0041',
  },
  {
    blockHeight: 2,
    commitHash: '8e41c0d',
    previousHash: 'sha256:1a82bc...0041',
    timestamp: '2025-05-16T14:30:00Z',
    invariantsProven: 4,
    author: 'rohan <rohan@northwind-labs.dev>',
    merkleRoot: 'sha256:39fa01...88ab',
  },
  {
    blockHeight: 3,
    commitHash: '9f3c2ab',
    previousHash: 'sha256:39fa01...88ab',
    timestamp: '2025-05-18T10:42:01Z',
    invariantsProven: 7,
    author: 'rohan <rohan@northwind-labs.dev>',
    merkleRoot: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
];

export async function getLedgerBlocks(): Promise<LedgerBlock[]> {
  if (USE_MOCKS) {
    return Promise.resolve([...mockLedgerBlocks]);
  }
  const res = await fetch(`${API_BASE_URL}/ledger/blocks`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch ledger blocks`);
  return res.json();
}

// ---------------------------------------------------------------------------
// PUBLIC REPO SCANNER
// ---------------------------------------------------------------------------

export async function scanPublicRepo(username: string): Promise<RepoScanResult> {
  const cleanUser = username.trim().replace(/^@/, '') || 'octocat';
  if (USE_MOCKS) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          targetUser: cleanUser,
          targetRepo: `${cleanUser}/northwind-service`,
          auditReceiptId: '#0492-ZK',
          timestamp: new Date().toISOString(),
          coveragePct: 58,
          assessedCount: 7,
          totalCount: 12,
          organization: 'Northwind Labs',
          breakdown: {
            proven: 3,
            basic: 1,
            notShown: 1,
            unclear: 2,
          },
          verifiedFiles: [
            'src/core/router.py',
            'tests/test_router.py',
            'src/auth/token.go',
          ],
          isAttested: true,
        });
      }, 700);
    });
  }
  const res = await fetch(`${API_BASE_URL}/scanner/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: cleanUser }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to scan repo`);
  return res.json();
}

// ---------------------------------------------------------------------------
// AUTHENTICATION & SESSION MANAGEMENT
// ---------------------------------------------------------------------------

import { UserSession } from '../types/api';

export type MockAuthPath = 'success' | 'declined' | 'rate_limited';

let currentMockAuthPath: MockAuthPath = 'success';
let currentMockSession: UserSession | null = null;


export function getMockAuthPath(): MockAuthPath {
  return currentMockAuthPath;
}

export function setMockAuthPath(path: MockAuthPath): void {
  currentMockAuthPath = path;
}

export async function getCurrentUser(): Promise<UserSession | null> {
  if (USE_MOCKS) {
    return Promise.resolve(currentMockSession);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.status === 401 || res.status === 403) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch session`);
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function setMockSignedIn(signedIn: boolean): Promise<void> {
  if (signedIn) {
    currentMockSession = {
      id: 'usr-0042',
      login: 'rohan-labs',
      name: 'Rohan Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      publicRepos: 18,
      scopes: ['read:user', 'public_repo'],
      sessionStartedAt: new Date().toISOString(),
    };
  } else {
    currentMockSession = null;
  }
}

export async function logoutUser(): Promise<void> {
  if (USE_MOCKS) {
    currentMockSession = null;
    return Promise.resolve();
  }
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

