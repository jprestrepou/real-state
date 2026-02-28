"""
Contact schemas — Pydantic v2 request/response models.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ContactBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    contact_type: str = Field(..., pattern="^(Proveedor|Cliente|Arrendatario|Otro)$")
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    contact_type: Optional[str] = Field(None, pattern="^(Proveedor|Cliente|Arrendatario|Otro)$")
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class ContactResponse(ContactBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
