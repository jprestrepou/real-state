"""
Maintenance service — lifecycle management for work orders.
"""

from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.maintenance import MaintenanceOrder, MaintenanceStatus
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate
from app.schemas.financial import TransactionCreate
from app.models.financial import TransactionDirection, TransactionType


async def list_maintenance(
    db: AsyncSession,
    property_id: str | None = None,
    status_filter: str | None = None,
    maintenance_type: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[MaintenanceOrder], int]:
    stmt = select(MaintenanceOrder).options(
        selectinload(MaintenanceOrder.photos),
        selectinload(MaintenanceOrder.supplier)
    )
    if property_id:
        stmt = stmt.where(MaintenanceOrder.property_id == property_id)
    if status_filter:
        stmt = stmt.where(MaintenanceOrder.status == status_filter)
    if maintenance_type:
        stmt = stmt.where(MaintenanceOrder.maintenance_type == maintenance_type)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    result = await db.execute(count_stmt)
    total = result.scalar() or 0

    stmt = stmt.order_by(MaintenanceOrder.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    orders = result.scalars().all()
    return orders, total


async def get_maintenance(db: AsyncSession, order_id: str) -> MaintenanceOrder:
    stmt = select(MaintenanceOrder).options(
        selectinload(MaintenanceOrder.photos),
        selectinload(MaintenanceOrder.supplier)
    ).where(MaintenanceOrder.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Orden de mantenimiento no encontrada")
    return order


async def create_maintenance(db: AsyncSession, data: MaintenanceCreate, user_id: str) -> MaintenanceOrder:
    # Ensure properties that might be None from model_dump are handled
    create_data = data.model_dump()
    order = MaintenanceOrder(
        **create_data,
        created_by=user_id,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


async def update_maintenance(db: AsyncSession, order_id: str, data: MaintenanceUpdate) -> MaintenanceOrder:
    order = await get_maintenance(db, order_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
    await db.commit()
    await db.refresh(order)
    return order


async def update_status(db: AsyncSession, order_id: str, new_status: str, notes: str | None = None) -> MaintenanceOrder:
    order = await get_maintenance(db, order_id)
    order.status = new_status
    if notes:
        order.notes = (order.notes or "") + f"\n[{date.today()}] {notes}"
    if new_status == MaintenanceStatus.COMPLETADO.value:
        order.completed_date = date.today()
    await db.commit()
    await db.refresh(order)
    return order


async def complete_maintenance(
    db: AsyncSession, order_id: str, actual_cost: float, account_id: str, user_id: str, notes: str | None = None
) -> MaintenanceOrder:
    """Complete a maintenance order and register expense in ledger."""
    from app.services.ledger_service import register_transaction

    order = await get_maintenance(db, order_id)
    order.status = MaintenanceStatus.COMPLETADO.value
    order.actual_cost = actual_cost
    order.completed_date = date.today()
    if notes:
        order.notes = (order.notes or "") + f"\n[{date.today()}] Completado: {notes}"

    # Auto-register expense in ledger - ATOMIC (Rule #5)
    tx_data = TransactionCreate(
        account_id=account_id,
        property_id=order.property_id,
        transaction_type=TransactionType.GASTO.value,
        category="Gastos Mantenimiento",
        amount=actual_cost,
        direction=TransactionDirection.CREDIT.value,
        description=f"Mantenimiento: {order.title}",
        reference_id=order.id,
        reference_type="maintenance",
        transaction_date=date.today(),
    )
    await register_transaction(db, tx_data, user_id, commit=False)

    await db.commit()
    await db.refresh(order)
    return order


async def get_calendar(db: AsyncSession, property_id: str | None = None) -> list[dict]:
    """Get maintenance calendar (scheduled/preventive orders)."""
    stmt = select(MaintenanceOrder).where(
        MaintenanceOrder.status.in_([
            MaintenanceStatus.PENDIENTE.value,
            MaintenanceStatus.EN_PROGRESO.value,
        ]),
        MaintenanceOrder.scheduled_date.isnot(None),
    )
    if property_id:
        stmt = stmt.where(MaintenanceOrder.property_id == property_id)

    result = await db.execute(stmt)
    orders = result.scalars().all()
    
    return [
        {
            "id": o.id,
            "title": o.title,
            "type": o.maintenance_type,
            "status": o.status,
            "priority": o.priority,
            "scheduled_date": o.scheduled_date.isoformat() if o.scheduled_date else None,
            "property_id": o.property_id,
            "estimated_cost": float(o.estimated_cost) if o.estimated_cost else None,
        }
        for o in orders
    ]
