"""
Budgets router — /api/v1/budgets endpoints.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.services import budget_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/budgets", tags=["Presupuestos"])


@router.get("", response_model=list[BudgetResponse])
def list_budgets(
    property_id: str | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar presupuestos."""
    return budget_service.list_budgets(db, property_id, year)


@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Crear presupuesto con categorías."""
    return budget_service.create_budget(db, data)


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener detalle de presupuesto con semáforo."""
    return budget_service.get_budget(db, budget_id)
