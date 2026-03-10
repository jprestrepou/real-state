from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.models.inspection import Inspection
from app.schemas.inspection import InspectionCreate, InspectionUpdate

async def list_inspections(db: AsyncSession, property_id: Optional[str] = None) -> List[Inspection]:
    stmt = select(Inspection)
    if property_id:
        stmt = stmt.where(Inspection.property_id == property_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_inspection(db: AsyncSession, data: InspectionCreate) -> Inspection:
    new_insp = Inspection(**data.model_dump())
    db.add(new_insp)
    await db.commit()
    await db.refresh(new_insp)
    return new_insp

async def get_inspection(db: AsyncSession, inspection_id: str) -> Optional[Inspection]:
    return await db.get(Inspection, inspection_id)

async def update_inspection(db: AsyncSession, inspection_id: str, data: InspectionUpdate) -> Optional[Inspection]:
    insp = await get_inspection(db, inspection_id)
    if not insp:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(insp, key, value)
    
    await db.commit()
    await db.refresh(insp)
    return insp

async def delete_inspection(db: AsyncSession, inspection_id: str) -> bool:
    insp = await get_inspection(db, inspection_id)
    if not insp:
        return False
    await db.delete(insp)
    await db.commit()
    return True
