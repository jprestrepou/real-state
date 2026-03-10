from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.inspection import InspectionCreate, InspectionUpdate, InspectionResponse
from app.services import inspection_service
from app.utils.security import require_role

router = APIRouter(prefix="/inspections", tags=["Facility Management"])

@router.get("/", response_model=List[InspectionResponse])
async def list_inspections(
    property_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    return await inspection_service.list_inspections(db, property_id)

@router.post("/", response_model=InspectionResponse)
async def create_inspection(
    data: InspectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    return await inspection_service.create_inspection(db, data)

@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    insp = await inspection_service.get_inspection(db, inspection_id)
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    return insp

@router.put("/{inspection_id}", response_model=InspectionResponse)
async def update_inspection(
    inspection_id: str,
    data: InspectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    insp = await inspection_service.update_inspection(db, inspection_id, data)
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    return insp

@router.delete("/{inspection_id}")
async def delete_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    if not await inspection_service.delete_inspection(db, inspection_id):
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    return {"message": "Inspección eliminada"}


class InventoryRequest(BaseModel):
    check_type: str = Field(..., description="Check-In o Check-Out")
    items: List[dict]
    notes: Optional[str] = None

@router.post("/{inspection_id}/inventory-report", response_model=dict)
async def generate_inventory(
    inspection_id: str,
    data: InventoryRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    """Generar reporte PDF de inventario (Check-in / Check-out) para una inspección."""
    insp = await inspection_service.get_inspection(db, inspection_id)
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    
    from app.services.pdf_service import generate_inventory_report
    # Due to lazy loading, property should be accessible
    pdf_path = await generate_inventory_report(insp.property, data.check_type, data.items, data.notes)
    
    return {"message": "Inventario generado exitosamente", "pdf_url": f"/{pdf_path}"}
