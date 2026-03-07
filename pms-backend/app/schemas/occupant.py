"""
Occupant schemas — Pydantic v2 models.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class OccupantCreate(BaseModel):
    property_id: str
    full_name: str = Field(min_length=2, max_length=200)
    dni: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    is_primary: bool = False


class OccupantUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    dni: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    is_primary: Optional[bool] = None


class OccupantResponse(BaseModel):
    id: str
    property_id: str
    full_name: str
    dni: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_primary: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
