// REALISTIC SEED DATA (Used in tests and offline mock mode)
// ============================================================================
export const mockSystemMetrics = {
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
export const mockCoachRecord = {
    fulfilled: 3,
    partly: 1,
    missed: 1,
};
export const mockRequirements = [
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
        description: 'Multi-stage container builds with non-root runtime users and pinned shas.',
    },
    {
        id: 'req-grpc',
        name: 'gRPC / Protobuf',
        category: 'Architecture',
        status: 'not_shown',
        required: false,
        filesCount: 0,
        evidenceCount: 0,
        evidenceId: 'evi-grpc',
        candidateId: 'cand-grpc',
        description: 'Binary protocol buffer RPC schemas with generated stub clients.',
    },
    {
        id: 'req-ci',
        name: 'CI/CD Pipelines',
        category: 'DevOps',
        status: 'unclear',
        required: false,
        filesCount: 1,
        evidenceCount: 0,
        evidenceId: 'evi-ci',
        description: 'GitHub Actions workflow configurations running automated test matrices.',
    },
];
export const mockAssessments = [
    {
        id: 'req-sql',
        requirementId: 'req-sql',
        requirementName: 'SQL',
        status: 'not_shown',
        confidence: 0.95,
        summary: 'No database queries or schema migrations detected in repository tree.',
        lastCommitHash: '9f3c2ab',
        timestamp: '2 hours ago',
    },
    {
        id: 'req-rest',
        requirementId: 'req-rest',
        requirementName: 'REST API',
        status: 'proven',
        confidence: 0.98,
        summary: '4 route decorators found across app/api/ endpoints with schema validation.',
        lastCommitHash: '9f3c2ab',
        timestamp: '2 hours ago',
    },
    {
        id: 'req-auth',
        requirementId: 'req-auth',
        requirementName: 'Authentication',
        status: 'proven',
        confidence: 0.92,
        summary: 'HMAC-SHA256 signature verification middleware and timing-safe comparisons.',
        lastCommitHash: '8e41c0d',
        timestamp: '4 hours ago',
    },
    {
        id: 'req-test',
        requirementId: 'req-test',
        requirementName: 'Testing',
        status: 'basic',
        confidence: 0.76,
        summary: '15 unit tests found; 2 hollow assertions rejected without exercising logic.',
        lastCommitHash: '7a12b9c',
        timestamp: 'Yesterday',
    },
    {
        id: 'req-docker',
        requirementId: 'req-docker',
        requirementName: 'Docker',
        status: 'basic',
        confidence: 0.88,
        summary: 'Dockerfile with multi-stage build present; missing non-root security context.',
        lastCommitHash: '6f09e1a',
        timestamp: '3 days ago',
    },
    {
        id: 'req-grpc',
        requirementId: 'req-grpc',
        requirementName: 'gRPC / Protobuf',
        status: 'not_shown',
        confidence: 0.99,
        summary: 'No proto definitions or gRPC stubs found in repository scope.',
        lastCommitHash: '9f3c2ab',
        timestamp: '2 hours ago',
    },
    {
        id: 'req-ci',
        requirementId: 'req-ci',
        requirementName: 'CI/CD Pipelines',
        status: 'unclear',
        confidence: 0.45,
        summary: '.github/workflows/test.yml references third-party action without pinned hash.',
        lastCommitHash: '5e81d2f',
        timestamp: '4 days ago',
    },
];
export const mockEvidenceItems = {
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
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_session)
):
    """Creates a validated engineering evidence item with signed hash."""
    return await order_service.create(payload, user=current_user, session=db)`,
        highlightLines: [4, 5, 8, 9, 10, 11, 12, 13],
        highlightType: 'emerald',
        chips: ['Mounted route', 'Returns values', 'Tested in suite'],
        auditTrail: {
            commitHash: '9f3c2ab',
            committer: 'rohan <rohan@northwind-labs.dev>',
            verifiedAssertions: 4,
            merkleRoot: 'sha256:4a8b...1f09',
        },
    },
    'evi-auth': {
        id: 'evi-auth',
        requirementId: 'req-auth',
        title: 'HMAC-SHA256 WEBHOOK SIGNATURE VERIFICATION',
        sublabel: 'app/core/security.py (L18–34)',
        serial: 'REC-0019-AUTH-PROVEN',
        timestamp: '4 hours ago · Commit 8e41c0d',
        status: 'proven',
        fileName: 'app/core/security.py',
        code: `def verify_github_signature(payload: bytes, signature_header: str, secret: str) -> bool:
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature_header)`,
        highlightLines: [18, 19, 20, 21, 22],
        highlightType: 'emerald',
        chips: ['HMAC SHA-256', 'Timing Safe', 'Constant Time', 'Webhook Guard'],
        auditTrail: {
            commitHash: '8e41c0d',
            committer: 'Rohan Sharma <rohan@northwind-labs.dev>',
            verifiedAssertions: 3,
            merkleRoot: 'sha256:39fa01...8ab',
        },
    },
    'evi-test': {
        id: 'evi-test',
        requirementId: 'req-test',
        title: 'PYTEST FIXTURES & INVARIANT ASSERTIONS',
        sublabel: 'tests/test_invariants.py (L12–28)',
        serial: 'REC-0033-TEST-BASIC',
        timestamp: 'Yesterday · Commit 7a12b9c',
        status: 'basic',
        fileName: 'tests/test_invariants.py',
        code: `@pytest.mark.asyncio
async def test_auth_replay_deduplication(client, test_db):
    event_id = str(uuid.uuid4())
    resp1 = await client.post("/webhooks/github", headers={"X-GitHub-Delivery": event_id})
    assert resp1.status_code == 200
    resp2 = await client.post("/webhooks/github", headers={"X-GitHub-Delivery": event_id})
    assert resp2.status_code == 409`,
        highlightLines: [12, 13, 14, 15, 16, 17, 18],
        highlightType: 'emerald',
        chips: ['Pytest Asyncio', 'Replay Attack Guard', 'HTTP 409 Conflict'],
        auditTrail: {
            commitHash: '7a12b9c',
            committer: 'Rohan Sharma <rohan@northwind-labs.dev>',
            verifiedAssertions: 2,
            merkleRoot: 'sha256:1a82bc...041',
        },
    },
    'evi-docker': {
        id: 'evi-docker',
        requirementId: 'req-docker',
        title: 'MULTI-STAGE CONTAINER BUILD',
        sublabel: 'Dockerfile (L1–24)',
        serial: 'REC-0012-DOCKER-BASIC',
        timestamp: '3 days ago · Commit 6f09e1a',
        status: 'basic',
        fileName: 'Dockerfile',
        code: `FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim as runner
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
        highlightLines: [1, 2, 6, 7, 10, 11],
        highlightType: 'emerald',
        chips: ['Multi-Stage', 'Minimal Image', 'Uvicorn Entrypoint'],
        auditTrail: {
            commitHash: '6f09e1a',
            committer: 'Rohan Sharma <rohan@northwind-labs.dev>',
            verifiedAssertions: 1,
            merkleRoot: 'sha256:09fe82...91b',
        },
    },
};
export const mockRejectedCandidates = {
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
    'cand-test': {
        id: 'cand-test',
        requirementId: 'req-test',
        title: 'HOLLOW ASSERTION REFUSED',
        serial: 'REJ-0044-TRIVIAL-TEST',
        timestamp: 'Audit 9f3c2ab',
        reason: 'Test contains only `assert True` without calling application code or exercising invariants.',
        fileName: 'tests/test_dummy.py',
        code: `def test_service_health():
    # Placeholder test to pass CI
    assert True`,
        highlightLines: [3],
        status: 'hollow',
        missingInvariant: 'Contains zero invocations of application functions; trivial constant assertion.',
    },
    'cand-grpc': {
        id: 'cand-grpc',
        requirementId: 'req-grpc',
        title: 'UNSUPPORTED SYNTHETIC STUB',
        serial: 'REJ-0014-UNWIRED-STUB',
        timestamp: 'Audit 9f3c2ab',
        reason: 'Generated proto files present in vendor/ but never imported or initialized in runtime entrypoints.',
        fileName: 'vendor/proto/service.proto',
        code: `syntax = "proto3";
package northwind.rpc;

service NodeService {
  rpc Ping (PingRequest) returns (PingResponse);
}`,
        highlightLines: [4, 5],
        status: 'refused',
        missingInvariant: 'Unreachable in AST call graph; excluded from active skill evidence scope.',
    },
};
export const mockContracts = [
    {
        id: 'ctr-001',
        title: 'SQL Database Persistence with Migration',
        description: 'Implements SQLite repository pattern with parameterized query access and schema migration.',
        requirementTarget: 'SQL',
        pointsDelta: 14,
        diffEstimate: 'MEDIUM',
        timeEstimate: '30m',
        targetStatus: 'proven',
        status: 'pending',
        frozenScope: 'app/api/endpoints.py',
        gitCommand: 'git checkout -b feat/sqlite-persistence',
        checklist: [
            {
                id: 'c1-1',
                label: 'Parameterized query handles single quotes without syntax errors',
                file: 'backend/db/session.py',
                satisfied: false,
                statusLabel: 'AWAITING RUN',
            },
            {
                id: 'c1-2',
                label: 'Migration file commits schema to WAL journal',
                file: 'backend/models/models.py',
                satisfied: false,
                statusLabel: 'AWAITING RUN',
            },
            {
                id: 'c1-3',
                label: 'Integration test exercises rollback under deadlock simulation',
                file: 'backend/tests/test_db.py',
                satisfied: false,
                statusLabel: 'AWAITING RUN',
            },
        ],
    },
    {
        id: 'ctr-002',
        title: 'Strict Invariant Test Suite on Webhook Replay',
        description: 'Guarantees idempotency of webhook receiver by returning HTTP 409 on duplicate delivery IDs.',
        requirementTarget: 'Testing',
        pointsDelta: 8,
        diffEstimate: 'SMALL',
        timeEstimate: '20m',
        targetStatus: 'proven',
        status: 'pending',
        frozenScope: 'app/core/security.py',
        gitCommand: 'git checkout -b feat/webhook-replay-guard',
        checklist: [
            {
                id: 'c2-1',
                label: 'Redis/SQLite key lock rejects identical delivery UUID',
                file: 'backend/services/webhook_service.py',
                satisfied: false,
                statusLabel: 'AWAITING RUN',
            },
            {
                id: 'c2-2',
                label: 'Unit test simulates 5 concurrent replay deliveries',
                file: 'backend/tests/test_security_ssrf_webhook.py',
                satisfied: true,
                statusLabel: 'VERIFIED IN STAGE',
            },
        ],
    },
    {
        id: 'ctr-003',
        title: 'Non-Root Container Hardening',
        description: 'Hardens Dockerfile by executing the application process under an unprivileged user.',
        requirementTarget: 'Docker',
        pointsDelta: 6,
        diffEstimate: 'SMALL',
        timeEstimate: '10m',
        targetStatus: 'proven',
        status: 'pending',
        frozenScope: 'backend/main.py',
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
];
export const mockSnapshots = [
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
export const mockAttackVectors = [
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
export const mockResumeAttestation = {
    candidate: {
        name: 'ROHAN VERMA',
        title: 'Backend & Distributed Systems Engineer',
        email: 'rohan@northwind-labs.dev',
        github: 'github.com/rohan',
        location: 'San Francisco, CA',
        clearance: 'Level-0 Codebase Verified',
        summary: 'Performance-focused distributed systems engineer specializing in high-throughput RPC interfaces, automated formal testing invariants, and zero-trust schema pipelines. Backed by verified signed commits proving concurrency constraints and fault-tolerant transaction delivery.',
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
export const mockLedgerBlocks = [
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
const eventSubscribers = new Set();
export function emitEvent(event) {
    eventSubscribers.forEach((cb) => cb(event));
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ps-event', { detail: event }));
    }
}
export async function triggerScriptedPush() {
    const pushEvent = {
        id: `evt-${Date.now()}`,
        type: 'push',
        timestamp: 'Just now',
        message: 'Commit 3d81b4f pushed by Rohan: feat(sql) Add SQLite query & test assertion',
        commitHash: '3d81b4f',
        affectedRequirementId: 'req-sql',
        affectedFileId: 'f3',
        newPercentage: 72,
        newStatus: 'proven',
    };
    emitEvent(pushEvent);
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
let currentMockAuthPath = 'success';
let currentMockSession = null;
export function getMockAuthPath() {
    return currentMockAuthPath;
}
export function setMockAuthPath(path) {
    currentMockAuthPath = path;
}
export async function setMockSignedIn(signedIn) {
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
    }
    else {
        currentMockSession = null;
    }
}
export function getMockSession() {
    return currentMockSession;
}
