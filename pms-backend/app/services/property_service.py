"""
Property service — CRUD + map data.
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.property import Property
from app.models.contract import Contract, ContractStatus
from app.schemas.property import PropertyCreate, PropertyUpdate


def list_properties(
    db: Session,
    owner_id: str | None = None,
    status_filter: str | None = None,
    city: str | None = None,
    property_type: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Property], int]:
    """List properties with filters and pagination."""
    stmt = select(Property).where(Property.is_active == True)  # noqa: E712

    if owner_id:
        stmt = stmt.where(Property.owner_id == owner_id)
    if status_filter:
        stmt = stmt.where(Property.status == status_filter)
    if city:
        stmt = stmt.where(Property.city.ilike(f"%{city}%"))
    if property_type:
        stmt = stmt.where(Property.property_type == property_type)

    # Count total
    from sqlalchemy import func
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar() or 0

    # Paginate
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    properties = db.execute(stmt).scalars().all()

    return properties, total


def get_property(db: Session, property_id: str) -> Property:
    """Get a single property by ID."""
    stmt = select(Property).where(Property.id == property_id, Property.is_active == True)  # noqa: E712
    prop = db.execute(stmt).scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    return prop


def create_property(db: Session, data: PropertyCreate, owner_id: str) -> Property:
    """Create a new property."""
    prop = Property(
        owner_id=owner_id,
        **data.model_dump(),
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


def update_property(db: Session, property_id: str, data: PropertyUpdate) -> Property:
    """Update an existing property."""
    prop = get_property(db, property_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prop, key, value)
    db.commit()
    db.refresh(prop)
    return prop


def delete_property(db: Session, property_id: str) -> None:
    """Soft delete a property."""
    prop = get_property(db, property_id)
    prop.is_active = False
    db.commit()


def get_map_data(db: Session, owner_id: str | None = None) -> list[dict]:
    """Get property data for map markers."""
    stmt = select(Property).where(Property.is_active == True)  # noqa: E712
    if owner_id:
        stmt = stmt.where(Property.owner_id == owner_id)
    properties = db.execute(stmt).scalars().all()

    result = []
    for p in properties:
        # Try to get monthly rent from active contract
        rent_stmt = select(Contract.monthly_rent).where(
            Contract.property_id == p.id,
            Contract.status == ContractStatus.ACTIVO.value,
        )
        rent = db.execute(rent_stmt).scalar_one_or_none()

        result.append({
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "latitude": float(p.latitude),
            "longitude": float(p.longitude),
            "property_type": p.property_type,
            "city": p.city,
            "monthly_rent": float(rent) if rent else None,
        })


def calculate_rent_simulation(db: Session, property_id: str, desired_margin_pct: float, include_admin_fee: bool) -> dict:
    """
    Calculate suggested rent based on Colombian Law 820/2003 and owner requirements.
    Limit: Monthly rent <= 1% of Commercial Value.
    """
    prop = get_property(db, property_id)
    
    comm_val = float(prop.commercial_value or 0)
    admin_fee = float(prop.administration_fee or 0)
    
    # Law 820 of 2003 (Colombia) - Art 18: Max 1% of commercial value
    legal_max = comm_val * 0.01
    
    # Calculation: Margin is usually return on equity/investment
    # Suggested = Costs (Admin) + Profit (Margin on commercial value)
    profit_goal = comm_val * (desired_margin_pct / 100)
    
    suggested = profit_goal
    if include_admin_fee:
        suggested += admin_fee
        
    is_legal = suggested <= legal_max
    
    message = "El valor sugerido está dentro del límite legal (1% del valor comercial)."
    if not is_legal:
        message = f"ADVERTENCIA: El valor sugerido (${suggested:,.2f}) excede el límite legal de la Ley 820 (${legal_max:,.2f})."
    
    return {
        "property_name": prop.name,
        "commercial_value": comm_val,
        "administration_fee": admin_fee,
        "legal_max_rent": legal_max,
        "suggested_rent": suggested,
        "margin_profit": profit_goal,
        "is_legal": is_legal,
        "message": message
    }
