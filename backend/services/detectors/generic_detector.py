import re
from typing import Dict, List, Any, Tuple
from backend.services.detectors.base import BaseDetector

class GenericDetector(BaseDetector):
    name = "generic_detector"
    version = "1.0.0"

    def detect(
        self,
        files: Dict[str, str],
        requirement: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        valid_candidates = []
        rejected_candidates = []

        canonical_id = requirement.get("canonical_id", "").lower()
        label = requirement.get("label", "").lower()

        func_pattern = re.compile(r"^\s*(?:def|function|async def|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)\s*([a-zA-Z0-9_]+)", re.MULTILINE)

        for path, content in files.items():
            lines = content.splitlines()

            # Python language skill fallback
            if "python" in canonical_id or "python" in label:
                if path.endswith(".py") and not path.startswith("tests/"):
                    for idx, line in enumerate(lines):
                        m = func_pattern.search(line)
                        if m:
                            snippet = "\n".join(lines[idx: min(len(lines), idx + 6)])
                            valid_candidates.append({
                                "detector_name": self.name,
                                "signal_type": "language_syntax",
                                "file_path": path,
                                "start_line": idx + 1,
                                "end_line": min(len(lines), idx + 6),
                                "code_snippet": snippet,
                                "explanation": f"Core Python logic implementation in function '{m.group(1)}'."
                            })
                            break # Limit to 1 candidate per file for generic detector

            # JavaScript / TypeScript language skill fallback
            elif "javascript" in canonical_id or "typescript" in canonical_id or "js" in label:
                if path.endswith((".js", ".ts", ".jsx", ".tsx")):
                    for idx, line in enumerate(lines):
                        m = func_pattern.search(line)
                        if m:
                            snippet = "\n".join(lines[idx: min(len(lines), idx + 6)])
                            valid_candidates.append({
                                "detector_name": self.name,
                                "signal_type": "language_syntax",
                                "file_path": path,
                                "start_line": idx + 1,
                                "end_line": min(len(lines), idx + 6),
                                "code_snippet": snippet,
                                "explanation": f"JavaScript / TypeScript function implementation '{m.group(1)}'."
                            })
                            break

        return valid_candidates, rejected_candidates
