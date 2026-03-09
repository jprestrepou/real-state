"""
Contracts router — /api/v1/contracts endpoints.
"""

from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from pydantic import BaseModel
from datetime import date
from app.schemas.contract import (
    ContractCreate, ContractUpdate, ContractResponse, PaymentScheduleResponse, ContractSignRequest
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
    """Activar contrato firmado y generar cronograma de pagos."""
    return contract_service.activate_contract(db, contract_id)


@router.post("/{contract_id}/send-signature", response_model=ContractResponse)
def send_for_signature(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Enviar contrato a firma (simula envío de notificaciones)."""
    return contract_service.send_contract_for_signature(db, contract_id)


@router.post("/{contract_id}/sign", response_model=ContractResponse)
def sign_contract(
    contract_id: str,
    data: ContractSignRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Simular la firma de un contrato aportando validaciones del inquilino."""
    client_ip = request.client.host if request.client else "unknown"
    return contract_service.sign_contract(db, contract_id, data, client_ip)


class TerminationRequest(BaseModel):
    reason: str
    termination_date: date

@router.post("/{contract_id}/termination-letter", response_model=dict)
def generate_termination(
    contract_id: str,
    data: TerminationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Generar carta de terminación de contrato (PDF)."""
    contract = contract_service.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
        
    from app.services.pdf_service import generate_termination_letter
    pdf_path = generate_termination_letter(contract, data.reason, data.termination_date)
    return {"message": "Carta generada", "pdf_url": f"/{pdf_path}"}

@router.get("/{contract_id}/payments", response_model=list[PaymentScheduleResponse])
def get_payment_schedules(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener cronograma de pagos de un contrato."""
    return contract_service.get_payment_schedules(db, contract_id)


@router.post("/{contract_id}/payments/{payment_id}/pay", response_model=PaymentScheduleResponse)
def mark_payment_as_paid(
    contract_id: str,
    payment_id: str,
    account_id: str = Query(..., description="ID de la cuenta donde se recibe el pago"),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Marcar un pago como pagado y registrar movimiento financiero."""
    return contract_service.mark_payment_as_paid(db, payment_id, account_id)
