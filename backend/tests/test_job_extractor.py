import pytest
from backend.services.job_extractor import job_extractor

SAMPLE_JOB_TEXT = """
We are looking for a Senior Backend Engineer to join our team.
Candidates must have experience with FastAPI and building RESTful APIs.
You will write clean SQL queries and manage relational database schemas using PostgreSQL.
Experience with pytest and automated testing is required.
Nice to have: Docker containerization and CI/CD pipelines.
Strong communication skills and team leadership are essential.
"""

@pytest.mark.asyncio
async def test_job_extraction_pasted_text():
    result = await job_extractor.process_job_input(
        description=SAMPLE_JOB_TEXT,
        title="Senior Backend Engineer",
        company="Acme Corp"
    )

    assert result["title"] == "Senior Backend Engineer"
    assert result["company"] == "Acme Corp"
    assert result["source_type"] == "pasted"
    assert len(result["text_hash"]) == 64

    reqs = result["requirements"]
    assert len(reqs) >= 4

    canonical_ids = [r["canonical_id"] for r in reqs]
    assert "api_fastapi" in canonical_ids
    assert "db_postgres" in canonical_ids or "db_sql" in canonical_ids
    assert "test_pytest" in canonical_ids

    # Verbatim quote check
    for r in reqs:
        assert r["exact_quote"] in SAMPLE_JOB_TEXT
        assert len(r["exact_quote"]) > 5

    # Check importance classification
    docker_req = next((r for r in reqs if "docker" in r["canonical_id"]), None)
    if docker_req:
        assert docker_req["importance"] == "preferred"

    fastapi_req = next((r for r in reqs if r["canonical_id"] == "api_fastapi"), None)
    assert fastapi_req is not None
    assert fastapi_req["importance"] == "required"

@pytest.mark.asyncio
async def test_job_extraction_empty_fails():
    with pytest.raises(ValueError):
        await job_extractor.process_job_input(description="")
