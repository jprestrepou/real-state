from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app.models.inspection import Inspection
from app.schemas.inspection import InspectionCreate, InspectionUpdate

def list_inspections(db: Session, property_id: Optional[str] = None) -> List[Inspection]:
    stmt = select(Inspection)
    if property_id:
        stmt = stmt.where(Inspection.property_id == property_id)
    return db.execute(stmt).scalars().all()

def create_inspection(db: Session, data: InspectionCreate) -> Inspection:
    new_insp = Inspection(**data.model_dump())
    db.add(new_insp)
    db.commit()
    db.refresh(new_insp)
    return new_insp

def get_inspection(db: Session, inspection_id: str) -> Optional[Inspection]:
    return db.get(Inspection, inspection_id)

def update_inspection(db: Session, inspection_id: str, data: InspectionUpdate) -> Optional[Inspection]:
    insp = get_inspection(db, inspection_id)
    if not insp:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(insp, key, value)
    
    db.commit()
    db.refresh(insp)
    return insp

def delete_inspection(db: Session, inspection_id: str) -> bool:
    insp = get_inspection(db, inspection_id)
    if not insp:
        return False
    db.delete(insp)
    db.commit()
    return True
