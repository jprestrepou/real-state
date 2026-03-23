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
    administration_fee: Optional[float] = Field(None, ge=0)
    pays_administration: bool = Field(default=True)
    administration_day: Optional[int] = Field(None, ge=1, le=31)
    administration_payment_method: Optional[str] = Field(None, max_length=100)
    administration_payment_info: Optional[str] = None
    has_insurance: bool = Field(default=False)
    has_parking: bool = Field(default=False)
    has_elevator: bool = Field(default=False)
    has_pool: bool = Field(default=False)
    has_gym: bool = Field(default=False)
    status: str = Field(
        default="Disponible",
        pattern="^(Disponible|Arrendada|En Mantenimiento|Vendida)$",
    )
    notes: Optional[str] = None
    manager_id: Optional[str] = None
    stratum: Optional[int] = Field(None, ge=1, le=6)


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
    administration_fee: Optional[float] = Field(None, ge=0)
    pays_administration: Optional[bool] = None
    administration_day: Optional[int] = Field(None, ge=1, le=31)
    administration_payment_method: Optional[str] = Field(None, max_length=100)
    administration_payment_info: Optional[str] = None
    has_insurance: Optional[bool] = None
    has_parking: Optional[bool] = None
    has_elevator: Optional[bool] = None
    has_pool: Optional[bool] = None
    has_gym: Optional[bool] = None
    notes: Optional[str] = None
    manager_id: Optional[str] = None
    stratum: Optional[int] = Field(None, ge=1, le=6)


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
    administration_fee: Optional[float] = None
    pays_administration: bool
    administration_day: Optional[int] = None
    administration_payment_method: Optional[str] = None
    administration_payment_info: Optional[str] = None
    status: str
    notes: Optional[str] = None
    is_active: bool
    has_insurance: bool
    has_parking: bool
    has_elevator: bool
    has_pool: bool
    has_gym: bool
    stratum: Optional[int] = None
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


class RentSimulationRequest(BaseModel):
    property_id: str
    desired_margin_pct: float = Field(default=0.5, ge=0, le=100) # Monthly return on commercial value
    include_admin_fee: bool = True

class RentSimulationResponse(BaseModel):
    property_name: str
    commercial_value: float
    cadastral_value: Optional[float] = None
    administration_fee: float
    legal_max_rent: float # 1% of commercial value (Law 820/2003)
    suggested_rent: float # Admin fee + (Commercial * Margin)
    margin_profit: float
    is_legal: bool
    message: str
