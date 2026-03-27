"""
Configuration Router — /api/v1/config endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Optional
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.schemas.config import ConfigResponse, ConfigUpdate
from app.services import config_service
from app.services.email_service import EmailService
from app.utils.security import require_role

router = APIRouter(prefix="/config", tags=["Configuración Global"])

@router.get("", response_model=List[ConfigResponse])
async def list_configs(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    """Listar todas las configuraciones configuradas en la DB."""
    return await config_service.get_all_configs(db)

@router.patch("/{key}", response_model=ConfigResponse)
async def update_config(
    key: str,
    data: ConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    """Actualizar un valor de configuración."""
    return await config_service.update_config(db, key, data.value, description=data.description)

@router.post("/batch", response_model=List[ConfigResponse])
async def batch_update_configs(
    updates: Dict[str, str],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    """Actualizar múltiples valores de configuración a la vez."""
    return await config_service.batch_update_configs(db, updates)


class TestEmailRequest(BaseModel):
    recipient: Optional[str] = None


@router.post("/test-email")
async def test_email_config(
    data: TestEmailRequest = TestEmailRequest(),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    """
    Probar la configuración SMTP.
    Si se proporciona un destinatario, envía un correo de prueba.
    Si no, solo verifica la conexión al servidor SMTP.
    """
    if data.recipient:
        result = await EmailService.send_test_email(db, data.recipient)
    else:
        result = await EmailService.test_connection(db)
    return result
