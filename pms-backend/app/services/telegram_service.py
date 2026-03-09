"""
Telegram Bot Service for alerts and basic maintenance photo ingestion.
"""
import os
import logging
from typing import Dict, Any, Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.maintenance import MaintenanceOrder, MaintenanceSource, MaintenanceStatus
from app.services import config_service

logger = logging.getLogger(__name__)


class TelegramService:
    @classmethod
    async def get_base_url(cls, db: AsyncSession) -> str:
        conf = await config_service.get_telegram_config(db)
        token = conf["token"]
        return f"https://api.telegram.org/bot{token}"

    @classmethod
    async def send_message(cls, db: AsyncSession, chat_id: str, text: str) -> Optional[Dict[str, Any]]:
        """Sends a text message to a specific Telegram chat_id."""
        base_url = await cls.get_base_url(db)
        if "/botNone" in base_url or "/bot" == base_url:
            logger.warning("TELEGRAM_BOT_TOKEN not set, skipping message.")
            return None
            
        url = f"{base_url}/sendMessage"
        payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Failed to send telegram message: {e}")
                return None

    @classmethod
    async def set_webhook(cls, db: AsyncSession, webhook_url: str) -> bool:
        """Configures the webhook URL for the bot."""
        base_url = await cls.get_base_url(db)
        if "/botNone" in base_url or "/bot" == base_url:
            return False
            
        url = f"{base_url}/setWebhook"
        payload = {"url": webhook_url}
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload)
                return response.status_code == 200
            except httpx.HTTPError as e:
                logger.error(f"Telegram webhook error: {e}")
                return False
        return False

    @classmethod
    async def process_update(cls, db: AsyncSession, update: Dict[str, Any]):
        """
        Process incoming Telegram update.
        Handles text messages for maintenance updates or photo uploads.
        """
        message = update.get("message")
        if not message:
            return
            
        chat_id = str(message.get("chat", {}).get("id"))
        message_id = str(message.get("message_id"))
        text = message.get("text", "")
        
        # Example naive processing: if a user types /maint <property_id> <issue>
        if text.startswith("/maint "):
            parts = text.split(" ", 2)
            if len(parts) >= 3:
                prop_id = parts[1]
                issue_title = parts[2]
                
                # Create naive maintenance order
                from app.models.maintenance import MaintenanceType, MaintenancePriority
                order = MaintenanceOrder(
                    property_id=prop_id,
                    title=issue_title,
                    maintenance_type=MaintenanceType.CORRECTIVO.value,
                    status=MaintenanceStatus.PENDIENTE.value,
                    priority=MaintenancePriority.MEDIA.value,
                    source=MaintenanceSource.TELEGRAM.value,
                    telegram_chat_id=chat_id,
                    telegram_message_id=message_id
                )
                db.add(order)
                await db.flush() # flush to get order.id before commit
                await cls.send_message(db, chat_id, f"✅ Orden de mantenimiento registrada con ID: {order.id}")
                await db.commit()
                return

        # Handle photos (e.g. attaching to a known chat_id session)
        if "photo" in message:
            stmt = select(MaintenanceOrder).filter_by(telegram_chat_id=chat_id, status=MaintenanceStatus.PENDIENTE.value)
            result = await db.execute(stmt)
            order = result.scalar_one_or_none()
            if order:
                order.has_photos = True
                await db.commit()
                await cls.send_message(db, chat_id, f"✅ Foto recibida para la orden {order.id}")
