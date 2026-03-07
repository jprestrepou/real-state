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
from app.schemas.budget import BudgetCreate, BudgetDuplicate

GENERAL_PROPERTY_NAME = "Gastos Generales"

def _ensure_general_property(db: Session) -> str:
    """Ensures the 'Gastos Generales' property exists and returns its ID."""
    stmt = select(Property).where(Property.name == GENERAL_PROPERTY_NAME)
    prop = db.execute(stmt).scalar_one_or_none()
    if not prop:
        # We need an owner_id. Let's find an admin or the first user.
        from app.models.user import User
        user_stmt = select(User).limit(1)
        user = db.execute(user_stmt).scalar_one_or_none()
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
        db.commit()
        db.refresh(prop)
    return prop.id

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
    property_id = data.property_id
    if property_id == "GENERAL":
        property_id = _ensure_general_property(db)

    # If annual, we create 12 budgets
    months_to_create = range(1, 13) if data.is_annual else [data.month]
    created_budgets = []

    for m in months_to_create:
        amount = data.total_budget / 12 if data.is_annual else data.total_budget
        new_budget = Budget(
            property_id=property_id,
            year=data.year,
            month=m,
            total_budget=amount,
            notes=data.notes
        )
        db.add(new_budget)
        db.flush()

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
    
    db.commit()
    for b in created_budgets:
        db.refresh(b)
    
    return created_budgets[0] if not data.is_annual else created_budgets

def duplicate_budget(db: Session, budget_id: str, data: BudgetDuplicate):
    source = get_budget(db, budget_id)
    if not source:
        raise Exception("Presupuesto origen no encontrado")

    multiplier = 1 + (data.percentage_increase / 100.0)
    
    new_budget = Budget(
        property_id=source.property_id,
        year=data.target_year,
        month=data.target_month,
        total_budget=float(source.total_budget) * multiplier,
        notes=source.notes
    )
    db.add(new_budget)
    db.flush()

    for cat in source.categories:
        new_cat = BudgetCategory(
            budget_id=new_budget.id,
            category_name=cat.category_name,
            budgeted_amount=float(cat.budgeted_amount) * multiplier,
            is_distributable=cat.is_distributable
        )
        db.add(new_cat)
    
    db.commit()
    db.refresh(new_budget)
    return [new_budget] # Return as list for compatibility

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
    
    # Check if this property is indeed the 'Gastos Generales' one
    stmt_gen = select(Property).where(Property.name == GENERAL_PROPERTY_NAME).limit(1)
    gen_prop = db.execute(stmt_gen).scalar_one_or_none()
    
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

        trans_stmt = select(func.sum(Transaction.amount)).where(
            and_(
                Transaction.category.in_(cat_search_terms),
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

def delete_budget(db: Session, budget_id: str):
    budget = get_budget(db, budget_id)
    if budget:
        # Delete categories first (though they might be cascade)
        for cat in budget.categories:
            db.delete(cat)
        db.delete(budget)
        db.commit()
    return True
