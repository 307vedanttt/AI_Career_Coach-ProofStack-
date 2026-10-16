from abc import ABC, abstractmethod
from typing import Dict, List, Any, Tuple

class BaseDetector(ABC):
    name: str = "base_detector"
    version: str = "1.0.0"

    @abstractmethod
    def detect(
        self,
        files: Dict[str, str], # relative path -> file content
        requirement: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Detects code evidence for a requirement.
        Returns:
            (valid_candidates, rejected_candidates)
        """
        pass
