"""
Budgets router — /api/v1/budgets endpoints.
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
"""
Budgets router — /api/v1/budgets endpoints.
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetReport, BudgetDuplicate, BudgetUpdate, BudgetBreakdownResponse
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


# ── Static sub-routes MUST come before /{budget_id} to avoid route conflicts ──

@router.get("/export/excel")
async def export_budgets_excel(
    property_id: str | None = None,
    start_year: int | None = None,
    end_year: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Exportar presupuestos a Excel."""
    stream = await budget_service.export_budgets_excel(db, property_id, start_year, end_year)
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=presupuestos.xlsx"}
    )


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


# ── Parameterized routes ─────────────────────────────────────────────────────

@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener detalle de presupuesto con semáforo."""
    return await budget_service.get_budget(db, budget_id)


@router.get("/{budget_id}/monthly-breakdown", response_model=BudgetBreakdownResponse)
async def get_budget_monthly_breakdown(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener desglose detallado mensual del presupuesto interactivo."""
    from fastapi import HTTPException
    result = await budget_service.get_budget_monthly_breakdown(db, budget_id)
    if not result:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return result


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    data: BudgetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Actualizar presupuesto y categorías."""
    user_id = getattr(current_user, "id", None)
    budget = await budget_service.update_budget(db, budget_id, data, user_id=user_id)
    if not budget:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return budget


@router.post("/{budget_id}/duplicate", response_model=list[BudgetResponse])
async def duplicate_budget(
    budget_id: str,
    data: BudgetDuplicate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Duplicar presupuesto para otro periodo con incremento opcional."""
    return await budget_service.duplicate_budget(db, budget_id, data)


@router.post("/{budget_id}/close", response_model=BudgetResponse)
async def close_budget(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Cerrar el presupuesto y congelar llaves de distribución."""
    return await budget_service.close_budget(db, budget_id)


@router.get("/{budget_id}/export/pdf")
async def export_budget_pdf(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Exportar reporte de presupuesto a PDF."""
    from fastapi.responses import FileResponse
    from app.services.pdf_service import generate_budget_pdf
    from fastapi import HTTPException

    budget = await budget_service.get_budget(db, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")

    filepath = await generate_budget_pdf(budget)
    return FileResponse(filepath, media_type="application/pdf", filename=f"presupuesto_{budget.year}_{budget.month}.pdf")


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Eliminar presupuesto."""
    from fastapi import HTTPException
    try:
        await budget_service.delete_budget(db, budget_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return None
