import json
import uuid
from typing import Dict, List, Any, Optional, Tuple
from backend.services.assessment_engine import (
    STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR
)

class CommitContractsService:
    """
    Manages actionable Commit Contracts:
    - Formulates what the next commit should accomplish to upgrade a requirement
    - Evaluates new snapshots against the contract predictions
    - Adjudicates verdicts: Fulfilled, Partly fulfilled, Not fulfilled
    """

    def generate_contract(
        self,
        requirement: Dict[str, Any],
        current_status: str,
        base_commit_sha: str,
        all_requirements: List[Dict[str, Any]],
        target_state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a new Commit Contract proposal for the user.
        """
        req_id = requirement["id"]
        label = requirement["label"]
        canonical_id = requirement.get("canonical_id", "")
        category = requirement.get("category", "")

        # Default progression: Not demonstrated -> Demonstrated (basic) -> Demonstrated (strong)
        if not target_state:
            if current_status == STATUS_NOT_DEMONSTRATED:
                target_state = STATUS_BASIC
            elif current_status == STATUS_BASIC:
                target_state = STATUS_STRONG
            else:
                target_state = STATUS_STRONG

        # Generate targeted acceptance checks
        checks = []
        effort = "small"
        if "api" in canonical_id or "fastapi" in canonical_id or "flask" in canonical_id:
            if target_state == STATUS_BASIC:
                checks = [
                    f"Implement an active route handler endpoint for {label}.",
                    "Ensure the endpoint parses input and returns a structured response.",
                    "Verify file is reachable from the application main entrypoint."
                ]
            else:
                checks = [
                    f"Add request and response validation schema models for {label}.",
                    "Implement comprehensive automated tests asserting response codes and body structure.",
                    "Verify multi-file breadth across controllers and models."
                ]
                effort = "medium"

        elif "sql" in canonical_id or "db" in canonical_id:
            if target_state == STATUS_BASIC:
                checks = [
                    "Declare a relational ORM model or migration schema.",
                    "Ensure queries execute in reachable business logic."
                ]
            else:
                checks = [
                    "Add automated database tests verifying CRUD transactions.",
                    "Ensure migration rollback scripts and foreign key constraints are defined."
                ]
                effort = "medium"

        elif "test" in canonical_id or "pytest" in canonical_id:
            checks = [
                "Add automated test cases with non-trivial assertions on project functions.",
                "Ensure tests do not use hollow constants like 'assert True'.",
                "Configure test discovery in pytest.ini or package configuration."
            ]

        elif "devops" in canonical_id or "docker" in canonical_id or "ci" in canonical_id:
            checks = [
                "Provide a functional Dockerfile or GitHub Actions CI workflow.",
                "Ensure build stages and test execution commands are declared."
            ]

        else:
            checks = [
                f"Implement verifiable code modules demonstrating {label}.",
                "Avoid comments-only or README keyword lists."
            ]

        # Requirements that must not regress
        must_not_change = [
            r["label"] for r in all_requirements
            if r["id"] != req_id and r.get("user_status", "active") == "active"
        ]

        return {
            "id": str(uuid.uuid4()),
            "requirement_id": req_id,
            "current_state": current_status,
            "predicted_target_state": target_state,
            "acceptance_checks": checks,
            "base_commit_sha": base_commit_sha,
            "requirements_expected_to_change": [label],
            "requirements_must_not_change": must_not_change,
            "effort_class": effort,
            "verdict": "Pending",
            "reason": None,
            "evaluated_commit_sha": None
        }

    def evaluate_contract(
        self,
        contract: Dict[str, Any],
        new_assessment_map: Dict[str, str], # requirement_id -> new_status
        new_commit_sha: str
    ) -> Tuple[str, str]:
        """
        Adjudicates a Commit Contract against new assessment results.
        Returns (verdict, reason).
        Verdicts: "Fulfilled", "Partly fulfilled", "Not fulfilled".
        """
        req_id = contract["requirement_id"]
        target_state = contract["predicted_target_state"]
        current_state = contract["current_state"]

        new_status = new_assessment_map.get(req_id, STATUS_NOT_DEMONSTRATED)

        # Check negative predictions / regressions in others
        must_not_change_labels = contract.get("requirements_must_not_change", [])

        # Check target requirement outcome
        if new_status == target_state:
            return "Fulfilled", f"Contract successfully fulfilled! Requirement achieved predicted target '{target_state}' at commit {new_commit_sha[:7]}."

        # Check partial progression
        rank = {STATUS_NOT_DEMONSTRATED: 0, STATUS_UNCLEAR: 0, STATUS_BASIC: 1, STATUS_STRONG: 2}
        if rank.get(new_status, 0) > rank.get(current_state, 0):
            return "Partly fulfilled", f"Contract partly fulfilled: progressed from '{current_state}' to '{new_status}', though target was '{target_state}'."

        return "Not fulfilled", f"Contract not fulfilled: requirement remained '{new_status}' (target was '{target_state}')."

contracts_service = CommitContractsService()
