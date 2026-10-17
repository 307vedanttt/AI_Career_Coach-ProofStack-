from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class OrganizationCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Organization display name")
    slug: Optional[str] = Field(None, max_length=100, description="Optional custom URL slug")
    tier: Optional[str] = Field("starter", description="Tier: free, starter, growth, enterprise")

class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    tier: str
    max_seats: int
    role: Optional[str] = "owner"
    status: Optional[str] = "active"
    created_at: Optional[str] = None

class MemberInviteRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255, description="Email or username to invite")
    role: str = Field("engineer", description="Role: owner, admin, recruiter, engineer, auditor")

class MemberResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    role: str
    status: str
    joined_at: Optional[str] = None

class CandidateEvaluationCreateRequest(BaseModel):
    candidate_name: str = Field(..., min_length=1, max_length=255)
    candidate_email: Optional[str] = None
    github_handle: Optional[str] = None
    job_id: Optional[str] = None
    recruiter_notes: Optional[str] = None

class CandidateEvaluationResponse(BaseModel):
    id: str
    candidate_name: str
    candidate_email: Optional[str] = None
    github_handle: Optional[str] = None
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    match_score: Optional[float] = None
    verified_claims_count: int = 0
    hollow_claims_count: int = 0
    evaluation_status: str
    integrity_signals: Dict[str, Any] = {}
    recruiter_notes: Optional[str] = None
    share_token: Optional[str] = None
    created_at: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: str
    action: str
    actor_id: Optional[str] = None
    actor_username: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Dict[str, Any] = {}
    created_at: Optional[str] = None
