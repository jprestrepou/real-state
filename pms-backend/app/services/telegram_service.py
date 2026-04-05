"""
Telegram Bot Service for alerts, maintenance photo ingestion,
contract delivery, signature management, and tenant messaging.
"""
import os
import logging
from typing import Dict, Any, Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
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
    async def send_document(cls, db: AsyncSession, chat_id: str, file_path: str, caption: str = "") -> Optional[Dict[str, Any]]:
        """Sends a document (PDF, etc.) to a specific Telegram chat_id."""
        base_url = await cls.get_base_url(db)
        if "/botNone" in base_url or "/bot" == base_url:
            logger.warning("TELEGRAM_BOT_TOKEN not set, skipping document send.")
            return None

        url = f"{base_url}/sendDocument"

        if not os.path.exists(file_path):
            logger.error(f"File not found for Telegram send: {file_path}")
            return None

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                with open(file_path, "rb") as f:
                    files = {"document": (os.path.basename(file_path), f, "application/pdf")}
                    data = {"chat_id": chat_id, "parse_mode": "Markdown"}
                    if caption:
                        data["caption"] = caption
                    response = await client.post(url, data=data, files=files)
                    response.raise_for_status()
                    return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Failed to send telegram document: {e}")
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
        Handles: /start, /reportar, /firmar, photos, and signed documents.
        """
        message = update.get("message")
        if not message:
            return
            
        chat_id = str(message.get("chat", {}).get("id"))
        message_id = str(message.get("message_id"))
        text = message.get("text", "")
        
        # ── /firmar command ──────────────────────────────────────
        if text.startswith("/firmar"):
            await cls._handle_sign_command(db, chat_id, text)
            return

        # ── /reportar command ────────────────────────────────────
        if text.startswith("/reportar "):
            await cls._handle_report_command(db, chat_id, message_id, text)
            return

        # ── /start command ───────────────────────────────────────
        if text.startswith("/start"):
            await cls.send_message(
                db, chat_id,
                f"👋 *¡Hola!* Soy el Bot de Gestión Inmobiliaria.\n\n"
                f"🆔 *Tu Chat ID es:* `{chat_id}`\n\n"
                f"📋 *Comandos disponibles:*\n"
                f"• `/reportar <propiedad> <daño>` — Reportar un daño\n"
                f"• `/firmar <ID_CONTRATO>` — Firmar un contrato digitalmente\n\n"
                f"📎 También puedes enviar documentos firmados como respuesta a un contrato."
            )
            return

        # ── Document reception (signed contracts) ────────────────
        if "document" in message:
            await cls._handle_document_reception(db, chat_id, message)
            return

        # ── Photo reception (maintenance) ────────────────────────
        if "photo" in message:
            await cls._handle_photo_reception(db, chat_id, message)
            return

    @classmethod
    async def _handle_sign_command(cls, db: AsyncSession, chat_id: str, text: str):
        """Handle /firmar <contract_id> command from tenant."""
        from app.models.contract import Contract, ContractStatus
        import hashlib
        from datetime import datetime

        args = text[len("/firmar"):].strip()
        if not args:
            await cls.send_message(
                db, chat_id,
                "⚠️ *Formato:* `/firmar <ID_CONTRATO>`\n\n"
                "El ID del contrato se encuentra en el mensaje que recibiste con el PDF."
            )
            return

        contract_id = args.split()[0]

        # Find contract by ID (partial match with first 8 chars)
        stmt = select(Contract).where(
            Contract.tenant_telegram_chat_id == chat_id,
            Contract.status == ContractStatus.ENVIADO_A_FIRMA.value,
        )
        result = await db.execute(stmt)
        contracts = result.scalars().all()

        target_contract = None
        for c in contracts:
            if c.id.startswith(contract_id) or c.id == contract_id:
                target_contract = c
                break

        if not target_contract:
            await cls.send_message(
                db, chat_id,
                f"❌ No se encontró un contrato pendiente de firma con ID `{contract_id}` asociado a tu cuenta.\n\n"
                f"Asegúrate de que el contrato esté en estado *Enviado a Firma* y que tu Chat ID esté registrado."
            )
            return

        # Sign the contract
        target_contract.status = ContractStatus.FIRMADO.value
        target_contract.signed_at = datetime.now()
        base_string = f"{target_contract.id}|telegram:{chat_id}|{target_contract.signed_at.isoformat()}"
        target_contract.signature_hash = hashlib.sha256(base_string.encode()).hexdigest()
        target_contract.signed_ip = f"telegram:{chat_id}"

        await db.commit()
        await db.refresh(target_contract)

        await cls.send_message(
            db, chat_id,
            f"✅ *Contrato Firmado Digitalmente*\n\n"
            f"📄 *Contrato:* `{target_contract.id[:8]}`\n"
            f"👤 *Arrendatario:* {target_contract.tenant_name}\n"
            f"🕐 *Fecha firma:* {target_contract.signed_at.strftime('%Y-%m-%d %H:%M')}\n"
            f"🔐 *Hash:* `{target_contract.signature_hash[:16]}...`\n\n"
            f"📎 Si desea enviar una copia del contrato firmado físicamente, "
            f"puede adjuntarla como documento en esta conversación."
        )

    @classmethod
    async def _handle_document_reception(cls, db: AsyncSession, chat_id: str, message: dict):
        """Handle document uploads — associate with contracts pending signed document."""
        from app.models.contract import Contract, ContractStatus

        # Find contract in FIRMADO status for this chat_id
        stmt = select(Contract).where(
            Contract.tenant_telegram_chat_id == chat_id,
            Contract.status == ContractStatus.FIRMADO.value,
            Contract.signed_document_path.is_(None),
        ).order_by(Contract.signed_at.desc())
        result = await db.execute(stmt)
        contract = result.scalars().first()

        if contract:
            doc = message["document"]
            file_id = doc["file_id"]
            file_name = doc.get("file_name", "documento_firmado")

            file_path = await cls._download_telegram_file(db, file_id, subdir="contracts", prefix="signed")
            if file_path:
                contract.signed_document_path = file_path
                await db.commit()
                await cls.send_message(
                    db, chat_id,
                    f"✅ *Documento firmado recibido y almacenado*\n\n"
                    f"📄 Contrato: `{contract.id[:8]}`\n"
                    f"📁 Archivo: {file_name}"
                )
            else:
                await cls.send_message(db, chat_id, "❌ Error al descargar el documento. Por favor intente de nuevo.")
        else:
            await cls.send_message(
                db, chat_id,
                "ℹ️ No tienes ningún contrato firmado pendiente de recibir documento.\n"
                "Si crees que es un error, contacta al administrador."
            )

    @classmethod
    async def _handle_report_command(cls, db: AsyncSession, chat_id: str, message_id: str, text: str):
        """Handle /reportar command for maintenance reports."""
        from app.models import Property

        args_text = text[len("/reportar "):].strip()
        if not args_text:
            await cls.send_message(db, chat_id, "⚠️ **Formato incorrecto.**\nPara reportar un daño usa el formato:\n`/reportar <NOMBRE_O_ID_PROPIEDAD> <Descripción del daño>`")
            return

        # Get all active properties
        prop_stmt = select(Property).where(Property.is_active == True)
        prop_result = await db.execute(prop_stmt)
        all_props = prop_result.scalars().all()

        target_property = None
        issue_title = ""

        for p in sorted(all_props, key=lambda x: len(x.name), reverse=True):
            if args_text.lower().startswith(p.id.lower()):
                target_property = p
                issue_title = args_text[len(p.id):].strip()
                break
            if args_text.lower().startswith(p.name.lower()):
                target_property = p
                issue_title = args_text[len(p.name):].strip()
                if len(args_text) == len(p.name) or args_text[len(p.name)] == " ":
                    break
                else:
                    target_property = None

        if not target_property:
            await cls.send_message(db, chat_id, f"❌ No pude identificar la propiedad en tu mensaje: `{args_text}`.\n\nPor favor, asegúrate de escribir el nombre exacto de la propiedad al inicio.")
            return

        if not issue_title:
            await cls.send_message(db, chat_id, f"⚠️ Has identificado la propiedad *{target_property.name}*, pero falta la descripción del daño.\nUsa: `/reportar {target_property.name} <daño>`")
            return

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

    @classmethod
    async def _handle_photo_reception(cls, db: AsyncSession, chat_id: str, message: dict):
        """Handle photo uploads — associate with maintenance orders."""
        from app.models.maintenance import MaintenanceOrder, MaintenanceStatus, MaintenancePhoto

        stmt = select(MaintenanceOrder).where(
            MaintenanceOrder.telegram_chat_id == chat_id,
            MaintenanceOrder.status == MaintenanceStatus.PENDIENTE.value
        ).order_by(MaintenanceOrder.created_at.desc())
        result = await db.execute(stmt)
        order = result.scalars().first()

        if order:
            photo_file = message["photo"][-1]
            file_id = photo_file["file_id"]
            photo_path = await cls._download_telegram_file(db, file_id, subdir="maintenance", prefix="maint")
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
    async def _download_telegram_file(cls, db: AsyncSession, file_id: str, subdir: str = "maintenance", prefix: str = "file") -> Optional[str]:
        """Downloads a file from Telegram and returns the local relative path."""
        base_url = await cls.get_base_url(db)
        token = base_url.split("bot")[-1]
        
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(f"{base_url}/getFile", params={"file_id": file_id})
                res.raise_for_status()
                file_info = res.json()["result"]
                file_path_on_telegram = file_info["file_path"]
                
                download_url = f"https://api.telegram.org/file/bot{token}/{file_path_on_telegram}"
                file_res = await client.get(download_url)
                file_res.raise_for_status()
                
                import uuid
                ext = file_path_on_telegram.split(".")[-1] if "." in file_path_on_telegram else "bin"
                filename = f"{prefix}_{uuid.uuid4()}.{ext}"
                local_dir = os.path.join(settings.UPLOAD_DIR, subdir)
                os.makedirs(local_dir, exist_ok=True)
                
                local_path = os.path.join(local_dir, filename)
                with open(local_path, "wb") as f:
                    f.write(file_res.content)
                
                return f"uploads/{subdir}/{filename}"
            except Exception as e:
                logger.error(f"Error downloading Telegram file: {e}")
                return None
