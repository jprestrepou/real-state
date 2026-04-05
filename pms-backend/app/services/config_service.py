"""
Configuration Service — Logic for database-backed configuration with environment fallbacks.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.models.config import GlobalConfig
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def get_all_configs(db: AsyncSession) -> List[GlobalConfig]:
    """Get all configuration entries from the DB."""
    stmt = select(GlobalConfig)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_config_value(db: AsyncSession, key: str, default: Any = None) -> Any:
    """
    Get a configuration value.
    Priority:
    1. Database (GlobalConfig)
    2. Environment (settings)
    3. Default value
    """
    # 1. Check Database
    stmt = select(GlobalConfig.value).where(GlobalConfig.key == key)
    result = await db.execute(stmt)
    val = result.scalar_one_or_none()
    
    if val is not None:
        return val
        
    # 2. Check Environment (settings)
    # We try to match the key as-is or in uppercase (common for env)
    env_val = getattr(settings, key, getattr(settings, key.upper(), None))
    if env_val is not None:
        return env_val
        
    # 3. Fallback to default
    return default

async def update_config(db: AsyncSession, key: str, value: str, category: str = "GENERAL", description: str = None) -> GlobalConfig:
    """Create or update a configuration entry."""
    stmt = select(GlobalConfig).where(GlobalConfig.key == key)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if config:
        config.value = value
        if description:
            config.description = description
    else:
        config = GlobalConfig(
            key=key,
            value=value,
            category=category,
            description=description
        )
        db.add(config)
        
    await db.commit()
    await db.refresh(config)
    return config

async def batch_update_configs(db: AsyncSession, updates: Dict[str, str]) -> List[GlobalConfig]:
    """Update multiple configurations at once."""
    results = []
    for key, value in updates.items():
        res = await update_config(db, key, value)
        results.append(res)
    return results

async def get_telegram_config(db: AsyncSession) -> Dict[str, Any]:
    """Helper to get Telegram settings."""
    return {
        "token": await get_config_value(db, "TELEGRAM_BOT_TOKEN"),
    }
