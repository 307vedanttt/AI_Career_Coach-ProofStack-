import pytest
import pytest_asyncio
import uuid
import json
import hashlib
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.db.session import init_db, AsyncSessionLocal
from backend.models.models import User, Repository, Job, Snapshot
from backend.services.security import sign_data, auth_rate_limiter, generate_csrf_token
from backend.services.snapshot_service import snapshot_service
from backend.config import settings

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    await init_db()
    auth_rate_limiter.reset()

@pytest.mark.asyncio
async def test_forged_or_missing_oauth_state_rejected():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Start OAuth flow
        start_resp = await client.get("/auth/github/start", follow_redirects=False)
        assert start_resp.status_code == 302
        assert "github.com/login/oauth/authorize" in start_resp.headers["location"]
        assert "oauth_state" in start_resp.cookies

        # 2. Callback with missing state -> Rejected with redirect to /auth/error?reason=state
        cb_missing = await client.get("/auth/github/callback?code=mock_code_123", follow_redirects=False)
        assert cb_missing.status_code == 302
        assert "/auth/error?reason=state" in cb_missing.headers["location"]

        # 3. Callback with forged state -> Rejected with redirect to /auth/error?reason=state
        cb_forged = await client.get(
            "/auth/github/callback?state=forged_state_xyz&code=mock_code_123",
            cookies={"oauth_state": start_resp.cookies["oauth_state"]},
            follow_redirects=False
        )
        assert cb_forged.status_code == 302
        assert "/auth/error?reason=state" in cb_forged.headers["location"]

        # 4. Callback with authentic state -> Succeeds with session cookie and redirects to /app
        # Extract original state from start_resp redirect URL
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(start_resp.headers["location"])
        valid_state = parse_qs(parsed.query)["state"][0]

        cb_valid = await client.get(
            f"/auth/github/callback?state={valid_state}&code=user_testuser",
            cookies={"oauth_state": start_resp.cookies["oauth_state"]},
            follow_redirects=False
        )
        assert cb_valid.status_code == 302
        assert "/app" in cb_valid.headers["location"]
        assert "proofstack_session" in cb_valid.cookies
        assert "ps_csrf_token" in cb_valid.cookies

@pytest.mark.asyncio
async def test_state_changing_request_without_csrf_returns_403():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. POST without CSRF header or cookie -> 403 Forbidden
        post_no_csrf = await client.post("/api/logout")
        assert post_no_csrf.status_code == 403
        assert "CSRF" in post_no_csrf.json()["detail"]

        # 2. POST with cookie but mismatched header -> 403 Forbidden
        post_mismatch = await client.post(
            "/api/logout",
            cookies={"ps_csrf_token": "token_aaa"},
            headers={"X-CSRF-Token": "token_bbb"}
        )
        assert post_mismatch.status_code == 403

        # 3. POST with matching double-submit cookie & header -> 200 OK
        token = generate_csrf_token()
        post_valid = await client.post(
            "/api/logout",
            cookies={"ps_csrf_token": token},
            headers={"X-CSRF-Token": token}
        )
        assert post_valid.status_code == 200
        assert post_valid.json()["logged_out"] is True

@pytest.mark.asyncio
async def test_signed_out_access_and_logout_clears_cookie():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated /api/me -> 401
        me_resp = await client.get("/api/me")
        assert me_resp.status_code == 401

        # 2. Create user and authenticated session
        user_id = str(uuid.uuid4())
        username = f"verified-alice-{uuid.uuid4().hex[:6]}"
        async with AsyncSessionLocal() as db:
            db.add(User(id=user_id, username=username))
            await db.commit()

        signed_session = sign_data(user_id, settings.APP_SESSION_SECRET)
        token = generate_csrf_token()

        auth_resp = await client.get(
            "/api/me",
            cookies={"proofstack_session": signed_session}
        )
        assert auth_resp.status_code == 200
        assert auth_resp.json()["login"] == username

        # 3. Logout clears cookie
        logout_resp = await client.post(
            "/api/logout",
            cookies={"proofstack_session": signed_session, "ps_csrf_token": token},
            headers={"X-CSRF-Token": token}
        )
        assert logout_resp.status_code == 200
        # Cookie deletion directive present in Set-Cookie headers
        set_cookie = logout_resp.headers.get("set-cookie", "")
        assert "proofstack_session" in set_cookie
        assert 'max-age=0' in set_cookie.lower() or 'expires=' in set_cookie.lower()

@pytest.mark.asyncio
async def test_delete_my_data_removes_rows_and_chain_verifies():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        user_id = str(uuid.uuid4())
        repo_id = str(uuid.uuid4())
        job_id = str(uuid.uuid4())

        # 1. Seed user, repository, job, and initial snapshot block
        initial_hash = snapshot_service.compute_hash_chain(
            prev_hash=None,
            commit_sha="9f3c2ab",
            coverage_score=58.0,
            assessments=[{"requirement_id": "req-sql", "status": "Demonstrated (basic)"}]
        )

        async with AsyncSessionLocal() as db:
            user = User(id=user_id, username=f"alice-to-delete-{uuid.uuid4().hex[:6]}")
            repo = Repository(id=repo_id, user_id=user_id, repo_url="https://github.com/alice/repo", owner="alice", name="repo")
            job = Job(id=job_id, user_id=user_id, title="Backend Lead", source_type="curated", text_hash="hash1")
            snap1 = Snapshot(
                id=str(uuid.uuid4()),
                repo_id=repo_id,
                job_id=job_id,
                commit_sha="9f3c2ab",
                previous_commit_sha="0" * 40,
                hash_chain=initial_hash,
                coverage_score=58.0
            )
            db.add_all([user, repo, job, snap1])
            await db.commit()

        signed_session = sign_data(user_id, settings.APP_SESSION_SECRET)
        csrf_token = generate_csrf_token()

        # 2. DELETE /api/me/data
        del_resp = await client.delete(
            "/api/me/data",
            cookies={"proofstack_session": signed_session, "ps_csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token}
        )
        assert del_resp.status_code == 200
        del_data = del_resp.json()
        assert del_data["deleted"] is True
        assert del_data["status"] == "data_eradicated"
        assert "tombstone_hash" in del_data

        # 3. Verify user and owned rows are deleted from DB
        from sqlalchemy import select
        async with AsyncSessionLocal() as db:
            user_check = (await db.execute(select(User).where(User.id == user_id))).scalars().first()
            assert user_check is None
            repo_check = (await db.execute(select(Repository).where(Repository.id == repo_id))).scalars().first()
            assert repo_check is None
            job_check = (await db.execute(select(Job).where(Job.id == job_id))).scalars().first()
            assert job_check is None

            # 4. Verify tombstone block exists on the ledger and links cryptographically
            tombstone = (await db.execute(select(Snapshot).where(Snapshot.hash_chain == del_data["tombstone_hash"]))).scalars().first()
            assert tombstone is not None
            assert tombstone.commit_sha == "0000000"
            assert "TOMBSTONE" in tombstone.summary_json
            # Cryptographic chain verification: tombstone previous_commit_sha matches initial_hash
            assert tombstone.previous_commit_sha == initial_hash
            expected_tombstone_hash = snapshot_service.compute_hash_chain(
                prev_hash=initial_hash,
                commit_sha="0000000",
                coverage_score=0.0,
                assessments=[{"requirement_id": "TOMBSTONE", "status": "USER_DATA_ERADICATED"}]
            )
            assert tombstone.hash_chain == expected_tombstone_hash

@pytest.mark.asyncio
async def test_auth_rate_limiting_returns_429():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Auth rate limit is 10 requests / 60 seconds
        for _ in range(10):
            res = await client.get("/auth/github/start", follow_redirects=False)
            assert res.status_code == 302

        # 11th request triggers 429
        rate_limited_res = await client.get(
            "/auth/github/start",
            headers={"Accept": "application/json"},
            follow_redirects=False
        )
        assert rate_limited_res.status_code == 429
        assert "Retry-After" in rate_limited_res.headers
        assert int(rate_limited_res.headers["Retry-After"]) > 0
