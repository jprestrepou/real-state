"""
Celery tasks for email notifications.
"""

from celery import Celery
import os
from app.services.email_service import EmailService

# Initialize Celery (assuming Redis is available as per requirements)
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("pms_tasks", broker=redis_url)

@celery_app.task
def send_contract_revision_email(contract_id: str, pdf_path: str, recipients: list[str]):
    """
    Real task to send contract for revision via EmailService.
    """
    body = f"Se adjunta el contrato {contract_id} para su revisión."
    subject = f"Revisión de contrato {contract_id}"
    for r in recipients:
        EmailService.send_email(
            to_email=r,
            subject=subject,
            body=body,
            attachment_path=pdf_path
        )
    return True

@celery_app.task
def send_contract_signature_request_email(contract_id: str, signing_url: str, recipients: list[str]):
    """
    Task to request a signature on a simulated endpoint.
    """
    body = f"Por favor proceda a firmar digitalmente su contrato.\nEnlace: {signing_url}"
    subject = f"Firma requerida para el contrato {contract_id}"
    for r in recipients:
        EmailService.send_email(
            to_email=r,
            subject=subject,
            body=body
        )
    return True
