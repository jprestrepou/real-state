"""
PMS Database — SQLAlchemy Engine + Session + Base
Supports PostgreSQL (production) and SQLite (development).
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import event
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


# ── Detect SQLite vs PostgreSQL ──────────────────────────
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# Adjust URL for async driver
if _is_sqlite:
    async_database_url = settings.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
elif settings.DATABASE_URL.startswith("postgres://"):
    # Fix for Render/Heroku postgres URLs + asyncpg
    async_database_url = settings.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif settings.DATABASE_URL.startswith("postgresql://"):
    async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    async_database_url = settings.DATABASE_URL

_connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_async_engine(
    async_database_url,
    connect_args=_connect_args,
    echo=settings.DEBUG,
    future=True,
)

# Enable WAL mode and foreign keys for SQLite
if _is_sqlite:
    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False, autocommit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def init_db():
    """Create all tables (dev only — use Alembic in prod)."""
    import app.models  # noqa: F401 — ensure models are imported
    Base.metadata.create_all(bind=engine.sync_engine)
