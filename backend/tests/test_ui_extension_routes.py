import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.db.session import init_db
from backend.models.models import User
from backend.services.security import sign_data
from backend.config import settings

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    await init_db()

@pytest.mark.asyncio
async def test_me_and_logout():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated request to /api/me must return 401
        unauth_resp = await client.get("/api/me")
        assert unauth_resp.status_code == 401

        # 2. Get CSRF token
        csrf_resp = await client.get("/api/csrf")
        assert csrf_resp.status_code == 200
        csrf_token = csrf_resp.json()["csrf_token"]

        # 3. Create a test user in DB & sign session
        from backend.db.session import AsyncSessionLocal
        import uuid
        user_id = str(uuid.uuid4())
        username = f"demo-user-{uuid.uuid4().hex[:6]}"
        async with AsyncSessionLocal() as db:
            user = User(id=user_id, username=username)
            db.add(user)
            await db.commit()

        signed_session = sign_data(user_id, settings.APP_SESSION_SECRET)
        auth_cookies = {
            "proofstack_session": signed_session,
            "ps_csrf_token": csrf_token,
        }
        auth_headers = {
            "X-CSRF-Token": csrf_token,
        }

        # 4. Authenticated /api/me returns 200
        auth_resp = await client.get("/api/me", cookies=auth_cookies)
        assert auth_resp.status_code == 200
        data = auth_resp.json()
        assert data["login"] == username
        assert "read:user" in data["scopes"]

        # 5. Logout clears cookies and returns 200
        logout_resp = await client.post("/api/logout", cookies=auth_cookies, headers=auth_headers)
        assert logout_resp.status_code == 200
        assert logout_resp.json()["logged_out"] is True

@pytest.mark.asyncio
async def test_adversarial_suite():
    transport = ASGITransport(app=app)
    csrf_token = "test_csrf_token"
    cookies = {"ps_csrf_token": csrf_token}
    headers = {"X-CSRF-Token": csrf_token}
    async with AsyncClient(transport=transport, base_url="http://test", cookies=cookies, headers=headers) as client:
        resp = await client.get("/api/adversarial")
        assert resp.status_code == 200
        data = resp.json()
        assert data["attacks_sent"] == 10
        assert data["upgrades_granted"] == 0
        assert len(data["vectors"]) == 10

        run_resp = await client.post("/api/adversarial/run")
        assert run_resp.status_code == 200
        run_data = run_resp.json()
        assert run_data["upgrades_granted"] == 0
        assert len(run_data["results"]) == 10

@pytest.mark.asyncio
async def test_resume_attestation_and_ledger():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/resume/attestation")
        assert resp.status_code == 200
        data = resp.json()
        assert "candidate" in data
        assert "merkle_root" in data
        assert len(data["skills"]) > 0

        blocks_resp = await client.get("/api/ledger/blocks")
        assert blocks_resp.status_code == 200
        blocks = blocks_resp.json()
        assert len(blocks) >= 3
        assert blocks[0]["block_height"] == 1

@pytest.mark.asyncio
async def test_public_repo_scanner():
    transport = ASGITransport(app=app)
    csrf_token = "test_csrf_token"
    cookies = {"ps_csrf_token": csrf_token}
    headers = {"X-CSRF-Token": csrf_token}
    async with AsyncClient(transport=transport, base_url="http://test", cookies=cookies, headers=headers) as client:
        resp = await client.post("/api/scanner/run", json={"username": "octocat"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["target_user"] == "octocat"
        assert data["coverage_pct"] > 0
        assert "breakdown" in data

