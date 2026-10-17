import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import event, text
from backend.config import settings
from backend.models.models import Base

# Ensure SQLite parent directory exists
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite+aiosqlite:///"):
    db_path = db_url.replace("sqlite+aiosqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    connect_args={"check_same_thread": False, "timeout": 30} if "sqlite" in settings.DATABASE_URL else {}
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def init_db():
    """Initialize database schemas and set SQLite WAL mode for concurrency."""
    async with engine.begin() as conn:
        # Enable WAL mode for SQLite
        if "sqlite" in settings.DATABASE_URL:
            await conn.execute(text("PRAGMA journal_mode=WAL;"))
            await conn.execute(text("PRAGMA synchronous=NORMAL;"))
            await conn.execute(text("PRAGMA foreign_keys=ON;"))
        await conn.run_sync(Base.metadata.create_all)
        if "sqlite" in settings.DATABASE_URL:
            cols = [
                ("repositories", "last_synced_at", "DATETIME"),
                ("repositories", "last_sync_trigger", "VARCHAR"),
                ("commit_contracts", "acceptance_checks_json", "TEXT"),
                ("commit_contracts", "must_not_move_json", "TEXT"),
                ("commit_contracts", "effort_class", "VARCHAR(50)"),
                ("commit_contracts", "ci_status", "VARCHAR(50)"),
                ("commit_contracts", "adjudication_json", "TEXT"),
                ("commit_contracts", "task_description", "TEXT"),
                ("commit_contracts", "suggested_file_path", "VARCHAR(512)"),
                ("commit_contracts", "recommendation_skeleton", "TEXT"),
                ("commit_contracts", "gain_arithmetic", "TEXT"),
                ("rejected_candidates", "detector", "VARCHAR(100)"),
                ("rejected_candidates", "detector_version", "VARCHAR(50)"),
                ("rejected_candidates", "guard_reason", "TEXT"),
            ]
            for tbl, col, col_type in cols:
                try:
                    await conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_type};"))
                except Exception:
                    pass

async def get_db():
    """Dependency for obtaining async db sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
