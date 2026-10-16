"""
ProofStack Demo Seeder Script
Seeds candidate, job, requirements, commit contracts, and Merkle snapshots.
Executes in < 2 seconds.
"""
import sys
import os
import time
import uuid
import datetime
import sqlite3

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def seed_demo():
    start_time = time.time()
    db_path = os.path.join(os.path.dirname(__file__), "..", "proofstack.db")
    db_path = os.path.abspath(db_path)

    print(f"[*] Seeding demo state into {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Enable WAL mode and foreign keys
    cursor.execute("PRAGMA journal_mode = WAL;")
    cursor.execute("PRAGMA foreign_keys = ON;")

    user_id = "usr-demo"
    repo_id = "repo-demo"
    job_id = "job-demo"
    contract_id = "contract-auth"
    now_ts = utcnow()

    # 1. User
    cursor.execute(
        "INSERT OR REPLACE INTO users (id, username, created_at) VALUES (?, ?, ?);",
        (user_id, "rohan", now_ts)
    )

    # 2. Repository
    cursor.execute(
        """
        INSERT OR REPLACE INTO repositories 
        (id, user_id, repo_url, owner, name, default_branch, last_commit_sha, webhook_secret, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (repo_id, user_id, "https://github.com/rohan/shop-api", "rohan", "shop-api", "main", "9f3c2ab", "whsec_proofstack_secret_2026", now_ts, now_ts)
    )

    # 3. Job Posting
    cursor.execute(
        """
        INSERT OR REPLACE INTO jobs
        (id, user_id, title, company, source_type, text_hash, raw_text_summary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            job_id,
            user_id,
            "Senior Backend Engineer — Northwind Labs",
            "Northwind Labs",
            "pasted",
            "hash_northwind_001",
            "Senior Backend Engineer requiring SQL persistence, REST APIs, and Zero-trust authentication.",
            now_ts
        )
    )

    # 4. Requirements with exact quotes
    requirements_data = [
        ("req-sql", job_id, "req-sql", "SQL Persistence", "hard_skill", "required", "Production persistence with SQL (SQLite / PostgreSQL schema migrations)", "code_assessable", "sql_detector"),
        ("req-rest", job_id, "req-rest", "REST API Architecture", "hard_skill", "required", "High-throughput REST API with FastAPI or Go", "code_assessable", "api_detector"),
        ("req-auth", job_id, "req-auth", "Zero-Trust Authentication", "hard_skill", "required", "Zero-trust authentication & HMAC signature verification", "code_assessable", "generic_detector"),
        ("req-ci", job_id, "req-ci", "Automated CI/CD Invariants", "hard_skill", "required", "Continuous integration with automated invariant unit & integration tests", "code_assessable", "generic_detector"),
        ("req-docker", job_id, "req-docker", "Docker Infrastructure", "hard_skill", "preferred", "Containerized deployment infrastructure with Docker", "code_assessable", "generic_detector"),
    ]

    for req in requirements_data:
        cursor.execute(
            """
            INSERT OR REPLACE INTO requirements
            (id, job_id, canonical_id, label, category, importance, exact_quote, assessable, detector_name, user_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?);
            """,
            (*req, now_ts)
        )

    # 4b. Baseline Assessments
    assessments_data = [
        (str(uuid.uuid4()), job_id, repo_id, "req-sql", "Demonstrated (strong)", 2, "2 database invariant tests and models verified", "9f3c2ab"),
        (str(uuid.uuid4()), job_id, repo_id, "req-rest", "Demonstrated (strong)", 2, "FastAPI route handlers and schemas verified", "9f3c2ab"),
        (str(uuid.uuid4()), job_id, repo_id, "req-auth", "Not demonstrated in this scope", 0, "No HMAC signature validation found in baseline commit", "9f3c2ab"),
        (str(uuid.uuid4()), job_id, repo_id, "req-ci", "Demonstrated (strong)", 2, "Automated test suite passing in CI workflow", "9f3c2ab"),
        (str(uuid.uuid4()), job_id, repo_id, "req-docker", "Demonstrated (basic)", 1, "Dockerfile exists with unpinned base", "9f3c2ab"),
    ]

    for a in assessments_data:
        cursor.execute(
            """
            INSERT OR REPLACE INTO assessments
            (id, job_id, repo_id, requirement_id, status, signal_count, reason, commit_sha, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (*a, now_ts)
        )

    # 5. Snapshots (Merkle Chain)
    snap1_id = str(uuid.uuid4())
    snap1_hash = "1a82bc40dd53d36bcdea0f3b7d423a2327ee8e4752356db54e872daf8d9a0041"
    snap2_id = str(uuid.uuid4())
    snap2_hash = "39fa0140dd53d36bcdea0f3b7d423a2327ee8e4752356db54e872daf8d9a88ab"
    snap3_id = str(uuid.uuid4())
    snap3_hash = "d260ab40dd53d36bcdea0f3b7d423a2327ee8e4752356db54e872daf8d9a0f1b"

    cursor.executemany(
        """
        INSERT OR REPLACE INTO snapshots
        (id, repo_id, job_id, commit_sha, previous_commit_sha, hash_chain, coverage_numerator, coverage_denominator, coverage_score, summary_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        [
            (snap1_id, repo_id, job_id, "7a12b9c", "0" * 40, snap1_hash, 2.0, 4.5, 25.0, '{"commit": "7a12b9c", "coverage": 25.0}', "2025-05-14T09:12:00Z"),
            (snap2_id, repo_id, job_id, "8e41c0d", snap1_hash, snap2_hash, 4.0, 4.5, 45.0, '{"commit": "8e41c0d", "coverage": 45.0}', "2025-05-16T14:30:00Z"),
            (snap3_id, repo_id, job_id, "9f3c2ab", snap2_hash, snap3_hash, 2.6, 4.5, 58.0, '{"commit": "9f3c2ab", "coverage": 58.0}', "2025-05-18T10:42:01Z"),
        ]
    )

    # 6. Commit Contract
    cursor.execute(
        """
        INSERT OR REPLACE INTO commit_contracts
        (id, repo_id, job_id, requirement_id, current_state, predicted_target_state, acceptance_checks, base_commit_sha, effort_class, verdict, reason, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            contract_id,
            repo_id,
            job_id,
            "req-auth",
            "Not demonstrated in this scope",
            "Demonstrated (strong)",
            '["Zero-trust HMAC-SHA256 signature verification in src/auth/token.go", "Invariant unit tests in tests/test_token.go"]',
            "9f3c2ab",
            "small",
            "Pending",
            "Contract active. Awaiting commit with zero-trust HMAC signature validation.",
            now_ts,
            now_ts
        )
    )

    conn.commit()
    conn.close()

    elapsed = round(time.time() - start_time, 3)
    print(f"[+] ProofStack demo state seeded successfully in {elapsed}s.")

if __name__ == "__main__":
    seed_demo()
