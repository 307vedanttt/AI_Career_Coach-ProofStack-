import ast
import json
import os
import re
import uuid
import datetime
from typing import Dict, List, Any, Optional, Tuple

import httpx

from backend.services.assessment_engine import (
    STATUS_STRONG, STATUS_BASIC, STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR
)

# =============================================================================
# ALLOW-LISTED DETECTOR RULE CATALOG
# Strictly allow-listed rule IDs from detector families.
# Contract generation and static evaluation NEVER invent or accept rules outside this catalog.
# =============================================================================
ALLOW_LISTED_RULES = {
    "sql.orm_model_declared": {
        "rule_id": "sql.orm_model_declared",
        "family": "sql",
        "label": "Declare Relational ORM Model",
        "description": "Declare a relational ORM model or migration schema with typed columns and primary key.",
        "detector": "sql_detector"
    },
    "sql.executed_query_reachable": {
        "rule_id": "sql.executed_query_reachable",
        "family": "sql",
        "label": "Reachable Query Execution",
        "description": "Execute database queries or repository calls within reachable application business logic.",
        "detector": "sql_detector"
    },
    "sql.test_asserts_result": {
        "rule_id": "sql.test_asserts_result",
        "family": "sql",
        "label": "Database Result Assertion",
        "description": "Implement automated tests asserting database operation query results or transaction states.",
        "detector": "sql_detector"
    },
    "api.route_endpoint_defined": {
        "rule_id": "api.route_endpoint_defined",
        "family": "api",
        "label": "Active Route Handler",
        "description": "Define an active HTTP route handler endpoint with request method, path, and handler parameters.",
        "detector": "api_detector"
    },
    "api.pydantic_schema_validated": {
        "rule_id": "api.pydantic_schema_validated",
        "family": "api",
        "label": "Request/Response Schema Validation",
        "description": "Attach a validated Pydantic BaseModel or DTO schema to route parameters and response models.",
        "detector": "api_detector"
    },
    "api.route_mounted": {
        "rule_id": "api.route_mounted",
        "family": "api",
        "label": "Router Mount in Application Entrypoint",
        "description": "Ensure the route/router is actively mounted via include_router or register_blueprint in the main app.",
        "detector": "api_detector"
    },
    "testing.test_function_present": {
        "rule_id": "testing.test_function_present",
        "family": "testing",
        "label": "Active Test Function Defined",
        "description": "Provide automated test functions (test_*, it(), describe()) without skip/xfail decorators.",
        "detector": "testing_detector"
    },
    "testing.non_trivial_assertion": {
        "rule_id": "testing.non_trivial_assertion",
        "family": "testing",
        "label": "Non-Trivial Dynamic Assertion",
        "description": "Assert dynamic function outputs or responses rather than constant expressions like 'assert True'.",
        "detector": "testing_detector"
    },
    "testing.imports_project_code": {
        "rule_id": "testing.imports_project_code",
        "family": "testing",
        "label": "Exercise Project Code Modules",
        "description": "Test imports and exercises project code modules rather than standalone standard library functions.",
        "detector": "testing_detector"
    },
    "cicd.workflow_steps_declared": {
        "rule_id": "cicd.workflow_steps_declared",
        "family": "cicd",
        "label": "CI Workflow Steps Configured",
        "description": "Configure CI workflow steps executing automated linting, test suites, or build pipelines.",
        "detector": "cicd_detector"
    },
    "cicd.dockerfile_non_empty": {
        "rule_id": "cicd.dockerfile_non_empty",
        "family": "cicd",
        "label": "Container Build Specifications",
        "description": "Provide a complete Dockerfile specifying environment setup, dependency copy, and entrypoint.",
        "detector": "cicd_detector"
    }
}

EFFORT_WEIGHTS = {
    "small": 1.0,
    "medium": 2.0,
    "large": 3.5
}


class CommitContractsService:
    """
    Manages targeted Commit Contracts & Challenges:
    - Generates actionable challenges for missing skills strictly from allow-listed rule catalog.
    - Zero server-side code execution: evaluates AST and static structure only.
    - Read-only GitHub Checks API integration for CI status.
    - Deterministic adjudication: Fulfilled, Partly, Not fulfilled.
    - Dry-run parity with real runs.
    """

    def generate_contract(
        self,
        requirement: Dict[str, Any],
        current_status: str,
        base_commit_sha: str,
        all_requirements: List[Dict[str, Any]],
        target_state: Optional[str] = None,
        repo_files: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Creates a new Targeted Commit Contract proposal for the user.
        Uses ONLY allow-listed rule IDs and declared heuristics.
        """
        req_id = requirement["id"]
        label = requirement["label"]
        canonical_id = (requirement.get("canonical_id") or "").lower()
        category = (requirement.get("category") or "").lower()

        # Target progression
        if not target_state:
            if current_status == STATUS_NOT_DEMONSTRATED:
                target_state = STATUS_BASIC
            elif current_status == STATUS_BASIC:
                target_state = STATUS_STRONG
            else:
                target_state = STATUS_STRONG

        # Detect repo language heuristic (Python by default)
        is_js_ts = False
        if repo_files:
            for p in repo_files.keys():
                if p.endswith((".ts", ".tsx", ".js", ".jsx")) or p == "package.json":
                    is_js_ts = True
                    break

        # Map to allow-listed rule IDs
        rule_ids: List[str] = []
        effort = "small"
        suggested_path = ""
        task_desc = ""
        skeleton = ""

        if any(term in canonical_id or term in category for term in ("sql", "db", "database", "orm", "postgres", "mysql")):
            if target_state == STATUS_BASIC:
                rule_ids = ["sql.orm_model_declared", "sql.executed_query_reachable"]
                effort = "medium"
                suggested_path = "app/models/schema.py" if not is_js_ts else "src/models/schema.ts"
                task_desc = f"Define a relational database entity with typed primary key and columns for {label}, and query it in a reachable module."
                skeleton = (
                    "# RECOMMENDATION ONLY - SKELETON NEVER COUNTS AS EVIDENCE\n"
                    "from sqlalchemy import Column, Integer, String\n"
                    "from backend.models.models import Base\n\n"
                    "class ManagedRecord(Base):\n"
                    "    __tablename__ = 'managed_records'\n"
                    "    id = Column(Integer, primary_key=True, index=True)\n"
                    "    title = Column(String(255), nullable=False)\n"
                )
            else:
                rule_ids = ["sql.orm_model_declared", "sql.executed_query_reachable", "sql.test_asserts_result"]
                effort = "large"
                suggested_path = "tests/test_database.py" if not is_js_ts else "tests/database.test.ts"
                task_desc = f"Implement comprehensive relational models and automated transactional tests verifying query results for {label}."
                skeleton = (
                    "# RECOMMENDATION ONLY - SKELETON NEVER COUNTS AS EVIDENCE\n"
                    "def test_database_crud(db_session):\n"
                    "    item = ManagedRecord(title='Test')\n"
                    "    db_session.add(item)\n"
                    "    assert item.title == 'Test'\n"
                )

        elif any(term in canonical_id or term in category for term in ("api", "fastapi", "flask", "rest", "endpoint", "express")):
            if target_state == STATUS_BASIC:
                rule_ids = ["api.route_endpoint_defined", "api.route_mounted"]
                effort = "small"
                suggested_path = "app/api/endpoints.py" if not is_js_ts else "src/routes/api.ts"
                task_desc = f"Implement an active route handler endpoint representing {label} and mount it to the primary application router."
                skeleton = (
                    "# RECOMMENDATION ONLY - SKELETON NEVER COUNTS AS EVIDENCE\n"
                    "from fastapi import APIRouter\n"
                    "router = APIRouter()\n\n"
                    "@router.get('/api/status')\n"
                    "async def get_status():\n"
                    "    return {'status': 'healthy'}\n"
                )
            else:
                rule_ids = ["api.route_endpoint_defined", "api.pydantic_schema_validated", "api.route_mounted"]
                effort = "medium"
                suggested_path = "app/schemas/payloads.py" if not is_js_ts else "src/schemas/payloads.ts"
                task_desc = f"Add strongly typed Pydantic request/response schema validation to the {label} API route handlers."
                skeleton = (
                    "# RECOMMENDATION ONLY - SKELETON NEVER COUNTS AS EVIDENCE\n"
                    "from pydantic import BaseModel\n\n"
                    "class StatusResponse(BaseModel):\n"
                    "    status: str\n"
                    "    latency_ms: float\n"
                )

        elif any(term in canonical_id or term in category for term in ("test", "pytest", "jest", "unit", "coverage")):
            rule_ids = ["testing.test_function_present", "testing.non_trivial_assertion", "testing.imports_project_code"]
            effort = "small"
            suggested_path = "tests/test_service.py" if not is_js_ts else "src/test/service.test.ts"
            task_desc = f"Add automated unit test functions exercising project code with non-trivial dynamic assertions for {label}."
            skeleton = (
                "# RECOMMENDATION ONLY - SKELETON NEVER COUNTS AS EVIDENCE\n"
                "from app.services.calculator import compute_summary\n\n"
                "def test_compute_summary():\n"
                "    result = compute_summary([10, 20])\n"
                "    assert result['total'] == 30\n"
            )

        elif any(term in canonical_id or term in category for term in ("ci", "cicd", "docker", "devops", "deploy")):
            rule_ids = ["cicd.workflow_steps_declared", "cicd.dockerfile_non_empty"]
            effort = "medium"
            suggested_path = ".github/workflows/verify.yml"
            task_desc = f"Configure a verifiable CI/CD pipeline workflow with lint and test job steps demonstrating {label}."
            skeleton = (
                "# RECOMMENDATION ONLY - SKELETON NEVER COUNTS AS EVIDENCE\n"
                "name: Verification\n"
                "on: [push]\n"
                "jobs:\n"
                "  test:\n"
                "    runs-on: ubuntu-latest\n"
                "    steps:\n"
                "      - uses: actions/checkout@v4\n"
                "      - name: Run checks\n"
                "        run: pytest\n"
            )

        else:
            # Fallback using standard testing rules
            rule_ids = ["testing.test_function_present", "testing.non_trivial_assertion"]
            effort = "small"
            suggested_path = "tests/test_domain.py"
            task_desc = f"Add functional unit tests and non-trivial assertions verifying {label}."
            skeleton = (
                "# RECOMMENDATION ONLY - SKELETON NEVER COUNTS AS EVIDENCE\n"
                "def test_feature():\n"
                "    val = 10 * 2\n"
                "    assert val == 20\n"
            )

        # Ensure all rule IDs are strictly allow-listed
        validated_rule_ids = [rid for rid in rule_ids if rid in ALLOW_LISTED_RULES]
        acceptance_checks = [
            {
                "rule_id": rid,
                "label": ALLOW_LISTED_RULES[rid]["label"],
                "description": ALLOW_LISTED_RULES[rid]["description"],
                "detector": ALLOW_LISTED_RULES[rid]["detector"],
                "passed": False,
                "file": None,
                "line": None,
                "reason": None
            }
            for rid in validated_rule_ids
        ]

        # Negative predictions ("must not move"): skills currently demonstrated that must remain intact
        must_not_move = [
            r["label"] for r in all_requirements
            if r["id"] != req_id and r.get("status") in (STATUS_STRONG, STATUS_BASIC)
        ]

        # Ranking arithmetic: potential coverage points gain per effort weight
        total_reqs = max(1, len(all_requirements))
        gain_pts = round(100.0 / total_reqs, 1)
        weight = EFFORT_WEIGHTS.get(effort, 1.0)
        score = round(gain_pts / weight, 2)
        gain_arithmetic = f"+{gain_pts}% potential coverage / {weight} ({effort}) = {score} efficiency score"

        return {
            "id": str(uuid.uuid4()),
            "requirement_id": req_id,
            "requirement_name": label,
            "current_state": current_status,
            "predicted_target_state": target_state,
            "acceptance_checks": [c["description"] for c in acceptance_checks],
            "acceptance_checks_json": acceptance_checks,
            "base_commit_sha": base_commit_sha,
            "requirements_expected_to_change": [label],
            "requirements_must_not_change": must_not_move,
            "must_not_move_json": must_not_move,
            "effort_class": effort,
            "ci_status": "not_run",
            "adjudication_json": None,
            "task_description": task_desc,
            "suggested_file_path": suggested_path,
            "recommendation_skeleton": skeleton,
            "gain_arithmetic": gain_arithmetic,
            "verdict": "Open",
            "reason": None,
            "evaluated_commit_sha": None
        }

    # =========================================================================
    # STATIC ACCEPTANCE EVALUATION (Zero Code Execution)
    # Strictly AST inspection and static structure analysis.
    # No subprocess, docker, eval, exec, or server-side test execution.
    # =========================================================================
    def evaluate_static_rule(
        self,
        rule_id: str,
        files: Dict[str, str]
    ) -> Tuple[bool, Optional[str], Optional[int], str]:
        """
        Statically evaluates an allow-listed rule against files.
        Returns: (passed, file_path, line_number, reason)
        """
        if rule_id not in ALLOW_LISTED_RULES:
            return False, None, None, f"Rule '{rule_id}' is not in the allow-listed catalog."

        # 1. SQL ORM Model Declared
        if rule_id == "sql.orm_model_declared":
            for path, content in files.items():
                if not path.endswith(".py"):
                    continue
                try:
                    tree = ast.parse(content, filename=path)
                except Exception:
                    continue

                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        # Checks inheritance from Base, Model, db.Model
                        base_names = [ast.unparse(b) for b in node.bases if hasattr(ast, "unparse")]
                        if any(b in ("Base", "Model", "db.Model", "DeclarativeBase") for b in base_names):
                            return True, path, node.lineno, f"Relational ORM model class '{node.name}' declared inheriting from {base_names}."
                        # Check __tablename__ attribute
                        for item in node.body:
                            if isinstance(item, ast.Assign):
                                for target in item.targets:
                                    if isinstance(target, ast.Name) and target.id == "__tablename__":
                                        return True, path, node.lineno, f"Relational ORM model class '{node.name}' defines '__tablename__'."
            return False, None, None, "No relational ORM model class or table declaration found."

        # 2. SQL Executed Query Reachable
        elif rule_id == "sql.executed_query_reachable":
            for path, content in files.items():
                if not path.endswith(".py") or "test" in path.lower():
                    continue
                try:
                    tree = ast.parse(content, filename=path)
                except Exception:
                    continue

                for node in ast.walk(tree):
                    if isinstance(node, ast.Call):
                        func_str = ast.unparse(node.func) if hasattr(ast, "unparse") else ""
                        if any(pattern in func_str for pattern in ("session.query", "select", "db.execute", "cursor.execute", ".filter", ".all", ".first")):
                            return True, path, node.lineno, f"Database query execution call '{func_str}(...)' found in business logic."
            return False, None, None, "No reachable database query call (select/execute/filter) found in application code."

        # 3. SQL Test Asserts Result
        elif rule_id == "sql.test_asserts_result":
            for path, content in files.items():
                if "test" not in path.lower() or not path.endswith((".py", ".ts", ".js")):
                    continue
                lines = content.splitlines()
                for idx, line in enumerate(lines):
                    if ("assert" in line or "expect(" in line) and any(kw in line.lower() for kw in ("result", "count", "record", "rows", "len(", "status")):
                        if not any(hollow in line for hollow in ("assert True", "assert False", "assert 1", "assert None")):
                            return True, path, idx + 1, f"Automated test assertion verifying query/database results at line {idx + 1}."
            return False, None, None, "No test assertion verifying database query results found in test files."

        # 4. API Route Endpoint Defined
        elif rule_id == "api.route_endpoint_defined":
            for path, content in files.items():
                if not path.endswith((".py", ".ts", ".js")) or "test" in path.lower():
                    continue
                if path.endswith(".py"):
                    try:
                        tree = ast.parse(content, filename=path)
                    except Exception:
                        continue
                    for node in ast.walk(tree):
                        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                            for dec in node.decorator_list:
                                dec_str = ast.unparse(dec) if hasattr(ast, "unparse") else ""
                                if any(m in dec_str for m in ("app.get", "app.post", "app.put", "app.delete", "router.get", "router.post", "router.put", "router.delete", "api.")):
                                    return True, path, node.lineno, f"HTTP route handler '{node.name}' declared with decorator @{dec_str}."
                else:
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if re.search(r"(?:app|router)\.(?:get|post|put|delete|patch)\s*\(", line):
                            return True, path, idx + 1, f"Express/TypeScript route handler defined at line {idx + 1}."
            return False, None, None, "No active HTTP route handler endpoint (@app/router.get/post) found."

        # 5. API Pydantic Schema Validated
        elif rule_id == "api.pydantic_schema_validated":
            for path, content in files.items():
                if not path.endswith(".py"):
                    continue
                try:
                    tree = ast.parse(content, filename=path)
                except Exception:
                    continue
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        bases = [ast.unparse(b) for b in node.bases if hasattr(ast, "unparse")]
                        if any("BaseModel" in b for b in bases):
                            return True, path, node.lineno, f"Pydantic validation schema '{node.name}' declared."
            return False, None, None, "No Pydantic BaseModel or schema validation model declared."

        # 6. API Route Mounted
        elif rule_id == "api.route_mounted":
            for path, content in files.items():
                if not path.endswith((".py", ".ts", ".js")):
                    continue
                if any(kw in content for kw in ("include_router", "register_blueprint", "app.use('/", "app.use(\"/")):
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if any(kw in line for kw in ("include_router", "register_blueprint", "app.use")):
                            return True, path, idx + 1, f"Router mounting statement found: '{line.strip()}'."
            return False, None, None, "No router mount statement ('include_router' or 'app.use') found in application entrypoints."

        # 7. Testing Test Function Present
        elif rule_id == "testing.test_function_present":
            for path, content in files.items():
                if "test" not in path.lower():
                    continue
                if path.endswith(".py"):
                    try:
                        tree = ast.parse(content, filename=path)
                    except Exception:
                        continue
                    for node in ast.walk(tree):
                        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                            if node.name.startswith("test_") or node.name.endswith("_test"):
                                # Check if skipped
                                is_skipped = any("skip" in (ast.unparse(d) if hasattr(ast, "unparse") else "") for d in node.decorator_list)
                                if not is_skipped:
                                    return True, path, node.lineno, f"Active test function '{node.name}' defined without skip markers."
                elif path.endswith((".ts", ".js")):
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if re.search(r"^\s*(?:it|test)\s*\(", line) and not re.search(r"\.(?:skip|todo)\b", line):
                            return True, path, idx + 1, f"Active test case defined at line {idx + 1}."
            return False, None, None, "No un-skipped test function ('def test_*' or 'it(...)') found."

        # 8. Testing Non-Trivial Assertion
        elif rule_id == "testing.non_trivial_assertion":
            for path, content in files.items():
                if "test" not in path.lower():
                    continue
                lines = content.splitlines()
                for idx, line in enumerate(lines):
                    stripped = line.strip()
                    if stripped.startswith("assert "):
                        expr = stripped[7:].strip()
                        # Reject hollow assertions
                        if expr in ("True", "False", "1", "0", "None", "1 == 1", "True is True"):
                            continue
                        return True, path, idx + 1, f"Non-trivial dynamic assertion '{stripped}' found."
                    elif "expect(" in stripped and not "expect(true)" in stripped.lower():
                        return True, path, idx + 1, f"Jest/Vitest assertion '{stripped}' found."
            return False, None, None, "No non-trivial dynamic assertion found (only hollow/constant asserts or none)."

        # 9. Testing Imports Project Code
        elif rule_id == "testing.imports_project_code":
            stdlib_names = {"pytest", "unittest", "os", "sys", "re", "math", "json", "typing", "datetime", "uuid"}
            for path, content in files.items():
                if "test" not in path.lower() or not path.endswith(".py"):
                    continue
                try:
                    tree = ast.parse(content, filename=path)
                except Exception:
                    continue
                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for name in node.names:
                            base_mod = name.name.split(".")[0]
                            if base_mod not in stdlib_names:
                                return True, path, node.lineno, f"Test imports project module '{name.name}'."
                    elif isinstance(node, ast.ImportFrom):
                        if node.module:
                            base_mod = node.module.split(".")[0]
                            if base_mod not in stdlib_names:
                                return True, path, node.lineno, f"Test imports from project package '{node.module}'."
            return False, None, None, "Test file does not import any project code modules."

        # 10. CI/CD Workflow Steps Declared
        elif rule_id == "cicd.workflow_steps_declared":
            for path, content in files.items():
                if ".github/workflows" in path and path.endswith((".yml", ".yaml")):
                    if "steps:" in content and ("run:" in content or "uses:" in content):
                        lines = content.splitlines()
                        for idx, line in enumerate(lines):
                            if "run:" in line or "uses:" in line:
                                return True, path, idx + 1, f"CI/CD workflow step '{line.strip()}' declared."
            return False, None, None, "No active GitHub Actions workflow with executable job steps found."

        # 11. CI/CD Dockerfile Non-Empty
        elif rule_id == "cicd.dockerfile_non_empty":
            for path, content in files.items():
                if "dockerfile" in path.lower():
                    lines = [l.strip() for l in content.splitlines() if l.strip() and not l.strip().startswith("#")]
                    non_from = [l for l in lines if not l.upper().startswith("FROM")]
                    if len(non_from) >= 1:
                        return True, path, 1, f"Dockerfile defines valid setup steps beyond bare FROM ({len(lines)} instructions)."
                    else:
                        return False, path, 1, "Dockerfile only contains a bare FROM instruction without build commands."
            return False, None, None, "No Dockerfile found."

        return False, None, None, "Rule evaluation inconclusive."

    # =========================================================================
    # BATCH ACCEPTANCE EVALUATION
    # =========================================================================
    def evaluate_acceptance_checks(
        self,
        checks: List[Dict[str, Any]],
        files: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        """
        Runs static checks for all rules in the contract.
        """
        results = []
        for c in checks:
            rule_id = c.get("rule_id", "")
            passed, file_path, line_num, reason = self.evaluate_static_rule(rule_id, files)
            results.append({
                "rule_id": rule_id,
                "label": c.get("label") or ALLOW_LISTED_RULES.get(rule_id, {}).get("label", rule_id),
                "description": c.get("description") or ALLOW_LISTED_RULES.get(rule_id, {}).get("description", ""),
                "detector": c.get("detector") or ALLOW_LISTED_RULES.get(rule_id, {}).get("detector", "generic_detector"),
                "passed": passed,
                "file": file_path,
                "line": line_num,
                "reason": reason
            })
        return results

    # =========================================================================
    # READ-ONLY CI STATUS (Checks API)
    # Never executes tests. Only reads GitHub Checks API / Commit Statuses.
    # =========================================================================
    async def fetch_ci_status(
        self,
        repo_full_name: str,
        commit_sha: str,
        github_token: Optional[str] = None
    ) -> str:
        """
        Reads the GitHub Checks API / commit statuses for the commit.
        Returns: "passed", "failed", or "not_run".
        """
        if not repo_full_name or not commit_sha or commit_sha.startswith("0000"):
            return "not_run"

        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "ProofStack-CI-Reader"
        }
        if github_token:
            headers["Authorization"] = f"Bearer {github_token}"

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                # 1. Check Runs API
                url_checks = f"https://api.github.com/repos/{repo_full_name}/commits/{commit_sha}/check-runs"
                res_checks = await client.get(url_checks, headers=headers)
                if res_checks.status_code == 200:
                    data = res_checks.json()
                    check_runs = data.get("check_runs", [])
                    if check_runs:
                        conclusions = [c.get("conclusion") for c in check_runs if c.get("status") == "completed"]
                        if any(c in ("failure", "timed_out", "action_required") for c in conclusions):
                            return "failed"
                        if conclusions and all(c in ("success", "neutral", "skipped") for c in conclusions):
                            return "passed"
                        return "pending"

                # 2. Commit Statuses fallback
                url_status = f"https://api.github.com/repos/{repo_full_name}/commits/{commit_sha}/status"
                res_status = await client.get(url_status, headers=headers)
                if res_status.status_code == 200:
                    data = res_status.json()
                    state = data.get("state")
                    if state == "success":
                        return "passed"
                    elif state in ("failure", "error"):
                        return "failed"
                    elif state == "pending":
                        return "pending"
        except Exception:
            return "not_run"

        return "not_run"

    # =========================================================================
    # ADJUDICATION ENGINE
    # Adjudicates verdicts: Fulfilled, Partly, Not fulfilled.
    # =========================================================================
    def adjudicate_contract(
        self,
        contract: Dict[str, Any],
        files: Dict[str, str],
        ci_status: str = "not_run",
        new_assessments: Optional[Dict[str, str]] = None,
        is_dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Adjudicates a Commit Contract against evaluated files and CI status.
        Verdicts:
          - "Fulfilled": All acceptance checks pass AND zero must-not-move violations.
          - "Partly": At least one acceptance check passed OR a must-not-move requirement regressed.
          - "Not fulfilled": Zero acceptance checks passed.
        """
        raw_checks = contract.get("acceptance_checks_json") or []
        if isinstance(raw_checks, str):
            try:
                raw_checks = json.loads(raw_checks)
            except Exception:
                raw_checks = []

        # Run static acceptance checks
        evaluated_checks = self.evaluate_acceptance_checks(raw_checks, files)
        passed_count = sum(1 for c in evaluated_checks if c["passed"])
        total_count = len(evaluated_checks)

        # Check negative predictions / must-not-move
        must_not_move_labels = contract.get("must_not_move_json") or contract.get("requirements_must_not_change") or []
        if isinstance(must_not_move_labels, str):
            try:
                must_not_move_labels = json.loads(must_not_move_labels)
            except Exception:
                must_not_move_labels = []

        must_not_move_violations = []
        if new_assessments:
            # Check if any previously demonstrated requirement regressed
            for label in must_not_move_labels:
                status = new_assessments.get(label)
                if status in (STATUS_NOT_DEMONSTRATED, STATUS_UNCLEAR):
                    must_not_move_violations.append(f"{label} regressed to '{status}'.")

        # Determine verdict
        if passed_count == total_count and total_count > 0:
            if must_not_move_violations:
                verdict = "Partly"
                summary = f"All {total_count} acceptance checks passed, but negative prediction was violated: {', '.join(must_not_move_violations)}"
            else:
                verdict = "Fulfilled"
                summary = f"All {total_count} static acceptance checks verified successfully. Contract fulfilled."
        elif passed_count > 0:
            verdict = "Partly"
            summary = f"Partly fulfilled: {passed_count}/{total_count} acceptance checks passed."
        else:
            verdict = "Not fulfilled"
            summary = f"Not fulfilled: 0/{total_count} acceptance checks passed."

        adjudication_data = {
            "verdict": verdict,
            "summary": summary,
            "checks": evaluated_checks,
            "passed_count": passed_count,
            "total_count": total_count,
            "must_not_move_violations": must_not_move_violations,
            "ci_status": ci_status,
            "is_dry_run": is_dry_run,
            "adjudicated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        return adjudication_data


contracts_service = CommitContractsService()
