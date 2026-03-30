from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from fastapi import HTTPException, status
from collections import defaultdict

from app.models.financial import BankAccount, Transaction, TransactionDirection, TransactionCategory, TransactionStatus
from app.models.property import Property, PropertyStatus
from app.schemas.financial import TransactionCreate, TransferCreate, TransactionUpdate
from app.services import audit_service


class InsufficientFundsError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente en la cuenta",
        )


async def create_account(db: AsyncSession, data: dict) -> BankAccount:
    """Create a new bank account."""
    initial_balance = data.pop("initial_balance", 0)
    account = BankAccount(**data, initial_balance=initial_balance, current_balance=initial_balance)
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


async def get_account(db: AsyncSession, account_id: str) -> BankAccount:
    stmt = select(BankAccount).where(BankAccount.id == account_id)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return account


async def list_accounts(db: AsyncSession) -> list[BankAccount]:
    stmt = select(BankAccount).where(BankAccount.is_active == True)  # noqa: E712
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def register_transaction(
    db: AsyncSession,
    data: TransactionCreate,
    recorded_by: str,
    commit: bool = True,
) -> Transaction:
    """
    Register a transaction in the ledger with automatic balance update.
    Atomic operation: updates account balance + creates transaction record.
    """
    if data.property_id:
        prop_stmt = select(Property).where(Property.id == data.property_id)
        result_prop = await db.execute(prop_stmt)
        prop = result_prop.scalar_one_or_none()
        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Propiedad con ID {data.property_id} no encontrada",
            )

    account = await get_account(db, data.account_id)

    if not data.direction:
        if data.transaction_type == "Ingreso":
            data.direction = TransactionDirection.DEBIT.value
        elif data.transaction_type == "Gasto":
            data.direction = TransactionDirection.CREDIT.value
        else:
            data.direction = TransactionDirection.DEBIT.value

    if data.status == TransactionStatus.COMPLETADA.value:
        if data.direction == TransactionDirection.CREDIT.value:
            if float(account.current_balance) < data.amount:
                raise InsufficientFundsError()
            account.current_balance = float(account.current_balance) - data.amount
        elif data.direction == TransactionDirection.DEBIT.value:
            account.current_balance = float(account.current_balance) + data.amount

    transaction = Transaction(
        account_id=data.account_id,
        property_id=data.property_id,
        transaction_type=data.transaction_type,
        status=data.status,
        category=data.category,
        amount=data.amount,
        direction=data.direction,
        description=data.description,
        reference_id=data.reference_id,
        reference_type=data.reference_type,
        transaction_date=data.transaction_date,
        recorded_by=recorded_by,
        invoice_id=data.invoice_id,
        is_reconciled=data.is_reconciled,
    )
    db.add(transaction)

    if data.invoice_id and data.status == TransactionStatus.COMPLETADA.value and data.direction == TransactionDirection.DEBIT.value:
        from app.services.invoice_service import InvoiceService
        await InvoiceService.mark_invoice_as_paid(db, data.invoice_id, commit=False)

    if commit:
        await db.commit()
        await db.refresh(transaction)
        await db.refresh(account)
    else:
        await db.flush()

    await audit_service.log_action(
        db,
        action="CREATE",
        entity_type="Transaction",
        user_id=recorded_by,
        entity_id=transaction.id,
        new_value={"amount": float(transaction.amount), "type": transaction.transaction_type, "status": transaction.status},
        commit=commit
    )

    return transaction


async def transfer_funds(
    db: AsyncSession,
    data: TransferCreate,
    recorded_by: str,
) -> tuple[Transaction, Transaction]:
    """
    Transfer funds between two accounts.
    Creates a Credit transaction in source and a Debit in destination.
    Requirement: Atomic operation (Rule #5).
    """
    try:
        source_tx = await register_transaction(
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

        dest_tx = await register_transaction(
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

        await db.commit()
        await db.refresh(source_tx)
        await db.refresh(dest_tx)
        return source_tx, dest_tx
    except Exception as e:
        await db.rollback()
        raise e


        raise e


async def reconcile_transactions(db: AsyncSession, transaction_ids: list[str]) -> int:
    """Marks a list of transactions as reconciled."""
    from sqlalchemy import update
    stmt = (
        update(Transaction)
        .where(Transaction.id.in_(transaction_ids))
        .where(Transaction.is_reconciled == False)
        .values(is_reconciled=True)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount


async def list_transactions(
    db: AsyncSession,
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
    result_count = await db.execute(count_stmt)
    total = result_count.scalar() or 0

    stmt = stmt.order_by(Transaction.transaction_date.desc()).offset((page - 1) * limit).limit(limit)
    result_txs = await db.execute(stmt)
    transactions = result_txs.scalars().all()

    return list(transactions), total


async def get_financial_summary(db: AsyncSession, property_id: str | None = None) -> dict:
    """Get financial summary — total income, expenses, net. Excludes internal transfers."""
    income_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.direction == TransactionDirection.DEBIT.value,
        Transaction.status == TransactionStatus.COMPLETADA.value,
        Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value
    )
    if property_id:
        income_stmt = income_stmt.where(Transaction.property_id == property_id)
    result_inc = await db.execute(income_stmt)
    total_income = float(result_inc.scalar() or 0)

    expense_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.direction == TransactionDirection.CREDIT.value,
        Transaction.status == TransactionStatus.COMPLETADA.value,
        Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value
    )
    if property_id:
        expense_stmt = expense_stmt.where(Transaction.property_id == property_id)
    result_exp = await db.execute(expense_stmt)
    total_expenses = float(result_exp.scalar() or 0)

    prop_stmt = select(func.count()).select_from(Property).where(Property.is_active == True)  # noqa: E712
    result_prop = await db.execute(prop_stmt)
    total_properties = result_prop.scalar() or 0

    occupied_stmt = select(func.count()).select_from(Property).where(
        Property.is_active == True,  # noqa: E712
        Property.status == PropertyStatus.ARRENDADA.value,
    )
    result_occupied = await db.execute(occupied_stmt)
    occupied = result_occupied.scalar() or 0
    occupancy = float(round((occupied / total_properties * 100) if total_properties > 0 else 0, 1))

    accounts = await list_accounts(db)

    return {
        "total_properties": total_properties,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_income": total_income - total_expenses,
        "occupancy_rate": occupancy,
        "accounts": accounts,
    }


async def get_cashflow_report(db: AsyncSession, property_id: str | None = None, months: int = 12) -> dict:
    """Get monthly cash flow for the past N months."""
    today = date.today()
    result_months = []
    total_income = 0.0
    total_expenses = 0.0

    for i in range(months - 1, -1, -1):
        month_start = (today.replace(day=1) - relativedelta(months=i))
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        inc_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.direction == TransactionDirection.DEBIT.value,
            Transaction.status == TransactionStatus.COMPLETADA.value,
            Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date <= month_end,
        )
        if property_id:
            inc_stmt = inc_stmt.where(Transaction.property_id == property_id)
        result_inc = await db.execute(inc_stmt)
        income = float(result_inc.scalar() or 0)

        exp_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.direction == TransactionDirection.CREDIT.value,
            Transaction.status == TransactionStatus.COMPLETADA.value,
            Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date <= month_end,
        )
        if property_id:
            exp_stmt = exp_stmt.where(Transaction.property_id == property_id)
        result_exp = await db.execute(exp_stmt)
        expenses = float(result_exp.scalar() or 0)

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


async def get_property_performance(db: AsyncSession, property_id: str) -> dict:
    """Detailed performance analysis for a single property."""
    inc_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.property_id == property_id,
        Transaction.direction == TransactionDirection.DEBIT.value,
        Transaction.status == TransactionStatus.COMPLETADA.value,
    )
    exp_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.property_id == property_id,
        Transaction.direction == TransactionDirection.CREDIT.value,
        Transaction.status == TransactionStatus.COMPLETADA.value,
    )
    result_inc = await db.execute(inc_stmt)
    total_income = float(result_inc.scalar() or 0)
    result_exp = await db.execute(exp_stmt)
    total_expenses = float(result_exp.scalar() or 0)
    net_profit = total_income - total_expenses

    result_prop = await db.execute(select(Property).where(Property.id == property_id))
    prop = result_prop.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    noi = net_profit
    cap_rate = 0.0
    gross_yield = 0.0
    roi = 0.0  # Kept for backward compatibility

    # Try to find active contract to estimate annual rent
    from app.models.contract import Contract, ContractStatus
    contract_stmt = select(Contract).where(Contract.property_id == property_id, Contract.status == ContractStatus.ACTIVO.value)
    result_contract = await db.execute(contract_stmt)
    active_contract = result_contract.scalar_one_or_none()
    
    annual_rent = 0.0
    if active_contract and active_contract.amount:
        annual_rent = float(active_contract.amount) * 12

    if prop.commercial_value and float(prop.commercial_value) > 0:
        commercial_value = float(prop.commercial_value)
        # Cap Rate: (NOI / Property Value) * 100
        cap_rate = float(round((noi / commercial_value) * 100, 2))
        roi = cap_rate # ROI fallback
        
        # Gross Yield: (Annual Rent / Property Value) * 100
        if annual_rent > 0:
            gross_yield = float(round((annual_rent / commercial_value) * 100, 2))
        else:
            # Fallback calculating based on historical income if no contract
            if total_income > 0:
                 # Simplified assumption: total_income in the period is close to annual rent or just use it roughly
                 gross_yield = float(round((total_income / commercial_value) * 100, 2))

    today = date.today()
    monthly_cashflow = []
    for i in range(11, -1, -1):
        month_start = (today.replace(day=1) - relativedelta(months=i))
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        result_mi = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.property_id == property_id,
                Transaction.direction == TransactionDirection.DEBIT.value,
                Transaction.status == TransactionStatus.COMPLETADA.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        )
        m_inc = float(result_mi.scalar() or 0)

        result_me = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.property_id == property_id,
                Transaction.direction == TransactionDirection.CREDIT.value,
                Transaction.status == TransactionStatus.COMPLETADA.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        )
        m_exp = float(result_me.scalar() or 0)

        monthly_cashflow.append({
            "month": month_start.strftime("%b %Y"),
            "income": m_inc,
            "expenses": m_exp,
            "net": m_inc - m_exp,
        })

    cat_stmt = select(
        Transaction.category,
        Transaction.direction,
        func.sum(Transaction.amount).label("total"),
    ).where(
        Transaction.property_id == property_id,
        Transaction.status == TransactionStatus.COMPLETADA.value,
    ).group_by(Transaction.category, Transaction.direction)

    result_cat = await db.execute(cat_stmt)
    cat_results = result_cat.all()
    income_by_category = {}
    expense_by_category = {}
    for row in cat_results:
        cat = str(row.category)
        amount = float(row.total or 0)
        dir_val = row.direction.value if hasattr(row.direction, "value") else str(row.direction)
        
        if dir_val == TransactionDirection.DEBIT.value:
            income_by_category[cat] = amount
        else:
            expense_by_category[cat] = amount

    txs_stmt = (
        select(Transaction)
        .where(Transaction.property_id == property_id)
        .order_by(Transaction.transaction_date.desc())
        .limit(10)
    )
    result_txs = await db.execute(txs_stmt)
    last_transactions = result_txs.scalars().all()

    return {
        "property_name": prop.name,
        "property_status": prop.status,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "noi": noi,
        "cap_rate": cap_rate,
        "gross_yield": gross_yield,
        "roi": roi,
        "monthly_cashflow": monthly_cashflow,
        "income_by_category": income_by_category,
        "expense_by_category": expense_by_category,
        "last_transactions": last_transactions,
    }


async def get_balance_sheet(db: AsyncSession) -> dict:
    """Summary of assets (bank balances)."""
    accounts = await list_accounts(db)
    total_assets = sum(float(a.current_balance) for a in accounts)

    return {
        "date": date.today(),
        "accounts": accounts,
        "total_assets": total_assets,
        "equity": total_assets,  # Simple model: Assets = Equity
    }


async def get_income_statement(db: AsyncSession, start_date: date, end_date: date) -> dict:
    """P&L for a specific period."""
    stmt = select(
        Transaction.category,
        Transaction.direction,
        func.sum(Transaction.amount).label("total"),
    ).where(
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date <= end_date,
        Transaction.status == TransactionStatus.COMPLETADA.value,
        Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value
    ).group_by(Transaction.category, Transaction.direction)

    result_stmt = await db.execute(stmt)
    results = result_stmt.all()

    income_by_cat = {}
    expense_by_cat = {}
    total_income: float = 0.0
    total_expense: float = 0.0

    for row in results:
        cat = str(row.category)
        direction = str(row.direction)
        amount = float(row.total or 0.0)

        if direction == TransactionDirection.DEBIT.value:
            income_by_cat[cat] = amount
            total_income = float(total_income + amount)
        else:
            expense_by_cat[cat] = amount
            total_expense = float(total_expense + amount)

    return {
        "period": {"start": start_date, "end": end_date},
        "income": income_by_cat,
        "expenses": expense_by_cat,
        "total_income": total_income,
        "total_expense": total_expense,
        "net_income": float(total_income - total_expense),
    }


async def update_account(db: AsyncSession, account_id: str, data: dict) -> BankAccount:
    """Update bank account fields."""
    account = await get_account(db, account_id)
    
    # Store old initial balance
    old_initial_balance = float(account.initial_balance)
    
    for key, value in data.items():
        if value is not None and hasattr(account, key):
            setattr(account, key, value)
            
    # If initial_balance was modified, adjust current_balance by the difference
    if "initial_balance" in data and data["initial_balance"] is not None:
        new_initial_balance = float(data["initial_balance"])
        diff = new_initial_balance - old_initial_balance
        account.current_balance = float(account.current_balance) + diff
        
    await db.commit()
    await db.refresh(account)
    return account


async def delete_account(db: AsyncSession, account_id: str) -> None:
    """Soft-delete a bank account (set is_active=False)."""
    account = await get_account(db, account_id)
    if float(account.current_balance) != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar: la cuenta tiene saldo de {account.current_balance}. Transfiera los fondos primero.",
        )
    account.is_active = False
    await db.commit()


async def update_transaction(db: AsyncSession, tx_id: str, data: TransactionUpdate) -> Transaction:
    """Update a transaction and adjust account balance if amount changed."""
    stmt = select(Transaction).where(Transaction.id == tx_id)
    result_tx = await db.execute(stmt)
    tx = result_tx.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    old_amount = float(tx.amount)
    old_direction = tx.direction

    old_status = tx.status

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None and hasattr(tx, key):
            setattr(tx, key, value)

    if data.transaction_type:
        if data.transaction_type == "Ingreso":
            tx.direction = TransactionDirection.DEBIT.value
        elif data.transaction_type == "Gasto":
            tx.direction = TransactionDirection.CREDIT.value

    new_amount = float(tx.amount)
    new_direction = tx.direction
    new_status = tx.status

    # Lógica de actualización de saldo:
    # 1. Si antes estaba COMPLETADA, revertimos su efecto original.
    # 2. Si ahora está COMPLETADA, aplicamos su nuevo efecto.
    
    account = await get_account(db, tx.account_id)
    
    # 1. Revertir anterior si estaba completada
    if old_status == TransactionStatus.COMPLETADA.value:
        if old_direction == TransactionDirection.DEBIT.value:
            account.current_balance = float(account.current_balance) - old_amount
        else:
            account.current_balance = float(account.current_balance) + old_amount
            
    # 2. Aplicar nuevo si está completada
    if new_status == TransactionStatus.COMPLETADA.value:
        if new_direction == TransactionDirection.DEBIT.value:
            account.current_balance = float(account.current_balance) + new_amount
        else:
            account.current_balance = float(account.current_balance) - new_amount

    await db.commit()
    await db.refresh(tx)

    await audit_service.log_action(
        db,
        action="UPDATE",
        entity_type="Transaction",
        entity_id=tx.id,
        old_value={"amount": old_amount, "status": old_status},
        new_value={"amount": new_amount, "status": new_status}
    )

    return tx


async def delete_transaction(db: AsyncSession, tx_id: str) -> None:
    """Delete a transaction and revert its balance effect."""
    stmt = select(Transaction).where(Transaction.id == tx_id)
    result_tx = await db.execute(stmt)
    tx = result_tx.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    if tx.status == TransactionStatus.COMPLETADA.value:
        account = await get_account(db, tx.account_id)
        if tx.direction == TransactionDirection.DEBIT.value:
            account.current_balance = float(account.current_balance) - float(tx.amount)
        else:
            account.current_balance = float(account.current_balance) + float(tx.amount)

    old_data = {"amount": float(tx.amount), "status": tx.status}

    await db.delete(tx)
    await db.commit()

    await audit_service.log_action(
        db,
        action="DELETE",
        entity_type="Transaction",
        entity_id=tx_id,
        old_value=old_data
    )


async def get_account_history(db: AsyncSession, account_id: str, months: int = 12, date_from: date | None = None, date_to: date | None = None, tx_type: str | None = None) -> dict:
    """Get monthly cashflow + filtered transactions for a specific account."""
    account = await get_account(db, account_id)
    today = date.today()
    monthly_data = []

    for i in range(months - 1, -1, -1):
        month_start = today.replace(day=1) - relativedelta(months=i)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        result_mi = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.account_id == account_id,
                Transaction.direction == TransactionDirection.DEBIT.value,
                Transaction.status == TransactionStatus.COMPLETADA.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        )
        m_inc = float(result_mi.scalar() or 0)

        result_me = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.account_id == account_id,
                Transaction.direction == TransactionDirection.CREDIT.value,
                Transaction.status == TransactionStatus.COMPLETADA.value,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= month_end,
            )
        )
        m_exp = float(result_me.scalar() or 0)

        monthly_data.append({
            "month": month_start.strftime("%b %Y"),
            "income": m_inc,
            "expenses": m_exp,
            "net": m_inc - m_exp,
        })

    txs_stmt = select(Transaction).where(Transaction.account_id == account_id)
    
    if date_from:
        txs_stmt = txs_stmt.where(Transaction.transaction_date >= date_from)
    if date_to:
        txs_stmt = txs_stmt.where(Transaction.transaction_date <= date_to)
    if tx_type:
        txs_stmt = txs_stmt.where(Transaction.transaction_type == tx_type)
        
    txs_stmt = txs_stmt.order_by(Transaction.transaction_date.desc()).limit(100)
    result_txs = await db.execute(txs_stmt)
    recent_txs = result_txs.scalars().all()

    days_bal = 30
    if date_from and isinstance(date_from, date):
        days_bal = (today - date_from).days
        if days_bal < 1: days_bal = 30
        if days_bal > 365: days_bal = 365
        
    balance_history = await get_account_balance_history(db, account_id, days=days_bal)

    return {
        "account": account,
        "monthly_cashflow": monthly_data,
        "recent_transactions": list(recent_txs),
        "balance_history": balance_history
    }


async def get_account_balance_history(db: AsyncSession, account_id: str, days: int = 30) -> list[dict]:
    """Calculate daily balance history for a given period."""
    account = await get_account(db, account_id)
    current_bal = float(account.current_balance)
    
    today = date.today()
    start_date = today - timedelta(days=days)
    
    stmt = select(Transaction).where(
        Transaction.account_id == account_id,
        Transaction.status == TransactionStatus.COMPLETADA.value,
        Transaction.transaction_date >= start_date
    ).order_by(Transaction.transaction_date.desc())
    
    result_txs = await db.execute(stmt)
    txs = result_txs.scalars().all()
    
    history = []
    temp_bal = float(current_bal)
    
    txs_by_date: dict[date, list[Transaction]] = defaultdict(list)
    for tx in txs:
        txs_by_date[tx.transaction_date].append(tx)
        
    for i in range(days + 1):
        dt = today - timedelta(days=i)
        history.append({"date": dt.isoformat(), "balance": temp_bal})
        
        for tx in txs_by_date[dt]:
            if tx.direction == TransactionDirection.DEBIT.value:
                temp_bal -= float(tx.amount)
            else:
                temp_bal += float(tx.amount)
                
    history.reverse()
    return history


async def get_account_profitability(db: AsyncSession, account_id: str, year: int) -> dict:
    """Calculates monthly profitability percentage for a specific account over a year."""
    account = await get_account(db, account_id)
    
    # We will compute the balances directly by reading transactions
    stmt = select(Transaction).where(
        Transaction.account_id == account_id,
        Transaction.status == TransactionStatus.COMPLETADA.value
    ).order_by(Transaction.transaction_date)
    result_txs = await db.execute(stmt)
    txs = result_txs.scalars().all()
    
    # Calculate starting balances per month based on the chronological sequence of transactions up to that month
    # But since initial_balance isn't perfectly stored historically, we will work backwards:
    current_balance = float(account.current_balance)
    
    txs_by_month = defaultdict(list)
    txs_by_type = defaultdict(float)
    
    for tx in txs:
        if tx.transaction_date.year == year:
            txs_by_month[tx.transaction_date.month].append(tx)
            if tx.transaction_type == "Interés" and tx.direction == TransactionDirection.DEBIT.value:
                txs_by_type[tx.transaction_date.month] += float(tx.amount)

    # Let's compute end of month balance by walking back
    monthly_end_balances = {}
    temp_bal = current_balance
    
    today = date.today()
    # Walk back from today's month year all the way to start of year
    txs_desc = sorted(txs, key=lambda x: x.transaction_date, reverse=True)
    
    for month in range(12, 0, -1):
        if year > today.year or (year == today.year and month > today.month):
            monthly_end_balances[month] = current_balance
            continue

        # Subtract all transactions that happened AFTER this month
        for tx in txs_desc:
            if tx.transaction_date.year > year or (tx.transaction_date.year == year and tx.transaction_date.month > month):
                # Rollback this transaction from temp_bal
                if tx.direction == TransactionDirection.DEBIT.value:
                    temp_bal -= float(tx.amount)
                else:
                    temp_bal += float(tx.amount)
            else:
                break
                
        monthly_end_balances[month] = temp_bal
        # reset temp_bal to current_balance for the next loop
        temp_bal = current_balance

    months_data = []
    months_names = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    total_interest_earned = 0.0
    profitability_sum = 0.0
    valid_months = 0
    
    for month in range(1, 13):
        # Starting balance is the ending balance of the PREVIOUS month
        if month == 1:
            # We need end of december last year
            temp_bal = current_balance
            for tx in txs_desc:
                if tx.transaction_date.year >= year:
                    if tx.direction == TransactionDirection.DEBIT.value:
                        temp_bal -= float(tx.amount)
                    else:
                        temp_bal += float(tx.amount)
                else: break
            starting_balance = temp_bal
        else:
            starting_balance = monthly_end_balances[month - 1]
            
        interest_earned = txs_by_type[month]
        total_interest_earned += interest_earned
        
        pct = 0.0
        if starting_balance > 0:
            pct = round((interest_earned / starting_balance) * 100, 4)
            profitability_sum += pct
            valid_months += 1
            
        months_data.append({
            "month": month,
            "month_name": months_names[month],
            "starting_balance": round(starting_balance, 2),
            "interest_earned": round(interest_earned, 2),
            "profitability_pct": pct
        })
        
    avg_profitability = round(profitability_sum / valid_months, 4) if valid_months > 0 else 0.0

    return {
        "account_id": account_id,
        "year": year,
        "total_interest_earned": total_interest_earned,
        "average_profitability_pct": avg_profitability,
        "months": months_data
    }

async def get_advanced_financial_report(db: AsyncSession, property_id: str | None, year: int) -> dict:
    """
    Generates a detailed monthly report with YTD and Projections.
    """
    from sqlalchemy import extract
    from app.models.financial import Transaction, TransactionDirection, TransactionStatus
    
    # 1. Base query filters
    filters = [
        extract('year', Transaction.transaction_date) == year,
        Transaction.status == TransactionStatus.COMPLETADA.value
    ]
    if property_id:
        filters.append(Transaction.property_id == property_id)
        
    # 2. Monthly aggregation
    monthly_data = {m: {"month": m, "income": 0.0, "expenses": 0.0, "profit": 0.0} for m in range(1, 13)}
    
    stmt = select(
        extract('month', Transaction.transaction_date).label("month"),
        Transaction.direction,
        func.sum(Transaction.amount).label("total")
    ).where(*filters).group_by("month", Transaction.direction)
    
    result = await db.execute(stmt)
    for row in result:
        m = int(row.month)
        # Handle Enum value vs string securely
        dir_val = row.direction.value if hasattr(row.direction, "value") else str(row.direction)
        if dir_val == TransactionDirection.DEBIT.value:
            monthly_data[m]["income"] = float(row.total or 0)
        else:
            monthly_data[m]["expenses"] = float(row.total or 0)
            
    # 3. Calculate profit and YTD
    ytd_income = 0.0
    ytd_expenses = 0.0
    current_month = date.today().month if date.today().year == year else 12
    completed_months_count = 0
    
    for m in range(1, 13):
        monthly_data[m]["profit"] = monthly_data[m]["income"] - monthly_data[m]["expenses"]
        if m <= current_month:
            ytd_income += monthly_data[m]["income"]
            ytd_expenses += monthly_data[m]["expenses"]
            if m < current_month or (monthly_data[m]["income"] > 0 or monthly_data[m]["expenses"] > 0):
                completed_months_count += 1
                
    ytd_profit = ytd_income - ytd_expenses
    
    # 4. Projections
    # Calculate monthly average from completed months
    avg_income = ytd_income / completed_months_count if completed_months_count > 0 else 0
    avg_expense = ytd_expenses / completed_months_count if completed_months_count > 0 else 0
    
    remaining_months = 12 - completed_months_count
    projected_income = ytd_income + (avg_income * remaining_months)
    projected_expense = ytd_expenses + (avg_expense * remaining_months)
    
    return {
        "year": year,
        "property_id": property_id,
        "monthly": list(monthly_data.values()),
        "ytd": {
            "income": ytd_income,
            "expenses": ytd_expenses,
            "profit": ytd_profit,
            "months_completed": completed_months_count
        },
        "projections": {
            "estimated_annual_income": round(projected_income, 2),
            "estimated_annual_expense": round(projected_expense, 2),
            "estimated_annual_profit": round(projected_income - projected_expense, 2)
        }
    }

