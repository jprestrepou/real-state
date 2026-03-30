"""
BudgetProject service — business logic for project & quote management.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.budget_project import BudgetProject, ProjectQuote
from app.models.budget import Budget
from app.schemas.budget_project import (
    BudgetProjectCreate, BudgetProjectUpdate,
    ProjectQuoteCreate,
)


# ── Project CRUD ──────────────────────────────────────────────

async def list_projects(db: AsyncSession, budget_id: str) -> list[BudgetProject]:
    """List all projects for a specific budget."""
    # Verify budget exists
    budget = await db.get(Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")

    stmt = (
        select(BudgetProject)
        .where(BudgetProject.budget_id == budget_id)
        .options(selectinload(BudgetProject.quotes))
        .order_by(BudgetProject.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_project(db: AsyncSession, project_id: str) -> BudgetProject:
    """Get a single project with its quotes."""
    stmt = (
        select(BudgetProject)
        .where(BudgetProject.id == project_id)
        .options(selectinload(BudgetProject.quotes))
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project


async def create_project(
    db: AsyncSession, budget_id: str, data: BudgetProjectCreate
) -> BudgetProject:
    """Create a new project linked to a budget."""
    budget = await db.get(Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")

    project = BudgetProject(
        budget_id=budget_id,
        title=data.title,
        description=data.description,
        project_type=data.project_type,
        priority=data.priority,
        property_id=data.property_id,
        estimated_cost=data.estimated_cost,
        scheduled_start=data.scheduled_start,
        scheduled_end=data.scheduled_end,
        notes=data.notes,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(
    db: AsyncSession, project_id: str, data: BudgetProjectUpdate
) -> BudgetProject:
    """Update an existing project."""
    project = await get_project(db, project_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: str) -> None:
    """Delete a project and its quotes."""
    project = await get_project(db, project_id)
    await db.delete(project)
    await db.commit()


# ── Quote CRUD ────────────────────────────────────────────────

async def add_quote(
    db: AsyncSession, project_id: str, data: ProjectQuoteCreate
) -> ProjectQuote:
    """Add a quotation to a project."""
    # Verify project exists
    project = await get_project(db, project_id)

    # Auto-transition to "Cotizando" if still in "Borrador"
    if project.status == "Borrador":
        project.status = "Cotizando"

    quote = ProjectQuote(
        project_id=project_id,
        supplier_name=data.supplier_name,
        supplier_id=data.supplier_id,
        amount=data.amount,
        currency=data.currency,
        description=data.description,
        validity_days=data.validity_days,
        submitted_date=data.submitted_date,
    )
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    return quote


async def delete_quote(db: AsyncSession, quote_id: str) -> None:
    """Delete a specific quote."""
    quote = await db.get(ProjectQuote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    await db.delete(quote)
    await db.commit()


async def select_quote(db: AsyncSession, project_id: str, quote_id: str) -> BudgetProject:
    """Select a winning quote for a project."""
    project = await get_project(db, project_id)

    # Verify the quote belongs to this project
    target_quote = None
    for q in project.quotes:
        if q.id == quote_id:
            target_quote = q
        q.is_selected = False  # Deselect all first

    if not target_quote:
        raise HTTPException(
            status_code=404,
            detail="La cotización no pertenece a este proyecto"
        )

    # Mark selected
    target_quote.is_selected = True
    project.approved_quote_id = quote_id
    project.approved_cost = float(target_quote.amount)
    project.status = "Aprobado"

    await db.commit()
    await db.refresh(project)
    return project


async def set_quote_file(
    db: AsyncSession, quote_id: str, file_path: str
) -> ProjectQuote:
    """Set the file path for a quote attachment."""
    quote = await db.get(ProjectQuote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    quote.quote_file = file_path
    await db.commit()
    await db.refresh(quote)
    return quote
