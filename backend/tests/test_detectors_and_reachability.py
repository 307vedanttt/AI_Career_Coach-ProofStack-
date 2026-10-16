import pytest
from backend.services.detectors.api_detector import APIDetector
from backend.services.detectors.sql_detector import SQLDetector
from backend.services.detectors.testing_detector import TestingDetector
from backend.services.detectors.cicd_detector import CICDDetector
from backend.services.evidence_guard import ReachabilityAnalyzer

def test_api_detector():
    detector = APIDetector()
    files = {
        "app/routes.py": """
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class UserPayload(BaseModel):
    name: str

@router.post("/users")
async def create_user(payload: UserPayload):
    return {"status": "ok"}
""",
        "tests/test_routes.py": """
import pytest

def test_create_user(client):
    res = client.post("/users", json={"name": "Alice"})
    assert res.status_code == 200
"""
    }

    req = {"canonical_id": "api_fastapi", "label": "FastAPI"}
    valid, rejected = detector.detect(files, req)

    signal_types = [v["signal_type"] for v in valid]
    assert "api_handler" in signal_types
    assert "api_schema" in signal_types
    assert "api_endpoint_test" in signal_types

def test_sql_detector():
    detector = SQLDetector()
    files = {
        "models/user.py": """
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50))
""",
        "services/user_service.py": """
def get_user(session, user_id):
    return session.execute("SELECT * FROM users WHERE id = :id", {"id": user_id})
"""
    }

    req = {"canonical_id": "db_sql", "label": "SQL & Relational Databases"}
    valid, rejected = detector.detect(files, req)
    signal_types = [v["signal_type"] for v in valid]
    assert "orm_model" in signal_types
    assert "sql_query" in signal_types or "orm_operation" in signal_types

def test_python_ast_reachability():
    analyzer = ReachabilityAnalyzer()
    files = {
        "main.py": """
from app.api import router
from fastapi import FastAPI
app = FastAPI()
app.include_router(router)
""",
        "app/api.py": """
from fastapi import APIRouter
from app.db import get_data
router = APIRouter()

@router.get("/items")
def items():
    return get_data()
""",
        "app/db.py": """
def get_data():
    return [1, 2, 3]
""",
        "isolated_unreachable.py": """
def never_called():
    return "abandoned"
"""
    }

    reachable = analyzer.analyze_python_reachability(files)
    assert "main.py" in reachable
    assert "app/api.py" in reachable
    assert "app/db.py" in reachable
    assert "isolated_unreachable.py" not in reachable
