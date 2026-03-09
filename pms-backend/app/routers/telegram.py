from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.database import get_db
from app.services.telegram_service import TelegramService

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
