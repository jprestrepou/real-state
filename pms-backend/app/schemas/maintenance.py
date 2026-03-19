"""
Maintenance schemas — Pydantic v2 models.
"""

from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, Field


class SupplierInfo(BaseModel):
    """Minimal contact info for maintenance supplier relationship."""
    id: str
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None

    model_config = {"from_attributes": True}


class MaintenanceCreate(BaseModel):
    property_id: str
    title: str = Field(min_length=3, max_length=300)
    maintenance_type: str = Field(pattern="^(Correctivo|Preventivo|Mejora)$")
    priority: str = Field(default="Media", pattern="^(Urgente|Alta|Media|Baja)$")
    estimated_cost: Optional[float] = Field(None, ge=0)
    supplier_name: Optional[str] = Field(None, max_length=200)
    supplier_id: Optional[str] = None
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None


class MaintenanceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=300)
    maintenance_type: Optional[str] = Field(None, pattern="^(Correctivo|Preventivo|Mejora)$")
    status: Optional[str] = Field(None, pattern="^(Pendiente|En Progreso|Esperando Factura|Completado|Cancelado)$")
    priority: Optional[str] = Field(None, pattern="^(Urgente|Alta|Media|Baja)$")
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    supplier_name: Optional[str] = None
    supplier_id: Optional[str] = None
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None


class MaintenanceStatusUpdate(BaseModel):
    status: str = Field(pattern="^(Pendiente|En Progreso|Esperando Factura|Completado|Cancelado)$")
    notes: Optional[str] = None


class MaintenanceComplete(BaseModel):
    actual_cost: float = Field(gt=0)
    account_id: str
    notes: Optional[str] = None


class MaintenancePhotoResponse(BaseModel):
    id: str
    photo_path: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class MaintenanceResponse(BaseModel):
    id: str
    property_id: str
    title: str
    maintenance_type: str
    status: str
    priority: str
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    supplier_name: Optional[str] = None
    supplier_id: Optional[str] = None
    supplier: Optional[SupplierInfo] = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    invoice_file: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    photos: list[MaintenancePhotoResponse] = []

    model_config = {"from_attributes": True}
