import hashlib
import json
import logging
from typing import Dict, Any, Optional, Tuple
from backend.services.security import verify_github_webhook_signature
from backend.config import settings

logger = logging.getLogger(__name__)

class WebhookService:
    def __init__(self):
        self.seen_deliveries = set()

    def process_github_webhook(
        self,
        payload_bytes: bytes,
        signature_header: Optional[str],
        event_type: str,
        delivery_id: Optional[str],
        secret: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Validates GitHub webhook delivery:
        - Signature verification
        - Delivery ID idempotency check
        - Event type parsing (focusing on 'push' and 'ping')
        """
        effective_secret = secret or settings.GITHUB_WEBHOOK_SECRET

        # 1. Verify signature
        if not verify_github_webhook_signature(payload_bytes, signature_header, effective_secret):
            return False, "Invalid or missing X-Hub-Signature-256 HMAC-SHA256 signature.", None

        # 2. Check delivery idempotency
        if delivery_id:
            if delivery_id in self.seen_deliveries:
                return False, f"Duplicate webhook delivery ID: {delivery_id}", None
            self.seen_deliveries.add(delivery_id)

        # 3. Parse JSON payload
        try:
            payload = json.loads(payload_bytes.decode("utf-8"))
        except Exception as e:
            return False, f"Malformed JSON webhook payload: {str(e)}", None

        # Ping event handling
        if event_type == "ping":
            return True, "Ping event acknowledged.", {"type": "ping", "zen": payload.get("zen")}

        # Only process push events
        if event_type != "push":
            return False, f"Ignored event type: {event_type}. Only 'push' is processed.", None

        # Extract repo and commit information
        repository_data = payload.get("repository", {})
        repo_name = repository_data.get("name")
        repo_owner = repository_data.get("owner", {}).get("login") or repository_data.get("owner", {}).get("name")
        repo_url = repository_data.get("clone_url") or repository_data.get("html_url")

        head_commit = payload.get("head_commit") or {}
        commit_sha = head_commit.get("id") or payload.get("after")

        if not commit_sha or commit_sha == "0000000000000000000000000000000000000000":
            return False, "Push event contains empty or deleted branch commit SHA.", None

        return True, "Push event verified and queued.", {
            "type": "push",
            "owner": repo_owner,
            "repo_name": repo_name,
            "repo_url": repo_url,
            "commit_sha": commit_sha,
            "ref": payload.get("ref", "refs/heads/main"),
            "delivery_id": delivery_id
        }

webhook_service = WebhookService()
