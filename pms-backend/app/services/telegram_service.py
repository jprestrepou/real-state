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
                response = await client.post(url, json=payload, timeout=5.0)
                response.raise_for_status()
                return response.json().get("ok", False)
            except Exception as e:
                logger.error(f"Telegram webhook error: {e}")
                return False

    @classmethod
    async def get_webhook_info(cls, db: AsyncSession) -> dict:
        """Consults the Telegram API for the current webhook status."""
        conf = await config_service.get_telegram_config(db)
        token = conf.get("token")
        if not token:
            return {"ok": False, "description": "Token no configurado"}
            
        base_url = f"https://api.telegram.org/bot{token}"
        url = f"{base_url}/getWebhookInfo"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Telegram getWebhookInfo error: {e}")
                return {"ok": False, "description": str(e)}

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
        
        # Format: /reportar <property_id_or_name> <issue>
        if text.startswith("/reportar "):
            args_text = text[len("/reportar "):].strip()
            if not args_text:
                await cls.send_message(db, chat_id, "⚠️ **Formato incorrecto.**\nPara reportar un daño usa el formato:\n`/reportar <NOMBRE_O_ID_PROPIEDAD> <Descripción del daño>`")
                return

            from app.models import Property
            from sqlalchemy import or_

            # 1. Try exact ID match first if it looks like a potential ID or single word
            parts = args_text.split(" ", 1)
            prop_query_first = parts[0]
            
            # 2. Get all active property names and IDs to find the best match
            prop_stmt = select(Property).where(Property.is_active == True)
            prop_result = await db.execute(prop_stmt)
            all_props = prop_result.scalars().all()
            
            target_property = None
            issue_title = ""

            # Try to find a property whose name or ID matches the start of args_text
            # Sort by length descending to match the longest name first (e.g. "Cabaña A1" vs "Cabaña")
            for p in sorted(all_props, key=lambda x: len(x.name), reverse=True):
                # Check for ID match
                if args_text.lower().startswith(p.id.lower()):
                    target_property = p
                    issue_title = args_text[len(p.id):].strip()
                    break
                # Check for Name match
                if args_text.lower().startswith(p.name.lower()):
                    target_property = p
                    issue_title = args_text[len(p.name):].strip()
                    # Also ensure there's a space or it's the end of string to avoid matching "Casa" in "Casasola"
                    if len(args_text) == len(p.name) or args_text[len(p.name)] == " ":
                        break
                    else:
                        target_property = None # Reset if it was a partial word match

            if not target_property:
                await cls.send_message(db, chat_id, f"❌ No pude identificar la propiedad en tu mensaje: `{args_text}`.\n\nPor favor, asegúrate de escribir el nombre exacto de la propiedad al inicio.")
                return

            if not issue_title:
                await cls.send_message(db, chat_id, f"⚠️ Has identificado la propiedad *{target_property.name}*, pero falta la descripción del daño.\nUsa: `/reportar {target_property.name} <daño>`")
                return

            # Create maintenance order
            from app.models.maintenance import MaintenanceType, MaintenancePriority, MaintenanceOrder, MaintenanceStatus, MaintenanceSource
            order = MaintenanceOrder(
                property_id=target_property.id,
                title=issue_title,
                maintenance_type=MaintenanceType.CORRECTIVO.value,
                status=MaintenanceStatus.PENDIENTE.value,
                priority=MaintenancePriority.MEDIA.value,
                source=MaintenanceSource.TELEGRAM.value,
                telegram_chat_id=chat_id,
                telegram_message_id=message_id,
                created_by=None
            )
            db.add(order)
            await db.flush()
            
            response_text = (
                f"✅ *Orden de Mantenimiento Registrada*\n\n"
                f"**Propiedad:** {target_property.name}\n"
                f"**Reporte:** {issue_title}\n\n"
                f"**Ticket ID:** `{order.id}`\n\n"
                f"Si tienes fotos del daño, envíalas ahora en esta conversación."
            )
            await cls.send_message(db, chat_id, response_text)
            await db.commit()
            return

        if text.startswith("/start"):
            await cls.send_message(db, chat_id, "👋 ¡Hola! Soy el Bot de Mantenimiento de Property Management.\n\nPara reportar un daño, envíame el siguiente comando:\n`/reportar <ID_PROPIEDAD> <Descripción del daño>`")
            return

        # Handle photos (e.g. attaching to a known chat_id session)
        if "photo" in message:
            from app.models.maintenance import MaintenanceOrder, MaintenanceStatus, MaintenancePhoto
            stmt = select(MaintenanceOrder).where(
                MaintenanceOrder.telegram_chat_id == chat_id,
                MaintenanceOrder.status == MaintenanceStatus.PENDIENTE.value
            ).order_by(MaintenanceOrder.created_at.desc())
            result = await db.execute(stmt)
            order = result.scalars().first()
            
            if order:
                # Get the largest photo (last in the list)
                photo_file = message["photo"][-1]
                file_id = photo_file["file_id"]
                
                # Download file from Telegram
                photo_path = await cls._download_telegram_file(db, file_id)
                if photo_path:
                    new_photo = MaintenancePhoto(
                        order_id=order.id,
                        photo_path=photo_path,
                        telegram_file_id=file_id
                    )
                    db.add(new_photo)
                    order.has_photos = True
                    await db.commit()
                    await cls.send_message(db, chat_id, f"✅ Foto recibida y adjuntada a la orden `{order.id}`")
                else:
                    await cls.send_message(db, chat_id, "❌ Error al descargar la foto de Telegram.")
            else:
                 await cls.send_message(db, chat_id, "No tienes ninguna orden de mantenimiento pendiente a la cual asociar esta foto.")

    @classmethod
    async def _download_telegram_file(cls, db: AsyncSession, file_id: str) -> Optional[str]:
        """Downloads a file from Telegram and returns the local relative path."""
        base_url = await cls.get_base_url(db)
        token = base_url.split("bot")[-1]
        
        async with httpx.AsyncClient() as client:
            try:
                # 1. Get file path from Telegram
                res = await client.get(f"{base_url}/getFile", params={"file_id": file_id})
                res.raise_for_status()
                file_info = res.json()["result"]
                file_path_on_telegram = file_info["file_path"]
                
                # 2. Download the actual file
                download_url = f"https://api.telegram.org/file/bot{token}/{file_path_on_telegram}"
                file_res = await client.get(download_url)
                file_res.raise_for_status()
                
                # 3. Save locally
                import uuid
                ext = file_path_on_telegram.split(".")[-1]
                filename = f"maint_{uuid.uuid4()}.{ext}"
                local_dir = os.path.join(settings.UPLOAD_DIR, "maintenance")
                os.makedirs(local_dir, exist_ok=True)
                
                local_path = os.path.join(local_dir, filename)
                with open(local_path, "wb") as f:
                    f.write(file_res.content)
                
                # Return relative path for frontend
                return f"uploads/maintenance/{filename}"
            except Exception as e:
                logger.error(f"Error downloading Telegram file: {e}")
                return None
