import pytest
from backend.services.evidence_guard import evidence_guard

def test_evidence_guard_rejections():
    files = {
        "README.md": "# Skills: Python, FastAPI, Docker, SQL, PostgreSQL",
        "node_modules/express/index.js": "function express() {}",
        "empty_module.py": "# Just comments\n# Nothing real\n",
        "tests/test_fake.py": "def test_fake():\n    assert True\n",
        "isolated.py": "def secret_sql():\n    return 'SELECT * FROM users'\n"
    }

    raw_candidates = [
        {
            "detector_name": "generic_detector",
            "signal_type": "readme_keyword",
            "file_path": "README.md",
            "code_snippet": "Python, FastAPI, Docker"
        },
        {
            "detector_name": "api_detector",
            "signal_type": "api_handler",
            "file_path": "node_modules/express/index.js",
            "code_snippet": "function express() {}"
        },
        {
            "detector_name": "generic_detector",
            "signal_type": "language_syntax",
            "file_path": "empty_module.py",
            "code_snippet": "# Just comments"
        },
        {
            "detector_name": "testing_detector",
            "signal_type": "test_assertion",
            "file_path": "tests/test_fake.py",
            "code_snippet": "assert True"
        },
        {
            "detector_name": "sql_detector",
            "signal_type": "sql_query",
            "file_path": "isolated.py",
            "code_snippet": "SELECT * FROM users"
        }
    ]

    surviving, rejected = evidence_guard.filter_candidates(raw_candidates, files, "commit123456")

    assert len(surviving) == 0 # All hollow candidates should be rejected!
    assert len(rejected) == 5

    reasons = [r["rejection_reason"] for r in rejected]
    assert any("Documentation or README" in r for r in reasons)
    assert any("Vendored" in r for r in reasons)
    assert any("Empty file" in r for r in reasons)
    assert any("Trivial assertion" in r for r in reasons)
    assert any("unreachable" in r.lower() for r in reasons)
