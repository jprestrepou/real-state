"""
Inventory Service — logic for property inventories.
"""

from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.inventory import PropertyInventory, InventoryItem, InventoryPhoto
from app.schemas.inventory import InventoryCreate, ItemCreate


def _load_options():
    """Reusable eager-load chain for inventories with items and photos."""
    return selectinload(PropertyInventory.items).selectinload(InventoryItem.photos)


async def list_inventories(db: AsyncSession, property_id: str):
    stmt = (
        select(PropertyInventory)
        .options(_load_options())
        .where(PropertyInventory.property_id == property_id)
        .order_by(PropertyInventory.date.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_inventory(db: AsyncSession, inventory_id: str):
    stmt = (
        select(PropertyInventory)
        .options(_load_options())
        .where(PropertyInventory.id == inventory_id)
    )
    result = await db.execute(stmt)
    inventory = result.scalar_one_or_none()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    return inventory


async def create_inventory(db: AsyncSession, data: InventoryCreate, user_id: str):
    inventory = PropertyInventory(
        **data.model_dump(exclude={"items"}),
        created_by=user_id
    )
    db.add(inventory)
    await db.flush()

    # Add items if provided
    if data.items:
        for item_data in data.items:
            item = InventoryItem(
                **item_data.model_dump(),
                inventory_id=inventory.id
            )
            db.add(item)

    await db.commit()

    # Re-query with eager-loaded relationships to avoid lazy-load issues
    stmt = (
        select(PropertyInventory)
        .options(_load_options())
        .where(PropertyInventory.id == inventory.id)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def delete_inventory(db: AsyncSession, inventory_id: str):
    inventory = await get_inventory(db, inventory_id)
    await db.delete(inventory)
    await db.commit()
    return True


async def add_item_to_inventory(db: AsyncSession, inventory_id: str, data: ItemCreate):
    item = InventoryItem(
        **data.model_dump(),
        inventory_id=inventory_id
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def add_photo_to_item(db: AsyncSession, item_id: str, photo_path: str, caption: str = None):
    photo = InventoryPhoto(
        inventory_item_id=item_id,
        photo_path=photo_path,
        caption=caption
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return photo
