"""
Property schemas — Pydantic v2 request/response models.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PropertyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    property_type: str = Field(pattern="^(Apartamento|Casa|Local|Bodega|Oficina|Lote)$")
    address: str = Field(min_length=5)
    city: str = Field(min_length=2, max_length=100)
    country: str = Field(default="Colombia", max_length=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    area_sqm: float = Field(gt=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    cadastral_id: Optional[str] = Field(None, max_length=50)
    commercial_value: Optional[float] = Field(None, ge=0)
    status: str = Field(
        default="Disponible",
        pattern="^(Disponible|Arrendada|En Mantenimiento|Vendida)$",
    )
    notes: Optional[str] = None
    manager_id: Optional[str] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    property_type: Optional[str] = Field(None, pattern="^(Apartamento|Casa|Local|Bodega|Oficina|Lote)$")
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    area_sqm: Optional[float] = Field(None, gt=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    cadastral_id: Optional[str] = None
    commercial_value: Optional[float] = Field(None, ge=0)
    status: Optional[str] = Field(None, pattern="^(Disponible|Arrendada|En Mantenimiento|Vendida)$")
    notes: Optional[str] = None
    manager_id: Optional[str] = None


class PropertyResponse(BaseModel):
    id: str
    owner_id: str
    manager_id: Optional[str] = None
    name: str
    property_type: str
    address: str
    city: str
    country: str
    latitude: float
    longitude: float
    area_sqm: float
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    cadastral_id: Optional[str] = None
    commercial_value: Optional[float] = None
    status: str
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PropertyMapItem(BaseModel):
    id: str
    name: str
    status: str
    latitude: float
    longitude: float
    property_type: str
    city: str
    monthly_rent: Optional[float] = None

    model_config = {"from_attributes": True}
