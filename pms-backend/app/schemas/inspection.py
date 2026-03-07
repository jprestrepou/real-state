from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field

class InspectionBase(BaseModel):
    inspection_type: str = Field(pattern="^(Preventiva|Entrega|Recibo|Rutinaria)$")
    scheduled_date: date
    completed_date: Optional[date] = None
    status: str = Field(default="Programada", pattern="^(Programada|Realizada|Cancelada)$")
    inspector_name: Optional[str] = Field(None, max_length=200)
    findings: Optional[str] = None

class InspectionCreate(InspectionBase):
    property_id: str

class InspectionUpdate(BaseModel):
    inspection_type: Optional[str] = Field(None, pattern="^(Preventiva|Entrega|Recibo|Rutinaria)$")
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(Programada|Realizada|Cancelada)$")
    inspector_name: Optional[str] = None
    findings: Optional[str] = None

class InspectionResponse(InspectionBase):
    id: str
    property_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
