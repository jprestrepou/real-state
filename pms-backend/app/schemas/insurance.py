from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class InsurancePolicyCreate(BaseModel):
    contract_id: str
    insurer: str = Field(..., min_length=2, max_length=200)
    policy_number: str = Field(..., min_length=2, max_length=100)
    coverage_amount: float = Field(..., gt=0)
    start_date: date
    end_date: date
    status: Optional[str] = "Vigente"

class InsurancePolicyUpdate(BaseModel):
    insurer: Optional[str] = Field(None, min_length=2, max_length=200)
    policy_number: Optional[str] = Field(None, min_length=2, max_length=100)
    coverage_amount: Optional[float] = Field(None, gt=0)
    end_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(Vigente|Vencida|Cancelada)$")

class InsurancePolicyResponse(BaseModel):
    id: str
    contract_id: str
    insurer: str
    policy_number: str
    coverage_amount: float
    start_date: date
    end_date: date
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class RiskScoreRequest(BaseModel):
    monthly_income: float = Field(..., gt=0)
    monthly_rent: float = Field(..., gt=0)
    credit_score: Optional[int] = Field(None, ge=300, le=850)

class RiskScoreResponse(BaseModel):
    risk_score: float
    risk_level: str
    debt_to_income_ratio: float
    recommendation: str
