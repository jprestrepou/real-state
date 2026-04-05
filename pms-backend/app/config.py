"""
PMS Configuration — Pydantic BaseSettings
Loads from .env file or environment variables.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "Property Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./pms_prod.db"

    # ── JWT ──────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE-ME-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://real-state-1-2qpr.onrender.com",
        "https://real-state-xd5o.onrender.com"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return v

    # ── Uploads ──────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ── Redis / Celery (optional) ────────────────────────
    REDIS_URL: Optional[str] = None
    CELERY_BROKER_URL: Optional[str] = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
