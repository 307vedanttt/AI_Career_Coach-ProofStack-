"""
ProofStack Demo Reset Script
Resets database, Merkle ledger, and cache back to pristine pre-demo state.
Runs in < 3 seconds.
"""
import sys
import os
import time
import sqlite3

def reset_demo():
    start_time = time.time()
    db_path = os.path.join(os.path.dirname(__file__), "..", "proofstack.db")
    db_path = os.path.abspath(db_path)

    print(f"[*] Resetting ProofStack state at {db_path}...")

    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        tables = [
            "assessments",
            "file_evidence",
            "file_evidences",
            "rejected_candidates",
            "repository_files",
            "commit_contracts",
            "snapshots",
            "requirements",
            "jobs",
            "repositories",
            "webhook_deliveries",
            "llm_cache",
            "trace_runs",
            "users",
        ]
        
        cursor.execute("PRAGMA foreign_keys = OFF;")
        for table in tables:
            try:
                cursor.execute(f"DELETE FROM {table};")
            except sqlite3.OperationalError:
                # Table might not exist yet
                pass
        
        cursor.execute("PRAGMA foreign_keys = ON;")
        conn.commit()
        conn.close()

    elapsed = round(time.time() - start_time, 3)
    print(f"[+] ProofStack demo state reset successfully in {elapsed}s.")

if __name__ == "__main__":
    reset_demo()
