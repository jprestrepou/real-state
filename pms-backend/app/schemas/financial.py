"""
Financial schemas — Pydantic v2 models for accounts, transactions, reports.
"""

from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field


# ── Invoices (Accounts Receivable) ─────────────────────────
class InvoiceBase(BaseModel):
    issue_date: date
    due_date: date
    amount: float = Field(gt=0)
    status: str = Field(pattern="^(Pendiente|Pagada|Vencida|Anulada)$")


class InvoiceCreate(InvoiceBase):
    contract_id: str
    property_id: str


class InvoiceResponse(InvoiceBase):
    id: str
    contract_id: str
    property_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Bank Accounts ────────────────────────────────────────
class AccountCreate(BaseModel):
    account_name: str = Field(min_length=2, max_length=200)
    account_type: str = Field(pattern="^(Corriente|Ahorros|Inversión|Caja Menor)$")
    bank_name: Optional[str] = Field(None, max_length=100)
    account_number: Optional[str] = Field(None, max_length=50)
    currency: str = Field(default="COP", max_length=3)
    initial_balance: float = Field(default=0, ge=0)


class AccountUpdate(BaseModel):
    account_name: Optional[str] = Field(None, min_length=2, max_length=200)
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    current_balance: Optional[float] = Field(None, description="Saldo inicial/ajustado de la cuenta")
    is_active: Optional[bool] = None


class AccountResponse(BaseModel):
    id: str
    account_name: str
    account_type: str
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    currency: str
    current_balance: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Transactions ─────────────────────────────────────────
class TransactionCreate(BaseModel):
    account_id: str
    property_id: Optional[str] = None
    budget_category_id: Optional[str] = None
    transaction_type: str = Field(pattern="^(Ingreso|Gasto|Transferencia|Ajuste|Interés|Abono|Crédito)$")
    status: str = Field(default="Completada", pattern="^(Pendiente|Completada|Cancelada)$")
    category: str = Field(min_length=2, max_length=100)
    amount: float = Field(gt=0)
    direction: Optional[str] = Field(None, pattern="^(Debit|Credit)$")
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    invoice_id: Optional[str] = None
    is_reconciled: bool = False
    transaction_date: date


class TransferCreate(BaseModel):
    source_account_id: str
    destination_account_id: str
    amount: float = Field(gt=0)
    description: str = Field(min_length=2)
    transaction_date: date


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    category: Optional[str] = None
    budget_category_id: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    transaction_type: Optional[str] = Field(None, pattern="^(Ingreso|Gasto|Transferencia|Ajuste|Interés|Abono|Crédito)$")
    status: Optional[str] = Field(None, pattern="^(Pendiente|Completada|Cancelada)$")
    transaction_date: Optional[date] = None


class TransactionResponse(BaseModel):
    id: str
    account_id: str
    property_id: Optional[str] = None
    budget_category_id: Optional[str] = None
    transaction_type: str
    status: str
    category: str
    amount: float
    direction: str
    description: str
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    invoice_id: Optional[str] = None
    is_reconciled: bool
    invoice_file: Optional[str] = None
    transaction_date: date
    recorded_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Report / Reconciliation ──────────────────────────────
class ReconciliationRequest(BaseModel):
    transaction_ids: List[str]
class CashFlowMonth(BaseModel):
    month: str
    income: float
    expenses: float
    net: float


class CashFlowReport(BaseModel):
    property_id: Optional[str] = None
    months: list[CashFlowMonth]
    total_income: float
    total_expenses: float
    total_net: float


class FinancialSummary(BaseModel):
    total_properties: int
    total_income: float
    total_expenses: float
    net_income: float
    occupancy_rate: float
    accounts: list[AccountResponse]


class PropertyPerformanceResponse(BaseModel):
    property_name: str
    property_status: Optional[str] = None
    total_income: float
    total_expenses: float
    net_profit: float
    noi: float = 0.0
    cap_rate: float = 0.0
    gross_yield: float = 0.0
    roi: float
    monthly_cashflow: list[CashFlowMonth]
    income_by_category: dict[str, float]
    expense_by_category: dict[str, float]
    last_transactions: list[TransactionResponse]


class BalanceSheetResponse(BaseModel):
    date: date
    accounts: list[AccountResponse]
    total_assets: float
    equity: float


class IncomeStatementResponse(BaseModel):
    period: dict # {"start": date, "end": date}
    income: dict[str, float]
    expenses: dict[str, float]
    total_income: float
    total_expense: float
    net_income: float

class AccountProfitabilityMonth(BaseModel):
    month: int
    month_name: str
    starting_balance: float
    interest_earned: float
    profitability_pct: float

class AccountProfitabilityReport(BaseModel):
    account_id: str
    year: int
    total_interest_earned: float
    average_profitability_pct: float
    months: list[AccountProfitabilityMonth]
