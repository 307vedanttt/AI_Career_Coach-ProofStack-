import hashlib
import json
import os
import re
from typing import List, Dict, Any, Optional, Tuple
from backend.services.security import safe_fetch_url, SecurityError

TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "skills_taxonomy.json")

def load_taxonomy() -> Dict[str, Any]:
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def clean_html(html_text: str) -> str:
    """Strip tags and decode entities simply for plain text extraction."""
    # Remove script and style tags
    cleaned = re.sub(r"<(script|style).*?</\1>", "", html_text, flags=re.DOTALL | re.IGNORECASE)
    # Replace block tags with newlines
    cleaned = re.sub(r"</?(p|div|br|li|ul|ol|h[1-6]|tr|td)[^>]*>", "\n", cleaned, flags=re.IGNORECASE)
    # Remove remaining HTML tags
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    # Normalize whitespaces
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
    return "\n".join(lines)

def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences while preserving exact verbatim segments."""
    # Split by newlines or sentence endings
    raw_chunks = re.split(r"(?<=[.!?\n])\s+", text)
    sentences = []
    for chunk in raw_chunks:
        c = chunk.strip(" \t\r")
        if len(c) > 10:
            sentences.append(c)
    return sentences

class JobExtractor:
    def __init__(self):
        self.taxonomy = load_taxonomy()

    async def process_job_input(
        self,
        url: Optional[str] = None,
        description: Optional[str] = None,
        title: Optional[str] = None,
        company: Optional[str] = None
    ) -> Dict[str, Any]:
        source_type = "pasted"
        raw_text = ""
        source_url = None

        if url and url.strip():
            source_type = "url"
            source_url = url.strip()
            fetched_content = await safe_fetch_url(source_url)
            raw_text = clean_html(fetched_content)
        elif description and description.strip():
            source_type = "pasted"
            raw_text = description.strip()
        else:
            raise ValueError("Either 'url' or 'description' must be provided.")

        text_hash = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()
        summary = raw_text[:500] + ("..." if len(raw_text) > 500 else "")

        requirements = self.extract_requirements(raw_text)

        return {
            "title": title or "Software Engineering Role",
            "company": company or "Unknown Company",
            "source_type": source_type,
            "source_url": source_url,
            "text_hash": text_hash,
            "raw_text_summary": summary,
            "raw_text": raw_text,
            "requirements": requirements
        }

    def extract_requirements(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts structured requirements matching skills against the controlled taxonomy.
        Ensures exact verbatim quote validation against the input text.
        """
        sentences = split_into_sentences(text)
        requirements = []
        seen_canonical = set()

        # Preferred / Nice-to-have indicators
        preferred_patterns = [
            r"\b(nice to have|preferred|bonus|plus|ideal|optional|familiarity with|good to have)\b"
        ]

        for sentence in sentences:
            sentence_lower = sentence.lower()
            is_preferred = any(re.search(p, sentence_lower) for p in preferred_patterns)
            importance = "preferred" if is_preferred else "required"

            # Check each category and skill in taxonomy
            for cat_id, cat_info in self.taxonomy.get("categories", {}).items():
                cat_name = cat_info.get("display_name", cat_id)
                detector = cat_info.get("detector")
                assessable = cat_info.get("assessable", "code_assessable")

                for skill_key, skill_meta in cat_info.get("skills", {}).items():
                    canonical_id = skill_meta["canonical_id"]
                    if canonical_id in seen_canonical:
                        continue

                    # Match any alias with word boundary
                    for alias in skill_meta.get("aliases", []):
                        pattern = r"\b" + re.escape(alias.lower()) + r"\b"
                        if re.search(pattern, sentence_lower):
                            # Validate verbatim match
                            verbatim_quote = self._find_exact_verbatim_quote(text, sentence)
                            if not verbatim_quote:
                                continue

                            requirements.append({
                                "canonical_id": canonical_id,
                                "label": skill_meta["label"],
                                "category": cat_name,
                                "importance": importance,
                                "exact_quote": verbatim_quote,
                                "assessable": assessable,
                                "detector_name": detector,
                                "user_status": "active",
                                "notes": None
                            })
                            seen_canonical.add(canonical_id)
                            break

        return requirements

    def _find_exact_verbatim_quote(self, full_text: str, candidate_quote: str) -> Optional[str]:
        """Validates that candidate_quote exists verbatim in full_text."""
        if candidate_quote in full_text:
            return candidate_quote
        # If slight whitespace differences, find the exact slice
        norm_candidate = " ".join(candidate_quote.split())
        words = norm_candidate.split()
        if not words:
            return None
        pattern = r"\s+".join(re.escape(w) for w in words)
        match = re.search(pattern, full_text)
        if match:
            return match.group(0)
        return None

job_extractor = JobExtractor()
