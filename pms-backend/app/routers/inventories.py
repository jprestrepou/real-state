"""
Inventory Router — /api/v1/inventories endpoints.
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.schemas.inventory import InventoryCreate, InventoryResponse, ItemCreate, ItemResponse
from app.services import inventory_service
from app.utils.security import get_current_user, require_role
import os
import uuid

router = APIRouter(prefix="/inventories", tags=["Inventarios"])


@router.get("/property/{property_id}", response_model=List[InventoryResponse])
async def list_property_inventories(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await inventory_service.list_inventories(db, property_id)


@router.post("", response_model=InventoryResponse, status_code=201)
async def create_inventory(
    data: InventoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await inventory_service.create_inventory(db, data, current_user.id)


# ── Static sub-routes before /{inventory_id} ──────────────────────────────────

@router.post("/items/{item_id}/photos")
async def upload_item_photo(
    item_id: str,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    upload_dir = "uploads/inventories"
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, file_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    photo = await inventory_service.add_photo_to_item(db, item_id, file_path, caption)
    return photo


# ── Parameterized routes ──────────────────────────────────────────────────────

@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory(
    inventory_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await inventory_service.get_inventory(db, inventory_id)


@router.post("/{inventory_id}/items", response_model=ItemResponse)
async def add_item(
    inventory_id: str,
    data: ItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await inventory_service.add_item_to_inventory(db, inventory_id, data)


@router.get("/{inventory_id}/export/pdf")
async def export_inventory_pdf(
    inventory_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Exportar el acta de inventario/entrega en PDF."""
    from app.services.pdf_service import generate_inventory_pdf
    inventory = await inventory_service.get_inventory(db, inventory_id)
    filepath = await generate_inventory_pdf(inventory)
    inv_type = getattr(inventory, "inventory_type", "inventario").lower()
    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=f"acta_{inv_type}_{inventory_id[:8]}.pdf"
    )


@router.delete("/{inventory_id}", status_code=204)
async def delete_inventory(
    inventory_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor", "Propietario"))
):
    """Eliminar un inventario y sus ítems."""
    await inventory_service.delete_inventory(db, inventory_id)
    return None
