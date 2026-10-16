import hashlib
import json
from typing import Dict, List, Any, Optional, Tuple
from backend.services.assessment_engine import (
    STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR
)

class SnapshotService:
    """
    Manages immutable state snapshots, cryptographic hash-chaining of evidence,
    and automatic regression detection between commits.
    """

    def compute_hash_chain(
        self,
        prev_hash: Optional[str],
        commit_sha: str,
        coverage_score: float,
        assessments: List[Dict[str, Any]]
    ) -> str:
        """
        Creates cryptographic SHA-256 chain linking previous snapshot to new state.
        """
        sorted_states = sorted([f"{a['requirement_id']}:{a['status']}" for a in assessments])
        state_repr = "|".join(sorted_states)
        payload = f"{prev_hash or 'GENESIS'}:{commit_sha}:{coverage_score}:{state_repr}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def detect_regressions(
        self,
        old_assessments: List[Dict[str, Any]],
        new_assessments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Identifies requirements that experienced an evidence regression.
        E.g. Strong -> Basic/Not demonstrated, or Basic -> Not demonstrated.
        """
        old_map = {a["requirement_id"]: a["status"] for a in old_assessments}
        rank = {STATUS_STRONG: 2, STATUS_BASIC: 1, STATUS_NOT_DEMONSTRATED: 0, STATUS_UNCLEAR: -1}

        regressions = []
        for new_a in new_assessments:
            req_id = new_a["requirement_id"]
            if req_id in old_map:
                old_status = old_map[req_id]
                new_status = new_a["status"]

                if old_status in rank and new_status in rank:
                    if rank[new_status] < rank[old_status] and rank[new_status] >= 0:
                        regressions.append({
                            "requirement_id": req_id,
                            "previous_status": old_status,
                            "new_status": new_status,
                            "reason": f"Regression detected: evidence previously demonstrated ({old_status}) was removed or invalidated in new commit ({new_status})."
                        })

        return regressions

snapshot_service = SnapshotService()
