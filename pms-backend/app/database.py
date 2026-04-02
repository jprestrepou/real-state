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


async def _migrate_missing_columns(conn) -> None:
    """
    SQLite-safe migration: adds any columns present in the model but missing
    from the actual DB table. Uses PRAGMA table_info + ALTER TABLE ADD COLUMN.
    Safe to run multiple times (idempotent).
    """
    if not _is_sqlite:
        return  # PostgreSQL handles this via Alembic

    from sqlalchemy import text

    for table in Base.metadata.sorted_tables:
        result = await conn.execute(text(f"PRAGMA table_info({table.name})"))
        existing_cols = {row[1] for row in result.fetchall()}

        for col in table.columns:
            if col.name not in existing_cols:
                # Build a safe default clause
                col_type = col.type.compile(dialect=conn.dialect)
                nullable = "" if col.nullable else " NOT NULL"
                default_clause = ""
                if col.default is not None and col.default.is_scalar:
                    val = col.default.arg
                    if isinstance(val, str):
                        default_clause = f" DEFAULT '{val}'"
                    elif isinstance(val, bool):
                        default_clause = f" DEFAULT {1 if val else 0}"
                    elif val is not None:
                        default_clause = f" DEFAULT {val}"
                elif col.nullable:
                    default_clause = " DEFAULT NULL"
                else:
                    # NOT NULL without default — add a safe default so ALTER doesn't fail
                    default_clause = " DEFAULT ''"

                sql = f"ALTER TABLE {table.name} ADD COLUMN {col.name} {col_type}{default_clause}"
                try:
                    await conn.execute(text(sql))
                    import logging
                    logging.getLogger("pms-backend").info(
                        f"Migration: added column '{col.name}' to table '{table.name}'"
                    )
                except Exception as exc:
                    import logging
                    logging.getLogger("pms-backend").warning(
                        f"Migration skipped '{col.name}' on '{table.name}': {exc}"
                    )


async def init_db():
    """Create all tables and apply any missing column migrations."""
    import app.models  # noqa: F401 — ensure models are imported
    import sqlalchemy.exc
    import asyncio
    import logging

    max_retries = 5
    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                await _migrate_missing_columns(conn)
            break
        except sqlalchemy.exc.OperationalError as e:
            error_str = str(e).lower()
            if "already exists" in error_str:
                logging.getLogger("pms-backend").info(
                    "Database table already exists (likely created by another worker). Safely bypassing database initialization for this worker."
                )
                break
            elif "database is locked" in error_str or "disk i/o error" in error_str:
                logging.getLogger("pms-backend").warning(
                    f"Database locked, retrying initialization attempt ({attempt + 1}/{max_retries})..."
                )
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(1 + attempt)
            else:
                raise
