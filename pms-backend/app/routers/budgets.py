"""
Budgets router — /api/v1/budgets endpoints.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetReport, BudgetDuplicate, BudgetUpdate
from app.services import budget_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/budgets", tags=["Presupuestos"])


@router.get("", response_model=list[BudgetResponse])
async def list_budgets(
    property_id: str | None = None,
    year: int | None = None,
    month: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar presupuestos."""
    return await budget_service.list_budgets(db, property_id, year, month)


@router.post("", status_code=201)
async def create_budget(
    data: BudgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Crear presupuesto con categorías."""
    result = await budget_service.create_budget(db, data)
    if isinstance(result, list):
        return [BudgetResponse.model_validate(b) for b in result]
    return BudgetResponse.model_validate(result)


@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener detalle de presupuesto con semáforo."""
    return await budget_service.get_budget(db, budget_id)


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    data: BudgetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Actualizar presupuesto y categorías."""
    budget = await budget_service.update_budget(db, budget_id, data)
    if not budget:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return budget


@router.get("/report/{property_id}", response_model=BudgetReport)
async def get_budget_report(
    property_id: str,
    year: int = Query(..., ge=2020),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener reporte presupuesto vs real con distribución."""
    return await budget_service.get_budget_vs_actual_report(db, property_id, year, month)
@router.post("/{budget_id}/duplicate", response_model=list[BudgetResponse])
async def duplicate_budget(
    budget_id: str,
    data: BudgetDuplicate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Duplicar presupuesto para otro periodo con incremento opcional."""
    return await budget_service.duplicate_budget(db, budget_id, data)
@router.delete("/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Eliminar presupuesto."""
    await budget_service.delete_budget(db, budget_id)
    return None
