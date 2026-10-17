import asyncio
import logging
import time
from typing import Dict, Any, Optional, Callable
from backend.services.github_client import github_client
from backend.config import settings

logger = logging.getLogger(__name__)

class PollingService:
    def __init__(self):
        self.poll_interval = settings.POLL_INTERVAL_SECONDS
        self.debounce_seconds = settings.DEBOUNCE_SECONDS
        self._last_poll_time: Dict[str, float] = {} # repo_id -> timestamp
        self._running_jobs: set = set()

    async def poll_repository_changes(
        self,
        repo_id: str,
        owner: str,
        repo_name: str,
        last_etag: Optional[str] = None,
        branch: str = "main",
        force: bool = False,
        current_sha: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Polls GitHub for repository changes.
        Uses direct commit SHA comparison and debounce protection.
        If force=True, debouncing is bypassed to force an instant fresh sync.
        """
        now = time.time()
        last_poll = self._last_poll_time.get(repo_id, 0)
        if not force and (now - last_poll < self.debounce_seconds):
            return {"changed": False, "reason": "Debounced", "etag": last_etag}

        self._last_poll_time[repo_id] = now

        try:
            latest_sha = await github_client.get_latest_commit_sha(owner, repo_name, branch)
            if not force and current_sha and latest_sha == current_sha:
                return {
                    "changed": False,
                    "reason": f"Up to date at {current_sha[:7]}",
                    "latest_commit_sha": latest_sha,
                    "etag": last_etag
                }

            return {
                "changed": True,
                "latest_commit_sha": latest_sha,
                "new_etag": last_etag,
                "forced": force
            }
        except Exception as e:
            logger.warning(f"Polling failed for {owner}/{repo_name}: {str(e)}")
            return {"changed": False, "reason": str(e), "etag": last_etag}

polling_service = PollingService()
