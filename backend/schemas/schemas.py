from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
import datetime

# --- Health ---
class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    run_mode: str
    database_status: str
    llm_configured: bool
    github_configured: bool
    timestamp: datetime.datetime

# --- Job Requirements ---
class JobCreateRequest(BaseModel):
    url: Optional[str] = None
    description: Optional[str] = None
    title: Optional[str] = "Software Engineering Role"
    company: Optional[str] = None

class RequirementResponse(BaseModel):
    id: str
    job_id: str
    canonical_id: str
    label: str
    category: str
    importance: str
    exact_quote: str
    assessable: str
    detector_name: Optional[str] = None
    user_status: str
    notes: Optional[str] = None

class RequirementUpdateRequest(BaseModel):
    user_status: Optional[str] = None # "active", "removed", "reinterpreted"
    importance: Optional[str] = None # "required", "preferred"
    notes: Optional[str] = None
    canonical_id: Optional[str] = None
    label: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    title: str
    company: Optional[str] = None
    source_type: str
    source_url: Optional[str] = None
    retrieval_date: datetime.datetime
    text_hash: str
    requirements: List[RequirementResponse] = []
    created_at: datetime.datetime

# --- Repository ---
class RepoConnectRequest(BaseModel):
    repo_url: str
    default_branch: Optional[str] = "main"

class RepoResponse(BaseModel):
    id: str
    repo_url: str
    owner: str
    name: str
    default_branch: str
    last_commit_sha: Optional[str] = None
    last_synced_at: Optional[datetime.datetime] = None
    last_sync_trigger: Optional[str] = "check-now"
    created_at: datetime.datetime

# --- Evidence & Assessment ---
class EvidenceResponse(BaseModel):
    id: str
    repo_id: str
    requirement_id: str
    detector_name: str
    signal_type: str
    file_path: str
    commit_sha: str
    start_line: int
    end_line: int
    code_snippet: str
    explanation: Optional[str] = None
    reachability_status: str
    llm_verified: bool

class RejectedCandidateResponse(BaseModel):
    id: str
    requirement_id: Optional[str] = None
    detector: Optional[str] = None
    detector_name: str
    detector_version: Optional[str] = "1.0.0"
    file_path: str
    commit_sha: str
    guard_reason: Optional[str] = None
    rejection_reason: str
    rejected_snippet: Optional[str] = None
    created_at: Optional[Any] = None

class AssessmentItem(BaseModel):
    requirement_id: str
    canonical_id: str
    label: str
    category: str
    importance: str
    assessable: str
    status: str # "Demonstrated (strong)", "Demonstrated (basic)", "Not demonstrated in this scope", "Unclear"
    signal_count: int
    signals_detail: Optional[str] = None
    reason: str
    commit_sha: str
    evidence: List[EvidenceResponse] = []
    rejected_candidates: List[RejectedCandidateResponse] = []

class AnalyzeRequest(BaseModel):
    repo_id: Optional[str] = None
    job_id: Optional[str] = None
    force_rescan: bool = False

class AssessmentResponse(BaseModel):
    repo_id: str
    job_id: str
    commit_sha: str
    run_mode: str
    assessments: List[AssessmentItem] = []
    coverage: Dict[str, Any]
    analyzed_at: datetime.datetime

# --- Coverage ---
class CoverageSensitivity(BaseModel):
    equal_weights_coverage: float
    strict_required_coverage: float

class CoverageResponse(BaseModel):
    job_id: str
    repo_id: Optional[str] = None
    commit_sha: Optional[str] = None
    evidence_coverage: float # 0.0 to 100.0%
    numerator: float
    denominator: float
    assessed_count: int
    required_count: int
    preferred_count: int
    unclear_count: int
    excluded_count: int
    sensitivity_ranges: Dict[str, float]
    label: str = "Evidence coverage"

# --- ProofMap ---
class ProofMapFile(BaseModel):
    path: str
    language: Optional[str] = None
    size_bytes: int
    is_test: bool
    is_entry_point: bool
    evidence_count: int
    matched_skills: List[str] = []

class ProofMapResponse(BaseModel):
    job_id: str
    repo_id: str
    commit_sha: str
    files: List[ProofMapFile]
    total_files: int
    assessed_requirements: int

# --- Commit Contracts ---
class CommitContractCreateRequest(BaseModel):
    repo_id: str
    job_id: Optional[str] = None
    requirement_id: Optional[str] = None
    predicted_target_state: Optional[str] = None
    generate_all_missing: Optional[bool] = False

class CommitContractResponse(BaseModel):
    id: str
    repo_id: str
    job_id: str
    requirement_id: str
    requirement_name: Optional[str] = None
    current_state: str
    predicted_target_state: str
    acceptance_checks: List[str] = []
    acceptance_checks_json: Optional[List[Dict[str, Any]]] = []
    base_commit_sha: str
    requirements_expected_to_change: List[str] = []
    requirements_must_not_change: List[str] = []
    must_not_move_json: Optional[List[str]] = []
    effort_class: str = "small"
    ci_status: str = "not_run" # "passed", "failed", "not_run", "pending"
    adjudication_json: Optional[Dict[str, Any]] = None
    task_description: Optional[str] = None
    suggested_file_path: Optional[str] = None
    recommendation_skeleton: Optional[str] = None
    gain_arithmetic: Optional[str] = None
    verdict: str = "Open" # "Open", "Pending", "Fulfilled", "Partly", "Not fulfilled"
    reason: Optional[str] = None
    evaluated_commit_sha: Optional[str] = None
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None

# --- Dry Run ---
class DryRunRequest(BaseModel):
    repo_id: Optional[str] = None
    job_id: Optional[str] = None
    contract_id: Optional[str] = None
    simulated_files: Optional[Dict[str, str]] = None
    candidate_files: Optional[Dict[str, str]] = None

class DryRunResponse(BaseModel):
    base_commit_sha: str
    hypothetical_assessments: List[AssessmentItem] = []
    hypothetical_coverage: float
    before_percentage: Optional[float] = None
    after_percentage: Optional[float] = None
    checklist_results: Optional[Dict[str, bool]] = None
    status: Optional[str] = None
    delta_summary: str

# --- Trace ---
class TraceStep(BaseModel):
    step_id: int
    step_name: str
    timestamp: str
    elapsed_ms: float
    status: str
    details: Dict[str, Any] = {}

class TraceResponse(BaseModel):
    run_id: str
    repo_id: Optional[str] = None
    job_id: Optional[str] = None
    status: str
    created_at: datetime.datetime
    finished_at: Optional[datetime.datetime] = None
    steps: List[TraceStep] = []

# --- Corrections ---
class CorrectionRequest(BaseModel):
    evidence_id: Optional[str] = None
    requirement_id: Optional[str] = None
    repo_id: Optional[str] = None
    user_correction: Optional[str] = None
    reason: Optional[str] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None
    corrected_snippet: Optional[str] = None

class CorrectionResponse(BaseModel):
    status: str = "received"
    success: bool = True
    message: str

# --- User & Session ---
class ApiKeyAuthRequest(BaseModel):
    api_key: Optional[str] = None
    role: Optional[str] = "developer"

class ApiKeyAuthResponse(BaseModel):
    status: str = "authenticated"
    api_key: str
    token: str
    session_token: str
    csrf_token: str
    user: "UserSessionResponse"

class UserSessionResponse(BaseModel):
    id: str
    login: str
    name: str
    avatar_url: str
    public_repos: int
    scopes: List[str]
    session_started_at: str

# --- Adversarial Suite (BreakMe) ---
class AttackVectorSchema(BaseModel):
    id: str
    name: str
    category: str
    target_file: str
    payload_preview: str
    injection_type: str
    status: str # "refused" | "attack"
    guard_reason: str
    timestamp: str
    signature_hash: str
    lines: List[int]

class AdversarialSuiteResponse(BaseModel):
    attacks_sent: int
    upgrades_granted: int
    guard_reasons_logged: int
    vectors: List[AttackVectorSchema]
    protocol: str = "BREAK-ME"
    spec: str = "ISO-27001-ZKP"

class AdversarialRunResponse(BaseModel):
    results: List[AttackVectorSchema]
    upgrades_granted: int
    guard_reasons_logged: int

# --- Resume Attestation ---
class ResumeCandidateSchema(BaseModel):
    name: str
    title: str
    email: str
    github: str
    location: str
    clearance: str
    summary: str

class ResumeSkillItem(BaseModel):
    name: str
    status: str
    footnote_ref: int

class ResumeSkillCategory(BaseModel):
    category: str
    items: List[ResumeSkillItem]

class ResumeBulletSchema(BaseModel):
    text: str
    commit_sha: str
    is_attested: bool

class ResumeExperienceSchema(BaseModel):
    role: str
    company: str
    period: str
    bullets: List[ResumeBulletSchema]

class ResumeAttestationResponse(BaseModel):
    candidate: ResumeCandidateSchema
    audit_identifier: str
    merkle_root: str
    commit_hash: str
    skills: List[ResumeSkillCategory]
    experience: List[ResumeExperienceSchema]

# --- Ledger Blocks ---
class LedgerBlockResponse(BaseModel):
    block_height: int
    commit_hash: str
    previous_hash: str
    timestamp: str
    invariants_proven: int
    author: str
    merkle_root: str

# --- Public Repo Scanner ---
class RepoScanRequest(BaseModel):
    username: str

class RepoScanBreakdown(BaseModel):
    proven: int
    basic: int
    not_shown: int
    unclear: int

class RepoScanResponse(BaseModel):
    target_user: str
    target_repo: str
    audit_receipt_id: str
    timestamp: str
    coverage_pct: float
    assessed_count: int
    total_count: int
    organization: str
    breakdown: RepoScanBreakdown
    verified_files: List[str]
    is_attested: bool

# --- Settings & API Keys ---
class SettingsResponse(BaseModel):
    llm_provider: str
    llm_model: str
    has_llm_key: bool
    has_github_token: bool
    run_mode: str
    masked_llm_key: str
    masked_github_token: str

class SettingsUpdateRequest(BaseModel):
    llm_provider: Optional[str] = None
    llm_api_key: Optional[str] = None
    llm_model: Optional[str] = None
    github_token: Optional[str] = None

# --- Repository Provenance ---
class RepoProvenanceFlag(BaseModel):
    code: str
    severity: str # "info" or "review"
    title: str
    observed_values: Dict[str, Any]
    why_it_can_be_innocent: str
    permalink: Optional[str] = None

class RepoProvenanceResponse(BaseModel):
    id: str
    repo_id: str
    snapshot_version: Optional[str] = None
    detector_version: str
    signals: Dict[str, Any]
    flags: List[RepoProvenanceFlag]
    created_at: str


# --- Commit History Analysis ---
class TimelineItem(BaseModel):
    week_start: str
    commits_count: int
    additions: int
    deletions: int

class DailyHeatmapItem(BaseModel):
    date: str
    count: int
    level: int

class LargeAdditionItem(BaseModel):
    sha: str
    short_sha: str
    message: str
    author_login: str
    committed_at: Optional[str] = None
    additions: int
    deletions: int
    files_changed: int
    share_pct: float
    verified: bool
    permalink: str
    snapshot: Optional[Dict[str, Any]] = None

class AuthorBreakdownItem(BaseModel):
    login: str
    name: str
    email: Optional[str] = None
    is_signed_in_user: bool
    commits_count: int
    commits_share_pct: float
    additions: int
    deletions: int
    lines_share_pct: float

class HistoryFlagItem(BaseModel):
    id: Optional[str] = None
    code: str
    severity: str # "review" or "info"
    title: str
    rule: str
    observed: Dict[str, Any]
    innocent_note: str
    created_at: Optional[str] = None

class CommitHistoryResponse(BaseModel):
    repo_id: str
    repo_full_name: str
    default_branch: str
    commit_cap: int
    total_commits_analyzed: int
    cap_reached: bool
    cap_banner_message: Optional[str] = None
    disclaimer: str
    timeline: List[TimelineItem]
    daily_contributions: List[DailyHeatmapItem]
    large_additions: List[LargeAdditionItem]
    authors: List[AuthorBreakdownItem]
    flags_count: int
    flags: List[HistoryFlagItem]
    thresholds: Dict[str, Any]

class HistoryFlagsResponse(BaseModel):
    repo_id: str
    flags: List[HistoryFlagItem]
    thresholds: Dict[str, Any]
    disclaimer: str


