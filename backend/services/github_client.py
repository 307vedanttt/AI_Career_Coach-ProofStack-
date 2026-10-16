import base64
import logging
import re
from typing import Dict, List, Any, Optional, Tuple
import httpx
from backend.config import settings

logger = logging.getLogger(__name__)

class GitHubAPIError(Exception):
    pass

class GitHubClient:
    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.base_url = "https://api.github.com"
        self.max_file_bytes = settings.MAX_FILE_BYTES

    def _get_headers(self, etag: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "ProofStack-Analyzer/1.0"
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        if etag:
            headers["If-None-Match"] = etag
        return headers

    def parse_repo_url(self, repo_url: str) -> Tuple[str, str]:
        """Extracts (owner, repo) from a GitHub URL."""
        clean = repo_url.rstrip("/").removesuffix(".git")
        m = re.search(r"github\.com[/:]([\w\-\.]+)/([\w\-\.]+)", clean)
        if not m:
            # Fallback for owner/repo format
            parts = clean.split("/")
            if len(parts) >= 2:
                return parts[-2], parts[-1]
            raise ValueError(f"Invalid GitHub repository URL: {repo_url}")
        return m.group(1), m.group(2)

    async def get_repository_info(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetches repository metadata and default branch."""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            if resp.status_code == 404:
                raise GitHubAPIError(f"Repository {owner}/{repo} not found on GitHub.")
            if resp.status_code == 403:
                raise GitHubAPIError(f"GitHub API rate limit exceeded or access forbidden: {resp.text}")
            if resp.status_code != 200:
                raise GitHubAPIError(f"GitHub API returned HTTP {resp.status_code}: {resp.text}")
            return resp.json()

    async def get_latest_commit_sha(self, owner: str, repo: str, branch: str = "main") -> str:
        """Gets the SHA of the latest commit on the branch."""
        url = f"{self.base_url}/repos/{owner}/{repo}/commits/{branch}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            if resp.status_code != 200:
                raise GitHubAPIError(f"Could not retrieve latest commit for {owner}/{repo} ({branch}): {resp.text}")
            data = resp.json()
            return data["sha"]

    async def get_tree(self, owner: str, repo: str, commit_sha: str) -> List[Dict[str, Any]]:
        """Retrieves recursive repository tree for a commit."""
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{commit_sha}?recursive=1"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            if resp.status_code != 200:
                raise GitHubAPIError(f"Failed to fetch tree for {owner}/{repo} at {commit_sha}: {resp.text}")
            data = resp.json()
            return data.get("tree", [])

    async def get_file_content(self, owner: str, repo: str, path: str, commit_sha: str) -> Optional[str]:
        """Retrieves text content of a single file bounded by MAX_FILE_BYTES."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}?ref={commit_sha}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            if resp.status_code == 404:
                return None
            if resp.status_code != 200:
                logger.warning(f"Failed to get file {path}: HTTP {resp.status_code}")
                return None

            data = resp.json()
            size = data.get("size", 0)
            if size > self.max_file_bytes:
                logger.info(f"Skipping file {path} ({size} bytes) exceeding max file bytes.")
                return None

            encoding = data.get("encoding")
            raw_content = data.get("content", "")
            if encoding == "base64":
                try:
                    return base64.b64decode(raw_content).decode("utf-8", errors="replace")
                except Exception as e:
                    logger.warning(f"Error decoding base64 for {path}: {str(e)}")
                    return None
            return raw_content

    async def check_repo_etag(self, owner: str, repo: str, etag: Optional[str]) -> Tuple[bool, Optional[str]]:
        """
        Conditional check via ETag.
        Returns (has_changed: bool, new_etag: Optional[str]).
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/commits"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=self._get_headers(etag=etag), params={"per_page": 1})
            if resp.status_code == 304:
                return False, etag
            new_etag = resp.headers.get("ETag")
            return True, new_etag

github_client = GitHubClient()
