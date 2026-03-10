"""
Budget Service — CRUD operations + Allocation logic and budget vs actual reporting.
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.property import Property
from app.models.contract import Contract, ContractStatus
from app.models.budget import Budget, BudgetCategory
from app.models.financial import Transaction
from app.schemas.budget import BudgetCreate, BudgetDuplicate

GENERAL_PROPERTY_NAME = "Gastos Generales"

async def _ensure_general_property(db: AsyncSession) -> str:
    """Ensures the 'Gastos Generales' property exists and returns its ID."""
    stmt = select(Property).where(Property.name == GENERAL_PROPERTY_NAME)
    result = await db.execute(stmt)
    prop = result.scalar_one_or_none()
    if not prop:
        # We need an owner_id. Let's find an admin or the first user.
        from app.models.user import User
        user_stmt = select(User).limit(1)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        if not user:
            raise Exception("No user found to assign Gastos Generales property")
        
        prop = Property(
            name=GENERAL_PROPERTY_NAME,
            property_type="Otros",
            address="N/A",
            city="N/A",
            latitude=0,
            longitude=0,
            area_sqm=0,
            owner_id=user.id,
            status="Disponible"
        )
        db.add(prop)
        await db.commit()
        await db.refresh(prop)
    return prop.id

async def _refresh_budget_totals(db: AsyncSession, budget: Budget):
    """
    Calculates execution totals for a budget and its categories in real-time.
    Also updates total_budget if auto_calculate_total is True.
    """
    dist_keys = await calculate_distribution_keys(db, budget.property_id)
    stmt_gen = select(Property).where(Property.name == GENERAL_PROPERTY_NAME).limit(1)
    gen_result = await db.execute(stmt_gen)
    gen_prop = gen_result.scalar_one_or_none()
    
    all_prop_ids = list(dist_keys.keys()) + [budget.property_id]
    if gen_prop and budget.property_id == gen_prop.id:
        all_prop_ids.append(None)

    from sqlalchemy import func, extract
    from app.models.financial import TransactionDirection

    # Optimized: One query for all relevant transactions in the period
    all_prop_ids_filtered = [pid for pid in all_prop_ids if pid is not None]
    
    # Base query for all credit transactions in this period
    from sqlalchemy import func as sa_func, cast, Integer
    query = select(Transaction.category, sa_func.coalesce(sa_func.sum(Transaction.amount), 0.0)).where(
        and_(
            Transaction.direction == TransactionDirection.CREDIT.value,
            cast(sa_func.extract('year', Transaction.transaction_date), Integer) == budget.year,
            cast(sa_func.extract('month', Transaction.transaction_date), Integer) == budget.month
        )
    )

    # Handle property IDs (including NULL for general expenses if applicable)
    if None in all_prop_ids:
        query = query.where(
            (Transaction.property_id.in_(all_prop_ids_filtered)) | (Transaction.property_id == None)
        )
    else:
        query = query.where(Transaction.property_id.in_(all_prop_ids_filtered))

    query = query.group_by(Transaction.category)
    result = await db.execute(query)
    results = result.all()
    
    # Map category names to their sums
    cat_actuals = {row[0].lower(): float(row[1]) for row in results}
    
    total_exec = 0.0
    total_budget_sum = 0.0

    for cat in budget.categories:
        total_budget_sum += float(cat.budgeted_amount)
        
        # Match transaction categories to budget categories (using search logic)
        cat_search_terms = {cat.category_name.lower()}
        lower_cat = cat.category_name.lower()
        if "mantenimiento" in lower_cat:
            cat_search_terms.update(["gastos mantenimiento", "mantenimiento general", "mantenimiento"])
        elif "administracion" in lower_cat or "administración" in lower_cat:
            cat_search_terms.update(["cuotas de administración", "gastos administrativos", "honorarios gestión"])
        elif "servicio" in lower_cat:
            cat_search_terms.add("servicios públicos")
        
        cat_actual = 0.0
        for term in cat_search_terms:
            cat_actual += cat_actuals.get(term, 0.0)
            
        cat.executed_amount = cat_actual
        total_exec += cat_actual

    budget.total_executed = total_exec
    if budget.auto_calculate_total:
        budget.total_budget = total_budget_sum
    
    # No longer committing here for performance

async def list_budgets(db: AsyncSession, property_id: Optional[str] = None, year: Optional[int] = None, month: Optional[int] = None):
    stmt = select(Budget)
    filters = []
    if property_id:
        filters.append(Budget.property_id == property_id)
    if year:
        filters.append(Budget.year == year)
    if month:
        filters.append(Budget.month == month)
    
    if filters:
        stmt = stmt.where(and_(*filters))
    
    result = await db.execute(stmt)
    budgets = result.scalars().all()
    for b in budgets:
        await _refresh_budget_totals(db, b)
    
    # Commit once for all refreshed budgets
    db.commit()
    return budgets

async def create_budget(db: AsyncSession, data: BudgetCreate):
    property_id = data.property_id
    if property_id == "GENERAL":
        property_id = await _ensure_general_property(db)

    # If annual, we create 12 budgets
    months_to_create = range(1, 13) if data.is_annual else [data.month]
    created_budgets = []

    for m in months_to_create:
        if data.auto_calculate_total:
            amount = sum(c.budgeted_amount for c in data.categories) / (12 if data.is_annual else 1)
        else:
            amount = data.total_budget / 12 if data.is_annual else data.total_budget

        new_budget = Budget(
            property_id=property_id,
            year=data.year,
            month=m,
            total_budget=amount,
            auto_calculate_total=data.auto_calculate_total,
            notes=data.notes
        )
        db.add(new_budget)
        await db.flush()

        for cat_data in data.categories:
            cat_amount = cat_data.budgeted_amount / 12 if data.is_annual else cat_data.budgeted_amount
            cat = BudgetCategory(
                budget_id=new_budget.id,
                category_name=cat_data.category_name,
                budgeted_amount=cat_amount,
                is_distributable=cat_data.is_distributable
            )
            db.add(cat)
        created_budgets.append(new_budget)
    
    await db.commit()
    for b in created_budgets:
        await db.refresh(b)
    
    return created_budgets[0] if not data.is_annual else created_budgets

async def duplicate_budget(db: AsyncSession, budget_id: str, data: BudgetDuplicate):
    source = await get_budget(db, budget_id)
    if not source:
        raise Exception("Presupuesto origen no encontrado")

    multiplier = 1 + (data.percentage_increase / 100.0)
    target_prop = data.target_property_id or source.property_id
    
    new_budget = Budget(
        property_id=target_prop,
        year=data.target_year,
        month=data.target_month,
        total_budget=float(source.total_budget) * multiplier,
        auto_calculate_total=source.auto_calculate_total,
        notes=source.notes
    )
    db.add(new_budget)
    await db.flush()

    for cat in source.categories:
        new_cat = BudgetCategory(
            budget_id=new_budget.id,
            category_name=cat.category_name,
            budgeted_amount=float(cat.budgeted_amount) * multiplier,
            is_distributable=cat.is_distributable
        )
        db.add(new_cat)
    
    await db.commit()
    await db.refresh(new_budget)
    return [new_budget] # Return as list for compatibility

async def update_budget(db: AsyncSession, budget_id: str, data: Any): # Using Any to handle BudgetUpdate
    budget = await get_budget(db, budget_id)
    if not budget:
        return None
    
    if data.notes is not None:
        budget.notes = data.notes
    
    if data.auto_calculate_total is not None:
        budget.auto_calculate_total = data.auto_calculate_total

    if data.categories is not None:
        # Complex update: replace categories
        # For simplicity, clear and re-add
        for c in budget.categories:
            await db.delete(c)
        await db.flush()
        
        for cat_data in data.categories:
            new_cat = BudgetCategory(
                budget_id=budget.id,
                category_name=cat_data.category_name,
                budgeted_amount=cat_data.budgeted_amount,
                is_distributable=cat_data.is_distributable
            )
            db.add(new_cat)
        
        if budget.auto_calculate_total:
            budget.total_budget = sum(c.budgeted_amount for c in data.categories)
    
    # Manual total update if provided and not auto-calculating
    if data.total_budget is not None and not budget.auto_calculate_total:
        budget.total_budget = data.total_budget

    await db.commit()
    return await get_budget(db, budget_id)

async def get_budget(db: AsyncSession, budget_id: str):
    stmt = select(Budget).where(Budget.id == budget_id)
    result = await db.execute(stmt)
    budget = result.scalar_one_or_none()
    if budget:
        await _refresh_budget_totals(db, budget)
        await db.commit()
    return budget

async def calculate_distribution_keys(db: AsyncSession, parent_property_id: str) -> Dict[str, float]:
    """
    Calculates allocation percentages for sub-properties based on their active contract rent.
    """
    stmt = select(Property).where(Property.parent_id == parent_property_id)
    result = await db.execute(stmt)
    sub_units = result.scalars().all()
    
    if not sub_units:
        return {}

    allocation = {}
    total_rent = 0.0
    unit_rents = {}

    for unit in sub_units:
        contract_stmt = select(Contract).where(
            and_(
                Contract.property_id == unit.id,
                Contract.status == ContractStatus.ACTIVO.value
            )
        ).order_by(Contract.created_at.desc()).limit(1)
        
        contract_result = await db.execute(contract_stmt)
        contract = contract_result.scalar_one_or_none()
        rent = float(contract.monthly_rent) if contract else 0.0
        unit_rents[unit.id] = rent
        total_rent += rent

    if total_rent > 0:
        for unit_id, rent in unit_rents.items():
            val = float(rent) / float(total_rent)
            allocation[unit_id] = float(round(val, 4))
    else:
        count = len(sub_units)
        for unit in sub_units:
            val = 1.0 / count
            allocation[unit.id] = float(round(val, 4))

    return allocation

async def get_budget_vs_actual_report(
    db: AsyncSession, 
    property_id: str, 
    year: int, 
    month: int
) -> Dict[str, Any]:
    """
    Generates a report comparing Budgeted vs Actual amounts.
    """
    budget_stmt = select(Budget).where(
        and_(
            Budget.property_id == property_id,
            Budget.year == year,
            Budget.month == month
        )
    )
    result = await db.execute(budget_stmt)
    budget = result.scalar_one_or_none()
    if not budget:
        return {"property_id": property_id, "year": year, "month": month, "rows": []}

    dist_keys = await calculate_distribution_keys(db, property_id)
    
    # Check if this property is indeed the 'Gastos Generales' one
    stmt_gen = select(Property).where(Property.name == GENERAL_PROPERTY_NAME).limit(1)
    gen_result = await db.execute(stmt_gen)
    gen_prop = gen_result.scalar_one_or_none()
    
    all_prop_ids = list(dist_keys.keys()) + [property_id]
    if gen_prop and property_id == gen_prop.id:
        all_prop_ids.append(None) # Include transactions with NO property_id
    
    rows = []
    from sqlalchemy import func
    for cat in budget.categories:
        # Flexible matching for common categories (like Maintenance)
        cat_search_terms = [cat.category_name]
        lower_cat = cat.category_name.lower()
        if "mantenimiento" in lower_cat:
            # If the budget says "Mantenimiento", catch "Gastos Mantenimiento" and "Mantenimiento General"
            cat_search_terms.extend(["Gastos Mantenimiento", "Mantenimiento General", "Mantenimiento"])
        elif "administracion" in lower_cat or "administración" in lower_cat:
            cat_search_terms.extend(["Cuotas de Administración", "Gastos Administrativos", "Honorarios Gestión"])
        elif "servicio" in lower_cat:
            cat_search_terms.extend(["Servicios Públicos"])
        
        # Remove duplicates
        cat_search_terms = list(set(cat_search_terms))

        from sqlalchemy import func, cast, Integer
        trans_stmt = select(func.sum(Transaction.amount)).where(
            and_(
                Transaction.category.in_(cat_search_terms),
                Transaction.property_id.in_(all_prop_ids),
                cast(func.extract('year', Transaction.transaction_date), Integer) == year,
                cast(func.extract('month', Transaction.transaction_date), Integer) == month
            )
        )
        result = await db.execute(trans_stmt)
        actual_total = result.scalar() or 0.0
        
        row: Dict[str, Any] = {
            "category": cat.category_name,
            "budgeted": float(cat.budgeted_amount),
            "actual": float(actual_total),
            "is_distributable": cat.is_distributable,
            "distribution": {}
        }
        
        if cat.is_distributable and dist_keys:
            for sub_id, weight in dist_keys.items():
                val = float(actual_total) * float(weight)
                row["distribution"][sub_id] = float(round(val, 2))
        
        rows.append(row)
        
    return {
        "property_id": property_id,
        "year": year,
        "month": month,
        "rows": rows
    }

async def delete_budget(db: AsyncSession, budget_id: str):
    budget = await get_budget(db, budget_id)
    if budget:
        # Delete categories first (though they might be cascade)
        for cat in budget.categories:
            await db.delete(cat)
        await db.delete(budget)
        await db.commit()
    return True
