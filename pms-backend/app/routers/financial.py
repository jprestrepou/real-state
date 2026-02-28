"""
Financial router — /api/v1/accounts + /api/v1/transactions + /api/v1/reports endpoints.
"""

from datetime import date
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.financial import (
    AccountCreate, AccountResponse, AccountUpdate,
    TransactionCreate, TransactionResponse, TransferCreate,
    CashFlowReport, FinancialSummary, PropertyPerformanceResponse,
    BalanceSheetResponse, IncomeStatementResponse,
)
from app.services import ledger_service, financial_reports
from app.utils.security import get_current_user, require_role

router = APIRouter(tags=["Financiero"])


# ── Accounts ─────────────────────────────────────────────
@router.get("/accounts", response_model=list[AccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar cuentas bancarias."""
    return ledger_service.list_accounts(db)


@router.post("/accounts", response_model=AccountResponse, status_code=201)
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Crear nueva cuenta bancaria."""
    return ledger_service.create_account(db, data.model_dump())


@router.get("/accounts/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener saldo y datos de una cuenta."""
    return ledger_service.get_account(db, account_id)


@router.post("/accounts/transfer", status_code=201)
def transfer_funds(
    data: TransferCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Transferir fondos entre dos cuentas."""
    source_tx, dest_tx = ledger_service.transfer_funds(db, data, current_user.id)
    return {
        "message": "Transferencia realizada con éxito",
        "source_transaction": source_tx,
        "destination_transaction": dest_tx,
    }


# ── Transactions ─────────────────────────────────────────
@router.get("/properties/{property_id}/performance", response_model=PropertyPerformanceResponse)
def get_property_performance(
    property_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener análisis detallado de desempeño de una propiedad."""
    return ledger_service.get_property_performance(db, property_id)


@router.get("/reports/balance-sheet", response_model=BalanceSheetResponse)
def get_balance_sheet(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Balance General Corporativo."""
    return ledger_service.get_balance_sheet(db)


@router.get("/reports/income-statement", response_model=IncomeStatementResponse)
def get_income_statement(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Estado de Resultados (P&L) Corporativo."""
    return ledger_service.get_income_statement(db, start_date, end_date)


@router.get("/reports/export")
def export_transactions(
    property_id: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Exportar transacciones a CSV."""
    transactions, _ = ledger_service.list_transactions(db, property_id=property_id, limit=1000)
    csv_data = financial_reports.export_transactions_to_csv(transactions)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=transacciones_{date.today()}.csv"}
    )
@router.get("/transactions", response_model=dict)
def list_transactions(
    property_id: str | None = None,
    account_id: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar transacciones del ledger con filtros."""
    transactions, total = ledger_service.list_transactions(
        db, property_id, account_id, category, date_from, date_to, page, limit,
    )
    return {
        "items": [TransactionResponse.model_validate(t) for t in transactions],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("/transactions", response_model=TransactionResponse, status_code=201)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Registrar transacción en el ledger (actualiza saldo automáticamente)."""
    return ledger_service.register_transaction(db, data, current_user.id)


# ── Reports ──────────────────────────────────────────────
@router.get("/reports/cashflow", response_model=CashFlowReport)
def cashflow_report(
    property_id: str | None = None,
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Cash flow de los últimos N meses."""
    return ledger_service.get_cashflow_report(db, property_id, months)


@router.get("/reports/summary", response_model=FinancialSummary)
def financial_summary(
    property_id: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Resumen financiero general o por propiedad."""
    return ledger_service.get_financial_summary(db, property_id)
