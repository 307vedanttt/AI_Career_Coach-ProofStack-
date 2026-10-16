import os
from pydantic import BaseModel, Field
from typing import Optional

class Settings(BaseModel):
    # App
    APP_NAME: str = "ProofStack — AI Career Coach"
    APP_VERSION: str = "4.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1")
    RUN_MODE: str = os.getenv("RUN_MODE", "deterministic") # deterministic or llm_assisted
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./proofstack.db")
    
    # Secrets & Security
    APP_SESSION_SECRET: str = os.getenv("APP_SESSION_SECRET", "proofstack_development_session_secret_32bytes_min")
    APP_ENC_KEY: str = os.getenv("APP_ENC_KEY", "proofstack_development_encryption_key_32b!")
    
    # GitHub Integration
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN", None)
    GITHUB_WEBHOOK_SECRET: str = os.getenv("GITHUB_WEBHOOK_SECRET", "dev_webhook_secret_key_proofstack")
    
    # Polling & Concurrency
    POLL_INTERVAL_SECONDS: int = int(os.getenv("POLL_INTERVAL_SECONDS", "60"))
    DEBOUNCE_SECONDS: int = int(os.getenv("DEBOUNCE_SECONDS", "5"))
    MAX_FILE_BYTES: int = int(os.getenv("MAX_FILE_BYTES", str(2 * 1024 * 1024))) # 2MB limit
    
    # LLM Settings (optional provider-agnostic verifier)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "none") # none, openai, anthropic, mock
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY", None)
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    FALLBACK_LLM_PROVIDER: Optional[str] = os.getenv("FALLBACK_LLM_PROVIDER", None)
    FALLBACK_LLM_API_KEY: Optional[str] = os.getenv("FALLBACK_LLM_API_KEY", None)
    FALLBACK_LLM_MODEL: Optional[str] = os.getenv("FALLBACK_LLM_MODEL", None)

settings = Settings()
