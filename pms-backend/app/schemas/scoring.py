"""
Scoring schemas — Pydantic models for risk assessment.
"""

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any

class ScoringInput(BaseModel):
    tenant_name: str
    tenant_document: Optional[str] = None
    property_id: Optional[str] = None
    monthly_rent: float
    monthly_income: float
    income_type: str # Empleado_Formal, Independiente, Pensionado, Rentista
    employment_months: int
    has_cosigner: bool
    previous_evictions: bool
    credit_report_status: str # Sin_reporte, Sin_mora, Con_mora, Castigado
    has_rental_insurance: bool

class ScoringResponse(BaseModel):
    id: str
    tenant_name: str
    score: float
    risk_level: str
    alerts: Dict[str, Any]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
