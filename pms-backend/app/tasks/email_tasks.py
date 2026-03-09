"""
Celery tasks for email notifications.
"""

from celery import Celery
import os
import asyncio
from app.services.email_service import EmailService
from app.database import AsyncSessionLocal

# Initialize Celery
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("pms_tasks", broker=redis_url)

async def _send_contract_revision_async(contract_id: str, pdf_path: str, recipients: list[str]):
    async with AsyncSessionLocal() as db:
        body = f"Se adjunta el contrato {contract_id} para su revisión."
        subject = f"Revisión de contrato {contract_id}"
        for r in recipients:
            await EmailService.send_email(
                db=db,
                to_email=r,
                subject=subject,
                body=body,
                attachment_path=pdf_path
            )

@celery_app.task
def send_contract_revision_email(contract_id: str, pdf_path: str, recipients: list[str]):
    """Sync wrapper for async email task."""
    return asyncio.run(_send_contract_revision_async(contract_id, pdf_path, recipients))

async def _send_contract_signature_async(contract_id: str, signing_url: str, recipients: list[str]):
    async with AsyncSessionLocal() as db:
        body = f"Por favor proceda a firmar digitalmente su contrato.\nEnlace: {signing_url}"
        subject = f"Firma requerida para el contrato {contract_id}"
        for r in recipients:
            await EmailService.send_email(
                db=db,
                to_email=r,
                subject=subject,
                body=body
            )

@celery_app.task
def send_contract_signature_request_email(contract_id: str, signing_url: str, recipients: list[str]):
    """Sync wrapper for async email task."""
    return asyncio.run(_send_contract_signature_async(contract_id, signing_url, recipients))
