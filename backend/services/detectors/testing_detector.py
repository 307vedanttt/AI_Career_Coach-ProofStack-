import re
from typing import Dict, List, Any, Tuple
from backend.services.detectors.base import BaseDetector

class TestingDetector(BaseDetector):
    name = "testing_detector"
    version = "1.0.0"

    def detect(
        self,
        files: Dict[str, str],
        requirement: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        valid_candidates = []
        rejected_candidates = []

        assert_pattern = re.compile(r"^\s*assert\s+(.+)$")
        unittest_pattern = re.compile(r"self\.assert(?:Equal|True|False|In|Raises|IsNone)\s*\(")
        jest_pattern = re.compile(r"expect\s*\(.+?\)\s*\.(?:toBe|toEqual|toContain|toHaveBeenCalled)")

        for path, content in files.items():
            lines = content.splitlines()

            # Test configuration files
            if path in ("pytest.ini", "setup.cfg", ".pytest.ini") or path.endswith("conftest.py") or "jest.config" in path:
                valid_candidates.append({
                    "detector_name": self.name,
                    "signal_type": "test_config",
                    "file_path": path,
                    "start_line": 1,
                    "end_line": min(len(lines), 10),
                    "code_snippet": "\n".join(lines[:10]),
                    "explanation": f"Automated testing configuration or fixtures found in '{path}'."
                })

            # Check test files
            is_test_file = "test" in path.lower() or path.endswith(("_test.py", ".spec.ts", ".test.js", ".test.ts"))
            if is_test_file:
                for idx, line in enumerate(lines):
                    # Check python assert
                    m_assert = assert_pattern.search(line)
                    if m_assert:
                        cond = m_assert.group(1).strip()
                        # Reject trivial assertion candidate upfront
                        if cond in ("True", "False", "1", "0", "None"):
                            rejected_candidates.append({
                                "detector_name": self.name,
                                "file_path": path,
                                "start_line": idx + 1,
                                "end_line": idx + 1,
                                "code_snippet": line.strip(),
                                "rejection_reason": f"Hollow test assertion on constant: '{cond}'."
                            })
                            continue

                        snippet = "\n".join(lines[max(0, idx - 2): min(len(lines), idx + 3)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "test_assertion",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 3),
                            "code_snippet": snippet,
                            "explanation": f"Active test assertion verifying project behavior at line {idx + 1}."
                        })

                    elif unittest_pattern.search(line):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 3)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "test_assertion",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 3),
                            "code_snippet": snippet,
                            "explanation": f"Unittest assertion verifying project behavior at line {idx + 1}."
                        })

                    elif jest_pattern.search(line):
                        snippet = "\n".join(lines[max(0, idx - 1): min(len(lines), idx + 3)])
                        valid_candidates.append({
                            "detector_name": self.name,
                            "signal_type": "test_assertion",
                            "file_path": path,
                            "start_line": idx + 1,
                            "end_line": min(len(lines), idx + 3),
                            "code_snippet": snippet,
                            "explanation": f"Jest / Vitest assertion verifying behavior at line {idx + 1}."
                        })

        return valid_candidates, rejected_candidates
