"""
Contact service — CRUD logic for contacts.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate


async def list_contacts(
    db: AsyncSession,
    contact_type: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Contact], int]:
    """List contacts with filters and pagination."""
    stmt = select(Contact).where(Contact.is_active == True)  # noqa: E712

    if contact_type:
        stmt = stmt.where(Contact.contact_type == contact_type)
    if search:
        stmt = stmt.where(Contact.name.ilike(f"%{search}%"))

    # Count total
    from sqlalchemy import func
    count_stmt = select(func.count()).select_from(stmt.subquery())
    result = await db.execute(count_stmt)
    total = result.scalar() or 0

    # Paginate
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    contacts = result.scalars().all()

    return contacts, total


async def get_contact(db: AsyncSession, contact_id: str) -> Contact:
    """Get a single contact by ID."""
    stmt = select(Contact).where(Contact.id == contact_id, Contact.is_active == True)  # noqa: E712
    result = await db.execute(stmt)
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contacto no encontrado")
    return contact


async def create_contact(db: AsyncSession, data: ContactCreate) -> Contact:
    """Create a new contact."""
    contact = Contact(**data.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


async def update_contact(db: AsyncSession, contact_id: str, data: ContactUpdate) -> Contact:
    """Update an existing contact."""
    contact = await get_contact(db, contact_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contact, key, value)
    await db.commit()
    await db.refresh(contact)
    return contact


async def delete_contact(db: AsyncSession, contact_id: str) -> None:
    """Soft delete a contact."""
    contact = await get_contact(db, contact_id)
    contact.is_active = False
    await db.commit()


async def get_supplier_stats(db: AsyncSession, contact_id: str) -> dict:
    """Calculate basic metrics for a supplier based on maintenance orders."""
    from app.models.maintenance import MaintenanceOrder, MaintenanceStatus
    from sqlalchemy import select, func
    
    # Needs to be a valid, active contact (ideally of type PROVEEDOR, but we won't strictly enforce if user is flexible)
    await get_contact(db, contact_id)

    # 1. Total Pending Invoices (amount) where status = ESPERANDO_FACTURA or COMPLETADO but unpaid
    # For now, we use ESPERANDO_FACTURA to mean they haven't been paid yet.
    stmt_pending = select(func.sum(MaintenanceOrder.actual_cost)).where(
        MaintenanceOrder.supplier_id == contact_id,
        MaintenanceOrder.status == MaintenanceStatus.ESPERANDO_FACTURA.value
    )
    result_pending = await db.execute(stmt_pending)
    pending_amount = result_pending.scalar() or 0.0

    # 2. Average Cost of completed orders
    stmt_avg = select(func.avg(MaintenanceOrder.actual_cost)).where(
        MaintenanceOrder.supplier_id == contact_id,
        MaintenanceOrder.status == MaintenanceStatus.COMPLETADO.value
    )
    result_avg = await db.execute(stmt_avg)
    avg_cost = result_avg.scalar() or 0.0

    # 3. Order Completion Counts (Total, Completed, Cancelled)
    stmt_counts = select(MaintenanceOrder.status, func.count(MaintenanceOrder.id)).where(
        MaintenanceOrder.supplier_id == contact_id
    ).group_by(MaintenanceOrder.status)
    result_counts = await db.execute(stmt_counts)
    counts = {r[0]: r[1] for r in result_counts.all()}

    total_orders = sum(counts.values())
    completed_orders = counts.get(MaintenanceStatus.COMPLETADO.value, 0)
    cancelled_orders = counts.get(MaintenanceStatus.CANCELADO.value, 0)
    
    # 4. Response Time (Average days between created_at and approved_at or en_progreso)
    # We will approximate this if approved_at is present.
    stmt_times = select(
        func.avg(
            func.julianday(MaintenanceOrder.approved_at) - func.julianday(MaintenanceOrder.created_at)
        )
    ).where(
        MaintenanceOrder.supplier_id == contact_id,
        MaintenanceOrder.approved_at.isnot(None)
    )
    result_times = await db.execute(stmt_times)
    avg_response_days = result_times.scalar() or 0.0

    return {
        "pending_invoices_amount": float(pending_amount),
        "average_cost": float(avg_cost),
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "average_response_days": float(avg_response_days)
    }
