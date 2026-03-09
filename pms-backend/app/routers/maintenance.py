"""
Maintenance router — /api/v1/maintenance endpoints.
"""

from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.maintenance import (
    MaintenanceCreate, MaintenanceUpdate,
    MaintenanceStatusUpdate, MaintenanceComplete, MaintenanceResponse,
)
from app.services import maintenance_service
from app.utils.security import get_current_user, require_role
from app.config import settings

import os

router = APIRouter(prefix="/maintenance", tags=["Mantenimientos"])


@router.get("", response_model=dict)
async def list_maintenance(
    property_id: str | None = None,
    status: str | None = None,
    maintenance_type: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar órdenes de mantenimiento."""
    orders, total = await maintenance_service.list_maintenance(
        db, property_id, status, maintenance_type, page, limit,
    )
    return {
        "items": [MaintenanceResponse.model_validate(o) for o in orders],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", response_model=MaintenanceResponse, status_code=201)
async def create_maintenance(
    data: MaintenanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor", "Propietario")),
):
    """Crear orden de mantenimiento."""
    return await maintenance_service.create_maintenance(db, data, current_user.id)


@router.get("/calendar", response_model=list[dict])
async def maintenance_calendar(
    property_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Vista calendario de mantenimientos programados."""
    return await maintenance_service.get_calendar(db, property_id)


@router.get("/{order_id}", response_model=MaintenanceResponse)
async def get_maintenance(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Detalle de una orden de mantenimiento."""
    return await maintenance_service.get_maintenance(db, order_id)


@router.put("/{order_id}", response_model=MaintenanceResponse)
async def update_maintenance(
    order_id: str,
    data: MaintenanceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Actualizar orden de mantenimiento."""
    return await maintenance_service.update_maintenance(db, order_id, data)


@router.put("/{order_id}/status", response_model=MaintenanceResponse)
async def update_status(
    order_id: str,
    data: MaintenanceStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Cambiar estado de la orden."""
    return await maintenance_service.update_status(db, order_id, data.status, data.notes)


@router.post("/{order_id}/complete", response_model=MaintenanceResponse)
async def complete_maintenance(
    order_id: str,
    data: MaintenanceComplete,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Completar orden y registrar gasto en ledger automáticamente."""
    return await maintenance_service.complete_maintenance(
        db, order_id, data.actual_cost, data.account_id, current_user.id, data.notes,
    )


@router.post("/{order_id}/invoice", response_model=MaintenanceResponse)
async def upload_invoice(
    order_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Cargar factura del proveedor."""
    order = await maintenance_service.get_maintenance(db, order_id)

    upload_dir = os.path.join(settings.UPLOAD_DIR, "invoices")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{order_id}_{file.filename}")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    order.invoice_file = file_path
    order.status = "Esperando Factura"
    await db.commit()
    await db.refresh(order)
    return order
