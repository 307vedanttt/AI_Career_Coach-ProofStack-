import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from backend.config import settings
from backend.db.session import init_db
from backend.api.routes import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database schemas and SQLite WAL mode
    await init_db()
    yield
    # Shutdown logic if needed

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
if settings.PUBLIC_BASE_URL and settings.PUBLIC_BASE_URL not in allowed_origins:
    allowed_origins.append(settings.PUBLIC_BASE_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
from backend.services.security import verify_csrf_token

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
        # Exclude webhooks (which verify HMAC signatures)
        if not (path.startswith("/webhooks") or path.startswith("/api/webhooks")):
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
# Direct webhook and auth path support
app.include_router(api_router, prefix="")

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
