import asyncio
import datetime
import json
import logging
import os
import re
import uuid
from typing import Dict, List, Any, Optional, Tuple, Set

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from backend.config import settings
from backend.models.models import (
    Repository, CommitStats, HistoryFlag, Snapshot, Assessment, utcnow
)
from backend.services.github_client import github_client, GitHubAPIError

logger = logging.getLogger(__name__)

GENERIC_COMMIT_WORDS = {
    "update", "fix", "wip", "commit", "changes", "test", "init", "checkpoint",
    "stuff", "cleanup", "minor", "patch", "misc", "temp", "fixed", "updates",
    "quick fix", "bugfix", "refactor", "first commit", "initial commit"
}

DEFAULT_THRESHOLDS = {
    "bulk_import_line_share_pct": 50.0,
    "burst_window_hours": 2.0,
    "burst_min_commits": 15,
    "burst_silence_days": 14.0,
    "large_add_delete_ratio": 0.70,
    "large_add_delete_window_hours": 48.0,
    "date_skew_hours": 48.0,
    "candidate_skill_file_min_share_pct": 20.0,
    "generic_message_min_pct": 30.0
}

DISCLAIMER_COPY = "Commit dates and authors can be edited. These are signals, not proof."


def load_thresholds() -> Dict[str, Any]:
    """Loads configurable thresholds from history_thresholds.json or falls back to defaults."""
    cfg_path = getattr(settings, "HISTORY_THRESHOLDS_PATH", None)
    if cfg_path and os.path.exists(cfg_path):
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {**DEFAULT_THRESHOLDS, **data}
        except Exception as e:
            logger.warning(f"Failed to parse history_thresholds.json: {e}")
    return dict(DEFAULT_THRESHOLDS)


def parse_datetime(dt_val: Any) -> Optional[datetime.datetime]:
    if not dt_val:
        return None
    if isinstance(dt_val, datetime.datetime):
        if dt_val.tzinfo is None:
            return dt_val.replace(tzinfo=datetime.timezone.utc)
        return dt_val
    try:
        # ISO string parsing
        dt_str = str(dt_val).replace("Z", "+00:00")
        dt = datetime.datetime.fromisoformat(dt_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt
    except Exception:
        return None


class CommitHistoryService:
    """
    Deterministic Commit History Analysis Engine:
    - Ingests and caches commit-level stats (additions, deletions, parent count, verification)
    - Computes 7 configurable review flags
    - Emits aggregations for weekly contribution timeline, 52-week heatmap, large additions, and author shares
    - Integrates with Snapshot Scrubber
    """

    def __init__(self, commit_cap: Optional[int] = None):
        self.commit_cap = commit_cap or getattr(settings, "DEFAULT_COMMIT_CAP", 500)

    async def sync_repository_history(
        self,
        db: AsyncSession,
        repo: Repository,
        candidate_username: str,
        candidate_email: Optional[str] = None,
        candidate_name: Optional[str] = None,
        commit_cap: Optional[int] = None
    ) -> Dict[str, Any]:
        cap = commit_cap or self.commit_cap
        thresholds = load_thresholds()

        # 1. Fetch commits from GitHub default branch
        commits_raw = []
        cap_hit = False
        latest_etag = repo.last_etag
        try:
            commits_raw, cap_hit, new_etag = await github_client.get_commits(
                repo.owner,
                repo.name,
                branch=repo.default_branch,
                max_commits=cap,
                etag=repo.last_etag
            )
            if new_etag:
                latest_etag = new_etag
                repo.last_etag = new_etag
        except Exception as e:
            logger.warning(f"Error fetching commits for {repo.owner}/{repo.name}: {e}")

        # 2. Query existing CommitStats for this repo to avoid duplicate detail fetches
        stmt = select(CommitStats).where(CommitStats.repo_id == repo.id)
        res = await db.execute(stmt)
        existing_stats_map = {row.sha: row for row in res.scalars().all()}

        # 3. For any commit missing detail or new, fetch stats with bounded concurrency
        semaphore = asyncio.Semaphore(5)
        stats_to_upsert: List[CommitStats] = []

        async def fetch_detail_for_commit(commit_dict: Dict[str, Any]) -> Dict[str, Any]:
            sha = commit_dict.get("sha", "")
            if not sha:
                return {}
            # If already in DB with non-zero line stats or existing, return cached
            if sha in existing_stats_map and (existing_stats_map[sha].additions > 0 or existing_stats_map[sha].deletions > 0):
                return {
                    "additions": existing_stats_map[sha].additions,
                    "deletions": existing_stats_map[sha].deletions,
                    "files_changed": existing_stats_map[sha].files_changed,
                }
            async with semaphore:
                try:
                    detail = await github_client.get_commit_detail(repo.owner, repo.name, sha)
                    if detail and "stats" in detail:
                        return {
                            "additions": detail["stats"].get("additions", 0),
                            "deletions": detail["stats"].get("deletions", 0),
                            "files_changed": len(detail.get("files", [])),
                        }
                except Exception as ex:
                    logger.warning(f"Failed to fetch detail for {sha}: {ex}")
            return {"additions": 0, "deletions": 0, "files_changed": 0}

        # Run detail fetch only for commits we actually have
        tasks = [fetch_detail_for_commit(c) for c in commits_raw]
        detail_results = await asyncio.gather(*tasks) if tasks else []

        now_utc = utcnow()
        for idx, c in enumerate(commits_raw):
            sha = c.get("sha", "")
            if not sha:
                continue
            commit_meta = c.get("commit", {})
            author_dict = commit_meta.get("author", {}) or {}
            committer_dict = commit_meta.get("committer", {}) or {}
            verification = commit_meta.get("verification", {}) or {}
            github_author = c.get("author", {}) or {}
            github_committer = c.get("committer", {}) or {}

            author_login = github_author.get("login") or author_dict.get("name")
            committer_login = github_committer.get("login") or committer_dict.get("name")
            author_email = author_dict.get("email")
            committer_email = committer_dict.get("email")
            author_name = author_dict.get("name")
            committer_name = committer_dict.get("name")

            authored_at = parse_datetime(author_dict.get("date"))
            committed_at = parse_datetime(committer_dict.get("date"))

            message = commit_meta.get("message", "")
            first_line = message.split("\n")[0].strip() if message else ""
            parents = c.get("parents", [])
            parents_count = len(parents)

            line_stats = detail_results[idx] if idx < len(detail_results) else {}
            additions = line_stats.get("additions", 0)
            deletions = line_stats.get("deletions", 0)
            files_changed = line_stats.get("files_changed", 0)

            if sha in existing_stats_map:
                stat = existing_stats_map[sha]
                stat.author_login = author_login
                stat.author_name = author_name
                stat.author_email = author_email
                stat.authored_at = authored_at
                stat.committer_login = committer_login
                stat.committer_name = committer_name
                stat.committer_email = committer_email
                stat.committed_at = committed_at
                stat.message_first_line = first_line
                if additions > 0 or deletions > 0 or files_changed > 0:
                    stat.additions = additions
                    stat.deletions = deletions
                    stat.files_changed = files_changed
                stat.parents_count = parents_count
                stat.verified = verification.get("verified", False)
                stat.verification_reason = verification.get("reason")
            else:
                stat = CommitStats(
                    id=str(uuid.uuid4()),
                    repo_id=repo.id,
                    sha=sha,
                    author_login=author_login,
                    author_name=author_name,
                    author_email=author_email,
                    authored_at=authored_at,
                    committer_login=committer_login,
                    committer_name=committer_name,
                    committer_email=committer_email,
                    committed_at=committed_at,
                    message_first_line=first_line,
                    additions=additions,
                    deletions=deletions,
                    files_changed=files_changed,
                    parents_count=parents_count,
                    verified=verification.get("verified", False),
                    verification_reason=verification.get("reason"),
                    created_at=now_utc
                )
                db.add(stat)
                existing_stats_map[sha] = stat

        await db.commit()

        # 4. Read all CommitStats for this repo sorted by committed_at asc / authored_at asc
        stmt = select(CommitStats).where(CommitStats.repo_id == repo.id)
        res = await db.execute(stmt)
        all_stats = list(res.scalars().all())

        # Sort commits chronologically (earliest to latest)
        def commit_sort_key(s: CommitStats):
            return s.committed_at or s.authored_at or datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)

        all_stats.sort(key=commit_sort_key)

        # 5. Evaluate the 7 Deterministic Review Rules
        parent_map: Dict[str, List[str]] = {}
        for c in commits_raw:
            sha = c.get("sha")
            if sha:
                parent_map[sha] = [p.get("sha") for p in c.get("parents", []) if p.get("sha")]

        flags = self._evaluate_review_flags(
            all_stats=all_stats,
            repo=repo,
            candidate_username=candidate_username,
            candidate_email=candidate_email,
            candidate_name=candidate_name,
            thresholds=thresholds,
            parent_map=parent_map
        )

        # Save flags to DB (replace previous flags for this repo)
        await db.execute(delete(HistoryFlag).where(HistoryFlag.repo_id == repo.id))
        for fl in flags:
            flag_row = HistoryFlag(
                id=str(uuid.uuid4()),
                repo_id=repo.id,
                snapshot_version=repo.last_commit_sha,
                code=fl["code"],
                severity=fl["severity"],
                title=fl["title"],
                observed_json=json.dumps(fl["observed"]),
                rule=fl["rule"],
                innocent_note=fl["innocent_note"],
                created_at=now_utc
            )
            db.add(flag_row)
        await db.commit()

        # 6. Aggregate Visualizations
        timeline = self._build_timeline(all_stats)
        daily_contributions = self._build_daily_heatmap(all_stats)
        large_additions = self._build_large_additions(all_stats, repo.owner, repo.name)
        authors = self._build_authors_breakdown(all_stats, candidate_username, candidate_email, candidate_name)

        # Snapshot scrubber mapping
        snapshots_res = await db.execute(select(Snapshot).where(Snapshot.repo_id == repo.id))
        snapshots = snapshots_res.scalars().all()
        sha_to_snapshot = {s.commit_sha: {"snapshot_id": s.id, "coverage_score": s.coverage_score} for s in snapshots}

        for item in large_additions:
            if item["sha"] in sha_to_snapshot:
                item["snapshot"] = sha_to_snapshot[item["sha"]]

        total_analyzed = len(all_stats)
        banner_msg = f"Analysis limited to {cap} commits" if cap_hit or total_analyzed >= cap else None

        return {
            "repo_id": repo.id,
            "repo_full_name": f"{repo.owner}/{repo.name}",
            "default_branch": repo.default_branch,
            "commit_cap": cap,
            "total_commits_analyzed": total_analyzed,
            "cap_reached": bool(banner_msg is not None),
            "cap_banner_message": banner_msg,
            "disclaimer": DISCLAIMER_COPY,
            "timeline": timeline,
            "daily_contributions": daily_contributions,
            "large_additions": large_additions,
            "authors": authors,
            "flags_count": len(flags),
            "flags": flags,
            "thresholds": thresholds
        }

    def _evaluate_review_flags(
        self,
        all_stats: List[CommitStats],
        repo: Repository,
        candidate_username: str,
        candidate_email: Optional[str],
        candidate_name: Optional[str],
        thresholds: Dict[str, Any],
        parent_map: Optional[Dict[str, List[str]]] = None
    ) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []
        if not all_stats:
            return flags

        total_commits = len(all_stats)
        total_additions = sum(c.additions for c in all_stats)

        # Rule 1: BULK_IMPORT (> X% lines added in single commit or massive initial commit)
        bulk_pct_threshold = float(thresholds.get("bulk_import_line_share_pct", 50.0))
        if total_additions > 100:
            for c in all_stats:
                share = (c.additions / total_additions) * 100.0
                if share >= bulk_pct_threshold and c.additions >= 500:
                    flags.append({
                        "code": "BULK_IMPORT",
                        "severity": "review",
                        "title": "Bulk Code Addition Detected",
                        "rule": f"Single commit accounts for >= {bulk_pct_threshold:.1f}% of all additions across analyzed commits ({c.additions:,} of {total_additions:,} lines).",
                        "observed": {
                            "sha": c.sha,
                            "short_sha": c.sha[:7],
                            "additions": c.additions,
                            "total_additions": total_additions,
                            "share_pct": round(share, 1),
                            "message": c.message_first_line
                        },
                        "innocent_note": "Framework scaffolding, initial project import, vendored dependency, or mono-repo initialization."
                    })
                    break

        # Rule 2: BURST_ACTIVITY (> N commits in short window followed by silence, or 90% commits in 1 day on repo > 30d old)
        burst_min_commits = int(thresholds.get("burst_min_commits", 15))
        burst_window_hours = float(thresholds.get("burst_window_hours", 2.0))
        burst_silence_days = float(thresholds.get("burst_silence_days", 14.0))

        # Check consecutive sliding window
        burst_flagged = False
        for i in range(len(all_stats) - burst_min_commits + 1):
            window_commits = all_stats[i:i + burst_min_commits]
            t_first = window_commits[0].committed_at or window_commits[0].authored_at
            t_last = window_commits[-1].committed_at or window_commits[-1].authored_at
            if t_first and t_last:
                elapsed_hours = (t_last - t_first).total_seconds() / 3600.0
                if 0 <= elapsed_hours <= burst_window_hours:
                    # Check if followed by prolonged silence
                    if i + burst_min_commits < len(all_stats):
                        t_next = all_stats[i + burst_min_commits].committed_at or all_stats[i + burst_min_commits].authored_at
                        if t_next and ((t_next - t_last).total_seconds() / 86400.0) >= burst_silence_days:
                            flags.append({
                                "code": "BURST_ACTIVITY",
                                "severity": "review",
                                "title": "Compressed Commit Burst",
                                "rule": f"Observed {burst_min_commits} commits compressed within {elapsed_hours:.1f} hours, followed by over {burst_silence_days:.0f} days of silence.",
                                "observed": {
                                    "burst_commits": burst_min_commits,
                                    "elapsed_hours": round(elapsed_hours, 2),
                                    "silence_days": round((t_next - t_last).total_seconds() / 86400.0, 1),
                                    "start_sha": window_commits[0].sha[:7],
                                    "end_sha": window_commits[-1].sha[:7]
                                },
                                "innocent_note": "Intense hackathon sprint, weekend coding push, batching commits before a deadline, or squashing feature branches."
                            })
                            burst_flagged = True
                            break
                    else:
                        # Window is at the very end of repo history; check time since last commit
                        t_last_dt = parse_datetime(t_last)
                        if t_last_dt:
                            silence_to_now = (utcnow() - t_last_dt).total_seconds() / 86400.0
                            if silence_to_now >= burst_silence_days:
                                flags.append({
                                    "code": "BURST_ACTIVITY",
                                    "severity": "review",
                                    "title": "Compressed Commit Burst",
                                    "rule": f"Observed {burst_min_commits} commits compressed within {elapsed_hours:.1f} hours at end of history, with {silence_to_now:.0f} days elapsed since.",
                                    "observed": {
                                        "burst_commits": burst_min_commits,
                                        "elapsed_hours": round(elapsed_hours, 2),
                                        "silence_days": round(silence_to_now, 1),
                                        "start_sha": window_commits[0].sha[:7],
                                        "end_sha": window_commits[-1].sha[:7]
                                    },
                                    "innocent_note": "Intense hackathon sprint, weekend coding push, batching commits before a deadline, or squashing feature branches."
                                })
                                burst_flagged = True
                                break

        # Check 1-day concentration if repo is older than 30 days
        repo_created_dt = parse_datetime(repo.created_at)
        if not burst_flagged and total_commits >= 10 and repo_created_dt:
            repo_age_days = (utcnow() - repo_created_dt).total_seconds() / 86400.0
            if repo_age_days > 30.0:
                day_counts: Dict[str, int] = {}
                for c in all_stats:
                    t = c.committed_at or c.authored_at
                    if t:
                        day_key = t.strftime("%Y-%m-%d")
                        day_counts[day_key] = day_counts.get(day_key, 0) + 1
                for d_key, cnt in day_counts.items():
                    if (cnt / total_commits) >= 0.85:
                        flags.append({
                            "code": "BURST_ACTIVITY",
                            "severity": "review",
                            "title": "Compressed Single-Day History",
                            "rule": f"{cnt} of {total_commits} commits ({cnt/total_commits*100:.1f}%) occurred on a single calendar day ({d_key}) for a repository created {repo_age_days:.0f} days ago.",
                            "observed": {
                                "date": d_key,
                                "commits_on_date": cnt,
                                "total_commits": total_commits,
                                "share_pct": round(cnt/total_commits*100, 1)
                            },
                            "innocent_note": "Intense hackathon sprint, weekend coding push, batching commits before a deadline, or squashing feature branches."
                        })
                        break

        # Rule 3: LARGE_ADD_DELETE (Heavy addition followed by > 70% deletion within 48h)
        large_del_ratio = float(thresholds.get("large_add_delete_ratio", 0.70))
        large_window_h = float(thresholds.get("large_add_delete_window_hours", 48.0))
        for i, c_add in enumerate(all_stats):
            if c_add.additions >= 400:
                t_add = c_add.committed_at or c_add.authored_at
                if not t_add:
                    continue
                for c_del in all_stats[i + 1:]:
                    t_del = c_del.committed_at or c_del.authored_at
                    if not t_del:
                        continue
                    diff_h = (t_del - t_add).total_seconds() / 3600.0
                    if 0 <= diff_h <= large_window_h:
                        if c_del.deletions >= (c_add.additions * large_del_ratio):
                            flags.append({
                                "code": "LARGE_ADD_DELETE",
                                "severity": "review",
                                "title": "Large Addition Followed by Deletion",
                                "rule": f"Commit {c_add.sha[:7]} added {c_add.additions:,} lines and was followed within {diff_h:.1f}h by commit {c_del.sha[:7]} deleting {c_del.deletions:,} lines ({c_del.deletions/c_add.additions*100:.1f}% rollback).",
                                "observed": {
                                    "add_sha": c_add.sha,
                                    "add_short_sha": c_add.sha[:7],
                                    "additions": c_add.additions,
                                    "delete_sha": c_del.sha,
                                    "delete_short_sha": c_del.sha[:7],
                                    "deletions": c_del.deletions,
                                    "elapsed_hours": round(diff_h, 1)
                                },
                                "innocent_note": "Accidentally committed generated files, node_modules, build artifacts, test datasets, or experimented with an alternative library before rolling back."
                            })
                            break
                    elif diff_h > large_window_h:
                        break

        # Rule 4: DATE_INCONSISTENCY (author_date >> committer_date, commit predates repo, future timestamp)
        date_skew_hours = float(thresholds.get("date_skew_hours", 48.0))
        now_dt = utcnow()
        for c in all_stats:
            a_dt = parse_datetime(c.authored_at)
            cm_dt = parse_datetime(c.committed_at)
            if a_dt and cm_dt:
                skew_h = abs((a_dt - cm_dt).total_seconds()) / 3600.0
                if skew_h >= date_skew_hours:
                    flags.append({
                        "code": "DATE_INCONSISTENCY",
                        "severity": "review",
                        "title": "Commit Timestamp Skew",
                        "rule": f"Author date ({a_dt.isoformat()}) diverges from committer date ({cm_dt.isoformat()}) by {skew_h:.1f} hours.",
                        "observed": {
                            "sha": c.sha,
                            "short_sha": c.sha[:7],
                            "authored_at": a_dt.isoformat(),
                            "committed_at": cm_dt.isoformat(),
                            "skew_hours": round(skew_h, 1)
                        },
                        "innocent_note": "Rebasing/cherry-picking older patches, working offline with unsynchronized system clock, or migrating from a local git repository."
                    })
                    break
            # Future timestamp
            t_check = parse_datetime(c.committed_at or c.authored_at)
            if t_check and t_check > (now_dt + datetime.timedelta(hours=1)):
                flags.append({
                    "code": "DATE_INCONSISTENCY",
                    "severity": "review",
                    "title": "Future Commit Timestamp",
                    "rule": f"Commit timestamp ({t_check.isoformat()}) is set in the future relative to server time.",
                    "observed": {
                        "sha": c.sha,
                        "short_sha": c.sha[:7],
                        "timestamp": t_check.isoformat()
                    },
                    "innocent_note": "Local developer system clock drift or intentional mock testing of time-based features."
                })
                break

        # Rule 5: AUTHOR_MISMATCH (low candidate share < 20% on multi-author repo)
        min_share_pct = float(thresholds.get("candidate_skill_file_min_share_pct", 20.0))
        author_counts: Dict[str, int] = {}
        candidate_identifiers = set()
        if candidate_username:
            candidate_identifiers.add(candidate_username.lower())
        if candidate_email:
            candidate_identifiers.add(candidate_email.lower())
        if candidate_name:
            candidate_identifiers.add(candidate_name.lower())

        for c in all_stats:
            login = (c.author_login or c.author_name or "unknown").lower()
            author_counts[login] = author_counts.get(login, 0) + 1

        cand_commits = 0
        for c in all_stats:
            a_login = (c.author_login or "").lower()
            a_email = (c.author_email or "").lower()
            a_name = (c.author_name or "").lower()
            if (a_login in candidate_identifiers) or (a_email in candidate_identifiers) or (a_name in candidate_identifiers):
                cand_commits += 1

        if len(author_counts) > 1 and total_commits >= 5:
            cand_share = (cand_commits / total_commits) * 100.0
            if cand_share < min_share_pct:
                flags.append({
                    "code": "AUTHOR_MISMATCH",
                    "severity": "review",
                    "title": "Candidate Contribution Share Notice",
                    "rule": f"Candidate authored {cand_commits} of {total_commits} analyzed commits ({cand_share:.1f}%), which is below the {min_share_pct:.1f}% threshold for multi-author repositories.",
                    "observed": {
                        "candidate_commits": cand_commits,
                        "total_commits": total_commits,
                        "candidate_share_pct": round(cand_share, 1),
                        "total_contributors": len(author_counts)
                    },
                    "innocent_note": "Team project where teammate committed architectural boilerplate or candidate contributed via pair programming / PR review."
                })

        # Rule 6: HISTORY_REWRITE (rewritten history, parent-child timestamp reversal)
        if parent_map:
            sha_map = {c.sha: c for c in all_stats}
            for c in all_stats:
                t_child = c.committed_at or c.authored_at
                if not t_child:
                    continue
                p_shas = parent_map.get(c.sha, [])
                for p_sha in p_shas:
                    if p_sha in sha_map:
                        p_stat = sha_map[p_sha]
                        t_parent = p_stat.committed_at or p_stat.authored_at
                        if t_parent and (t_parent - t_child).total_seconds() > (24.0 * 3600.0):
                            rev_hours = (t_parent - t_child).total_seconds() / 3600.0
                            flags.append({
                                "code": "HISTORY_REWRITE",
                                "severity": "review",
                                "title": "Non-Linear History / Rebase Signal",
                                "rule": f"Commit {c.sha[:7]} is timestamped earlier than its parent commit {p_stat.sha[:7]} by {rev_hours:.1f} hours.",
                                "observed": {
                                    "child_sha": c.sha[:7],
                                    "parent_sha": p_stat.sha[:7],
                                    "time_reversal_hours": round(rev_hours, 1)
                                },
                                "innocent_note": "Git rebase onto upstream, squashing PR commits, or cleaning commit messages before submitting."
                            })
                            break
                if any(f["code"] == "HISTORY_REWRITE" for f in flags):
                    break

        # Rule 7: GENERIC_MESSAGES (> 30% generic messages like "update", "wip")
        generic_pct_threshold = float(thresholds.get("generic_message_min_pct", 30.0))
        generic_count = 0
        for c in all_stats:
            msg = (c.message_first_line or "").strip().lower()
            # remove punctuation
            clean_msg = re.sub(r"[^\w\s]", "", msg).strip()
            if clean_msg in GENERIC_COMMIT_WORDS or len(clean_msg) <= 4:
                generic_count += 1

        if total_commits >= 5:
            generic_pct = (generic_count / total_commits) * 100.0
            if generic_pct >= generic_pct_threshold:
                flags.append({
                    "code": "GENERIC_MESSAGES",
                    "severity": "review",
                    "title": "High Generic Commit Message Ratio",
                    "rule": f"{generic_count} of {total_commits} commits ({generic_pct:.1f}%) use generic shorthand commit messages (e.g. 'update', 'wip', 'fix').",
                    "observed": {
                        "generic_count": generic_count,
                        "total_commits": total_commits,
                        "generic_pct": round(generic_pct, 1)
                    },
                    "innocent_note": "Rapid prototyping where developer pushes quick intermediate saves before squashing or tidying."
                })

        return flags

    def _build_timeline(self, all_stats: List[CommitStats]) -> List[Dict[str, Any]]:
        """Groups commits by ISO week start (Monday)."""
        if not all_stats:
            return []

        weekly_map: Dict[str, Dict[str, Any]] = {}
        for c in all_stats:
            t = c.committed_at or c.authored_at
            if not t:
                continue
            # Get Monday of that week
            monday = t.date() - datetime.timedelta(days=t.weekday())
            w_key = monday.isoformat()
            if w_key not in weekly_map:
                weekly_map[w_key] = {
                    "week_start": w_key,
                    "commits_count": 0,
                    "additions": 0,
                    "deletions": 0
                }
            weekly_map[w_key]["commits_count"] += 1
            weekly_map[w_key]["additions"] += (c.additions or 0)
            weekly_map[w_key]["deletions"] += (c.deletions or 0)

        sorted_weeks = sorted(weekly_map.values(), key=lambda x: x["week_start"])
        return sorted_weeks

    def _build_daily_heatmap(self, all_stats: List[CommitStats]) -> List[Dict[str, Any]]:
        """Builds a daily commit count map for calendar heatmap rendering."""
        if not all_stats:
            return []

        daily_map: Dict[str, int] = {}
        for c in all_stats:
            t = c.committed_at or c.authored_at
            if not t:
                continue
            d_key = t.strftime("%Y-%m-%d")
            daily_map[d_key] = daily_map.get(d_key, 0) + 1

        results = []
        for d_str, count in sorted(daily_map.items()):
            # Activity intensity level (0 to 4)
            level = 1 if count == 1 else (2 if count <= 3 else (3 if count <= 7 else 4))
            results.append({
                "date": d_str,
                "count": count,
                "level": level
            })
        return results

    def _build_large_additions(self, all_stats: List[CommitStats], owner: str, repo: str) -> List[Dict[str, Any]]:
        """Ranked list of commits with largest additions."""
        if not all_stats:
            return []

        total_additions = sum(c.additions for c in all_stats) or 1
        sorted_by_add = sorted(all_stats, key=lambda c: c.additions or 0, reverse=True)
        top = sorted_by_add[:10]

        items = []
        for c in top:
            share = ((c.additions or 0) / total_additions) * 100.0
            items.append({
                "sha": c.sha,
                "short_sha": c.sha[:7],
                "message": c.message_first_line or "",
                "author_login": c.author_login or c.author_name or "unknown",
                "committed_at": (c.committed_at or c.authored_at).isoformat() if (c.committed_at or c.authored_at) else None,
                "additions": c.additions or 0,
                "deletions": c.deletions or 0,
                "files_changed": c.files_changed or 0,
                "share_pct": round(share, 1),
                "verified": bool(c.verified),
                "permalink": f"https://github.com/{owner}/{repo}/commit/{c.sha}"
            })
        return items

    def _build_authors_breakdown(
        self,
        all_stats: List[CommitStats],
        candidate_username: str,
        candidate_email: Optional[str],
        candidate_name: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Breakdown of commits and lines by author, highlighting signed-in user."""
        if not all_stats:
            return []

        total_commits = len(all_stats) or 1
        total_lines = sum((c.additions or 0) + (c.deletions or 0) for c in all_stats) or 1

        candidate_identifiers = set()
        if candidate_username:
            candidate_identifiers.add(candidate_username.lower())
        if candidate_email:
            candidate_identifiers.add(candidate_email.lower())
        if candidate_name:
            candidate_identifiers.add(candidate_name.lower())

        authors_map: Dict[str, Dict[str, Any]] = {}
        for c in all_stats:
            key = (c.author_login or c.author_name or "unknown").strip()
            if key not in authors_map:
                is_candidate = False
                if ((c.author_login and c.author_login.lower() in candidate_identifiers) or
                    (c.author_email and c.author_email.lower() in candidate_identifiers) or
                    (c.author_name and c.author_name.lower() in candidate_identifiers)):
                    is_candidate = True

                authors_map[key] = {
                    "login": c.author_login or key,
                    "name": c.author_name or key,
                    "email": c.author_email,
                    "is_signed_in_user": is_candidate,
                    "commits_count": 0,
                    "additions": 0,
                    "deletions": 0,
                }
            authors_map[key]["commits_count"] += 1
            authors_map[key]["additions"] += (c.additions or 0)
            authors_map[key]["deletions"] += (c.deletions or 0)

        result = []
        for author in authors_map.values():
            c_share = (author["commits_count"] / total_commits) * 100.0
            l_share = ((author["additions"] + author["deletions"]) / total_lines) * 100.0
            author["commits_share_pct"] = round(c_share, 1)
            author["lines_share_pct"] = round(l_share, 1)
            result.append(author)

        # Sort with signed-in user first, then by commits count desc
        result.sort(key=lambda a: (not a["is_signed_in_user"], -a["commits_count"]))
        return result


commit_history_service = CommitHistoryService()
