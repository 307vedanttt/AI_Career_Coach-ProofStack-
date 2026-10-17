import datetime
import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.main import app
from backend.models.models import User, Repository, CommitStats, HistoryFlag, utcnow
from backend.services.commit_history_service import (
    commit_history_service, load_thresholds, DISCLAIMER_COPY
)
from backend.services.security import sign_data
from backend.config import settings


@pytest.mark.asyncio
async def test_bulk_import_flag(test_db: AsyncSession, monkeypatch):
    """
    Test 1: BULK_IMPORT rule.
    A commit that introduces >= 50% line share and >= 500 lines triggers BULK_IMPORT.
    """
    user = User(id=str(uuid.uuid4()), username="dev_alice")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_alice/bulk-repo",
        owner="dev_alice",
        name="bulk-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    raw_commits = [
        {
            "sha": "c_bulk_01",
            "author": {"login": "dev_alice"},
            "committer": {"login": "dev_alice"},
            "commit": {
                "author": {"name": "Alice", "email": "alice@dev.io", "date": "2026-01-01T10:00:00Z"},
                "committer": {"name": "Alice", "email": "alice@dev.io", "date": "2026-01-01T10:00:00Z"},
                "message": "Initial project boilerplate and vendored dependencies",
                "verification": {"verified": True, "reason": "valid"}
            },
            "parents": []
        },
        {
            "sha": "c_bulk_02",
            "author": {"login": "dev_alice"},
            "committer": {"login": "dev_alice"},
            "commit": {
                "author": {"name": "Alice", "email": "alice@dev.io", "date": "2026-01-02T10:00:00Z"},
                "committer": {"name": "Alice", "email": "alice@dev.io", "date": "2026-01-02T10:00:00Z"},
                "message": "Add authentication router and user model tests",
                "verification": {"verified": True, "reason": "valid"}
            },
            "parents": [{"sha": "c_bulk_01"}]
        }
    ]

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-bulk"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        sha = args[1] if len(args) > 1 else kwargs.get("sha")
        if sha == "c_bulk_01":
            return {"stats": {"additions": 2000, "deletions": 0, "total": 2000}, "files": [{"filename": "app.py"}]}
        return {"stats": {"additions": 100, "deletions": 10, "total": 110}, "files": [{"filename": "auth.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_alice"
    )

    flags = res["flags"]
    bulk_flag = next((f for f in flags if f["code"] == "BULK_IMPORT"), None)
    assert bulk_flag is not None
    assert bulk_flag["severity"] == "review"
    assert "Bulk Code Addition" in bulk_flag["title"]
    assert bulk_flag["observed"]["sha"] == "c_bulk_01"
    assert bulk_flag["observed"]["additions"] == 2000
    assert bulk_flag["observed"]["share_pct"] > 90.0
    assert "vendored dependency" in bulk_flag["innocent_note"].lower()


@pytest.mark.asyncio
async def test_burst_activity_flag(test_db: AsyncSession, monkeypatch):
    """
    Test 2: BURST_ACTIVITY rule.
    >= 15 commits in <= 2 hours followed by >= 14 days silence triggers BURST_ACTIVITY.
    """
    user = User(id=str(uuid.uuid4()), username="dev_bob")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_bob/burst-repo",
        owner="dev_bob",
        name="burst-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    base_time = datetime.datetime(2026, 1, 1, 10, 0, 0, tzinfo=datetime.timezone.utc)
    raw_commits = []
    # 15 commits spaced 5 minutes apart (total 70 minutes < 2 hours)
    for i in range(16):
        t = base_time + datetime.timedelta(minutes=i * 5)
        raw_commits.append({
            "sha": f"burst_{i:02d}",
            "author": {"login": "dev_bob"},
            "committer": {"login": "dev_bob"},
            "commit": {
                "author": {"name": "Bob", "email": "bob@dev.io", "date": t.isoformat()},
                "committer": {"name": "Bob", "email": "bob@dev.io", "date": t.isoformat()},
                "message": f"Feature implementation step {i+1} with full validation suite",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": [{"sha": f"burst_{i-1:02d}"}] if i > 0 else []
        })

    # Add a 17th commit 20 days later (> 14 days silence)
    t_after = base_time + datetime.timedelta(days=20)
    raw_commits.append({
        "sha": "burst_after_silence",
        "author": {"login": "dev_bob"},
        "committer": {"login": "dev_bob"},
        "commit": {
            "author": {"name": "Bob", "email": "bob@dev.io", "date": t_after.isoformat()},
            "committer": {"name": "Bob", "email": "bob@dev.io", "date": t_after.isoformat()},
            "message": "Resume project maintenance after vacation break",
            "verification": {"verified": False, "reason": "unsigned"}
        },
        "parents": [{"sha": "burst_15"}]
    })

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-burst"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 20, "deletions": 5, "total": 25}, "files": [{"filename": "f.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_bob"
    )

    burst_flag = next((f for f in res["flags"] if f["code"] == "BURST_ACTIVITY"), None)
    assert burst_flag is not None
    assert burst_flag["severity"] == "review"
    assert burst_flag["observed"]["burst_commits"] >= 15
    assert burst_flag["observed"]["elapsed_hours"] <= 2.0
    assert burst_flag["observed"]["silence_days"] >= 14.0
    assert "hackathon sprint" in burst_flag["innocent_note"].lower()


@pytest.mark.asyncio
async def test_large_add_then_delete_flag(test_db: AsyncSession, monkeypatch):
    """
    Test 3: LARGE_ADD_DELETE rule.
    Heavy addition (>= 400 lines) followed within 48h by >= 70% deletion.
    """
    user = User(id=str(uuid.uuid4()), username="dev_charlie")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_charlie/rollback-repo",
        owner="dev_charlie",
        name="rollback-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    raw_commits = [
        {
            "sha": "c_add_01",
            "author": {"login": "dev_charlie"},
            "committer": {"login": "dev_charlie"},
            "commit": {
                "author": {"name": "Charlie", "email": "c@dev.io", "date": "2026-02-01T12:00:00Z"},
                "committer": {"name": "Charlie", "email": "c@dev.io", "date": "2026-02-01T12:00:00Z"},
                "message": "Add experimental machine learning model checkpoints",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": []
        },
        {
            "sha": "c_del_02",
            "author": {"login": "dev_charlie"},
            "committer": {"login": "dev_charlie"},
            "commit": {
                "author": {"name": "Charlie", "email": "c@dev.io", "date": "2026-02-02T08:00:00Z"},
                "committer": {"name": "Charlie", "email": "c@dev.io", "date": "2026-02-02T08:00:00Z"},
                "message": "Remove large binary model weights from repository",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": [{"sha": "c_add_01"}]
        }
    ]

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-del"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        sha = args[1] if len(args) > 1 else kwargs.get("sha")
        if sha == "c_add_01":
            return {"stats": {"additions": 800, "deletions": 0, "total": 800}, "files": [{"filename": "weights.bin"}]}
        return {"stats": {"additions": 0, "deletions": 750, "total": 750}, "files": [{"filename": "weights.bin"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_charlie"
    )

    del_flag = next((f for f in res["flags"] if f["code"] == "LARGE_ADD_DELETE"), None)
    assert del_flag is not None
    assert del_flag["severity"] == "review"
    assert del_flag["observed"]["add_short_sha"] == "c_add_0"
    assert del_flag["observed"]["additions"] == 800
    assert del_flag["observed"]["deletions"] == 750
    assert del_flag["observed"]["elapsed_hours"] <= 48.0
    assert "build artifacts" in del_flag["innocent_note"].lower() or "generated files" in del_flag["innocent_note"].lower()


@pytest.mark.asyncio
async def test_date_inconsistency_skew_and_future(test_db: AsyncSession, monkeypatch):
    """
    Test 4: DATE_INCONSISTENCY rule.
    Author date vs committer date skewed > 48h or future timestamp triggers DATE_INCONSISTENCY.
    """
    user = User(id=str(uuid.uuid4()), username="dev_dana")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_dana/skew-repo",
        owner="dev_dana",
        name="skew-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    # Commit with 5-day divergence between author and committer
    raw_commits = [
        {
            "sha": "c_skew_01",
            "author": {"login": "dev_dana"},
            "committer": {"login": "dev_dana"},
            "commit": {
                "author": {"name": "Dana", "email": "dana@dev.io", "date": "2026-01-01T12:00:00Z"},
                "committer": {"name": "Dana", "email": "dana@dev.io", "date": "2026-01-07T12:00:00Z"},
                "message": "Rebased feature branch onto main",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": []
        }
    ]

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-skew"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 50, "deletions": 10, "total": 60}, "files": [{"filename": "f.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_dana"
    )

    skew_flag = next((f for f in res["flags"] if f["code"] == "DATE_INCONSISTENCY"), None)
    assert skew_flag is not None
    assert skew_flag["observed"]["skew_hours"] >= 48.0
    assert "cherry-picking" in skew_flag["innocent_note"].lower() or "rebasing" in skew_flag["innocent_note"].lower()


@pytest.mark.asyncio
async def test_author_mismatch_flag(test_db: AsyncSession, monkeypatch):
    """
    Test 5: AUTHOR_MISMATCH rule.
    Multi-author repo where candidate's commit share is < 20%.
    """
    user = User(id=str(uuid.uuid4()), username="candidate_eva")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/candidate_eva/team-repo",
        owner="candidate_eva",
        name="team-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    raw_commits = []
    # 9 commits by teammate
    for i in range(9):
        raw_commits.append({
            "sha": f"c_team_{i}",
            "author": {"login": "teammate_mark"},
            "committer": {"login": "teammate_mark"},
            "commit": {
                "author": {"name": "Mark", "email": "mark@team.io", "date": f"2026-03-0{i+1}T10:00:00Z"},
                "committer": {"name": "Mark", "email": "mark@team.io", "date": f"2026-03-0{i+1}T10:00:00Z"},
                "message": f"Core framework architecture part {i+1}",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": []
        })

    # 1 commit by candidate Eva (1 out of 10 = 10% < 20%)
    raw_commits.append({
        "sha": "c_cand_eva",
        "author": {"login": "candidate_eva"},
        "committer": {"login": "candidate_eva"},
        "commit": {
            "author": {"name": "Eva", "email": "eva@team.io", "date": "2026-03-10T10:00:00Z"},
            "committer": {"name": "Eva", "email": "eva@team.io", "date": "2026-03-10T10:00:00Z"},
            "message": "Add API integration tests and validation helpers",
            "verification": {"verified": True, "reason": "valid"}
        },
        "parents": [{"sha": "c_team_8"}]
    })

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-mismatch"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 30, "deletions": 5, "total": 35}, "files": [{"filename": "test.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="candidate_eva"
    )

    mismatch_flag = next((f for f in res["flags"] if f["code"] == "AUTHOR_MISMATCH"), None)
    assert mismatch_flag is not None
    assert mismatch_flag["observed"]["candidate_share_pct"] == 10.0
    assert mismatch_flag["observed"]["candidate_commits"] == 1
    assert "pair programming" in mismatch_flag["innocent_note"].lower()


@pytest.mark.asyncio
async def test_history_rewrite_flag(test_db: AsyncSession, monkeypatch):
    """
    Test 6: HISTORY_REWRITE rule.
    Child commit timestamp reversed relative to parent commit by > 24 hours.
    """
    user = User(id=str(uuid.uuid4()), username="dev_frank")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_frank/rebase-repo",
        owner="dev_frank",
        name="rebase-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    # Commit 1 dated Feb 10
    # Commit 2 dated Feb 05 (> 24 hours earlier)
    raw_commits = [
        {
            "sha": "c_anc_01",
            "author": {"login": "dev_frank"},
            "committer": {"login": "dev_frank"},
            "commit": {
                "author": {"name": "Frank", "email": "frank@dev.io", "date": "2026-02-10T10:00:00Z"},
                "committer": {"name": "Frank", "email": "frank@dev.io", "date": "2026-02-10T10:00:00Z"},
                "message": "Initial feature commit",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": []
        },
        {
            "sha": "c_rev_02",
            "author": {"login": "dev_frank"},
            "committer": {"login": "dev_frank"},
            "commit": {
                "author": {"name": "Frank", "email": "frank@dev.io", "date": "2026-02-05T10:00:00Z"},
                "committer": {"name": "Frank", "email": "frank@dev.io", "date": "2026-02-05T10:00:00Z"},
                "message": "Cherry-picked legacy patch with original author timestamp",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": [{"sha": "c_anc_01"}]
        }
    ]

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-rev"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 20, "deletions": 5, "total": 25}, "files": [{"filename": "f.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_frank"
    )

    rewrite_flag = next((f for f in res["flags"] if f["code"] == "HISTORY_REWRITE"), None)
    assert rewrite_flag is not None
    assert rewrite_flag["observed"]["time_reversal_hours"] >= 24.0
    assert "squashing pr commits" in rewrite_flag["innocent_note"].lower() or "rebase" in rewrite_flag["innocent_note"].lower()


@pytest.mark.asyncio
async def test_generic_message_ratio(test_db: AsyncSession, monkeypatch):
    """
    Test 7: GENERIC_MESSAGES rule.
    > 30% generic commit messages like 'update', 'wip', 'fix'.
    """
    user = User(id=str(uuid.uuid4()), username="dev_grace")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_grace/generic-repo",
        owner="dev_grace",
        name="generic-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    messages = ["update", "wip", "fix", "commit", "Implemented secure jwt authentication parser"]
    raw_commits = []
    for i, msg in enumerate(messages):
        raw_commits.append({
            "sha": f"c_gen_{i}",
            "author": {"login": "dev_grace"},
            "committer": {"login": "dev_grace"},
            "commit": {
                "author": {"name": "Grace", "email": "grace@dev.io", "date": f"2026-03-0{i+1}T10:00:00Z"},
                "committer": {"name": "Grace", "email": "grace@dev.io", "date": f"2026-03-0{i+1}T10:00:00Z"},
                "message": msg,
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": []
        })

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-gen"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 15, "deletions": 2, "total": 17}, "files": [{"filename": "f.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_grace"
    )

    gen_flag = next((f for f in res["flags"] if f["code"] == "GENERIC_MESSAGES"), None)
    assert gen_flag is not None
    assert gen_flag["observed"]["generic_pct"] >= 80.0
    assert "rapid prototyping" in gen_flag["innocent_note"].lower()


@pytest.mark.asyncio
async def test_clean_history_zero_flags(test_db: AsyncSession, monkeypatch):
    """
    Test 8: Clean history produces exactly 0 review flags.
    Cadence is regular, messages are informative, single author, no skews.
    """
    user = User(id=str(uuid.uuid4()), username="dev_helen")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_helen/clean-repo",
        owner="dev_helen",
        name="clean-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    raw_commits = []
    for i in range(8):
        raw_commits.append({
            "sha": f"c_clean_{i:02d}",
            "author": {"login": "dev_helen"},
            "committer": {"login": "dev_helen"},
            "commit": {
                "author": {"name": "Helen", "email": "helen@dev.io", "date": f"2026-01-{i*3+1:02d}T10:00:00Z"},
                "committer": {"name": "Helen", "email": "helen@dev.io", "date": f"2026-01-{i*3+1:02d}T10:00:00Z"},
                "message": f"feat(service): implement step {i+1} with full unit test coverage",
                "verification": {"verified": True, "reason": "valid"}
            },
            "parents": [{"sha": f"c_clean_{i-1:02d}"}] if i > 0 else []
        })

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-clean"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 45, "deletions": 10, "total": 55}, "files": [{"filename": "f.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_helen"
    )

    assert res["flags_count"] == 0
    assert len(res["flags"]) == 0
    assert len(res["timeline"]) > 0
    assert len(res["daily_contributions"]) == 8
    assert res["authors"][0]["is_signed_in_user"] is True
    assert res["authors"][0]["commits_share_pct"] == 100.0


@pytest.mark.asyncio
async def test_threshold_config_loading(monkeypatch, tmp_path):
    """
    Test 9: Dynamic threshold config loading from JSON file.
    """
    custom_cfg = tmp_path / "custom_thresholds.json"
    custom_cfg.write_text('{"bulk_import_line_share_pct": 75.0, "burst_min_commits": 25}')

    monkeypatch.setattr(settings, "HISTORY_THRESHOLDS_PATH", str(custom_cfg))
    t = load_thresholds()
    assert t["bulk_import_line_share_pct"] == 75.0
    assert t["burst_min_commits"] == 25
    # Defaults preserved for omitted keys
    assert t["large_add_delete_ratio"] == 0.70


@pytest.mark.asyncio
async def test_commit_cap_banner(test_db: AsyncSession, monkeypatch):
    """
    Test 10: Analysis limited banner when cap is reached.
    """
    user = User(id=str(uuid.uuid4()), username="dev_cap")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_cap/capped-repo",
        owner="dev_cap",
        name="capped-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    raw_commits = []
    for i in range(5):
        raw_commits.append({
            "sha": f"c_cap_{i}",
            "author": {"login": "dev_cap"},
            "committer": {"login": "dev_cap"},
            "commit": {
                "author": {"name": "Cap", "email": "cap@dev.io", "date": "2026-01-01T10:00:00Z"},
                "committer": {"name": "Cap", "email": "cap@dev.io", "date": "2026-01-01T10:00:00Z"},
                "message": f"Regular commit {i}",
                "verification": {"verified": False, "reason": "unsigned"}
            },
            "parents": []
        })

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, True, "etag-cap"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 10, "deletions": 0, "total": 10}, "files": [{"filename": "f.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_cap",
        commit_cap=5
    )

    assert res["cap_reached"] is True
    assert res["cap_banner_message"] == "Analysis limited to 5 commits"
    assert res["disclaimer"] == DISCLAIMER_COPY


@pytest.mark.asyncio
async def test_empty_repository_history(test_db: AsyncSession, monkeypatch):
    """
    Test 11: Empty repository produces no errors, empty aggregations, and 0 flags.
    """
    user = User(id=str(uuid.uuid4()), username="dev_empty")
    repo = Repository(
        id=str(uuid.uuid4()),
        user_id=user.id,
        repo_url="https://github.com/dev_empty/empty-repo",
        owner="dev_empty",
        name="empty-repo",
        default_branch="main"
    )
    test_db.add_all([user, repo])
    await test_db.commit()

    async def mock_get_commits(owner, *args, **kwargs):
        return [], False, None

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)

    res = await commit_history_service.sync_repository_history(
        db=test_db,
        repo=repo,
        candidate_username="dev_empty"
    )

    assert res["total_commits_analyzed"] == 0
    assert len(res["timeline"]) == 0
    assert len(res["daily_contributions"]) == 0
    assert len(res["large_additions"]) == 0
    assert len(res["authors"]) == 0
    assert res["flags_count"] == 0


@pytest.mark.asyncio
async def test_commit_history_api_endpoints(async_client: AsyncClient, test_db: AsyncSession, monkeypatch):
    """
    Test 12: GET /api/repos/{id}/history and /flags endpoints:
    Returns 200 for repository owner, 403 for other user, 404 for non-existent.
    """
    owner = User(id="user-history-owner", username="history_owner")
    other_user = User(id="user-history-other", username="other_user")
    repo = Repository(
        id="repo-history-demo",
        user_id=owner.id,
        repo_url="https://github.com/history_owner/demo-app",
        owner="history_owner",
        name="demo-app",
        default_branch="main"
    )
    test_db.add_all([owner, other_user, repo])
    await test_db.commit()

    raw_commits = [
        {
            "sha": "c_api_01",
            "author": {"login": "history_owner"},
            "committer": {"login": "history_owner"},
            "commit": {
                "author": {"name": "Owner", "email": "o@dev.io", "date": "2026-01-01T10:00:00Z"},
                "committer": {"name": "Owner", "email": "o@dev.io", "date": "2026-01-01T10:00:00Z"},
                "message": "Production ready deployment setup",
                "verification": {"verified": True, "reason": "valid"}
            },
            "parents": []
        }
    ]

    async def mock_get_commits(owner, *args, **kwargs):
        return raw_commits, False, "etag-api"

    async def mock_get_commit_detail(owner, *args, **kwargs):
        return {"stats": {"additions": 100, "deletions": 5, "total": 105}, "files": [{"filename": "main.py"}]}

    from backend.services.github_client import github_client
    monkeypatch.setattr(github_client, "get_commits", mock_get_commits)
    monkeypatch.setattr(github_client, "get_commit_detail", mock_get_commit_detail)

    # 1. Non-existent repo -> 404
    signed_owner = sign_data(owner.id, settings.APP_SESSION_SECRET)
    async_client.cookies.set("proofstack_session", signed_owner)
    resp_404 = await async_client.get("/api/repos/non-existent-id/history")
    assert resp_404.status_code == 404

    # 2. Owner request -> 200
    resp = await async_client.get(f"/api/repos/{repo.id}/history")
    assert resp.status_code == 200
    data = resp.json()
    assert data["repo_id"] == repo.id
    assert data["total_commits_analyzed"] == 1
    assert data["disclaimer"] == DISCLAIMER_COPY
    assert len(data["large_additions"]) == 1
    assert data["large_additions"][0]["sha"] == "c_api_01"

    # 3. Flags endpoint -> 200
    flags_resp = await async_client.get(f"/api/repos/{repo.id}/history/flags")
    assert flags_resp.status_code == 200
    flags_data = flags_resp.json()
    assert flags_data["repo_id"] == repo.id
    assert "thresholds" in flags_data
    assert flags_data["disclaimer"] == DISCLAIMER_COPY

    # 4. Forbidden user -> 403
    signed_other = sign_data(other_user.id, settings.APP_SESSION_SECRET)
    async_client.cookies.set("proofstack_session", signed_other)
    resp_forbidden = await async_client.get(f"/api/repos/{repo.id}/history")
    assert resp_forbidden.status_code == 403
    resp_flags_forbidden = await async_client.get(f"/api/repos/{repo.id}/history/flags")
    assert resp_flags_forbidden.status_code == 403
