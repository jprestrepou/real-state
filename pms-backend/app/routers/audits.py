from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.audit import AuditLogResponse
from app.services import audit_service

router = APIRouter(prefix="/audits", tags=["Auditoría"])

@router.get("/", response_model=List[AuditLogResponse])
async def list_audits(
    work_group_id: Optional[str] = Query(None, description="Filtro por grupo de trabajo"),
    entity_type: Optional[str] = Query(None, description="Filtro por tipo de entidad"),
    entity_id: Optional[str] = Query(None, description="Filtro por ID de entidad"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar los registros de auditoría del sistema de manera cronológica inversa.
    """
    # Authorization checks would be added depending on User Role
    return await audit_service.list_audit_logs(
        db,
        work_group_id=work_group_id,
        user_id=None,  # General filtering
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
        offset=offset
    )

@router.get("/{audit_id}", response_model=AuditLogResponse)
async def get_audit(
    audit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    audit = await audit_service.get_audit_log(db, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return audit
