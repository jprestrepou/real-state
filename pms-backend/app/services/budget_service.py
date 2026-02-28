"""
Budget service — traffic-light budget tracking.
"""

from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException

from app.models.budget import Budget, BudgetCategory
from app.schemas.budget import BudgetCreate


def list_budgets(
    db: Session,
    property_id: str | None = None,
    year: int | None = None,
) -> list[Budget]:
    stmt = select(Budget)
    if property_id:
        stmt = stmt.where(Budget.property_id == property_id)
    if year:
        stmt = stmt.where(Budget.year == year)
    return list(db.execute(stmt).scalars().all())


def get_budget(db: Session, budget_id: str) -> Budget:
    stmt = select(Budget).where(Budget.id == budget_id)
    budget = db.execute(stmt).scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return budget


def create_budget(db: Session, data: BudgetCreate) -> Budget:
    budget = Budget(
        property_id=data.property_id,
        year=data.year,
        total_budget=data.total_budget,
        notes=data.notes,
    )
    db.add(budget)
    db.flush()

    for cat in data.categories:
        category = BudgetCategory(
            budget_id=budget.id,
            category_name=cat.category_name,
            budgeted_amount=cat.budgeted_amount,
        )
        db.add(category)

    db.commit()
    db.refresh(budget)
    return budget


def check_budget_alert(db: Session, property_id: str, category: str, amount: float) -> str | None:
    """Check if a new expense triggers a budget alert. Returns semaphore color or None."""
    import datetime
    current_year = datetime.date.today().year

    stmt = select(Budget).where(
        Budget.property_id == property_id,
        Budget.year == current_year,
    )
    budget = db.execute(stmt).scalar_one_or_none()
    if not budget:
        return None

    # Update total executed
    budget.total_executed = float(budget.total_executed or 0) + amount
    
    # Find matching category
    cat_stmt = select(BudgetCategory).where(
        BudgetCategory.budget_id == budget.id,
        BudgetCategory.category_name == category,
    )
    cat = db.execute(cat_stmt).scalar_one_or_none()
    if cat:
        cat.executed_amount = float(cat.executed_amount or 0) + amount

    return budget.semaphore
