import json
from typing import Dict, List, Any, Tuple

# Declared official assessment statuses
STATUS_STRONG = "Demonstrated (strong)"
STATUS_BASIC = "Demonstrated (basic)"
STATUS_NOT_DEMONSTRATED = "Not demonstrated in this scope"
STATUS_UNCLEAR = "Unclear"

class AssessmentEngine:
    """
    Pure, deterministic status calculation engine.
    Calculates requirements statuses strictly based on surviving signals,
    detector properties, and verified evidence.
    """

    def compute_status(
        self,
        requirement: Dict[str, Any],
        evidence_list: List[Dict[str, Any]],
        rejected_list: List[Dict[str, Any]],
        llm_confirmed: bool = True,
        llm_rejected: bool = False,
        detector_available: bool = True
    ) -> Tuple[str, str, int, List[str]]:
        """
        Pure function computing (status, reason, signal_count, signal_types).
        """
        assessable = requirement.get("assessable", "code_assessable")
        if assessable == "not_assessable_from_repo":
            return (
                STATUS_UNCLEAR,
                "Requirement is classified as not assessable from repository source code.",
                0,
                []
            )

        if not detector_available:
            return (
                STATUS_UNCLEAR,
                "No deterministic code detector is registered for this skill category.",
                0,
                []
            )

        # If LLM explicitly rejected guarded evidence, mark as Unclear (not false negative)
        if llm_rejected and evidence_list:
            return (
                STATUS_UNCLEAR,
                "Conflict between deterministic heuristic and semantic LLM verification.",
                len(evidence_list),
                [e.get("signal_type", "unknown") for e in evidence_list]
            )

        if not evidence_list:
            if rejected_list:
                reasons = "; ".join(set(r.get("rejection_reason", "Rejected evidence") for r in rejected_list))
                return (
                    STATUS_NOT_DEMONSTRATED,
                    f"Candidate evidence detected but rejected by hollow-evidence guard: {reasons}",
                    0,
                    []
                )
            return (
                STATUS_NOT_DEMONSTRATED,
                "Comprehensive repository scan completed; no matching implementation signals found.",
                0,
                []
            )

        # Block evidence in files unchanged from upstream from upgrading skill beyond Unclear
        valid_evidence = [
            e for e in evidence_list
            if e.get("upstream_status") != "unchanged from upstream"
            and not e.get("is_identical_to_upstream")
            and e.get("rejection_reason") != "identical to upstream file"
        ]
        if evidence_list and not valid_evidence:
            return (
                STATUS_UNCLEAR,
                "identical to upstream file",
                0,
                []
            )

        # Analyze surviving signal types from valid candidate evidence
        active_evidence = valid_evidence if valid_evidence else evidence_list
        detector_names = set(e.get("detector_name") for e in active_evidence)
        signal_types = sorted(list(set(e.get("signal_type") for e in active_evidence)))
        signal_count = len(signal_types)

        # If only generic detector found evidence, it is strictly capped at basic
        if detector_names == {"generic_detector"}:
            return (
                STATUS_BASIC,
                f"Basic demonstration found via generic language syntax ({len(evidence_list)} occurrence(s)). Capped at basic.",
                1,
                signal_types
            )

        # Check reachability quality
        reachabilities = set(e.get("reachability_status", "reachable") for e in evidence_list)
        if reachabilities == {"unclear"}:
            return (
                STATUS_UNCLEAR,
                "Evidence found in unverified ecosystem or call graph reachability could not be confirmed.",
                signal_count,
                signal_types
            )

        # If two or more independent surviving signal types exist -> Strong
        if signal_count >= 2:
            return (
                STATUS_STRONG,
                f"Strong multi-faceted evidence: verified across {signal_count} independent signal types ({', '.join(signal_types)}).",
                signal_count,
                signal_types
            )

        # One surviving signal type -> Basic
        if signal_count == 1:
            return (
                STATUS_BASIC,
                f"Demonstrated basic implementation via verified {signal_types[0]} signal.",
                signal_count,
                signal_types
            )

        return (
            STATUS_NOT_DEMONSTRATED,
            "Completed repository search with no surviving signals.",
            0,
            []
        )

assessment_engine = AssessmentEngine()
