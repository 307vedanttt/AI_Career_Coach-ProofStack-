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
    requirement_id: str
    detector_name: str
    file_path: str
    commit_sha: str
    rejection_reason: str
    rejected_snippet: Optional[str] = None

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
    repo_id: str
    job_id: str
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
    job_id: str
    requirement_id: str
    predicted_target_state: Optional[str] = "Demonstrated (basic)"

class CommitContractResponse(BaseModel):
    id: str
    repo_id: str
    job_id: str
    requirement_id: str
    current_state: str
    predicted_target_state: str
    acceptance_checks: List[str]
    base_commit_sha: str
    requirements_expected_to_change: List[str]
    requirements_must_not_change: List[str]
    effort_class: str
    verdict: str # "Pending", "Fulfilled", "Partly fulfilled", "Not fulfilled"
    reason: Optional[str] = None
    evaluated_commit_sha: Optional[str] = None

# --- Dry Run ---
class DryRunRequest(BaseModel):
    repo_id: str
    job_id: str
    simulated_files: Dict[str, str] # path -> content

class DryRunResponse(BaseModel):
    base_commit_sha: str
    hypothetical_assessments: List[AssessmentItem]
    hypothetical_coverage: float
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
    evidence_id: str
    user_correction: str
    notes: Optional[str] = None

class CorrectionResponse(BaseModel):
    status: str = "received"
    message: str
