import asyncio
import json
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    resp = await async_client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["run_mode"] == "deterministic"
    assert "healthy" in data["database_status"]

@pytest.mark.asyncio
async def test_create_job_and_update_requirement(async_client: AsyncClient):
    # Create job
    job_resp = await async_client.post(
        "/api/jobs",
        json={
            "description": "We need a Senior Backend Developer proficient in FastAPI and writing automated tests using pytest. Familiar with Docker is nice to have.",
            "title": "Senior Backend Developer",
            "company": "Tech Innovations"
        }
    )
    assert job_resp.status_code == 200
    job_data = job_resp.json()
    assert job_data["title"] == "Senior Backend Developer"
    assert len(job_data["requirements"]) >= 2

    req = job_data["requirements"][0]
    req_id = req["id"]

    # Patch requirement
    patch_resp = await async_client.patch(
        f"/api/requirements/{req_id}",
        json={"notes": "Priority requirement for Q4 onboarding", "importance": "required"}
    )
    assert patch_resp.status_code == 200
    patch_data = patch_resp.json()
    assert patch_data["notes"] == "Priority requirement for Q4 onboarding"
    assert patch_data["importance"] == "required"

@pytest.mark.asyncio
async def test_repo_connect_and_dry_run(async_client: AsyncClient):
    # 1. Connect repo
    repo_resp = await async_client.post(
        "/api/repos",
        json={"repo_url": "https://github.com/example/demo-api"}
    )
    assert repo_resp.status_code == 200
    repo_data = repo_resp.json()
    repo_id = repo_data["id"]

    # 2. Create job
    job_resp = await async_client.post(
        "/api/jobs",
        json={
            "description": "Build high-performance REST APIs with FastAPI and relational database integration using SQLAlchemy.",
            "title": "Backend Architect"
        }
    )
    job_id = job_resp.json()["id"]

    # 3. Perform Dry Run simulation with simulated files
    simulated_files = {
        "main.py": """
from fastapi import FastAPI, APIRouter
from pydantic import BaseModel

app = FastAPI()
router = APIRouter()

class Item(BaseModel):
    name: str

@router.get("/items")
def read_items():
    return [{"id": 1}]

app.include_router(router)
""",
        "db.py": """
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base
Base = declarative_base()

class ItemModel(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
"""
    }

    dry_resp = await async_client.post(
        "/api/dry-run",
        json={
            "repo_id": repo_id,
            "job_id": job_id,
            "simulated_files": simulated_files
        }
    )
    assert dry_resp.status_code == 200
    dry_data = dry_resp.json()
    assert dry_data["hypothetical_coverage"] > 0.0
    assert len(dry_data["hypothetical_assessments"]) >= 1

@pytest.mark.asyncio
async def test_sse_endpoint_connects():
    from backend.api.routes import event_stream
    response = await event_stream()
    assert response.media_type == "text/event-stream"
    gen = response.body_iterator
    first_chunk = await gen.__anext__()
    assert "connected" in first_chunk or "ProofStack" in first_chunk

@pytest.mark.asyncio
async def test_poll_repository(async_client: AsyncClient):
    repo_resp = await async_client.post(
        "/api/repos",
        json={"repo_url": "https://github.com/example/poll-demo"}
    )
    assert repo_resp.status_code == 200
    repo_id = repo_resp.json()["id"]

    poll_resp = await async_client.post(f"/api/repos/{repo_id}/poll")
    assert poll_resp.status_code == 200
    poll_data = poll_resp.json()
    assert "changed" in poll_data

