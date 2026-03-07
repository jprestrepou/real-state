"""
Ledger service — double-entry conciliation + balance management.
"""

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func, extract
from fastapi import HTTPException, status

from app.models.financial import BankAccount, Transaction, TransactionDirection
from app.models.property import Property, PropertyStatus
from app.schemas.financial import TransactionCreate, TransferCreate, TransactionUpdate


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
    commit: bool = True,
) -> Transaction:
    """
    Register a transaction in the ledger with automatic balance update.
    Atomic operation: updates account balance + creates transaction record.
    """
    # 0. Validate property exists (only if property_id is provided)
    if data.property_id:
        prop_stmt = select(Property).where(
            Property.id == data.property_id,
            Property.is_active == True,  # noqa: E712
        )
        prop = db.execute(prop_stmt).scalar_one_or_none()
        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Propiedad con ID {data.property_id} no encontrada o inactiva",
            )

    # 1. Get account
    account = get_account(db, data.account_id)

    # 2. Automate direction mapping if missing
    if not data.direction:
        if data.transaction_type == "Ingreso":
            data.direction = TransactionDirection.DEBIT.value
        elif data.transaction_type == "Gasto":
            data.direction = TransactionDirection.CREDIT.value
        else:
            data.direction = TransactionDirection.DEBIT.value

    # 3. Update balance based on direction
    if data.direction == TransactionDirection.CREDIT.value:
        if float(account.current_balance) < data.amount:
            raise InsufficientFundsError()
        account.current_balance = float(account.current_balance) - data.amount
    elif data.direction == TransactionDirection.DEBIT.value:
        account.current_balance = float(account.current_balance) + data.amount

    # 4. Create transaction record
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

    # 5. Atomic commit (optional)
    if commit:
        db.commit()
        db.refresh(transaction)
        db.refresh(account)
    else:
        db.flush()

    return transaction


def transfer_funds(
    db: Session,
    data: TransferCreate,
    recorded_by: str,
) -> tuple[Transaction, Transaction]:
    """
    Transfer funds between two accounts.
    Creates a Credit transaction in source and a Debit in destination.
    Requirement: Atomic operation (Rule #5).
    """
    try:
        # Source Transaction (Credit) - NO COMMIT
        source_tx = register_transaction(
            db,
            TransactionCreate(
                account_id=data.source_account_id,
                property_id=None,
                transaction_type="Transferencia",
                category="Transferencia Interna",
                amount=data.amount,
                direction=TransactionDirection.CREDIT.value,
                description=f"Transferencia a {data.destination_account_id}: {data.description}",
                transaction_date=data.transaction_date,
            ),
            recorded_by=recorded_by,
            commit=False
        )

        # Destination Transaction (Debit) - NO COMMIT
        dest_tx = register_transaction(
            db,
            TransactionCreate(
                account_id=data.destination_account_id,
                property_id=None,
                transaction_type="Transferencia",
                category="Transferencia Interna",
                amount=data.amount,
                direction=TransactionDirection.DEBIT.value,
                description=f"Transferencia desde {data.source_account_id}: {data.description}",
                transaction_date=data.transaction_date,
            ),
            recorded_by=recorded_by,
            commit=False
        )

        db.commit()
        db.refresh(source_tx)
        db.refresh(dest_tx)
        return source_tx, dest_tx
    except Exception as e:
        db.rollback()
        raise e


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


from app.models.financial import TransactionCategory

def get_financial_summary(db: Session, property_id: str | None = None) -> dict:
    """Get financial summary — total income, expenses, net. Excludes internal transfers."""
    # Income (Exclude internal transfers)
    income_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.direction == TransactionDirection.DEBIT.value,
        Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value
    )
    if property_id:
        income_stmt = income_stmt.where(Transaction.property_id == property_id)
    total_income = float(db.execute(income_stmt).scalar() or 0)

    # Expenses (Exclude internal transfers)
    expense_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.direction == TransactionDirection.CREDIT.value,
        Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value
    )
    if property_id:
        expense_stmt = expense_stmt.where(Transaction.property_id == property_id)
    total_expenses = float(db.execute(expense_stmt).scalar() or 0)

    # Properties count and occupancy
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
        # Calculate month start/end using relativedelta for accuracy
        month_start = (today.replace(day=1) - relativedelta(months=i))
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        # Income for the month (Exclude transfers)
        inc_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.direction == TransactionDirection.DEBIT.value,
            Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date <= month_end,
        )
        if property_id:
            inc_stmt = inc_stmt.where(Transaction.property_id == property_id)
        income = float(db.execute(inc_stmt).scalar() or 0)

        # Expenses for the month (Exclude transfers)
        exp_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.direction == TransactionDirection.CREDIT.value,
            Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value,
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
        Transaction.direction == TransactionDirection.DEBIT.value,
    )
    exp_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.property_id == property_id,
        Transaction.direction == TransactionDirection.CREDIT.value,
    )
    total_income = float(db.execute(inc_stmt).scalar() or 0)
    total_expenses = float(db.execute(exp_stmt).scalar() or 0)
    net_profit = total_income - total_expenses

    # 2. Get property details (for ROI calculation)
    prop = db.execute(select(Property).where(Property.id == property_id)).scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    roi = 0.0
    if prop.commercial_value and float(prop.commercial_value) > 0:
        roi = round((net_profit / float(prop.commercial_value)) * 100, 2)

    # 3. Monthly cashflow for the last 12 months
    today = date.today()
    monthly_cashflow = []
    for i in range(11, -1, -1):
        month_start = (today.replace(day=1) - relativedelta(months=i))
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        m_inc = float(db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.property_id == property_id,
                Transaction.direction == TransactionDirection.DEBIT.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        ).scalar() or 0)

        m_exp = float(db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.property_id == property_id,
                Transaction.direction == TransactionDirection.CREDIT.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        ).scalar() or 0)

        monthly_cashflow.append({
            "month": month_start.strftime("%b %Y"),
            "income": m_inc,
            "expenses": m_exp,
            "net": m_inc - m_exp,
        })

    # 4. Category breakdowns
    cat_stmt = select(
        Transaction.category,
        Transaction.direction,
        func.sum(Transaction.amount).label("total"),
    ).where(
        Transaction.property_id == property_id,
    ).group_by(Transaction.category, Transaction.direction)

    cat_results = db.execute(cat_stmt).all()
    income_by_category = {}
    expense_by_category = {}
    for row in cat_results:
        cat = str(row.category)
        amount = float(row.total or 0)
        if str(row.direction) == TransactionDirection.DEBIT.value:
            income_by_category[cat] = amount
        else:
            expense_by_category[cat] = amount

    # 5. Last transactions
    txs_stmt = (
        select(Transaction)
        .where(Transaction.property_id == property_id)
        .order_by(Transaction.transaction_date.desc())
        .limit(10)
    )
    last_transactions = db.execute(txs_stmt).scalars().all()

    return {
        "property_name": prop.name,
        "property_status": prop.status,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "roi": roi,
        "monthly_cashflow": monthly_cashflow,
        "income_by_category": income_by_category,
        "expense_by_category": expense_by_category,
        "last_transactions": last_transactions,
    }


def get_balance_sheet(db: Session) -> dict:
    """Summary of assets (bank balances)."""
    accounts = list_accounts(db)
    total_assets = sum(float(a.current_balance) for a in accounts)

    return {
        "date": date.today(),
        "accounts": accounts,
        "total_assets": total_assets,
        "equity": total_assets,  # Simple model: Assets = Equity
    }


def get_income_statement(db: Session, start_date: date, end_date: date) -> dict:
    """P&L for a specific period."""
    # Group by category (Exclude internal transfers)
    stmt = select(
        Transaction.category,
        Transaction.direction,
        func.sum(Transaction.amount).label("total"),
    ).where(
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date <= end_date,
        Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value
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
        "net_income": float(total_income - total_expense),
    }


# ── Account CRUD ─────────────────────────────────────────

def update_account(db: Session, account_id: str, data: dict) -> BankAccount:
    """Update bank account fields."""
    account = get_account(db, account_id)
    for key, value in data.items():
        if value is not None and hasattr(account, key):
            setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return account


def delete_account(db: Session, account_id: str) -> None:
    """Soft-delete a bank account (set is_active=False)."""
    account = get_account(db, account_id)
    # Check for non-zero balance
    if float(account.current_balance) != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar: la cuenta tiene saldo de {account.current_balance}. Transfiera los fondos primero.",
        )
    account.is_active = False
    db.commit()


# ── Transaction CRUD ─────────────────────────────────────

def update_transaction(db: Session, tx_id: str, data: TransactionUpdate) -> Transaction:
    """Update a transaction and adjust account balance if amount changed."""
    stmt = select(Transaction).where(Transaction.id == tx_id)
    tx = db.execute(stmt).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    old_amount = float(tx.amount)
    old_direction = tx.direction

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None and hasattr(tx, key):
            setattr(tx, key, value)

    # Recalculate direction if transaction_type changed
    if data.transaction_type:
        if data.transaction_type == "Ingreso":
            tx.direction = TransactionDirection.DEBIT.value
        elif data.transaction_type == "Gasto":
            tx.direction = TransactionDirection.CREDIT.value

    new_amount = float(tx.amount)
    new_direction = tx.direction

    # Adjust balance if amount or direction changed
    if new_amount != old_amount or new_direction != old_direction:
        account = get_account(db, tx.account_id)
        # 1. Revert old effect
        if old_direction == TransactionDirection.DEBIT.value:
            account.current_balance = float(account.current_balance) - old_amount
        else:
            account.current_balance = float(account.current_balance) + old_amount
            
        # 2. Apply new effect
        if new_direction == TransactionDirection.DEBIT.value:
            account.current_balance = float(account.current_balance) + new_amount
        else:
            account.current_balance = float(account.current_balance) - new_amount

    db.commit()
    db.refresh(tx)
    return tx


def delete_transaction(db: Session, tx_id: str) -> None:
    """Delete a transaction and revert its balance effect."""
    stmt = select(Transaction).where(Transaction.id == tx_id)
    tx = db.execute(stmt).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    # Revert balance
    account = get_account(db, tx.account_id)
    if tx.direction == TransactionDirection.DEBIT.value:
        account.current_balance = float(account.current_balance) - float(tx.amount)
    else:
        account.current_balance = float(account.current_balance) + float(tx.amount)

    db.delete(tx)
    db.commit()


# ── Account History ──────────────────────────────────────

def get_account_history(db: Session, account_id: str, months: int = 12, date_from: date = None, date_to: date = None, tx_type: str = None) -> dict:
    """Get monthly cashflow + filtered transactions for a specific account."""
    account = get_account(db, account_id)
    today = date.today()
    monthly_data = []

    for i in range(months - 1, -1, -1):
        month_start = today.replace(day=1) - relativedelta(months=i)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        m_inc = float(db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.account_id == account_id,
                Transaction.direction == TransactionDirection.DEBIT.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        ).scalar() or 0)

        m_exp = float(db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.account_id == account_id,
                Transaction.direction == TransactionDirection.CREDIT.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        ).scalar() or 0)

        monthly_data.append({
            "month": month_start.strftime("%b %Y"),
            "income": m_inc,
            "expenses": m_exp,
            "net": m_inc - m_exp,
        })

    # Filtered transactions
    txs_stmt = select(Transaction).where(Transaction.account_id == account_id)
    
    if date_from:
        txs_stmt = txs_stmt.where(Transaction.transaction_date >= date_from)
    if date_to:
        txs_stmt = txs_stmt.where(Transaction.transaction_date <= date_to)
    if tx_type:
        txs_stmt = txs_stmt.where(Transaction.transaction_type == tx_type)
        
    txs_stmt = txs_stmt.order_by(Transaction.transaction_date.desc()).limit(100)
    recent_txs = db.execute(txs_stmt).scalars().all()

    # Balance history (Dynamic based on date_from, default 30 days)
    days_bal = 30
    if date_from and isinstance(date_from, date):
        days_bal = (today - date_from).days
        if days_bal < 1: days_bal = 30
        if days_bal > 365: days_bal = 365
        
    balance_history = get_account_balance_history(db, account_id, days=days_bal)

    return {
        "account": account,
        "monthly_cashflow": monthly_data,
        "recent_transactions": recent_txs,
        "balance_history": balance_history
    }

def get_account_balance_history(db: Session, account_id: str, days: int = 30) -> list[dict]:
    """Calculate daily balance history for a given period."""
    account = get_account(db, account_id)
    current_bal = float(account.current_balance)
    
    today = date.today()
    start_date = today - timedelta(days=days)
    
    # Get all transactions from start_date till now to backtrack
    stmt = select(Transaction).where(
        Transaction.account_id == account_id,
        Transaction.transaction_date >= start_date
    ).order_by(Transaction.transaction_date.desc())
    
    txs = db.execute(stmt).scalars().all()
    
    # We work backwards from current_bal
    history = []
    temp_bal = current_bal
    
    # Group transactions by date
    from collections import defaultdict
    txs_by_date = defaultdict(list)
    for tx in txs:
        txs_by_date[tx.transaction_date].append(tx)
        
    for i in range(days + 1):
        dt = today - timedelta(days=i)
        history.append({"date": dt.isoformat(), "balance": temp_bal})
        
        # Undo effect of transactions on this day to find balance of previous day
        for tx in txs_by_date.get(dt, []):
            if tx.direction == TransactionDirection.DEBIT.value:
                temp_bal -= float(tx.amount)
            else:
                temp_bal += float(tx.amount)
                
    history.reverse() # Chronological order
    return history
