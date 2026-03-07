from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from app.services import asset_service
from app.utils.security import require_role

router = APIRouter(prefix="/assets", tags=["Facility Management"])

@router.get("/", response_model=List[AssetResponse])
def list_assets(
    property_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    return asset_service.list_assets(db, property_id)

@router.post("/", response_model=AssetResponse)
def create_asset(
    data: AssetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario"))
):
    return asset_service.create_asset(db, data)

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    asset = asset_service.get_asset(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: str,
    data: AssetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor"))
):
    asset = asset_service.update_asset(db, asset_id, data)
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return asset

@router.delete("/{asset_id}")
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    if not asset_service.delete_asset(db, asset_id):
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return {"message": "Activo eliminado"}
