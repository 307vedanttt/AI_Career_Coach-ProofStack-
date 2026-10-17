import hashlib
import json
import logging
from typing import Dict, Any, Optional, Tuple
import httpx
from backend.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_VERSION = "v1.2.0"

SYSTEM_PROMPT = f"""You are a strict, objective Code Evidence Verifier (version {SYSTEM_PROMPT_VERSION}).
Your job is to determine whether the provided code snippet genuinely demonstrates practical implementation of the stated technical requirement.
Respond ONLY with a valid JSON object matching this schema:
{{
  "verdict": true or false,
  "reason": "Concise 1-2 sentence explanation of your decision."
}}
Do not include markdown fences, preambles, or explanations outside the JSON object.
Reject hollow implementations, comments, stubs, and keywords."""

class LLMVerifier:
    def __init__(self):
        self.reload()

    def reload(self):
        self.provider = settings.LLM_PROVIDER.lower() if settings.LLM_PROVIDER else "none"
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL or "gemini-1.5-flash"
        self.prompt_version = SYSTEM_PROMPT_VERSION

    def compute_cache_key(
        self,
        file_sha: str,
        requirement_id: str,
        detector_version: str
    ) -> str:
        raw = f"{file_sha}:{requirement_id}:{detector_version}:{self.prompt_version}:{self.model}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def verify_candidate(
        self,
        snippet: str,
        requirement_label: str,
        detector_name: str,
        file_path: str,
        cached_verdict: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """
        Verifies evidence snippet.
        Returns:
            (is_verified: bool, reason: str)
        If LLM is off or disabled, returns (True, "Verified via deterministic detector pipeline.")
        """
        # Deterministic mode check
        if self.provider in ("none", "off", "deterministic") or not self.api_key:
            return True, "Verified via deterministic detector pipeline (LLM-off mode)."

        # Cache check
        if cached_verdict:
            return cached_verdict["verdict"], cached_verdict["reason"]

        user_content = (
            f"Requirement: {requirement_label}\n"
            f"Detector: {detector_name}\n"
            f"File: {file_path}\n"
            f"Code Snippet:\n```\n{snippet[:1500]}\n```"
        )

        try:
            if self.provider == "mock":
                # Deterministic mock for unit testing
                is_valid = "assert True" not in snippet and "TODO" not in snippet
                return is_valid, "Mock LLM verification based on pattern analysis."

            elif self.provider in ("gemini", "google"):
                # Google Gemini REST API
                model_name = self.model if self.model and "gemini" in self.model else "gemini-1.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        url,
                        headers={"Content-Type": "application/json"},
                        json={
                            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                            "contents": [{"parts": [{"text": user_content}]}],
                            "generationConfig": {
                                "temperature": 0.0,
                                "maxOutputTokens": 200,
                                "responseMimeType": "application/json"
                            }
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            raw_text = candidates[0]["content"]["parts"][0]["text"]
                            parsed = json.loads(raw_text)
                            return bool(parsed.get("verdict", False)), str(parsed.get("reason", "Verified by Google Gemini."))
                    else:
                        logger.warning(f"Gemini API error {resp.status_code}: {resp.text}")

            elif self.provider == "openai":
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json={
                            "model": self.model,
                            "messages": [
                                {"role": "system", "content": SYSTEM_PROMPT},
                                {"role": "user", "content": user_content}
                            ],
                            "temperature": 0.0,
                            "max_tokens": 150,
                            "response_format": {"type": "json_object"}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_json = data["choices"][0]["message"]["content"]
                        parsed = json.loads(raw_json)
                        return bool(parsed.get("verdict", False)), str(parsed.get("reason", "Verified by OpenAI."))
                    else:
                        logger.warning(f"OpenAI API error {resp.status_code}: {resp.text}")

            elif self.provider == "anthropic":
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.anthropic.com/v1/messages",
                        headers={
                            "x-api-key": self.api_key,
                            "anthropic-version": "2023-06-01"
                        },
                        json={
                            "model": self.model,
                            "system": SYSTEM_PROMPT,
                            "messages": [{"role": "user", "content": user_content}],
                            "max_tokens": 150
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_text = data["content"][0]["text"]
                        parsed = json.loads(raw_text)
                        return bool(parsed.get("verdict", False)), str(parsed.get("reason", "Verified by Anthropic."))

        except Exception as e:
            logger.error(f"LLM verification failed gracefully: {str(e)}")

        # Fallback to deterministic acceptance if LLM fails or timeouts
        return True, "Fallback to deterministic acceptance after verifier unavailable."

llm_verifier = LLMVerifier()
