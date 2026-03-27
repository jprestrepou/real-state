"""
Contracts router — /api/v1/contracts endpoints.
"""

from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
import io

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
async def list_contracts(
    property_id: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar contratos."""
    contracts, total = await contract_service.list_contracts(db, property_id, status, page, limit)
    return {
        "items": [ContractResponse.model_validate(c) for c in contracts],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", response_model=ContractResponse, status_code=201)
async def create_contract(
    data: ContractCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Crear nuevo contrato."""
    return await contract_service.create_contract(db, data, current_user.id)


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener detalle de un contrato."""
    return await contract_service.get_contract(db, contract_id)

@router.get("/{contract_id}/download")
async def download_contract_pdf(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Descargar el PDF original del contrato."""
    contract = await contract_service.get_contract(db, contract_id)
    
    import os
    from app.services.pdf_service import generate_contract_pdf
    
    # Always regenerate if file doesn't exist on disk
    if not contract.pdf_file or not os.path.exists(contract.pdf_file):
        contract.pdf_file = await generate_contract_pdf(db, contract.id)
        await db.commit()
        await db.refresh(contract)

    with open(contract.pdf_file, "rb") as f:
        pdf_bytes = f.read()

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="contrato_{contract_id}.pdf"'
        }
    )


@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: str,
    data: ContractUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Actualizar contrato."""
    return await contract_service.update_contract(db, contract_id, data)


@router.post("/{contract_id}/activate", response_model=ContractResponse)
async def activate_contract(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Activar contrato firmado y generar cronograma de pagos."""
    return await contract_service.activate_contract(db, contract_id)


@router.post("/{contract_id}/send-signature", response_model=ContractResponse)
async def send_for_signature(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Enviar contrato a firma (simula envío de notificaciones)."""
    return await contract_service.send_contract_for_signature(db, contract_id)


@router.post("/{contract_id}/send-copy", response_model=dict)
async def send_contract_copy(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Envia una copia del PDF del contrato actual al correo del inquilino."""
    await contract_service.send_contract_copy(db, contract_id)
    return {"message": "Copia del contrato enviada al correo del inquilino"}


@router.post("/{contract_id}/sign", response_model=ContractResponse)
async def sign_contract(
    contract_id: str,
    data: ContractSignRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Simular la firma de un contrato aportando validaciones del inquilino."""
    client_ip = request.client.host if request.client else "unknown"
    return await contract_service.sign_contract(db, contract_id, data, client_ip)


class TerminationRequest(BaseModel):
    reason: str
    termination_date: date

@router.post("/{contract_id}/termination-letter", response_model=dict)
async def generate_termination(
    contract_id: str,
    data: TerminationRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Generar carta de terminación de contrato (PDF)."""
    contract = await contract_service.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
        
    from app.services.pdf_service import generate_termination_letter
    pdf_path = await generate_termination_letter(db, contract.id, data.reason, data.termination_date)
    return {"message": "Carta generada", "pdf_url": f"/{pdf_path}"}

@router.get("/{contract_id}/payments", response_model=list[PaymentScheduleResponse])
async def get_payment_schedules(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener cronograma de pagos de un contrato."""
    return await contract_service.get_payment_schedules(db, contract_id)


@router.post("/{contract_id}/payments/{payment_id}/pay", response_model=PaymentScheduleResponse)
async def mark_payment_as_paid(
    contract_id: str,
    payment_id: str,
    account_id: str = Query(..., description="ID de la cuenta donde se recibe el pago"),
    amount: float | None = Query(None, description="Monto real pagado (opcional si difiere del canon)"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Marcar un pago como pagado y registrar movimiento financiero."""
    return await contract_service.mark_payment_as_paid(db, payment_id, account_id, current_user.id, amount)
