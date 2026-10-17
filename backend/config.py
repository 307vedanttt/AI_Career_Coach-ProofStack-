import os
from pydantic import BaseModel, Field
from typing import Optional

class Settings(BaseModel):
    # App
    APP_NAME: str = "ProofStack — AI Career Coach"
    APP_VERSION: str = "4.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1")
    RUN_MODE: str = os.getenv("RUN_MODE", "deterministic") # deterministic or llm_assisted
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./proofstack.db")
    
    # Secrets & Security
    APP_SESSION_SECRET: str = os.getenv("APP_SESSION_SECRET", "proofstack_development_session_secret_32bytes_min")
    APP_ENC_KEY: str = os.getenv("APP_ENC_KEY", "proofstack_development_encryption_key_32b!")
    
    # GitHub Integration & OAuth
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN", None)
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID", None)
    GITHUB_CLIENT_SECRET: Optional[str] = os.getenv("GITHUB_CLIENT_SECRET", None)
    GITHUB_REDIRECT_URI: Optional[str] = os.getenv("GITHUB_REDIRECT_URI", None)
    GITHUB_WEBHOOK_SECRET: str = os.getenv("GITHUB_WEBHOOK_SECRET", "dev_webhook_secret_key_proofstack")
    
    # Polling & Concurrency
    POLL_INTERVAL_SECONDS: int = int(os.getenv("POLL_INTERVAL_SECONDS", "60"))
    DEBOUNCE_SECONDS: int = int(os.getenv("DEBOUNCE_SECONDS", "5"))
    MAX_FILE_BYTES: int = int(os.getenv("MAX_FILE_BYTES", str(2 * 1024 * 1024))) # 2MB limit
    
    # LLM Settings (optional provider-agnostic verifier)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", None)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "none") # none, gemini, openai, anthropic, mock
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY", None)
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    FALLBACK_LLM_PROVIDER: Optional[str] = os.getenv("FALLBACK_LLM_PROVIDER", None)
    FALLBACK_LLM_API_KEY: Optional[str] = os.getenv("FALLBACK_LLM_API_KEY", None)
    FALLBACK_LLM_MODEL: Optional[str] = os.getenv("FALLBACK_LLM_MODEL", None)

settings = Settings()

# Auto-detect API key if LLM_API_KEY is not set
if not settings.LLM_API_KEY:
    if settings.GEMINI_API_KEY:
        settings.LLM_API_KEY = settings.GEMINI_API_KEY
        if settings.LLM_PROVIDER in ("none", ""):
            settings.LLM_PROVIDER = "gemini"
            settings.LLM_MODEL = "gemini-1.5-flash"
    elif settings.OPENAI_API_KEY:
        settings.LLM_API_KEY = settings.OPENAI_API_KEY
        if settings.LLM_PROVIDER in ("none", ""):
            settings.LLM_PROVIDER = "openai"
            settings.LLM_MODEL = "gpt-4o-mini"
    elif settings.ANTHROPIC_API_KEY:
        settings.LLM_API_KEY = settings.ANTHROPIC_API_KEY
        if settings.LLM_PROVIDER in ("none", ""):
            settings.LLM_PROVIDER = "anthropic"
            settings.LLM_MODEL = "claude-3-5-sonnet-20241022"

if settings.LLM_API_KEY and settings.LLM_PROVIDER != "none":
    settings.RUN_MODE = "llm_assisted"

