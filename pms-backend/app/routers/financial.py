"""
Financial router — /api/v1/accounts + /api/v1/transactions + /api/v1/reports endpoints.
"""

from datetime import date
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.financial import (
    AccountCreate, AccountResponse, AccountUpdate,
    TransactionCreate, TransactionResponse, TransferCreate, TransactionUpdate,
    CashFlowReport, FinancialSummary, PropertyPerformanceResponse,
    BalanceSheetResponse, IncomeStatementResponse,
)
from app.services import ledger_service, financial_reports
from app.utils.security import get_current_user, require_role

router = APIRouter(tags=["Financiero"])


# ── Accounts ─────────────────────────────────────────────
@router.get("/accounts", response_model=list[AccountResponse])
async def list_accounts(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar cuentas bancarias."""
    return await ledger_service.list_accounts(db)


@router.post("/accounts", response_model=AccountResponse, status_code=201)
async def create_account(
    data: AccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Crear nueva cuenta bancaria."""
    return await ledger_service.create_account(db, data.model_dump())


@router.get("/accounts/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener saldo y datos de una cuenta."""
    return await ledger_service.get_account(db, account_id)


@router.put("/accounts/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: str,
    data: AccountUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Editar una cuenta bancaria."""
    return await ledger_service.update_account(db, account_id, data.model_dump(exclude_unset=True))


@router.delete("/accounts/{account_id}", status_code=204)
async def delete_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Eliminar (desactivar) una cuenta bancaria."""
    await ledger_service.delete_account(db, account_id)
    return None


@router.get("/accounts/{account_id}/history")
async def get_account_history(
    account_id: str,
    months: int = Query(12, ge=1, le=24),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    tx_type: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener historial mensual y transacciones recientes de una cuenta."""
    result = await ledger_service.get_account_history(db, account_id, months, date_from, date_to, tx_type)
    return {
        "account": AccountResponse.model_validate(result["account"]),
        "monthly_cashflow": result["monthly_cashflow"],
        "recent_transactions": [TransactionResponse.model_validate(t) for t in result["recent_transactions"]],
        "balance_history": result.get("balance_history", []),
    }


@router.post("/accounts/transfer", status_code=201)
async def transfer_funds(
    data: TransferCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Transferir fondos entre dos cuentas."""
    source_tx, dest_tx = await ledger_service.transfer_funds(db, data, current_user.id)
    return {
        "message": "Transferencia realizada con éxito",
        "source_transaction": source_tx,
        "destination_transaction": dest_tx,
    }


# ── Transactions ─────────────────────────────────────────
@router.get("/properties/{property_id}/performance", response_model=PropertyPerformanceResponse)
async def get_property_performance(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener análisis detallado de desempeño de una propiedad."""
    return await ledger_service.get_property_performance(db, property_id)


@router.get("/reports/balance-sheet", response_model=BalanceSheetResponse)
async def get_balance_sheet(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Balance General Corporativo."""
    return await ledger_service.get_balance_sheet(db)


@router.get("/reports/income-statement", response_model=IncomeStatementResponse)
async def get_income_statement(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Estado de Resultados (P&L) Corporativo."""
    return await ledger_service.get_income_statement(db, start_date, end_date)


@router.get("/reports/export")
async def export_transactions(
    property_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Exportar transacciones a CSV."""
    transactions, _ = await ledger_service.list_transactions(db, property_id=property_id, limit=1000)
    csv_data = await financial_reports.export_transactions_to_csv(db, transactions)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=transacciones_{date.today()}.csv"}
    )


@router.get("/reports/eeff", response_model=dict)
async def get_eeff_report(
    property_id: str | None = Query(None),
    year: int = Query(default_factory=lambda: date.today().year),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Generar reporte matricial EEFF (Estado de Resultados Mensual)."""
    # Initialize matrix
    # Months 1 to 12
    report = {
        "year": year,
        "property_id": property_id,
        "months": {},
        "categories": set(),
        "total_income": 0,
        "total_expenses": 0,
        "utilidad_operacional": 0
    }
    
    for m in range(1, 13):
        report["months"][m] = {
            "income": 0,
            "expenses": 0,
            "utilidad_operacional": 0,
            "by_category": {}
        }
    
    # Get all transactions for the year
    from sqlalchemy import select, and_, extract
    from app.models.financial import Transaction, TransactionDirection
    
    stmt = select(Transaction).where(extract('year', Transaction.transaction_date) == year)
    if property_id:
        stmt = stmt.where(Transaction.property_id == property_id)
        
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    
    for tx in transactions:
        m = tx.transaction_date.month
        cat = tx.category
        report["categories"].add(cat)
        
        m_data = report["months"][m]
        if cat not in m_data["by_category"]:
            m_data["by_category"][cat] = 0
            
        if tx.direction == TransactionDirection.DEBIT.value:
            # Ingreso
            m_data["income"] += tx.amount
            report["total_income"] += tx.amount
        else:
            # Gasto
            m_data["by_category"][cat] += tx.amount
            m_data["expenses"] += tx.amount
            report["total_expenses"] += tx.amount
            
        m_data["utilidad_operacional"] = m_data["income"] - m_data["expenses"]
        
    report["utilidad_operacional"] = report["total_income"] - report["total_expenses"]
    report["categories"] = list(report["categories"])
    
    return report



from fastapi import UploadFile, File
from app.services import import_service


@router.post("/transactions/import/analyze")
async def analyze_csv_import(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Paso 1: Analizar CSV y retornar cuentas, labels y categorías detectadas."""
    content = (await file.read()).decode("utf-8-sig")
    return await import_service.analyze_csv(db, content)


@router.post("/transactions/import/confirm", status_code=201)
async def confirm_csv_import(
    file: UploadFile = File(...),
    confirmed_labels: str = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Paso 2: Importar transacciones con labels confirmadas como apartamentos."""
    content = (await file.read()).decode("utf-8-sig")
    labels_list = [l.strip() for l in confirmed_labels.split(",") if l.strip()]
    return await import_service.process_import(db, content, labels_list, current_user.id)

@router.get("/transactions", response_model=dict)
async def list_transactions(
    property_id: str | None = None,
    account_id: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar transacciones del ledger with filtros."""
    transactions, total = await ledger_service.list_transactions(
        db, property_id, account_id, category, date_from, date_to, page, limit,
    )
    return {
        "items": [TransactionResponse.model_validate(t) for t in transactions],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("/transactions", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Registrar transacción en el ledger (actualiza saldo automáticamente)."""
    return await ledger_service.register_transaction(db, data, current_user.id)


@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    data: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Editar una transacción (ajusta balance si cambia el monto)."""
    return await ledger_service.update_transaction(db, transaction_id, data)


@router.delete("/transactions/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Eliminar una transacción (revierte el efecto en el saldo)."""
    await ledger_service.delete_transaction(db, transaction_id)
    return None


# ── Reports ──────────────────────────────────────────────
@router.get("/reports/cashflow", response_model=CashFlowReport)
async def cashflow_report(
    property_id: str | None = None,
    months: int = Query(12, ge=1, le=24),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Cash flow de los últimos N meses."""
    return await ledger_service.get_cashflow_report(db, property_id, months)


@router.get("/reports/summary", response_model=FinancialSummary)
async def financial_summary(
    property_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Resumen financiero general o por propiedad."""
    return await ledger_service.get_financial_summary(db, property_id)
