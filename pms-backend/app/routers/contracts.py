"""
Contracts router — /api/v1/contracts endpoints.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.contract import (
    ContractCreate, ContractUpdate, ContractResponse, PaymentScheduleResponse,
)
from app.services import contract_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/contracts", tags=["Contratos"])


@router.get("", response_model=dict)
def list_contracts(
    property_id: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar contratos."""
    contracts, total = contract_service.list_contracts(db, property_id, status, page, limit)
    return {
        "items": [ContractResponse.model_validate(c) for c in contracts],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", response_model=ContractResponse, status_code=201)
def create_contract(
    data: ContractCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Crear nuevo contrato."""
    return contract_service.create_contract(db, data, current_user.id)


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener detalle de un contrato."""
    return contract_service.get_contract(db, contract_id)


@router.put("/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: str,
    data: ContractUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Actualizar contrato."""
    return contract_service.update_contract(db, contract_id, data)


@router.post("/{contract_id}/activate", response_model=ContractResponse)
def activate_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Activar contrato borrador y generar cronograma de pagos."""
    return contract_service.activate_contract(db, contract_id)


@router.get("/{contract_id}/payments", response_model=list[PaymentScheduleResponse])
def get_payment_schedules(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener cronograma de pagos de un contrato."""
    return contract_service.get_payment_schedules(db, contract_id)
