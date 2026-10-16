import pytest
from backend.services.assessment_engine import (
    assessment_engine, STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR
)

def test_assessment_two_signals_strong():
    req = {"assessable": "code_assessable", "label": "FastAPI"}
    evidence = [
        {"detector_name": "api_detector", "signal_type": "api_handler", "reachability_status": "reachable"},
        {"detector_name": "api_detector", "signal_type": "api_schema", "reachability_status": "reachable"}
    ]
    status, reason, count, signals = assessment_engine.compute_status(req, evidence, [])
    assert status == STATUS_STRONG
    assert count == 2
    assert "Strong" in reason

def test_assessment_one_signal_basic():
    req = {"assessable": "code_assessable", "label": "FastAPI"}
    evidence = [
        {"detector_name": "api_detector", "signal_type": "api_handler", "reachability_status": "reachable"}
    ]
    status, reason, count, signals = assessment_engine.compute_status(req, evidence, [])
    assert status == STATUS_BASIC
    assert count == 1

def test_assessment_generic_detector_capped_at_basic():
    req = {"assessable": "code_assessable", "label": "Python"}
    evidence = [
        {"detector_name": "generic_detector", "signal_type": "language_syntax", "reachability_status": "reachable"},
        {"detector_name": "generic_detector", "signal_type": "language_syntax", "reachability_status": "reachable"}
    ]
    status, reason, count, signals = assessment_engine.compute_status(req, evidence, [])
    assert status == STATUS_BASIC
    assert "Capped at basic" in reason

def test_assessment_no_evidence_not_demonstrated():
    req = {"assessable": "code_assessable", "label": "Docker"}
    status, reason, count, signals = assessment_engine.compute_status(req, [], [])
    assert status == STATUS_NOT_DEMONSTRATED

def test_assessment_llm_conflict_produces_unclear():
    req = {"assessable": "code_assessable", "label": "SQL"}
    evidence = [
        {"detector_name": "sql_detector", "signal_type": "sql_query", "reachability_status": "reachable"}
    ]
    status, reason, count, signals = assessment_engine.compute_status(
        req, evidence, [], llm_rejected=True
    )
    assert status == STATUS_UNCLEAR
    assert "Conflict" in reason

def test_assessment_missing_detector_unclear():
    req = {"assessable": "code_assessable", "label": "SomeObscureFramework"}
    status, reason, count, signals = assessment_engine.compute_status(
        req, [], [], detector_available=False
    )
    assert status == STATUS_UNCLEAR
    assert "No deterministic code detector" in reason

def test_assessment_non_code_assessable_unclear():
    req = {"assessable": "not_assessable_from_repo", "label": "Communication"}
    status, reason, count, signals = assessment_engine.compute_status(req, [], [])
    assert status == STATUS_UNCLEAR
    assert "not assessable" in reason
