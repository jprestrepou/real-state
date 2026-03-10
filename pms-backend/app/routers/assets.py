from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from app.services import asset_service
from app.utils.security import require_role

router = APIRouter(prefix="/assets", tags=["Facility Management"])

@router.get("/", response_model=List[AssetResponse])
async def list_assets(
    property_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    return await asset_service.list_assets(db, property_id)

@router.post("/", response_model=AssetResponse)
async def create_asset(
    data: AssetCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario"))
):
    return await asset_service.create_asset(db, data)

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    asset = await asset_service.get_asset(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: str,
    data: AssetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    asset = await asset_service.update_asset(db, asset_id, data)
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return asset

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    if not await asset_service.delete_asset(db, asset_id):
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return {"message": "Activo eliminado"}
