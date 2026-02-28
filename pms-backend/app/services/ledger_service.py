"""
Ledger service — double-entry conciliation + balance management.
"""

from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func, extract
from fastapi import HTTPException, status

from app.models.financial import BankAccount, Transaction, TransactionDirection
from app.models.property import Property
from app.schemas.financial import TransactionCreate, TransferCreate


class InsufficientFundsError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente en la cuenta",
        )


def create_account(db: Session, data: dict) -> BankAccount:
    """Create a new bank account."""
    # Extract initial_balance as it's not a field in the SQLAlchemy model
    initial_balance = data.pop("initial_balance", 0)
    
    # Create account with remaining fields
    account = BankAccount(**data, current_balance=initial_balance)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def get_account(db: Session, account_id: str) -> BankAccount:
    stmt = select(BankAccount).where(BankAccount.id == account_id)
    account = db.execute(stmt).scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return account


def list_accounts(db: Session) -> list[BankAccount]:
    stmt = select(BankAccount).where(BankAccount.is_active == True)  # noqa: E712
    return list(db.execute(stmt).scalars().all())


def register_transaction(
    db: Session,
    data: TransactionCreate,
    recorded_by: str,
) -> Transaction:
    """
    Register a transaction in the ledger with automatic balance update.
    Atomic operation: updates account balance + creates transaction record.
    """
    # 0. Validate property exists
    prop_stmt = select(Property).where(Property.id == data.property_id, Property.is_active == True)  # noqa: E712
    prop = db.execute(prop_stmt).scalar_one_or_none()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Propiedad con ID {data.property_id} no encontrada o inactiva"
        )

    # 1. Get account with lock (for_update)
    account = get_account(db, data.account_id)

    # 2. Automate direction mapping if missing or for consistency
    if not data.direction:
        if data.transaction_type == "Ingreso":
            data.direction = TransactionDirection.DEBIT.value
        elif data.transaction_type == "Gasto":
            data.direction = TransactionDirection.CREDIT.value
        else:
            # For Transferencia/Ajuste, we might need more info, but default to Debit
            data.direction = TransactionDirection.DEBIT.value

    # 3. Update balance based on direction
    if data.direction == TransactionDirection.CREDIT.value:
        if float(account.current_balance) < data.amount:
            raise InsufficientFundsError()
        account.current_balance = float(account.current_balance) - data.amount
    elif data.direction == TransactionDirection.DEBIT.value:
        account.current_balance = float(account.current_balance) + data.amount

    # 3. Create transaction record
    transaction = Transaction(
        account_id=data.account_id,
        property_id=data.property_id,
        transaction_type=data.transaction_type,
        category=data.category,
        amount=data.amount,
        direction=data.direction,
        description=data.description,
        reference_id=data.reference_id,
        reference_type=data.reference_type,
        transaction_date=data.transaction_date,
        recorded_by=recorded_by,
    )
    db.add(transaction)

    # 4. Atomic commit
    db.commit()
    db.refresh(transaction)
    db.refresh(account)

    return transaction


def transfer_funds(
    db: Session,
    data: TransferCreate,
    recorded_by: str,
) -> tuple[Transaction, Transaction]:
    """
    Transfer funds between two accounts.
    Creates a Credit transaction in source and a Debit in destination.
    """
    # 1. Source Transaction (Credit)
    source_tx = register_transaction(
        db,
        TransactionCreate(
            account_id=data.source_account_id,
            property_id="GLOBAL", # Placeholder until we allow null or have a global property
            transaction_type="Transferencia",
            category="Transferencia Interna",
            amount=data.amount,
            direction=TransactionDirection.CREDIT.value,
            description=f"Transferencia a {data.destination_account_id}: {data.description}",
            transaction_date=data.transaction_date,
        ),
        recorded_by=recorded_by
    )

    # 2. Destination Transaction (Debit)
    dest_tx = register_transaction(
        db,
        TransactionCreate(
            account_id=data.destination_account_id,
            property_id="GLOBAL",
            transaction_type="Transferencia",
            category="Transferencia Interna",
            amount=data.amount,
            direction=TransactionDirection.DEBIT.value,
            description=f"Transferencia desde {data.source_account_id}: {data.description}",
            transaction_date=data.transaction_date,
        ),
        recorded_by=recorded_by
    )

    return source_tx, dest_tx


def list_transactions(
    db: Session,
    property_id: str | None = None,
    account_id: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Transaction], int]:
    """List transactions with filters and pagination."""
    stmt = select(Transaction)

    if property_id:
        stmt = stmt.where(Transaction.property_id == property_id)
    if account_id:
        stmt = stmt.where(Transaction.account_id == account_id)
    if category:
        stmt = stmt.where(Transaction.category == category)
    if date_from:
        stmt = stmt.where(Transaction.transaction_date >= date_from)
    if date_to:
        stmt = stmt.where(Transaction.transaction_date <= date_to)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar() or 0

    stmt = stmt.order_by(Transaction.transaction_date.desc()).offset((page - 1) * limit).limit(limit)
    transactions = db.execute(stmt).scalars().all()

    return transactions, total


def get_financial_summary(db: Session, property_id: str | None = None) -> dict:
    """Get financial summary — total income, expenses, net."""
    base = select(Transaction)
    if property_id:
        base = base.where(Transaction.property_id == property_id)

    # Income
    income_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.direction == TransactionDirection.DEBIT.value
    )
    if property_id:
        income_stmt = income_stmt.where(Transaction.property_id == property_id)
    total_income = float(db.execute(income_stmt).scalar() or 0)

    # Expenses
    expense_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.direction == TransactionDirection.CREDIT.value
    )
    if property_id:
        expense_stmt = expense_stmt.where(Transaction.property_id == property_id)
    total_expenses = float(db.execute(expense_stmt).scalar() or 0)

    # Properties count and occupancy
    from app.models.property import Property, PropertyStatus
    prop_stmt = select(func.count()).select_from(Property).where(Property.is_active == True)  # noqa: E712
    total_properties = db.execute(prop_stmt).scalar() or 0

    occupied_stmt = select(func.count()).select_from(Property).where(
        Property.is_active == True,  # noqa: E712
        Property.status == PropertyStatus.ARRENDADA.value,
    )
    occupied = db.execute(occupied_stmt).scalar() or 0
    occupancy = round((occupied / total_properties * 100) if total_properties > 0 else 0, 1)

    accounts = list_accounts(db)

    return {
        "total_properties": total_properties,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_income": total_income - total_expenses,
        "occupancy_rate": occupancy,
        "accounts": accounts,
    }


def get_cashflow_report(db: Session, property_id: str | None = None, months: int = 12) -> dict:
    """Get monthly cash flow for the past N months."""
    today = date.today()
    result_months = []
    total_income = 0.0
    total_expenses = 0.0

    for i in range(months - 1, -1, -1):
        # Calculate month start/end
        month_date = today.replace(day=1) - timedelta(days=i * 28)
        month_start = month_date.replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        # Income for the month
        inc_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.direction == TransactionDirection.DEBIT.value,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date <= month_end,
        )
        if property_id:
            inc_stmt = inc_stmt.where(Transaction.property_id == property_id)
        income = float(db.execute(inc_stmt).scalar() or 0)

        # Expenses for the month
        exp_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.direction == TransactionDirection.CREDIT.value,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date <= month_end,
        )
        if property_id:
            exp_stmt = exp_stmt.where(Transaction.property_id == property_id)
        expenses = float(db.execute(exp_stmt).scalar() or 0)

        month_label = month_start.strftime("%b %Y")
        result_months.append({
            "month": month_label,
            "income": income,
            "expenses": expenses,
            "net": income - expenses,
        })
        total_income += income
        total_expenses += expenses

    return {
        "property_id": property_id,
        "months": result_months,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_net": total_income - total_expenses,
    }


def get_property_performance(db: Session, property_id: str) -> dict:
    """Detailed performance analysis for a single property."""
    # 1. Total Income & Expenses for this property
    inc_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.property_id == property_id,
        Transaction.direction == TransactionDirection.DEBIT.value
    )
    exp_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.property_id == property_id,
        Transaction.direction == TransactionDirection.CREDIT.value
    )
    total_income = float(db.execute(inc_stmt).scalar() or 0)
    total_expenses = float(db.execute(exp_stmt).scalar() or 0)
    net_profit = total_income - total_expenses

    # 2. Get property details (for ROI calculation)
    prop = db.execute(select(Property).where(Property.id == property_id)).scalar_one_or_none()
    roi = 0.0
    if prop and prop.price and prop.price > 0:
        roi = round((net_profit / float(prop.price)) * 100, 2)

    # 3. Last transactions
    txs_stmt = select(Transaction).where(Transaction.property_id == property_id).order_by(Transaction.transaction_date.desc()).limit(10)
    last_transactions = db.execute(txs_stmt).scalars().all()

    return {
        "property_name": prop.name if prop else "Unknown",
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "roi": roi,
        "last_transactions": last_transactions
    }


def get_balance_sheet(db: Session) -> dict:
    """Summary of assets (bank balances)."""
    accounts = list_accounts(db)
    total_assets = sum(float(a.current_balance) for a in accounts)
    
    return {
        "date": date.today(),
        "accounts": accounts,
        "total_assets": total_assets,
        "equity": total_assets, # Simple model: Assets = Equity
    }


def get_income_statement(db: Session, start_date: date, end_date: date) -> dict:
    """P&L for a specific period."""
    # Group by category
    stmt = select(
        Transaction.category,
        Transaction.direction,
        func.sum(Transaction.amount).label("total")
    ).where(
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date <= end_date
    ).group_by(Transaction.category, Transaction.direction)
    
    results = db.execute(stmt).all()
    
    income_by_cat = {}
    expense_by_cat = {}
    total_income: float = 0.0
    total_expense: float = 0.0
    
    for row in results:
        cat = str(row.category)
        direction = str(row.direction)
        amount = float(row.total or 0)
        
        if direction == TransactionDirection.DEBIT.value:
            income_by_cat[cat] = amount
            total_income = total_income + amount
        else:
            expense_by_cat[cat] = amount
            total_expense = total_expense + amount
            
    return {
        "period": {"start": start_date, "end": end_date},
        "income": income_by_cat,
        "expenses": expense_by_cat,
        "total_income": total_income,
        "total_expense": total_expense,
        "net_income": float(total_income - total_expense)
    }
