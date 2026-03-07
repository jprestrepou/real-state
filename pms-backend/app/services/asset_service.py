from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate

def list_assets(db: Session, property_id: Optional[str] = None) -> List[Asset]:
    stmt = select(Asset)
    if property_id:
        stmt = stmt.where(Asset.property_id == property_id)
    return db.execute(stmt).scalars().all()

def create_asset(db: Session, data: AssetCreate) -> Asset:
    new_asset = Asset(**data.model_dump())
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

def get_asset(db: Session, asset_id: str) -> Optional[Asset]:
    return db.get(Asset, asset_id)

def update_asset(db: Session, asset_id: str, data: AssetUpdate) -> Optional[Asset]:
    asset = get_asset(db, asset_id)
    if not asset:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(asset, key, value)
    
    db.commit()
    db.refresh(asset)
    return asset

def delete_asset(db: Session, asset_id: str) -> bool:
    asset = get_asset(db, asset_id)
    if not asset:
        return False
    db.delete(asset)
    db.commit()
    return True
