import pytest
from backend.services.coverage_service import coverage_service
from backend.services.snapshot_service import snapshot_service
from backend.services.assessment_engine import (
    STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR
)

def test_coverage_calculation_and_sensitivity():
    requirements = [
        {"id": "r1", "importance": "required", "user_status": "active", "assessable": "code_assessable"},
        {"id": "r2", "importance": "required", "user_status": "active", "assessable": "code_assessable"},
        {"id": "r3", "importance": "preferred", "user_status": "active", "assessable": "code_assessable"},
        {"id": "r4", "importance": "required", "user_status": "active", "assessable": "code_assessable"},
        {"id": "r5", "importance": "required", "user_status": "active", "assessable": "not_assessable_from_repo"},
    ]

    assessments = [
        {"requirement_id": "r1", "status": STATUS_STRONG}, # 3 * 1.0 = 3.0
        {"requirement_id": "r2", "status": STATUS_BASIC},  # 3 * 0.5 = 1.5
        {"requirement_id": "r3", "status": STATUS_STRONG}, # 1 * 1.0 = 1.0
        {"requirement_id": "r4", "status": STATUS_UNCLEAR},# excluded from denominator!
        {"requirement_id": "r5", "status": STATUS_UNCLEAR},# excluded non-code assessable!
    ]

    # Expected:
    # Numerator = 3.0 + 1.5 + 1.0 = 5.5
    # Denominator = 3.0 (r1) + 3.0 (r2) + 1.0 (r3) = 7.0
    # Expected Coverage = (5.5 / 7.0) * 100 = 78.57% -> 78.6%
    cov = coverage_service.calculate_coverage(assessments, requirements)

    assert cov["numerator"] == 5.5
    assert cov["denominator"] == 7.0
    assert cov["evidence_coverage"] == 78.6
    assert cov["assessed_count"] == 3
    assert cov["unclear_count"] == 1
    assert cov["excluded_count"] == 1
    assert cov["label"] == "Evidence coverage"

    # Check sensitivity ranges
    assert "equal_weights_1_to_1" in cov["sensitivity_ranges"]
    assert "strict_required_5_to_1" in cov["sensitivity_ranges"]

def test_snapshot_hash_chain():
    prev_hash = None
    commit_sha = "abcdef123456"
    coverage = 78.6
    assessments = [
        {"requirement_id": "r1", "status": STATUS_STRONG},
        {"requirement_id": "r2", "status": STATUS_BASIC}
    ]

    hash1 = snapshot_service.compute_hash_chain(prev_hash, commit_sha, coverage, assessments)
    assert len(hash1) == 64

    # Chain next snapshot
    hash2 = snapshot_service.compute_hash_chain(hash1, "fedcba654321", 85.0, assessments)
    assert len(hash2) == 64
    assert hash1 != hash2

def test_regression_detection():
    old_assessments = [
        {"requirement_id": "r1", "status": STATUS_STRONG},
        {"requirement_id": "r2", "status": STATUS_BASIC}
    ]
    new_assessments = [
        {"requirement_id": "r1", "status": STATUS_BASIC}, # Regressed! Strong -> Basic
        {"requirement_id": "r2", "status": STATUS_NOT_DEMONSTRATED} # Regressed! Basic -> Not demonstrated
    ]

    regressions = snapshot_service.detect_regressions(old_assessments, new_assessments)
    assert len(regressions) == 2
    assert regressions[0]["requirement_id"] == "r1"
    assert "Regression detected" in regressions[0]["reason"]
