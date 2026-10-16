from backend.services.detectors.base import BaseDetector
from backend.services.detectors.api_detector import APIDetector
from backend.services.detectors.sql_detector import SQLDetector
from backend.services.detectors.testing_detector import TestingDetector
from backend.services.detectors.cicd_detector import CICDDetector
from backend.services.detectors.generic_detector import GenericDetector

DETECTOR_REGISTRY = {
    "api_detector": APIDetector(),
    "sql_detector": SQLDetector(),
    "testing_detector": TestingDetector(),
    "cicd_detector": CICDDetector(),
    "generic_detector": GenericDetector()
}

def get_detector(name: str) -> BaseDetector:
    return DETECTOR_REGISTRY.get(name, DETECTOR_REGISTRY["generic_detector"])
