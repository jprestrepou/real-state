"""
Celery tasks for financial module (Invoicing & Reconciliations).
"""
import asyncio
import logging
from celery.schedules import crontab

from app.tasks.email_tasks import celery_app
from app.database import AsyncSessionLocal
from app.services.invoice_service import InvoiceService
from app.services.contract_service import process_annual_indexation

logger = logging.getLogger(__name__)

async def _daily_finance_jobs_async():
    async with AsyncSessionLocal() as db:
        try:
            logger.info("Starting daily finance jobs...")
            await InvoiceService.generate_monthly_invoices(db)
            await InvoiceService.update_overdue_invoices(db)
            await process_annual_indexation(db)
            logger.info("Daily finance jobs completed successfully.")
        except Exception as e:
            logger.error(f"Error executing daily finance jobs: {e}")

@celery_app.task
def run_daily_finance_jobs():
    """Sync wrapper for daily finance jobs (meant to run periodically)."""
    return asyncio.run(_daily_finance_jobs_async())

# Add schedule to celery_app beat
celery_app.conf.beat_schedule = getattr(celery_app.conf, "beat_schedule", {})
celery_app.conf.beat_schedule['run-daily-finance-jobs'] = {
    'task': 'app.tasks.financial_tasks.run_daily_finance_jobs',
    'schedule': crontab(hour=1, minute=0), # Se ejecuta todos los días a la 1:00 AM
}
