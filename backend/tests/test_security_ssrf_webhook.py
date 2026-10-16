import hmac
import hashlib
import pytest
from backend.services.security import (
    validate_url_safe, verify_github_webhook_signature, redact_sensitive, SecurityError
)
from backend.services.webhook_service import webhook_service

def test_ssrf_blocking_private_and_metadata_ips():
    # Loopback
    is_safe, err = validate_url_safe("http://127.0.0.1:8000/internal")
    assert not is_safe
    assert "blocked" in err.lower() or "private" in err.lower()

    # Cloud metadata
    is_safe, err = validate_url_safe("http://169.254.169.254/latest/meta-data")
    assert not is_safe

    is_safe, err = validate_url_safe("http://metadata.google.internal/computeMetadata/v1")
    assert not is_safe

    # Non-HTTP schemes
    is_safe, err = validate_url_safe("file:///etc/passwd")
    assert not is_safe
    assert "scheme" in err.lower()

    is_safe, err = validate_url_safe("gopher://127.0.0.1:6379")
    assert not is_safe

def test_webhook_signature_verification():
    secret = "my_secret_token_123"
    payload = b'{"action":"push","ref":"refs/heads/main"}'

    # Compute valid signature
    mac = hmac.new(secret.encode("utf-8"), msg=payload, digestmod=hashlib.sha256).hexdigest()
    valid_header = f"sha256={mac}"

    assert verify_github_webhook_signature(payload, valid_header, secret) is True
    # Forged header
    assert verify_github_webhook_signature(payload, "sha256=invalidhashvalue000", secret) is False
    # Missing header
    assert verify_github_webhook_signature(payload, None, secret) is False

def test_webhook_service_processing():
    secret = "webhook_secret_key_test"
    payload = b'{"ref":"refs/heads/main","head_commit":{"id":"abc123456789"},"repository":{"name":"demo","owner":{"login":"alice"}}}'
    mac = hmac.new(secret.encode("utf-8"), msg=payload, digestmod=hashlib.sha256).hexdigest()
    header = f"sha256={mac}"

    delivery_id = "deliv_unique_001"
    ok, msg, data = webhook_service.process_github_webhook(
        payload_bytes=payload,
        signature_header=header,
        event_type="push",
        delivery_id=delivery_id,
        secret=secret
    )
    assert ok is True
    assert data["commit_sha"] == "abc123456789"
    assert data["owner"] == "alice"

    # Replay prevention with duplicate delivery ID
    ok2, msg2, data2 = webhook_service.process_github_webhook(
        payload_bytes=payload,
        signature_header=header,
        event_type="push",
        delivery_id=delivery_id,
        secret=secret
    )
    assert ok2 is False
    assert "duplicate" in msg2.lower()

def test_secret_redaction():
    text = "Connecting to GitHub with token ghp_12345678901234567890abcdef and OpenAI sk-abc12345678901234567890"
    redacted = redact_sensitive(text)
    assert "ghp_123456" not in redacted
    assert "ghp_***REDACTED***" in redacted
    assert "sk-abc123" not in redacted
    assert "sk-***REDACTED***" in redacted
