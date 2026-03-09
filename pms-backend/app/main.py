"""
PMS Main — FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db

import os


# ── Setup Logging ────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pms-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    # ── Startup ──────────────────────────────────────────
    init_db()

    # Create upload directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "invoices"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok=True)

    yield
    # ── Shutdown ─────────────────────────────────────────


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema Integral de Gestión Inmobiliaria",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global Exception Handlers ──────────────────────────────
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Error en la base de datos. Por favor contacte al administrador."},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Ocurrió un error inesperado: {str(exc)}"},
    )

# ── Static files (uploads) ──────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers ──────────────────────────────────────────────
from app.routers import auth, users, properties, financial, maintenance, contracts, budgets, contacts, assets, inspections, occupants, work_groups, audits, telegram, insurance  # noqa: E402

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(properties.router, prefix=API_PREFIX)
app.include_router(financial.router, prefix=API_PREFIX)
app.include_router(maintenance.router, prefix=API_PREFIX)
app.include_router(contracts.router, prefix=API_PREFIX)
app.include_router(budgets.router, prefix=API_PREFIX)
app.include_router(contacts.router, prefix=API_PREFIX)
app.include_router(assets.router, prefix=API_PREFIX)
app.include_router(inspections.router, prefix=API_PREFIX)
app.include_router(occupants.router, prefix=API_PREFIX)
app.include_router(work_groups.router, prefix=API_PREFIX)
app.include_router(audits.router, prefix=API_PREFIX)
app.include_router(telegram.router, prefix=API_PREFIX)
app.include_router(insurance.router, prefix=API_PREFIX)


# ── Health check ─────────────────────────────────────────
@app.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
