from typing import List, Dict, Any, Tuple
from backend.services.assessment_engine import (
    STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR
)

class CoverageService:
    """
    Computes Evidence Coverage and sensitivity bounds according to the ProofStack Master Blueprint.
    Never scores people or ranks individuals; purely assesses repository evidence coverage.
    """

    def calculate_coverage(
        self,
        assessments: List[Dict[str, Any]],
        requirements: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates:
        - Baseline Evidence Coverage (Required=3, Preferred=1)
        - Equal weights sensitivity (Required=1, Preferred=1)
        - Strict weights sensitivity (Required=5, Preferred=1)
        """
        req_map = {r["id"]: r for r in requirements}

        numerator = 0.0
        denominator = 0.0

        # Sensitivity metrics
        eq_num = 0.0
        eq_den = 0.0
        strict_num = 0.0
        strict_den = 0.0

        assessed_count = 0
        required_count = 0
        preferred_count = 0
        unclear_count = 0
        excluded_count = 0

        for a in assessments:
            req_id = a.get("requirement_id")
            req = req_map.get(req_id, {})
            user_status = req.get("user_status", "active")
            assessable = req.get("assessable", "code_assessable")
            importance = req.get("importance", "required").lower()
            status = a.get("status")

            # Exclude non-active or non-code-assessable requirements
            if user_status != "active" or assessable == "not_assessable_from_repo":
                excluded_count += 1
                continue

            # Exclude Unclear status from scoring denominator and report separately
            if status == STATUS_UNCLEAR:
                unclear_count += 1
                continue

            assessed_count += 1
            if importance == "preferred":
                preferred_count += 1
                base_w = 1.0
                eq_w = 1.0
                strict_w = 1.0
            else:
                required_count += 1
                base_w = 3.0
                eq_w = 1.0
                strict_w = 5.0

            credit = 0.0
            if status == STATUS_STRONG:
                credit = 1.0
            elif status == STATUS_BASIC:
                credit = 0.5
            elif status == STATUS_NOT_DEMONSTRATED:
                credit = 0.0

            numerator += base_w * credit
            denominator += base_w

            eq_num += eq_w * credit
            eq_den += eq_w

            strict_num += strict_w * credit
            strict_den += strict_w

        evidence_coverage_pct = round((numerator / denominator * 100.0), 1) if denominator > 0 else 0.0
        eq_coverage_pct = round((eq_num / eq_den * 100.0), 1) if eq_den > 0 else 0.0
        strict_coverage_pct = round((strict_num / strict_den * 100.0), 1) if strict_den > 0 else 0.0

        return {
            "evidence_coverage": evidence_coverage_pct,
            "numerator": round(numerator, 2),
            "denominator": round(denominator, 2),
            "assessed_count": assessed_count,
            "required_count": required_count,
            "preferred_count": preferred_count,
            "unclear_count": unclear_count,
            "excluded_count": excluded_count,
            "sensitivity_ranges": {
                "equal_weights_1_to_1": eq_coverage_pct,
                "strict_required_5_to_1": strict_coverage_pct,
                "baseline_3_to_1": evidence_coverage_pct
            },
            "label": "Evidence coverage"
        }

coverage_service = CoverageService()
