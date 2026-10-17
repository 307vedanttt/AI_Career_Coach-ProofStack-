import pytest
import pytest_asyncio
import uuid
import datetime
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.db.session import init_db, AsyncSessionLocal
from backend.models.models import User
from backend.services.organization_service import organization_service
from backend.services.security import sign_data
from backend.config import settings

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    await init_db()

async def create_user(username_prefix: str = "lead") -> User:
    user_id = str(uuid.uuid4())
    username = f"{username_prefix}-{uuid.uuid4().hex[:6]}"
    async with AsyncSessionLocal() as db:
        user = User(
            id=user_id,
            username=username,
            email=f"{username}@enterprise.co",
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(user)
        await db.commit()
    return user

@pytest.mark.asyncio
async def test_create_organization_and_owner_membership():
    user = await create_user("founder")
    async with AsyncSessionLocal() as db:
        org = await organization_service.create_organization(
            db=db,
            user_id=user.id,
            name="Acme Global Tech",
            slug="acme-global",
            tier="enterprise"
        )
        assert org.id is not None
        assert org.name == "Acme Global Tech"
        assert "acme-global" in org.slug
        assert org.tier == "enterprise"
        assert org.max_seats == 25

        # Check membership
        member = await organization_service.check_membership(db, org.id, user.id)
        assert member is not None
        assert member.role == "owner"
        assert member.status == "active"

        # Check audit log
        logs = await organization_service.get_audit_logs(db, org.id)
        assert len(logs) >= 1
        assert logs[0]["action"] == "org.created"

@pytest.mark.asyncio
async def test_user_organizations_auto_provisions_personal_workspace():
    user = await create_user("solodev")
    async with AsyncSessionLocal() as db:
        orgs = await organization_service.get_user_organizations(db, user)
        assert len(orgs) == 1
        assert "Workspace" in orgs[0]["name"]
        assert orgs[0]["role"] == "owner"

@pytest.mark.asyncio
async def test_invite_member_and_rbac_permissions():
    user = await create_user("eng-lead")
    async with AsyncSessionLocal() as db:
        org = await organization_service.create_organization(
            db=db,
            user_id=user.id,
            name="Stripe Platform Engineering",
            slug="stripe-plat"
        )

        # Owner invites recruiter
        recruiter_member = await organization_service.add_or_invite_member(
            db=db,
            org_id=org.id,
            actor_id=user.id,
            email="hiring.lead@stripe.com",
            role="recruiter"
        )
        assert recruiter_member.role == "recruiter"
        assert recruiter_member.invited_email == "hiring.lead@stripe.com"

        # Create engineer user
        eng_user = await create_user("dev-alex")

        engineer_member = await organization_service.add_or_invite_member(
            db=db,
            org_id=org.id,
            actor_id=user.id,
            email=eng_user.email,
            role="engineer"
        )
        assert engineer_member.role == "engineer"
        assert engineer_member.user_id == eng_user.id

        # Engineer attempts to invite another member -> should raise PermissionError
        with pytest.raises(PermissionError):
            await organization_service.add_or_invite_member(
                db=db,
                org_id=org.id,
                actor_id=eng_user.id,
                email="another@stripe.com",
                role="recruiter"
            )

@pytest.mark.asyncio
async def test_candidate_evaluation_lifecycle():
    user = await create_user("recruiter-sarah")
    async with AsyncSessionLocal() as db:
        org = await organization_service.create_organization(
            db=db,
            user_id=user.id,
            name="Scale AI Talent Operations",
            slug="scale-ai-ops"
        )

        evaluation = await organization_service.create_candidate_evaluation(
            db=db,
            org_id=org.id,
            actor_id=user.id,
            candidate_name="Sarah Connor",
            candidate_email="sarah.connor@sky.net",
            github_handle="sconnor-dev",
            recruiter_notes="Strong AST verification on distributed systems route handlers."
        )
        assert evaluation.id is not None
        assert evaluation.candidate_name == "Sarah Connor"
        assert evaluation.share_token is not None
        assert evaluation.evaluation_status == "verified"

        # Retrieve by share token
        dossier = await organization_service.get_candidate_evaluation_by_token(db, evaluation.share_token)
        assert dossier is not None
        assert dossier["candidate_name"] == "Sarah Connor"
        assert dossier["organization_name"] == "Scale AI Talent Operations"
        assert dossier["integrity_signals"]["plagiarism_check"] == "passed"

@pytest.mark.asyncio
async def test_enterprise_api_routes():
    user = await create_user("api-admin")
    session_token = sign_data(user.id, settings.APP_SESSION_SECRET)

    transport = ASGITransport(app=app)
    cookies = {"proofstack_session": session_token}

    async with AsyncClient(transport=transport, base_url="http://test", cookies=cookies) as client:
        # 1. Create Organization via API
        resp = await client.post(
            "/api/organizations",
            json={"name": "Vercel Platform Labs", "slug": "vercel-platform-labs", "tier": "enterprise"}
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        org_id = data["id"]
        assert "vercel-platform-labs" in data["slug"]
        assert data["role"] == "owner"

        # 2. List user's organizations
        resp_me = await client.get("/api/organizations/me")
        assert resp_me.status_code == 200
        org_list = resp_me.json()
        assert any(o["id"] == org_id for o in org_list)

        # 3. Invite a member
        resp_invite = await client.post(
            f"/api/organizations/{org_id}/members",
            json={"email": "recruiter@vercel.com", "role": "recruiter"}
        )
        assert resp_invite.status_code == 200
        member_data = resp_invite.json()
        assert member_data["role"] == "recruiter"

        # 4. List members
        resp_members = await client.get(f"/api/organizations/{org_id}/members")
        assert resp_members.status_code == 200
        assert len(resp_members.json()) >= 2

        # 5. Create Candidate Evaluation
        resp_candidate = await client.post(
            f"/api/organizations/{org_id}/candidates",
            json={
                "candidate_name": "Elena Rostova",
                "candidate_email": "elena@crypto.io",
                "github_handle": "elena-dev",
                "recruiter_notes": "Passed AST verification with 94% code invariant match"
            }
        )
        assert resp_candidate.status_code == 200
        candidate_data = resp_candidate.json()
        share_token = candidate_data["share_token"]
        assert share_token is not None

        # 6. Verify candidate via public share token
        resp_verify = await client.get(f"/api/candidates/verify/{share_token}")
        assert resp_verify.status_code == 200
        public_dossier = resp_verify.json()
        assert public_dossier["candidate_name"] == "Elena Rostova"
        assert public_dossier["organization_name"] == "Vercel Platform Labs"

        # 7. Query Audit Logs
        resp_logs = await client.get(f"/api/organizations/{org_id}/audit-logs")
        assert resp_logs.status_code == 200
        logs = resp_logs.json()
        assert len(logs) >= 3 # org.created, org.member.invited, candidate.evaluation.created
