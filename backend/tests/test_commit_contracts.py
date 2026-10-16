import pytest
from backend.services.contracts_service import contracts_service
from backend.services.assessment_engine import (
    STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED
)

def test_contract_generation():
    req = {
        "id": "req_fastapi",
        "label": "FastAPI",
        "canonical_id": "api_fastapi",
        "category": "API Development"
    }
    all_reqs = [
        {"id": "req_fastapi", "label": "FastAPI", "user_status": "active"},
        {"id": "req_sql", "label": "SQL & Relational Databases", "user_status": "active"}
    ]

    contract = contracts_service.generate_contract(
        requirement=req,
        current_status=STATUS_NOT_DEMONSTRATED,
        base_commit_sha="commit_base_001",
        all_requirements=all_reqs
    )

    assert contract["requirement_id"] == "req_fastapi"
    assert contract["current_state"] == STATUS_NOT_DEMONSTRATED
    assert contract["predicted_target_state"] == STATUS_BASIC
    assert len(contract["acceptance_checks"]) >= 2
    assert "SQL & Relational Databases" in contract["requirements_must_not_change"]
    assert contract["verdict"] == "Pending"

def test_contract_evaluation_fulfilled():
    contract = {
        "requirement_id": "req_fastapi",
        "current_state": STATUS_NOT_DEMONSTRATED,
        "predicted_target_state": STATUS_BASIC,
        "requirements_must_not_change": []
    }

    # Case 1: Fulfilled
    verdict, reason = contracts_service.evaluate_contract(
        contract=contract,
        new_assessment_map={"req_fastapi": STATUS_BASIC},
        new_commit_sha="commit_head_002"
    )
    assert verdict == "Fulfilled"

    # Case 2: Partly fulfilled (when target was Strong but achieved Basic)
    contract["predicted_target_state"] = STATUS_STRONG
    verdict, reason = contracts_service.evaluate_contract(
        contract=contract,
        new_assessment_map={"req_fastapi": STATUS_BASIC},
        new_commit_sha="commit_head_003"
    )
    assert verdict == "Partly fulfilled"

    # Case 3: Not fulfilled
    verdict, reason = contracts_service.evaluate_contract(
        contract=contract,
        new_assessment_map={"req_fastapi": STATUS_NOT_DEMONSTRATED},
        new_commit_sha="commit_head_004"
    )
    assert verdict == "Not fulfilled"
