"""
Scoring Router — /api/v1/scoring endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.schemas.scoring import ScoringInput, ScoringResponse
from app.services import scoring_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/scoring", tags=["Scoring de Riesgo"])

@router.post("", response_model=ScoringResponse)
async def calculate_score(
    data: ScoringInput,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Calcular scoring de riesgo y persistir resultado."""
    return await scoring_service.calculate_and_save_score(db, data, current_user.id)

@router.get("/tenants", response_model=List[ScoringResponse])
async def list_scorings(
    tenant_name: Optional[str] = None,
    property_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar historiales de scoring."""
    return await scoring_service.get_tenant_scorings(db, tenant_name, property_id)
