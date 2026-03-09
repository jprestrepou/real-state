"""
Inventory schemas — Pydantic models for request/response validation.
"""

from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import List, Optional

class PhotoResponse(BaseModel):
    id: str
    photo_path: str
    caption: Optional[str] = None
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ItemBase(BaseModel):
    category: str
    item_name: str
    condition: str
    quantity: int = 1
    notes: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: str
    photos: List[PhotoResponse] = []
    model_config = ConfigDict(from_attributes=True)

class InventoryBase(BaseModel):
    property_id: str
    contract_id: Optional[str] = None
    inventory_type: str
    date: date
    notes: Optional[str] = None

class InventoryCreate(InventoryBase):
    items: Optional[List[ItemCreate]] = None

class InventoryResponse(InventoryBase):
    id: str
    created_by: str
    created_at: datetime
    items: List[ItemResponse] = []
    model_config = ConfigDict(from_attributes=True)
