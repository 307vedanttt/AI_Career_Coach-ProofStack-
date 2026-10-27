import pytest
import pytest_asyncio
import uuid
import json
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.db.session import init_db, AsyncSessionLocal
from backend.models.models import User, ResumeExtraction, AtsRun
from backend.services.security import sign_data, generate_csrf_token
from backend.config import settings

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_invalid_api_key_fails_with_401():
    """Step 2: Admin routes & auth - invalid/forged API keys must not fall through to default user."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid / fake API key
        resp = await client.get("/api/me", headers={"X-API-Key": "malicious_fake_token_12345"})
        assert resp.status_code == 401
        assert "invalid" in resp.json()["detail"].lower()

        # Invalid Bearer token
        resp_bearer = await client.get("/api/me", headers={"Authorization": "Bearer forged_secret_token"})
        assert resp_bearer.status_code == 401
        assert "invalid" in resp_bearer.json()["detail"].lower()

@pytest.mark.asyncio
async def test_dev_login_and_dev_oauth_forbidden_in_production(monkeypatch):
    """Step 2: Admin routes - dev bypasses are strictly forbidden in production."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Dev login POST in production -> 403 Forbidden
        dev_resp = await client.post("/api/auth/dev-login")
        assert dev_resp.status_code == 403
        assert "disabled in production" in dev_resp.json()["detail"].lower()

        # OAuth dev=1 bypass query param in production -> 403 Forbidden
        oauth_resp = await client.get("/auth/github/start?dev=1")
        assert oauth_resp.status_code == 403
        assert "disabled in production" in oauth_resp.json()["detail"].lower()

@pytest.mark.asyncio
async def test_settings_requires_auth_and_masks_token_substrings(monkeypatch):
    """Step 1 & 2: Settings route requires authentication in production and never leaks raw key prefixes/suffixes."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Unauthenticated request to /api/settings in production -> 401 Unauthorized
        unauth_resp = await client.get("/api/settings")
        assert unauth_resp.status_code == 401

    # In authenticated development mode, verify token masking never reveals raw characters
    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(settings, "GITHUB_TOKEN", "ghp_real_secret_token_123456789")
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/settings")
        assert resp.status_code == 200
        data = resp.json()
        assert data["has_github_token"] is True
        assert data["masked_github_token"] == "***configured***"
        assert "ghp_" not in data["masked_github_token"]
        assert "123456789" not in data["masked_github_token"]

@pytest.mark.asyncio
async def test_settings_mutation_requires_csrf():
    """Step 4: POST /api/settings requires double-submit CSRF token (not exempt)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # POST without CSRF token -> 403 Forbidden
        resp = await client.post("/api/settings", json={"llm_provider": "deterministic"})
        assert resp.status_code == 403
        assert "CSRF" in resp.json()["detail"]

@pytest.mark.asyncio
async def test_resume_latest_and_ats_strict_user_scoping_no_idor():
    """Step 2 & 4: Prevent IDOR - User A cannot access User B's resume or ATS analysis."""
    transport = ASGITransport(app=app)
    user_a_id = f"user-a-{uuid.uuid4().hex[:6]}"
    user_b_id = f"user-b-{uuid.uuid4().hex[:6]}"

    async with AsyncSessionLocal() as db:
        user_a = User(id=user_a_id, username=f"alice_{user_a_id}")
        user_b = User(id=user_b_id, username=f"bob_{user_b_id}")
        db.add_all([user_a, user_b])
        await db.commit()

        res_b_id = f"res-b-{uuid.uuid4().hex[:6]}"
        db.add(ResumeExtraction(
            id=res_b_id,
            user_id=user_b_id,
            file_name="bobs_confidential_resume.pdf",
            file_sha256=f"sha256_bobs_file_{res_b_id}",
            file_size_bytes=1024,
            char_count=500,
            skills_json=json.dumps([{"name": "Distributed Systems", "level": "advanced"}]),
            extracted_text_preview="Bob's secret proprietary work details"
        ))
        await db.commit()

    # User A logs in
    token_a = sign_data(user_a_id, settings.APP_SESSION_SECRET)
    csrf_token = generate_csrf_token()
    cookies_a = {"proofstack_session": token_a, "ps_csrf_token": csrf_token}
    headers_a = {"X-CSRF-Token": csrf_token}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. User A asks for /api/resume/latest -> Must NOT return Bob's resume!
        latest_resp = await client.get("/api/resume/latest", cookies=cookies_a, headers=headers_a)
        assert latest_resp.status_code == 200
        latest_data = latest_resp.json()
        assert latest_data["success"] is False
        assert "No resume uploaded yet" in latest_data["message"]

        # 2. User A attempts IDOR by requesting Bob's specific resume ATS analysis -> 404 Not Found
        ats_resp = await client.post(f"/api/resume/{res_b_id}/ats", cookies=cookies_a, headers=headers_a)
        assert ats_resp.status_code == 404
        assert "not found for user" in ats_resp.json()["detail"].lower()

@pytest.mark.asyncio
async def test_scanner_rejects_malformed_usernames():
    """Step 4: Strict input validation on public scanner endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Path traversal attempt in username
        resp_traversal = await client.post("/api/scanner/run", json={"username": "../../etc/passwd"})
        assert resp_traversal.status_code == 400
        assert "invalid github username format" in resp_traversal.json()["detail"].lower()

        # Special character injection attempt
        resp_special = await client.post("/api/scanner/run", json={"username": "user<script>alert(1)</script>"})
        assert resp_special.status_code == 400
        assert "invalid github username format" in resp_special.json()["detail"].lower()

        # Legitimate username succeeds
        resp_valid = await client.post("/api/scanner/run", json={"username": "octocat"})
        assert resp_valid.status_code == 200
        assert resp_valid.json()["target_user"] == "octocat"
