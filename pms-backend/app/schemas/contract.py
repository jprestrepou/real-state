"""
Contract schemas — Pydantic v2 models.
"""

from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, Field


class ContractCreate(BaseModel):
    property_id: str
    tenant_name: str = Field(min_length=2, max_length=200)
    tenant_email: Optional[str] = None
    tenant_phone: Optional[str] = None
    tenant_document: Optional[str] = None
    contract_type: str = Field(pattern="^(Vivienda|Comercial|Garaje)$")
    monthly_rent: float = Field(gt=0)
    deposit_amount: Optional[float] = Field(None, ge=0)
    start_date: date
    end_date: date
    auto_renewal: bool = False
    annual_increment_pct: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None


class ContractUpdate(BaseModel):
    tenant_name: Optional[str] = Field(None, min_length=2, max_length=200)
    tenant_email: Optional[str] = None
    tenant_phone: Optional[str] = None
    monthly_rent: Optional[float] = Field(None, gt=0)
    end_date: Optional[date] = None
    auto_renewal: Optional[bool] = None
    annual_increment_pct: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, pattern="^(Borrador|Activo|Finalizado|Cancelado)$")
    notes: Optional[str] = None


class ContractResponse(BaseModel):
    id: str
    property_id: str
    tenant_name: str
    tenant_email: Optional[str] = None
    tenant_phone: Optional[str] = None
    tenant_document: Optional[str] = None
    contract_type: str
    monthly_rent: float
    deposit_amount: Optional[float] = None
    start_date: date
    end_date: date
    auto_renewal: bool
    annual_increment_pct: Optional[float] = None
    status: str
    pdf_file: Optional[str] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentScheduleResponse(BaseModel):
    id: str
    contract_id: str
    due_date: date
    amount: float
    status: str
    transaction_id: Optional[str] = None
    paid_date: Optional[date] = None

    model_config = {"from_attributes": True}
