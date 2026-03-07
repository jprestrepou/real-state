"""
Budget schemas — Pydantic v2 models.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BudgetCategoryCreate(BaseModel):
    category_name: str = Field(min_length=2, max_length=100)
    budgeted_amount: float = Field(gt=0)
    is_distributable: bool = False


class BudgetCreate(BaseModel):
    property_id: str
    year: int = Field(ge=2020, le=2100)
    month: int = Field(ge=1, le=12, default=1)
    total_budget: float = Field(ge=0, default=0.0) # Can be 0 if auto-calculating
    categories: list[BudgetCategoryCreate] = []
    notes: Optional[str] = None
    is_annual: bool = False
    auto_calculate_total: bool = False


class BudgetUpdate(BaseModel):
    total_budget: Optional[float] = None
    categories: Optional[list[BudgetCategoryCreate]] = None
    notes: Optional[str] = None
    auto_calculate_total: Optional[bool] = None


class BudgetDuplicate(BaseModel):
    target_year: int = Field(ge=2020, le=2100)
    target_month: int = Field(ge=1, le=12)
    target_property_id: Optional[str] = None
    percentage_increase: float = Field(default=0.0)


class BudgetCategoryResponse(BaseModel):
    id: str
    category_name: str
    budgeted_amount: float
    executed_amount: float
    execution_pct: float
    is_distributable: bool
    semaphore: str

    model_config = {"from_attributes": True}


class BudgetResponse(BaseModel):
    id: str
    property_id: str
    year: int
    month: int
    total_budget: float
    total_executed: float
    auto_calculate_total: bool
    execution_pct: float
    semaphore: str
    categories: list[BudgetCategoryResponse] = []
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
class BudgetReportRow(BaseModel):
    category: str
    budgeted: float
    actual: float
    is_distributable: bool
    distribution: dict[str, float] = {}

class BudgetReport(BaseModel):
    property_id: str
    year: int
    month: int
    rows: list[BudgetReportRow]

    model_config = {"from_attributes": True}
