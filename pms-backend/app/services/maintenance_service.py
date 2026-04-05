"""
Maintenance service — lifecycle management for work orders.
"""

import logging
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.maintenance import MaintenanceOrder, MaintenanceStatus
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate
from app.schemas.financial import TransactionCreate
from app.models.financial import TransactionDirection, TransactionType

logger = logging.getLogger(__name__)

# Status emoji map for Telegram messages
_STATUS_EMOJI = {
    "Pendiente": "⏳",
    "En Progreso": "🔧",
    "Esperando Factura": "🧾",
    "Completado": "✅",
    "Cancelado": "❌",
}


async def _notify_reporter(db: AsyncSession, order: MaintenanceOrder, message: str) -> None:
    """Send a Telegram message to the original reporter if they used the bot."""
    if not order.telegram_chat_id:
        return
    try:
        from app.services.telegram_service import TelegramService
        await TelegramService.send_message(db, order.telegram_chat_id, message)
    except Exception as e:
        logger.warning(f"Could not send Telegram update to reporter: {e}")


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
    # Reload with relationships to prevent lazy-load errors during async serialization
    stmt = (
        select(MaintenanceOrder)
        .options(
            selectinload(MaintenanceOrder.photos),
            selectinload(MaintenanceOrder.supplier),
        )
        .where(MaintenanceOrder.id == order.id)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def update_maintenance(db: AsyncSession, order_id: str, data: MaintenanceUpdate) -> MaintenanceOrder:
    order = await get_maintenance(db, order_id)
    old_status = order.status
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
    await db.commit()
    # Reload with relationships to prevent lazy-load errors during async serialization
    stmt = (
        select(MaintenanceOrder)
        .options(
            selectinload(MaintenanceOrder.photos),
            selectinload(MaintenanceOrder.supplier),
        )
        .where(MaintenanceOrder.id == order_id)
    )
    result = await db.execute(stmt)
    refreshed = result.scalar_one()

    # Notify Telegram reporter if status changed via general update
    new_status = refreshed.status
    if old_status != new_status and refreshed.telegram_chat_id:
        emoji = _STATUS_EMOJI.get(new_status, "📢")
        msg = (
            f"{emoji} *Actualización de tu reporte*\n\n"
            f"📋 *Reporte:* {refreshed.title}\n"
            f"🔄 *Estado:* {new_status}\n"
            f"_Ticket: `{refreshed.id[:8]}...`_"
        )
        await _notify_reporter(db, refreshed, msg)

    return refreshed


async def update_status(db: AsyncSession, order_id: str, new_status: str, notes: str | None = None) -> MaintenanceOrder:
    order = await get_maintenance(db, order_id)
    old_status = order.status
    order.status = new_status
    if notes:
        order.notes = (order.notes or "") + f"\n[{date.today()}] {notes}"
    if new_status == MaintenanceStatus.COMPLETADO.value:
        order.completed_date = date.today()
    await db.commit()
    # Reload with relationships to prevent lazy-load errors during async serialization
    stmt = (
        select(MaintenanceOrder)
        .options(
            selectinload(MaintenanceOrder.photos),
            selectinload(MaintenanceOrder.supplier),
        )
        .where(MaintenanceOrder.id == order_id)
    )
    result = await db.execute(stmt)
    refreshed = result.scalar_one()

    # Notify Telegram reporter if status changed
    if old_status != new_status and refreshed.telegram_chat_id:
        emoji = _STATUS_EMOJI.get(new_status, "📢")
        msg_lines = [
            f"{emoji} *Actualización de tu reporte*",
            f"",
            f"🏠 *Propiedad:* {refreshed.property_id}",
            f"📋 *Reporte:* {refreshed.title}",
            f"🔄 *Estado:* {new_status}",
        ]
        if notes:
            msg_lines.append(f"📝 *Nota:* {notes}")
        msg_lines.append(f"\'\n_Ticket: `{refreshed.id[:8]}...`_")
        await _notify_reporter(db, refreshed, "\n".join(msg_lines))

    return refreshed


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

    # Notify Telegram reporter that the work is done
    if order.telegram_chat_id:
        cost_str = f"${actual_cost:,.2f}" if actual_cost else "No indicado"
        msg = (
            f"✅ *¡Tu reporte fue resuelto!*\n\n"
            f"📋 *Reporte:* {order.title}\n"
            f"🔄 *Estado:* Completado\n"
            f"💰 *Costo real:* {cost_str}\n"
            f"📅 *Fecha:* {date.today().strftime('%d/%m/%Y')}\n"
        )
        if notes:
            msg += f"📝 *Notas:* {notes}\n"
        msg += f"_Ticket: `{order.id[:8]}...`_"
        await _notify_reporter(db, order, msg)

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


async def upload_quote(db: AsyncSession, order_id: str, file_path: str) -> MaintenanceOrder:
    order = await get_maintenance(db, order_id)
    order.quote_file = file_path
    order.status = MaintenanceStatus.ESPERANDO_APROBACION.value
    await db.commit()
    
    # Reload for response
    stmt = (
        select(MaintenanceOrder)
        .options(
            selectinload(MaintenanceOrder.photos),
            selectinload(MaintenanceOrder.supplier),
        )
        .where(MaintenanceOrder.id == order_id)
    )
    result = await db.execute(stmt)
    refreshed = result.scalar_one()

    # Notify Telegram reporter
    if refreshed.telegram_chat_id:
        msg = (
            f"📄 *Cotización Recibida*\n\n"
            f"📋 *Reporte:* {refreshed.title}\n"
            f"👨‍🔧 Se ha recibido una cotización del proveedor y está pendiente de aprobación.\n"
            f"_Ticket: `{refreshed.id[:8]}...`_"
        )
        await _notify_reporter(db, refreshed, msg)
        
    return refreshed


async def approve_quote(db: AsyncSession, order_id: str, user_id: str) -> MaintenanceOrder:
    from datetime import datetime
    order = await get_maintenance(db, order_id)
    
    if not order.quote_file:
        raise HTTPException(status_code=400, detail="Esta orden no tiene cotización para aprobar")
        
    order.is_approved = True
    order.approved_by = user_id
    order.approved_at = datetime.utcnow()
    order.status = MaintenanceStatus.EN_PROGRESO.value
    await db.commit()
    
    # Reload for response
    stmt = (
        select(MaintenanceOrder)
        .options(
            selectinload(MaintenanceOrder.photos),
            selectinload(MaintenanceOrder.supplier),
        )
        .where(MaintenanceOrder.id == order_id)
    )
    result = await db.execute(stmt)
    refreshed = result.scalar_one()

    # Notify Telegram reporter
    if refreshed.telegram_chat_id:
        msg = (
            f"✅ *Cotización Aprobada*\n\n"
            f"📋 *Reporte:* {refreshed.title}\n"
            f"🛠️ La cotización ha sido aprobada y el trabajo entrará 'En Progreso'.\n"
            f"_Ticket: `{refreshed.id[:8]}...`_"
        )
        await _notify_reporter(db, refreshed, msg)
        
    return refreshed
