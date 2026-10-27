import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from backend.config import settings
from backend.db.session import init_db
from backend.api.routes import router as api_router
from backend.api.enterprise_routes import router as enterprise_router

import logging

logger = logging.getLogger("proofstack.startup")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

def verify_environment_and_log():
    """Verify env loading, log presence/absence without values, and fail fast if invalid."""
    required_vars = {
        "DATABASE_URL": settings.DATABASE_URL,
        "APP_SESSION_SECRET": settings.APP_SESSION_SECRET,
        "APP_ENC_KEY": settings.APP_ENC_KEY,
        "PUBLIC_BASE_URL": settings.PUBLIC_BASE_URL,
    }
    missing = [k for k, v in required_vars.items() if not v]
    if missing:
        raise RuntimeError(f"CRITICAL STARTUP ERROR: Missing required environment variable(s): {', '.join(missing)}")

    # Fail fast on insecure default security keys in production
    if settings.ENVIRONMENT == "production":
        if not settings.APP_SESSION_SECRET or settings.APP_SESSION_SECRET in ("proofstack_development_session_secret_32bytes_min", "dev_session_secret_change_in_production_32b!"):
            raise RuntimeError("CRITICAL STARTUP ERROR: In production, APP_SESSION_SECRET must be set to a secure unique secret (min 32 bytes).")
        if not settings.APP_ENC_KEY or settings.APP_ENC_KEY in ("proofstack_development_encryption_key_32b!", "dev_encryption_key_change_in_prod_32b!"):
            raise RuntimeError("CRITICAL STARTUP ERROR: In production, APP_ENC_KEY must be set to a secure unique encryption key (32 bytes).")
        if not settings.GITHUB_WEBHOOK_SECRET or "dev_" in settings.GITHUB_WEBHOOK_SECRET:
            raise RuntimeError("CRITICAL STARTUP ERROR: In production, GITHUB_WEBHOOK_SECRET must be configured with a production secret.")

    logger.info("=== PROOFSTACK ENVIRONMENT CONFIGURATION ===")
    logger.info(f"ENVIRONMENT: {settings.ENVIRONMENT}")
    logger.info(f"DATABASE_URL: {'PRESENT' if settings.DATABASE_URL else 'MISSING'}")
    logger.info(f"PUBLIC_BASE_URL: {'PRESENT' if settings.PUBLIC_BASE_URL else 'MISSING'}")
    logger.info(f"APP_SESSION_SECRET: {'PRESENT' if settings.APP_SESSION_SECRET else 'MISSING'}")
    logger.info(f"APP_ENC_KEY: {'PRESENT' if settings.APP_ENC_KEY else 'MISSING'}")
    logger.info(f"GITHUB_TOKEN: {'CONFIGURED' if settings.GITHUB_TOKEN else 'UNCONFIGURED (unauthenticated 60 req/hr)'}")
    logger.info(f"GITHUB_CLIENT_ID: {'CONFIGURED' if settings.GITHUB_CLIENT_ID else 'UNCONFIGURED'}")
    logger.info(f"GITHUB_CLIENT_SECRET: {'CONFIGURED' if settings.GITHUB_CLIENT_SECRET else 'UNCONFIGURED'}")
    logger.info(f"GITHUB_WEBHOOK_SECRET: {'CONFIGURED' if settings.GITHUB_WEBHOOK_SECRET else 'UNCONFIGURED'}")
    logger.info(f"LLM_PROVIDER: {settings.LLM_PROVIDER}")
    logger.info(f"LLM_API_KEY: {'CONFIGURED' if settings.LLM_API_KEY else 'UNCONFIGURED'}")
    logger.info(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    logger.info("============================================")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify env and initialize database schemas in SQLite WAL mode
    verify_environment_and_log()
    await init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Deterministic Evidence Engine & Commit Contracts for Engineering Roles",
    lifespan=lifespan
)

# CORS middleware (restricted to development frontend origins; never allow wildcard with credentials)
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)
if settings.PUBLIC_BASE_URL and settings.PUBLIC_BASE_URL not in allowed_origins:
    allowed_origins.append(settings.PUBLIC_BASE_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

import secrets
from fastapi import Request
from fastapi.responses import JSONResponse
from backend.services.security import verify_csrf_token, redact_sensitive

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler preventing stack traces, schema details, or server paths
    from leaking to external clients. Sensitive tokens are redacted in logs.
    """
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    
    incident_id = secrets.token_hex(8)
    err_msg = redact_sensitive(str(exc))
    logger.error(
        f"[SECURITY/UNHANDLED_EXCEPTION] [Incident: {incident_id}] "
        f"{request.method} {request.url.path} - Error: {err_msg}",
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. The incident has been logged securely.",
            "incident_id": incident_id
        }
    )

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    # Defense-in-depth security headers on every route (API, UI, and errors)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self'; "
        "font-src 'self'; "
        "img-src 'self' data: https://github.com https://avatars.githubusercontent.com; "
        "connect-src 'self' ws: wss:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

@app.middleware("http")
async def csrf_protect_middleware(request: Request, call_next):
    # Only enforce on state-changing methods: POST, PUT, PATCH, DELETE
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        path = request.url.path
        # Exclude public webhooks, demo pushes, dev login, and public scanners from CSRF
        # Settings endpoints (/api/settings) MUST require CSRF verification
        exempt_prefixes = (
            "/webhooks",
            "/api/webhooks",
            "/api/demo",
            "/demo",
            "/api/scanner/run",
            "/scanner/run",
            "/api/auth/dev-login",
            "/auth/dev-login",
            "/api/auth/api-key",
            "/auth/api-key",
            "/api/check-now",
            "/check-now",
            "/api/resume/upload",
            "/resume/upload",
            "/api/resume",
            "/resume",
            "/api/repos",
            "/repos",
            "/api/organizations",
            "/organizations",
            "/api/candidates",
            "/candidates",
        )
        if not any(path.startswith(prefix) for prefix in exempt_prefixes):
            csrf_cookie = request.cookies.get("ps_csrf_token")
            csrf_header = request.headers.get("X-CSRF-Token") or request.headers.get("x-csrf-token")
            
            # Double-submit cookie verification
            if not csrf_cookie or not csrf_header or not verify_csrf_token(csrf_cookie, csrf_header):
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF verification failed: missing or mismatched token"}
                )
    return await call_next(request)

# Include API routes
app.include_router(api_router, prefix="/api")
app.include_router(enterprise_router, prefix="/api")
# Direct webhook and auth path support
app.include_router(api_router, prefix="")
app.include_router(enterprise_router, prefix="")

# Serve Production Frontend if dist directory exists (same-origin cookie & session support)
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    fonts_dir = os.path.join(dist_dir, "fonts")
    if os.path.exists(fonts_dir):
        app.mount("/fonts", StaticFiles(directory=fonts_dir), name="fonts")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(dist_dir, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa_route(full_path: str):
        # Exclude backend and doc routes from SPA catch-all
        if full_path.startswith(("api", "auth", "webhooks", "docs", "openapi.json", "redoc")):
            raise HTTPException(status_code=404, detail="Not Found")
        
        target_file = os.path.join(dist_dir, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "online",
            "docs_url": "/docs",
            "health_url": "/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
