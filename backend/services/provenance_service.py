import datetime
import json
import logging
import re
import uuid
from typing import Dict, List, Any, Optional, Tuple, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.config import settings
from backend.models.models import (
    Repository, RepoProvenance, WebhookDelivery, FileEvidence, RepositoryFile, utcnow
)
from backend.services.github_client import github_client, GitHubAPIError

logger = logging.getLogger(__name__)

PROVENANCE_DETECTOR_VERSION = "provenance_detector@v1.0"
DEFAULT_COMMIT_CAP = 200

class ProvenanceService:
    """
    Pure-signal Repository Provenance Engine:
    Inspects real GitHub signals across 6 dimensions:
    1. Repository age & timeline
    2. Fork and upstream divergence
    3. Candidate contributions & co-authors
    4. Signed commits & cryptographic verification
    5. Upstream source file comparisons (identical/modified/added)
    6. History rewrite & repository event hints
    """

    def __init__(self, commit_cap: int = DEFAULT_COMMIT_CAP):
        self.commit_cap = commit_cap

    def extract_co_authors(self, message: str) -> List[Dict[str, str]]:
        """Parses Co-authored-by: Name <email> trailers from commit message."""
        pattern = r"(?mi)^Co-authored-by:\s*([^<\r\n]+?)\s*<([^>\r\n]+)>"
        matches = re.findall(pattern, message or "")
        co_authors = []
        for name, email in matches:
            co_authors.append({
                "name": name.strip(),
                "email": email.strip()
            })
        return co_authors

    async def analyze_repository_provenance(
        self,
        db: AsyncSession,
        repo: Repository,
        candidate_username: str,
        candidate_email: Optional[str] = None,
        candidate_name: Optional[str] = None,
        evidence_files: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive pure-signal provenance analysis on a repository.
        Stores result in repo_provenance table and returns structured payload.
        """
        owner = repo.owner
        name = repo.name
        now = datetime.datetime.now(datetime.timezone.utc)
        signals: Dict[str, Any] = {}
        flags: List[Dict[str, Any]] = []

        # ---------------------------------------------------------------------
        # 1. Repository Age & Metadata
        # ---------------------------------------------------------------------
        repo_info = {}
        try:
            repo_info = await github_client.get_repository_info(owner, name)
        except Exception as e:
            logger.warning(f"Failed to fetch repository info for {owner}/{name}: {e}")
            repo_info = {
                "created_at": repo.created_at.isoformat() if repo.created_at else now.isoformat(),
                "pushed_at": repo.last_synced_at.isoformat() if repo.last_synced_at else now.isoformat(),
                "default_branch": repo.default_branch or "main",
                "fork": False
            }

        created_at_str = repo_info.get("created_at") or now.isoformat()
        pushed_at_str = repo_info.get("pushed_at") or created_at_str
        default_branch = repo_info.get("default_branch") or repo.default_branch or "main"

        try:
            created_dt = datetime.datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        except Exception:
            created_dt = now

        repo_age_days = max(0, (now - created_dt).days)

        # First commit date
        first_commit_date = created_at_str
        try:
            first_commit = await github_client.get_first_commit(owner, name)
            if first_commit:
                first_commit_date = (
                    first_commit.get("commit", {}).get("author", {}).get("date")
                    or first_commit.get("commit", {}).get("committer", {}).get("date")
                    or created_at_str
                )
        except Exception as e:
            logger.warning(f"Could not retrieve first commit for {owner}/{name}: {e}")

        signals["age"] = {
            "created_at": created_at_str,
            "pushed_at": pushed_at_str,
            "first_commit_date": first_commit_date,
            "repo_age_days": repo_age_days,
            "default_branch": default_branch
        }

        # ---------------------------------------------------------------------
        # 2. Commits & Pagination (Bounded to self.commit_cap, conditional ETag)
        # ---------------------------------------------------------------------
        commits: List[Dict[str, Any]] = []
        cap_hit = False
        latest_etag = repo.last_etag
        try:
            commits, cap_hit, latest_etag = await github_client.get_commits(
                owner, name, branch=default_branch, max_commits=self.commit_cap, etag=None
            )
        except Exception as e:
            logger.warning(f"Failed to retrieve commits for {owner}/{name}: {e}")
            commits = []

        total_analyzed_commits = len(commits)
        signals["analysis_limits"] = {
            "analyzed_commits_count": total_analyzed_commits,
            "commit_cap": self.commit_cap,
            "cap_hit": cap_hit,
            "banner_text": f"Analysis limited to {self.commit_cap} commits" if cap_hit else None
        }

        if cap_hit:
            flags.append({
                "code": "RATE_LIMIT_COMMIT_CAP",
                "severity": "info",
                "title": "Analysis Limited to Commit Cap",
                "observed_values": {"cap": self.commit_cap, "analyzed": total_analyzed_commits},
                "why_it_can_be_innocent": "Analysis was bounded to protect GitHub API rate limits. Commits outside the most recent window are not assessed.",
                "permalink": f"https://github.com/{owner}/{name}/commits/{default_branch}"
            })

        # ---------------------------------------------------------------------
        # 3. Candidate Contributions & Co-authors
        # ---------------------------------------------------------------------
        authors_by_login: Dict[str, int] = {}
        authors_by_email: Dict[str, int] = {}
        distinct_logins: Set[str] = set()
        distinct_emails: Set[str] = set()
        all_co_authors: List[Dict[str, str]] = []
        user_own_commits = 0
        candidate_user_lower = (candidate_username or "").strip().lower()
        candidate_email_lower = (candidate_email or "").strip().lower()
        candidate_name_lower = (candidate_name or "").strip().lower()

        # Per-file commit attribution tracking
        file_commit_counts: Dict[str, int] = {}
        file_candidate_counts: Dict[str, int] = {}

        for c in commits:
            author_obj = c.get("author") or {}
            commit_obj = c.get("commit") or {}
            c_author = commit_obj.get("author") or {}

            login = (author_obj.get("login") or "").strip()
            email = (c_author.get("email") or "").strip()
            name_val = (c_author.get("name") or "").strip()
            message = commit_obj.get("message") or ""

            if login:
                authors_by_login[login] = authors_by_login.get(login, 0) + 1
                distinct_logins.add(login.lower())
            if email:
                authors_by_email[email] = authors_by_email.get(email, 0) + 1
                distinct_emails.add(email.lower())

            # Check if this commit belongs to candidate
            is_candidate_commit = False
            if login and candidate_user_lower and login.lower() == candidate_user_lower:
                is_candidate_commit = True
            elif email and candidate_email_lower and email.lower() == candidate_email_lower:
                is_candidate_commit = True
            elif name_val and candidate_name_lower and name_val.lower() == candidate_name_lower:
                is_candidate_commit = True

            if is_candidate_commit:
                user_own_commits += 1

            # Check co-authors in commit trailer
            co_authors = self.extract_co_authors(message)
            for ca in co_authors:
                if ca not in all_co_authors:
                    all_co_authors.append(ca)

            # File level contributions (when commit files are present)
            commit_files = c.get("files") or []
            for f in commit_files:
                f_path = f.get("filename")
                if f_path:
                    file_commit_counts[f_path] = file_commit_counts.get(f_path, 0) + 1
                    if is_candidate_commit:
                        file_candidate_counts[f_path] = file_candidate_counts.get(f_path, 0) + 1

        candidate_share_pct = (
            round((user_own_commits / total_analyzed_commits) * 100, 1)
            if total_analyzed_commits > 0 else 0.0
        )
        distinct_contributors_count = max(len(distinct_logins), len(distinct_emails), 1 if total_analyzed_commits > 0 else 0)

        signals["contributions"] = {
            "total_analyzed_commits": total_analyzed_commits,
            "candidate_username": candidate_username,
            "candidate_commit_count": user_own_commits,
            "candidate_commit_share": candidate_share_pct,
            "distinct_contributors_count": distinct_contributors_count,
            "authors_by_login": authors_by_login,
            "authors_by_email": authors_by_email,
            "co_authors": all_co_authors
        }

        # ---------------------------------------------------------------------
        # 4. Signed Commits Verification
        # ---------------------------------------------------------------------
        verified_count = 0
        unverified_count = 0
        unsigned_count = 0

        for c in commits:
            verification = c.get("commit", {}).get("verification") or {}
            is_verified = bool(verification.get("verified"))
            reason = verification.get("reason") or "unsigned"

            if is_verified:
                verified_count += 1
            elif reason in ("unsigned", None, "", "no_user"):
                unsigned_count += 1
            else:
                unverified_count += 1

        percentage_signed = (
            round((verified_count / total_analyzed_commits) * 100, 1)
            if total_analyzed_commits > 0 else 0.0
        )

        signals["signed_commits"] = {
            "verified_count": verified_count,
            "unverified_count": unverified_count,
            "unsigned_count": unsigned_count,
            "percentage_signed": percentage_signed
        }

        # Unsigned commits are normal; report as info only
        flags.append({
            "code": "SIGNED_COMMITS_INFO",
            "severity": "info",
            "title": f"Cryptographic Signatures ({percentage_signed}% signed)",
            "observed_values": {
                "verified": verified_count,
                "unsigned": unsigned_count,
                "unverified": unverified_count,
                "percentage_signed": percentage_signed
            },
            "why_it_can_be_innocent": "Unsigned commits are standard across Git workflows unless explicit GPG/SSH commit signing is enforced by repository policy.",
            "permalink": f"https://github.com/{owner}/{name}/commits/{default_branch}"
        })

        # ---------------------------------------------------------------------
        # 5. Fork & Upstream Divergence
        # ---------------------------------------------------------------------
        is_fork = bool(repo_info.get("fork"))
        parent_info = repo_info.get("parent") or {}
        source_info = repo_info.get("source") or {}
        ahead_by = 0
        behind_by = 0
        upstream_status = "standalone"
        upstream_full_name = parent_info.get("full_name") or (f"{owner}/{name}" if is_fork else None)
        upstream_url = parent_info.get("html_url")
        user_commits_ahead = 0
        upstream_tree_map: Dict[str, str] = {}

        if is_fork:
            upstream_status = "fork"
            parent_owner = None
            parent_repo = None
            parent_branch = "main"

            if upstream_full_name and "/" in upstream_full_name:
                parts = upstream_full_name.split("/")
                parent_owner = parts[0]
                parent_repo = parts[1]
                parent_branch = parent_info.get("default_branch") or "main"

            if parent_owner and parent_repo:
                # Compare against upstream default branch
                try:
                    # Compare base...head: parent_owner:parent_branch...owner:default_branch
                    compare_res = await github_client.compare_commits(
                        owner, name, f"{parent_owner}:{parent_branch}", default_branch
                    )
                    if compare_res.get("status") == "not_found" or compare_res.get("error") == "404 Not Found":
                        upstream_status = "upstream_deleted_or_inaccessible"
                        flags.append({
                            "code": "UPSTREAM_UNAVAILABLE",
                            "severity": "review",
                            "title": "Upstream Repository Inaccessible",
                            "observed_values": {"parent": upstream_full_name},
                            "why_it_can_be_innocent": "Upstream repository may have been deleted, made private, or renamed by the original author.",
                            "permalink": upstream_url or f"https://github.com/{owner}/{name}"
                        })
                    else:
                        ahead_by = compare_res.get("ahead_by", 0)
                        behind_by = compare_res.get("behind_by", 0)
                        compare_commits = compare_res.get("commits") or []
                        
                        # Count candidate's own commits among the commits ahead
                        for cc in compare_commits:
                            c_auth = cc.get("author") or {}
                            c_comm = cc.get("commit", {}).get("author") or {}
                            l_val = (c_auth.get("login") or "").lower()
                            e_val = (c_comm.get("email") or "").lower()
                            if (candidate_user_lower and l_val == candidate_user_lower) or \
                               (candidate_email_lower and e_val == candidate_email_lower):
                                user_commits_ahead += 1

                except Exception as e:
                    logger.warning(f"Error comparing with upstream {parent_owner}/{parent_repo}: {e}")
                    upstream_status = "compare_failed"

                # Fetch upstream tree map once for blob SHA verification
                try:
                    upstream_tree_map = await github_client.get_tree_map(
                        parent_owner, parent_repo, parent_branch
                    )
                except Exception as e:
                    logger.warning(f"Could not retrieve upstream tree for {parent_owner}/{parent_repo}: {e}")

            # Fork with no own commits ahead is flagged
            if user_commits_ahead == 0 and upstream_status != "upstream_deleted_or_inaccessible":
                flags.append({
                    "code": "FORK_NO_OWN_CHANGES",
                    "severity": "review",
                    "title": "Fork Without Candidate Commits Ahead",
                    "observed_values": {
                        "is_fork": True,
                        "upstream": upstream_full_name,
                        "ahead_by": ahead_by,
                        "user_commits_ahead": user_commits_ahead
                    },
                    "why_it_can_be_innocent": "Developers frequently fork repositories to review code, test local builds, or prepare future pull requests without committing directly.",
                    "permalink": f"https://github.com/{owner}/{name}"
                })

        signals["fork_and_upstream"] = {
            "is_fork": is_fork,
            "upstream_status": upstream_status,
            "parent_full_name": upstream_full_name,
            "parent_url": upstream_url,
            "source_full_name": source_info.get("full_name"),
            "source_url": source_info.get("html_url"),
            "ahead_by": ahead_by,
            "behind_by": behind_by,
            "user_commits_ahead": user_commits_ahead
        }

        # ---------------------------------------------------------------------
        # 6. Upstream Source Blob SHA Comparison (Evidence Files)
        # ---------------------------------------------------------------------
        # Fetch local repo tree map once
        local_tree_map = await github_client.get_tree_map(owner, name, default_branch)
        
        # Files that evidence a skill (from DB or parameter)
        if evidence_files is None:
            # Query existing evidence files for this repository
            evi_stmt = select(FileEvidence.file_path).where(FileEvidence.repo_id == repo.id).distinct()
            evi_res = await db.execute(evi_stmt)
            evidence_files = [r[0] for r in evi_res.fetchall()]

        files_provenance: Dict[str, Dict[str, Any]] = {}
        for file_path in evidence_files:
            local_sha = local_tree_map.get(file_path)
            
            # File candidate share signal
            c_commits = file_candidate_counts.get(file_path, 0)
            t_commits = file_commit_counts.get(file_path, max(1, c_commits))
            file_candidate_share = round((c_commits / t_commits) * 100, 1) if t_commits > 0 else 0.0

            file_info: Dict[str, Any] = {
                "file_path": file_path,
                "local_sha": local_sha,
                "file_candidate_commits": c_commits,
                "file_total_commits": t_commits,
                "file_candidate_share": file_candidate_share,
                "upstream_status": "standalone"
            }

            if is_fork and upstream_tree_map:
                upstream_sha = upstream_tree_map.get(file_path)
                if upstream_sha is None:
                    file_info["upstream_status"] = "added in this repo"
                elif upstream_sha == local_sha:
                    file_info["upstream_status"] = "unchanged from upstream"
                    file_info["reason"] = "identical to upstream file"
                    flags.append({
                        "code": "UPSTREAM_IDENTICAL_EVIDENCE",
                        "severity": "review",
                        "title": f"Evidence File Unchanged from Upstream: {file_path}",
                        "observed_values": {
                            "file_path": file_path,
                            "local_blob_sha": local_sha,
                            "upstream_blob_sha": upstream_sha
                        },
                        "why_it_can_be_innocent": "Template files, configuration defaults, and boilerplate code often remain unmodified from the upstream project.",
                        "permalink": f"https://github.com/{owner}/{name}/blob/{default_branch}/{file_path}"
                    })
                else:
                    file_info["upstream_status"] = "modified from upstream"

            files_provenance[file_path] = file_info

        signals["evidence_files_provenance"] = files_provenance

        # ---------------------------------------------------------------------
        # 7. Rapid Creation Invariant (< 2 days old with large content)
        # ---------------------------------------------------------------------
        if repo_age_days <= 1:
            flags.append({
                "code": "RECENT_REPO_CREATION",
                "severity": "review",
                "title": f"Repository Created Recently ({repo_age_days} day(s) ago)",
                "observed_values": {
                    "created_at": created_at_str,
                    "repo_age_days": repo_age_days,
                    "total_commits": total_analyzed_commits
                },
                "why_it_can_be_innocent": "Candidates frequently publish new public repositories or export existing projects immediately before sharing their portfolio.",
                "permalink": f"https://github.com/{owner}/{name}"
            })

        # ---------------------------------------------------------------------
        # 8. History Rewrite Hints (Force-push events, renames, branch shifts)
        # ---------------------------------------------------------------------
        # Check webhook deliveries table for force pushes
        history_events: List[Dict[str, Any]] = []
        try:
            wh_stmt = select(WebhookDelivery).where(
                WebhookDelivery.repo_id == repo.id,
                WebhookDelivery.event_type == "push"
            ).order_by(desc(WebhookDelivery.received_at)).limit(20)
            wh_res = await db.execute(wh_stmt)
            deliveries = wh_res.scalars().all()
            for d in deliveries:
                # If status recorded or forced payload hint
                if "force" in str(d.status).lower():
                    history_events.append({
                        "event": "force-push",
                        "timestamp": d.received_at.isoformat() if d.received_at else None,
                        "details": "Force-push event detected in webhook telemetry."
                    })
        except Exception as e:
            logger.warning(f"Failed to check webhook deliveries for {repo.id}: {e}")

        # Check default branch shift hint
        if repo.default_branch and repo_info.get("default_branch") and repo.default_branch != repo_info.get("default_branch"):
            history_events.append({
                "event": "default_branch_changed",
                "from": repo.default_branch,
                "to": repo_info.get("default_branch"),
                "details": f"Default branch transitioned from {repo.default_branch} to {repo_info.get('default_branch')}."
            })
            flags.append({
                "code": "DEFAULT_BRANCH_CHANGED",
                "severity": "info",
                "title": "Default Branch Changed",
                "observed_values": {
                    "previous_branch": repo.default_branch,
                    "current_branch": repo_info.get("default_branch")
                },
                "why_it_can_be_innocent": "Standard modern git repository migration (e.g. master to main).",
                "permalink": f"https://github.com/{owner}/{name}"
            })

        signals["history_rewrite_hints"] = history_events

        # ---------------------------------------------------------------------
        # 9. Persist into repo_provenance table
        # ---------------------------------------------------------------------
        # Snapshot version or commit hash
        snapshot_version = repo.last_commit_sha or (commits[0]["sha"] if commits else "initial")
        prov_record = RepoProvenance(
            id=str(uuid.uuid4()),
            repo_id=repo.id,
            snapshot_version=snapshot_version,
            detector_version=PROVENANCE_DETECTOR_VERSION,
            signals_json=json.dumps(signals),
            flags_json=json.dumps(flags),
            created_at=now
        )
        db.add(prov_record)
        await db.commit()
        await db.refresh(prov_record)

        return {
            "id": prov_record.id,
            "repo_id": repo.id,
            "snapshot_version": snapshot_version,
            "detector_version": PROVENANCE_DETECTOR_VERSION,
            "signals": signals,
            "flags": flags,
            "created_at": prov_record.created_at.isoformat()
        }

    async def get_latest_provenance(
        self,
        db: AsyncSession,
        repo_id: str
    ) -> Optional[Dict[str, Any]]:
        """Retrieves the most recent provenance record for a repository."""
        stmt = select(RepoProvenance).where(
            RepoProvenance.repo_id == repo_id
        ).order_by(desc(RepoProvenance.created_at)).limit(1)
        res = await db.execute(stmt)
        record = res.scalar_one_or_none()
        if not record:
            return None

        try:
            signals = json.loads(record.signals_json)
        except Exception:
            signals = {}

        try:
            flags = json.loads(record.flags_json)
        except Exception:
            flags = []

        return {
            "id": record.id,
            "repo_id": record.repo_id,
            "snapshot_version": record.snapshot_version,
            "detector_version": record.detector_version,
            "signals": signals,
            "flags": flags,
            "created_at": record.created_at.isoformat() if record.created_at else None
        }

provenance_service = ProvenanceService()
