import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.models.models import User
from backend.services.organization_service import organization_service
from backend.schemas.enterprise_schemas import (
    OrganizationCreateRequest,
    OrganizationResponse,
    MemberInviteRequest,
    MemberResponse,
    CandidateEvaluationCreateRequest,
    CandidateEvaluationResponse,
    AuditLogResponse
)
from backend.api.routes import get_authenticated_user

router = APIRouter(tags=["Enterprise & Multi-Tenancy"])

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.post("/organizations", response_model=OrganizationResponse)
async def create_organization(
    payload: OrganizationCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Creates a new multi-tenant organization with the authenticated user as Owner."""
    user = await get_authenticated_user(request, db)
    org = await organization_service.create_organization(
        db=db,
        user_id=user.id,
        name=payload.name,
        slug=payload.slug,
        tier=payload.tier or "starter",
        client_ip=get_client_ip(request)
    )
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        tier=org.tier,
        max_seats=org.max_seats,
        role="owner",
        status="active",
        created_at=org.created_at.isoformat() if org.created_at else None
    )


@router.get("/organizations/me", response_model=List[OrganizationResponse])
async def list_my_organizations(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Lists all organizations and roles for the authenticated user."""
    user = await get_authenticated_user(request, db)
    orgs = await organization_service.get_user_organizations(db, user)
    return [
        OrganizationResponse(
            id=o["id"],
            name=o["name"],
            slug=o["slug"],
            tier=o["tier"],
            max_seats=o["max_seats"],
            role=o["role"],
            status=o["status"],
            created_at=o["created_at"]
        )
        for o in orgs
    ]


@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves organization details if the user is a member."""
    user = await get_authenticated_user(request, db)
    membership = await organization_service.check_membership(db, org_id, user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Access denied: Not a member of this organization")

    org = await organization_service.get_organization(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        tier=org.tier,
        max_seats=org.max_seats,
        role=membership.role,
        status=membership.status,
        created_at=org.created_at.isoformat() if org.created_at else None
    )


@router.get("/organizations/{org_id}/members", response_model=List[MemberResponse])
async def list_organization_members(
    org_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Lists members of an organization."""
    user = await get_authenticated_user(request, db)
    membership = await organization_service.check_membership(db, org_id, user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Access denied: Not a member of this organization")

    members = await organization_service.list_members(db, org_id)
    return [
        MemberResponse(
            id=m["id"],
            user_id=m["user_id"],
            username=m["username"],
            email=m["email"],
            role=m["role"],
            status=m["status"],
            joined_at=m["joined_at"]
        )
        for m in members
    ]


@router.post("/organizations/{org_id}/members", response_model=MemberResponse)
async def invite_organization_member(
    org_id: str,
    payload: MemberInviteRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Invites or adds a member to an organization. Requires Owner or Admin."""
    user = await get_authenticated_user(request, db)
    try:
        member = await organization_service.add_or_invite_member(
            db=db,
            org_id=org_id,
            actor_id=user.id,
            email=payload.email,
            role=payload.role,
            client_ip=get_client_ip(request)
        )
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))

    return MemberResponse(
        id=member.id,
        user_id=member.user_id,
        username=payload.email,
        email=member.invited_email,
        role=member.role,
        status=member.status,
        joined_at=member.created_at.isoformat() if member.created_at else None
    )


@router.get("/organizations/{org_id}/candidates", response_model=List[CandidateEvaluationResponse])
async def list_candidates(
    org_id: str,
    status: Optional[str] = Query(None, description="Filter by status: verified, pending, flagged, rejected"),
    request: Request = None,
    db: AsyncSession = Depends(get_db)
):
    """Lists candidate evaluations for a hiring team."""
    user = await get_authenticated_user(request, db)
    membership = await organization_service.check_membership(db, org_id, user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Access denied: Not a member of this organization")

    evaluations = await organization_service.list_candidate_evaluations(db, org_id, status_filter=status)
    return [
        CandidateEvaluationResponse(
            id=ev["id"],
            candidate_name=ev["candidate_name"],
            candidate_email=ev["candidate_email"],
            github_handle=ev["github_handle"],
            job_id=ev["job_id"],
            job_title=ev["job_title"],
            match_score=ev["match_score"],
            verified_claims_count=ev["verified_claims_count"],
            hollow_claims_count=ev["hollow_claims_count"],
            evaluation_status=ev["evaluation_status"],
            integrity_signals=ev["integrity_signals"],
            recruiter_notes=ev["recruiter_notes"],
            share_token=ev["share_token"],
            created_at=ev["created_at"]
        )
        for ev in evaluations
    ]


@router.post("/organizations/{org_id}/candidates", response_model=CandidateEvaluationResponse)
async def create_candidate(
    org_id: str,
    payload: CandidateEvaluationCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Creates a candidate portfolio evaluation with cryptographic verification token."""
    user = await get_authenticated_user(request, db)
    try:
        ev = await organization_service.create_candidate_evaluation(
            db=db,
            org_id=org_id,
            actor_id=user.id,
            candidate_name=payload.candidate_name,
            candidate_email=payload.candidate_email,
            github_handle=payload.github_handle,
            job_id=payload.job_id,
            recruiter_notes=payload.recruiter_notes,
            client_ip=get_client_ip(request)
        )
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))

    return CandidateEvaluationResponse(
        id=ev.id,
        candidate_name=ev.candidate_name,
        candidate_email=ev.candidate_email,
        github_handle=ev.github_handle,
        job_id=ev.job_id,
        job_title="Target Role",
        match_score=ev.match_score,
        verified_claims_count=ev.verified_claims_count,
        hollow_claims_count=ev.hollow_claims_count,
        evaluation_status=ev.evaluation_status,
        integrity_signals={},
        recruiter_notes=ev.recruiter_notes,
        share_token=ev.share_token,
        created_at=ev.created_at.isoformat() if ev.created_at else None
    )


@router.get("/candidates/verify/{share_token}")
async def verify_candidate_dossier(
    share_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Public verification of candidate technical dossier via cryptographic share token."""
    dossier = await organization_service.get_candidate_evaluation_by_token(db, share_token)
    if not dossier:
        raise HTTPException(status_code=404, detail="Candidate verification dossier not found or token has expired")
    return dossier


@router.get("/organizations/{org_id}/audit-logs", response_model=List[AuditLogResponse])
async def get_organization_audit_logs(
    org_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    request: Request = None,
    db: AsyncSession = Depends(get_db)
):
    """Enterprise audit trail for compliance and SOC2 logging."""
    user = await get_authenticated_user(request, db)
    membership = await organization_service.check_membership(db, org_id, user.id)
    if not membership or membership.role not in ("owner", "admin", "auditor"):
        raise HTTPException(status_code=403, detail="Access denied: Only Owners, Admins, or Auditors can view audit logs")

    logs = await organization_service.get_audit_logs(db, org_id, limit=limit, offset=offset)
    return [
        AuditLogResponse(
            id=log["id"],
            action=log["action"],
            actor_id=log["actor_id"],
            actor_username=log["actor_username"],
            target_type=log["target_type"],
            target_id=log["target_id"],
            ip_address=log["ip_address"],
            details=log["details"],
            created_at=log["created_at"]
        )
        for log in logs
    ]
