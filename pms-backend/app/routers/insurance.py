from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.schemas.insurance import (
    InsurancePolicyCreate, InsurancePolicyUpdate, InsurancePolicyResponse,
    RiskScoreRequest, RiskScoreResponse
)
from app.services import insurance_service
from app.utils.security import require_role

router = APIRouter(prefix="/insurance", tags=["Riesgos y Seguros"])

@router.post("/risk-score", response_model=RiskScoreResponse)
async def compute_risk_score(
    data: RiskScoreRequest,
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    """Calcular Risk Score simulado del arrendatario."""
    return insurance_service.calculate_risk_score(data)

@router.get("/policies", response_model=List[InsurancePolicyResponse])
async def list_insurance_policies(
    contract_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    """Listar pólizas de seguro de arrendamiento."""
    return await insurance_service.list_policies(db, contract_id)

@router.post("/policies", response_model=InsurancePolicyResponse, status_code=201)
async def create_insurance_policy(
    data: InsurancePolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    """Registrar una nueva póliza de seguro de arrendamiento."""
    return await insurance_service.create_policy(db, data)

@router.get("/policies/{policy_id}", response_model=InsurancePolicyResponse)
async def get_insurance_policy(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    """Obtener detalle de póliza específica."""
    return await insurance_service.get_policy(db, policy_id)

@router.put("/policies/{policy_id}", response_model=InsurancePolicyResponse)
async def update_insurance_policy(
    policy_id: str,
    data: InsurancePolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    """Actualizar datos de la póliza."""
    return await insurance_service.update_policy(db, policy_id, data)

@router.delete("/policies/{policy_id}")
async def delete_insurance_policy(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    """Eliminar póliza (Solo Admin)."""
    await insurance_service.delete_policy(db, policy_id)
    return {"message": "Póliza eliminada"}
