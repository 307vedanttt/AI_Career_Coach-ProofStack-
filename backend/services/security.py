import ipaddress
import socket
import hmac
import hashlib
import re
from urllib.parse import urlparse
import httpx
from typing import Tuple, Optional
from backend.config import settings

# Blocked IP networks for SSRF protection
BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"), # Cloud metadata / Link-local
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.88.99.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"), # Multicast
    ipaddress.ip_network("240.0.0.0/4"),
    ipaddress.ip_network("255.255.255.255/32"),
    # IPv6 blocked
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("::1/128"), # Loopback
    ipaddress.ip_network("::ffff:0:0/96"), # IPv4-mapped IPv6
    ipaddress.ip_network("100::/64"),
    ipaddress.ip_network("2001:db8::/32"),
    ipaddress.ip_network("fc00::/7"), # Unique local address
    ipaddress.ip_network("fe80::/10"), # Link-local
    ipaddress.ip_network("ff00::/8"), # Multicast
]

CLOUD_METADATA_HOSTS = {
    "169.254.169.254",
    "metadata.google.internal",
    "metadata",
    "instance-data",
}

class SecurityError(Exception):
    pass

def validate_url_safe(url: str) -> Tuple[bool, Optional[str]]:
    """
    Strictly validates that a URL is safe to fetch and not an SSRF attempt.
    Returns (is_safe, error_message).
    """
    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, f"Invalid URL format: {str(e)}"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Scheme '{parsed.scheme}' not allowed. Only HTTP and HTTPS are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "URL must include a valid hostname."

    hostname_lower = hostname.lower()
    if hostname_lower in CLOUD_METADATA_HOSTS or hostname_lower.endswith(".internal") or hostname_lower.endswith(".local"):
        return False, f"Hostname '{hostname}' is blocked as internal or metadata target."

    try:
        # Resolve all addresses for the hostname
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False, f"Could not resolve hostname '{hostname}'."
    except Exception as e:
        return False, f"DNS resolution error for '{hostname}': {str(e)}"

    for entry in addr_info:
        ip_str = entry[4][0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            for network in BLOCKED_NETWORKS:
                if ip_obj in network:
                    return False, f"Resolved IP {ip_str} belongs to blocked or private network {network}."
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast:
                return False, f"Resolved IP {ip_str} is reserved, private, or loopback."
        except ValueError:
            return False, f"Invalid IP address format: {ip_str}"

    return True, None

async def safe_fetch_url(url: str, max_bytes: int = 2 * 1024 * 1024, max_redirects: int = 3, timeout_sec: float = 10.0) -> str:
    """
    Fetches a URL safely with:
    - SSRF pre-check and redirect IP revalidation
    - Max redirects limit (3)
    - Request timeout (10s)
    - Response size limit (2MB)
    - HTML or plain text validation
    """
    current_url = url
    redirect_count = 0

    async with httpx.AsyncClient(follow_redirects=False, timeout=timeout_sec) as client:
        while True:
            is_safe, error = validate_url_safe(current_url)
            if not is_safe:
                raise SecurityError(f"SSRF safety check failed: {error}")

            try:
                response = await client.get(current_url, headers={"User-Agent": "ProofStack-JobFetcher/1.0"})
            except Exception as e:
                raise SecurityError(f"Network error while fetching URL: {str(e)}")

            if response.is_redirect or response.status_code in (301, 302, 303, 307, 308):
                redirect_count += 1
                if redirect_count > max_redirects:
                    raise SecurityError(f"Too many redirects (exceeded limit of {max_redirects}).")
                location = response.headers.get("Location")
                if not location:
                    raise SecurityError("Redirect response missing Location header.")
                # Resolve relative redirects
                current_url = str(httpx.URL(current_url).join(location))
                continue

            if response.status_code >= 400:
                raise SecurityError(f"HTTP {response.status_code} error from remote server.")

            content_type = response.headers.get("content-type", "").lower()
            if not any(t in content_type for t in ("text/html", "text/plain", "application/xhtml+xml")):
                raise SecurityError(f"Unsupported content type: {content_type}. Only HTML and text allowed.")

            content = response.content
            if len(content) > max_bytes:
                raise SecurityError(f"Response size {len(content)} bytes exceeds maximum {max_bytes} bytes.")

            return response.text

def verify_github_webhook_signature(payload_bytes: bytes, signature_header: Optional[str], secret: str) -> bool:
    """
    Verifies GitHub webhook HMAC-SHA256 signature using constant-time comparison.
    """
    if not signature_header:
        return False
    
    parts = signature_header.split("=")
    if len(parts) != 2 or parts[0].strip() != "sha256":
        return False

    expected_hash = parts[1].strip()
    mac = hmac.new(secret.encode("utf-8"), msg=payload_bytes, digestmod=hashlib.sha256)
    computed_hash = mac.hexdigest()

    return hmac.compare_digest(computed_hash, expected_hash)

def redact_sensitive(text: str) -> str:
    """
    Redacts tokens, API keys, and authorization headers from logs.
    """
    if not text:
        return text
    # Redact common token patterns: ghp_*, sk-*, Bearer *
    redacted = re.sub(r"(ghp_[a-zA-Z0-9]{20,})", "ghp_***REDACTED***", text)
    redacted = re.sub(r"(sk-[a-zA-Z0-9]{20,})", "sk-***REDACTED***", redacted)
    redacted = re.sub(r"(Bearer\s+)[a-zA-Z0-9\-_\.]+", r"\1***REDACTED***", redacted)
    return redacted
