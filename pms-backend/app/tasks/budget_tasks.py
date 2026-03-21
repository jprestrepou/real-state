"""
Celery tasks for budget notifications.
"""
import asyncio
import logging
from sqlalchemy import select, and_
from celery.schedules import crontab

from app.tasks.email_tasks import celery_app
from app.database import AsyncSessionLocal
from app.services.budget_service import get_budget
from app.services.telegram_service import TelegramService
from app.services.config_service import get_config_value
from app.models.budget import Budget

logger = logging.getLogger(__name__)

async def _check_budget_execution_async():
    from datetime import datetime
    now = datetime.now()
    year = now.year
    month = now.month

    async with AsyncSessionLocal() as db:
        admin_chat_id = await get_config_value(db, "TELEGRAM_CHAT_ID")
        if not admin_chat_id:
            logger.warning("No TELEGRAM_CHAT_ID configured, skipping budget alerts.")
            return

        # Busca presupuestos activos del mes actual (asumiendo Mensual para simplificar)
        stmt = select(Budget).where(
            and_(
                Budget.year == year,
                Budget.month == month,
                Budget.is_closed == False
            )
        )
        result = await db.execute(stmt)
        budgets = result.scalars().all()
        
        for budget in budgets:
            # get_budget llama a _refresh_budget_totals internamente
            full_budget = await get_budget(db, budget.id)
            if not full_budget:
                continue
                
            pct = full_budget.execution_pct
            
            # Alerta superior o igual al 85%
            if pct >= 85:
                # property_rel no viene precargado por defecto, así que lo obtenemos de otra forma o esperamos que esté
                prop_name = "General"
                # get_budget should populate relationships if eager loaded, but just in case:
                if getattr(full_budget, "property_rel", None):
                    prop_name = full_budget.property_rel.name
                
                msg = (
                    f"⚠️ *Alerta de Presupuesto*\n"
                    f"El presupuesto de *{prop_name}* para el período actual ha alcanzado el "
                    f"*{pct}%* de ejecución.\n"
                    f"Monto Ejecutado: ${float(full_budget.total_executed):,.2f} / ${float(full_budget.total_budget):,.2f}"
                )
                await TelegramService.send_message(db, admin_chat_id, msg)

@celery_app.task
def check_budget_execution():
    """Sync wrapper for budget check task (meant to run periodically)."""
    return asyncio.run(_check_budget_execution_async())

# Add schedule to celery_app beat
celery_app.conf.beat_schedule = getattr(celery_app.conf, "beat_schedule", {})
celery_app.conf.beat_schedule['check-budget-execution-daily'] = {
    'task': 'app.tasks.budget_tasks.check_budget_execution',
    'schedule': crontab(hour=8, minute=0), # Se ejecuta todos los días a las 8:00 AM
}
