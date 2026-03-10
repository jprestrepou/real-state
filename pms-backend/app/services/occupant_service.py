"""
Occupant Service — CRUD operations for property occupants.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.occupant import PropertyOccupant
from app.schemas.occupant import OccupantCreate, OccupantUpdate


async def list_occupants(db: AsyncSession, property_id: Optional[str] = None) -> List[PropertyOccupant]:
    stmt = select(PropertyOccupant)
    if property_id:
        stmt = stmt.where(PropertyOccupant.property_id == property_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_occupant(db: AsyncSession, data: OccupantCreate) -> PropertyOccupant:
    new_occupant = PropertyOccupant(
        property_id=data.property_id,
        full_name=data.full_name,
        dni=data.dni,
        phone=data.phone,
        email=data.email,
        is_primary=data.is_primary
    )
    db.add(new_occupant)
    await db.commit()
    await db.refresh(new_occupant)
    return new_occupant


async def get_occupant(db: AsyncSession, occupant_id: str) -> Optional[PropertyOccupant]:
    stmt = select(PropertyOccupant).where(PropertyOccupant.id == occupant_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_occupant(db: AsyncSession, occupant_id: str, data: OccupantUpdate) -> Optional[PropertyOccupant]:
    occupant = await get_occupant(db, occupant_id)
    if not occupant:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(occupant, key, value)
    
    await db.commit()
    await db.refresh(occupant)
    return occupant


async def delete_occupant(db: AsyncSession, occupant_id: str) -> bool:
    occupant = await get_occupant(db, occupant_id)
    if not occupant:
        return False
    await db.delete(occupant)
    await db.commit()
    return True
