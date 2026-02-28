"""
Contacts Router — Endpoints for managing providers, clients, and tenants.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.services import contact_service

router = APIRouter(prefix="/contacts", tags=["Contactos"])


@router.get("/", response_model=dict)
def get_contacts(
    contact_type: str | None = Query(None, description="Filtrar por tipo (Proveedor, Cliente, etc)"),
    search: str | None = Query(None, description="Buscar por nombre"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contacts, total = contact_service.list_contacts(
        db, contact_type=contact_type, search=search, page=page, limit=limit
    )
    return {
        "items": contacts,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{contact_id}", response_model=ContactResponse)
def get_single_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return contact_service.get_contact(db, contact_id)


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_new_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return contact_service.create_contact(db, contact_in)


@router.patch("/{contact_id}", response_model=ContactResponse)
def update_existing_contact(
    contact_id: str,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return contact_service.update_contact(db, contact_id, contact_in)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact_service.delete_contact(db, contact_id)
