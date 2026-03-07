"""
Occupant Service — CRUD operations for property occupants.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.occupant import PropertyOccupant
from app.schemas.occupant import OccupantCreate, OccupantUpdate


def list_occupants(db: Session, property_id: Optional[str] = None) -> List[PropertyOccupant]:
    stmt = select(PropertyOccupant)
    if property_id:
        stmt = stmt.where(PropertyOccupant.property_id == property_id)
    return db.execute(stmt).scalars().all()


def create_occupant(db: Session, data: OccupantCreate) -> PropertyOccupant:
    new_occupant = PropertyOccupant(
        property_id=data.property_id,
        full_name=data.full_name,
        dni=data.dni,
        phone=data.phone,
        email=data.email,
        is_primary=data.is_primary
    )
    db.add(new_occupant)
    db.commit()
    db.refresh(new_occupant)
    return new_occupant


def get_occupant(db: Session, occupant_id: str) -> Optional[PropertyOccupant]:
    stmt = select(PropertyOccupant).where(PropertyOccupant.id == occupant_id)
    return db.execute(stmt).scalar_one_or_none()


def update_occupant(db: Session, occupant_id: str, data: OccupantUpdate) -> Optional[PropertyOccupant]:
    occupant = get_occupant(db, occupant_id)
    if not occupant:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(occupant, key, value)
    
    db.commit()
    db.refresh(occupant)
    return occupant


def delete_occupant(db: Session, occupant_id: str) -> bool:
    occupant = get_occupant(db, occupant_id)
    if not occupant:
        return False
    db.delete(occupant)
    db.commit()
    return True
