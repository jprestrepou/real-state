"""
BudgetProject schemas — Pydantic v2 models for project and quote management.
"""

from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, Field


# ── Quotes ────────────────────────────────────────────────────
class ProjectQuoteCreate(BaseModel):
    supplier_name: str = Field(min_length=2, max_length=200)
    supplier_id: Optional[str] = None
    amount: float = Field(gt=0)
    currency: str = Field(default="COP", max_length=3)
    description: Optional[str] = None
    validity_days: Optional[int] = Field(None, ge=1)
    submitted_date: Optional[date] = None


class ProjectQuoteResponse(BaseModel):
    id: str
    project_id: str
    supplier_name: str
    supplier_id: Optional[str] = None
    amount: float
    currency: str
    description: Optional[str] = None
    validity_days: Optional[int] = None
    quote_file: Optional[str] = None
    is_selected: bool
    submitted_date: Optional[date] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Projects ──────────────────────────────────────────────────
class BudgetProjectCreate(BaseModel):
    title: str = Field(min_length=3, max_length=300)
    description: Optional[str] = None
    project_type: str = Field(
        default="Mantenimiento",
        pattern=r"^(Mantenimiento|Mejora|Remodelación|Otro)$"
    )
    priority: str = Field(
        default="Media",
        pattern=r"^(Urgente|Alta|Media|Baja)$"
    )
    property_id: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    scheduled_start: Optional[date] = None
    scheduled_end: Optional[date] = None
    notes: Optional[str] = None


class BudgetProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=300)
    description: Optional[str] = None
    project_type: Optional[str] = Field(
        None, pattern=r"^(Mantenimiento|Mejora|Remodelación|Otro)$"
    )
    status: Optional[str] = Field(
        None,
        pattern=r"^(Borrador|Cotizando|Aprobado|En Ejecución|Completado|Cancelado)$"
    )
    priority: Optional[str] = Field(
        None, pattern=r"^(Urgente|Alta|Media|Baja)$"
    )
    property_id: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    scheduled_start: Optional[date] = None
    scheduled_end: Optional[date] = None
    completed_date: Optional[date] = None
    notes: Optional[str] = None


class BudgetProjectResponse(BaseModel):
    id: str
    budget_id: str
    property_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    project_type: str
    status: str
    priority: str
    estimated_cost: Optional[float] = None
    approved_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    approved_quote_id: Optional[str] = None
    scheduled_start: Optional[date] = None
    scheduled_end: Optional[date] = None
    completed_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    quotes: list[ProjectQuoteResponse] = []

    model_config = {"from_attributes": True}
