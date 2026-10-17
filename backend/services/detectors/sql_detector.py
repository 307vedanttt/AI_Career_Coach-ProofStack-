import re
from typing import Dict, List, Any, Tuple
from backend.services.detectors.base import BaseDetector

class SQLDetector(BaseDetector):
    name = "sql_detector"
    version = "1.0.0"

    def detect(
        self,
        files: Dict[str, str],
        requirement: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        valid_candidates = []
        rejected_candidates = []

        orm_pattern = re.compile(r"class\s+[A-Za-z0-9_]+\s*\(\s*(?:Base|Model|declarative_base\(\))\s*\):", re.IGNORECASE)
        column_pattern = re.compile(r"\bColumn\s*\(\s*(?:Integer|String|Text|DateTime|Float|Boolean|ForeignKey)", re.IGNORECASE)
        sql_keywords = re.compile(r"\b(SELECT\s+[\s\S]+?\s+FROM|INSERT\s+INTO|UPDATE\s+[\w_]+\s+SET|DELETE\s+FROM|CREATE\s+TABLE)\b", re.IGNORECASE)
        migration_pattern = re.compile(r"def\s+(?:upgrade|downgrade)\s*\(\s*\):|op\.create_table\(", re.IGNORECASE)
        session_query_pattern = re.compile(r"\b(?:session|db)\.(?:execute|query|add|commit|scalars?)\s*\(", re.IGNORECASE)

        prisma_pattern = re.compile(r"\b(?:prisma|db)\.[a-zA-Z0-9_]+\.(?:create|findMany|findUnique|findFirst|update|delete|upsert|executeRaw)\s*\(", re.IGNORECASE)

        for path, content in files.items():
            lines = content.splitlines()

            # Migrations check
            if "migration" in path.lower() or "alembic" in path.lower() or "prisma" in path.lower() or path.endswith((".sql", ".prisma")):
                for idx, line in enumerate(lines):
                    if migration_pattern.search(line) or "CREATE TABLE" in line.upper() or "model " in line:
                        snippet = "\n".join(lines[idx: min(len(lines), idx + 6)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "db_migration",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 6),
                            "code_snippet": snippet,
                            "explanation": f"Database schema migration, DDL, or Prisma model detected at line {idx + 1}."
                        })
                        break # One migration signal per file is sufficient

            # Python ORM and query checks
            if path.endswith(".py"):
                for idx, line in enumerate(lines):
                    if orm_pattern.search(line):
                        snippet = "\n".join(lines[idx: min(len(lines), idx + 8)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "orm_model",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 8),
                            "code_snippet": snippet,
                            "explanation": f"Relational ORM model declared at line {idx + 1}."
                        })

                    elif session_query_pattern.search(line):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 4)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "orm_operation",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 4),
                            "code_snippet": snippet,
                            "explanation": f"ORM database query execution detected at line {idx + 1}."
                        })

                    elif sql_keywords.search(line):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 4)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "sql_query",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 4),
                            "code_snippet": snippet,
                            "explanation": f"Raw SQL statement found at line {idx + 1}."
                        })

            # JS / TS ORM and query checks
            elif path.endswith((".js", ".ts", ".jsx", ".tsx")):
                for idx, line in enumerate(lines):
                    if prisma_pattern.search(line):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 5)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "orm_operation",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 5),
                            "code_snippet": snippet,
                            "explanation": f"Prisma ORM database operation detected at line {idx + 1}."
                        })
                    elif sql_keywords.search(line) and not path.endswith(".json"):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 4)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "sql_query",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 4),
                            "code_snippet": snippet,
                            "explanation": f"SQL query statement found at line {idx + 1}."
                        })

        return valid_candidates, rejected_candidates
