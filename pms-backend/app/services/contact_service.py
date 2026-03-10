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
    db.commit()
    db.refresh(contact)
    return contact


async def delete_contact(db: AsyncSession, contact_id: str) -> None:
    """Soft delete a contact."""
    contact = await get_contact(db, contact_id)
    contact.is_active = False
    await db.commit()
