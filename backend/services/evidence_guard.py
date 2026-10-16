import ast
import os
import re
from typing import Dict, List, Any, Tuple, Optional, Set

VENDORED_OR_GENERATED_PATHS = [
    "node_modules/", "vendor/", ".git/", "dist/", "build/",
    ".venv/", "venv/", "__pycache__/", "site-packages/",
    ".min.js", ".min.css", "package-lock.json", "yarn.lock", "poetry.lock"
]

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 # 2MB

class ReachabilityAnalyzer:
    """
    Performs Python AST reachability analysis:
    - Route decorators and API entrypoints
    - Intra-package function and class calls
    - One-hop imports
    - JavaScript/TypeScript import-graph heuristic
    """

    def analyze_python_reachability(self, files: Dict[str, str]) -> Set[str]:
        """
        Builds call and import graph from entry points and returns set of reachable file paths and symbols.
        """
        entry_points = set()
        file_ast_map = {}
        file_defs: Dict[str, Set[str]] = {} # file -> defined functions/classes
        file_calls: Dict[str, Set[str]] = {} # file -> called names
        import_map: Dict[str, Set[str]] = {} # file -> imported files/modules

        for path, content in files.items():
            if not path.endswith(".py"):
                continue

            try:
                tree = ast.parse(content, filename=path)
                file_ast_map[path] = tree
            except Exception:
                continue

            defined_symbols = set()
            called_symbols = set()
            imported_modules = set()
            is_entry = False

            # Check for route decorators or entrypoints
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    defined_symbols.add(node.name)
                    for decorator in node.decorator_list:
                        dec_str = ast.unparse(decorator) if hasattr(ast, "unparse") else ""
                        if any(term in dec_str for term in ("app.", "router.", "route", "api.")):
                            is_entry = True

                elif isinstance(node, ast.ClassDef):
                    defined_symbols.add(node.name)

                elif isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        called_symbols.add(node.func.id)
                    elif isinstance(node.func, ast.Attribute):
                        called_symbols.add(node.func.attr)

                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    if isinstance(node, ast.Import):
                        for n in node.names:
                            imported_modules.add(n.name)
                    elif isinstance(node, ast.ImportFrom) and node.module:
                        imported_modules.add(node.module)

            file_defs[path] = defined_symbols
            file_calls[path] = called_symbols
            import_map[path] = imported_modules

            if is_entry or "main" in path.lower() or "app" in path.lower() or "manage" in path.lower() or "test" in path.lower():
                entry_points.add(path)

        # BFS / Reachability traversal from entry points
        reachable_files = set(entry_points)
        queue = list(entry_points)

        while queue:
            curr = queue.pop(0)
            called = file_calls.get(curr, set())
            imports = import_map.get(curr, set())

            for candidate_path, defs in file_defs.items():
                if candidate_path in reachable_files:
                    continue
                # Connected via symbol calls or imports
                cand_module = candidate_path.replace("/", ".").replace(".py", "")
                if any(imp in cand_module or cand_module in imp for imp in imports) or bool(defs & called):
                    reachable_files.add(candidate_path)
                    queue.append(candidate_path)

        return reachable_files

    def check_js_reachability(self, file_path: str, files: Dict[str, str]) -> Tuple[bool, str]:
        """
        Lightweight import-graph heuristic for JS/TS.
        Returns (is_reachable, status_label).
        """
        base_name = os.path.basename(file_path).split(".")[0]
        # Check if imported anywhere in project
        import_regex = re.compile(rf"(?:from|require\s*\()\s*['\"].*?{re.escape(base_name)}['\"]", re.IGNORECASE)

        for p, content in files.items():
            if p == file_path:
                continue
            if import_regex.search(content):
                return True, "heuristic_reachable"

        # If it's an entry point (index, app, server, or test)
        if any(ep in file_path.lower() for ep in ("index", "app", "server", "routes", "test")):
            return True, "heuristic_reachable"

        return False, "unclear"


class EvidenceGuard:
    def __init__(self):
        self.reachability = ReachabilityAnalyzer()

    def filter_candidates(
        self,
        raw_candidates: List[Dict[str, Any]],
        files: Dict[str, str],
        commit_sha: str
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Guards against hollow, stuffed, vendored, or unreachable evidence.
        Returns (surviving_candidates, rejected_candidates).
        """
        surviving = []
        rejected = []

        python_reachable = self.reachability.analyze_python_reachability(files)

        for candidate in raw_candidates:
            file_path = candidate["file_path"]
            snippet = candidate.get("code_snippet", "")
            detector_name = candidate.get("detector_name", "generic_detector")
            signal_type = candidate.get("signal_type", "")

            # 1. Reject vendored or generated files
            if any(v in file_path for v in VENDORED_OR_GENERATED_PATHS):
                rejected.append({
                    "detector_name": detector_name,
                    "file_path": file_path,
                    "commit_sha": commit_sha,
                    "rejection_reason": "Vendored, generated, or dependency lockfile.",
                    "rejected_snippet": snippet[:200]
                })
                continue

            # 2. Reject README keyword stuffing
            if file_path.lower().endswith((".md", ".rst", ".txt")):
                rejected.append({
                    "detector_name": detector_name,
                    "file_path": file_path,
                    "commit_sha": commit_sha,
                    "rejection_reason": "Documentation or README keyword list rejected as non-functional evidence.",
                    "rejected_snippet": snippet[:200]
                })
                continue

            # 3. Reject empty files or comments-only
            content = files.get(file_path, "")
            lines_stripped = [l.strip() for l in content.splitlines() if l.strip() and not l.strip().startswith(("#", "//", "/*", "*"))]
            if not lines_stripped:
                rejected.append({
                    "detector_name": detector_name,
                    "file_path": file_path,
                    "commit_sha": commit_sha,
                    "rejection_reason": "Empty file or comments-only content.",
                    "rejected_snippet": snippet[:200]
                })
                continue

            # 4. Reject empty or trivial test assertions
            if signal_type == "test_assertion":
                if "assert True" in snippet or "assert 1" in snippet or "assert None is None" in snippet:
                    rejected.append({
                        "detector_name": detector_name,
                        "file_path": file_path,
                        "commit_sha": commit_sha,
                        "rejection_reason": "Trivial assertion on constant without exercising application behavior.",
                        "rejected_snippet": snippet[:200]
                    })
                    continue

            # 5. Check Python Reachability for SQL and handlers
            reachability_status = "reachable"
            if file_path.endswith(".py"):
                if file_path not in python_reachable and not file_path.startswith("test"):
                    # Unreachable code candidate
                    if detector_name == "sql_detector":
                        rejected.append({
                            "detector_name": detector_name,
                            "file_path": file_path,
                            "commit_sha": commit_sha,
                            "rejection_reason": "SQL/database logic in unreachable module disconnected from routes and entry points.",
                            "rejected_snippet": snippet[:200]
                        })
                        continue
                    else:
                        reachability_status = "unclear"
            elif file_path.endswith((".js", ".ts", ".jsx", ".tsx")):
                reachable, label = self.reachability.check_js_reachability(file_path, files)
                reachability_status = label
                if not reachable and detector_name == "sql_detector":
                    rejected.append({
                        "detector_name": detector_name,
                        "file_path": file_path,
                        "commit_sha": commit_sha,
                        "rejection_reason": "Unreachable database code in isolated JS/TS file.",
                        "rejected_snippet": snippet[:200]
                    })
                    continue
            else:
                reachability_status = "unclear"

            # Assign surviving candidate
            candidate["reachability_status"] = reachability_status
            candidate["commit_sha"] = commit_sha
            surviving.append(candidate)

        return surviving, rejected

evidence_guard = EvidenceGuard()
