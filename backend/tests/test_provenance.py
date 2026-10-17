import datetime
import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.main import app
from backend.models.models import User, Repository, FileEvidence, Requirement, Job, utcnow
from backend.services.provenance_service import provenance_service, PROVENANCE_DETECTOR_VERSION
from backend.services.assessment_engine import assessment_engine, STATUS_UNCLEAR, STATUS_STRONG
from backend.services.security import sign_data, generate_csrf_token
from backend.config import settings

@pytest.mark.asyncio
async def test_fork_with_no_own_commits(test_db: AsyncSession, monkeypatch):
    """
    Test 1: Fork where upstream comparison shows 0 user's own commits ahead.
    Must generate 'FORK_NO_OWN_CHANGES' review flag with innocent explanation.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="alice")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/alice/forked-app",
        owner="alice",
        name="forked-app",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    # Mock HTTP boundary
    async def mock_get_repo_info(owner, name):
        return {
            "created_at": "2026-01-01T00:00:00Z",
            "pushed_at": "2026-01-10T00:00:00Z",
            "default_branch": "main",
            "fork": True,
            "parent": {
                "full_name": "upstream-org/orig-app",
                "html_url": "https://github.com/upstream-org/orig-app",
                "default_branch": "main"
            }
        }

    async def mock_get_commits(owner, repo_name, branch=None, max_commits=200, etag=None):
        return [
            {
                "sha": "c1",
                "author": {"login": "upstream-dev"},
                "commit": {
                    "author": {"name": "Upstream", "email": "dev@upstream.org", "date": "2026-01-02T00:00:00Z"},
                    "message": "Initial commit from upstream",
                    "verification": {"verified": False, "reason": "unsigned"}
                }
            }
        ], False, "etag-1"

    async def mock_compare(owner, repo_name, base, head):
        return {
            "status": "ahead",
            "ahead_by": 2,
            "behind_by": 0,
            "commits": [
                {"author": {"login": "stranger"}, "commit": {"author": {"email": "stranger@test.com"}}},
                {"author": {"login": "bot"}, "commit": {"author": {"email": "bot@test.com"}}}
            ]
        }

    async def mock_tree_map(owner, repo_name, commit_or_branch):
        return {}

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_get_commits)
    monkeypatch.setattr("backend.services.github_client.github_client.compare_commits", mock_compare)
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_tree_map)

    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="alice",
        candidate_email="alice@example.com"
    )

    assert res["signals"]["fork_and_upstream"]["is_fork"] is True
    assert res["signals"]["fork_and_upstream"]["user_commits_ahead"] == 0
    flag_codes = [f["code"] for f in res["flags"]]
    assert "FORK_NO_OWN_CHANGES" in flag_codes
    fork_flag = next(f for f in res["flags"] if f["code"] == "FORK_NO_OWN_CHANGES")
    assert fork_flag["severity"] == "review"
    assert "Developers frequently fork" in fork_flag["why_it_can_be_innocent"]


@pytest.mark.asyncio
async def test_fork_with_own_commits(test_db: AsyncSession, monkeypatch):
    """
    Test 2: Fork with own candidate commits ahead.
    user_commits_ahead count is accurately tracked, no FORK_NO_OWN_CHANGES flag.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="bob")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/bob/custom-fork",
        owner="bob",
        name="custom-fork",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    async def mock_get_repo_info(owner, name):
        return {
            "created_at": "2026-03-01T00:00:00Z",
            "pushed_at": "2026-03-10T00:00:00Z",
            "default_branch": "main",
            "fork": True,
            "parent": {
                "full_name": "upstream-org/base-app",
                "html_url": "https://github.com/upstream-org/base-app",
                "default_branch": "main"
            }
        }

    async def mock_get_commits(owner, repo_name, branch=None, max_commits=200, etag=None):
        return [
            {
                "sha": "b1",
                "author": {"login": "bob"},
                "commit": {
                    "author": {"name": "Bob", "email": "bob@dev.com", "date": "2026-03-05T00:00:00Z"},
                    "message": "Custom feature implemented",
                    "verification": {"verified": True, "reason": "valid"}
                }
            }
        ], False, "etag-2"

    async def mock_compare(owner, repo_name, base, head):
        return {
            "status": "ahead",
            "ahead_by": 1,
            "behind_by": 0,
            "commits": [
                {"author": {"login": "bob"}, "commit": {"author": {"email": "bob@dev.com"}}}
            ]
        }

    async def mock_tree_map(owner, repo_name, commit_or_branch):
        return {}

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_get_commits)
    monkeypatch.setattr("backend.services.github_client.github_client.compare_commits", mock_compare)
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_tree_map)

    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="bob",
        candidate_email="bob@dev.com"
    )

    assert res["signals"]["fork_and_upstream"]["user_commits_ahead"] == 1
    flag_codes = [f["code"] for f in res["flags"]]
    assert "FORK_NO_OWN_CHANGES" not in flag_codes


@pytest.mark.asyncio
async def test_repo_created_yesterday(test_db: AsyncSession, monkeypatch):
    """
    Test 3: Repository created yesterday with rapid changes.
    Flags RECENT_REPO_CREATION with innocent explanation.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="charlie")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/charlie/fresh-project",
        owner="charlie",
        name="fresh-project",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    yesterday_iso = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=20)).isoformat()

    async def mock_get_repo_info(owner, name):
        return {
            "created_at": yesterday_iso,
            "pushed_at": yesterday_iso,
            "default_branch": "main",
            "fork": False
        }

    async def mock_get_commits(owner, repo_name, branch=None, max_commits=200, etag=None):
        return [
            {
                "sha": "c1",
                "author": {"login": "charlie"},
                "commit": {
                    "author": {"name": "Charlie", "email": "charlie@test.com", "date": yesterday_iso},
                    "message": "Massive initial push of 5000 lines",
                    "verification": {"verified": False, "reason": "unsigned"}
                }
            }
        ], False, "etag-3"

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_get_commits)
    async def mock_empty_tree_map(*a, **k):
        return {}
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_empty_tree_map)

    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="charlie"
    )

    assert res["signals"]["age"]["repo_age_days"] <= 1
    flag_codes = [f["code"] for f in res["flags"]]
    assert "RECENT_REPO_CREATION" in flag_codes
    flag = next(f for f in res["flags"] if f["code"] == "RECENT_REPO_CREATION")
    assert flag["severity"] == "review"
    assert "export existing projects" in flag["why_it_can_be_innocent"]


@pytest.mark.asyncio
async def test_signed_vs_unsigned_mix(test_db: AsyncSession, monkeypatch):
    """
    Test 4: Signed vs unsigned mix: counts verified, unverified, unsigned commits.
    Unsigned commits are reported as informational data, never as a negative/review.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="dana")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/dana/crypto-app",
        owner="dana",
        name="crypto-app",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    async def mock_get_repo_info(owner, name):
        return {
            "created_at": "2026-01-01T00:00:00Z",
            "pushed_at": "2026-01-10T00:00:00Z",
            "default_branch": "main",
            "fork": False
        }

    async def mock_get_commits(owner, repo_name, branch=None, max_commits=200, etag=None):
        return [
            # 1 Verified
            {
                "sha": "s1",
                "author": {"login": "dana"},
                "commit": {
                    "author": {"name": "Dana", "email": "dana@test.com"},
                    "message": "Signed commit",
                    "verification": {"verified": True, "reason": "valid"}
                }
            },
            # 1 Unsigned
            {
                "sha": "s2",
                "author": {"login": "dana"},
                "commit": {
                    "author": {"name": "Dana", "email": "dana@test.com"},
                    "message": "Unsigned commit",
                    "verification": {"verified": False, "reason": "unsigned"}
                }
            },
            # 1 Unverified (bad signature / unknown key)
            {
                "sha": "s3",
                "author": {"login": "dana"},
                "commit": {
                    "author": {"name": "Dana", "email": "dana@test.com"},
                    "message": "Unverified signature commit",
                    "verification": {"verified": False, "reason": "bad_key"}
                }
            }
        ], False, "etag-4"

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_get_commits)
    async def mock_empty_tree_map(*a, **k):
        return {}
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_empty_tree_map)

    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="dana"
    )

    signed_stats = res["signals"]["signed_commits"]
    assert signed_stats["verified_count"] == 1
    assert signed_stats["unsigned_count"] == 1
    assert signed_stats["unverified_count"] == 1
    assert signed_stats["percentage_signed"] == 33.3

    # Ensure flag for signed commits is marked INFO, never review
    signed_flag = next(f for f in res["flags"] if f["code"] == "SIGNED_COMMITS_INFO")
    assert signed_flag["severity"] == "info"
    assert "Unsigned commits are standard" in signed_flag["why_it_can_be_innocent"]


@pytest.mark.asyncio
async def test_co_authored_commits_parsing(test_db: AsyncSession, monkeypatch):
    """
    Test 5: Parses Co-authored-by trailers in commit messages accurately.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="evan")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/evan/team-app",
        owner="evan",
        name="team-app",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    async def mock_get_repo_info(owner, name):
        return {"created_at": "2026-01-01T00:00:00Z", "pushed_at": "2026-01-10T00:00:00Z", "default_branch": "main", "fork": False}

    async def mock_get_commits(owner, repo_name, branch=None, max_commits=200, etag=None):
        return [
            {
                "sha": "ca1",
                "author": {"login": "evan"},
                "commit": {
                    "author": {"name": "Evan", "email": "evan@test.com"},
                    "message": "Add authentication module\n\nCo-authored-by: Sarah Lin <sarah@lin.org>\nCo-authored-by: Alex Chen <alex@chen.io>",
                    "verification": {"verified": False, "reason": "unsigned"}
                }
            }
        ], False, "etag-5"

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_get_commits)
    async def mock_empty_tree_map(*a, **k):
        return {}
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_empty_tree_map)

    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="evan"
    )

    co_authors = res["signals"]["contributions"]["co_authors"]
    names = [c["name"] for c in co_authors]
    emails = [c["email"] for c in co_authors]
    assert "Sarah Lin" in names
    assert "sarah@lin.org" in emails
    assert "Alex Chen" in names
    assert "alex@chen.io" in emails


@pytest.mark.asyncio
async def test_file_identical_to_upstream_blocked_from_upgrading(test_db: AsyncSession, monkeypatch):
    """
    Test 6: Evidence in files unchanged from upstream must not upgrade a skill beyond Unclear,
    with the reason 'identical to upstream file'.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="fiona")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/fiona/forked-core",
        owner="fiona",
        name="forked-core",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    # Local file has same blob SHA as upstream
    shared_blob_sha = "blob_sha_12345abcdef"

    async def mock_get_repo_info(owner, name):
        return {
            "created_at": "2026-01-01T00:00:00Z",
            "pushed_at": "2026-01-10T00:00:00Z",
            "default_branch": "main",
            "fork": True,
            "parent": {
                "full_name": "parent-org/orig-core",
                "html_url": "https://github.com/parent-org/orig-core",
                "default_branch": "main"
            }
        }

    async def mock_tree_map(owner, repo_name, commit_or_branch):
        return {
            "backend/api.py": shared_blob_sha
        }

    async def mock_compare(owner, repo_name, base, head):
        return {"status": "identical", "ahead_by": 0, "behind_by": 0, "commits": []}

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", lambda *a, **k: ([], False, None))
    monkeypatch.setattr("backend.services.github_client.github_client.compare_commits", mock_compare)
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_tree_map)

    # Run provenance analysis with evidence file
    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="fiona",
        evidence_files=["backend/api.py"]
    )

    file_prov = res["signals"]["evidence_files_provenance"]["backend/api.py"]
    assert file_prov["upstream_status"] == "unchanged from upstream"
    assert file_prov["reason"] == "identical to upstream file"
    flag_codes = [f["code"] for f in res["flags"]]
    assert "UPSTREAM_IDENTICAL_EVIDENCE" in flag_codes

    # Verify AssessmentEngine blocks this evidence from upgrading skill beyond Unclear
    raw_evidence = [{
        "detector_name": "api_detector",
        "signal_type": "api_handler",
        "file_path": "backend/api.py",
        "upstream_status": "unchanged from upstream"
    }]
    status, reason, signal_count, signal_types = assessment_engine.compute_status(
        requirement={"canonical_id": "req-api", "assessable": "code_assessable"},
        evidence_list=raw_evidence,
        rejected_list=[]
    )
    assert status == STATUS_UNCLEAR
    assert reason == "identical to upstream file"


@pytest.mark.asyncio
async def test_rate_limit_commit_cap_banner(test_db: AsyncSession, monkeypatch):
    """
    Test 7: Hitting the commit cap (default 200) triggers banner: 'Analysis limited to 200 commits'.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="george")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/george/large-repo",
        owner="george",
        name="large-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    async def mock_get_repo_info(owner, name):
        return {"created_at": "2025-01-01T00:00:00Z", "pushed_at": "2026-01-10T00:00:00Z", "default_branch": "main", "fork": False}

    # Simulate hitting cap
    async def mock_get_commits(owner, repo_name, branch=None, max_commits=200, etag=None):
        dummy_commits = [{"sha": f"sha-{i}", "commit": {"author": {"email": "dev@test.com"}}} for i in range(200)]
        return dummy_commits, True, "etag-cap"

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_get_commits)
    async def mock_empty_tree_map(*a, **k):
        return {}
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_empty_tree_map)

    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="george"
    )

    assert res["signals"]["analysis_limits"]["cap_hit"] is True
    assert res["signals"]["analysis_limits"]["banner_text"] == "Analysis limited to 200 commits"
    flag_codes = [f["code"] for f in res["flags"]]
    assert "RATE_LIMIT_COMMIT_CAP" in flag_codes


@pytest.mark.asyncio
async def test_404_upstream_deleted_handled_gracefully(test_db: AsyncSession, monkeypatch):
    """
    Test 8: Upstream repository returning 404 (deleted/private) is handled as Unclear with a reason.
    """
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username="hannah")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user_id,
        repo_url="https://github.com/hannah/orphaned-fork",
        owner="hannah",
        name="orphaned-fork",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    async def mock_get_repo_info(owner, name):
        return {
            "created_at": "2026-01-01T00:00:00Z",
            "pushed_at": "2026-01-10T00:00:00Z",
            "default_branch": "main",
            "fork": True,
            "parent": {
                "full_name": "deleted-org/deleted-repo",
                "html_url": "https://github.com/deleted-org/deleted-repo",
                "default_branch": "main"
            }
        }

    async def mock_compare(owner, repo_name, base, head):
        return {"status": "not_found", "error": "404 Not Found", "ahead_by": 0, "behind_by": 0}

    async def mock_empty_commits(*a, **k):
        return ([], False, None)

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_get_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_empty_commits)
    monkeypatch.setattr("backend.services.github_client.github_client.compare_commits", mock_compare)
    async def mock_empty_tree_map(*a, **k):
        return {}
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_empty_tree_map)

    res = await provenance_service.analyze_repository_provenance(
        db=test_db,
        repo=repo,
        candidate_username="hannah"
    )

    upstream_sig = res["signals"]["fork_and_upstream"]
    assert upstream_sig["upstream_status"] == "upstream_deleted_or_inaccessible"
    flag_codes = [f["code"] for f in res["flags"]]
    assert "UPSTREAM_UNAVAILABLE" in flag_codes
    flag = next(f for f in res["flags"] if f["code"] == "UPSTREAM_UNAVAILABLE")
    assert flag["severity"] == "review"
    assert "deleted, made private, or renamed" in flag["why_it_can_be_innocent"]


@pytest.mark.asyncio
async def test_get_provenance_api_endpoint(async_client: AsyncClient, test_db: AsyncSession, monkeypatch):
    """
    Test 9: GET /api/repos/{id}/provenance returns 200 for owner and 403 for non-owner.
    """
    owner_user = User(id="usr-owner-123", username="ian")
    other_user = User(id="usr-other-456", username="judy")
    repo = Repository(
        id="repo-owner-provenance",
        user_id=owner_user.id,
        repo_url="https://github.com/ian/provenance-app",
        owner="ian",
        name="provenance-app",
        default_branch="main"
    )
    test_db.add_all([owner_user, other_user, repo])
    await test_db.commit()

    async def mock_api_repo_info(o, n):
        return {"created_at": "2026-01-01T00:00:00Z", "fork": False, "default_branch": "main"}

    async def mock_api_commits(*a, **k):
        return ([], False, None)

    async def mock_api_first_commit(*a, **k):
        return None

    async def mock_api_tree_map(*a, **k):
        return {}

    monkeypatch.setattr("backend.services.github_client.github_client.get_repository_info", mock_api_repo_info)
    monkeypatch.setattr("backend.services.github_client.github_client.get_commits", mock_api_commits)
    monkeypatch.setattr("backend.services.github_client.github_client.get_first_commit", mock_api_first_commit)
    monkeypatch.setattr("backend.services.github_client.github_client.get_tree_map", mock_api_tree_map)


    # 1. Owner request -> 200 OK
    signed_owner_session = sign_data(owner_user.id, settings.APP_SESSION_SECRET)
    async_client.cookies.set("proofstack_session", signed_owner_session)

    resp = await async_client.get(f"/api/repos/{repo.id}/provenance")
    assert resp.status_code == 200
    data = resp.json()
    assert data["repo_id"] == repo.id
    assert data["detector_version"] == PROVENANCE_DETECTOR_VERSION
    assert "signals" in data
    assert "flags" in data

    # 2. Non-owner request -> 403 Forbidden
    signed_other_session = sign_data(other_user.id, settings.APP_SESSION_SECRET)
    async_client.cookies.set("proofstack_session", signed_other_session)

    resp_forbidden = await async_client.get(f"/api/repos/{repo.id}/provenance")
    assert resp_forbidden.status_code == 403
    assert "not the owner" in resp_forbidden.json()["detail"]
