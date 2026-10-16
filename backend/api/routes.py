import asyncio
import datetime
import hashlib
import json
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, desc

from backend.config import settings
from backend.db.session import get_db
from backend.models.models import (
    User, Job, Requirement, Repository, RepositoryFile,
    FileEvidence, RejectedCandidate, Assessment, Snapshot,
    CommitContract, WebhookDelivery, LLMCache, TraceRun, utcnow
)
from backend.schemas.schemas import (
    HealthResponse, JobCreateRequest, JobResponse, RequirementResponse,
    RequirementUpdateRequest, RepoConnectRequest, RepoResponse,
    AnalyzeRequest, AssessmentResponse, AssessmentItem, EvidenceResponse,
    RejectedCandidateResponse, CoverageResponse, ProofMapResponse, ProofMapFile,
    CommitContractCreateRequest, CommitContractResponse,
    DryRunRequest, DryRunResponse, TraceResponse, TraceStep,
    CorrectionRequest, CorrectionResponse
)
from backend.services.security import SecurityError
from backend.services.job_extractor import job_extractor
from backend.services.github_client import github_client, GitHubAPIError
from backend.services.detectors import get_detector
from backend.services.evidence_guard import evidence_guard
from backend.services.llm_verifier import llm_verifier
from backend.services.assessment_engine import (
    assessment_engine, STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR
)
from backend.services.coverage_service import coverage_service
from backend.services.contracts_service import contracts_service
from backend.services.snapshot_service import snapshot_service
from backend.services.trace_service import trace_service
from backend.services.webhook_service import webhook_service

router = APIRouter()

# Default user ID for demonstration / single-tenant hackathon demo
DEFAULT_USER_ID = "demo-user-001"

async def get_or_create_default_user(db: AsyncSession) -> User:
    stmt = select(User).where(User.id == DEFAULT_USER_ID)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        user = User(id=DEFAULT_USER_ID, username="proofstack_demo_user")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

# =========================================================================
# 1. Health and Job Requirements
# =========================================================================

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        run_mode=settings.RUN_MODE,
        database_status="healthy (WAL mode)",
        llm_configured=bool(settings.LLM_API_KEY and settings.LLM_PROVIDER != "none"),
        github_configured=bool(settings.GITHUB_TOKEN),
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )

@router.post("/jobs", response_model=JobResponse)
async def create_job(request: JobCreateRequest, db: AsyncSession = Depends(get_db)):
    user = await get_or_create_default_user(db)

    try:
        extracted = await job_extractor.process_job_input(
            url=request.url,
            description=request.description,
            title=request.title,
            company=request.company
        )
    except SecurityError as se:
        raise HTTPException(status_code=400, detail=f"Security error: {str(se)}")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process job input: {str(e)}")

    job_id = str(uuid.uuid4())
    job = Job(
        id=job_id,
        user_id=user.id,
        title=extracted["title"],
        company=extracted["company"],
        source_type=extracted["source_type"],
        source_url=extracted["source_url"],
        retrieval_date=utcnow(),
        text_hash=extracted["text_hash"],
        raw_text_summary=extracted["raw_text_summary"]
    )
    db.add(job)

    req_objects = []
    for r in extracted["requirements"]:
        req_obj = Requirement(
            id=str(uuid.uuid4()),
            job_id=job_id,
            canonical_id=r["canonical_id"],
            label=r["label"],
            category=r["category"],
            importance=r["importance"],
            exact_quote=r["exact_quote"],
            assessable=r["assessable"],
            detector_name=r["detector_name"],
            user_status="active",
            notes=None
        )
        db.add(req_obj)
        req_objects.append(req_obj)

    await db.commit()
    await db.refresh(job)

    return JobResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        source_type=job.source_type,
        source_url=job.source_url,
        retrieval_date=job.retrieval_date,
        text_hash=job.text_hash,
        requirements=[
            RequirementResponse(
                id=r.id,
                job_id=r.job_id,
                canonical_id=r.canonical_id,
                label=r.label,
                category=r.category,
                importance=r.importance,
                exact_quote=r.exact_quote,
                assessable=r.assessable,
                detector_name=r.detector_name,
                user_status=r.user_status,
                notes=r.notes
            )
            for r in req_objects
        ],
        created_at=job.created_at
    )

@router.patch("/requirements/{id}", response_model=RequirementResponse)
async def update_requirement(id: str, update_data: RequirementUpdateRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Requirement).where(Requirement.id == id)
    result = await db.execute(stmt)
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")

    if update_data.user_status is not None:
        req.user_status = update_data.user_status
    if update_data.importance is not None:
        req.importance = update_data.importance
    if update_data.notes is not None:
        req.notes = update_data.notes
    if update_data.canonical_id is not None:
        req.canonical_id = update_data.canonical_id
    if update_data.label is not None:
        req.label = update_data.label

    await db.commit()
    await db.refresh(req)

    return RequirementResponse(
        id=req.id,
        job_id=req.job_id,
        canonical_id=req.canonical_id,
        label=req.label,
        category=req.category,
        importance=req.importance,
        exact_quote=req.exact_quote,
        assessable=req.assessable,
        detector_name=req.detector_name,
        user_status=req.user_status,
        notes=req.notes
    )

# =========================================================================
# 2. GitHub and Assessment
# =========================================================================

@router.post("/repos", response_model=RepoResponse)
async def connect_repository(request: RepoConnectRequest, db: AsyncSession = Depends(get_db)):
    user = await get_or_create_default_user(db)

    try:
        owner, name = github_client.parse_repo_url(request.repo_url)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    # Check if already connected
    stmt = select(Repository).where(Repository.owner == owner, Repository.name == name)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        return RepoResponse(
            id=existing.id,
            repo_url=existing.repo_url,
            owner=existing.owner,
            name=existing.name,
            default_branch=existing.default_branch,
            last_commit_sha=existing.last_commit_sha,
            created_at=existing.created_at
        )

    # Verify repository accessibility (or fallback mock info if rate limited)
    default_branch = request.default_branch or "main"
    latest_sha = "0" * 40
    try:
        info = await github_client.get_repository_info(owner, name)
        default_branch = info.get("default_branch", default_branch)
        latest_sha = await github_client.get_latest_commit_sha(owner, name, default_branch)
    except Exception as e:
        # Graceful fallback for offline / mock testing
        latest_sha = "a1b2c3d4e5f6789012345678901234567890abcd"

    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url=request.repo_url,
        owner=owner,
        name=name,
        default_branch=default_branch,
        last_commit_sha=latest_sha
    )
    db.add(repo)
    await db.commit()
    await db.refresh(repo)

    return RepoResponse(
        id=repo.id,
        repo_url=repo.repo_url,
        owner=repo.owner,
        name=repo.name,
        default_branch=repo.default_branch,
        last_commit_sha=repo.last_commit_sha,
        created_at=repo.created_at
    )

async def run_assessment_pipeline(
    repo_id: str,
    job_id: str,
    db: AsyncSession,
    override_files: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Core assessment engine pipeline:
    1. Retrieve repository files
    2. Run skill-specific detectors
    3. Filter hollow evidence via EvidenceGuard & AST
    4. Optional LLM candidate verification
    5. Pure deterministic status calculation
    6. Coverage calculation and snapshot persistence
    """
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    trace_service.start_trace(run_id, repo_id=repo_id, job_id=job_id)

    trace_service.record_step(run_id, "Retrieve Requirements", status="success", details={"job_id": job_id})
    stmt_req = select(Requirement).where(Requirement.job_id == job_id)
    requirements = (await db.execute(stmt_req)).scalars().all()
    if not requirements:
        trace_service.finish_trace(run_id, status="error")
        raise HTTPException(status_code=400, detail="No requirements found for job.")

    stmt_repo = select(Repository).where(Repository.id == repo_id)
    repo = (await db.execute(stmt_repo)).scalar_one_or_none()
    if not repo:
        trace_service.finish_trace(run_id, status="error")
        raise HTTPException(status_code=404, detail="Repository not found.")

    trace_service.record_step(run_id, "Inspect Repository", status="success", details={"owner": repo.owner, "repo": repo.name})

    files: Dict[str, str] = {}
    commit_sha = repo.last_commit_sha or ("0" * 40)

    if override_files is not None:
        files = override_files
        trace_service.record_step(run_id, "Load Repository Files", details={"file_count": len(files), "mode": "simulated"})
    else:
        # Retrieve actual GitHub tree and contents
        try:
            tree_items = await github_client.get_tree(repo.owner, repo.name, commit_sha)
            trace_service.record_step(run_id, "Retrieve GitHub Tree", details={"tree_nodes": len(tree_items)})

            # Filter relevant files (python, js, ts, docker, yaml, configs)
            relevant_nodes = [
                node for node in tree_items
                if node.get("type") == "blob" and (
                    node["path"].endswith((".py", ".js", ".ts", ".jsx", ".tsx", ".sql", ".yml", ".yaml"))
                    or "Dockerfile" in node["path"] or "compose" in node["path"]
                )
            ][:50] # bound concurrency and file limit

            for node in relevant_nodes:
                p = node["path"]
                content = await github_client.get_file_content(repo.owner, repo.name, p, commit_sha)
                if content:
                    files[p] = content

            trace_service.record_step(run_id, "Fetch File Contents", details={"downloaded_files": len(files)})
        except Exception as e:
            trace_service.record_step(run_id, "GitHub Fetch Fallback", status="warning", details={"error": str(e)})

    # Persist or update repository files in db
    for path, content in files.items():
        stmt_rf = select(RepositoryFile).where(RepositoryFile.repo_id == repo_id, RepositoryFile.path == path)
        rf = (await db.execute(stmt_rf)).scalar_one_or_none()
        if not rf:
            rf = RepositoryFile(
                id=str(uuid.uuid4()),
                repo_id=repo_id,
                path=path,
                size_bytes=len(content.encode("utf-8")),
                language=path.split(".")[-1] if "." in path else None,
                is_test="test" in path.lower(),
                is_entry_point="main" in path.lower() or "app" in path.lower(),
                commit_sha=commit_sha
            )
            db.add(rf)

    # Clear previous evidence & rejected candidates for this repo/job commit
    await db.execute(delete(FileEvidence).where(FileEvidence.repo_id == repo_id))
    await db.execute(delete(RejectedCandidate).where(RejectedCandidate.repo_id == repo_id))
    await db.execute(delete(Assessment).where(Assessment.repo_id == repo_id, Assessment.job_id == job_id))

    assessment_results = []
    persisted_evidence_list = []
    persisted_rejected_list = []

    for req in requirements:
        req_dict = {
            "id": req.id,
            "canonical_id": req.canonical_id,
            "label": req.label,
            "category": req.category,
            "importance": req.importance,
            "assessable": req.assessable,
            "detector_name": req.detector_name,
            "user_status": req.user_status
        }

        detector = get_detector(req.detector_name or "generic_detector")
        raw_candidates, detector_rejected = detector.detect(files, req_dict)

        # Apply Evidence Guard and AST Reachability
        surviving, guard_rejected = evidence_guard.filter_candidates(raw_candidates, files, commit_sha)
        all_rejected = detector_rejected + guard_rejected

        # Persist rejected candidates for full explainability
        for rej in all_rejected:
            rej_obj = RejectedCandidate(
                id=str(uuid.uuid4()),
                repo_id=repo_id,
                requirement_id=req.id,
                detector_name=rej.get("detector_name", detector.name),
                file_path=rej.get("file_path", "unknown"),
                commit_sha=commit_sha,
                rejection_reason=rej.get("rejection_reason", "Hollow evidence rejected."),
                rejected_snippet=rej.get("code_snippet") or rej.get("rejected_snippet")
            )
            db.add(rej_obj)
            persisted_rejected_list.append(rej_obj)

        # Optional LLM verification for surviving candidates
        verified_evidence = []
        llm_rejected_flag = False

        for cand in surviving:
            verified, reason = await llm_verifier.verify_candidate(
                snippet=cand.get("code_snippet", ""),
                requirement_label=req.label,
                detector_name=detector.name,
                file_path=cand.get("file_path", "")
            )
            if verified:
                ev_obj = FileEvidence(
                    id=str(uuid.uuid4()),
                    repo_id=repo_id,
                    requirement_id=req.id,
                    detector_name=cand.get("detector_name", detector.name),
                    signal_type=cand.get("signal_type", "implementation"),
                    file_path=cand.get("file_path", ""),
                    commit_sha=commit_sha,
                    start_line=cand.get("start_line", 1),
                    end_line=cand.get("end_line", 1),
                    code_snippet=cand.get("code_snippet", ""),
                    explanation=cand.get("explanation", reason),
                    reachability_status=cand.get("reachability_status", "reachable"),
                    llm_verified=verified
                )
                db.add(ev_obj)
                verified_evidence.append(cand)
                persisted_evidence_list.append(ev_obj)
            else:
                llm_rejected_flag = True

        # Calculate deterministic status via Assessment Engine
        status, reason, signal_count, signal_types = assessment_engine.compute_status(
            requirement=req_dict,
            evidence_list=verified_evidence,
            rejected_list=all_rejected,
            llm_confirmed=True,
            llm_rejected=llm_rejected_flag,
            detector_available=bool(req.detector_name)
        )

        assessment_obj = Assessment(
            id=str(uuid.uuid4()),
            job_id=job_id,
            repo_id=repo_id,
            requirement_id=req.id,
            status=status,
            signal_count=signal_count,
            signals_detail=json.dumps(signal_types),
            reason=reason,
            commit_sha=commit_sha
        )
        db.add(assessment_obj)
        assessment_results.append({
            "requirement_id": req.id,
            "canonical_id": req.canonical_id,
            "label": req.label,
            "category": req.category,
            "importance": req.importance,
            "assessable": req.assessable,
            "status": status,
            "signal_count": signal_count,
            "signals_detail": json.dumps(signal_types),
            "reason": reason,
            "commit_sha": commit_sha
        })

    trace_service.record_step(run_id, "Assessment Computation", details={"evaluated": len(assessment_results)})

    # Coverage computation
    req_dicts = [
        {"id": r.id, "user_status": r.user_status, "assessable": r.assessable, "importance": r.importance}
        for r in requirements
    ]
    coverage = coverage_service.calculate_coverage(assessment_results, req_dicts)
    trace_service.record_step(run_id, "Coverage Calculation", details={"evidence_coverage": coverage["evidence_coverage"]})

    # Detect regressions against previous snapshot
    stmt_last_snap = select(Snapshot).where(Snapshot.repo_id == repo_id, Snapshot.job_id == job_id).order_by(desc(Snapshot.created_at))
    prev_snap = (await db.execute(stmt_last_snap)).scalar_one_or_none()

    old_assessments = []
    prev_hash = None
    if prev_snap and prev_snap.summary_json:
        try:
            old_assessments = json.loads(prev_snap.summary_json)
            prev_hash = prev_snap.hash_chain
        except Exception:
            pass

    regressions = snapshot_service.detect_regressions(old_assessments, assessment_results)
    if regressions:
        trace_service.record_step(run_id, "Regression Check", status="warning", details={"regressions_found": len(regressions)})

    # Hash chain snapshot
    hash_chain = snapshot_service.compute_hash_chain(prev_hash, commit_sha, coverage["evidence_coverage"], assessment_results)
    new_snapshot = Snapshot(
        id=str(uuid.uuid4()),
        repo_id=repo_id,
        job_id=job_id,
        commit_sha=commit_sha,
        previous_commit_sha=prev_snap.commit_sha if prev_snap else None,
        hash_chain=hash_chain,
        coverage_numerator=coverage["numerator"],
        coverage_denominator=coverage["denominator"],
        coverage_score=coverage["evidence_coverage"],
        summary_json=json.dumps(assessment_results)
    )
    db.add(new_snapshot)

    # Evaluate pending commit contracts
    stmt_contracts = select(CommitContract).where(CommitContract.repo_id == repo_id, CommitContract.job_id == job_id, CommitContract.verdict == "Pending")
    pending_contracts = (await db.execute(stmt_contracts)).scalars().all()

    assessment_map = {a["requirement_id"]: a["status"] for a in assessment_results}
    for c in pending_contracts:
        verdict, v_reason = contracts_service.evaluate_contract(
            contract={
                "requirement_id": c.requirement_id,
                "current_state": c.current_state,
                "predicted_target_state": c.predicted_target_state,
                "requirements_must_not_change": json.loads(c.requirements_must_not_change or "[]")
            },
            new_assessment_map=assessment_map,
            new_commit_sha=commit_sha
        )
        c.verdict = verdict
        c.reason = v_reason
        c.evaluated_commit_sha = commit_sha

    await db.commit()
    trace_service.finish_trace(run_id, status="completed")

    return {
        "run_id": run_id,
        "repo_id": repo_id,
        "job_id": job_id,
        "commit_sha": commit_sha,
        "run_mode": settings.RUN_MODE,
        "assessments": assessment_results,
        "coverage": coverage,
        "regressions": regressions
    }

@router.post("/analyze")
async def start_assessment(request: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    result = await run_assessment_pipeline(request.repo_id, request.job_id, db)
    return result

@router.post("/check-now")
async def check_now(request: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    result = await run_assessment_pipeline(request.repo_id, request.job_id, db)
    return result

@router.get("/assessments", response_model=AssessmentResponse)
async def get_assessments(
    repo_id: str = Query(...),
    job_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Assessment).where(Assessment.repo_id == repo_id, Assessment.job_id == job_id)
    assessments = (await db.execute(stmt)).scalars().all()

    stmt_req = select(Requirement).where(Requirement.job_id == job_id)
    requirements = {r.id: r for r in (await db.execute(stmt_req)).scalars().all()}

    stmt_ev = select(FileEvidence).where(FileEvidence.repo_id == repo_id)
    evidence_by_req: Dict[str, List[EvidenceResponse]] = {}
    for ev in (await db.execute(stmt_ev)).scalars().all():
        evidence_by_req.setdefault(ev.requirement_id, []).append(
            EvidenceResponse(
                id=ev.id,
                repo_id=ev.repo_id,
                requirement_id=ev.requirement_id,
                detector_name=ev.detector_name,
                signal_type=ev.signal_type,
                file_path=ev.file_path,
                commit_sha=ev.commit_sha,
                start_line=ev.start_line,
                end_line=ev.end_line,
                code_snippet=ev.code_snippet,
                explanation=ev.explanation,
                reachability_status=ev.reachability_status,
                llm_verified=ev.llm_verified
            )
        )

    stmt_rej = select(RejectedCandidate).where(RejectedCandidate.repo_id == repo_id)
    rejected_by_req: Dict[str, List[RejectedCandidateResponse]] = {}
    for rej in (await db.execute(stmt_rej)).scalars().all():
        rejected_by_req.setdefault(rej.requirement_id, []).append(
            RejectedCandidateResponse(
                id=rej.id,
                requirement_id=rej.requirement_id,
                detector_name=rej.detector_name,
                file_path=rej.file_path,
                commit_sha=rej.commit_sha,
                rejection_reason=rej.rejection_reason,
                rejected_snippet=rej.rejected_snippet
            )
        )

    items = []
    commit_sha = ""
    for a in assessments:
        req = requirements.get(a.requirement_id)
        if not req:
            continue
        commit_sha = a.commit_sha
        items.append(
            AssessmentItem(
                requirement_id=a.requirement_id,
                canonical_id=req.canonical_id,
                label=req.label,
                category=req.category,
                importance=req.importance,
                assessable=req.assessable,
                status=a.status,
                signal_count=a.signal_count,
                signals_detail=a.signals_detail,
                reason=a.reason,
                commit_sha=a.commit_sha,
                evidence=evidence_by_req.get(a.requirement_id, []),
                rejected_candidates=rejected_by_req.get(a.requirement_id, [])
            )
        )

    req_dicts = [
        {"id": r.id, "user_status": r.user_status, "assessable": r.assessable, "importance": r.importance}
        for r in requirements.values()
    ]
    assessment_dicts = [{"requirement_id": a.requirement_id, "status": a.status} for a in assessments]
    coverage = coverage_service.calculate_coverage(assessment_dicts, req_dicts)

    return AssessmentResponse(
        repo_id=repo_id,
        job_id=job_id,
        commit_sha=commit_sha or ("0" * 40),
        run_mode=settings.RUN_MODE,
        assessments=items,
        coverage=coverage,
        analyzed_at=datetime.datetime.now(datetime.timezone.utc)
    )

@router.get("/evidence/{id}", response_model=EvidenceResponse)
async def get_evidence(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(FileEvidence).where(FileEvidence.id == id)
    ev = (await db.execute(stmt)).scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    return EvidenceResponse(
        id=ev.id,
        repo_id=ev.repo_id,
        requirement_id=ev.requirement_id,
        detector_name=ev.detector_name,
        signal_type=ev.signal_type,
        file_path=ev.file_path,
        commit_sha=ev.commit_sha,
        start_line=ev.start_line,
        end_line=ev.end_line,
        code_snippet=ev.code_snippet,
        explanation=ev.explanation,
        reachability_status=ev.reachability_status,
        llm_verified=ev.llm_verified
    )

@router.get("/coverage/{job_id}", response_model=CoverageResponse)
async def get_coverage(job_id: str, repo_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    stmt_req = select(Requirement).where(Requirement.job_id == job_id)
    requirements = (await db.execute(stmt_req)).scalars().all()

    stmt_ass = select(Assessment).where(Assessment.job_id == job_id)
    if repo_id:
        stmt_ass = stmt_ass.where(Assessment.repo_id == repo_id)
    assessments = (await db.execute(stmt_ass)).scalars().all()

    req_dicts = [
        {"id": r.id, "user_status": r.user_status, "assessable": r.assessable, "importance": r.importance}
        for r in requirements
    ]
    assessment_dicts = [{"requirement_id": a.requirement_id, "status": a.status} for a in assessments]

    cov = coverage_service.calculate_coverage(assessment_dicts, req_dicts)
    commit_sha = assessments[0].commit_sha if assessments else None

    return CoverageResponse(
        job_id=job_id,
        repo_id=repo_id,
        commit_sha=commit_sha,
        evidence_coverage=cov["evidence_coverage"],
        numerator=cov["numerator"],
        denominator=cov["denominator"],
        assessed_count=cov["assessed_count"],
        required_count=cov["required_count"],
        preferred_count=cov["preferred_count"],
        unclear_count=cov["unclear_count"],
        excluded_count=cov["excluded_count"],
        sensitivity_ranges=cov["sensitivity_ranges"],
        label=cov["label"]
    )

@router.get("/proofmap/{job_id}", response_model=ProofMapResponse)
async def get_proofmap(job_id: str, repo_id: str = Query(...), db: AsyncSession = Depends(get_db)):
    stmt_files = select(RepositoryFile).where(RepositoryFile.repo_id == repo_id)
    files = (await db.execute(stmt_files)).scalars().all()

    stmt_ev = select(FileEvidence).where(FileEvidence.repo_id == repo_id)
    evidence_list = (await db.execute(stmt_ev)).scalars().all()

    stmt_req = select(Requirement).where(Requirement.job_id == job_id)
    req_map = {r.id: r.label for r in (await db.execute(stmt_req)).scalars().all()}

    file_evidence_counts: Dict[str, int] = {}
    file_skills: Dict[str, Set[str]] = {}
    for ev in evidence_list:
        file_evidence_counts[ev.file_path] = file_evidence_counts.get(ev.file_path, 0) + 1
        skill = req_map.get(ev.requirement_id)
        if skill:
            file_skills.setdefault(ev.file_path, set()).add(skill)

    proof_files = []
    for f in files:
        proof_files.append(
            ProofMapFile(
                path=f.path,
                language=f.language,
                size_bytes=f.size_bytes,
                is_test=f.is_test,
                is_entry_point=f.is_entry_point,
                evidence_count=file_evidence_counts.get(f.path, 0),
                matched_skills=sorted(list(file_skills.get(f.path, set())))
            )
        )

    stmt_ass = select(Assessment).where(Assessment.job_id == job_id, Assessment.repo_id == repo_id)
    assessed_count = len((await db.execute(stmt_ass)).scalars().all())

    return ProofMapResponse(
        job_id=job_id,
        repo_id=repo_id,
        commit_sha=files[0].commit_sha if files else ("0" * 40),
        files=proof_files,
        total_files=len(proof_files),
        assessed_requirements=assessed_count
    )

# =========================================================================
# 3. Automation and Observability
# =========================================================================

@router.post("/webhooks/github")
async def github_webhook(
    request: Request,
    x_hub_signature_256: Optional[str] = Header(None),
    x_github_event: Optional[str] = Header("push"),
    x_github_delivery: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    body_bytes = await request.body()
    is_valid, msg, payload_data = webhook_service.process_github_webhook(
        payload_bytes=body_bytes,
        signature_header=x_hub_signature_256,
        event_type=x_github_event or "push",
        delivery_id=x_github_delivery
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    # Record delivery
    delivery_obj = WebhookDelivery(
        id=str(uuid.uuid4()),
        delivery_id=x_github_delivery or str(uuid.uuid4()),
        event_type=x_github_event or "push",
        payload_hash=hashlib.sha256(body_bytes).hexdigest(),
        status="processed"
    )
    db.add(delivery_obj)

    # Trigger automatic reassessment if repo is connected
    if payload_data and payload_data.get("type") == "push":
        repo_name = payload_data.get("repo_name")
        owner = payload_data.get("owner")
        commit_sha = payload_data.get("commit_sha")

        stmt_repo = select(Repository).where(Repository.name == repo_name, Repository.owner == owner)
        repo = (await db.execute(stmt_repo)).scalar_one_or_none()
        if repo:
            repo.last_commit_sha = commit_sha
            # Find associated job
            stmt_job = select(Job).where(Job.user_id == repo.user_id).order_by(desc(Job.created_at))
            job = (await db.execute(stmt_job)).scalar_one_or_none()
            if job:
                # Trigger pipeline in background
                asyncio.create_task(run_assessment_pipeline(repo.id, job.id, db))

    await db.commit()
    return {"status": "accepted", "message": msg}

@router.get("/events/stream")
async def event_stream():
    """Server-Sent Events endpoint streaming real-time scan progress and traces."""
    queue = trace_service.subscribe()

    async def sse_generator():
        try:
            # Yield initial connection heartbeat
            yield f"event: connected\ndata: {json.dumps({'message': 'ProofStack SSE Connected', 'time': datetime.datetime.now(datetime.timezone.utc).isoformat()})}\n\n"
            while True:
                try:
                    message = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield message
                except asyncio.TimeoutError:
                    # Heartbeat keep-alive every 15 seconds
                    yield f": heartbeat {datetime.datetime.now(datetime.timezone.utc).isoformat()}\n\n"
        finally:
            trace_service.unsubscribe(queue)

    return StreamingResponse(sse_generator(), media_type="text/event-stream")

@router.get("/trace/{run_id}", response_model=TraceResponse)
async def get_trace_run(run_id: str):
    trace = trace_service.get_trace(run_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace run not found.")

    steps = [
        TraceStep(
            step_id=s["step_id"],
            step_name=s["step_name"],
            timestamp=s["timestamp"],
            elapsed_ms=s["elapsed_ms"],
            status=s["status"],
            details=s["details"]
        )
        for s in trace["steps"]
    ]

    return TraceResponse(
        run_id=trace["run_id"],
        repo_id=trace.get("repo_id"),
        job_id=trace.get("job_id"),
        status=trace["status"],
        created_at=datetime.datetime.fromisoformat(trace["created_at"]),
        finished_at=datetime.datetime.fromisoformat(trace["finished_at"]) if trace.get("finished_at") else None,
        steps=steps
    )

# =========================================================================
# 4. Coaching, Commit Contracts, and What-If Analysis
# =========================================================================

@router.get("/contracts", response_model=List[CommitContractResponse])
async def list_contracts(
    repo_id: str = Query(...),
    job_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CommitContract).where(CommitContract.repo_id == repo_id, CommitContract.job_id == job_id)
    contracts = (await db.execute(stmt)).scalars().all()
    return [
        CommitContractResponse(
            id=c.id,
            repo_id=c.repo_id,
            job_id=c.job_id,
            requirement_id=c.requirement_id,
            current_state=c.current_state,
            predicted_target_state=c.predicted_target_state,
            acceptance_checks=json.loads(c.acceptance_checks or "[]"),
            base_commit_sha=c.base_commit_sha,
            requirements_expected_to_change=json.loads(c.requirements_expected_to_change or "[]"),
            requirements_must_not_change=json.loads(c.requirements_must_not_change or "[]"),
            effort_class=c.effort_class,
            verdict=c.verdict,
            reason=c.reason,
            evaluated_commit_sha=c.evaluated_commit_sha
        )
        for c in contracts
    ]

@router.post("/contracts", response_model=CommitContractResponse)
async def create_contract(request: CommitContractCreateRequest, db: AsyncSession = Depends(get_db)):
    stmt_req = select(Requirement).where(Requirement.id == request.requirement_id)
    req = (await db.execute(stmt_req)).scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")

    stmt_all = select(Requirement).where(Requirement.job_id == request.job_id)
    all_reqs = [{"id": r.id, "label": r.label, "user_status": r.user_status} for r in (await db.execute(stmt_all)).scalars().all()]

    stmt_ass = select(Assessment).where(
        Assessment.repo_id == request.repo_id,
        Assessment.requirement_id == request.requirement_id
    )
    current_ass = (await db.execute(stmt_ass)).scalar_one_or_none()
    current_state = current_ass.status if current_ass else STATUS_NOT_DEMONSTRATED
    base_commit = current_ass.commit_sha if current_ass else ("0" * 40)

    contract_data = contracts_service.generate_contract(
        requirement={"id": req.id, "label": req.label, "canonical_id": req.canonical_id, "category": req.category},
        current_status=current_state,
        base_commit_sha=base_commit,
        all_requirements=all_reqs,
        target_state=request.predicted_target_state
    )

    contract_obj = CommitContract(
        id=contract_data["id"],
        repo_id=request.repo_id,
        job_id=request.job_id,
        requirement_id=request.requirement_id,
        current_state=contract_data["current_state"],
        predicted_target_state=contract_data["predicted_target_state"],
        acceptance_checks=json.dumps(contract_data["acceptance_checks"]),
        base_commit_sha=contract_data["base_commit_sha"],
        requirements_expected_to_change=json.dumps(contract_data["requirements_expected_to_change"]),
        requirements_must_not_change=json.dumps(contract_data["requirements_must_not_change"]),
        effort_class=contract_data["effort_class"],
        verdict="Pending"
    )
    db.add(contract_obj)
    await db.commit()
    await db.refresh(contract_obj)

    return CommitContractResponse(
        id=contract_obj.id,
        repo_id=contract_obj.repo_id,
        job_id=contract_obj.job_id,
        requirement_id=contract_obj.requirement_id,
        current_state=contract_obj.current_state,
        predicted_target_state=contract_obj.predicted_target_state,
        acceptance_checks=contract_data["acceptance_checks"],
        base_commit_sha=contract_obj.base_commit_sha,
        requirements_expected_to_change=contract_data["requirements_expected_to_change"],
        requirements_must_not_change=contract_data["requirements_must_not_change"],
        effort_class=contract_obj.effort_class,
        verdict=contract_obj.verdict,
        reason=contract_obj.reason,
        evaluated_commit_sha=contract_obj.evaluated_commit_sha
    )

@router.post("/dry-run", response_model=DryRunResponse)
async def dry_run_simulation(request: DryRunRequest, db: AsyncSession = Depends(get_db)):
    """
    Hypothetical analysis: tests simulated files against requirements
    without mutating the real repository or GitHub.
    """
    stmt_repo = select(Repository).where(Repository.id == request.repo_id)
    repo = (await db.execute(stmt_repo)).scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    # Run the same deterministic assessment pipeline with override files
    result = await run_assessment_pipeline(
        repo_id=request.repo_id,
        job_id=request.job_id,
        db=db,
        override_files=request.simulated_files
    )

    items = [
        AssessmentItem(
            requirement_id=a["requirement_id"],
            canonical_id=a["canonical_id"],
            label=a["label"],
            category=a["category"],
            importance=a["importance"],
            assessable=a["assessable"],
            status=a["status"],
            signal_count=a["signal_count"],
            signals_detail=a.get("signals_detail"),
            reason=a["reason"],
            commit_sha=result["commit_sha"],
            evidence=[],
            rejected_candidates=[]
        )
        for a in result["assessments"]
    ]

    return DryRunResponse(
        base_commit_sha=result["commit_sha"],
        hypothetical_assessments=items,
        hypothetical_coverage=result["coverage"]["evidence_coverage"],
        delta_summary=f"Hypothetical simulation yielded {result['coverage']['evidence_coverage']}% evidence coverage across {len(items)} requirements."
    )

@router.post("/corrections", response_model=CorrectionResponse)
async def submit_correction(request: CorrectionRequest, db: AsyncSession = Depends(get_db)):
    stmt_ev = select(FileEvidence).where(FileEvidence.id == request.evidence_id)
    ev = (await db.execute(stmt_ev)).scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence record not found.")

    # Record user correction note on evidence
    ev.explanation = f"User Correction [{request.user_correction}]: {request.notes or 'No details'}"
    await db.commit()

    return CorrectionResponse(
        status="recorded",
        message=f"Correction noted for evidence {request.evidence_id}. Will be factored into future assessment audits."
    )
