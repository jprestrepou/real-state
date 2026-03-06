"""
Budget Service — CRUD operations + Allocation logic and budget vs actual reporting.
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.models.property import Property
from app.models.contract import Contract, ContractStatus
from app.models.budget import Budget, BudgetCategory
from app.models.financial import Transaction
from app.schemas.budget import BudgetCreate

def list_budgets(db: Session, property_id: Optional[str] = None, year: Optional[int] = None, month: Optional[int] = None):
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
    
    return db.execute(stmt).scalars().all()

def create_budget(db: Session, data: BudgetCreate):
    new_budget = Budget(
        property_id=data.property_id,
        year=data.year,
        month=data.month,
        total_budget=data.total_budget,
        notes=data.notes
    )
    db.add(new_budget)
    db.flush()  # Get ID

    for cat_data in data.categories:
        cat = BudgetCategory(
            budget_id=new_budget.id,
            category_name=cat_data.category_name,
            budgeted_amount=cat_data.budgeted_amount,
            is_distributable=cat_data.is_distributable
        )
        db.add(cat)
    
    db.commit()
    db.refresh(new_budget)
    return new_budget

def get_budget(db: Session, budget_id: str):
    stmt = select(Budget).where(Budget.id == budget_id)
    return db.execute(stmt).scalar_one_or_none()

def calculate_distribution_keys(db: Session, parent_property_id: str) -> Dict[str, float]:
    """
    Calculates allocation percentages for sub-properties based on their active contract rent.
    """
    stmt = select(Property).where(Property.parent_id == parent_property_id)
    sub_units = db.execute(stmt).scalars().all()
    
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
        
        contract = db.execute(contract_stmt).scalar_one_or_none()
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

def get_budget_vs_actual_report(
    db: Session, 
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
    budget = db.execute(budget_stmt).scalar_one_or_none()
    if not budget:
        return {"property_id": property_id, "year": year, "month": month, "rows": []}

    dist_keys = calculate_distribution_keys(db, property_id)
    all_prop_ids = list(dist_keys.keys()) + [property_id]
    
    rows = []
    from sqlalchemy import func
    for cat in budget.categories:
        trans_stmt = select(func.sum(Transaction.amount)).where(
            and_(
                Transaction.category == cat.category_name,
                Transaction.property_id.in_(all_prop_ids),
                # Note: This is simplified. In a real DB, use extract('year', date) or between
                # Assuming SQLite format YYYY-MM-DD
                func.strftime('%Y', Transaction.transaction_date) == str(year),
                func.strftime('%m', Transaction.transaction_date) == f"{month:02d}"
            )
        )
        actual_total = db.execute(trans_stmt).scalar() or 0.0
        
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
