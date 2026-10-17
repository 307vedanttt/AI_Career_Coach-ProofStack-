import pytest
import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import AsyncSessionLocal
from backend.services.ats_service import ats_service
from backend.services.code_quality_test_service import code_quality_test_service

@pytest.mark.asyncio
async def test_deep_resume_forensic_analysis():
    async with AsyncSessionLocal() as db:
        resume_text = (
            "Vedant Patake - Backend Systems Engineer\n"
            "vedant@proofstack.dev | github.com/307vedanttt | Pune, India\n"
            "Summary: Backend engineer building high-throughput APIs with verifiable code evidence.\n"
            "Experience:\n"
            "• Architected scalable REST API route handlers using FastAPI and Python with sub-40ms latency.\n"
            "• Engineered automated Pytest test suites achieving 92% coverage on critical authentication routes.\n"
            "• Worked on database queries and system performance optimization.\n"
            "Education: B.E. in Computer Science, NMIET (2025)\n"
            "Skills: Python, TypeScript, FastAPI, React, SQL, PostgreSQL, Docker, Git"
        )
        layout = ats_service.extract_document_layout(resume_text.encode(), "test_resume.pdf")
        forensic = await ats_service.run_deep_forensic_analysis(
            extracted_text=resume_text,
            layout=layout,
            user_id="usr-lead-engineer",
            db=db
        )

        assert "google_xyz_audit" in forensic
        xyz = forensic["google_xyz_audit"]
        assert xyz["score"] > 0
        assert xyz["metric_density_pct"] > 0
        assert xyz["power_verb_pct"] > 0
        assert len(xyz["bullets"]) >= 2

        assert "section_health" in forensic
        sections = forensic["section_health"]
        assert sections["contact"]["score"] >= 50
        assert sections["overall_score"] > 0

        assert "claim_vs_reality_matrix" in forensic
        matrix = forensic["claim_vs_reality_matrix"]
        assert matrix["proof_integrity_index"] > 0
        assert len(matrix["verified_claims"]) > 0

        assert "code_anchored_rewrites" in forensic
        assert len(forensic["code_anchored_rewrites"]) >= 2

@pytest.mark.asyncio
async def test_repo_code_quality_skill_tests_generation_and_evaluation():
    async with AsyncSessionLocal() as db:
        session = await code_quality_test_service.generate_tests_for_user("usr-lead-engineer", db)
        assert session["total_questions"] >= 4
        assert len(session["questions"]) >= 4

        first_q = session["questions"][0]
        assert first_q["category"] is not None
        assert first_q["file_path"] is not None
        assert len(first_q["options"]) == 4

        # Test perfect submission
        submission_answers = {
            "cq-test-sec-01": 0,
            "cq-test-inv-02": 1,
            "cq-test-async-03": 1,
            "cq-test-err-04": 0
        }
        result = code_quality_test_service.evaluate_test_submission(
            test_session_id=session["test_session_id"],
            answers=submission_answers,
            user_id="usr-lead-engineer"
        )

        assert result["score_percent"] == 100
        assert result["correct_count"] == 4
        assert result["passed"] is True
        assert result["mastery_label"] == "CODE ARCHITECT (LEVEL 3)"
        assert len(result["cryptographic_proof_hash"]) == 64
