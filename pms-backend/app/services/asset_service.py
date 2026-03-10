from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate

async def list_assets(db: AsyncSession, property_id: Optional[str] = None) -> List[Asset]:
    stmt = select(Asset)
    if property_id:
        stmt = stmt.where(Asset.property_id == property_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_asset(db: AsyncSession, data: AssetCreate) -> Asset:
    new_asset = Asset(**data.model_dump())
    db.add(new_asset)
    await db.commit()
    await db.refresh(new_asset)
    return new_asset

async def get_asset(db: AsyncSession, asset_id: str) -> Optional[Asset]:
    return await db.get(Asset, asset_id)

async def update_asset(db: AsyncSession, asset_id: str, data: AssetUpdate) -> Optional[Asset]:
    asset = await get_asset(db, asset_id)
    if not asset:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(asset, key, value)
    
    await db.commit()
    await db.refresh(asset)
    return asset

async def delete_asset(db: AsyncSession, asset_id: str) -> bool:
    asset = await get_asset(db, asset_id)
    if not asset:
        return False
    await db.delete(asset)
    await db.commit()
    return True
