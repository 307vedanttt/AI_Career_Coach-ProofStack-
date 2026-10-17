import { http, HttpResponse } from 'msw';

export const mockBackendMe = {
  id: 'usr-0042',
  login: 'rohan-labs',
  name: 'Rohan Sharma',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  public_repos: 18,
  scopes: ['read:user', 'public_repo'],
  session_started_at: '2026-10-17T00:00:00Z',
};

export const mockBackendAssessments = {
  id: 'req-sql',
  requirement_id: 'req-sql',
  requirement_name: 'SQL',
  status: 'proven',
  confidence: 0.95,
  summary: 'Verified parameterized queries',
  last_commit_hash: '9f3c2ab',
  timestamp: '2026-10-17T00:00:00Z',
};

export const mockBackendAssessmentsList = [
  {
    id: 'req-sql',
    requirement_id: 'req-sql',
    requirement_name: 'SQL',
    status: 'proven',
    confidence: 0.95,
    summary: 'No database queries or schema migrations detected in repository tree.',
    last_commit_hash: '9f3c2ab',
    timestamp: '2 hours ago',
  },
  {
    id: 'req-rest',
    requirement_id: 'req-rest',
    requirement_name: 'REST API',
    status: 'proven',
    confidence: 0.98,
    summary: '4 route decorators found across app/api/ endpoints with schema validation.',
    last_commit_hash: '9f3c2ab',
    timestamp: '2 hours ago',
  },
  {
    id: 'req-auth',
    requirement_id: 'req-auth',
    requirement_name: 'Authentication',
    status: 'proven',
    confidence: 0.92,
    summary: 'HMAC-SHA256 signature verification middleware and timing-safe comparisons.',
    last_commit_hash: '8e41c0d',
    timestamp: '4 hours ago',
  },
  {
    id: 'req-test',
    requirement_id: 'req-test',
    requirement_name: 'Testing',
    status: 'basic',
    confidence: 0.76,
    summary: '15 unit tests found; 2 hollow assertions rejected without exercising logic.',
    last_commit_hash: '7a12b9c',
    timestamp: 'Yesterday',
  },
  {
    id: 'req-docker',
    requirement_id: 'req-docker',
    requirement_name: 'Docker',
    status: 'basic',
    confidence: 0.88,
    summary: 'Dockerfile with multi-stage build present; missing non-root security context.',
    last_commit_hash: '6f09e1a',
    timestamp: '3 days ago',
  },
  {
    id: 'req-grpc',
    requirement_id: 'req-grpc',
    requirement_name: 'gRPC / Protobuf',
    status: 'not_shown',
    confidence: 0.99,
    summary: 'No proto definitions or gRPC stubs found in repository scope.',
    last_commit_hash: '9f3c2ab',
    timestamp: '2 hours ago',
  },
  {
    id: 'req-ci',
    requirement_id: 'req-ci',
    requirement_name: 'CI/CD Pipelines',
    status: 'unclear',
    confidence: 0.45,
    summary: '.github/workflows/test.yml references third-party action without pinned hash.',
    last_commit_hash: '5e81d2f',
    timestamp: '4 days ago',
  },
];

export const mockBackendEvidence = {
  id: 'evi-sql',
  requirement_id: 'req-sql',
  title: 'SQLite Invariant',
  sublabel: 'Database Access',
  serial: 'REC-0042',
  status: 'proven',
  fileName: 'src/db/orders.py',
  code: 'SELECT * FROM orders WHERE id = ?',
};

export const mockBackendEvidenceRest = {
  id: 'evi-rest',
  requirement_id: 'req-rest',
  title: 'REST API',
  sublabel: 'Requirement 2 of 7 · Mandatory core skill',
  serial: 'REC-0042',
  timestamp: '2026-10-16 14:02:18 UTC',
  status: 'proven',
  fileName: 'api/routes/orders.py',
  code: `from fastapi import APIRouter, Depends, HTTPException\nrouter = APIRouter(prefix="/orders", tags=["orders"])`,
};

export const mockBackendCoverage = {
  id: 'cov-01',
  job_id: 'job-001',
  evidence_coverage: 58,
  coverage_pct: 58,
  assessed_count: 7,
  total_count: 12,
};

export const mockBackendProofMap = {
  job_id: 'job-001',
  active_snapshot: {
    commit_hash: '9f3c2ab',
    message: 'Harden JWT token validation',
    percentage: 58,
    timestamp: '2 hours ago',
  },
  snapshots: [
    { commit_hash: '5e81d2f', message: 'Initial commit', percentage: 20, timestamp: '4 days ago' },
    { commit_hash: '6f09e1a', message: 'Add dockerfile', percentage: 35, timestamp: '3 days ago' },
    { commit_hash: '7a12b9c', message: 'Add basic unit tests', percentage: 48, timestamp: 'Yesterday' },
    { commit_hash: '9f3c2ab', message: 'Harden JWT token validation', percentage: 58, timestamp: '2 hours ago' },
  ],
  files: [
    { id: 'f-1', name: 'routes.py', path: 'src/api/routes.py', size: 1024, status: 'proven' },
    { id: 'f-2', name: 'models.py', path: 'src/api/models.py', size: 2048, status: 'proven' },
    { id: 'f-3', name: 'db.py', path: 'src/db/sqlite.py', size: 1536, status: 'proven' },
    { id: 'f-4', name: 'auth.py', path: 'src/auth/jwt.py', size: 3072, status: 'proven' },
    { id: 'f-5', name: 'test_api.py', path: 'tests/test_api.py', size: 1024, status: 'basic' },
    { id: 'f-6', name: 'test_db.py', path: 'tests/test_db.py', size: 1024, status: 'basic' },
    { id: 'f-7', name: 'Dockerfile', path: 'Dockerfile', size: 512, status: 'basic' },
    { id: 'f-8', name: 'ci.yml', path: '.github/workflows/ci.yml', size: 768, status: 'unclear' },
    { id: 'f-9', name: 'grpc.proto', path: 'proto/service.proto', size: 256, status: 'not_shown' },
  ],
};

export const mockBackendContracts = [
  {
    id: 'contract-sql',
    title: 'Add SQLite query and assertion test',
    description: 'Ensure parameterized query and assertion test pass',
    requirement_target: 'SQL',
    status: 'pending',
  },
  {
    id: 'contract-rest',
    title: 'Add REST API Endpoints with schema validation',
    description: 'Ensure schemas and status codes are checked',
    requirement_target: 'REST API',
    status: 'pending',
  },
  {
    id: 'contract-auth',
    title: 'Harden Authentication Tokens',
    description: 'Verify HMAC signatures',
    requirement_target: 'Authentication',
    status: 'pending',
  },
  {
    id: 'contract-test',
    title: 'Unit Test Coverage Improvements',
    description: 'Add regression tests',
    requirement_target: 'Testing',
    status: 'pending',
  },
];

export const mockBackendDryRun = {
  diff: '+ def test_sql(): assert True',
  predicted_status: 'proven',
  coverage_delta: 14,
  before_percentage: 58,
  after_percentage: 72,
  status: 'fulfilled',
  verdict: 'ATTENTION_REQUIRED',
};

export const mockBackendResume = {
  candidate_name: 'Rohan Sharma',
  title: 'Senior Systems Engineer',
  verified_coverage: 58,
  skills: [
    { name: 'FastAPI', status: 'proven' },
    { name: 'SQL', status: 'proven' },
  ],
};

export const mockBackendLedgerBlocks = [
  {
    block_height: 1,
    commit_hash: '9f3c2ab',
    previous_hash: '0000000000000000000000000000000000000000',
    merkle_root: 'sha256:7f83b165...',
  },
];

export const mockBackendScanner = {
  target_user: 'octocat',
  target_repo: 'octocat/northwind-service',
  audit_receipt_id: '#0492-ZK',
  coverage_pct: 58,
  assessed_count: 7,
  total_count: 12,
  is_attested: true,
  breakdown: { proven: 3, basic: 1, notShown: 1, unclear: 2 },
  verified_files: [
    'src/core/router.py',
    'tests/test_router.py',
    'src/auth/token.go',
  ],
};

export const mockBackendAdversarial = {
  attacks_sent: 10,
  upgrades_granted: 0,
  guard_reasons_logged: 10,
  protocol: 'AIR-GAPPED EVALUATION',
  spec: 'SPEC § 4.6 INJECTION MATRIX',
  vectors: [
    {
      id: 'atk-1',
      name: 'SQL Injection Guard',
      category: 'SQL_INJECTION',
      target_file: 'src/db/queries.py',
      payload_preview: "'; DROP TABLE users; --",
      injection_type: 'AST_MUTATION',
      status: 'REFUSED',
      guard_reason: 'GUARD INVARIANT INTACT',
      timestamp: 'Just now',
      signature_hash: 'sha256:7f83b165...',
      lines: '42-45',
    },
  ],
};

export const mockBackendResumeAttestation = {
  candidate: {
    name: 'ROHAN VERMA',
    title: 'Senior Systems Engineer',
    email: 'rohan@example.com',
    github: 'github.com/rohan',
    location: 'Bangalore, IN',
    clearance: 'Level 3 Attestation',
  },
  audit_identifier: '#0492-ZK',
  merkle_root: 'sha256:7f83b165...',
  commit_hash: 'a182c4f',
  skills: [
    {
      category: 'Backend Architecture',
      items: [
        { name: 'FastAPI', status: 'proven', footnote_ref: 1 },
        { name: 'SQL', status: 'proven', footnote_ref: 2 },
      ],
    },
  ],
  experience: [
    {
      role: 'Staff Infrastructure Lead',
      company: 'Taskflow Systems',
      period: '2022 - Present',
      bullets: [
        { text: 'Architected distributed event engine', commit_sha: 'a182c4f', is_attested: true },
      ],
    },
  ],
};

export const handlers = [
  http.get('/api/me', () => HttpResponse.json(mockBackendMe)),
  http.get('/api/assessments', () => HttpResponse.json(mockBackendAssessmentsList)),
  http.get('/api/evidence/:id', ({ params }) => {
    if (params.id === 'evi-rest') {
      return HttpResponse.json(mockBackendEvidenceRest);
    }
    return HttpResponse.json(mockBackendEvidence);
  }),
  http.get('/api/coverage/:jobId', () => HttpResponse.json(mockBackendCoverage)),
  http.get('/api/proofmap/:jobId', () => HttpResponse.json(mockBackendProofMap)),
  http.get('/api/contracts', () => HttpResponse.json(mockBackendContracts)),
  http.post('/api/dry-run', () => HttpResponse.json(mockBackendDryRun)),
  http.post('/api/corrections', () => HttpResponse.json({ status: 'recorded', success: true })),
  http.get('/api/resume', () => HttpResponse.json(mockBackendResume)),
  http.get('/api/resume/attestation', () => HttpResponse.json(mockBackendResumeAttestation)),
  http.get('/api/ledger/blocks', () => HttpResponse.json(mockBackendLedgerBlocks)),
  http.post('/api/scanner/run', () => HttpResponse.json(mockBackendScanner)),
  http.get('/api/breakme/suite', () => HttpResponse.json(mockBackendAdversarial)),
  http.get('/api/adversarial', () => HttpResponse.json(mockBackendAdversarial)),
  http.get('/api/repos', () => HttpResponse.json([])),
  http.get('/api/diagnostics', () => HttpResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      github: { passed: true, rate_limit_remaining: 4980 },
      database: { passed: true, latency_ms: 0.8 },
      llm: { passed: true, latency_ms: 12 },
      webhook: { passed: true, last_delivery_at: '2m ago' },
      resume_parser: { passed: true, parsed_chars: 1420, duration_ms: 15 },
      sse: { passed: true, active_subscribers: 2, status: 'active' },
    },
  })),
];
