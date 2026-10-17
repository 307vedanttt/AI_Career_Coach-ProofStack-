import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    repos = relationship("Repository", back_populates="user", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    source_type = Column(String(50), nullable=False) # "url", "pasted", "curated"
    source_url = Column(String(1024), nullable=True)
    retrieval_date = Column(DateTime(timezone=True), default=utcnow)
    text_hash = Column(String(64), nullable=False) # SHA-256 of input text
    raw_text_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="jobs")
    requirements = relationship("Requirement", back_populates="job", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="job", cascade="all, delete-orphan")
    snapshots = relationship("Snapshot", back_populates="job", cascade="all, delete-orphan")


class Requirement(Base):
    __tablename__ = "requirements"
    
    id = Column(String(36), primary_key=True)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    canonical_id = Column(String(100), nullable=False, index=True)
    label = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    importance = Column(String(50), nullable=False, default="required") # "required", "preferred"
    exact_quote = Column(Text, nullable=False)
    assessable = Column(String(50), nullable=False, default="code_assessable") # "code_assessable", "partly_assessable", "not_assessable_from_repo"
    detector_name = Column(String(100), nullable=True)
    user_status = Column(String(50), default="active") # "active", "removed", "reinterpreted"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    job = relationship("Job", back_populates="requirements")
    evidence = relationship("FileEvidence", back_populates="requirement", cascade="all, delete-orphan")
    rejected_candidates = relationship("RejectedCandidate", back_populates="requirement", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="requirement", cascade="all, delete-orphan")


class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    repo_url = Column(String(1024), nullable=False)
    owner = Column(String(100), nullable=False)
    name = Column(String(100), nullable=False)
    default_branch = Column(String(100), default="main")
    last_commit_sha = Column(String(64), nullable=True)
    last_etag = Column(String(128), nullable=True)
    webhook_secret = Column(String(128), nullable=True)
    last_synced_at = Column(DateTime(timezone=True), default=utcnow)
    last_sync_trigger = Column(String(50), default="check-now")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    user = relationship("User", back_populates="repos")
    files = relationship("RepositoryFile", back_populates="repository", cascade="all, delete-orphan")
    evidence = relationship("FileEvidence", back_populates="repository", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="repository", cascade="all, delete-orphan")
    snapshots = relationship("Snapshot", back_populates="repository", cascade="all, delete-orphan")
    contracts = relationship("CommitContract", back_populates="repository", cascade="all, delete-orphan")
    provenance_records = relationship("RepoProvenance", back_populates="repository", cascade="all, delete-orphan")
    commit_stats = relationship("CommitStats", back_populates="repository", cascade="all, delete-orphan")
    history_flags = relationship("HistoryFlag", back_populates="repository", cascade="all, delete-orphan")


class RepositoryFile(Base):
    __tablename__ = "repository_files"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False, index=True)
    path = Column(String(512), nullable=False)
    blob_sha = Column(String(64), nullable=True)
    size_bytes = Column(Integer, default=0)
    language = Column(String(50), nullable=True)
    is_test = Column(Boolean, default=False)
    is_entry_point = Column(Boolean, default=False)
    commit_sha = Column(String(64), nullable=False)
    
    repository = relationship("Repository", back_populates="files")

    __table_args__ = (
        Index("idx_repo_file_path", "repo_id", "path"),
    )


class FileEvidence(Base):
    __tablename__ = "file_evidence"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False, index=True)
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=False, index=True)
    detector_name = Column(String(100), nullable=False)
    signal_type = Column(String(100), nullable=False) # e.g. "api_handler", "orm_model", "test_assertion"
    file_path = Column(String(512), nullable=False)
    commit_sha = Column(String(64), nullable=False)
    start_line = Column(Integer, nullable=False)
    end_line = Column(Integer, nullable=False)
    code_snippet = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    reachability_status = Column(String(50), default="reachable") # "reachable", "heuristic_reachable", "unclear"
    llm_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    repository = relationship("Repository", back_populates="evidence")
    requirement = relationship("Requirement", back_populates="evidence")


class RejectedCandidate(Base):
    __tablename__ = "rejected_candidates"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False, index=True)
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=True, index=True)
    detector = Column(String(100), nullable=True)
    detector_name = Column(String(100), nullable=False)
    detector_version = Column(String(50), default="1.0.0", nullable=True)
    file_path = Column(String(512), nullable=False)
    commit_sha = Column(String(64), nullable=False)
    guard_reason = Column(Text, nullable=True)
    rejection_reason = Column(String(500), nullable=False)
    rejected_snippet = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    requirement = relationship("Requirement", back_populates="rejected_candidates")


class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(String(36), primary_key=True)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False, index=True)
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False) # "Demonstrated (strong)", "Demonstrated (basic)", "Not demonstrated in this scope", "Unclear"
    signal_count = Column(Integer, default=0)
    signals_detail = Column(Text, nullable=True) # JSON representation of surviving signals
    reason = Column(Text, nullable=False)
    commit_sha = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    job = relationship("Job", back_populates="assessments")
    repository = relationship("Repository", back_populates="assessments")
    requirement = relationship("Requirement", back_populates="assessments")

    __table_args__ = (
        Index("idx_assessment_lookup", "job_id", "repo_id", "requirement_id"),
    )


class Snapshot(Base):
    __tablename__ = "snapshots"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id", ondelete="SET NULL"), nullable=True, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True, index=True)
    commit_sha = Column(String(64), nullable=False)
    previous_commit_sha = Column(String(64), nullable=True)
    hash_chain = Column(String(64), nullable=False) # SHA-256 chain of state
    coverage_numerator = Column(Float, default=0.0)
    coverage_denominator = Column(Float, default=0.0)
    coverage_score = Column(Float, default=0.0)
    summary_json = Column(Text, nullable=True) # Full structured breakdown
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    repository = relationship("Repository", back_populates="snapshots")
    job = relationship("Job", back_populates="snapshots")


class CommitContract(Base):
    __tablename__ = "commit_contracts"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=False, index=True)
    current_state = Column(String(50), nullable=False)
    predicted_target_state = Column(String(50), nullable=False)
    acceptance_checks = Column(Text, nullable=True) # JSON list of criteria
    acceptance_checks_json = Column(Text, nullable=True) # Allow-listed rule checks JSON
    base_commit_sha = Column(String(64), nullable=False)
    requirements_expected_to_change = Column(Text, nullable=True) # JSON list
    requirements_must_not_change = Column(Text, nullable=True) # JSON list
    must_not_move_json = Column(Text, nullable=True) # Negative predictions JSON
    effort_class = Column(String(50), default="small") # "small", "medium", "large"
    ci_status = Column(String(50), default="not_run") # "passed", "failed", "not_run", "pending"
    adjudication_json = Column(Text, nullable=True) # Full rule adjudication results JSON
    task_description = Column(Text, nullable=True)
    suggested_file_path = Column(String(512), nullable=True)
    recommendation_skeleton = Column(Text, nullable=True)
    gain_arithmetic = Column(Text, nullable=True)
    verdict = Column(String(50), default="Open") # "Open", "Pending", "Fulfilled", "Partly", "Not fulfilled"
    reason = Column(Text, nullable=True)
    evaluated_commit_sha = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    repository = relationship("Repository", back_populates="contracts")


class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"
    
    id = Column(String(36), primary_key=True)
    delivery_id = Column(String(128), unique=True, nullable=False, index=True)
    repo_id = Column(String(36), nullable=True)
    event_type = Column(String(50), nullable=False)
    payload_hash = Column(String(64), nullable=False)
    status = Column(String(50), default="received") # "received", "processed", "ignored", "error"
    received_at = Column(DateTime(timezone=True), default=utcnow)


class LLMCache(Base):
    __tablename__ = "llm_cache"
    
    id = Column(String(36), primary_key=True)
    cache_key = Column(String(64), unique=True, nullable=False, index=True)
    file_sha = Column(String(64), nullable=False)
    requirement_id = Column(String(100), nullable=False)
    detector_version = Column(String(50), nullable=False)
    prompt_version = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    verdict = Column(Boolean, nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class TraceRun(Base):
    __tablename__ = "trace_runs"
    
    id = Column(String(36), primary_key=True)
    run_id = Column(String(64), unique=True, nullable=False, index=True)
    repo_id = Column(String(36), nullable=True)
    job_id = Column(String(36), nullable=True)
    status = Column(String(50), default="running")
    steps_json = Column(Text, default="[]")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)


class ResumeExtraction(Base):
    __tablename__ = "resume_extractions"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    file_sha256 = Column(String(64), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    char_count = Column(Integer, nullable=False)
    skills_json = Column(Text, nullable=False)
    extracted_text_preview = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    __table_args__ = (
        Index("idx_resume_user_sha", "user_id", "file_sha256", unique=True),
    )


class RepoProvenance(Base):
    __tablename__ = "repo_provenance"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_version = Column(String(64), nullable=True)
    detector_version = Column(String(50), default="provenance_detector@v1.0", nullable=False)
    signals_json = Column(Text, nullable=False, default="{}")
    flags_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    repository = relationship("Repository", back_populates="provenance_records")


class CommitStats(Base):
    __tablename__ = "commit_stats"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)
    sha = Column(String(64), nullable=False, index=True)
    author_login = Column(String(100), nullable=True, index=True)
    author_name = Column(String(255), nullable=True)
    author_email = Column(String(255), nullable=True)
    authored_at = Column(DateTime(timezone=True), nullable=True)
    committer_login = Column(String(100), nullable=True)
    committer_name = Column(String(255), nullable=True)
    committer_email = Column(String(255), nullable=True)
    committed_at = Column(DateTime(timezone=True), nullable=True)
    message_first_line = Column(Text, nullable=True)
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    files_changed = Column(Integer, default=0)
    parents_count = Column(Integer, default=1)
    verified = Column(Boolean, default=False)
    verification_reason = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    repository = relationship("Repository", back_populates="commit_stats")

    __table_args__ = (
        Index("idx_commit_stats_repo_sha", "repo_id", "sha", unique=True),
    )


class HistoryFlag(Base):
    __tablename__ = "history_flags"
    
    id = Column(String(36), primary_key=True)
    repo_id = Column(String(36), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_version = Column(String(64), nullable=True)
    code = Column(String(100), nullable=False, index=True)
    severity = Column(String(50), default="review", nullable=False) # "review", "info"
    title = Column(String(255), nullable=False)
    observed_json = Column(Text, nullable=False, default="{}")
    rule = Column(Text, nullable=False)
    innocent_note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    repository = relationship("Repository", back_populates="history_flags")


