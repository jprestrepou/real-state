from fastapi import APIRouter, Depends, Request, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.database import get_db
from app.services.telegram_service import TelegramService
from app.utils.security import require_role

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/telegram", tags=["Telegram Integración"])

@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Recibe webhooks de la API de Telegram.
    Lanza el procesamiento en una tarea en background para responder rápido (200 OK) a Telegram.
    """
    try:
        update_data = await request.json()
        logger.info(f"Received Telegram Update: {update_data.get('update_id')}")
        
        # In a real system, you might want to process directly or via background/Celery
        await TelegramService.process_update(db, update_data)
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing Telegram webhook: {e}")
        return {"status": "error"}

@router.post("/register-webhook")
async def register_telegram_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    """
    Registers the webhook URL with the Telegram API.
    Uses the host from the request to build the webhook URL if not behind a proxy,
    but in production (Render) you might want to hardcode the domain or pass it from frontend.
    """
    try:
        # In a real app we might pass the domain from frontend to be safe behind proxies
        body = await request.json()
        app_domain = body.get("domain") # e.g. "https://api.midominio.com"
        
        if not app_domain:
            raise HTTPException(status_code=400, detail="Se requiere el dominio de la aplicación.")
            
        webhook_url = f"{app_domain.rstrip('/')}/api/v1/telegram/webhook"
        
        success = await TelegramService.set_webhook(db, webhook_url)
        if success:
            return {"status": "ok", "message": "Webhook registrado exitosamente"}
        else:
            raise HTTPException(status_code=500, detail="Error al registrar webhook en Telegram. Verifique el token.")
    except Exception as e:
        logger.error(f"Error registering Telegram webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/webhook-status")
async def get_telegram_webhook_status(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    """
    Returns the current webhook status from Telegram API directly.
    """
    return await TelegramService.get_webhook_info(db)

