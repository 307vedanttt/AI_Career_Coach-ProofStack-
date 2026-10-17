import re
import ast
from typing import Dict, List, Any, Tuple
from backend.services.detectors.base import BaseDetector

class APIDetector(BaseDetector):
    name = "api_detector"
    version = "1.0.0"

    def detect(
        self,
        files: Dict[str, str],
        requirement: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        valid_candidates = []
        rejected_candidates = []

        # Patterns for API route definitions
        py_route_decorator = re.compile(r"@(?:app|router|api)\.(?:get|post|put|patch|delete|route)\s*\(", re.IGNORECASE)
        js_route_pattern = re.compile(r"(?:app|router)\.(?:get|post|put|patch|delete)\s*\(\s*['\"][^'\"]+['\"]", re.IGNORECASE)
        nextjs_route_pattern = re.compile(r"export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*\(", re.IGNORECASE)
        nextjs_handler_pattern = re.compile(r"export\s+default\s+(?:async\s+)?function\s+(?:handler|[A-Za-z0-9_]+)\s*\(\s*(?:req|request)", re.IGNORECASE)
        model_pattern = re.compile(r"class\s+([A-Za-z0-9_]+)\s*\(\s*(?:BaseModel|Schema)\s*\):", re.IGNORECASE)
        client_test_pattern = re.compile(r"(?:client|test_client|http_client)\.(?:get|post|put|patch|delete)\s*\(\s*['\"][^'\"]+['\"]", re.IGNORECASE)

        for path, content in files.items():
            lines = content.splitlines()

            # Python files
            if path.endswith(".py"):
                # Check for API Route Decorators
                for idx, line in enumerate(lines):
                    if py_route_decorator.search(line):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 8)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "api_handler",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 8),
                            "code_snippet": snippet,
                            "explanation": f"Mounted API route handler detected at line {idx + 1}."
                        })

                # Check for Request/Response Models
                for idx, line in enumerate(lines):
                    m = model_pattern.search(line)
                    if m:
                        snippet = "\n".join(lines[idx: min(len(lines), idx + 6)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "api_schema",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 6),
                            "code_snippet": snippet,
                            "explanation": f"API request/response schema model '{m.group(1)}' defined at line {idx + 1}."
                        })

                # Check for API Endpoint tests
                if "test" in path.lower():
                    for idx, line in enumerate(lines):
                        if client_test_pattern.search(line):
                            snippet = "\n".join(lines[max(0, idx - 2): min(len(lines), idx + 5)])
                            valid_candidates.append({
                                "detector_name": self.name,
                                "signal_type": "api_endpoint_test",
                                "file_path": path,
                                "start_line": idx + 1,
                                "end_line": min(len(lines), idx + 5),
                                "code_snippet": snippet,
                                "explanation": f"API endpoint test invoking client method at line {idx + 1}."
                            })

            # JS / TS files
            elif path.endswith((".js", ".ts", ".jsx", ".tsx")):
                for idx, line in enumerate(lines):
                    if js_route_pattern.search(line):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 6)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "api_handler",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 6),
                            "code_snippet": snippet,
                            "explanation": f"Express / Node API route handler defined at line {idx + 1}."
                        })
                    elif nextjs_route_pattern.search(line) or (("api/" in path or "routes/" in path) and nextjs_handler_pattern.search(line)):
                        snippet = "\n".join(lines[idx: min(len(lines), idx + 8)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "api_handler",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 8),
                            "code_snippet": snippet,
                            "explanation": f"Next.js / Node HTTP API route handler defined at line {idx + 1}."
                        })

        return valid_candidates, rejected_candidates
