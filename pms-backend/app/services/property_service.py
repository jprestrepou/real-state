"""
Property service — CRUD + map data.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.property import Property, PropertyStatus
from app.models.contract import Contract, ContractStatus
from app.models.occupant import PropertyOccupant
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.services import audit_service


async def list_properties(
    db: AsyncSession,
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
    count_stmt = select(func.count()).select_from(stmt.subquery())
    result = await db.execute(count_stmt)
    total = result.scalar() or 0

    # Paginate
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    properties = result.scalars().all()

    return properties, total


async def get_property(db: AsyncSession, property_id: str) -> Property:
    """Get a single property by ID."""
    stmt = select(Property).where(Property.id == property_id, Property.is_active == True)  # noqa: E712
    result = await db.execute(stmt)
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    return prop


async def create_property(db: AsyncSession, data: PropertyCreate, owner_id: str) -> Property:
    """Create a new property."""
    new_property = Property(
        owner_id=owner_id,
        **data.model_dump(),
    )
    db.add(new_property)
    await db.commit()
    await db.refresh(new_property)

    # Log action
    await audit_service.log_action(
        db,
        action="CREATE",
        entity_type="Property",
        user_id=owner_id,
        entity_id=new_property.id,
        new_value={"name": new_property.name, "status": new_property.status, "city": new_property.city}
    )

    return new_property


async def update_property(db: AsyncSession, property_id: str, data: PropertyUpdate) -> Property:
    """Update an existing property."""
    property_obj = await get_property(db, property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    old_data = {
        "name": property_obj.name,
        "status": property_obj.status,
        "commercial_value": float(property_obj.commercial_value) if property_obj.commercial_value else None,
        "administration_fee": float(property_obj.administration_fee) if property_obj.administration_fee else None,
    }

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(property_obj, key, value)

    await db.commit()
    await db.refresh(property_obj)

    new_data = {
        "name": property_obj.name,
        "status": property_obj.status,
        "commercial_value": float(property_obj.commercial_value) if property_obj.commercial_value else None,
        "administration_fee": float(property_obj.administration_fee) if property_obj.administration_fee else None,
    }
    await audit_service.log_action(
        db,
        action="UPDATE",
        entity_type="Property",
        entity_id=property_obj.id,
        old_value=old_data,
        new_value=new_data
    )

    return property_obj


async def delete_property(db: AsyncSession, property_id: str) -> None:
    """Soft delete a property."""
    prop = await get_property(db, property_id)
    prop.is_active = False
    await db.commit()


async def get_map_data(db: AsyncSession, owner_id: str | None = None) -> list[dict]:
    """Get property data for map markers."""
    stmt = select(Property).where(Property.is_active == True)  # noqa: E712
    if owner_id:
        stmt = stmt.where(Property.owner_id == owner_id)
    
    result_db = await db.execute(stmt)
    properties = result_db.scalars().all()

    result_list = []
    for p in properties:
        # Try to get monthly rent from active contract
        rent_stmt = select(Contract.monthly_rent).where(
            Contract.property_id == p.id,
            Contract.status == ContractStatus.ACTIVO.value,
        )
        rent_result = await db.execute(rent_stmt)
        rent = rent_result.scalar_one_or_none()

        result_list.append({
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "latitude": float(p.latitude),
            "longitude": float(p.longitude),
            "property_type": p.property_type,
            "city": p.city,
            "monthly_rent": float(rent) if rent else None,
        })
    return result_list


async def calculate_rent_simulation(db: AsyncSession, property_id: str, desired_margin_pct: float, include_admin_fee: bool) -> dict:
    """
    Calculate suggested rent based on Colombian Law 820/2003 and owner requirements.
    Limit: Monthly rent <= 1% of Commercial Value.
    """
    prop = await get_property(db, property_id)
    
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
