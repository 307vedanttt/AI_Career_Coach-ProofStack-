import re
from typing import Dict, List, Any, Tuple
from backend.services.detectors.base import BaseDetector

class CICDDetector(BaseDetector):
    name = "cicd_detector"
    version = "1.0.0"

    def detect(
        self,
        files: Dict[str, str],
        requirement: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        valid_candidates = []
        rejected_candidates = []

        dockerfile_names = ("Dockerfile", "dockerfile", "Dockerfile.dev", "Dockerfile.prod")
        compose_names = ("docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml")

        for path, content in files.items():
            lines = content.splitlines()

            # Dockerfile
            if any(path.endswith(df) for df in dockerfile_names):
                has_from = any(line.strip().upper().startswith("FROM ") for line in lines)
                has_cmd_or_run = any(line.strip().upper().startswith(("CMD ", "ENTRYPOINT ", "RUN ")) for line in lines)

                if has_from and has_cmd_or_run:
                    valid_candidates.append({
                        "detector_name": self.name,
                        "signal_type": "docker_build",
                        "file_path": path,
                        "start_line": 1,
                        "end_line": min(len(lines), 15),
                        "code_snippet": "\n".join(lines[:15]),
                        "explanation": f"Complete Docker containerization build script found in '{path}'."
                    })
                else:
                    rejected_candidates.append({
                        "detector_name": self.name,
                        "file_path": path,
                        "start_line": 1,
                        "end_line": len(lines),
                        "code_snippet": "\n".join(lines[:5]),
                        "rejection_reason": "Incomplete or skeleton Dockerfile without base image or commands."
                    })

            # Docker Compose
            elif any(path.endswith(comp) for comp in compose_names):
                if "services:" in content:
                    valid_candidates.append({
                        "detector_name": self.name,
                        "signal_type": "docker_compose",
                        "file_path": path,
                        "start_line": 1,
                        "end_line": min(len(lines), 15),
                        "code_snippet": "\n".join(lines[:15]),
                        "explanation": f"Multi-container orchestration definition found in '{path}'."
                    })

            # GitHub Actions / CI Workflows
            elif ".github/workflows" in path and path.endswith((".yml", ".yaml")):
                if "jobs:" in content and ("run:" in content or "uses:" in content):
                    valid_candidates.append({
                        "detector_name": self.name,
                        "signal_type": "ci_workflow",
                        "file_path": path,
                        "start_line": 1,
                        "end_line": min(len(lines), 20),
                        "code_snippet": "\n".join(lines[:20]),
                        "explanation": f"Automated CI/CD pipeline workflow configured in '{path}'."
                    })

        return valid_candidates, rejected_candidates
